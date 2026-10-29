<?php

namespace Database\Seeders;

use App\Models\Level;
use App\Models\Subject;
use App\Models\Tutor;
use Illuminate\Database\Seeder;

class TutorSeeder extends Seeder
{
    /** Plages horaires utilisées pour les disponibilités hebdomadaires. */
    private const WINDOWS = [
        'matin' => ['09:00', '12:00'],
        'apres-midi' => ['14:00', '18:00'],
        'soir' => ['18:00', '20:00'],
        'soir-long' => ['18:00', '21:00'],
        'fin-aprem' => ['16:00', '18:00'],
    ];

    public function run(): void
    {
        $levels = Level::pluck('rank', 'slug');
        $subjects = Subject::pluck('id', 'slug');

        foreach ($this->tutors() as $data) {
            $tutor = Tutor::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'photo_url' => 'https://randomuser.me/api/portraits/'.$data['photo'].'.jpg',
                'credential' => $data['credential'],
                'school' => $data['school'],
                'headline' => $data['headline'],
                'bio' => $data['bio'],
                'tags' => collect($data['tags'])
                    ->map(fn (string $tag) => ['emoji' => explode(' ', $tag, 2)[0], 'label' => explode(' ', $tag, 2)[1]])
                    ->all(),
                'rating' => $data['rating'],
                'reviews_count' => $data['reviews'],
                'years_experience' => $data['years'],
                'lessons_count' => $data['lessons'],
                'response_rate' => $data['response_rate'] ?? 100,
                'hourly_rate' => $data['rate'],
                'lesson_minutes' => 90,
            ]);

            foreach ($data['teaches'] as [$subject, $from, $to, $isMajor]) {
                $tutor->teachings()->create([
                    'subject_id' => $subjects[$subject],
                    'level_min_rank' => $levels[$from],
                    'level_max_rank' => $levels[$to],
                    'is_major' => $isMajor,
                ]);
            }

