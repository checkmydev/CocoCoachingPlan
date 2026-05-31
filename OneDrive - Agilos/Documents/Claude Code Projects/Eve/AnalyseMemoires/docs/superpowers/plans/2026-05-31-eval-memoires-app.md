# Evaluation Mémoires CUTM — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static HTML/CSS/JS web app that presents AI-generated summaries, critiques, evaluation criteria with evidence, and oral exam questions for 7 CUTM physiotherapy students.

**Architecture:** 4 files — `index.html` (SPA shell), `styles.css`, `app.js` (navigation + UI logic), `data.js` (all AI analysis as a JS constant). No build step. localStorage for professor annotations. Works locally and on GitHub Pages.

**Tech Stack:** Vanilla HTML5/CSS3/JavaScript (ES6+), no frameworks, no dependencies.

---

## Task 1 — Project skeleton

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `app.js`
- Create: `data.js`

- [ ] **Step 1: Create the 4 empty files**

```
index.html   (empty for now)
styles.css   (empty for now)
app.js       (empty for now)
data.js      (empty for now)
```

- [ ] **Step 2: Verify the Memoires folder is in place**

Run in PowerShell: `ls "Memoires"` — should list 11 PDF files.

- [ ] **Step 3: Commit skeleton**

```
git add index.html styles.css app.js data.js
git commit -m "feat: add project skeleton for eval-memoires app"
```

---

## Task 2 — data.js: complete AI analysis for all 7 students

**Files:**
- Write: `data.js`

This is the most critical task. All AI analysis is embedded here as a JS constant loaded via `<script src="data.js">` — no CORS issues.

- [ ] **Step 1: Write data.js with full STUDENTS_DATA constant**

