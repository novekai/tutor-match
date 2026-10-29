<?php

namespace Tests\Feature;

use App\Models\Level;
use App\Models\Subject;
use App\Models\Tutor;
use Carbon\CarbonImmutable;
use Database\Seeders\CatalogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

abstract class ApiTestCase extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Lundi 2 novembre 2026, 8h (Paris) : mercredi 4 novembre est dans l'horizon.
        $this->travelTo(CarbonImmutable::parse('2026-11-02 08:00:00', 'Europe/Paris'));
        $this->seed(CatalogSeeder::class);
    }

    /**
     * @param  array<int, array{0: string, 1: string, 2: string, 3?: bool}>  $teaches  [matière, niveau min, niveau max, majeure]
     * @param  array<int, array{0: int, 1: string, 2: string}>  $availability  [jour, début, fin]
     */
    protected function makeTutor(array $teaches, array $availability, array $attributes = []): Tutor
    {
        static $count = 0;
        $count++;

        $tutor = Tutor::create($attributes + [
            'first_name' => 'Tuteur'.$count,
            'last_name' => 'Test',
            'photo_url' => 'https://randomuser.me/api/portraits/women/1.jpg',
            'credential' => 'Enseignant certifié',
            'school' => 'ENS Lyon',
            'headline' => 'Accroche',
            'bio' => 'Bio',
            'tags' => [['emoji' => '💡', 'label' => 'Pédagogie positive']],
            'rating' => 4.5,
            'reviews_count' => 10,
            'years_experience' => 3,
            'lessons_count' => 100,
            'response_rate' => 100,
            'hourly_rate' => 35,
            'lesson_minutes' => 90,
        ]);

        foreach ($teaches as $teaching) {
            $tutor->teachings()->create([
                'subject_id' => Subject::where('slug', $teaching[0])->value('id'),
                'level_min_rank' => Level::where('slug', $teaching[1])->value('rank'),
                'level_max_rank' => Level::where('slug', $teaching[2])->value('rank'),
                'is_major' => $teaching[3] ?? true,
            ]);
        }

        foreach ($availability as [$weekday, $start, $end]) {
            $tutor->availabilities()->create(['weekday' => $weekday, 'start_time' => $start, 'end_time' => $end]);
        }

        return $tutor;
    }

    protected function matchRequest(array $availability, string $level = '4e', string $subject = 'mathematiques')
    {
        return $this->postJson('/api/match', [
            'level' => $level,
            'subject' => $subject,
            'availability' => $availability,
        ]);
    }

    protected function bookingPayload(Tutor $tutor, string $startsAt, array $overrides = []): array
    {
        return $overrides + [
            'tutorId' => $tutor->id,
            'level' => '4e',
            'subject' => 'mathematiques',
            'startsAt' => $startsAt,
            'childFirstName' => 'Lucas',
            'parentName' => 'Claire Dupont',
            'parentEmail' => 'claire@example.com',
            'smsReminder' => true,
        ];
    }
}
