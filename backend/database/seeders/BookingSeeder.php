<?php

namespace Database\Seeders;

use App\Matching\Slot;
use App\Matching\SlotGenerator;
use App\Models\Booking;
use App\Models\Level;
use App\Models\Subject;
use App\Models\Tutor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/** Quelques réservations existantes : ces créneaux ne doivent plus être proposés. */
class BookingSeeder extends Seeder
{
    public function run(SlotGenerator $slots): void
    {
        $bookings = [
            // [prénom du tuteur, jour ISO, heure, matière, niveau, enfant, parent]
            ['Camille', 3, '14:00', 'mathematiques', '4e', 'Lucas', 'Claire Dupont'],
            ['Thomas', 6, '09:00', 'mathematiques', '2nde', 'Jade', 'Marc Lambert'],
            ['Mehdi', 2, '18:00', 'mathematiques', '3e', 'Nathan', 'Sophie Morel'],
            ['Emma', 3, '09:00', 'anglais', 'ce2', 'Louise', 'Paul Henry'],
            ['Léa', 6, '09:30', 'francais', 'cp', 'Gabriel', 'Aïcha Diallo'],
            ['Youssef', 4, '18:00', 'mathematiques', 'terminale', 'Hugo', 'Isabelle Faure'],
        ];

        foreach ($bookings as $index => [$firstName, $weekday, $time, $subject, $level, $child, $parent]) {
            $tutor = Tutor::with('availabilities')->where('first_name', $firstName)->firstOrFail();
            $slot = $slots->forTutor($tutor)->first(
                fn (Slot $slot) => $slot->day === $weekday && $slot->startsAt->format('H:i') === $time,
            );
            if ($slot === null) {
                continue;
            }

            Booking::create([
                'reference' => 'STU-'.(1201 + $index * 137),
                'tutor_id' => $tutor->id,
                'subject_id' => Subject::where('slug', $subject)->value('id'),
                'level_id' => Level::where('slug', $level)->value('id'),
                'child_first_name' => $child,
                'parent_name' => $parent,
                'parent_email' => Str::slug($parent, '.').'@example.com',
                'sms_reminder' => $index % 2 === 0,
                'objective' => null,
                'starts_at' => $slot->startsAt,
                'ends_at' => $slot->endsAt,
                'status' => Booking::STATUS_CONFIRMED,
            ]);
        }
    }
}