```javascript
// data.js — AI-generated analysis for all 7 CUTM students
// DO NOT EDIT manually — regenerate via AI if updates needed

const STUDENTS_DATA = {

  baudart: {
    id: 'baudart',
    name: 'Baudart A.',
    type: 'TFF+RC',
    tffFile: 'Memoires/BAUDART_A_CUTM_TFF.pdf',
    rcFile: 'Memoires/BAUDART_A_CUTM_Raisonnement_clinique.pdf',
    aiWrittenScore: 13.5,
    aiRcLevel: 'Acceptable-Maîtrisé',

    summary: [
      'Patiente Mme S.P., 37 ans, secrétaire bruxelloise avec cervicalgie chronique depuis 2022 dans un contexte bio-psycho-social très chargé.',
      'Nombreux drapeaux jaunes, bleus et noirs : kinésiophobie, anxiété traitée (alprazolam), troubles du sommeil, surcharge professionnelle, trafic de drogue sur le lieu de travail.',
      'Approche centrée sur l\'éducation thérapeutique et les changements d\'hygiène de vie (sommeil, activité physique, gestion du stress).',
      'Résultats longitudinaux rigoreux : EVA 5→1/10, NDI 62%→20%, FABQ 45→8/96 sur 8 mois de suivi.',
      'Techniques myofasciales (triggers points, tenir-relâcher) et exercices de mobilité cervicale utilisés en complément.',
      'Monitoring de l\'activité physique via montre connectée : 12 min/jour → 42 min/jour actives en 3 mois.',
    ],

    critique: {
      strengths: [
        'Résumé structuré respectant la forme attendue avec tous les composants.',
        'Suivi longitudinal rigoureux avec 3 outils de mesure répétés (EVA, NDI, FABQ).',
        'Approche biopsychosociale exhaustive : drapeaux jaunes/bleus/noirs tous identifiés et documentés.',
        'Modèle de Curtin complété avec figure annotée et cohérente.',
        'Bibliographie solide avec 12 références récentes et pertinentes.',
        'RC complémentaire cohérent avec le TFF, bonne métacognition sur l\'adaptation du discours thérapeutique.',
      ],
      weaknesses: [
        'Tableau Tidier partiellement rempli (plusieurs items vides ou non justifiés).',
        'Discussion trop brève (1 page) au regard de la richesse du cas clinique.',
        'Pronostic non formulé explicitement dans la démarche diagnostique.',
        'Perspective du patient peu développée (quelques phrases seulement).',
        'Consentement éclairé absent du TFF.',
        'RC : absence de stratégie de recours formalisée ("/" en réponse).',
      ],
    },

    writtenCriteria: {
      titre_mots_cles: {
        label: 'Titre & Mots-clés',
        section: 'Identification et Synthèse',
        maxScore: 0.5,
        aiScore: 0.5,
        aiComment: 'Mention "étude de cas" présente, sujet explicite, 5 mots-clés pertinents (cervicalgie, douleur chronique, drapeaux jaune, éducation thérapeutique, thérapie manuelle).',
        evidence: { quote: 'Type d\'article : étude de cas – Introduction : le but de cette étude est de montrer à quel point les habitudes de vie peut influencer la pathologie de la patiente.\nMots clés : cervicalgie - douleur chronique - drapeaux jaune - éducation thérapeutique - thérapie manuelle.', page: 1 },
      },
      resume: {
        label: 'Résumé (Abstract)',
        section: 'Identification et Synthèse',
        maxScore: 1.5,
        aiScore: 1.2,
        aiComment: 'Structure complète présente (type d\'article, description du cas, examen clinique, intervention, résultats, discussion, conclusion). Légèrement succinct sur les diagnostics différentiels.',
        evidence: { quote: 'Résumé : Type d\'article : étude de cas – Introduction : le but de cette étude est de montrer à quel point les habitudes de vie peut influencer la pathologie de la patiente. [...] - Conclusion : l\'amélioration des symptômes décrits par la patiente pousse en faveur de l\'efficacité de l\'éducation thérapeutique.', page: 1 },
      },
      introduction: {
        label: 'Introduction',
        section: 'Identification et Synthèse',
        maxScore: 1.0,
        aiScore: 0.75,
        aiComment: 'Justification clinique présente avec nombreuses références (12+), mais l\'intérêt spécifique du cas n\'est pas explicitement argumenté en introduction.',
        evidence: { quote: 'La cervicalgie est une pathologie multifactorielle avec un des coûts socio-économiques les plus important parmi les douleurs musculosquelettiques. On estime que 70% de la population mondiale a souffert ou souffrira d\'une cervicalgie un jour dans sa vie.', page: 2 },
      },
      anamnese: {
        label: 'Anamnèse',
        section: 'Présentation du Patient et Contexte',
        maxScore: 2.0,
        aiScore: 1.5,
        aiComment: 'Infos démographiques anonymisées, symptômes détaillés, body chart inclus, antécédents complets. Manque quelques détails sur les interventions passées (ostéopathie mentionnée brièvement seulement).',
        evidence: { quote: 'Madame S.P., 37 ans, employée communale faisant fonction de secrétaire dans une école de la région Bruxelloise. Elle est en surcharge de travail depuis qu\'elle est seule dans son bureau (septembre 2022). [...] La patiente présente des facteurs de risques bio-psycho-sociaux tels que des troubles du sommeil...', page: 3 },
      },
      modele_curtin: {
        label: 'Modèle de Curtin',
        section: 'Présentation du Patient et Contexte',
        maxScore: 1.0,
        aiScore: 0.75,
        aiComment: 'Figure complétée avec facteurs personnels et environnementaux, positions marquées sur les échelles. Justifications textuelles présentes mais succinctes.',
        evidence: { quote: 'Les différentes informations nécessaires pour compléter le modèle de Curtin se trouvent dans les point concernant la patiente, sa chronologie, son examen clinique et son traitement. [Figure Musculoskeletal Clinical Translation Framework p.7]', page: 6 },
      },
      chronologie: {
        label: 'Chronologie',
        section: 'Présentation du Patient et Contexte',
        maxScore: 1.0,
        aiScore: 1.0,
        aiComment: 'Chronologie claire de septembre 2022 à avril 2026 avec jalons précis (kiné, ostéopathe, arrêt maladie, trafics de drogue, benzodiazépines).',
        evidence: { quote: 'Les symptômes se manifestent en septembre 2022 : douleur cervicales, raideurs, inconfort positionnel et des difficultés à se concentrer. [...] Lors de la première consultation le 06/08/2025, elle se plaint de douleurs cervicales.', page: 3 },
      },
      resultats_cliniques: {
        label: 'Résultats Cliniques',
        section: 'Démarche Diagnostique et Raisonnement',
        maxScore: 1.5,
        aiScore: 1.2,
        aiComment: 'Examen physique ciblé décrit (drapeaux rouges exclus via SNOOP-10, 5D3N), NDI/FABQ/DN-4 documentés, body chart inclus. Manque quelques précisions sur les amplitudes en degrés.',
        evidence: { quote: 'Après évaluation des drapeaux rouges (examen des nerfs crâniens, SNOOP-10, 5D3N), aucune contre-indication au traitement n\'est détectée. [...] NDI : 31/50 – 62% ; FABQ : 45/96 (Travail : 17/42 – Activité physique : 20/24) ; DN-4 : 0/10', page: 4 },
      },
      raisonnement: {
        label: 'Raisonnement',
        section: 'Démarche Diagnostique et Raisonnement',
        maxScore: 2.5,
        aiScore: 1.5,
        aiComment: 'Drapeaux jaunes/bleus/noirs bien identifiés et hiérarchisés. Enjeux financiers et culturels implicites mais pas explicitement discutés. Diagnostics différentiels absents. Pronostic non formulé.',
        evidence: { quote: 'Elle révèle également des drapeaux bleus (charge de travail trop importante pour une seule personne) et noirs (situation compliquée autour du lieu de travail, long trajets). La douleur cervicale est évaluée à 5/10 sur l\'EVA pouvant aller jusque 7-8/10 en cas d\'exacerbation.', page: 4 },
      },
      modalites_tidier: {
        label: 'Modalités (Tidier)',
        section: 'Intervention et Suivi',
        maxScore: 2.5,
        aiScore: 1.5,
        aiComment: 'Types d\'intervention décrits (éducation thérapeutique, triggers points, tenir-relâcher, exercices de mobilité). Tableau Tidier présent en annexe mais partiellement rempli (items 6, 7, 10, 11 incomplets).',
        evidence: { quote: 'Les triggers point étaient appliqués pendant 60 à 90 secondes sur les muscles splénius de la tête et sterno-cléido-mastoïdien. Le tenir-relâcher se faisait avec des mouvement unidimensionnels [...] à 30% de la FIMV, répétées 4 à 6 fois pendant 5 secondes.', page: 8 },
      },
      resultats_suivi: {
        label: 'Résultats & Suivi',
        section: 'Intervention et Suivi',
        maxScore: 2.5,
        aiScore: 2.0,
        aiComment: 'Tableau de suivi complet avec 7 évaluations EVA, 4 NDI, 3 FABQ. Monitoring activité physique via montre connectée. Observance et tolérance mentionnées. Effets indésirables non discutés explicitement.',
        evidence: { quote: 'La douleur, le NDI et le FABQ ont été évalué respectivement 7, 4 et 3 fois entre le 06/08/2025 et le 07/04/2026. [...] Elle est passée d\'une moyenne de 12 minutes active par jour la deuxième semaine de janvier à 29 minutes active par jour mi-février à 42 minutes actives par jour fin mars.', page: 5 },
      },
      analyse_critique: {
        label: 'Analyse Critique',
        section: 'Discussion et Éthique',
        maxScore: 2.5,
        aiScore: 1.5,
        aiComment: 'Forces/limites identifiées (adhérence thérapeutique, importance de la formation du thérapeute, alternatives thérapeutiques). Lien avec la littérature présent. Discussion trop brève (1 page) pour la richesse du cas.',
        evidence: { quote: 'Le point fort de cette étude est l\'adhérence thérapeutique de la patiente au traitement. [...] L\'éducation thérapeutique est à la fois un point fort et un point faible de cette étude. En effet, même si elle semble avoir porté ses fruits, une certaine maitrise du sujet est nécessaire.', page: 9 },
      },
      perspective_patient: {
        label: 'Perspective Patient',
        section: 'Discussion et Éthique',
        maxScore: 1.0,
        aiScore: 0.5,
        aiComment: 'Mentionnée brièvement (première envie exprimée, adhérence au traitement). Non développée comme section structurée avec le point de vue de la patiente sur les traitements reçus.',
        evidence: { quote: 'La première envie qu\'elle a exprimée est de pouvoir retrouver du plaisir en s\'occupant avec ses enfants. Sa plus grosse gène est la douleur qu\'elle ressent au quotidien et le manque de motivation que cela lui cause.', page: 8 },
      },
      consentement: {
        label: 'Consentement',
        section: 'Discussion et Éthique',
        maxScore: 0.5,
        aiScore: 0.0,
        aiComment: 'Aucune mention explicite du consentement éclairé du patient dans le TFF.',
        evidence: { quote: '[Absent du TFF — non mentionné]', page: null },
      },
    },

    rcCriteria: {
      generer_hypotheses: {
        label: '1. Générer des hypothèses : valider ou adapter',
        aiLevel: 'Maîtrisé',
        aiComment: 'Hypothèses bien justifiées (douleur nociplastique selon algorithme Kosek 2021), plusieurs catégories explorées, testées via questionnaires et examen clinique. Pronostic peu développé dans le RC.',
        evidence: { quote: 'Après les bilans et l\'anamnèse, j\'aurais dit que la patiente souffrait d\'une douleur cervicale nociplastique. [...] A l\'issu des bilan je n\'étais pas très positif concernant le pronostic de la patiente.', page: 6 },
      },
      appliquer_categories: {
        label: '2. Appliquer les catégories d\'hypothèses (Jones-Curtin)',
        aiLevel: 'Acceptable',
        aiComment: 'Modèle de Curtin complété dans le RC avec justification de chaque item. Catégories utilisées mais pas toujours nommées selon le modèle de Jones-Curtin formellement.',
        evidence: { quote: 'Caractéristique de la douleur : Selon l\'algorithme de Kosek et al. (2021), la douleur peut être nociplastique. Plutôt d\'origine non mécanique car la douleur est constante même quand la patiente ne subit pas de contrainte physique.', page: 5 },
      },
      prioriser: {
        label: '3. Prioriser ses choix',
        aiLevel: 'Maîtrisé',
        aiComment: 'Facteurs contributifs priorisés (troubles du sommeil, anxiété, kinésiophobie). Objectifs à court/moyen/long terme définis. Priorisation contextuelle et justifiée.',
        evidence: { quote: 'Les facteurs contribuant les plus important sont les troubles du sommeil, l\'anxiété et la kinésiophobie. [...] Court terme : la faire adhérer au plan de traitement. Moyen terme : lui apprendre a gérer ses douleurs. Long terme : diminuer son incapacité.', page: 6 },
      },
      integrer_patient: {
        label: '4. Intégrer (placer le patient au centre)',
        aiLevel: 'Acceptable',
        aiComment: 'Attentes de la patiente identifiées et respectées. Raisonnement collaboratif limité (patient décrit comme passif, "écoutait comme un élève"). Bonne conscience de cette limite en métacognition.',
        evidence: { quote: 'Le patient était un peu passif. En donnant les informations, en expliquant les données comme je les ai récoltées, le patient m\'écoutait comme un élève écoute un professeur. Il répondait au questions mais n\'en posait pas.', page: 7 },
      },
      sadapter: {
        label: '5. S\'adapter aux nouvelles informations / questions',
        aiLevel: 'Acceptable',
        aiComment: 'Adaptation aux nouvelles informations partiellement décrite (corrélations symptômes/événements). Réponse aux questions du patient peu formalisée.',
        evidence: { quote: 'J\'ai cherché des corrélation entre les symptômes qu\'elle me rapportait et les événements qui se passaient dans sa vie. Est-ce qu\'elle était en état de stress ou de fatigue quand elle a eu ses douleurs à la tête ?', page: 6 },
      },
      strategies_recours: {
        label: '6. Utiliser des stratégies de recours appropriées',
        aiLevel: 'Insuffisant',
        aiComment: 'Question sur les stratégies de recours répondue par "/". Absence totale de stratégie de recours documentée.',
        evidence: { quote: 'Avez-vous utilisé des stratégies de recours ? Si oui, lesquelles ? /', page: 6 },
      },
      auto_evaluer: {
        label: '7. Auto-évaluer le processus cognitif',
        aiLevel: 'Maîtrisé',
        aiComment: 'Métacognition honnête et réflexive : importance du timing dans la transmission des informations, nécessité de demander le ressenti du patient, absence de biais identifié explicitement.',
        evidence: { quote: 'Parfois il faut le temps avant qu\'une information soit traitée, intégrée et comprises. [...] Je me rends compte que je ne demande pas souvent à mes patients ce qu\'ils ressentent et comment ils voient les choses.', page: 7 },
      },
    },

    oralQuestions: [
      'Vous avez diagnostiqué une douleur nociplastique — expliquez comment vous avez appliqué l\'algorithme de Kosek et al. (2021) à ce cas et quels critères étaient remplis.',
      'Comment avez-vous géré la kinésiophobie de la patiente sans utiliser de TSK validé ? Quel outil aurait été plus approprié ?',
      'Votre patiente était "passive comme un élève" lors des séances d\'éducation. Comment auriez-vous pu la rendre plus actrice de son traitement dès le début ?',
      'Expliquez la différence entre les drapeaux jaunes, bleus et noirs que vous avez identifiés chez cette patiente, et leur impact sur votre plan de traitement.',
      'Le Tableau Tidier était partiellement rempli. Quels items manquants sont les plus importants pour la reproductibilité de votre intervention ?',
      'Si la patiente n\'avait pas montré d\'amélioration après 3 séances d\'éducation thérapeutique, quelle stratégie de recours auriez-vous envisagée ?',
      'Comment justifiez-vous l\'utilisation des techniques myofasciales dans un contexte de douleur nociplastique, sachant que la littérature recommande de limiter les approches passives ?',
      'Le consentement éclairé est absent de votre TFF. Pourquoi est-ce un élément obligatoire pour un case report, et comment l\'auriez-vous documenté ?',
      'Vous n\'avez pas mentionné de pronostic explicite. Quel aurait été votre pronostic et sur quels éléments l\'auriez-vous basé ?',
      'La patiente a cassé son arrêt maladie pour retourner travailler. Comment cette décision a-t-elle influencé votre raisonnement thérapeutique ?',
    ],
  },

  mora: {
    id: 'mora',
    name: 'Mora Hurtado S.',
    type: 'RC',
    tffFile: null,
    rcFile: 'Memoires/MORA_HURTADO_SEBASTIAN_RC2026.pdf',
    aiWrittenScore: null,
    aiRcLevel: 'Maîtrisé-Avancé',

    summary: [
      'RC sur un horloger de 36 ans avec cervicalgie chronique non spécifique et céphalées de tension évoluant depuis plusieurs années.',
      'Framework Curtin complété avec justification détaillée de chaque item. Douleur mixte nociceptive/nociplastique, stade chronique persistant.',
      'Facteurs contributifs hiérarchisés selon impact clinique, modifiabilité et pertinence : kinésiophobie/croyances > déconditionnement > posture professionnelle > hypomobilité cervico-thoracique.',
      'Plan multimodal : réassurance, exposition progressive, restauration mobilité cervico-thoracique, contrôle moteur, autonomisation.',
      'Métacognition riche avec identification d\'un biais d\'ancrage initial sur les aspects mécaniques et réflexion sur l\'équilibre passif/actif.',
      'Stratégies alternatives documentées (réorientation médicale, multidisciplinaire, approche douleur chronique).',
    ],

    critique: {
      strengths: [
        'Framework Curtin le mieux développé de la promotion : chaque item justifié textuellement avec nuance.',
        'Hiérarchisation rigoureuse des facteurs contributifs selon 3 critères (impact, modifiabilité, pertinence).',
        'Métacognition excellente : identification d\'un biais d\'ancrage, réflexion sur la dépendance thérapeute-patient.',
        'Approche centrée patient bien décrite : co-construction thérapeutique, décisions adaptées aux objectifs du patient.',
        'Stratégies alternatives clairement définies et argumentées.',
      ],
      weaknesses: [
        'Absence de données chiffrées sur les résultats (pas de scores EVA, NDI, FABQ, TSK rapportés dans le RC).',
        'Hypothèses diagnostiques peu structurées comme catégories formelles du modèle Jones-Curtin.',
        'Pronostic évoqué mais peu développé (une phrase).',
        'Stratégies de recours mentionnées de façon générique sans détail concret.',
        'Pas d\'évaluation objective de l\'efficacité du traitement décrite.',
      ],
    },

    writtenCriteria: null,

    rcCriteria: {
      generer_hypotheses: {
        label: '1. Générer des hypothèses : valider ou adapter',
        aiLevel: 'Avancé',
        aiComment: 'Hypothèses multiples bien justifiées (nociceptive + nociplastique), intégrées dans le raisonnement clinique, testées via bilan clinique et questionnaires (FABQ, TSK). Lien cohérent entre hypothèses et plan de traitement.',
        evidence: { quote: 'La douleur est considérée comme mixte, avec une composante principalement nociceptive liée aux contraintes mécaniques cervicales et professionnelles, associée à une composante nociplastique secondaire [...]. Le niveau de sensibilisation a été estimé comme modéré.', page: 2 },
      },
      appliquer_categories: {
        label: '2. Appliquer les catégories d\'hypothèses (Jones-Curtin)',
        aiLevel: 'Maîtrisé',
        aiComment: 'Modèle de Curtin utilisé avec justification précise pour chaque item. Lien entre les items bien établi. Catégories Jones-Curtin sous-jacentes mais pas explicitement nommées.',
        evidence: { quote: 'Le raisonnement clinique s\'est orienté vers une prise en charge multimodale centrée sur la réassurance, l\'exposition progressive au mouvement, la restauration de la mobilité cervico-thoracique, l\'amélioration du contrôle moteur et l\'autonomisation progressive du patient.', page: 4 },
      },
      prioriser: {
        label: '3. Prioriser ses choix',
        aiLevel: 'Avancé',
        aiComment: 'Priorisation très claire et justifiée selon impact/modifiabilité/pertinence. Hiérarchie explicite : kinésiophobie (primaire) > déconditionnement > posture pro > hypomobilité > contrôle moteur. Temporalité respectée.',
        evidence: { quote: 'Nous avons hiérarchisé ces facteurs en fonction de leur impact clinique, de leur modifiabilité et de leur pertinence dans la prise en charge. [...] Il a un impact très élevé sur la persistance. Les croyances d\'évitement et la kinésiophobie [...] favorisent une diminution de l\'activité, une hypervigilance et une chronicisation.', page: 4 },
      },
      integrer_patient: {
        label: '4. Intégrer (placer le patient au centre)',
        aiLevel: 'Avancé',
        aiComment: 'Perspectives du patient intégrées tout au long : objectifs, vécu, attentes, rythme d\'évolution. Co-construction thérapeutique décrite. Approche biopsychosociale cohérente.',
        evidence: { quote: 'Le patient occupait une place centrale dans le raisonnement collaboratif. Les décisions thérapeutiques ont été construites avec lui en tenant compte de ses objectifs, de son vécu, de ses attentes et de son rythme d\'évolution.', page: 8 },
      },
      sadapter: {
        label: '5. S\'adapter aux nouvelles informations / questions',
        aiLevel: 'Maîtrisé',
        aiComment: 'Adaptation bien documentée (alternatives en cas d\'échec). Évolution du raisonnement vers BPS décrite. Réponse aux questions de l\'examinateur non simulée dans le texte.',
        evidence: { quote: 'En cas d\'évolution insuffisante ou d\'échec thérapeutique, plusieurs alternatives étaient envisagées [...] réorientation médicale, prise en charge multidisciplinaire, approche centrée sur la douleur chronique, accompagnement cognitif plus approfondi.', page: 7 },
      },
      strategies_recours: {
        label: '6. Utiliser des stratégies de recours appropriées',
        aiLevel: 'Acceptable',
        aiComment: 'Au moins 4 stratégies de recours mentionnées mais de façon générique (réorientation médicale, multidisciplinaire, douleur chronique, cognitif). Manque de précision sur les critères déclencheurs.',
        evidence: { quote: 'Une réorientation médicale pouvait être proposée [...]. Une prise en charge multidisciplinaire pouvait également être envisagée [...]. Une approche davantage centrée sur la douleur chronique [...]. Un accompagnement cognitif plus approfondi.', page: 7 },
      },
      auto_evaluer: {
        label: '7. Auto-évaluer le processus cognitif',
        aiLevel: 'Avancé',
        aiComment: 'Métacognition excellente : identification d\'un biais d\'ancrage initial sur le mécanique, réflexion sur l\'équilibre passif/actif, apprentissage concret sur l\'éducation thérapeutique précoce et la dépendance thérapeute.',
        evidence: { quote: 'Ce cas m\'a également permis d\'identifier un biais potentiel de raisonnement, notamment un biais d\'ancrage initial sur les aspects mécaniques des symptômes, qui aurait pu conduire à sous-estimer l\'impact des facteurs psycho-sociaux dans le maintien de la douleur.', page: 8 },
      },
    },

    oralQuestions: [
      'Vous avez identifié un biais d\'ancrage initial sur les aspects mécaniques. Comment avez-vous détecté ce biais en cours de traitement, et qu\'est-ce qui vous a fait changer de perspective ?',
      'Expliquez comment vous avez concrètement appliqué le modèle Jones-Curtin pour catégoriser vos hypothèses diagnostiques.',
      'Votre RC ne contient aucune donnée chiffrée (EVA, NDI, FABQ, TSK). Comment mesuriez-vous l\'efficacité de votre traitement ?',
      'Vous avez hiérarchisé la kinésiophobie comme facteur primaire. Quel outil avez-vous utilisé pour la mesurer et la suivre dans le temps ?',
      'Comment avez-vous géré la demande initiale du patient pour des manipulations alors que votre raisonnement clinique orientait vers une approche active ?',
      'Votre pronostic est évoqué en une phrase. Quels facteurs auraient pu modifier ce pronostic favorablement ou défavorablement ?',
      'Vous mentionnez le contrôle moteur comme facteur à intégrer "une fois que le patient a pris confiance dans le mouvement". Sur quel critère clinique basez-vous cette décision ?',
      'Décrivez comment vous auriez adapté votre plan si le patient avait dû changer de métier en cours de traitement.',
    ],
  },

  triffoy: {
    id: 'triffoy',
    name: 'Triffoy Lucas',
    type: 'TFF+RC',
    tffFile: 'Memoires/LUCAS TRIFFOY TFF -SANS ANNEXE.pdf',
    rcFile: 'Memoires/RC LUCAS TRIFFOY.pdf',
    aiWrittenScore: 15.0,
    aiRcLevel: 'Acceptable-Maîtrisé',

    summary: [
      'Patiente Mme V.V., 50 ans, travaillant à la Commission européenne, cervicalgie non spécifique chronique avec céphalées de tension et profil High Sensitization.',
      'Déficit de contrôle moteur des fléchisseurs profonds cervicaux et dyskinésie scapulaire identifiés à l\'examen clinique.',
      'Questionnaires validés utilisés : FABQ (57→29), Orebro (115→46), HIT-6 (53→42) avec amélioration cliniquement significative.',
      'Approche multimodale en 6 semaines (9 séances) : PAIVMs, SNAGs, auto-SNAGs, Headache SNAGs, MET, renforcement progressif des fléchisseurs profonds cervicaux et ceinture scapulaire.',
      'Résultats excellents : reprise du Pilates, marche sans douleur, amélioration du sommeil, pas de douleurs nocturnes.',
      'RC très succinct (3 pages, bullet points) avec référence "Cfr TFF" pour le cas clinique.',
    ],

    critique: {
      strengths: [
        'TFF bien structuré avec tous les composants attendus.',
        'Choix pertinent de 3 questionnaires (FABQ, Orebro, HIT-6) dont l\'Orebro est peu utilisé dans la promotion.',
        'Discussion solide avec liens bibliographiques bien choisis (Falla 2004, Jull 2008, Bialosky 2009, Corp 2021).',
        'Progression thérapeutique bien décrite et logique (hands-on → renforcement actif).',
        'Consentement éclairé mentionné.',
        'Résultats cliniques probants sur tous les questionnaires.',
      ],
      weaknesses: [
        'RC extrêmement succinct (3 pages, format bullet-point) sans développement argumenté.',
        'RC dit "Cfr TFF" sans décrire le cas — le RC doit être autonome.',
        'Aucune référence bibliographique dans le RC.',
        'Données objectives peu renseignées dans le RC (questionnaires évoqués mais pas les scores).',
        'TFF : tableau Tidier en annexe mais absent du fichier fourni (sans annexes).',
        'Absence de modèle de Curtin dans le TFF (mentionné "en annexe" mais non fourni).',
      ],
    },

    writtenCriteria: {
      titre_mots_cles: {
        label: 'Titre & Mots-clés',
        section: 'Identification et Synthèse',
        maxScore: 0.5,
        aiScore: 0.5,
        aiComment: 'Mention "étude de cas" dans l\'abstract, titre explicite, 5 mots-clés pertinents.',
        evidence: { quote: 'Mots clés : Cervicalgie ; douleur de nuque ; rotation cervicale ; contrôle moteur ; fléchisseurs profonds de la nuque', page: 3 },
      },
      resume: {
        label: 'Résumé (Abstract)',
        section: 'Identification et Synthèse',
        maxScore: 1.5,
        aiScore: 1.5,
        aiComment: 'Structure complète avec tous les composants : type d\'article, description du cas, examen clinique, intervention, résultats, discussion, conclusion.',
        evidence: { quote: 'Type d\'article : étude de cas. – Introduction : Les évidences actuelles concernant la cervicalgie non spécifique privilégient une prise en charge globale [...] – Résultats : Une réduction significative de la douleur et un retour au sport ont été obtenus.', page: 3 },
      },
      introduction: {
        label: 'Introduction',
        section: 'Identification et Synthèse',
        maxScore: 1.0,
        aiScore: 0.75,
        aiComment: 'Justification clinique présente avec références. L\'intérêt spécifique du cas est bien expliqué (richesse des techniques, outils d\'évaluation, dimensions psycho-sociales).',
        evidence: { quote: 'Le choix de ce cas clinique s\'explique par la richesse des techniques utilisées, l\'intérêt des outils d\'évaluation employés au cours du suivi ainsi que la place importante accordée aux dimensions psycho-sociales dans l\'accompagnement de la patiente.', page: 4 },
      },
      anamnese: {
        label: 'Anamnèse',
        section: 'Présentation du Patient et Contexte',
        maxScore: 2.0,
        aiScore: 1.75,
        aiComment: 'Infos démographiques bien décrites, symptômes détaillés avec body chart, antécédents complets. Consentement mentionné. Quelques détails sur les interventions passées pourraient être plus précis.',
        evidence: { quote: 'Madame V. V., 50 ans, travaille pour la Commission européenne dans un emploi essentiellement réalisé sur ordinateur. [...] Le consentement éclairé a été fourni par la patiente et est disponible à la demande.', page: 4 },
      },
      modele_curtin: {
        label: 'Modèle de Curtin',
        section: 'Présentation du Patient et Contexte',
        maxScore: 1.0,
        aiScore: 0.5,
        aiComment: 'Modèle mentionné "en annexe" mais absent du fichier TFF sans annexes fourni. Ne peut être évalué.',
        evidence: { quote: 'Le modèle de Curtin a été réalisé et est disponible en annexe.', page: 5 },
      },
      chronologie: {
        label: 'Chronologie',
        section: 'Présentation du Patient et Contexte',
        maxScore: 1.0,
        aiScore: 0.75,
        aiComment: 'Chronologie présente (1 an de douleurs avec crises récurrentes) mais moins détaillée chronologiquement qu\'attendu.',
        evidence: { quote: 'Elle consulte pour des douleurs au niveau de la nuque présentes depuis environ un an sous forme de crises récurrentes. Jusqu\'à présent, les symptômes disparaissaient généralement après deux à trois semaines. Cette fois-ci, cependant, la douleur persiste malgré les traitements habituels.', page: 4 },
      },
      resultats_cliniques: {
        label: 'Résultats Cliniques',
        section: 'Démarche Diagnostique et Raisonnement',
        maxScore: 1.5,
        aiScore: 1.5,
        aiComment: 'Examen physique très complet : High Sensitization identifié, céphalées de tension (ICHD-3), test ligamentaire, mobilité, fléchisseurs profonds (5 répétitions avant fatigue), dyskinésie scapulaire (McClure), Cluster de Wainner, 3 questionnaires avec scores.',
        evidence: { quote: 'Le test des fléchisseurs profonds a mis en évidence une faible endurance, avec fatigue rapide dès cinq répétitions. [...] L\'évaluation de la dyskinésie scapulaire selon McClure a montré une dysrythmie droite en flexion de l\'épaule. [...] FABQ retrouve un score élevé à 57. L\'Orebro atteint 115/210. Le HIT-6 est à 53.', page: 5 },
      },
      raisonnement: {
        label: 'Raisonnement',
        section: 'Démarche Diagnostique et Raisonnement',
        maxScore: 2.5,
        aiScore: 2.0,
        aiComment: 'Raisonnement solide : profil High Sensitization, lien stress-douleur, fear-avoidance model, diagnostics différentiels (radiculopathie écartée par cluster Wainner négatif). Pronostic peu développé. Enjeux culturels non abordés.',
        evidence: { quote: 'L\'anamnèse a permis de situer la patiente dans un profil de type High Sensitization. Un lien net a été observé entre ses épisodes douloureux et des périodes professionnelles de clôture de dossiers. [...] Le cluster de Wainner a été réalisé pour exclure une radiculopathie cervicale.', page: 5 },
      },
      modalites_tidier: {
        label: 'Modalités (Tidier)',
        section: 'Intervention et Suivi',
        maxScore: 2.5,
        aiScore: 1.5,
        aiComment: 'Techniques décrites (PAIVMs, SNAGs, auto-SNAGs, Headache SNAGs, MET, renforcement). Tableau Tidier absent du fichier fourni (sans annexes). Dosage/intensité partiellement décrits.',
        evidence: { quote: 'À partir de la quatrième séance, des techniques de type SNAG ont été introduites en extension et rotation droite. [...] des Headache SNAGs ont également été réalisés. Des techniques de MET en rotation droite ont également été intégrées.', page: 6 },
      },
      resultats_suivi: {
        label: 'Résultats & Suivi',
        section: 'Intervention et Suivi',
        maxScore: 2.5,
        aiScore: 2.25,
        aiComment: 'Réévaluation complète des 3 questionnaires avec amélioration documentée. Clinique (rotation complète, extension indolore). Épisode de rechute pendant les vacances documenté et utilisé comme outil pédagogique. Observance vérifiée.',
        evidence: { quote: 'Sur le plan des questionnaires, les résultats montrent une amélioration nette. Le score du FABQ est passé de 57 à 29, [...] Le HIT-6 est passé de 53 à 42 [...]. Enfin, le score d\'Orebro a chuté de 115 à 46, plaçant désormais la patiente en dessous du seuil de risque.', page: 7 },
      },
      analyse_critique: {
        label: 'Analyse Critique',
        section: 'Discussion et Éthique',
        maxScore: 2.5,
        aiScore: 2.25,
        aiComment: 'Discussion solide avec lien bibliographique pour chaque point. Rôle de la thérapie manuelle comme "fenêtre d\'adhésion" bien argumenté. Fear-avoidance model intégré. Limites reconnues.',
        evidence: { quote: 'L\'utilisation initiale d\'une approche majoritairement hands-on peut être discutée à la lumière de la littérature. [...] elle a probablement joué un rôle de "fenêtre d\'adhésion", facilitant l\'entrée dans un travail actif progressif, ce qui est cohérent avec les modèles actuels de stratification des patients.', page: 8 },
      },
      perspective_patient: {
        label: 'Perspective Patient',
        section: 'Discussion et Éthique',
        maxScore: 1.0,
        aiScore: 0.75,
        aiComment: 'Point de vue de la patiente intégré (inquiétudes sur la persistance, satisfaction, retour au sport). Pourrait être plus structuré comme section dédiée.',
        evidence: { quote: 'Au-delà de la douleur elle-même, Madame exprime surtout une inquiétude importante face à la persistance des symptômes. [...] La patiente se dit très satisfaite de l\'évolution. Elle se sent désormais capable de mieux gérer ses symptômes.', page: 4 },
      },
      consentement: {
        label: 'Consentement',
        section: 'Discussion et Éthique',
        maxScore: 0.5,
        aiScore: 0.5,
        aiComment: 'Consentement explicitement mentionné dans le TFF.',
        evidence: { quote: 'Le consentement éclairé a été fourni par la patiente et est disponible à la demande.', page: 4 },
      },
    },

    rcCriteria: {
      generer_hypotheses: {
        label: '1. Générer des hypothèses : valider ou adapter',
        aiLevel: 'Acceptable',
        aiComment: 'Hypothèses présentes mais sous forme de bullet-points sans développement. Diagnostic de cervicalgie non spécifique avec composante neurodynamique identifié. Pronostic mentionné brièvement.',
        evidence: { quote: 'C. Mon diagnostic penchait vers une cervicalgie non spécifique avec une composante neurodynamique avec l\'irradiation vers le moignon de l\'épaule. D. Mon pronostic était plutôt favorable car la patiente n\'avait pas de comorbidité ni de drapeaux rouges notables.', page: 2 },
      },
      appliquer_categories: {
        label: '2. Appliquer les catégories d\'hypothèses (Jones-Curtin)',
        aiLevel: 'Insuffisant',
        aiComment: 'Catégories Jones-Curtin non utilisées formellement. Le modèle de Curtin n\'est pas mentionné dans le RC (référencé dans le TFF seulement).',
        evidence: { quote: 'Medical Diagnosis : Non-Specific diagnosis, Cervicalgie non spécifique sans notion de trauma, pas de red flag relevés lors de l\'anamnèse.', page: 1 },
      },
      prioriser: {
        label: '3. Prioriser ses choix',
        aiLevel: 'Acceptable',
        aiComment: 'Priorisation présente : facteur principal identifié (arrêt des activités/mise au repos), croyances et kinésiophobie mentionnées. Peu contextualisée et peu justifiée.',
        evidence: { quote: 'B. Le facteur contribuant le plus important est l\'arrêt des activités et la mise au repos totale des structures. Ils constituent effectivement une priorité dans le traitement et peuvent être abordé dès la première séance.', page: 2 },
      },
      integrer_patient: {
        label: '4. Intégrer (placer le patient au centre)',
        aiLevel: 'Maîtrisé',
        aiComment: 'Patient clairement impliqué et acteur principal. Objectifs négociés. Retour au sport discuté dès la première séance. Place du patient bien décrite.',
        evidence: { quote: 'E. La place de la patiente était centrale. J\'ai essayé de l\'impliquer directement dans son traitement en lui expliquant qu\'elle était l\'actrice principale de sa rééducation et que nous devions travailler ensemble. Nous avons discuté du retour au sport.', page: 3 },
      },
      sadapter: {
        label: '5. S\'adapter aux nouvelles informations / questions',
        aiLevel: 'Acceptable',
        aiComment: 'Adaptation évoquée (introduction du renforcement actif plus tôt possible). Peu développée.',
        evidence: { quote: 'C. Je pourrai aborder le renforcement actif plus tôt dans la rééducation mais au début la demande de la patiente était d\'être mobilisée/manipulée.', page: 3 },
      },
      strategies_recours: {
        label: '6. Utiliser des stratégies de recours appropriées',
        aiLevel: 'Acceptable',
        aiComment: 'Cluster de Wainner mentionné comme outil de différenciation diagnostique. Pas de stratégie de recours thérapeutique documentée.',
        evidence: { quote: 'D. J\'ai décidé de tester le cluster de Wainner concernant la radiculopathie chez cette patiente ce qui n\'était pas forcément nécessaire.', page: 3 },
      },
      auto_evaluer: {
        label: '7. Auto-évaluer le processus cognitif',
        aiLevel: 'Maîtrisé',
        aiComment: 'Autocritique honnête et concrète : reconnaît avoir testé le Wainner inutilement, identifie qu\'il aurait pu introduire le renforcement plus tôt, honnête sur ses limites techniques. Apprentissages clairs.',
        evidence: { quote: 'B. Ce cas clinique m\'a permis de m\'affirmer dans la réalisation de certaines techniques manuelles mais également dans ma capacité à trouver ET donner les outils aux patients. [...] D. J\'ai décidé de tester le cluster de Wainner concernant la radiculopathie chez cette patiente ce qui n\'était pas forcément nécessaire.', page: 2 },
      },
    },

    oralQuestions: [
      'Votre RC dit "Cfr TFF" pour l\'explication du cas. Présentez brièvement la patiente et les éléments cliniques clés en 2 minutes.',
      'Vous avez identifié un profil High Sensitization. Qu\'est-ce que cela implique concrètement pour votre choix de techniques et votre dosage ?',
      'Vous avez utilisé le cluster de Wainner mais estimez que ce n\'était pas nécessaire. Quels critères permettent de décider si ce test est indiqué ?',
      'Comment avez-vous géré la demande de la patiente pour de la manipulation alors que votre raisonnement orientait vers une approche active progressive ?',
      'Expliquez le choix de l\'Orebro par rapport au FABQ. Quelles dimensions évalue-t-il en plus ?',
      'Votre RC est très succinct comparé à votre TFF. Que faudrait-il ajouter pour en faire un RC cliniquement exploitable par un autre praticien ?',
      'Vous avez utilisé des Headache SNAGs. Sur quels critères diagnostiques avez-vous basé cette décision ?',
      'Quelles catégories d\'hypothèses du modèle Jones-Curtin avez-vous explorées, même si vous ne les nommez pas explicitement dans votre RC ?',
    ],
  },

  issa: {
    id: 'issa',
    name: 'Issa David',
    type: 'TFF+RC',
    tffFile: 'Memoires/Travail de fin de formation CUTM TTF+RC.pdf',
    rcFile: 'Memoires/Travail de fin de formation CUTM TTF+RC.pdf',
    aiWrittenScore: 19.5,
    aiRcLevel: 'Avancé',

    summary: [
      'Patient M. R.X., 33 ans, informaticien et grimpeur, céphalée cervicogénique chronique avec croyances catastrophistes nourries par une IRM ("usure cervicale précoce").',
      'Diagnostic précis : dysfonction segmentaire C1-C2 droite confirmée par FRT positif à 28° (cut-off 32°) et PAIVMs, déficit fléchisseurs profonds (DNFET 21s vs normes 39s).',
      'Traitement multimodal sur 10 semaines : PAIVMs, traction cervicale, SNAG Mulligan, exercices fléchisseurs profonds, éducation thérapeutique, ergonomie.',
      'Résultats exceptionnels : HIT-6 65→48 (MCIC dépassé), NDI 22→10 (MCID dépassé), TSK-11 32→22 (MCID dépassé), FRT 28°→37° (passage test positif à négatif).',
      'Tableau Tidier complet (12 items), bibliographie solide avec MCID rapportés, consentement éclairé documenté.',
      'Métacognition très riche : biais initial identifié (sur l\'articulaire C1-C2), pistes d\'amélioration concrètes (Stabilizer, Örebro, PSFS).',
    ],

    critique: {
      strengths: [
        'Travail le plus rigoureux de la promotion — structure, rigueur et profondeur exemplaires.',
        'Questionnaires validés avec MCID rapportés et comparés aux seuils (HIT-6, NDI, TSK-11) : approche EBP exemplaire.',
        'Raisonnement diagnostique nuancé : FRT croisé avec PAIVMs, nuance sur le ligament alaire (Rodríguez-Sanz 2021).',
        'Tableau Tidier le plus complet (12/12 items documentés).',
        'Discussion bibliographique pertinente et récente (Jull 2002, Johnston 2021, Nakashima 2015).',
        'RC très développé avec métacognition profonde et biais d\'ancrage identifié.',
      ],
      weaknesses: [
        'Lieu d\'intervention non mentionné dans le tableau Tidier (item 7 : N/A non justifié).',
        'CCFT non réalisable sans Stabilizer — substitution par DNFET justifiée mais constitue une limite.',
        'Absence d\'évaluation formelle des blue flags (mentionné en métacognition comme point à améliorer).',
        'NDI initial légèrement incohérent entre la valeur en % (44%) dans un tableau et le texte (22/50).',
      ],
    },

    writtenCriteria: {
      titre_mots_cles: {
        label: 'Titre & Mots-clés',
        section: 'Identification et Synthèse',
        maxScore: 0.5,
        aiScore: 0.5,
        aiComment: 'Titre avec "étude de cas", sujet explicite, 5 mots-clés pertinents et spécifiques.',
        evidence: { quote: 'Mots-Clés : cervicalgie chronique / céphalée cervicogénique / thérapie manuelle / contrôle moteur cervical / présentation de cas', page: 3 },
      },
      resume: {
        label: 'Résumé (Abstract)',
        section: 'Identification et Synthèse',
        maxScore: 1.5,
        aiScore: 1.5,
        aiComment: 'Structure complète et précise : contexte, objectif, examen clinique (avec résultats chiffrés), diagnostic, intervention, résultats (avec questionnaires), discussion, conclusion. Exemplaire.',
        evidence: { quote: 'Contexte : Cette étude de cas s\'intéresse à la prise en charge multimodale d\'une céphalée cervicogénique chronique [...] Examen clinique : L\'examen a mis en évidence une dysfonction segmentaire C1-C2 droite confirmée par les PAIVMs et un FRT positif à 28°, un déficit d\'endurance des fléchisseurs profonds au DNFET (21 secondes) et une kinésiophobie marquée au TSK-11.', page: 3 },
      },
      introduction: {
        label: 'Introduction',
        section: 'Identification et Synthèse',
        maxScore: 1.0,
        aiScore: 1.0,
        aiComment: 'Justification excellente : prévalence des cervicalgies en Belgique (8%), lien cervicalgie-céphalée (ICHD-3), prévalence CGH (0.17-4%), intérêt du cas (discordance IRM/clinique). Références récentes et pertinentes.',
        evidence: { quote: 'En Belgique, 8 % de la population adulte rapporte des douleurs cervicales, ce qui en fait l\'une des six pathologies chroniques les plus fréquemment rapportées dans le pays. [...] Sa prévalence annuelle est estimée entre 0,17 et 4 % de la population adulte mondiale (ICHD-3, 2018).', page: 3 },
      },
      anamnese: {
        label: 'Anamnèse',
        section: 'Présentation du Patient et Contexte',
        maxScore: 2.0,
        aiScore: 2.0,
        aiComment: 'Anamnèse complète et exemplaire : infos démographiques anonymisées, 3 zones douloureuses avec body chart détaillé, antécédents complets, yellow flags identifiés, contexte IRM et croyances catastrophistes documentés.',
        evidence: { quote: 'Monsieur R.X, 33 ans, vit avec sa compagne. [...] La prise occasionnelle de paracétamol et d\'AINS est sans efficacité sur ses douleurs. [...] Son médecin traitant a prescrit une IRM cervicale mettant en évidence une "rectitude cervicale" et une "discopathie débutante C5-C6". Sur cette base, il a évoqué une "usure cervicale précoce".', page: 4 },
      },
      modele_curtin: {
        label: 'Modèle de Curtin',
        section: 'Présentation du Patient et Contexte',
        maxScore: 1.0,
        aiScore: 1.0,
        aiComment: 'Modèle de Curtin présent dans les deux parties (TFF p.10 et RC p.32) avec justification textuelle complète pour chaque item.',
        evidence: { quote: '[Figure Musculoskeletal Clinical Translation Framework complétée, avec justification détaillée par item dans la partie RC]', page: 10 },
      },
      chronologie: {
        label: 'Chronologie',
        section: 'Présentation du Patient et Contexte',
        maxScore: 1.0,
        aiScore: 1.0,
        aiComment: 'Chronologie précise : consultation initiale 22 avril 2025, évolution sur 10 semaines jusqu\'au 2 juillet 2025, jalons clairs.',
        evidence: { quote: 'Il consulte le 22 avril 2025 avec une prescription de 18 séances pour des cervicalgies associées à des céphalées évoluant depuis deux ans, jusque-là bien contrôlées. Depuis environ 4 semaines, ces symptômes se sont exacerbés.', page: 4 },
      },
      resultats_cliniques: {
        label: 'Résultats Cliniques',
        section: 'Démarche Diagnostique et Raisonnement',
        maxScore: 1.5,
        aiScore: 1.5,
        aiComment: 'Examen clinique exemplaire : SNNOOP10, neurologique complet (ULNT, réflexes), postural (FHP), mobilité active, PAIVMs C1-C2, FRT (28° vs 42°), DNFET (21s), palpation. Résultats chiffrés et interprétés.',
        evidence: { quote: 'Les PAIVMs (Passive Accessory Intervertebral Movements) en grade 3 ont mis en évidence une sensibilité accrue au niveau de l\'articulation C1-C2. [...] FRT, positif à droite à 28° (versus 42° à gauche), avec reproduction de la céphalée familière sous-occipitale droite. Cette valeur, inférieure au cut-off de 32°.', page: 8 },
      },
      raisonnement: {
        label: 'Raisonnement',
        section: 'Démarche Diagnostique et Raisonnement',
        maxScore: 2.5,
        aiScore: 2.5,
        aiComment: 'Raisonnement exemplaire : mécanismes "input/output/processing" identifiés, nuance sur FRT (ligament alaire), diagnostics différentiels implicites (CGH vs migraine via ICHD-3), enjeux psychosociaux et professionnels, pronostic favorable justifié.',
        evidence: { quote: 'Chez ce patient, plusieurs mécanismes semblaient s\'entrecroiser. D\'une part, un mécanisme de douleur "input" de nature nociceptive mécanique [...]. À cela s\'ajoutait un mécanisme "output" [...] Une composante "processing" s\'y est greffée, à travers la kinésiophobie marquée.', page: 13 },
      },
      modalites_tidier: {
        label: 'Modalités (Tidier)',
        section: 'Intervention et Suivi',
        maxScore: 2.5,
        aiScore: 2.25,
        aiComment: 'Tableau Tidier le plus complet (12/12 items). Types d\'intervention détaillés, dosage précis, progression décrite. Item 7 (lieu) marqué N/A sans justification.',
        evidence: { quote: 'La prise en charge s\'est déroulée sur 10 semaines, à raison de 2 séances par semaine, puis 1 séance par semaine lors des 3 dernières semaines. [...] flexion cranio-cervicale chin in (3 × 10 répétitions, 2 fois par jour), étirements du trapèze supérieur droit après chaque heure de travail.', page: 11 },
      },
      resultats_suivi: {
        label: 'Résultats & Suivi',
        section: 'Intervention et Suivi',
        maxScore: 2.5,
        aiScore: 2.5,
        aiComment: 'Résultats exemplaires avec MCID rapportés pour chaque questionnaire. FRT et DNFET réévalués. Épisode de rechute documenté et utilisé. Observance vérifiée (montrée en séance). Effets indésirables rapportés.',
        evidence: { quote: 'Les trois questionnaires ont tous dépassé leur différence minimale cliniquement importante : le HIT-6 (MCIC = 8 points, Castien et al., 2012), le NDI (MCID = 5,5 points, Young et al., 2019) et la TSK-11 (MCID = 4 points, Woby et al., 2005).', page: 12 },
      },
      analyse_critique: {
        label: 'Analyse Critique',
        section: 'Discussion et Éthique',
        maxScore: 2.5,
        aiScore: 2.5,
        aiComment: 'Discussion exemplaire : mécanismes input/output/processing, lien avec la littérature (Jull 2002, Johnston 2021, Nakashima 2015), adaptation vs interdiction de l\'escalade, limites clairement reconnues.',
        evidence: { quote: 'Ces résultats restent toutefois à interpréter avec prudence : un suivi de dix semaines ne permet pas de confirmer le maintien des bénéfices à long terme. [...] L\'éducation thérapeutique autour des croyances liées à l\'IRM [...] ont été déterminantes dans cette évolution.', page: 13 },
      },
      perspective_patient: {
        label: 'Perspective Patient',
        section: 'Discussion et Éthique',
        maxScore: 1.0,
        aiScore: 1.0,
        aiComment: 'Perspective du patient complète : demandes (soulagement rapide, reprise escalade, retour travail), co-construction des objectifs, évolution de ses croyances intégrée.',
        evidence: { quote: 'Il est en demande active de stratégies de soulagement à court terme, mais cherche surtout à retrouver une autonomie à long terme face à sa douleur. [...] Le patient a trois attentes principales : avoir une réduction de ses douleurs assez rapidement, pouvoir reprendre l\'escalade.', page: 5 },
      },
      consentement: {
        label: 'Consentement',
        section: 'Discussion et Éthique',
        maxScore: 0.5,
        aiScore: 0.5,
        aiComment: 'Consentement éclairé explicitement mentionné avec détail sur l\'utilisation anonymisée des données.',
        evidence: { quote: 'Monsieur R.X a été informé du contenu de la prise en charge proposée. Il a donné son consentement libre et éclairé, y compris pour l\'utilisation anonymisée de ses données dans le cadre de ce case report.', page: 6 },
      },
    },

    rcCriteria: {
      generer_hypotheses: {
        label: '1. Générer des hypothèses : valider ou adapter',
        aiLevel: 'Avancé',
        aiComment: 'Hypothèses multiples, catégories bien définies (input/output/processing), validées via tests objectifs (PAIVMs, FRT, DNFET, questionnaires). Pronostic nuancé avec facteurs favorables et défavorables.',
        evidence: { quote: 'La dysfonction segmentaire C1-C2 était sans doute déjà présente mais peu symptomatique jusqu\'à l\'augmentation de la charge psychique [...]. Une composante "processing" s\'y est greffée, à travers la kinésiophobie marquée (TSK-11 à 32), les croyances catastrophistes nourries par l\'imagerie.', page: 37 },
      },
      appliquer_categories: {
        label: '2. Appliquer les catégories d\'hypothèses (Jones-Curtin)',
        aiLevel: 'Avancé',
        aiComment: 'Modèle de Curtin utilisé dans les deux parties avec justification textuelle très détaillée. Lien entre les items naturellement établi. Correspondance avec Jones-Curtin cohérente.',
        evidence: { quote: '[Modèle Curtin p.32 du fichier avec justification de chaque item : "Cognitif : élevé. TSK-11 à 32/44 (kinésiophobie cliniquement significative), croyances catastrophistes..."]', page: 32 },
      },
      prioriser: {
        label: '3. Prioriser ses choix',
        aiLevel: 'Avancé',
        aiComment: 'Priorisation très claire : surcharge professionnelle + yellow flags (éducation thérapeutique primaire) > déficit contrôle moteur > articulaire C1-C2. Objectifs à court/moyen/long terme bien définis avec critères mesurables.',
        evidence: { quote: 'La surcharge professionnelle ainsi que les yellow flags semblent être les facteurs les plus contributifs [...]. La majorité des facteurs étaient modifiables via l\'éducation thérapeutique, les exercices de contrôle moteur et la reprise progressive des activités évitées.', page: 34 },
      },
      integrer_patient: {
        label: '4. Intégrer (placer le patient au centre)',
        aiLevel: 'Avancé',
        aiComment: 'Patient au centre de toutes les décisions. Objectifs co-construits (escalade adaptée vs interdite). Programme allégé pour respecter la charge professionnelle. Suivi des exercices renforcé après rechute.',
        evidence: { quote: 'Les préférences du patient ont structuré la prise en charge. Le programme d\'exercices à réaliser à domicile avait été allégé pour respecter sa charge professionnelle de même que l\'escalade qui a été adaptée plutôt qu\'interdite.', page: 37 },
      },
      sadapter: {
        label: '5. S\'adapter aux nouvelles informations / questions',
        aiLevel: 'Maîtrisé',
        aiComment: 'Adaptation documentée suite à la rechute post-vacances (renforcement du suivi des exercices, vérification en séance). Progression des techniques selon évolution.',
        evidence: { quote: 'L\'épisode de recrudescence à la 6ᵉ semaine [...] a confirmé que les bénéfices obtenus dépendaient directement de la régularité du programme à domicile [...]. À partir de là, j\'ai été plus rigoureux dans le suivi : j\'ai [...] demandé au patient de me les montrer en séance.', page: 35 },
      },
      strategies_recours: {
        label: '6. Utiliser des stratégies de recours appropriées',
        aiLevel: 'Maîtrisé',
        aiComment: 'Plusieurs stratégies documentées : réorientation médicale, prise en charge multidisciplinaire, approche douleur chronique, accompagnement cognitif. Critères déclencheurs précisés.',
        evidence: { quote: 'Oui, certaines stratégies d\'adaptation ont été utilisées [...]. Lorsque les symptômes augmentaient temporairement, surtout après la période de vacances, le traitement a été réorienté vers l\'éducation thérapeutique, la gestion de la charge et une reprise progressive des exercices.', page: 36 },
      },
      auto_evaluer: {
        label: '7. Auto-évaluer le processus cognitif',
        aiLevel: 'Avancé',
        aiComment: 'Métacognition exemplaire : biais initial identifié (sur articulaire C1-C2), limites de l\'évaluation (Stabilizer absent, Örebro manquant), PSFS comme outil plus adapté, biais de confirmation sur l\'imagerie reconnu.',
        evidence: { quote: 'Lors de l\'arrivée du patient avec son diagnostic médical, j\'ai surtout pensé à une atteinte structurelle au départ [...]. J\'aurais aimé disposer d\'un Stabilizer pour réaliser un CCFT plutôt que de me limiter au DNFET [...]. J\'envisagerais également d\'utiliser un questionnaire plus spécifique aux activités du patient comme la Patient Specific Functional Scale.', page: 37 },
      },
    },

    oralQuestions: [
      'Vous avez utilisé le DNFET à la place du CCFT. Expliquez les différences entre ces deux tests et ce que vous auriez appris de plus avec le CCFT.',
      'Votre FRT était positif à 28°. Si les PAIVMs avaient été négatifs, comment auriez-vous interprété ce résultat selon Rodríguez-Sanz et al. 2021 ?',
      'Comment avez-vous abordé la croyance catastrophiste liée à l\'IRM ("usure cervicale précoce") dès la première séance — quel était votre discours ?',
      'Vous avez choisi d\'adapter l\'escalade plutôt que de l\'interdire. Quels critères ont guidé cette décision et comment avez-vous suivi la reprise ?',
      'Expliquez les mécanismes "input/output/processing" que vous avez identifiés chez ce patient et comment ils ont influencé votre plan de traitement.',
      'Votre patient avait 3 attentes distinctes. Comment avez-vous priorisé entre soulagement immédiat, reprise de l\'escalade et retour au travail ?',
      'Quels questionnaires supplémentaires (Örebro, PSFS) auriez-vous utilisé avec le recul, et qu\'auraient-ils apporté de plus ?',
      'Comment expliquez-vous que l\'épisode de rechute pendant les vacances ait finalement été bénéfique pour la suite du traitement ?',
      'La gabapentine n\'a pas amélioré les symptômes de votre patient Issa — quel aurait été votre message à son médecin traitant ?',
      'Décrivez comment vous avez équilibré thérapie manuelle passive et exercices actifs au fil des 10 semaines.',
    ],
  },

  brzustowski: {
    id: 'brzustowski',
    name: 'Brzustowski Valentin',
    type: 'TFF+RC',
    tffFile: 'Memoires/TFF- Valentin BRZUSTOWSKI.pdf',
    rcFile: 'Memoires/RC - Valentin BRZUSTOWSKI.pdf',
    aiWrittenScore: 17.0,
    aiRcLevel: 'Maîtrisé-Avancé',

    summary: [
      'Patiente de 29 ans, co-gérante d\'un magasin (60-70h/sem, 7j/7), myalgie du masséter droit associée à un déplacement discal réductible (DTM).',
      'Contexte psychosocial très chargé : GAD-7 = 18/21 (anxiété sévère), PHQ-9 = 12/27 (dépression modérée), OBC = 36/84 (bruxisme diurne).',
      'Diagnostic basé sur DC/TMD : myalgie (palpation masséter + contraction isométrique) + DDR (test d\'élimination antérieur positif).',
      'Traitement en 6 semaines (6 séances) : éducation thérapeutique, mobilisations accessoires ATM, trigger points masséter, exercices OB + MWM Mulligan, exercices actifs région cervicale supérieure.',
      'Résultats favorables : douleur 5/10→2/10, fréquence 7j/7→2j/sem, irradiations disparues, GCPS Grade 4→Grade 1. Claquement persistant mais asymptomatique.',
      'Orientation psychologique conseillée (patiente réceptive mais reportée par manque de temps).',
    ],

    critique: {
      strengths: [
        'Seul travail de la promotion sur les DTM — originalité et expertise spécifique (DC/TMD, GCPS, JFLS, OBC, GAD-7, PHQ-9).',
        'Questionnaires validés très appropriés au contexte DTM, bien interprétés et réévalués.',
        'Explication exemplaire de la dissociation claquement/douleur (claquement persistant mais asymptomatique).',
        'Tableau Tidier complet avec photos de chaque technique (figures annotées).',
        'Consentement éclairé documenté.',
        'Orientation psychologique proposée de façon éthique et adaptée.',
      ],
      weaknesses: [
        'TFF rédigé en double colonne avec formatage parfois difficile à lire.',
        'Absence de résumé structuré selon le format attendu (deux colonnes résumé/abstract en anglais et français séparées).',
        'Discussion aurait pu approfondir la relation DTM-cervicalgie (lien anatomique via convergence trigémino-cervicale).',
        'Suivi trop court (6 semaines) pour une pathologie chronique avec composante psychologique importante.',
        'Impact de la santé mentale (GAD-7/PHQ-9) sur le pronostic peu développé dans la discussion.',
      ],
    },

    writtenCriteria: {
      titre_mots_cles: {
        label: 'Titre & Mots-clés',
        section: 'Identification et Synthèse',
        maxScore: 0.5,
        aiScore: 0.5,
        aiComment: '"étude de cas" dans le titre, sujet explicite, mots-clés pertinents au domaine DTM.',
        evidence: { quote: 'MOTS CLÉS : désordre temporo-mandibulaire / myalgie / Déplacement discale réductible / thérapie manuelle orthopédique / étude de cas', page: 3 },
      },
      resume: {
        label: 'Résumé (Abstract)',
        section: 'Identification et Synthèse',
        maxScore: 1.5,
        aiScore: 1.5,
        aiComment: 'Résumé et abstract bilingues complets avec tous les composants requis. Structure exemplaire.',
        evidence: { quote: 'Résumé : Contexte / Objectif / Examen clinique / Intervention thérapeutique / Résultat / Conclusion — tous présents et développés.', page: 3 },
      },
      introduction: {
        label: 'Introduction',
        section: 'Identification et Synthèse',
        maxScore: 1.0,
        aiScore: 1.0,
        aiComment: 'Introduction bien documentée avec épidémiologie DTM (4% incidence US, 8% Allemagne, 2x plus fréquent chez femmes), justification du cas, conformité CARE.',
        evidence: { quote: 'L\'incidence est estimée à environ 4 % de la population chaque année aux États-Unis [...] et la prévalence est d\'environ 8 % en Allemagne [...]. Cette prévalence est environ deux fois plus élevée chez les femmes. [...] Cette étude de cas a été rédigée conformément aux lignes directrices CARE.', page: 4 },
      },
      anamnese: {
        label: 'Anamnèse',
        section: 'Présentation du Patient et Contexte',
        maxScore: 2.0,
        aiScore: 2.0,
        aiComment: 'Anamnèse très complète : 4 zones douloureuses (pain drawing), comportements para-fonctionnels documentés (OBC), antécédent fracture vertébrale, consentement, contexte professionnel détaillé.',
        evidence: { quote: 'La patiente est co-gérante d\'un magasin avec sa mère depuis la reprise du commerce de son oncle il y a six mois. [...] Son rythme de travail est intense, totalisant entre 60 et 70 heures hebdomadaires en travaillant 7j/7.', page: 8 },
      },
      modele_curtin: {
        label: 'Modèle de Curtin',
        section: 'Présentation du Patient et Contexte',
        maxScore: 1.0,
        aiScore: 1.0,
        aiComment: 'Modèle de Curtin complété dans le RC avec justification textuelle pour chaque item. Bien intégré.',
        evidence: { quote: '[Modèle de Curtin présent dans le RC, annexe 1 du TFF] Facteurs cognitifs : Croyance qu\'une technique va remettre en place le disque déplacé. [...] Facteurs affectifs : facteurs d\'anxiété très importants liés à son travail.', page: 7 },
      },
      chronologie: {
        label: 'Chronologie',
        section: 'Présentation du Patient et Contexte',
        maxScore: 1.0,
        aiScore: 0.75,
        aiComment: 'Chronologie présente (appareil dentaire 21-22 ans → claquement depuis 3-4 ans → douleurs depuis 3 mois → consultation mars 2026). Pourrait être plus structurée sous forme de tableau.',
        evidence: { quote: 'La patiente a porté un appareil dentaire vers l\'âge de 21-22 ans, retiré trois ans plus tard. Elle situe l\'apparition du claquement à cette période. [...] La patiente est venue me trouver à mon cabinet en mars 2026.', page: 4 },
      },
      resultats_cliniques: {
        label: 'Résultats Cliniques',
        section: 'Démarche Diagnostique et Raisonnement',
        maxScore: 1.5,
        aiScore: 1.5,
        aiComment: 'Examen clinique complet et adapté aux DTM : OB (>40mm), déviation corrigée, OB répétées avec EVA, test d\'élimination antérieur positif, contraction isométrique masséter, palpation, MWM Mulligan, screening vasculaire/neurologique.',
        evidence: { quote: 'L\'ouverture buccale (OB) ne présente pas de limitation d\'amplitude; > 40 mm [...]. L\'OB accompagnée d\'une technique de "mobilisation with movement" [...] permet à la patiente une OB max répétée sans douleur et sans claquement. [...] Le test d\'élimination antérieur est positif, orientant vers un déplacement discal réductible.', page: 3 },
      },
      raisonnement: {
        label: 'Raisonnement',
        section: 'Démarche Diagnostique et Raisonnement',
        maxScore: 2.5,
        aiScore: 2.0,
        aiComment: 'Raisonnement solide basé sur DC/TMD. Questionnaires bien interprétés. Distinction DDR vs myalgie bien faite. Pronostic favorable nuancé par anxiété. Enjeux psychosociaux bien pris en compte. Diagnostics différentiels implicites mais pas explicitement listés.',
        evidence: { quote: 'Le diagnostic principal retenu était une myalgie, probablement liée à une surcharge mécanique induite par les parafonctions, associée à un déplacement discal réductible [...]. Le pronostic était favorable, bien que nuancé par l\'anxiété et la charge de travail importante.', page: 9 },
      },
      modalites_tidier: {
        label: 'Modalités (Tidier)',
        section: 'Intervention et Suivi',
        maxScore: 2.5,
        aiScore: 2.25,
        aiComment: 'Tableau Tidier présent (annexe 2) avec photos illustrant chaque technique. 12 items documentés. Dosage et procédures très bien décrits. Quelques items du Tidier partiellement remplis.',
        evidence: { quote: 'Nous avons effectué 1 première séance bilan de 1 heure puis 5 séances de 30 minutes, 2 séances la première semaine puis 1 par semaine les 4 semaines suivantes. [...] mobilisations passives accessoires rythmiques de l\'ATM [...], trigger points du masséter en intra- et extra-buccal [...], OB avec MWM postéro-antériorisation.', page: 8 },
      },
      resultats_suivi: {
        label: 'Résultats & Suivi',
        section: 'Intervention et Suivi',
        maxScore: 2.5,
        aiScore: 2.0,
        aiComment: 'Résultats documentés (GCPS, JFLS, EVA, fréquence). Score GCPS 33 (Grade 1). Claquement persistant mais asymptomatique bien documenté. Amélioration bien-être général. Absence de MCID rapportés pour le GCPS.',
        evidence: { quote: 'La douleur globale a diminué, avec des pics douloureux atteignant au maximum 6/10 et une intensité moyenne de 2/10 lorsqu\'elle est présente. La fréquence des symptômes s\'est également fortement réduite, ceux-ci survenant désormais au maximum deux jours par semaine. [...] score GCPS est désormais de 33, correspondant à un niveau de douleur faible (Low pain) sans incapacité (stade I).', page: 9 },
      },
      analyse_critique: {
        label: 'Analyse Critique',
        section: 'Discussion et Éthique',
        maxScore: 2.5,
        aiScore: 2.0,
        aiComment: 'Discussion solide avec bibliographie DTM récente. Forces/limites identifiées. Dissociation claquement/douleur bien argumentée. Lien facteurs hormonaux/professionnels/émotionnels reconnu. Manque lien anatomique DTM-cervicalgie.',
        evidence: { quote: 'Le claquement articulaire n\'a pas diminué de manière significative, malgré la disparition de la douleur associée à l\'ouverture buccale répétée. Ce résultat est intéressant, car il souligne la dissociation possible entre les bruits articulaires et la douleur.', page: 10 },
      },
      perspective_patient: {
        label: 'Perspective Patient',
        section: 'Discussion et Éthique',
        maxScore: 1.0,
        aiScore: 0.75,
        aiComment: 'Objectifs de la patiente bien intégrés (disparition douleur/claquement, outils d\'autogestion, reprise sport). Perspective sur les traitements reçus peu développée.',
        evidence: { quote: 'La patiente souhaite faire disparaître le claquement et atteindre une absence de douleur. Elle exprime également le besoin de mieux comprendre son problème et d\'acquérir des outils d\'auto-gestion pour soulager ses symptômes.', page: 8 },
      },
      consentement: {
        label: 'Consentement',
        section: 'Discussion et Éthique',
        maxScore: 0.5,
        aiScore: 0.5,
        aiComment: 'Consentement éclairé explicitement documenté.',
        evidence: { quote: 'La patiente a donné son consentement éclairé pour l\'utilisation anonyme de ses informations dans le cadre de cette étude de cas.', page: 11 },
      },
    },

    rcCriteria: {
      generer_hypotheses: {
        label: '1. Générer des hypothèses : valider ou adapter',
        aiLevel: 'Avancé',
        aiComment: 'Hypothèses bien construites (myalgie + DDR), testées via DC/TMD et MWM Mulligan. Pronostic nuancé. Distinction DDR (ancienneté) / myalgie (stress actuel) bien argumentée.',
        evidence: { quote: 'Le diagnostic principal retenu était une myalgie, probablement liée à une surcharge mécanique induite par les parafonctions, associée à un déplacement discal réductible présent depuis plusieurs années et responsable d\'un claquement articulaire.', page: 9 },
      },
      appliquer_categories: {
        label: '2. Appliquer les catégories d\'hypothèses (Jones-Curtin)',
        aiLevel: 'Maîtrisé',
        aiComment: 'Modèle de Curtin utilisé et bien justifié. Douleur nociceptive mécanique bien catégorisée selon le modèle. Liens naturels entre items.',
        evidence: { quote: 'Type de douleur : Nociceptive car accentuée par certains mouvements et en lien avec la charge soumise au niveau de l\'ATM. Caractéristiques : Douleurs mécaniques car dépendantes du mouvement et dépendantes de la charge, déclenchées par les parafonctions.', page: 7 },
      },
      prioriser: {
        label: '3. Prioriser ses choix',
        aiLevel: 'Maîtrisé',
        aiComment: 'Facteurs contributifs priorisés (travail/stress > affectifs/sociaux > sédentarité). Objectifs à court/moyen/long terme clairs. Réalisme sur les facteurs non modifiables.',
        evidence: { quote: 'Les facteurs contribuant les plus importants étaient liés au travail, au niveau de stress très élevé et à l\'humeur dépressive modérée. [...] Tous ces facteurs n\'étaient pas modifiables, notamment la charge et le volume de travail.', page: 8 },
      },
      integrer_patient: {
        label: '4. Intégrer (placer le patient au centre)',
        aiLevel: 'Avancé',
        aiComment: 'Patient au centre : objectifs, croyances, liens stress-douleur identifiés par la patiente elle-même, autonomie favorisée. Rôle d\'accompagnant décrit.',
        evidence: { quote: 'La patiente a occupé une place centrale dans le raisonnement clinique. Ses objectifs, ses croyances, ses observations concernant les liens entre stress et douleur, ainsi que ses priorités de vie, ont orienté l\'ensemble du traitement. Mon rôle a été celui d\'un accompagnant visant à favoriser l\'autonomie.', page: 10 },
      },
      sadapter: {
        label: '5. S\'adapter aux nouvelles informations / questions',
        aiLevel: 'Maîtrisé',
        aiComment: 'Surveillance de l\'évolution des symptômes en lien avec le stress documentée. Adaptation du traitement selon l\'irritabilité. Réponse aux questions via questionnaires validés (GAD-7, PHQ-9).',
        evidence: { quote: 'Au cours des séances suivantes, j\'ai surveillé l\'évolution de l\'intensité, de la fréquence et de la présence éventuelle d\'irradiations. J\'ai également observé la tolérance à la mastication d\'aliments durs, la capacité de la patiente à identifier et réduire ses comportements para-fonctionnels.', page: 9 },
      },
      strategies_recours: {
        label: '6. Utiliser des stratégies de recours appropriées',
        aiLevel: 'Maîtrisé',
        aiComment: 'Orientation psychologique clairement proposée et documentée. Utilisation du DC/TMD comme recours diagnostique structuré.',
        evidence: { quote: 'Compte tenu des scores élevés au GAD-7 et au PHQ-9 [...] un suivi psychologique a été envisagé. La patiente s\'est montrée réceptive à cette proposition et a exprimé sa volonté de consulter un psychologue, mais cette démarche a été reportée par manque de temps.', page: 10 },
      },
      auto_evaluer: {
        label: '7. Auto-évaluer le processus cognitif',
        aiLevel: 'Maîtrisé',
        aiComment: 'Métacognition solide : reconnaît sa première prise en charge DTM, appris l\'importance du DC/TMD, tendance à promouvoir rapidement les exercices actifs identifiée comme biais personnel, objectivation de l\'adhérence à améliorer.',
        evidence: { quote: 'Concernant la prise en charge des DTM, il s\'agissait de la première fois que je prenais en charge une patiente présentant une problématique de l\'articulation temporo-mandibulaire. [...] Si je devais reprendre ce cas, j\'aborderais plus précocement la possibilité d\'un accompagnement psychologique et j\'objectiverais davantage l\'adhésion de la patiente.', page: 10 },
      },
    },

    oralQuestions: [
      'Votre patiente travaille 60-70h par semaine avec anxiété sévère (GAD-7 = 18/21). Comment avez-vous abordé cette composante psychologique dans le cadre de votre rôle de kinésithérapeute ?',
      'Expliquez la différence clinique entre la myalgie et le déplacement discal réductible, et comment le traitement diffère pour chacun.',
      'La technique MWM Mulligan supprime immédiatement la douleur à l\'ouverture buccale. Quel mécanisme explique cet effet selon vous ?',
      'Le claquement persiste en fin de traitement mais est devenu asymptomatique. Comment l\'expliquez-vous à votre patiente ?',
      'Comment avez-vous évalué le niveau d\'anxiété et de dépression ? Ces outils ont-ils une valeur diagnostique ou de dépistage seulement ?',
      'Votre patiente avait interrompu tout sport depuis 6 mois. Comment avez-vous intégré la reprise d\'activité physique dans votre plan de traitement ?',
      'Quel lien anatomique y a-t-il entre les DTM et les douleurs cervicales supérieures ?',
      'Quels critères vous auraient fait référer cette patiente à un dentiste ou orthodontiste ?',
      'Vous avez conseillé d\'éviter les aliments durs pendant 2 semaines. Quelle est la justification clinique de cette recommandation ?',
    ],
  },

  brandt: {
    id: 'brandt',
    name: 'Brandt Anthony',
    type: 'TFF+RC',
    tffFile: 'Memoires/TFF CUTM Brandt Anthony.pdf',
    rcFile: 'Memoires/Raisonnement clinique Brandt Anthony.pdf',
    aiWrittenScore: 14.5,
    aiRcLevel: 'Acceptable-Maîtrisé',

    summary: [
      'Patient homme de 27 ans, ingénieur civil, céphalées cervicogéniques probables avec raideur cervicale depuis 2 ans dans un contexte de sédentarité et faible adhésion aux exercices.',
      'Originalité : adaptation de la prise en charge à un patient peu demandeur — simplification du langage (céphalée cervicogénique = "mal de tête qui vient du cou"), réduction du nombre d\'exercices.',
      'FRT non restrictif mais reproduisant les sensations céphalalgiques familières. "Chin-in" en maintien déclenchant les symptômes.',
      'Résultats sur 8 séances / 4 mois : NDI 18→8, FABQ 42→11, céphalées 1 épisode/2 jours → 1/semaine. Reprise progressive du golf.',
      'Article rédigé avec aide de ChatGPT (déclaré dans le travail) à fins rédactionnelles.',
      'RC très bien structuré avec framework Curtin complet et métacognition riche.',
    ],

    critique: {
      strengths: [
        'Approche originale et bien réfléchie pour un patient peu motivé : simplification des messages thérapeutiques.',
        'RC parmi les mieux structurés de la promotion : décision making structuré en 8 items (a à h), métacognition approfondie.',
        'Biais de raisonnement identifiés (biais de confirmation sur CGH, sous-estimation initiale des facteurs psychosociaux).',
        'Discussion solide avec limites honnêtement documentées (biais d\'auto-déclaration, facteurs vacances).',
        'Consentement éclairé documenté.',
      ],
      weaknesses: [
        'Utilisation de ChatGPT déclarée — peut questioner l\'authenticité rédactionnelle.',
        'FRT peu concluant (pas de restriction d\'amplitude mais reproduction symptomatique) — diagnostic de CGH moins certain.',
        'Discussion trop courte sur les diagnostics différentiels (céphalée de tension, migraine).',
        'FABQ utilisé pour les CGH — validité discutée dans la littérature pour ce contexte.',
        'Absence d\'évaluation de l\'adhésion objective aux exercices.',
        'Tableau Tidier peu développé (beaucoup de colonnes vides dans le fichier annexe).',
      ],
    },

    writtenCriteria: {
      titre_mots_cles: {
        label: 'Titre & Mots-clés',
        section: 'Identification et Synthèse',
        maxScore: 0.5,
        aiScore: 0.5,
        aiComment: '"étude de cas" dans le titre, sujet explicite, 5 mots-clés pertinents.',
        evidence: { quote: 'Mots-clés : Cervicalgie ; céphalées cervicogéniques ; thérapie manuelle ; éducation thérapeutique ; sédentarité', page: 2 },
      },
      resume: {
        label: 'Résumé (Abstract)',
        section: 'Identification et Synthèse',
        maxScore: 1.5,
        aiScore: 1.25,
        aiComment: 'Résumé structuré avec composants principaux. Les résultats chiffrés sont inclus. L\'originalité du cas est explicitée.',
        evidence: { quote: 'Cas d\'un patient de 27 ans présentant des cervicalgies avec céphalées cervicogéniques dans un contexte de sédentarité et de faible adhésion aux exercices. [...] la fréquence des céphalées a diminué à un épisode par semaine, la mobilité cervicale s\'est améliorée et les scores fonctionnels se sont améliorés (NDI : 18 → 8 ; FABQ : 42 → 11).', page: 2 },
      },
      introduction: {
        label: 'Introduction',
        section: 'Identification et Synthèse',
        maxScore: 1.0,
        aiScore: 0.75,
        aiComment: 'Introduction avec épidémiologie (prévalence 27/1000 en 2019, CGH 3.9%) et justification du cas. Références pertinentes. L\'intérêt clinique de l\'approche éducative aurait pu être davantage développé.',
        evidence: { quote: 'Les céphalées cervicogéniques, dites céphalées secondaires, se caractérisent par des douleurs projetées vers la tête à partir de structures cervicales [...]. Ces dernières constituent une prévalence de 3,9% dans une population générale (Robinson et al. 2025).', page: 3 },
      },
      anamnese: {
        label: 'Anamnèse',
        section: 'Présentation du Patient et Contexte',
        maxScore: 2.0,
        aiScore: 1.5,
        aiComment: 'Anamnèse complète avec body chart, antécédents, contexte psychosocial. Consentement documenté. Manque quelques précisions sur les symptômes dans les différentes positions/activités.',
        evidence: { quote: 'Le patient est un homme de 27 ans, ingénieur civil, consultant pour des douleurs cervicales [...]. Il ne fume pas, consomme peu d\'alcool (1 verre par semaine) et dort globalement bien. Il pratiquait auparavant le golf à bon niveau, mais a interrompu cette activité depuis environ un an.', page: 3 },
      },
      modele_curtin: {
        label: 'Modèle de Curtin',
        section: 'Présentation du Patient et Contexte',
        maxScore: 1.0,
        aiScore: 1.0,
        aiComment: 'Modèle de Curtin présent dans le RC et en annexe du TFF, avec justification textuelle de chaque item.',
        evidence: { quote: '[Modèle de Curtin - Annexe 1 du TFF : profil mixte, sédentarité importante, stress professionnel modéré, facteurs psychosociaux modérés]', page: 14 },
      },
      chronologie: {
        label: 'Chronologie',
        section: 'Présentation du Patient et Contexte',
        maxScore: 1.0,
        aiScore: 0.75,
        aiComment: 'Chronologie présente en bullet-points (enfance, -2 ans, -1.5 ans, avant prise en charge, prise en charge). Claire et suffisante.',
        evidence: { quote: 'Il y a environ 2 ans : apparition progressive de raideur cervicale associée à des céphalées. Il y a environ 1 an et demi : changement de poste vers un travail plus sédentaire et stressant. Intensification des céphalées.', page: 5 },
      },
      resultats_cliniques: {
        label: 'Résultats Cliniques',
        section: 'Démarche Diagnostique et Raisonnement',
        maxScore: 1.5,
        aiScore: 1.25,
        aiComment: 'Examen complet : drapeaux rouges (HOT, Sharp-Purser, Alar), neurologiques, posturaux, amplitudes actives, mobilisations passives, FRT (non restrictif mais symptomatique), Cluster Wainner (négatif), palpation.',
        evidence: { quote: 'Le Flexion-Rotation Test (FRT) ne met pas en évidence de restriction nette d\'amplitude entre les deux côtés, mais la mise en position de flexion cervicale suivie des rotations semble réévoquer les sensations céphalalgiques habituelles du patient.', page: 5 },
      },
      raisonnement: {
        label: 'Raisonnement',
        section: 'Démarche Diagnostique et Raisonnement',
        maxScore: 2.5,
        aiScore: 1.75,
        aiComment: 'Diagnostic de CGH probable bien argumenté. Diagnostics différentiels discutés (céphalée de tension, migraine). Pronostic avec facteurs favorables et défavorables identifiés. Manque d\'analyse plus approfondie des enjeux psychosociaux dans le raisonnement.',
        evidence: { quote: 'L\'hypothèse diagnostique principale retenue était celle de céphalées cervicogéniques, sur base de plusieurs éléments compatibles [...]. Des diagnostics différentiels ont été envisagés. Une céphalée de tension pouvait être discutée en raison du caractère bilatéral "en casque", tandis qu\'une composante migraineuse restait possible.', page: 6 },
      },
      modalites_tidier: {
        label: 'Modalités (Tidier)',
        section: 'Intervention et Suivi',
        maxScore: 2.5,
        aiScore: 1.75,
        aiComment: 'Techniques décrites (mobilisations cervicales hautes, trigger points, Head SNAG, pauses actives). Tableau Tidier présent en annexe. Originalité de la simplification du langage documentée.',
        evidence: { quote: 'Les auto-exercices proposés ont volontairement été limités, simples et facilement intégrables dans la routine quotidienne. [...] Un exercice spécifique de type Head SNAG a été prescrit à raison de 15 à 20 répétitions, une fois par jour dans un premier temps. Une vidéo explicative lui a été transmise.', page: 7 },
      },
      resultats_suivi: {
        label: 'Résultats & Suivi',
        section: 'Intervention et Suivi',
        maxScore: 2.5,
        aiScore: 2.0,
        aiComment: 'NDI et FABQ avec valeurs initiales et finales. Évolution céphalées documentée. Épisode vacances et son effet documenté. Adhésion progressive décrite. Manque MCID explicitement rapportés.',
        evidence: { quote: 'L\'évolution fonctionnelle a été évaluée à l\'aide du Neck Disability Index (NDI) et du Fear-Avoidance Beliefs Questionnaire (FABQ). Le NDI est passé de 18/50 à 8/50 [...], indiquant une diminution du retentissement fonctionnel des cervicalgies. Le FABQ a diminué de 42/66 à 11/66.', page: 8 },
      },
      analyse_critique: {
        label: 'Analyse Critique',
        section: 'Discussion et Éthique',
        maxScore: 2.5,
        aiScore: 2.0,
        aiComment: 'Discussion solide avec limites honnêtement documentées (auto-déclaration, biais sélection, facteurs vacances). Liens bibliographiques pertinents. Discordance questionnaires/discours identifiée.',
        evidence: { quote: 'Une limite importante concerne la dépendance aux déclarations du patient. [...] Il n\'a pas été possible de vérifier objectivement son niveau réel d\'adhésion aux exercices ni leur régularité en dehors des séances.', page: 9 },
      },
      perspective_patient: {
        label: 'Perspective Patient',
        section: 'Discussion et Éthique',
        maxScore: 1.0,
        aiScore: 1.0,
        aiComment: 'Perspective du patient très bien développée : appréciation des messages simples, absence de pression excessive, satisfaction finale, regain d\'autonomie.',
        evidence: { quote: 'Il a particulièrement apprécié le fait que les conseils et exercices proposés soient simples, concrets et facilement intégrables dans son quotidien. [...] En fin de prise en charge, il se disait satisfait de l\'évolution observée, notamment en raison de la diminution de la fréquence des céphalées.', page: 11 },
      },
      consentement: {
        label: 'Consentement',
        section: 'Discussion et Éthique',
        maxScore: 0.5,
        aiScore: 0.5,
        aiComment: 'Consentement éclairé documenté.',
        evidence: { quote: 'Le patient a donné son consentement éclairé pour l\'utilisation anonymisée de ses données cliniques dans le cadre de cette étude de cas.', page: 11 },
      },
    },

    rcCriteria: {
      generer_hypotheses: {
        label: '1. Générer des hypothèses : valider ou adapter',
        aiLevel: 'Maîtrisé',
        aiComment: 'Hypothèse principale (CGH probable) bien argumentée via FRT, mouvements actifs et reproduction symptomatique. Hypothèses alternatives explorées (céphalée tension, migraine). Pronostic favorable avec facteurs défavorables reconnus.',
        evidence: { quote: 'Céphalée cervicogénique probable associée à une dysfonction cervicale mécanique, avec possible composante mixte. [...] Pronostic favorable à moyen terme en raison de l\'âge, de l\'absence de drapeaux rouges et du potentiel de réversibilité des facteurs mécaniques et comportementaux. Facteurs défavorables : chronicité et faible adhérence initiale.', page: 2 },
      },
      appliquer_categories: {
        label: '2. Appliquer les catégories d\'hypothèses (Jones-Curtin)',
        aiLevel: 'Maîtrisé',
        aiComment: 'Modèle Curtin bien complété et justifié. Profil mixte (nociceptive cervicale + possible sensibilisation). Lien entre items cohérent.',
        evidence: { quote: 'Profil mixte. Composante nociceptive cervicale (raideur, structures sous-occipitales, reproduction des symptômes aux tests mécaniques). Possible sensibilisation centrale (chronification, fluctuation, influence stress/posture).', page: 1 },
      },
      prioriser: {
        label: '3. Prioriser ses choix',
        aiLevel: 'Maîtrisé',
        aiComment: 'Facteurs contributifs priorisés (sédentarité > raideur cervicale > faible adhésion > stress pro). Objectifs à court/moyen/long terme bien définis avec indicateurs mesurables.',
        evidence: { quote: 'Court terme : Réduire la fréquence des céphalées de manière à passer d\'un épisode tous les deux jours à moins que cela [...]. Moyen terme : Améliorer la mobilité cervicale et diminuer le retentissement fonctionnel des symptômes, avec une réduction du score NDI [...].', page: 2 },
      },
      integrer_patient: {
        label: '4. Intégrer (placer le patient au centre)',
        aiLevel: 'Avancé',
        aiComment: 'Patient au centre via approche collaborative. Objectifs fonctionnels intégrés (reprise golf). Adaptation du discours et des exercices aux besoins du patient peu motivé. Éducation thérapeutique comme levier central.',
        evidence: { quote: 'Le patient a été placé au centre du processus décisionnel via une approche collaborative. Ses objectifs fonctionnels ont été intégrés dans la prise en charge et régulièrement réévalués. L\'éducation thérapeutique a permis de faire évoluer ses représentations.', page: 5 },
      },
      sadapter: {
        label: '5. S\'adapter aux nouvelles informations / questions',
        aiLevel: 'Maîtrisé',
        aiComment: 'Réévaluation systématique documentée (FRT, mouvements actifs, questionnaires). Ajustement exercices selon réponse. Utilisation de l\'épisode vacances comme enseignement.',
        evidence: { quote: 'Réévaluation systématique de la reproduction des symptômes via FRT, mouvements actifs, et exercices spécifiques (chin-in, SNAG). Ajustement progressif des exercices en fonction de la réponse du patient.', page: 2 },
      },
      strategies_recours: {
        label: '6. Utiliser des stratégies de recours appropriées',
        aiLevel: 'Maîtrisé',
        aiComment: 'Approche multimodale utilisée comme stratégie de recours. Discussions avec collègues et recherche Pubmed documentées. Simplification des consignes comme stratégie d\'adhésion.',
        evidence: { quote: 'Approche multimodale : thérapie manuelle, éducation thérapeutique, exercices progressifs, simplification des consignes pour améliorer l\'adhésion. Des discussions avec des collègues et des recherches dans les cours + Pubmed ont également aidé à la prise en charge.', page: 3 },
      },
      auto_evaluer: {
        label: '7. Auto-évaluer le processus cognitif',
        aiLevel: 'Avancé',
        aiComment: 'Métacognition très développée : biais de confirmation (CGH), sous-estimation initiale facteurs psychosociaux, mesure objective de l\'adhésion à améliorer, discordance questionnaires/discours identifiée et analysée.',
        evidence: { quote: 'Un biais de confirmation a pu être présent en faveur de l\'hypothèse de céphalée cervicogénique, compte tenu des éléments mécaniques retrouvés à l\'examen. Par ailleurs, une sous-estimation initiale des facteurs psychosociaux a pu limiter la profondeur de l\'analyse au début de la prise en charge.', page: 4 },
      },
    },

    oralQuestions: [
      'Votre diagnostic de CGH est "probable". Quels éléments manquaient pour confirmer ce diagnostic et quels examens complémentaires auraient pu vous aider ?',
      'Comment avez-vous concrètement simplifié votre langage thérapeutique ? Donnez 3 exemples de reformulations que vous avez utilisées.',
      'L\'utilisation de ChatGPT pour la rédaction est déclarée. Quelles précautions avez-vous prises pour garantir l\'exactitude clinique du contenu ?',
      'Le FABQ a été utilisé dans le contexte des CGH. La discussion mentionne que cet outil n\'est pas validé pour ce diagnostic — pourquoi l\'avez-vous choisi et quelle alternative aurait été plus adaptée ?',
      'L\'épisode vacances a réduit les céphalées significativement. Comment cela influence-t-il votre interprétation des résultats du traitement ?',
      'Votre patient était peu motivé et peu inquiet. Comment avez-vous créé une alliance thérapeutique avec un patient qui dit "j\'aurais probablement pu vivre avec sans traitement" ?',
      'Le Head SNAG est votre technique principale. Sur quel niveau cervical le réalisez-vous et quelle est la justification biomécanique ?',
      'Comment distinguez-vous cliniquement une céphalée cervicogénique d\'une céphalée de tension chez ce patient ?',
    ],
  },

  goffaux: {
    id: 'goffaux',
    name: 'Goffaux Marie',
    type: 'TFF+RC',
    tffFile: 'Memoires/TFE - Marie Goffaux.pdf',
    rcFile: 'Memoires/TFE - Marie Goffaux.pdf',
    aiWrittenScore: 17.5,
    aiRcLevel: 'Avancé',

    summary: [
      'Patiente Mme F.S., 45 ans, service de stérilisation hospitalière, cervico-brachialgie droite chronique depuis 10 ans, origine indéterminée malgré bilan exhaustif (IRM, EMG, EMG, échographies doppler, examen neurologique).',
      'ULNT1 positif, phénomène de wind-up au dermatome C4 (sensibilisation centrale), puis cluster de Wainner 4/4 en phase aiguë d\'octobre 2025.',
      'Traitement phasé sur 6 mois : phase aiguë (sliders nerf médian, SNAGs, downslope), phase subaiguë (MET, PAIVMs, renforcement scapulaire), phase fonctionnelle (tensioners, manipulations cervico-thoraciques, renforcement progressif).',
      'Résultats exceptionnels : EVA 8→1/10, amplitudes (rotation 40°→90°), force MRC 4/5→5/5, NDI 42%→13%, Örebro 72%→42%.',
      'Wind-up persistant malgré l\'amélioration globale — indication d\'un mécanisme de sensibilisation centrale résiduel.',
      'Travail le plus complexe de la promotion : 10 ans d\'évolution, bilan complémentaire négatif, gestion multi-phases.',
    ],

    critique: {
      strengths: [
        'Cas clinique le plus complexe de la promotion avec excellente gestion de l\'incertitude diagnostique.',
        'Approche phasée exemplaire (aiguë/subaiguë/fonctionnelle) avec adaptation selon irritabilité.',
        'Questionnaires très complets et appropriés : NDI, Örebro (peu utilisé), LANSS, DN4, tableau comparatif clinique.',
        'Discussion très documentée avec bibliographie récente et pertinente (Cuenca-Martínez 2022, García-Juez 2025, Gillot 2025).',
        'Modèle de Curtin complet avec justification de la composante nociplastique.',
        'Biais d\'ancrage identifié (cluster de Wainner 4/4 → radiculopathie) et analyse critique approfondie.',
      ],
      weaknesses: [
        'Absence de Tableau Tidier dans la partie TFF principale (référencé en annexe).',
        'Consentement mentionné en annexe ("fourni sur demande") mais non formellement intégré dans le texte.',
        'Wind-up persistant en fin de traitement non discuté en termes de prognose à long terme.',
        'Perspective du patient développée mais pourrait être plus formalisée comme section dédiée.',
        'Chronologie complexe (2 périodes de soins) aurait mérité un tableau récapitulatif.',
      ],
    },

    writtenCriteria: {
      titre_mots_cles: {
        label: 'Titre & Mots-clés',
        section: 'Identification et Synthèse',
        maxScore: 0.5,
        aiScore: 0.5,
        aiComment: 'Titre explicite avec "étude de cas", mots-clés spécifiques et bien choisis pour le domaine.',
        evidence: { quote: 'MOTS CLÉS : Cervico-brachialgie / thérapie manuelle / chronique / nociplastique / neurodynamique', page: 1 },
      },
      resume: {
        label: 'Résumé (Abstract)',
        section: 'Identification et Synthèse',
        maxScore: 1.5,
        aiScore: 1.5,
        aiComment: 'Résumé complet avec tous les composants. Unicité du cas bien expliquée (discordance clinique/imagerie). Résultats chiffrés inclus.',
        evidence: { quote: 'Introduction : La cervico-brachialgie est une affection fréquente en kinésithérapie dont la prise en charge dépend du contexte clinique et biopsychosocial du patient. L\'imagerie n\'explique pas toujours les symptômes observés. [...] Résultats : Après six mois de traitement, la patiente rapporte une diminution importante des douleurs ainsi qu\'une amélioration de sa qualité de vie.', page: 1 },
      },
      introduction: {
        label: 'Introduction',
        section: 'Identification et Synthèse',
        maxScore: 1.0,
        aiScore: 1.0,
        aiComment: 'Introduction justifiant clairement l\'intérêt du cas (discordance clinique/imagerie, absence de gold standard diagnostic) avec références récentes (Peene 2023, García-Juez 2025, Gillot 2025).',
        evidence: { quote: 'À ce jour, il n\'existe aucun diagnostic "gold standard" clairement établi pour les douleurs radiculaires cervicales (Peene et al., 2023). Ce cas illustre une présentation complexe, ressemblant initialement un syndrome du défilé thoracique, sans confirmation malgré plusieurs examens médicaux.', page: 1 },
      },
      anamnese: {
        label: 'Anamnèse',
        section: 'Présentation du Patient et Contexte',
        maxScore: 2.0,
        aiScore: 1.75,
        aiComment: 'Anamnèse riche : contexte professionnel et culturel, 10 ans d\'évolution, 4 zones douloureuses avec body chart codifié (M.Laslett), traitements antérieurs détaillés. Consentement en annexe (moins visible que si mentionné dans le corps).',
        evidence: { quote: 'Madame F.S., âgée de 45 ans, présente depuis environ dix ans une cervico-brachialgie droite d\'origine indéterminée. [...] Depuis 2018, elle travaille au sein du service de stérilisation d\'un hôpital, un emploi physique impliquant des ports de charges répétés.', page: 2 },
      },
      modele_curtin: {
        label: 'Modèle de Curtin',
        section: 'Présentation du Patient et Contexte',
        maxScore: 1.0,
        aiScore: 1.0,
        aiComment: 'Modèle de Curtin présent et bien justifié (TFF p.4 et RC p.29), avec justification de la composante nociplastique/mixte et des facteurs psychosociaux modérés.',
        evidence: { quote: 'La douleur semble présenter des mécanismes mixtes à dominance nociplastique. [...] Les facteurs cognitifs semblent modérés. [...] Les facteurs affectifs sont modérés également. [...] Les facteurs sociaux sont élevés en raison d\'un travail physique impliquant des ports de charges répétés.', page: 30 },
      },
      chronologie: {
        label: 'Chronologie',
        section: 'Présentation du Patient et Contexte',
        maxScore: 1.0,
        aiScore: 0.75,
        aiComment: 'Chronologie présente avec deux périodes de soins clairement identifiées (juin 2025 et octobre 2025-avril 2026). Tableau des examens complémentaires très utile. Aurait bénéficié d\'un tableau chronologique récapitulatif.',
        evidence: { quote: 'La patiente consulte une première fois au cabinet en juin 2025 [...]. Trois mois plus tard, la patiente revient au cabinet dans un contexte de crise aiguë très invalidante (8/10), nécessitant un arrêt de travail. [Tableau d\'examens complémentaires p.7]', page: 2 },
      },
      resultats_cliniques: {
        label: 'Résultats Cliniques',
        section: 'Démarche Diagnostique et Raisonnement',
        maxScore: 1.5,
        aiScore: 1.5,
        aiComment: 'Examen le plus complet de la promotion : ULNT1-2-3, cluster de Wainner, PAIVMs/PPIVMs, contrôle moteur cervical et scapulaire, myofascial, test Roos, examen sensitif (grosses et petites fibres, wind-up), MRC, tableau comparatif juin/octobre 2025.',
        evidence: { quote: 'L\'examen neurodynamique mettait en évidence un ULNT1 positif à droite reproduisant les symptômes de la patiente [...]. L\'examen des petites fibres (algésie) révélait un phénomène de sommation temporelle ("wind up") et une hypersensibilité importante au niveau du dermatome C4 droit.', page: 5 },
      },
      raisonnement: {
        label: 'Raisonnement',
        section: 'Démarche Diagnostique et Raisonnement',
        maxScore: 2.5,
        aiScore: 2.25,
        aiComment: 'Raisonnement très sophistiqué : hypothèses successives (douleur neuropathique→radiculopathie→TOS→cervico-brachialgie non spécifique avec nociplastique), bilan complémentaire négatif intégré. LANSS et DN4 utilisés pour exclure neuropathique. Pronostic nuancé selon phase.',
        evidence: { quote: 'La piste articulaire a aussi été écartée grâce au test de différenciation articulaire versus neuro-musculaire via l\'élévation de l\'épaule droite lors de la rotation cervicale droite (symptômes diminués). [...] La piste du syndrome du défilé thoracique a cependant été écartée par l\'imagerie (échographie-doppler).', page: 9 },
      },
      modalites_tidier: {
        label: 'Modalités (Tidier)',
        section: 'Intervention et Suivi',
        maxScore: 2.5,
        aiScore: 2.0,
        aiComment: 'Techniques décrites de façon phasée (aiguë/subaiguë/fonctionnelle) avec progression claire. Tableau Tidier en annexe (complet, 12 items). Dosage présent mais moins précis que dans d\'autres travaux.',
        evidence: { quote: 'Phase aiguë : techniques neurodynamiques (sliders nerf médian ULNT1, 2 séries de 15 répétitions, 2x/jour), downslope à droite, SNAGs, auto-SNAGs, travail myofascial, traction cervicale. Phase subaiguë : MET, upslope, PAIVMS/UPAIVMS.', page: 10 },
      },
      resultats_suivi: {
        label: 'Résultats & Suivi',
        section: 'Intervention et Suivi',
        maxScore: 2.5,
        aiScore: 2.25,
        aiComment: 'Tableau comparatif complet (EVA, amplitudes, MRC, contrôle moteur, palpation, cluster Wainner, wind-up, Örebro, NDI). Évolution très favorable. Wind-up persistant bien documenté.',
        evidence: { quote: '[Tableau SUIVI ET RÉSULTATS : EVA 8/10→1/10 ; Rotation cervicale 40°→90° ; MRC 4/5→5/5 ; Cluster Wainner 4/4→0/4 ; NDI 42%→13% ; Örebro 72%→42% ; Wind Up : Oui→Oui]', page: 12 },
      },
      analyse_critique: {
        label: 'Analyse Critique',
        section: 'Discussion et Éthique',
        maxScore: 2.5,
        aiScore: 2.25,
        aiComment: 'Discussion très documentée avec liens bibliographiques récents. Mécanismes nociplastiques bien analysés. Efficacité de la kinésithérapie vs gabapentine documentée. Limites (wind-up persistant) reconnues.',
        evidence: { quote: 'La présence d\'un phénomène de sommation temporelle ("wind up") lors de l\'examen neurologique semble soutenir cette hypothèse de sensibilisation élevée du système nociceptif. [...] À l\'inverse, la prise en charge kinésithérapeutique semble avoir contribué à une amélioration importante de la douleur et de la fonction.', page: 14 },
      },
      perspective_patient: {
        label: 'Perspective Patient',
        section: 'Discussion et Éthique',
        maxScore: 1.0,
        aiScore: 0.75,
        aiComment: 'Perspective de la patiente présente dans le texte (objectifs, inquiétudes, motivation). Section dédiée absente. Pourrait être plus formalisée.',
        evidence: { quote: 'Son principal motif d\'inquiétude concerne la perte d\'autonomie fonctionnelle ainsi que la peur de lâcher certains objets en raison d\'une sensation de faiblesse du membre supérieur droit. [...] la patiente est restée active tout au long de la prise en charge, ce qui a probablement favorisé la récupération fonctionnelle progressive.', page: 15 },
      },
      consentement: {
        label: 'Consentement',
        section: 'Discussion et Éthique',
        maxScore: 0.5,
        aiScore: 0.25,
        aiComment: 'Consentement mentionné en annexe ("fourni sur demande du jury") mais absent du corps du texte principal.',
        evidence: { quote: '1. La patiente a donné son consentement pour le travail (fourni sur demande du jury). [Annexe 1]', page: 16 },
      },
    },

    rcCriteria: {
      generer_hypotheses: {
        label: '1. Générer des hypothèses : valider ou adapter',
        aiLevel: 'Avancé',
        aiComment: 'Raisonnement diagnostique par exclusion très sophistiqué : hypothèses successives validées/invalidées (neuropathique via DN4/LANSS, radiculopathie via cluster Wainner, TOS via Roos/imagerie, articulaire via test différenciation). Pronostic nuancé selon phase.',
        evidence: { quote: 'Lors du premier bilan [...] l\'hypothèse initiale s\'orientait davantage vers des tensions myofasciales [...]. Lors de l\'exacerbation d\'octobre 2025, [...] l\'hypothèse d\'une radiculopathie cervicale. Un syndrome du défilé thoracique a également été envisagé [...]. Toutefois, l\'absence d\'éléments objectifs [...] a progressivement orienté le raisonnement vers une cervico-brachialgie non spécifique.', page: 31 },
      },
      appliquer_categories: {
        label: '2. Appliquer les catégories d\'hypothèses (Jones-Curtin)',
        aiLevel: 'Avancé',
        aiComment: 'Modèle Curtin très bien justifié avec nuance sur la composante nociplastique dominante. Mécanismes mixtes analysés finement. Lien naturel entre items établi.',
        evidence: { quote: 'La douleur semble présenter des mécanismes mixtes à dominance nociplastique. Une composante nociceptive est probable [...]. La composante nociplastique semble être dominante au vu de la chronicité des symptômes et de la présence d\'un phénomène de sommation temporelle.', page: 30 },
      },
      prioriser: {
        label: '3. Prioriser ses choix',
        aiLevel: 'Avancé',
        aiComment: 'Priorisation claire et adaptée à l\'irritabilité : phase aiguë (modulation symptomatique), subaiguë (mobilité + contrôle moteur), fonctionnelle (renforcement + autonomisation). Objectifs à court/moyen/long terme bien définis.',
        evidence: { quote: 'À court terme, l\'objectif principal visait une modification rapide des symptômes [...]. À moyen terme, le traitement visait à maintenir un niveau de douleur tolérable tout en améliorant progressivement la mobilité cervicale [...]. À long terme, les objectifs devenaient davantage fonctionnels.', page: 33 },
      },
      integrer_patient: {
        label: '4. Intégrer (placer le patient au centre)',
        aiLevel: 'Avancé',
        aiComment: 'Patiente au centre de toutes les décisions : objectifs personnels (travailler sans douleur, autonomie), adaptation selon irritabilité et contraintes professionnelles. Approche collaborative décrite.',
        evidence: { quote: 'La patiente occupait une place centrale dans la prise en charge. Les décisions thérapeutiques ont été adaptées à ses objectifs, à son niveau d\'irritabilité et à son vécu. Son retour constant concernant l\'efficacité des séances [...] a guidé les adaptations thérapeutiques.', page: 34 },
      },
      sadapter: {
        label: '5. S\'adapter aux nouvelles informations / questions',
        aiLevel: 'Avancé',
        aiComment: 'Adaptation exemplaire : approche "high irritability/high SIN" documentée, réévaluation constante des hypothèses, évolution du traitement selon la phase clinique, utilisation des examens complémentaires négatifs pour adapter le raisonnement.',
        evidence: { quote: 'Lors de la réévaluation d\'octobre 2025, la symptomatologie était fortement irritable (EVA 8/10). Le traitement a donc été adapté selon une approche "high irritability / high SIN", privilégiant des techniques peu provocatrices.', page: 31 },
      },
      strategies_recours: {
        label: '6. Utiliser des stratégies de recours appropriées',
        aiLevel: 'Avancé',
        aiComment: 'Stratégies interdisciplinaires documentées (médecin généraliste, neurologue). Recherche bibliographique complémentaire (neuroplasticité, sensibilisation centrale). Infiltration évitée grâce à l\'évolution favorable.',
        evidence: { quote: 'Des stratégies interdisciplinaires ont été mises en place tout au long de la prise en charge. Des échanges réguliers ont eu lieu avec la médecin généraliste et le neurologue via des rapports cliniques [...]. Une infiltration initialement prévue est finalement annulée en raison d\'une diminution importante des douleurs.', page: 33 },
      },
      auto_evaluer: {
        label: '7. Auto-évaluer le processus cognitif',
        aiLevel: 'Avancé',
        aiComment: 'Métacognition exceptionnelle : biais d\'ancrage identifié (cluster Wainner 4/4 → radiculopathie surinterprétée), intégration précoce de la composante nociplastique à améliorer, mesures fonctionnelles répétées à développer.',
        evidence: { quote: 'J\'ai identifié un biais d\'ancrage. Lors de l\'aggravation clinique d\'octobre 2025, la présence d\'un cluster de Wainner positif à 4/4 m\'a rapidement orientée vers une hypothèse de radiculopathie cervicale. [...] Les résultats négatifs des examens complémentaires et l\'évolution clinique m\'ont progressivement amenée à réévaluer mes hypothèses.', page: 34 },
      },
    },

    oralQuestions: [
      'Vos examens complémentaires sont tous négatifs mais le patient présente un tableau clinique évocateur de radiculopathie. Comment gérez-vous cette discordance en consultation et dans votre communication avec la patiente ?',
      'Vous avez identifié un phénomène de wind-up au dermatome C4. Qu\'est-ce que cela implique pour votre traitement et pourquoi ce phénomène persiste-t-il en fin de traitement ?',
      'Expliquez comment vous avez utilisé le test de différenciation articulaire vs neuro-musculaire (élévation épaule) pour orienter votre raisonnement.',
      'Vous avez utilisé à la fois le LANSS et le DN4 pour exclure une composante neuropathique. Quelles sont les différences entre ces deux outils ?',
      'L\'approche phasée (aiguë/subaiguë/fonctionnelle) est centrale dans votre travail. Sur quels critères cliniques basez-vous le passage d\'une phase à l\'autre ?',
      'La gabapentine n\'a pas amélioré les symptômes. Quel était votre message à la médecin généraliste à ce sujet ?',
      'Votre patiente a interrompu le traitement en juillet 2025 puis est revenue en crise en octobre 2025. Comment avez-vous géré cette rechute et qu\'en avez-vous appris ?',
      'L\'Örebro initial est à 72% (risque élevé d\'incapacité). Comment avez-vous intégré ce résultat dans votre plan de traitement ?',
      'Vous avez évité l\'utilisation du terme "nociplastique" avec votre patiente. Comment expliquez-vous ce type de douleur en langage accessible ?',
      'Le wind-up persiste à la fin du traitement. Quelle est votre recommandation pour la suite de la prise en charge de cette patiente ?',
    ],
  },

};
```

