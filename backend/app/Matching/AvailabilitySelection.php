<?php

namespace App\Matching;

/** Ensemble des couples (jour, moment) cochés par le parent. */
final class AvailabilitySelection
{
    /** @var array<string, array{day: int, period: string}> */
    private array $items = [];

    /** @param iterable<array{day: int|string, period: string}> $items */
    public function __construct(iterable $items = [])
    {
        foreach ($items as $item) {
            $day = (int) $item['day'];
            $this->items[self::key($day, $item['period'])] = ['day' => $day, 'period' => $item['period']];
        }
        ksort($this->items);
    }

    /** Lit le format de query string « 3:apres-midi,6:matin » (entrées invalides ignorées). */
    public static function fromQueryString(?string $value): self
    {
        $periods = array_keys(config('matching.periods'));
        $items = [];

        foreach (array_filter(explode(',', (string) $value)) as $pair) {
            [$day, $period] = array_pad(explode(':', trim($pair), 2), 2, null);
            if (ctype_digit((string) $day) && $day >= 1 && $day <= 7 && in_array($period, $periods, true)) {
                $items[] = ['day' => (int) $day, 'period' => $period];
            }
        }

        return new self($items);
    }

    public static function key(int $day, string $period): string
    {
        return $day.':'.$period;
    }

    public function contains(int $day, string $period): bool
    {
        return isset($this->items[self::key($day, $period)]);
    }

    public function isEmpty(): bool
    {
        return $this->items === [];
    }

    public function count(): int
    {
        return count($this->items);
    }

    /** @return list<array{day: int, period: string}> */
    public function toArray(): array
    {
        return array_values($this->items);
    }
}
