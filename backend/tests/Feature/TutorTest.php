<?php

namespace Tests\Feature;

class TutorTest extends ApiTestCase
{
    public function test_it_shows_a_tutor_profile_with_optional_score(): void
    {
        $tutor = $this->makeTutor([['mathematiques', '6e', '3e'], ['physique-chimie', '2nde', 'terminale', false]], [[3, '14:00', '18:00']], [
            'first_name' => 'Camille', 'last_name' => 'Bernard',
        ]);

        $this->getJson('/api/tutors/'.$tutor->id)
            ->assertOk()
            ->assertJsonPath('displayName', 'Camille B.')
            ->assertJsonPath('levelsLabel', 'Collège · Lycée')
            ->assertJsonPath('subjects.0', ['slug' => 'mathematiques', 'name' => 'Mathématiques', 'isMajor' => true])
            ->assertJsonPath('tags.0.emoji', '💡')
            ->assertJsonMissingPath('score');

        $this->getJson('/api/tutors/'.$tutor->id.'?level=4e&subject=mathematiques&availability=3:apres-midi')
            ->assertOk()
            ->assertJsonStructure(['score', 'matchReasons']);

        $this->getJson('/api/tutors/999999')->assertNotFound()->assertJsonPath('message', 'Tuteur introuvable.');
    }

    public function test_it_lists_free_slots_week_by_week(): void
    {
        $tutor = $this->makeTutor([['mathematiques', '6e', '3e']], [[3, '14:00', '18:00'], [6, '09:00', '12:00']]);

        $this->getJson('/api/tutors/'.$tutor->id.'/slots?availability=3:apres-midi')
            ->assertOk()
            ->assertJsonPath('weekStart', '2026-11-02')
            ->assertJsonPath('weekEnd', '2026-11-08')
            ->assertJsonPath('label', 'Semaine du 2 au 8 novembre 2026')
            ->assertJsonPath('previousWeek', null)
            ->assertJsonPath('nextWeek', '2026-11-09')
            ->assertJsonCount(7, 'days')
            ->assertJsonPath('days.0.label', 'Lundi 2 novembre')
            ->assertJsonPath('days.0.slots', [])
            ->assertJsonCount(6, 'days.2.slots') // mercredi 14h00 → 16h30
            ->assertJsonPath('days.2.slots.0.matchesAvailability', true)
            ->assertJsonCount(4, 'days.5.slots') // samedi 9h00 → 10h30
            ->assertJsonPath('days.5.slots.0.matchesAvailability', false);

        $this->getJson('/api/tutors/'.$tutor->id.'/slots?week=2026-11-25')
            ->assertOk()
            ->assertJsonPath('weekStart', '2026-11-23')
            ->assertJsonPath('label', 'Semaine du 23 au 29 novembre 2026')
            ->assertJsonPath('previousWeek', '2026-11-16')
            ->assertJsonPath('nextWeek', '2026-11-30');

        // L'horizon de 28 jours se termine le 30 novembre à 8h : plus de semaine suivante.
        $this->getJson('/api/tutors/'.$tutor->id.'/slots?week=2026-11-30')
            ->assertJsonPath('label', 'Semaine du 30 novembre au 6 décembre 2026')
            ->assertJsonPath('days.1.label', 'Mardi 1er décembre')
            ->assertJsonPath('nextWeek', null);

        $this->getJson('/api/tutors/'.$tutor->id.'/slots?week=demain')->assertStatus(422);
    }
}