- [ ] **Step 2: Verify data.js loads without syntax errors**

Open `index.html` in Chrome, open DevTools Console (F12), run: `console.log(Object.keys(STUDENTS_DATA))` — expected: `['baudart', 'mora', 'triffoy', 'issa', 'brzustowski', 'brandt', 'goffaux']`

- [ ] **Step 3: Commit data.js**

```
git add data.js
git commit -m "feat: add complete AI analysis for all 7 CUTM students in data.js"
```

---

## Task 3 — index.html: SPA shell structure

**Files:**
- Write: `index.html`

- [ ] **Step 1: Write index.html**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Évaluation Mémoires CUTM 2026</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  <!-- HEADER -->
  <header class="app-header">
    <div class="header-left">
      <button id="btn-home" class="btn-icon" title="Retour au tableau de bord">🏠</button>
      <h1 id="app-title">Mémoires CUTM 2026</h1>
    </div>
    <div class="header-right">
      <button id="btn-compare" class="btn-secondary">Comparaison</button>
      <button id="btn-save" class="btn-primary">💾 Sauvegarder</button>
    </div>
  </header>

  <!-- MAIN CONTENT: views are shown/hidden via JS -->
  <main id="app-main">

    <!-- VIEW: Dashboard -->
    <section id="view-dashboard" class="view active">
      <h2>Tableau de bord — 7 étudiants</h2>
      <div id="students-grid" class="students-grid">
        <!-- JS renders student cards here -->
      </div>
    </section>

    <!-- VIEW: Compare -->
    <section id="view-compare" class="view">
      <h2>Comparaison des étudiants</h2>
      <div id="compare-table-container"></div>
    </section>

    <!-- VIEW: Student detail -->
    <section id="view-student" class="view">
      <div class="student-header">
        <h2 id="student-name-title"></h2>
        <span id="student-type-badge" class="badge"></span>
      </div>

      <!-- Tabs -->
      <nav class="tabs" id="student-tabs">
        <button class="tab-btn active" data-tab="analyse">Analyse</button>
        <button class="tab-btn" data-tab="ecrit" id="tab-ecrit-btn">Grille écrite</button>
        <button class="tab-btn" data-tab="oral">Grille orale</button>
        <button class="tab-btn" data-tab="questions">Examen oral</button>
      </nav>

      <!-- Tab: Analyse -->
      <div id="tab-analyse" class="tab-content active">
        <div class="two-col">
          <div>
            <h3>Résumé IA</h3>
            <ul id="summary-list" class="bullet-list"></ul>
          </div>
          <div>
            <h3>Critique IA</h3>
            <div class="critique-block">
              <h4 class="strengths-title">✓ Points forts</h4>
              <ul id="strengths-list" class="bullet-list strengths"></ul>
              <h4 class="weaknesses-title">✗ Points faibles</h4>
              <ul id="weaknesses-list" class="bullet-list weaknesses"></ul>
            </div>
          </div>
        </div>
        <div class="notes-section">
          <h3>Mes notes générales</h3>
          <textarea id="global-notes" class="notes-textarea" placeholder="Vos observations personnelles sur ce travail..."></textarea>
        </div>
      </div>

      <!-- Tab: Grille écrite (TFF only) -->
      <div id="tab-ecrit" class="tab-content">
        <div id="written-grid-container">
          <!-- JS renders sections and criteria here -->
        </div>
        <div class="score-summary">
          <strong>Score écrit total : </strong>
          <span id="written-total-display">0</span> / 20
        </div>
      </div>

      <!-- Tab: Grille orale -->
      <div id="tab-oral" class="tab-content">
        <!-- RC criteria or TFF oral criteria -->
        <div id="oral-grid-container"></div>
        <div class="score-summary" id="oral-score-summary">
          <strong id="oral-score-label">Note orale : </strong>
          <span id="oral-score-input-container"></span>
        </div>
      </div>

      <!-- Tab: Examen oral -->
      <div id="tab-questions" class="tab-content">
        <h3>Questions d'examen oral suggérées</h3>
        <div id="questions-list" class="questions-list"></div>
        <div class="custom-questions">
          <h3>Mes propres questions</h3>
          <textarea id="custom-questions-input" class="notes-textarea" placeholder="Ajoutez vos questions personnelles..."></textarea>
        </div>
        <button id="btn-print-questions" class="btn-secondary">🖨️ Imprimer les questions</button>
      </div>

    </section>

  </main>

  <!-- STICKY SCORE BAR -->
  <footer id="score-bar" class="score-bar hidden">
    <div class="score-item" id="score-written-container">
      <span class="score-label">Écrit</span>
      <span id="score-written-val" class="score-val">—</span>
      <span class="score-max">/20</span>
    </div>
    <div class="score-divider"></div>
    <div class="score-item">
      <span class="score-label">Oral</span>
      <input type="number" id="score-oral-val" class="score-input" min="0" max="40" placeholder="—">
      <span id="score-oral-max" class="score-max">/40</span>
    </div>
    <div class="score-divider"></div>
    <div class="score-item">
      <span class="score-label">Progression</span>
      <span id="score-progress" class="score-progress-bar">
        <span id="score-progress-fill"></span>
      </span>
      <span id="score-progress-label">0%</span>
    </div>
  </footer>

  <!-- MODAL: Criterion evidence -->
  <div id="evidence-modal" class="modal hidden">
    <div class="modal-content">
      <button id="modal-close" class="modal-close">✕</button>
      <h3 id="modal-criterion-label"></h3>
      <blockquote id="modal-quote"></blockquote>
      <div id="modal-pdf-link-container"></div>
      <div class="modal-ai-comment">
        <strong>Commentaire IA :</strong>
        <p id="modal-ai-comment"></p>
      </div>
    </div>
  </div>
  <div id="modal-overlay" class="modal-overlay hidden"></div>

  <script src="data.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify HTML opens in browser without errors**

