<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Level;
use App\Models\Subject;
use Carbon\CarbonImmutable;

class MatchingTest extends ApiTestCase
{
    private const WEDNESDAY_AFTERNOON = [['day' => 3, 'period' => 'apres-midi']];

    public function test_it_only_returns_tutors_teaching_the_subject(): void
    {
        $maths = $this->makeTutor([['mathematiques', '6e', '3e']], [[3, '14:00', '18:00']]);
        $this->makeTutor([['anglais', '6e', '3e']], [[3, '14:00', '18:00']]);

        $this->matchRequest(self::WEDNESDAY_AFTERNOON)
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('tutors.0.id', $maths->id);
    }

    public function test_it_excludes_tutors_whose_level_range_does_not_include_the_level(): void
    {
        $this->makeTutor([['mathematiques', '2nde', 'terminale']], [[3, '14:00', '18:00']]);
        $this->makeTutor([['mathematiques', 'cp', 'cm2']], [[3, '14:00', '18:00']]);
        $edge = $this->makeTutor([['mathematiques', '4e', '4e']], [[3, '14:00', '18:00']]);

        $this->matchRequest(self::WEDNESDAY_AFTERNOON)
            ->assertJsonPath('total', 1)
            ->assertJsonPath('tutors.0.id', $edge->id);
    }

    public function test_it_excludes_tutors_without_a_free_slot_in_the_selected_periods(): void
    {
        $this->makeTutor([['mathematiques', '6e', '3e']], [[1, '09:00', '12:00'], [3, '18:00', '20:00']]);

        $this->matchRequest(self::WEDNESDAY_AFTERNOON)
            ->assertOk()
            ->assertJsonPath('total', 0)
            ->assertJsonPath('tutors', []);
    }

    public function test_it_excludes_a_tutor_whose_only_compatible_slots_are_all_booked(): void
    {
        // Une seule plage d'1h30 le mercredi : 4 mercredis dans l'horizon, tous réservés.
        $tutor = $this->makeTutor([['mathematiques', '6e', '3e']], [[3, '14:00', '15:30']]);
        foreach (['2026-11-04', '2026-11-11', '2026-11-18', '2026-11-25'] as $date) {
            $this->book($tutor, $date.'T14:00:00+01:00');
        }

        $this->matchRequest(self::WEDNESDAY_AFTERNOON)->assertJsonPath('total', 0);
    }

    public function test_tutors_are_sorted_by_score_with_a_detailed_breakdown(): void
    {
        $average = $this->makeTutor([['mathematiques', '6e', 'terminale', false]], [[3, '14:00', '18:00']], [
            'rating' => 4.2, 'reviews_count' => 5, 'years_experience' => 1, 'lessons_count' => 10,
        ]);
        $expert = $this->makeTutor([['mathematiques', '4e', '3e']], [[3, '14:00', '18:00'], [6, '09:00', '12:00']], [
            'rating' => 4.9, 'reviews_count' => 60, 'years_experience' => 10, 'lessons_count' => 500,
        ]);

        $response = $this->matchRequest([['day' => 3, 'period' => 'apres-midi'], ['day' => 6, 'period' => 'matin']])
            ->assertOk()
            ->assertJsonPath('total', 2)
            ->assertJsonPath('tutors.0.id', $expert->id)
            ->assertJsonPath('tutors.0.isBestMatch', true)
            ->assertJsonPath('tutors.1.id', $average->id)
            ->assertJsonPath('tutors.1.isBestMatch', false)
            ->assertJsonStructure(['tutors' => [[
                'id', 'displayName', 'score', 'scoreBreakdown' => [['key', 'label', 'points', 'max']],
                'matchReasons', 'compatibleSlotsCount', 'compatibleSlots' => [[
                    'startsAt', 'endsAt', 'day', 'period', 'label', 'timeLabel', 'matchesAvailability',
                ]],
            ]]]);

        $tutors = $response->json('tutors');
        $this->assertGreaterThan($tutors[1]['score'], $tutors[0]['score']);
        $this->assertSame($tutors[0]['score'], array_sum(array_column($tutors[0]['scoreBreakdown'], 'points')));
        $this->assertSame(100, array_sum(array_column($tutors[0]['scoreBreakdown'], 'max')));
        $this->assertContains('Disponible sur toutes vos plages', $tutors[0]['matchReasons']);
        $this->assertSame('Mer. 4 nov · 14h00', $tutors[0]['compatibleSlots'][0]['label']);
        $this->assertSame('14h00 – 15h30', $tutors[0]['compatibleSlots'][0]['timeLabel']);
        $this->assertSame('2026-11-04T14:00:00+01:00', $tutors[0]['compatibleSlots'][0]['startsAt']);
    }

