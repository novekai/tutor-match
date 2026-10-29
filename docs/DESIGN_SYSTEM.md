# Design System Studena v1.0 (source : `Maquette Studena/Design Systeme.png`)

Desktop de référence 1440 px. **Police : Plus Jakarta Sans** (Google Fonts, 400/500/600/700/800). Texte principal neutral-900, secondaire neutral-500.

## Couleurs
| Jeton | Hex | | Jeton | Hex |
|---|---|---|---|---|
| primary-50 | #EEF5FC | | neutral-0 | #FFFFFF |
| primary-100 | #D9E8F7 | | neutral-50 | #F7F9FC (fond de page) |
| primary-200 | #B6D3F0 | | neutral-100 | #F1F5F9 |
| primary-300 | #86B6E5 | | neutral-200 | #E2E8F0 |
| primary-400 | #5498D8 | | neutral-300 | #CBD5E1 |
| **primary-500** | **#2F7ECB** (action) | | neutral-400 | #94A3B8 |
| primary-600 | #2468AD (hover) | | neutral-500 | #64748B |
| primary-700 | #1E548B | | neutral-700 | #334155 |
| primary-800 | #1B4570 | | neutral-900 | #0F172A |
| primary-900 | #18395A | | | |

Sémantique : succès #16A34A (fond #DCFCE7) · étoiles/note #F5B700 (fond #FEF6D8) · erreur #DC2626 (fond #FEE2E2).
Une seule couleur d'action (primary-500). Un seul bouton primaire par écran.

## Typographie (taille/interligne · graisse)
Display 48/56·800 · H1 36/44·700 · H2 28/36·700 · H3 20/28·600 · Body L 18/28·400 · Body 16/24·400 · Label 14/20·600 · Small 14/20·400 · Caption 12/16·600 (majuscules, ex. « MEILLEUR CHOIX »). Titres serrés (tracking négatif) et gras.

## Espacements, rayons, ombres
Grille de 8 px (4 pour micro-ajustements) : 4, 8, 12, 16, 24, 32, 48, 64.
Rayons : sm 8 · md 12 · lg 16 · xl 24 · full.
Ombres très douces : shadow-sm `0 1px 3px rgb(15 23 42 / 6%)` (inputs, chips) · shadow-md `0 4px 16px rgb(15 23 42 / 8%)` (cartes, hover) · shadow-lg `0 12px 32px rgb(15 23 42 / 12%)` (modales, drawer).

## Boutons
Hauteur 48 (Large 56), rayon 12. Variantes : Primary (primary-500, hover primary-600), Secondary (blanc + bordure neutral-200), Ghost (texte primary, fond primary-50), Disabled (neutral-200 / neutral-400), Loading (spinner + libellé). Primary Large pleine largeur dans formulaires et drawer.

## Contrôles de formulaire
Aucune liste déroulante : chips (niveau), tuiles (matière, icône + sous-titre, coche en haut à droite si sélectionnée), grille de créneaux 7 jours × Matin/Après-midi/Soir (case cochée = primary-500 + ✓).
Champs texte : hauteur 48, rayon 12, icône à gauche ; focus = anneau primary-50 + bordure primary-500 ; erreur = bordure #DC2626 + message rouge sous le champ ; aide en Small neutral-500.

## Badges et indicateurs
« MEILLEUR CHOIX » (caption, fond primary-500 texte blanc ou fond primary-50) · « Profil vérifié » (succès) · note ★ (fond étoiles) · créneau (point primary + texte, fond primary-50) · matière (fond primary-100) · anneau de compatibilité en % (primary-500 sur neutral-100).

## Carte tuteur
Survol : shadow-md + translateY(-2px). Le créneau compatible se réserve en un clic.

## États
Chargement en squelettes (jamais d'écran blanc) · confirmation claire (pastille verte ✓) · état vide avec suggestion utile (« + Ajouter mercredi matin (3 tuteurs) »).