Open `index.html` in Chrome. Console should show no errors. Page should show the header and empty dashboard.

- [ ] **Step 3: Commit**

```
git add index.html
git commit -m "feat: add SPA HTML shell with all views and tab structure"
```

---

## Task 4 — styles.css: complete styling

**Files:**
- Write: `styles.css`

- [ ] **Step 1: Write styles.css**

```css
/* ============================================================
   CUTM Eval App — styles.css
   Palette: blanc/gris clair fond, bleu UCLouvain (#003366)
   accents, vert pour points forts, rouge pour points faibles
   ============================================================ */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --blue:    #003366;
  --blue-lt: #0055a4;
  --green:   #2e7d32;
  --red:     #c62828;
  --orange:  #e65100;
  --gray-bg: #f5f7fa;
  --gray-bd: #d0d7e2;
  --white:   #ffffff;
  --text:    #1a1a2e;
  --text-lt: #5a6070;
  --radius:  8px;
  --shadow:  0 2px 8px rgba(0,0,0,.10);
}

body { font-family: 'Segoe UI', system-ui, sans-serif; background: var(--gray-bg); color: var(--text); min-height: 100vh; padding-bottom: 80px; }

/* HEADER */
.app-header { background: var(--blue); color: #fff; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 6px rgba(0,0,0,.3); }
.header-left { display: flex; align-items: center; gap: 12px; }
.header-left h1 { font-size: 1.2rem; font-weight: 600; }
.header-right { display: flex; gap: 10px; }

/* BUTTONS */
.btn-primary { background: #fff; color: var(--blue); border: none; padding: 7px 16px; border-radius: var(--radius); cursor: pointer; font-weight: 600; font-size: .9rem; }
.btn-primary:hover { background: #e8f0fe; }
.btn-secondary { background: rgba(255,255,255,.15); color: #fff; border: 1px solid rgba(255,255,255,.4); padding: 7px 16px; border-radius: var(--radius); cursor: pointer; font-size: .9rem; }
.btn-secondary:hover { background: rgba(255,255,255,.25); }
.btn-icon { background: transparent; border: none; color: #fff; font-size: 1.2rem; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
.btn-icon:hover { background: rgba(255,255,255,.2); }

/* MAIN */
#app-main { max-width: 1200px; margin: 0 auto; padding: 20px 16px; }

/* VIEW SWITCHING */
.view { display: none; }
.view.active { display: block; }

/* DASHBOARD GRID */
.students-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-top: 16px; }
.student-card { background: var(--white); border-radius: var(--radius); padding: 18px; box-shadow: var(--shadow); cursor: pointer; border-left: 4px solid var(--blue); transition: transform .15s, box-shadow .15s; }
.student-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,.14); }
.student-card .card-name { font-size: 1.1rem; font-weight: 700; color: var(--blue); margin-bottom: 4px; }
.student-card .card-type { font-size: .8rem; color: var(--text-lt); margin-bottom: 10px; }
.student-card .card-scores { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 10px; }
.score-chip { background: var(--gray-bg); border: 1px solid var(--gray-bd); border-radius: 20px; padding: 3px 10px; font-size: .82rem; color: var(--text); }
.score-chip.good { border-color: var(--green); color: var(--green); }
.score-chip.medium { border-color: var(--orange); color: var(--orange); }
.progress-row { display: flex; align-items: center; gap: 8px; }
.progress-bar { flex: 1; height: 6px; background: var(--gray-bd); border-radius: 3px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: var(--blue-lt); border-radius: 3px; transition: width .4s; }
.progress-label { font-size: .78rem; color: var(--text-lt); min-width: 36px; text-align: right; }

/* STUDENT HEADER */
.student-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.student-header h2 { font-size: 1.4rem; color: var(--blue); }
.badge { padding: 4px 12px; border-radius: 20px; font-size: .8rem; font-weight: 600; background: #e8f0fe; color: var(--blue-lt); }

/* TABS */
.tabs { display: flex; gap: 4px; border-bottom: 2px solid var(--gray-bd); margin-bottom: 20px; }
.tab-btn { background: none; border: none; padding: 10px 18px; cursor: pointer; font-size: .9rem; color: var(--text-lt); border-bottom: 2px solid transparent; margin-bottom: -2px; font-weight: 500; border-radius: 6px 6px 0 0; }
.tab-btn:hover { background: var(--gray-bg); color: var(--blue); }
.tab-btn.active { color: var(--blue); border-bottom-color: var(--blue); font-weight: 700; background: var(--white); }
.tab-btn.disabled { opacity: .4; cursor: not-allowed; }
.tab-content { display: none; }
.tab-content.active { display: block; }

/* ANALYSE TAB */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 700px) { .two-col { grid-template-columns: 1fr; } }
.bullet-list { list-style: none; padding: 0; }
.bullet-list li { padding: 6px 0 6px 20px; position: relative; font-size: .9rem; line-height: 1.5; border-bottom: 1px solid var(--gray-bg); }
.bullet-list li::before { content: '•'; position: absolute; left: 0; color: var(--blue-lt); font-weight: bold; }
.strengths li::before { color: var(--green); content: '✓'; }
.weaknesses li::before { color: var(--red); content: '✗'; }
.critique-block { background: var(--gray-bg); border-radius: var(--radius); padding: 14px; }
.strengths-title { color: var(--green); font-size: .9rem; margin-bottom: 6px; margin-top: 10px; }
.weaknesses-title { color: var(--red); font-size: .9rem; margin-bottom: 6px; margin-top: 14px; }
.notes-section { margin-top: 20px; }
.notes-section h3, h3 { font-size: 1rem; color: var(--blue); margin-bottom: 10px; }
.notes-textarea { width: 100%; min-height: 100px; border: 1px solid var(--gray-bd); border-radius: var(--radius); padding: 10px; font-family: inherit; font-size: .9rem; resize: vertical; line-height: 1.5; }
.notes-textarea:focus { outline: none; border-color: var(--blue-lt); box-shadow: 0 0 0 2px rgba(0,85,164,.15); }

/* WRITTEN GRID */
.written-section { background: var(--white); border-radius: var(--radius); margin-bottom: 16px; box-shadow: var(--shadow); overflow: hidden; }
.written-section-header { background: var(--blue); color: #fff; padding: 12px 16px; display: flex; justify-content: space-between; cursor: pointer; user-select: none; }
.written-section-header h3 { font-size: .95rem; font-weight: 600; }
.section-score-chip { background: rgba(255,255,255,.2); border-radius: 12px; padding: 2px 10px; font-size: .82rem; }
.written-section-body { padding: 0; }
.criterion-row { display: grid; grid-template-columns: 1fr 120px 120px 40px; gap: 8px; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--gray-bg); }
.criterion-row:last-child { border-bottom: none; }
.criterion-label { font-size: .88rem; font-weight: 500; }
.criterion-max { font-size: .8rem; color: var(--text-lt); text-align: center; }
.ai-score-display { text-align: center; }
.ai-score-badge { background: #e8f0fe; color: var(--blue-lt); padding: 3px 10px; border-radius: 12px; font-size: .82rem; font-weight: 600; }
.prof-score-select { width: 100%; padding: 5px 8px; border: 1px solid var(--gray-bd); border-radius: var(--radius); font-size: .85rem; background: var(--white); cursor: pointer; }
.prof-score-select:focus { outline: none; border-color: var(--blue-lt); }
.evidence-btn { background: none; border: 1px solid var(--gray-bd); border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: .78rem; color: var(--blue-lt); }
.evidence-btn:hover { background: #e8f0fe; }
.criterion-comment-row { padding: 4px 16px 12px; }
.criterion-comment { width: 100%; border: 1px solid var(--gray-bd); border-radius: 6px; padding: 6px 8px; font-size: .83rem; font-family: inherit; resize: none; min-height: 44px; }
.criterion-comment:focus { outline: none; border-color: var(--blue-lt); }
.score-summary { text-align: right; padding: 12px 0; font-size: .95rem; color: var(--text); }

/* RC ORAL GRID */
.rc-criterion-card { background: var(--white); border-radius: var(--radius); padding: 16px; margin-bottom: 12px; box-shadow: var(--shadow); border-left: 4px solid var(--gray-bd); }
.rc-criterion-card .crit-label { font-size: .9rem; font-weight: 600; margin-bottom: 10px; }
.rc-level-selector { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
.level-btn { border: 2px solid var(--gray-bd); background: var(--white); border-radius: 20px; padding: 5px 14px; font-size: .82rem; cursor: pointer; font-weight: 500; }
.level-btn:hover { border-color: var(--blue-lt); color: var(--blue-lt); }
.level-btn.selected { border-color: var(--blue); background: var(--blue); color: #fff; }
.level-btn[data-level="Insuffisant"].selected { background: var(--red); border-color: var(--red); }
.level-btn[data-level="Acceptable"].selected { background: var(--orange); border-color: var(--orange); }
.level-btn[data-level="Maîtrisé"].selected { background: #1565c0; border-color: #1565c0; }
.level-btn[data-level="Avancé"].selected { background: var(--green); border-color: var(--green); }
.ai-level-indicator { font-size: .8rem; color: var(--text-lt); margin-bottom: 8px; }

/* ORAL TFF GRID */
.oral-block { background: var(--white); border-radius: var(--radius); margin-bottom: 16px; box-shadow: var(--shadow); overflow: hidden; }
.oral-block-header { background: #1565c0; color: #fff; padding: 10px 16px; font-weight: 600; font-size: .9rem; }
.oral-criterion-row { padding: 12px 16px; border-bottom: 1px solid var(--gray-bg); }
.oral-criterion-row:last-child { border-bottom: none; }
.oral-crit-label { font-size: .88rem; font-weight: 500; margin-bottom: 8px; }
.presence-selector { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.presence-btn { border: 1px solid var(--gray-bd); background: var(--white); border-radius: 6px; padding: 4px 10px; font-size: .78rem; cursor: pointer; }
.presence-btn:hover { border-color: var(--blue-lt); }
.presence-btn.selected { background: var(--blue); color: #fff; border-color: var(--blue); }
.presence-btn[data-val="Absent"].selected { background: var(--red); border-color: var(--red); }
.presence-btn[data-val="Peu présent"].selected { background: var(--orange); border-color: var(--orange); }

/* ORAL SCORE INPUT */
.oral-final-score { display: flex; align-items: center; gap: 10px; padding: 12px 0; }
.oral-score-num { width: 70px; padding: 6px 10px; border: 2px solid var(--blue); border-radius: var(--radius); font-size: 1.1rem; font-weight: 700; text-align: center; }

/* QUESTIONS TAB */
.questions-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.question-item { background: var(--white); border-left: 3px solid var(--blue-lt); padding: 12px 16px; border-radius: 0 var(--radius) var(--radius) 0; box-shadow: var(--shadow); font-size: .9rem; line-height: 1.5; }
.question-item .q-num { font-weight: 700; color: var(--blue); margin-right: 8px; }
.custom-questions { margin-top: 20px; margin-bottom: 12px; }

/* COMPARE TABLE */
#compare-table-container { overflow-x: auto; margin-top: 16px; }
#compare-table-container table { width: 100%; border-collapse: collapse; background: var(--white); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); font-size: .85rem; }
#compare-table-container th { background: var(--blue); color: #fff; padding: 10px 12px; text-align: left; }
#compare-table-container td { padding: 9px 12px; border-bottom: 1px solid var(--gray-bg); }
#compare-table-container tr:hover td { background: #f0f4ff; }

/* STICKY SCORE BAR */
.score-bar { position: fixed; bottom: 0; left: 0; right: 0; background: var(--blue); color: #fff; padding: 10px 20px; display: flex; align-items: center; gap: 16px; z-index: 200; box-shadow: 0 -2px 8px rgba(0,0,0,.2); }
.score-bar.hidden { display: none; }
.score-label { font-size: .78rem; opacity: .8; }
.score-val { font-size: 1.1rem; font-weight: 700; }
.score-max { font-size: .78rem; opacity: .7; }
.score-input { width: 60px; background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.4); border-radius: 6px; color: #fff; padding: 4px 6px; font-size: 1rem; font-weight: 700; text-align: center; }
.score-input:focus { outline: none; background: rgba(255,255,255,.25); }
.score-divider { width: 1px; height: 30px; background: rgba(255,255,255,.3); }
.score-progress-bar { display: inline-block; width: 80px; height: 8px; background: rgba(255,255,255,.2); border-radius: 4px; overflow: hidden; vertical-align: middle; }
#score-progress-fill { display: block; height: 100%; background: #76c442; border-radius: 4px; transition: width .4s; }

/* MODAL */
.modal { position: fixed; inset: 0; z-index: 500; display: flex; align-items: center; justify-content: center; pointer-events: none; }
.modal.hidden { display: none; }
.modal-content { background: var(--white); border-radius: var(--radius); padding: 24px; max-width: 580px; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,.25); pointer-events: all; position: relative; }
.modal-close { position: absolute; top: 12px; right: 12px; background: none; border: none; font-size: 1.1rem; cursor: pointer; color: var(--text-lt); }
.modal-close:hover { color: var(--red); }
#modal-criterion-label { color: var(--blue); margin-bottom: 14px; font-size: 1rem; }
#modal-quote { background: var(--gray-bg); border-left: 3px solid var(--blue-lt); padding: 12px; border-radius: 0 6px 6px 0; font-size: .88rem; line-height: 1.6; color: var(--text); font-style: italic; margin-bottom: 14px; }
#modal-pdf-link-container { margin-bottom: 12px; }
#modal-pdf-link-container a { color: var(--blue-lt); font-size: .85rem; text-decoration: none; }
#modal-pdf-link-container a:hover { text-decoration: underline; }
.modal-ai-comment strong { font-size: .82rem; color: var(--text-lt); }
.modal-ai-comment p { font-size: .88rem; margin-top: 4px; line-height: 1.5; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 499; }
.modal-overlay.hidden { display: none; }

/* PRINT */
@media print {
  .app-header, .score-bar, .tabs, .notes-section, .modal, .modal-overlay, .btn-primary, .btn-secondary, #btn-print-questions, #btn-save, #btn-compare, #btn-home { display: none !important; }
  body { background: white; padding-bottom: 0; }
  #view-student { display: block !important; }
  .tab-content { display: block !important; }
  .student-card { break-inside: avoid; }
}
```

