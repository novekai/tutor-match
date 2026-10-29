<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Level;
use App\Models\Subject;
use Illuminate\Database\QueryException;

class BookingTest extends ApiTestCase
{
    public function test_a_parent_can_book_a_proposed_slot(): void
    {
        $tutor = $this->makeTutor([['mathematiques', '6e', '3e']], [[3, '14:00', '18:00']], [
            'first_name' => 'Camille', 'last_name' => 'Bernard',
        ]);

        $response = $this->postJson('/api/bookings', $this->bookingPayload($tutor, '2026-11-04T14:00:00+01:00'))
            ->assertCreated()
            ->assertJsonPath('status', 'confirmed')
            ->assertJsonPath('startsAt', '2026-11-04T14:00:00+01:00')
            ->assertJsonPath('endsAt', '2026-11-04T15:30:00+01:00')
            ->assertJsonPath('dateLabel', 'Mercredi 4 novembre · 14h00 – 15h30')
            ->assertJsonPath('shortDateLabel', 'Mer. 4 nov. · 14h00 – 15h30')
            ->assertJsonPath('durationLabel', '1h30')
            ->assertJsonPath('timezone', 'Europe/Paris')
            ->assertJsonPath('tutor.displayName', 'Camille B.')
            ->assertJsonPath('subject.slug', 'mathematiques')
            ->assertJsonPath('level.slug', '4e')
            ->assertJsonPath('smsReminder', true)
            ->assertJsonPath('objective', null);

        $reference = $response->json('reference');
        $this->assertMatchesRegularExpression('/^STU-\d{4}$/', $reference);

        $this->getJson('/api/bookings/'.$reference)->assertOk()->assertJsonPath('childFirstName', 'Lucas');

        $ics = $this->get('/api/bookings/'.$reference.'/ics')->assertOk();
        $this->assertStringContainsString('text/calendar', $ics->headers->get('Content-Type'));
        $this->assertStringContainsString('DTSTART:20261104T130000Z', $ics->getContent());

        // Le créneau n'est plus proposé.
        $this->matchRequest([['day' => 3, 'period' => 'apres-midi']])
            ->assertJsonPath('tutors.0.compatibleSlots.0.startsAt', '2026-11-04T15:30:00+01:00');
    }

    public function test_booking_an_already_taken_slot_returns_409_with_alternatives(): void
    {
        $tutor = $this->makeTutor([['mathematiques', '6e', '3e']], [[3, '14:00', '18:00']]);
        $payload = $this->bookingPayload($tutor, '2026-11-04T14:00:00+01:00');

        $this->postJson('/api/bookings', $payload)->assertCreated();

        $this->postJson('/api/bookings', ['parentEmail' => 'autre@example.com'] + $payload)
            ->assertStatus(409)
            ->assertJsonPath('code', 'slot_taken')
            ->assertJsonPath('message', 'Ce créneau vient d’être réservé.')
            ->assertJsonCount(3, 'alternatives')
            ->assertJsonPath('alternatives.0.startsAt', '2026-11-04T15:30:00+01:00')
            ->assertJsonPath('alternatives.0.matchesAvailability', true);

        $this->assertSame(1, Booking::count());
    }

    public function test_an_overlapping_slot_is_rejected_too(): void
    {
        $tutor = $this->makeTutor([['mathematiques', '6e', '3e']], [[3, '14:00', '18:00']]);
        $this->postJson('/api/bookings', $this->bookingPayload($tutor, '2026-11-04T14:00:00+01:00'))->assertCreated();

        $this->postJson('/api/bookings', $this->bookingPayload($tutor, '2026-11-04T14:30:00+01:00'))
            ->assertStatus(409)
            ->assertJsonPath('code', 'slot_taken');
    }

    public function test_the_database_forbids_overlapping_confirmed_bookings(): void
    {
        $tutor = $this->makeTutor([['mathematiques', '6e', '3e']], [[3, '14:00', '18:00']]);
        $attributes = [
            'tutor_id' => $tutor->id,
            'subject_id' => Subject::value('id'),
            'level_id' => Level::value('id'),
            'child_first_name' => 'Lucas',
            'parent_name' => 'Claire Dupont',
            'parent_email' => 'claire@example.com',
            'status' => Booking::STATUS_CONFIRMED,
        ];
        Booking::create($attributes + ['reference' => 'STU-0001', 'starts_at' => '2026-11-04 14:00:00+01:00', 'ends_at' => '2026-11-04 15:30:00+01:00']);

        try {
            Booking::create($attributes + ['reference' => 'STU-0002', 'starts_at' => '2026-11-04 15:00:00+01:00', 'ends_at' => '2026-11-04 16:30:00+01:00']);
            $this->fail('La contrainte d’exclusion aurait dû rejeter le chevauchement.');
        } catch (QueryException $exception) {
            $this->assertSame('23P01', $exception->getCode());
        }
    }

    public function test_a_slot_outside_the_tutor_availabilities_is_rejected(): void
    {
        $tutor = $this->makeTutor([['mathematiques', '6e', '3e']], [[3, '14:00', '18:00']]);

        $this->postJson('/api/bookings', $this->bookingPayload($tutor, '2026-11-04T09:00:00+01:00'))
            ->assertStatus(422)
            ->assertJsonPath('errors.startsAt.0', 'Ce créneau n’est pas proposé par ce tuteur.');

        $this->postJson('/api/bookings', $this->bookingPayload($tutor, '2026-11-04T14:00:00+01:00', ['level' => 'terminale']))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['subject']);
    }

    public function test_booking_validation_returns_french_messages(): void
    {
        $this->postJson('/api/bookings', ['parentEmail' => 'pas-un-email'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['tutorId', 'level', 'subject', 'startsAt', 'childFirstName', 'parentName', 'parentEmail'])
            ->assertJsonPath('errors.parentEmail.0', 'L’adresse e-mail n’est pas valide.')
            ->assertJsonPath('errors.childFirstName.0', 'Indiquez le prénom de l’enfant.');
    }

    public function test_unknown_booking_returns_404_in_french(): void
    {
        $this->getJson('/api/bookings/STU-0000')
            ->assertNotFound()
            ->assertJsonPath('message', 'Réservation introuvable.');
    }
}