            foreach ($data['availability'] as $weekday => $windows) {
                foreach ($windows as $window) {
                    [$start, $end] = self::WINDOWS[$window];
                    $tutor->availabilities()->create([
                        'weekday' => $weekday,
                        'start_time' => $start,
                        'end_time' => $end,
                    ]);
                }
            }
        }
    }

    private function tutors(): array
    {
        return [
            [
                'first_name' => 'Camille', 'last_name' => 'Bernard', 'photo' => 'women/44',
                'credential' => 'Enseignante certifiée', 'school' => 'ENS Lyon',
                'headline' => 'Professeure de maths au collège, je redonne confiance aux élèves qui décrochent.',
                'bio' => 'Normalienne et certifiée en mathématiques, j’enseigne depuis cinq ans en collège à Lyon. J’aime partir des erreurs de l’élève pour reconstruire les notions pas à pas : fractions, calcul littéral, théorème de Pythagore, préparation du brevet. Chaque séance se termine par un petit bilan et des exercices ciblés.',
                'tags' => ['💡 Pédagogie positive', '🎯 Patiente & méthodique', '📐 Spécialiste 4e & 3e'],
                'rating' => 4.9, 'reviews' => 32, 'years' => 5, 'lessons' => 210, 'rate' => 38,
                'teaches' => [['mathematiques', '6e', '3e', true], ['physique-chimie', '4e', '3e', false]],
                'availability' => [2 => ['soir'], 3 => ['apres-midi'], 6 => ['matin']],
            ],
            [
                'first_name' => 'Thomas', 'last_name' => 'Laurent', 'photo' => 'men/32',
                'credential' => 'Ingénieur', 'school' => 'Centrale Paris',
                'headline' => 'Ingénieur passionné, je rends les maths et la physique concrètes et logiques.',
                'bio' => 'Diplômé de CentraleSupélec, j’accompagne depuis sept ans des collégiens et lycéens en mathématiques et en physique-chimie. Je m’appuie sur des exemples concrets (sport, jeux vidéo, ingénierie) pour donner du sens aux formules, et je prépare à la spécialité maths du lycée.',
                'tags' => ['⚙️ Exemples concrets', '🚀 Prépa spécialité maths', '🧠 Méthodes de raisonnement'],
                'rating' => 4.8, 'reviews' => 57, 'years' => 7, 'lessons' => 340, 'rate' => 42,
                'teaches' => [['mathematiques', '4e', 'terminale', true], ['physique-chimie', '2nde', 'terminale', true]],
                'availability' => [1 => ['soir'], 4 => ['soir'], 6 => ['matin'], 7 => ['apres-midi']],
            ],
            [
                'first_name' => 'Inès', 'last_name' => 'Moreau', 'photo' => 'women/68',
                'credential' => 'Master MEEF', 'school' => 'Université de Bordeaux',
                'headline' => 'Lecture, orthographe, rédaction : j’aide les enfants à aimer écrire.',
                'bio' => 'Titulaire d’un master MEEF, j’ai enseigné en école élémentaire avant de me consacrer au soutien scolaire. Je travaille la lecture fluide, l’orthographe et la rédaction avec des jeux de mots et des petites histoires à inventer. J’interviens aussi en anglais pour les plus jeunes.',
                'tags' => ['📚 Amoureuse des livres', '✏️ Orthographe sans larmes', '🌱 Bienveillante'],
                'rating' => 4.7, 'reviews' => 21, 'years' => 3, 'lessons' => 120, 'rate' => 32,
                'teaches' => [['francais', 'cp', '5e', true], ['histoire-geo', '6e', '3e', false], ['anglais', 'cp', 'cm2', false]],
                'availability' => [3 => ['matin', 'apres-midi'], 5 => ['soir'], 6 => ['apres-midi']],
            ],
            [
                'first_name' => 'Youssef', 'last_name' => 'Kaci', 'photo' => 'men/45',
                'credential' => 'Agrégé de Mathématiques', 'school' => 'Sorbonne Université',
                'headline' => 'Agrégé, douze ans d’enseignement : rigueur et exigence, sans pression.',
                'bio' => 'Professeur agrégé en lycée depuis douze ans, je prépare au brevet, au bac et aux concours. Mon objectif : que l’élève comprenne le « pourquoi » derrière chaque méthode. Séances structurées, fiches de synthèse et entraînement régulier sur des sujets d’examen.',
                'tags' => ['🏆 Agrégé', '📈 Objectif mention', '🧮 Rigueur bienveillante'],
                'rating' => 5.0, 'reviews' => 12, 'years' => 12, 'lessons' => 460, 'rate' => 45,
                'teaches' => [['mathematiques', '5e', 'terminale', true]],
                'availability' => [2 => ['soir'], 4 => ['soir'], 6 => ['matin']],
            ],
            [
                'first_name' => 'Sarah', 'last_name' => 'Martin', 'photo' => 'women/23',
                'credential' => 'Étudiante ingénieure', 'school' => 'INSA Lyon',
                'headline' => 'Étudiante ingénieure, proche des élèves, je dédramatise les maths.',
                'bio' => 'En dernière année à l’INSA Lyon, je donne des cours depuis deux ans du primaire au collège. Mon atout : je me souviens très bien de ce qui me bloquait ! J’utilise beaucoup de schémas et de petits défis pour garder la motivation.',
                'tags' => ['😊 Grande sœur pédagogue', '🧩 Défis & schémas', '⚡ Réponse rapide'],
                'rating' => 4.6, 'reviews' => 9, 'years' => 2, 'lessons' => 60, 'rate' => 30,
                'teaches' => [['mathematiques', 'cp', '4e', true], ['physique-chimie', '6e', '3e', false], ['svt', '6e', '4e', false]],
                'availability' => [3 => ['apres-midi'], 5 => ['soir'], 7 => ['matin']],
            ],
            [
                'first_name' => 'Alexandre', 'last_name' => 'Thomas', 'photo' => 'men/52',
                'credential' => 'Polytechnicien', 'school' => 'École polytechnique',
                'headline' => 'Spécialité maths et physique au lycée : méthode et entraînement intensif.',
                'bio' => 'Ancien élève de l’École polytechnique, j’accompagne les lycéens en spécialité mathématiques et physique-chimie, jusqu’au grand oral et aux concours post-bac. Je construis avec l’élève un plan de travail précis et j’insiste sur la rédaction des démonstrations.',
                'tags' => ['🎓 X', '📝 Rédaction rigoureuse', '🎯 Prépa bac & concours'],
                'rating' => 4.9, 'reviews' => 44, 'years' => 6, 'lessons' => 280, 'rate' => 45,
                'teaches' => [['mathematiques', '2nde', 'terminale', true], ['physique-chimie', '2nde', 'terminale', true]],
                'availability' => [2 => ['soir-long'], 6 => ['matin', 'apres-midi']],
            ],
            [
                'first_name' => 'Léa', 'last_name' => 'Mercier', 'photo' => 'women/12',
                'credential' => 'Professeure des écoles', 'school' => 'INSPÉ de Nantes',
                'headline' => 'Professeure des écoles : bases solides en lecture, calcul et anglais.',
                'bio' => 'Professeure des écoles depuis neuf ans, je connais parfaitement les programmes du CP au CM2. J’aide les enfants à consolider la lecture, le calcul mental et les premières notions d’anglais, avec du matériel manipulable et beaucoup d’encouragements.',
                'tags' => ['🍎 Experte du primaire', '🎲 Apprendre en jouant', '💬 Lien avec les parents'],
                'rating' => 4.9, 'reviews' => 63, 'years' => 9, 'lessons' => 520, 'rate' => 35,
                'teaches' => [['francais', 'cp', 'cm2', true], ['mathematiques', 'cp', 'cm2', true], ['anglais', 'cp', 'cm2', false]],
                'availability' => [1 => ['fin-aprem'], 3 => ['matin', 'apres-midi'], 6 => ['matin']],
            ],
            [
                'first_name' => 'Hugo', 'last_name' => 'Petit', 'photo' => 'men/22',
                'credential' => 'Doctorant en biologie', 'school' => 'Université Paris-Saclay',
                'headline' => 'Doctorant en biologie, je fais découvrir le vivant avec curiosité.',
                'bio' => 'Chercheur en biologie cellulaire, j’enseigne les SVT du collège au lycée depuis quatre ans. Je relie chaque chapitre à des découvertes récentes et j’entraîne à l’analyse de documents, essentielle au brevet et au bac.',
                'tags' => ['🔬 Chercheur', '🌍 Curiosité scientifique', '📊 Analyse de documents'],
                'rating' => 4.7, 'reviews' => 18, 'years' => 4, 'lessons' => 150, 'rate' => 36,
                'teaches' => [['svt', '6e', 'terminale', true], ['physique-chimie', '6e', '3e', false]],
                'availability' => [1 => ['apres-midi'], 4 => ['soir'], 7 => ['apres-midi']],
            ],
            [
                'first_name' => 'Manon', 'last_name' => 'Girard', 'photo' => 'women/31',
                'credential' => 'Professeure d’anglais certifiée', 'school' => 'Université Lyon 2',
                'headline' => 'Anglais du collège au bac : oser parler, enfin !',
                'bio' => 'Certifiée d’anglais et ancienne assistante de français à Manchester, j’accompagne les élèves pour l’oral comme pour l’écrit. Grammaire claire, vocabulaire utile et mises en situation : les élèves gagnent vite en aisance. Je prépare aussi aux certifications Cambridge.',
                'tags' => ['🇬🇧 Séjour au Royaume-Uni', '🗣️ Priorité à l’oral', '✅ Prépa Cambridge'],
                'rating' => 4.8, 'reviews' => 39, 'years' => 8, 'lessons' => 390, 'rate' => 40,
                'teaches' => [['anglais', '6e', 'terminale', true], ['francais', '6e', '3e', false]],
                'availability' => [2 => ['soir'], 3 => ['apres-midi'], 4 => ['soir'], 6 => ['matin']],
            ],
            [
                'first_name' => 'Nicolas', 'last_name' => 'Roux', 'photo' => 'men/41',
                'credential' => 'Professeur certifié d’histoire-géographie', 'school' => 'Sciences Po Lyon',
                'headline' => 'L’histoire racontée comme une enquête, la géo comme un voyage.',
                'bio' => 'Professeur certifié depuis dix ans, j’aide les élèves à mémoriser les repères chronologiques grâce à des frises et des récits, et à maîtriser les croquis de géographie. Méthodologie de la composition et de l’étude de documents pour le brevet et le bac.',
                'tags' => ['🗺️ Croquis maîtrisés', '⏳ Frises & repères', '🖋️ Méthode de la composition'],
                'rating' => 4.6, 'reviews' => 27, 'years' => 10, 'lessons' => 300, 'rate' => 38,
                'teaches' => [['histoire-geo', '6e', 'terminale', true], ['francais', '2nde', 'terminale', false]],
                'availability' => [1 => ['matin'], 5 => ['apres-midi'], 6 => ['apres-midi']],
            ],
            [
                'first_name' => 'Chloé', 'last_name' => 'Dubois', 'photo' => 'women/54',
                'credential' => 'Étudiante en master de mathématiques', 'school' => 'Université de Strasbourg',
                'headline' => 'Des maths claires et sans stress pour reprendre confiance.',
                'bio' => 'Étudiante en master de mathématiques, je donne des cours particuliers depuis un an. J’adapte le rythme à chaque élève et je propose des fiches mémo colorées pour réviser. Idéal pour combler des lacunes avant un contrôle.',
                'tags' => ['🌈 Fiches mémo', '🧘 Zéro stress', '📅 Suivi régulier'],
                'rating' => 4.5, 'reviews' => 7, 'years' => 1, 'lessons' => 35, 'rate' => 30, 'response_rate' => 95,
                'teaches' => [['mathematiques', '6e', '2nde', true]],
                'availability' => [3 => ['apres-midi'], 4 => ['soir'], 7 => ['matin']],
            ],
            [
                'first_name' => 'Mehdi', 'last_name' => 'Rahmani', 'photo' => 'men/75',
                'credential' => 'Ingénieur', 'school' => 'Télécom Paris',
                'headline' => 'Ingénieur, je relie maths et physique au monde du numérique.',
                'bio' => 'Ingénieur diplômé de Télécom Paris, j’enseigne depuis quatre ans en parallèle de mon activité. Je montre comment les maths servent à coder, crypter ou modéliser, ce qui motive beaucoup les collégiens. Disponible en soirée et le week-end.',
                'tags' => ['💻 Maths & numérique', '🔁 Exercices progressifs', '🌙 Dispo en soirée'],
                'rating' => 4.7, 'reviews' => 22, 'years' => 4, 'lessons' => 160, 'rate' => 37,
                'teaches' => [['mathematiques', '5e', '1re', true], ['physique-chimie', '4e', '1re', false]],
                'availability' => [2 => ['soir-long'], 6 => ['matin'], 7 => ['soir']],
            ],
            [
                'first_name' => 'Julie', 'last_name' => 'Fontaine', 'photo' => 'women/79',
                'credential' => 'Professeure de lettres certifiée', 'school' => 'Sorbonne Université',
                'headline' => 'Dissertation, commentaire, bac de français : la méthode qui rassure.',
                'bio' => 'Professeure de lettres modernes depuis onze ans, je prépare au brevet et aux épreuves anticipées de français. Analyse de texte, dissertation, oral : je donne une méthode claire et des exemples de copies réussies. J’aide aussi en histoire-géographie au lycée.',
                'tags' => ['📖 Bac de français', '🎤 Préparation à l’oral', '🏅 11 ans d’expérience'],
                'rating' => 4.9, 'reviews' => 51, 'years' => 11, 'lessons' => 610, 'rate' => 44,
                'teaches' => [['francais', '6e', 'terminale', true], ['histoire-geo', '2nde', 'terminale', false]],
                'availability' => [1 => ['soir'], 3 => ['matin'], 5 => ['soir'], 7 => ['matin']],
            ],
            [
                'first_name' => 'Antoine', 'last_name' => 'Lefèvre', 'photo' => 'men/36',
                'credential' => 'Professeur des écoles', 'school' => 'INSPÉ de Lille',
                'headline' => 'Accompagnement global au primaire, de la lecture à l’anglais.',
                'bio' => 'Professeur des écoles en classe de CE2, j’aide les enfants après l’école à consolider les fondamentaux : lecture, calcul, problèmes et premières phrases en anglais. Je communique après chaque séance avec les parents sur les progrès réalisés.',
                'tags' => ['🧸 Patient avec les petits', '🔤 Bases solides', '📝 Compte rendu aux parents'],
                'rating' => 4.6, 'reviews' => 14, 'years' => 3, 'lessons' => 95, 'rate' => 32,
                'teaches' => [['anglais', 'cp', '6e', true], ['mathematiques', 'cp', 'cm2', false], ['francais', 'cp', 'cm2', false]],
                'availability' => [1 => ['fin-aprem'], 4 => ['fin-aprem'], 6 => ['matin']],
            ],
            [
                'first_name' => 'Emma', 'last_name' => 'Rousseau', 'photo' => 'women/65',
                'credential' => 'Bilingue, master LLCER anglais', 'school' => 'Université Bordeaux Montaigne',
                'headline' => 'Bilingue franco-britannique : l’anglais naturellement, dès le CP.',
                'bio' => 'Née d’une mère anglaise, j’ai grandi entre Bristol et Bordeaux. J’enseigne l’anglais à tous les âges avec des chansons, des jeux de rôle et des séries pour les plus grands. L’objectif : comprendre et s’exprimer sans peur de l’erreur.',
                'tags' => ['🇬🇧 Bilingue', '🎵 Chansons & jeux de rôle', '🌟 Tous niveaux'],
                'rating' => 4.8, 'reviews' => 30, 'years' => 5, 'lessons' => 230, 'rate' => 39,
                'teaches' => [['anglais', 'cp', 'terminale', true]],
                'availability' => [3 => ['matin'], 6 => ['apres-midi'], 7 => ['apres-midi']],
            ],
            [
                'first_name' => 'Karim', 'last_name' => 'Benali', 'photo' => 'men/61',
                'credential' => 'Agrégé de physique-chimie', 'school' => 'ENS Paris-Saclay',
                'headline' => 'Physique-chimie au lycée : comprendre les phénomènes avant les formules.',
                'bio' => 'Agrégé et enseignant en lycée depuis neuf ans, je prépare à la spécialité physique-chimie et à l’ECE. Je pars toujours d’une expérience ou d’une vidéo pour comprendre le phénomène, puis on passe à la modélisation. J’aide aussi en mathématiques au lycée.',
                'tags' => ['⚗️ Expériences à la maison', '📐 Modélisation', '🎓 Agrégé'],
                'rating' => 4.9, 'reviews' => 25, 'years' => 9, 'lessons' => 380, 'rate' => 45,
                'teaches' => [['physique-chimie', '3e', 'terminale', true], ['mathematiques', '2nde', 'terminale', false]],
                'availability' => [1 => ['soir'], 3 => ['apres-midi'], 7 => ['matin']],
            ],
            [
                'first_name' => 'Pauline', 'last_name' => 'Garnier', 'photo' => 'women/90',
                'credential' => 'Docteure en géographie', 'school' => 'Université Grenoble Alpes',
                'headline' => 'Histoire-géo et SVT : des cartes, des frises et des schémas clairs.',
                'bio' => 'Docteure en géographie, j’enseigne depuis six ans au collège et au lycée. Je fais construire aux élèves leurs propres fiches de révision (cartes mentales, frises, croquis) pour qu’ils deviennent autonomes. Je donne aussi des cours de SVT au collège.',
                'tags' => ['🧭 Cartes mentales', '🗂️ Élève autonome', '🌋 Passionnée de terrain'],
                'rating' => 4.7, 'reviews' => 16, 'years' => 6, 'lessons' => 200, 'rate' => 38,
                'teaches' => [['histoire-geo', '6e', 'terminale', true], ['svt', '6e', '3e', false]],
                'availability' => [2 => ['apres-midi'], 4 => ['matin'], 6 => ['matin'], 7 => ['apres-midi']],
            ],
        ];
    }
}