- [ ] **Step 2: Verify styles look correct in browser**

Open `index.html` — the header should show a blue UCLouvain-style bar. No layout errors.

- [ ] **Step 3: Commit**

```
git add styles.css
git commit -m "feat: add complete CSS with dashboard, tabs, grids, modal, print styles"
```

---

## Task 5 — app.js: navigation, dashboard, student rendering, tabs

**Files:**
- Write: `app.js`

- [ ] **Step 1: Write app.js — Part 1: constants, state, navigation**

```javascript
// app.js — CUTM Evaluation App

// ─── STATE ───────────────────────────────────────────────────
const STATE = {
  currentStudent: null,
  currentTab: 'analyse',
  annotations: loadAnnotations(),
};

const TFF_SECTIONS = [
  { key: 's1', label: 'Identification et Synthèse (3 pts)', criteria: ['titre_mots_cles','resume','introduction'] },
  { key: 's2', label: 'Présentation du Patient et Contexte (4 pts)', criteria: ['anamnese','modele_curtin','chronologie'] },
  { key: 's3', label: 'Démarche Diagnostique et Raisonnement (4 pts)', criteria: ['resultats_cliniques','raisonnement'] },
  { key: 's4', label: 'Intervention et Suivi (5 pts)', criteria: ['modalites_tidier','resultats_suivi'] },
  { key: 's5', label: 'Discussion et Éthique (4 pts)', criteria: ['analyse_critique','perspective_patient','consentement'] },
];

const RC_LEVELS = ['Insuffisant', 'Acceptable', 'Maîtrisé', 'Avancé'];
const TFF_ORAL_BLOCKS = [
  { key: 'b1', label: 'I. Structure et Contenu de la Présentation (15 pts)',
    criteria: [
      { key: 'pertinence', label: 'Pertinence du contenu : Le contenu est explicite pour comprendre la question de recherche', double: true },
      { key: 'resultats_clinique', label: 'Résultats & Clinique : Contenu complet pour comprendre les résultats et l\'implication clinique', double: true },
      { key: 'fil_conducteur', label: 'Fil conducteur : Transition fluide entre les dias et "take home message" clair' },
      { key: 'synthese', label: 'Esprit de synthèse : Sélection rigoureuse des informations clés' },
      { key: 'ouverture', label: 'Ouverture : Perspective pertinente en fin d\'exposé' },
    ]
  },
  { key: 'b2', label: 'II. Support Visuel et Maîtrise de l\'Exposé (10 pts)',
    criteria: [
      { key: 'qualite_support', label: 'Qualité du support : Dias non surchargées, visuel privilégié' },
      { key: 'rigueur_academique', label: 'Rigueur académique : Informations correctement référencées' },
      { key: 'independance', label: 'Indépendance : S\'adresse au jury sans lire ses notes ou ses diapositives', double: true },
      { key: 'qualite_formelle', label: 'Qualité formelle : Orthographe, syntaxe et ponctuation de qualité' },
    ]
  },
  { key: 'b3', label: 'III. Interaction et Réponses aux Questions (15 pts)',
    criteria: [
      { key: 'justesse', label: 'Justesse des réponses : Réponses appropriées, détaillées et argumentées', double: true },
      { key: 'expertise', label: 'Expertise métier : Mobilise les ressources spécifiques à la kinésithérapie', double: true },
      { key: 'distinction', label: 'Distinction critique : Sépare la littérature de son opinion personnelle' },
      { key: 'elocution', label: 'Élocution : Débit de parole, intonation et vocabulaire professionnel' },
    ]
  },
];

const PRESENCE_OPTIONS = ['Tout à fait présent', 'Plutôt présent', 'Peu présent', 'Absent', 'N/A'];
```

