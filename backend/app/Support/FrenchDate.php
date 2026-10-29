<?php

namespace App\Support;

use Carbon\CarbonImmutable;
use DateTimeInterface;

/** Libellés de dates en français, au format du contrat d'API. */
final class FrenchDate
{
    public static function local(DateTimeInterface $date): CarbonImmutable
    {
        return CarbonImmutable::instance($date)->setTimezone(config('matching.timezone'))->locale('fr');
    }

    /** « 14h00 » */
    public static function time(DateTimeInterface $date): string
    {
        return self::local($date)->format('G\hi');
    }

    /** « 14h00 – 15h30 » */
    public static function timeRange(DateTimeInterface $start, DateTimeInterface $end): string
    {
        return self::time($start).' – '.self::time($end);
    }

    /** « Mer. 4 nov · 14h00 » (libellé d'un créneau) */
    public static function slotLabel(DateTimeInterface $start): string
    {
        $date = self::local($start);

        return self::shortDay($date).' '.$date->isoFormat('Do').' '.rtrim($date->isoFormat('MMM'), '.').' · '.self::time($date);
    }

    /** « Mer. 5 nov. · 14h00 – 15h30 » */
    public static function shortDateLabel(DateTimeInterface $start, DateTimeInterface $end): string
    {
        $date = self::local($start);

        return self::shortDay($date).' '.$date->isoFormat('Do').' '.$date->isoFormat('MMM').' · '.self::timeRange($start, $end);
    }

    /** « Mercredi 5 novembre · 14h00 – 15h30 » */
    public static function longDateLabel(DateTimeInterface $start, DateTimeInterface $end): string
    {
        return self::dayLabel($start).' · '.self::timeRange($start, $end);
    }

    /** « Mercredi 5 novembre » */
    public static function dayLabel(DateTimeInterface $date): string
    {
        return ucfirst(self::local($date)->isoFormat('dddd Do MMMM'));
    }

    /** « Semaine du 2 au 8 novembre 2026 », « Semaine du 30 novembre au 6 décembre 2026 »… */
    public static function weekLabel(DateTimeInterface $monday, DateTimeInterface $sunday): string
    {
        $from = self::local($monday);
        $to = self::local($sunday);

        $fromLabel = match (true) {
            $from->year !== $to->year => $from->isoFormat('Do MMMM YYYY'),
            $from->month !== $to->month => $from->isoFormat('Do MMMM'),
            default => $from->isoFormat('Do'),
        };

        return 'Semaine du '.$fromLabel.' au '.$to->isoFormat('Do MMMM YYYY');
    }

    /** 90 → « 1h30 », 60 → « 1h », 45 → « 45 min » */
    public static function duration(int $minutes): string
    {
        $hours = intdiv($minutes, 60);
        $rest = $minutes % 60;

        if ($hours === 0) {
            return $rest.' min';
        }

        return $hours.'h'.($rest > 0 ? sprintf('%02d', $rest) : '');
    }

    private static function shortDay(CarbonImmutable $date): string
    {
        return ucfirst(rtrim($date->isoFormat('ddd'), '.')).'.';
    }
}