    public function test_a_booked_slot_is_no_longer_proposed(): void
    {
        $tutor = $this->makeTutor([['mathematiques', '6e', '3e']], [[3, '14:00', '18:00']]);
        $this->book($tutor, '2026-11-04T14:00:00+01:00');

        $slots = $this->matchRequest(self::WEDNESDAY_AFTERNOON)->json('tutors.0.compatibleSlots');

        // 14h00 et les créneaux qui chevauchent (14h30, 15h00) disparaissent ; 15h30 reste.
        $this->assertSame('2026-11-04T15:30:00+01:00', $slots[0]['startsAt']);
    }

    public function test_it_suggests_periods_to_add_when_fewer_than_three_tutors_match(): void
    {
        $this->makeTutor([['anglais', 'cp', 'cm2']], [[3, '09:00', '12:00']], ['first_name' => 'Emma', 'last_name' => 'Rousseau']);
        $this->makeTutor([['anglais', 'cp', '6e']], [[3, '09:00', '12:00'], [6, '14:00', '18:00']], ['first_name' => 'Léa', 'last_name' => 'Mercier']);

        $this->matchRequest([['day' => 7, 'period' => 'soir']], 'cp', 'anglais')
            ->assertOk()
            ->assertJsonPath('total', 0)
            ->assertJsonPath('suggestions.0', [
                'day' => 3, 'period' => 'matin', 'label' => 'mercredi matin', 'tutorsCount' => 2, 'initials' => ['ER', 'LM'],
            ])
            ->assertJsonPath('suggestions.1.label', 'samedi après-midi')
            ->assertJsonPath('suggestions.1.tutorsCount', 1)
            ->assertJsonCount(2, 'suggestions');
    }

    public function test_it_validates_the_request_with_french_messages(): void
    {
        $this->postJson('/api/match', ['level' => 'master', 'availability' => []])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['level', 'subject', 'availability'])
            ->assertJsonPath('errors.subject.0', 'Choisissez une matière.')
            ->assertJsonPath('message', 'Ce niveau n’existe pas.');
    }

    public function test_meta_lists_the_reference_data(): void
    {
        $this->getJson('/api/meta')
            ->assertOk()
            ->assertJsonCount(12, 'levels')
            ->assertJsonCount(6, 'subjects')
            ->assertJsonPath('levels.7', ['slug' => '4e', 'name' => '4e', 'cycle' => 'college', 'cycleLabel' => 'Collège', 'rank' => 8])
            ->assertJsonPath('subjects.0.icon', 'calculator')
            ->assertJsonPath('periods.1', ['slug' => 'apres-midi', 'name' => 'Après-midi', 'range' => '14h – 18h'])
            ->assertJsonPath('days.6.value', 7)
            ->assertJsonPath('tutorsCount', 0);
    }

    private function book($tutor, string $startsAt): void
    {
        $start = CarbonImmutable::parse($startsAt);
        Booking::create([
            'reference' => 'STU-'.random_int(1000, 9999),
            'tutor_id' => $tutor->id,
            'subject_id' => Subject::where('slug', 'mathematiques')->value('id'),
            'level_id' => Level::where('slug', '4e')->value('id'),
            'child_first_name' => 'Jade',
            'parent_name' => 'Marc Lambert',
            'parent_email' => 'marc@example.com',
            'starts_at' => $start,
            'ends_at' => $start->addMinutes(90),
            'status' => Booking::STATUS_CONFIRMED,
        ]);
    }
}