- [ ] **Step 2: Write app.js — Part 2: localStorage utilities**

```javascript
// ─── PERSISTENCE ─────────────────────────────────────────────
function loadAnnotations() {
  try { return JSON.parse(localStorage.getItem('cutm_eval_annotations') || '{}'); }
  catch { return {}; }
}

function saveAnnotations() {
  localStorage.setItem('cutm_eval_annotations', JSON.stringify(STATE.annotations));
}

function getAnnotation(studentId, key, defaultVal = '') {
  return STATE.annotations[studentId]?.[key] ?? defaultVal;
}

function setAnnotation(studentId, key, value) {
  if (!STATE.annotations[studentId]) STATE.annotations[studentId] = {};
  STATE.annotations[studentId][key] = value;
  saveAnnotations();
  updateProgressBar(studentId);
}

function calcProgress(studentId) {
  const s = STUDENTS_DATA[studentId];
  let filled = 0, total = 0;
  if (s.writtenCriteria) {
    Object.keys(s.writtenCriteria).forEach(k => {
      total++;
      const v = getAnnotation(studentId, `written_score_${k}`, null);
      if (v !== null && v !== '') filled++;
    });
  }
  Object.keys(s.rcCriteria).forEach(k => {
    total++;
    const v = getAnnotation(studentId, `rc_level_${k}`, null);
    if (v !== null && v !== '') filled++;
  });
  if (total === 0) return 0;
  return Math.round((filled / total) * 100);
}
```

