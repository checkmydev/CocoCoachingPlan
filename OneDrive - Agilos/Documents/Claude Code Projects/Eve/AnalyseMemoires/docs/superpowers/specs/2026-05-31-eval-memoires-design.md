# Design — Application d'évaluation des mémoires kiné CUTM

Date : 2026-05-31  
Contexte : Application web statique pour aider un professeur à évaluer les mémoires de fin de formation de 4 étudiants en kinésithérapie musculosquelettique (spécialisation CUTM, UCLouvain).

---

## Objectif

Fournir une interface permettant au professeur de :
1. Consulter les résumés et critiques IA de chaque mémoire
2. Vérifier les critères des grilles d'évaluation avec citation du passage pertinent + lien PDF
3. Saisir et modifier ses propres scores et commentaires par critère
4. Disposer de questions d'examen oral générées par l'IA
5. Calculer automatiquement les notes finales

---

## Étudiants et grilles applicables

| Étudiant | Fichier | Type | Grille écrite | Grille orale |
|----------|---------|------|---------------|--------------|
| Baudart A. | BAUDART_A_CUTM_TFF.pdf | TFF | TFF-CUTM /20 | TFF oral /40 |
| Mora Hurtado Sebastian | MORA_HURTADO_SEBASTIAN_RC2026.pdf | RC | — | RC /20 (7 critères) |
| Lucas Triffoy | RC LUCAS TRIFFOY.pdf | RC (TFF manquant) | Désactivé | RC /20 (7 critères) |
| Issa David | Travail de fin de formation CUTM TTF+RC.pdf | TFF+RC | TFF-CUTM /20 | TFF oral /40 + RC |

### Grille TFF écrite (/20)
- Section 1 : Identification & Synthèse (3 pts) — Titre/mots-clés (0.5), Résumé (1.5), Introduction (1)
- Section 2 : Présentation du Patient (4 pts) — Anamnèse (2), Modèle de Curtin (1), Chronologie (1)
- Section 3 : Démarche Diagnostique (4 pts) — Résultats Cliniques (1.5), Raisonnement (2.5)
- Section 4 : Intervention & Suivi (5 pts) — Modalités/Tidier (2.5), Résultats & Suivi (2.5)
- Section 5 : Discussion & Éthique (4 pts) — Analyse Critique (2.5), Perspective Patient (1), Consentement (0.5)

Échelle par critère : Excellent (100%), Satisfaisant (75%), Faible (40%), Insuffisant (0%)

### Grille TFF orale (/40)
- Bloc I : Structure & Contenu (15 pts) — 5 critères (Pertinence, Résultats & Clinique, Fil conducteur, Esprit de synthèse, Ouverture)
- Bloc II : Support Visuel & Maîtrise (10 pts) — 4 critères (Qualité support, Rigueur académique, Indépendance, Qualité formelle)
- Bloc III : Interaction & Questions (15 pts) — 4 critères (Justesse des réponses, Expertise métier, Distinction critique, Élocution)

Échelle : Tout à fait présent / Plutôt présent / Peu présent / Absent / N/A  
Note : critères en gras comptent double. Un seul "Absent" sur critère majeur → max 24/40.

### Grille RC (/20 oral, 7 critères)
1. Générer des hypothèses : valider ou adapter
2. Appliquer les catégories d'hypothèses (Jones-Curtin)
3. Prioriser ses choix
4. Intégrer (placer le patient au centre)
5. S'adapter aux nouvelles informations / questions de l'examinateur
6. Utiliser des stratégies de recours appropriées
7. Auto-évaluer le processus cognitif

Échelle : Insuffisant (<10) / Acceptable (10-12) / Maîtrisé (13-15) / Avancé (>16)

---

## Architecture technique

### Fichiers
```
AnalyseMemoires/
├── index.html          ← structure HTML unique, navigation SPA
├── styles.css          ← mise en forme (palette sobre, pro)
├── app.js              ← logique : navigation, calcul scores, localStorage, impression
├── data.js             ← analyse IA complète (chargé comme <script src="data.js">)
└── Memoires/           ← PDFs existants (inchangés)
```

### Persistance
- **localStorage** pour toutes les annotations du professeur (scores, commentaires, questions custom)
- Clé par étudiant : `eval_baudart`, `eval_mora`, `eval_triffoy`, `eval_issa`
- Autosave à chaque modification + bouton "Sauvegarder" explicite

### Déploiement
- Local : ouvrir `index.html` directement (les PDFs sont chargés via chemin relatif)
- GitHub Pages : déposer les fichiers, PDFs inclus → fonctionne sans build

---

## Structure de l'interface

### Vue Dashboard
- Tableau des 4 étudiants : nom, type (TFF/RC/TFF+RC), note écrite proposée IA, note orale proposée IA, % de critères validés par le prof
- Mini-indicateurs de progression colorés (rouge/orange/vert)
- Bouton "Comparaison" → vue tableau comparatif des scores

