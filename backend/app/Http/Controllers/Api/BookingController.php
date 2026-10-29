<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Resources\BookingResource;
use App\Matching\AvailabilitySelection;
use App\Matching\Slot;
use App\Matching\SlotGenerator;
use App\Models\Booking;
use App\Models\Level;
use App\Models\Subject;
use App\Models\Tutor;
use App\Support\FrenchDate;
use Carbon\CarbonImmutable;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    private const EXCLUSION_VIOLATION = '23P01';

    private const ALTERNATIVES = 3;

    public function __construct(private readonly SlotGenerator $slots) {}

    public function store(StoreBookingRequest $request): JsonResponse
    {
        $tutor = Tutor::with(['availabilities', 'teachings'])->findOrFail($request->validated('tutorId'));
        $level = Level::where('slug', $request->validated('level'))->firstOrFail();
        $subject = Subject::where('slug', $request->validated('subject'))->firstOrFail();

        if (! $tutor->teachingFor($subject)?->covers($level->rank)) {
            throw ValidationException::withMessages([
                'subject' => 'Ce tuteur n’enseigne pas cette matière à ce niveau.',
            ]);
        }

        $startsAt = CarbonImmutable::parse($request->validated('startsAt'))->setTimezone(config('matching.timezone'));
        $isRequested = fn (Slot $slot) => $slot->startsAt->equalTo($startsAt);

        // Le créneau doit être l'un de ceux que l'API propose (dispos, horizon, délai, non réservé).
        $slot = $this->slots->forTutor($tutor)->first($isRequested);
        if ($slot === null) {
            if ($this->slots->forTutor($tutor, ignoreBookings: true)->contains($isRequested)) {
                return $this->slotTaken($tutor, $startsAt);
            }

            throw ValidationException::withMessages([
                'startsAt' => 'Ce créneau n’est pas proposé par ce tuteur.',
            ]);
        }

        try {
            $booking = DB::transaction(fn () => Booking::create([
                'reference' => $this->newReference(),
                'tutor_id' => $tutor->id,
                'subject_id' => $subject->id,
                'level_id' => $level->id,
                'child_first_name' => $request->validated('childFirstName'),
                'parent_name' => $request->validated('parentName'),
                'parent_email' => $request->validated('parentEmail'),
                'sms_reminder' => (bool) $request->validated('smsReminder', false),
                'objective' => $request->validated('objective'),
                'starts_at' => $slot->startsAt,
                'ends_at' => $slot->endsAt,
                'status' => Booking::STATUS_CONFIRMED,
            ]));
        } catch (QueryException $exception) {
            // Course entre deux parents : la contrainte d'exclusion PostgreSQL a tranché.
            if ($exception->getCode() === self::EXCLUSION_VIOLATION) {
                return $this->slotTaken($tutor, $startsAt);
            }
            throw $exception;
        }

        return (new BookingResource($booking->load(['tutor', 'subject', 'level'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Booking $booking): BookingResource
    {
        return new BookingResource($booking->load(['tutor', 'subject', 'level']));
    }

    public function ics(Booking $booking): Response
    {
        $booking->load(['tutor', 'subject', 'level']);
        $utc = fn (CarbonImmutable $date) => $date->utc()->format('Ymd\THis\Z');
        $summary = 'Cours de '.$booking->subject->name.' avec '.$booking->tutor->displayName();
        $description = 'Réservation '.$booking->reference.' · '.$booking->child_first_name
            .' ('.$booking->level->name.') · '.FrenchDate::longDateLabel($booking->starts_at, $booking->ends_at);

        $lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Studena//Tutor Match//FR',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            'UID:'.$booking->reference.'@'.parse_url(config('app.url'), PHP_URL_HOST),
            'DTSTAMP:'.$utc(CarbonImmutable::now()),
            'DTSTART:'.$utc($booking->starts_at),
            'DTEND:'.$utc($booking->ends_at),
            'SUMMARY:'.$this->icsText($summary),
            'DESCRIPTION:'.$this->icsText($description),
            'LOCATION:'.$this->icsText('Cours en ligne'),
            'STATUS:CONFIRMED',
            'END:VEVENT',
            'END:VCALENDAR',
        ];

        return response(implode("\r\n", $lines)."\r\n", 200, [
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="'.$booking->reference.'.ics"',
        ]);
    }

    private function slotTaken(Tutor $tutor, CarbonImmutable $requested): JsonResponse
    {
        $free = $this->slots->forTutor($tutor);
        [$after, $before] = $free->partition(fn (Slot $slot) => $slot->startsAt > $requested);
        $alternatives = $after->concat($before)->take(self::ALTERNATIVES);

        // Le « point bleu » signale les alternatives sur le même jour et moment que le créneau perdu.
        $selection = new AvailabilitySelection([[
            'day' => $requested->dayOfWeekIso,
            'period' => $this->slots->periodOf($requested) ?? '',
        ]]);

        return response()->json([
            'message' => 'Ce créneau vient d’être réservé.',
            'code' => 'slot_taken',
            'alternatives' => $alternatives->map(fn (Slot $slot) => $slot->toArray($selection))->values(),
        ], 409);
    }

    private function newReference(): string
    {
        do {
            $reference = 'STU-'.random_int(1000, 9999);
        } while (Booking::where('reference', $reference)->exists());

        return $reference;
    }

    private function icsText(string $text): string
    {
        return addcslashes($text, ',;\\');
    }
}