- [ ] **Step 3: Write app.js — Part 3: dashboard rendering**

```javascript
// ─── DASHBOARD ───────────────────────────────────────────────
function renderDashboard() {
  const grid = document.getElementById('students-grid');
  grid.innerHTML = '';
  Object.values(STUDENTS_DATA).forEach(s => {
    const progress = calcProgress(s.id);
    const writtenScore = s.writtenCriteria ? calcWrittenTotal(s.id) : null;
    const card = document.createElement('div');
    card.className = 'student-card';
    card.innerHTML = `
      <div class="card-name">${s.name}</div>
      <div class="card-type">${s.type}${s.type === 'RC' ? ' — Raisonnement clinique seulement' : ''}</div>
      <div class="card-scores">
        ${writtenScore !== null ? `<span class="score-chip ${writtenScore >= 15 ? 'good' : writtenScore >= 12 ? 'medium' : ''}"
          >Écrit : ${calcWrittenTotal(s.id).toFixed(1)}/20 (IA: ${s.aiWrittenScore ?? '—'})</span>` : ''}
        <span class="score-chip">${s.aiRcLevel}</span>
      </div>
      <div class="progress-row">
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${progress}%"></div></div>
        <span class="progress-label">${progress}%</span>
      </div>
    `;
    card.addEventListener('click', () => showStudent(s.id));
    grid.appendChild(card);
  });
}

function calcWrittenTotal(studentId) {
  const s = STUDENTS_DATA[studentId];
  if (!s.writtenCriteria) return 0;
  let total = 0;
  Object.entries(s.writtenCriteria).forEach(([k, crit]) => {
    const saved = getAnnotation(studentId, `written_score_${k}`, null);
    if (saved !== null && saved !== '') {
      total += parseFloat(saved);
    } else {
      total += crit.aiScore;
    }
  });
  return Math.round(total * 10) / 10;
}
```