### Vue Étudiant (4 onglets)

#### Onglet 1 — Analyse
- Résumé IA : points clés du mémoire (5-8 bullets)
- Critique IA : forces et limites (structure par points)
- Champ "Mes notes générales" (textarea, sauvegardé)

#### Onglet 2 — Grille écrite (TFF uniquement)
- 5 sections dépliables, chaque critère :
  - Libellé + description de l'indicateur attendu
  - Score max
  - **Score IA proposé** (pré-rempli, non modifiable directement)
  - **Score prof** (input numérique ou sélecteur Excellent/Satisfaisant/Faible/Insuffisant)
  - Citation du passage pertinent (extrait textuel, italique)
  - Bouton "Ouvrir PDF p.X" (ouvre `Memoires/fichier.pdf#page=X`)
  - Champ commentaire prof (textarea)
- Total auto-calculé, affiché en bas de chaque section et en pied de page

#### Onglet 3 — Grille orale
- Pour RC : 7 critères, sélecteur Insuffisant/Acceptable/Maîtrisé/Avancé + commentaire
- Pour TFF : 3 blocs, radio Tout à fait / Plutôt / Peu / Absent / N/A + commentaire
- Note finale calculée selon guide de conversion
- Indicateur "critères majeurs absents" si applicable

#### Onglet 4 — Examen oral
- 8-10 questions IA par étudiant, organisées par thème (raisonnement clinique, techniques, éthique…)
- Champ pour ajouter ses propres questions
- Bouton "Imprimer les questions"

### Barre de score (sticky bottom)
- Note écrite : X/20 | Note orale : X/40 ou X/20 | Note finale calculée

---

## Fonctionnalités supplémentaires

| Feature | Implémentation |
|---------|----------------|
| Impression fiche complète | `window.print()` avec CSS `@media print` dédié |
| Indicateur de progression | Barre par onglet "X/Y critères notés" |
| Comparaison inter-étudiants | Vue tableau depuis dashboard |
| Réinitialisation | Bouton "Réinitialiser" par étudiant (confirm dialog) |
| Autosave | `input`/`change` event → `localStorage.setItem()` |

---

## Structure de `data.js`

```js
const STUDENTS_DATA = {
  baudart: {
    name: "Baudart A.",
    pdfFile: "Memoires/BAUDART_A_CUTM_TFF.pdf",
    type: "TFF",
    summary: [...],           // bullets points résumé
    critique: { strengths: [...], weaknesses: [...] },
    writtenCriteria: {
      titre_mots_cles: {
        maxScore: 0.5,
        aiScore: 0.5,
        evidence: { quote: "...", page: 1 },
        aiComment: "..."
      },
      // ... tous les critères
    },
    oralCriteria: { /* TFF oral */ },
    oralQuestions: [...]
  },
  mora: { type: "RC", /* ... */ },
  triffoy: { type: "RC", writtenCriteria: null /* TFF manquant */, /* ... */ },
  issa: { type: "TFF+RC", /* ... */ }
};
```

---

## Analyse IA pré-générée (résumé par étudiant)

### Baudart A. — TFF
Sujet : Hygiène de vie dans la cervicalgie chronique.  
Points forts identifiés : résumé structuré, modèle de Curtin complété, suivi longitudinal avec mesures EVA/NDI/FABQ, éducation thérapeutique bien documentée.  
Points faibles identifiés : tableau Tidier partiellement rempli, discussion brève, absence de mention explicite du pronostic dans le raisonnement.

### Mora Hurtado S. — RC
Sujet : Raisonnement clinique, cervicalgie chronique, approche multimodale.  
Points forts : framework Curtin bien détaillé, facteurs contributifs hiérarchisés, métacognition riche, identification des biais de raisonnement.  
Points faibles : pas de données chiffrées de résultats dans le RC, stratégies de recours peu développées.

### Triffoy L. — RC
Sujet : RC cervicalgie chronique (TFF manquant).  
Points forts : bonne identification des croyances, patient au centre, autocritique honnête.  
Points faibles : travail très succinct (3 pages), format bullet-points sans développement, peu d'appui sur la littérature, absence de données objectives.

### Issa David — TFF+RC
Sujet : Céphalée cervicogénique, approche multimodale.  
Points forts : travail le plus complet et le plus rigoureux, questionnaires validés (HIT-6, NDI, TSK-11) avec MCID rapportés, Tableau Tidier complet, bibliographie solide, métacognition approfondie.  
Points faibles : absence de CCFT (remplacé par DNFET), lieu d'intervention non mentionné dans Tidier.

---

## Contraintes et hypothèses

- Les PDFs restent en local (pas uploadés nulle part)
- Lucas Triffoy : TFF non fourni → onglet grille écrite désactivé avec message explicatif
- Langue de l'interface : français
- Pas de framework JS (vanilla JS uniquement)
- Compatible Chrome/Edge/Firefox récents
