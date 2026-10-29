<?php

namespace Database\Seeders;

use App\Models\Level;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    public const LEVELS = [
        ['cp', 'CP', 'primaire', 1],
        ['ce1', 'CE1', 'primaire', 2],
        ['ce2', 'CE2', 'primaire', 3],
        ['cm1', 'CM1', 'primaire', 4],
        ['cm2', 'CM2', 'primaire', 5],
        ['6e', '6e', 'college', 6],
        ['5e', '5e', 'college', 7],
        ['4e', '4e', 'college', 8],
        ['3e', '3e', 'college', 9],
        ['2nde', '2nde', 'lycee', 10],
        ['1re', '1re', 'lycee', 11],
        ['terminale', 'Terminale', 'lycee', 12],
    ];

    public const SUBJECTS = [
        ['mathematiques', 'Mathématiques', 'Algèbre & Géométrie', 'calculator'],
        ['francais', 'Français', 'Orthographe, Méthode', 'book-open'],
        ['anglais', 'Anglais', 'Grammaire, Oral', 'languages'],
        ['physique-chimie', 'Physique-Chimie', 'Formules & Démarche', 'flask-conical'],
        ['svt', 'SVT', 'Biologie & Terre', 'leaf'],
        ['histoire-geo', 'Histoire-Géo', 'Chronologie & Cartes', 'compass'],
    ];

    public function run(): void
    {
        foreach (self::LEVELS as [$slug, $name, $cycle, $rank]) {
            Level::updateOrCreate(['slug' => $slug], compact('name', 'cycle', 'rank'));
        }

        foreach (self::SUBJECTS as $position => [$slug, $name, $hint, $icon]) {
            Subject::updateOrCreate(['slug' => $slug], compact('name', 'hint', 'icon', 'position'));
        }
    }
}