- [ ] **Step 4: Write app.js — Part 4: student view, tabs, analyse tab**

```javascript
// ─── NAVIGATION ──────────────────────────────────────────────
function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${viewId}`).classList.add('active');
  const scoreBar = document.getElementById('score-bar');
  scoreBar.classList.toggle('hidden', viewId !== 'student');
}

function showStudent(studentId) {
  STATE.currentStudent = studentId;
  const s = STUDENTS_DATA[studentId];
  document.getElementById('student-name-title').textContent = s.name;
  document.getElementById('student-type-badge').textContent = s.type;
  document.getElementById('app-title').textContent = s.name;

  // Disable written tab if RC-only
  const ecritBtn = document.getElementById('tab-ecrit-btn');
  if (!s.writtenCriteria) {
    ecritBtn.classList.add('disabled');
    ecritBtn.disabled = true;
    ecritBtn.title = 'Pas de grille écrite (RC uniquement)';
  } else {
    ecritBtn.classList.remove('disabled');
    ecritBtn.disabled = false;
    ecritBtn.title = '';
  }

  showTab('analyse');
  showView('student');
  updateScoreBar();
}

function showTab(tabName) {
  STATE.currentTab = tabName;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
  document.getElementById(`tab-${tabName}`)?.classList.add('active');

  const sid = STATE.currentStudent;
  if (tabName === 'analyse') renderAnalyseTab(sid);
  else if (tabName === 'ecrit') renderWrittenTab(sid);
  else if (tabName === 'oral') renderOralTab(sid);
  else if (tabName === 'questions') renderQuestionsTab(sid);
}

// ─── ANALYSE TAB ─────────────────────────────────────────────
function renderAnalyseTab(sid) {
  const s = STUDENTS_DATA[sid];
  const summaryList = document.getElementById('summary-list');
  const strengthsList = document.getElementById('strengths-list');
  const weaknessesList = document.getElementById('weaknesses-list');
  const globalNotes = document.getElementById('global-notes');

  summaryList.innerHTML = s.summary.map(t => `<li>${t}</li>`).join('');
  strengthsList.innerHTML = s.critique.strengths.map(t => `<li>${t}</li>`).join('');
  weaknessesList.innerHTML = s.critique.weaknesses.map(t => `<li>${t}</li>`).join('');
  globalNotes.value = getAnnotation(sid, 'global_notes', '');
  globalNotes.oninput = () => setAnnotation(sid, 'global_notes', globalNotes.value);
}
```

- [ ] **Step 5: Write app.js — Part 5: written (TFF) criteria tab**

```javascript
// ─── WRITTEN TAB ─────────────────────────────────────────────
function renderWrittenTab(sid) {
  const s = STUDENTS_DATA[sid];
  const container = document.getElementById('written-grid-container');
  if (!s.writtenCriteria) { container.innerHTML = '<p>Pas de grille écrite disponible pour cet étudiant.</p>'; return; }

  container.innerHTML = '';
  TFF_SECTIONS.forEach(section => {
    const div = document.createElement('div');
    div.className = 'written-section';
    const sectionScore = section.criteria.reduce((acc, k) => {
      const saved = getAnnotation(sid, `written_score_${k}`, null);
      return acc + (saved !== null && saved !== '' ? parseFloat(saved) : (s.writtenCriteria[k]?.aiScore ?? 0));
    }, 0);
    const sectionMax = section.criteria.reduce((acc, k) => acc + (s.writtenCriteria[k]?.maxScore ?? 0), 0);

    div.innerHTML = `
      <div class="written-section-header" onclick="this.parentElement.querySelector('.written-section-body').classList.toggle('collapsed')">
        <h3>${section.label}</h3>
        <span class="section-score-chip">${sectionScore.toFixed(1)} / ${sectionMax}</span>
      </div>
      <div class="written-section-body">
        ${section.criteria.map(k => renderCriterionRow(sid, k, s.writtenCriteria[k])).join('')}
      </div>
    `;
    container.appendChild(div);
  });
  document.getElementById('written-total-display').textContent = calcWrittenTotal(sid).toFixed(1);
}

function renderCriterionRow(sid, key, crit) {
  if (!crit) return '';
  const saved = getAnnotation(sid, `written_score_${key}`, crit.aiScore);
  const savedComment = getAnnotation(sid, `written_comment_${key}`, '');
  const scoreOptions = [0, crit.maxScore * 0.4, crit.maxScore * 0.75, crit.maxScore]
    .map(v => Math.round(v * 100) / 100)
    .filter((v, i, a) => a.indexOf(v) === i);

  return `
    <div class="criterion-row" id="crow-${key}">
      <div class="criterion-label">${crit.label}</div>
      <div class="criterion-max">max ${crit.maxScore} pt${crit.maxScore > 1 ? 's' : ''}</div>
      <div class="ai-score-display"><span class="ai-score-badge" title="Score IA suggéré">IA: ${crit.aiScore}</span></div>
      <div>
        <select class="prof-score-select" onchange="onWrittenScoreChange('${sid}','${key}',this.value)" title="Votre score">
          ${scoreOptions.map(v => `<option value="${v}" ${parseFloat(saved) === v ? 'selected' : ''}>${v} (${v === 0 ? 'Absent' : v === crit.maxScore * 0.4 ? 'Faible 40%' : v === crit.maxScore * 0.75 ? 'Satisfaisant 75%' : 'Excellent 100%'})</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="criterion-comment-row">
      <textarea class="criterion-comment" rows="2" placeholder="Commentaire sur ce critère..." onblur="setAnnotation('${sid}','written_comment_${key}',this.value)">${savedComment}</textarea>
      <button class="evidence-btn" onclick="showEvidence('${sid}','${key}')" title="Voir le passage du TFF">📄 Evidence</button>
    </div>
  `;
}

function onWrittenScoreChange(sid, key, val) {
  setAnnotation(sid, `written_score_${key}`, val);
  renderWrittenTab(sid);
  updateScoreBar();
}
```

- [ ] **Step 6: Write app.js — Part 6: oral tabs, questions tab, score bar, events**

```javascript
// ─── ORAL TAB ────────────────────────────────────────────────
function renderOralTab(sid) {
  const s = STUDENTS_DATA[sid];
  const container = document.getElementById('oral-grid-container');
  container.innerHTML = '';

  // RC criteria section
  const rcDiv = document.createElement('div');
  rcDiv.innerHTML = '<h3 style="margin-bottom:12px">Critères RC (Raisonnement Clinique)</h3>';
  Object.entries(s.rcCriteria).forEach(([k, crit]) => {
    const savedLevel = getAnnotation(sid, `rc_level_${k}`, crit.aiLevel);
    const savedComment = getAnnotation(sid, `rc_comment_${k}`, '');
    const card = document.createElement('div');
    card.className = 'rc-criterion-card';
    card.innerHTML = `
      <div class="crit-label">${crit.label}</div>
      <div class="ai-level-indicator">Niveau IA suggéré : <strong>${crit.aiLevel}</strong></div>
      <div class="rc-level-selector">
        ${RC_LEVELS.map(lv => `<button class="level-btn ${savedLevel === lv ? 'selected' : ''}" data-level="${lv}" onclick="onRcLevelChange('${sid}','${k}','${lv}',this.closest('.rc-criterion-card'))">${lv}</button>`).join('')}
      </div>
      <textarea class="criterion-comment" rows="2" placeholder="Commentaire..." onblur="setAnnotation('${sid}','rc_comment_${k}',this.value)">${savedComment}</textarea>
      <button class="evidence-btn" style="margin-top:6px" onclick="showRcEvidence('${sid}','${k}')" title="Voir le passage du RC">📄 Evidence</button>
    `;
    rcDiv.appendChild(card);
  });
  container.appendChild(rcDiv);

  // TFF Oral section (if applicable)
  if (s.type !== 'RC') {
    const tffOralDiv = document.createElement('div');
    tffOralDiv.innerHTML = '<h3 style="margin:20px 0 12px">Grille orale TFF (Défense orale /40)</h3>';
    TFF_ORAL_BLOCKS.forEach(block => {
      const blockDiv = document.createElement('div');
      blockDiv.className = 'oral-block';
      blockDiv.innerHTML = `<div class="oral-block-header">${block.label}</div>`;
      block.criteria.forEach(crit => {
        const saved = getAnnotation(sid, `oral_${block.key}_${crit.key}`, '');
        const savedComment = getAnnotation(sid, `oral_comment_${block.key}_${crit.key}`, '');
        const row = document.createElement('div');
        row.className = 'oral-criterion-row';
        row.innerHTML = `
          <div class="oral-crit-label">${crit.label}${crit.double ? ' <span style="font-size:.75rem;color:#e65100">(compte double)</span>' : ''}</div>
          <div class="presence-selector">
            ${PRESENCE_OPTIONS.map(p => `<button class="presence-btn ${saved === p ? 'selected' : ''}" data-val="${p}" onclick="onPresenceChange('${sid}','${block.key}','${crit.key}','${p}',this.closest('.oral-criterion-row'))">${p}</button>`).join('')}
          </div>
          <textarea class="criterion-comment" rows="1" placeholder="Commentaire..." onblur="setAnnotation('${sid}','oral_comment_${block.key}_${crit.key}',this.value)">${savedComment}</textarea>
        `;
        blockDiv.appendChild(row);
      });
      tffOralDiv.appendChild(blockDiv);
    });
    container.appendChild(tffOralDiv);
  }
}

function onRcLevelChange(sid, key, level, card) {
  setAnnotation(sid, `rc_level_${key}`, level);
  card.querySelectorAll('.level-btn').forEach(b => b.classList.toggle('selected', b.dataset.level === level));
}

function onPresenceChange(sid, blockKey, critKey, val, row) {
  setAnnotation(sid, `oral_${blockKey}_${critKey}`, val);
  row.querySelectorAll('.presence-btn').forEach(b => b.classList.toggle('selected', b.dataset.val === val));
}

// ─── QUESTIONS TAB ───────────────────────────────────────────
function renderQuestionsTab(sid) {
  const s = STUDENTS_DATA[sid];
  const list = document.getElementById('questions-list');
  list.innerHTML = s.oralQuestions.map((q, i) => `
    <div class="question-item"><span class="q-num">${i+1}.</span>${q}</div>
  `).join('');
  const customInput = document.getElementById('custom-questions-input');
  customInput.value = getAnnotation(sid, 'custom_questions', '');
  customInput.oninput = () => setAnnotation(sid, 'custom_questions', customInput.value);
}

// ─── SCORE BAR ───────────────────────────────────────────────
function updateScoreBar() {
  const sid = STATE.currentStudent;
  if (!sid) return;
  const s = STUDENTS_DATA[sid];
  const writtenVal = document.getElementById('score-written-val');
  const writtenContainer = document.getElementById('score-written-container');
  if (s.writtenCriteria) {
    writtenContainer.style.display = '';
    writtenVal.textContent = calcWrittenTotal(sid).toFixed(1);
  } else {
    writtenContainer.style.display = 'none';
  }
  const max = s.type === 'RC' ? 20 : 40;
  document.getElementById('score-oral-max').textContent = `/${max}`;
  const savedOral = getAnnotation(sid, 'oral_final_score', '');
  const oralInput = document.getElementById('score-oral-val');
  oralInput.value = savedOral;
  oralInput.max = max;
  const progress = calcProgress(sid);
  document.getElementById('score-progress-fill').style.width = progress + '%';
  document.getElementById('score-progress-label').textContent = progress + '%';
}

function updateProgressBar(sid) {
  updateScoreBar();
  renderDashboard();
}

// ─── EVIDENCE MODAL ──────────────────────────────────────────
function showEvidence(sid, criterionKey) {
  const s = STUDENTS_DATA[sid];
  const crit = s.writtenCriteria[criterionKey];
  if (!crit) return;
  document.getElementById('modal-criterion-label').textContent = crit.label;
  document.getElementById('modal-quote').textContent = crit.evidence.quote;
  document.getElementById('modal-ai-comment').textContent = crit.aiComment;
  const pdfContainer = document.getElementById('modal-pdf-link-container');
  if (crit.evidence.page && s.tffFile) {
    pdfContainer.innerHTML = `<a href="${s.tffFile}#page=${crit.evidence.page}" target="_blank">📄 Ouvrir PDF page ${crit.evidence.page}</a>`;
  } else {
    pdfContainer.innerHTML = '';
  }
  document.getElementById('evidence-modal').classList.remove('hidden');
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function showRcEvidence(sid, criterionKey) {
  const s = STUDENTS_DATA[sid];
  const crit = s.rcCriteria[criterionKey];
  if (!crit) return;
  document.getElementById('modal-criterion-label').textContent = crit.label;
  document.getElementById('modal-quote').textContent = crit.evidence.quote;
  document.getElementById('modal-ai-comment').textContent = crit.aiComment;
  const pdfContainer = document.getElementById('modal-pdf-link-container');
  if (crit.evidence.page && s.rcFile) {
    pdfContainer.innerHTML = `<a href="${s.rcFile}#page=${crit.evidence.page}" target="_blank">📄 Ouvrir PDF page ${crit.evidence.page}</a>`;
  } else {
    pdfContainer.innerHTML = '';
  }
  document.getElementById('evidence-modal').classList.remove('hidden');
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('evidence-modal').classList.add('hidden');
  document.getElementById('modal-overlay').classList.add('hidden');
}

// ─── COMPARE VIEW ────────────────────────────────────────────
function renderCompare() {
  const container = document.getElementById('compare-table-container');
  const rows = Object.values(STUDENTS_DATA).map(s => {
    const written = s.writtenCriteria ? calcWrittenTotal(s.id).toFixed(1) : '—';
    const aiWritten = s.aiWrittenScore ?? '—';
    const oralScore = getAnnotation(s.id, 'oral_final_score', '—');
    const progress = calcProgress(s.id) + '%';
    return `<tr>
      <td><strong>${s.name}</strong></td>
      <td>${s.type}</td>
      <td>${written} <span style="color:#aaa;font-size:.8rem">(IA: ${aiWritten})</span></td>
      <td>${oralScore}</td>
      <td>${s.aiRcLevel}</td>
      <td><div class="progress-bar" style="width:80px;display:inline-block"><div class="progress-bar-fill" style="width:${calcProgress(s.id)}%"></div></div> ${progress}</td>
    </tr>`;
  }).join('');
  container.innerHTML = `<table><thead><tr>
    <th>Étudiant</th><th>Type</th><th>Écrit /20</th><th>Oral (saisi)</th><th>Niveau RC</th><th>Progression</th>
  </tr></thead><tbody>${rows}</tbody></table>`;
}

// ─── EVENT LISTENERS ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  showView('dashboard');

  document.getElementById('btn-home').addEventListener('click', () => {
    STATE.currentStudent = null;
    document.getElementById('app-title').textContent = 'Mémoires CUTM 2026';
    showView('dashboard');
    renderDashboard();
  });

  document.getElementById('btn-compare').addEventListener('click', () => {
    renderCompare();
    showView('compare');
  });

  document.getElementById('btn-save').addEventListener('click', () => {
    saveAnnotations();
    const btn = document.getElementById('btn-save');
    btn.textContent = '✓ Sauvegardé';
    setTimeout(() => { btn.textContent = '💾 Sauvegarder'; }, 1500);
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      showTab(btn.dataset.tab);
    });
  });

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', closeModal);

  document.getElementById('score-oral-val').addEventListener('input', (e) => {
    if (STATE.currentStudent) {
      setAnnotation(STATE.currentStudent, 'oral_final_score', e.target.value);
    }
  });

  document.getElementById('btn-print-questions').addEventListener('click', () => window.print());
});
```

- [ ] **Step 7: Verify full app works in browser**

Open `index.html`. Verify:
- Dashboard shows 7 student cards
- Clicking a student shows the detail view with 4 tabs
- Analyse tab renders summary + critique + notes textarea
- Grille écrite tab shows criteria with scores and evidence buttons
- Evidence modal opens and shows the quote + PDF link
- Grille orale tab shows RC criteria with level buttons
- Examen oral tab shows questions
- Score bar appears at bottom
- Save button works (check localStorage in DevTools → Application → Local Storage)
- Home button returns to dashboard
- Compare button shows comparison table

- [ ] **Step 8: Commit**

```
git add app.js
git commit -m "feat: complete app.js with all views, tabs, scoring, localStorage, modal"
```

---

## Task 6 — Final integration, polish and validation

**Files:**
- Edit: `index.html` (minor fixes if found)
- Edit: `styles.css` (minor fixes if found)
- Edit: `app.js` (minor fixes if found)

- [ ] **Step 1: Test all 7 students systematically**

For each student, verify:
1. Dashboard card shows correct type and AI scores
2. Clicking opens student view
3. Analyse tab: summary bullets + critique bullets render correctly
4. Grille écrite tab: disabled for Mora (RC only), enabled for others
5. Each criterion: AI score shown, prof score dropdown works, saves to localStorage
6. Evidence button opens modal with correct quote and PDF link
7. Grille orale: RC criteria with 4 level buttons; TFF oral with presence buttons
8. Examen oral: correct number of questions for that student
9. Score bar updates when scores are changed
10. Page refresh retains all entered scores

- [ ] **Step 2: Test print functionality**

Click "Imprimer les questions" in Examen oral tab — browser print dialog should open showing questions without navigation/header.

- [ ] **Step 3: Test compare view**

Click "Comparaison" from header — table should show all 7 students with their scores.

- [ ] **Step 4: Final commit**

```
git add index.html styles.css app.js
git commit -m "feat: complete CUTM evaluation app - all 7 students, grilles, oral questions, localStorage"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Task | Status |
|-------------|------|--------|
| Read all mémoires, generate summaries | Task 2 (data.js) | ✅ All 7 students |
| Critique with strengths/weaknesses | Task 2 (data.js) | ✅ |
| Grille écrite with criteria + AI score | Tasks 2+5 | ✅ TFF-CUTM /20 for 6 students |
| Citation + PDF link per criterion | Tasks 2+5 | ✅ evidence.quote + page number |
| Professor can modify scores | Task 5 (written tab) | ✅ Dropdown pre-filled with AI score |
| Oral evaluation criteria | Tasks 2+5 | ✅ RC (7 criteria) + TFF oral (3 blocks) |
| Oral exam questions per student | Tasks 2+5 | ✅ 8-10 questions per student |
| Professor notes field | Task 5 (analyse tab) | ✅ Global notes textarea |
| localStorage persistence | Task 5 (app.js) | ✅ Auto-save on change |
| Dashboard with progress | Task 5 (dashboard) | ✅ Progress bar + score chips |
| Comparison view | Task 5 (compare) | ✅ Table view |
| Print functionality | Tasks 3+5 | ✅ Print questions + CSS print rules |
| Lucas Triffoy TFF now available | Task 2 | ✅ TFF included |
| Brzustowski = DTM case | Task 2 | ✅ Noted in spec + data |

**Placeholder scan:** No TBDs or incomplete sections in data.js.

**Type consistency:** All function calls to `setAnnotation`, `getAnnotation`, `STUDENTS_DATA` are consistent across Tasks 5.

**Mora Hurtado:** RC-only — `writtenCriteria: null`, `aiWrittenScore: null` → grille écrite tab disabled. Handled in `showStudent()` and `renderWrittenTab()`.

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-31-eval-memoires-app.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks

**2. Inline Execution** — Execute tasks in this session using executing-plans

**Which approach?**
