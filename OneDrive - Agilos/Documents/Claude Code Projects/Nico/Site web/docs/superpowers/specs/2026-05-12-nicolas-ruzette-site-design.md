# Design Spec — Site Web Nicolas Ruzette (Psychologue & Neurodiversité)

**Date:** 2026-05-12  
**Stack:** HTML / CSS / JS pur  
**Langues:** Français, Anglais, Espagnol  
**Structure:** One-page avec ancres  

---

## 1. Architecture & Structure de fichiers

```
/
├── index.html                  ← coquille HTML (structure uniquement, aucun texte en dur)
├── css/
│   ├── base.css                ← variables CSS, reset, typographie
│   ├── components.css          ← hero, cards, accordion, quiz, nav
│   └── animations.css          ← keyframes, scroll reveal classes
├── js/
│   ├── i18n.js                 ← chargement JSON + substitution dans le DOM
│   ├── quiz.js                 ← logique du quiz neurodiversité
│   ├── accordion.js            ← FAQ interactive
│   └── scroll-animations.js   ← Intersection Observer pour reveal au scroll
├── i18n/
│   ├── fr.json                 ← tout le contenu en français
│   ├── en.json                 ← tout le contenu en anglais
│   └── es.json                 ← tout le contenu en espagnol
└── assets/
    └── images/                 ← photo de Nicolas, illustrations
```

**Principe clé :** `index.html` ne contient que la structure HTML avec des attributs `data-i18n="key"`. Aucun texte n'est écrit en dur dans le HTML. `i18n.js` lit la langue active (stockée en `localStorage`) et injecte le contenu correspondant au chargement de la page et à chaque changement de langue.

---

## 2. Sections de la one-page (dans l'ordre de défilement)

### 2.1 Navigation (sticky)
- Logo / nom "Nicolas Ruzette" à gauche
- Ancres vers chaque section à droite : À propos · Neurodiversité · Approches · Quiz · FAQ · Contact
- Switcher de langue FR / EN / ES
- Menu hamburger sur mobile

### 2.2 Hero
- Photo de Nicolas (pleine largeur ou côte-à-côte avec le texte)
- Accroche principale orientée neurodiversité (ex. : *"Comprendre votre cerveau, c'est reconnaître votre singularité"*)
- Sous-titre : psychologue clinicien à Barcelone, consultations en ligne
- Deux CTA : **Prendre rendez-vous** (ancre Contact) et **En savoir plus** (ancre À propos)
- Animation d'entrée au chargement (fade + slide)

### 2.3 À propos
- Texte de présentation : parcours UCL, 10+ ans d'expérience internationale, Barcelone
- Populations accompagnées : expatriés, LGBTQ+, couples, personnes neurodiverse
- Badges de certification (Ordre des Psychologues de Belgique)
- Langues de consultation : FR / EN / ES

### 2.4 Neurodiversité (section phare)
- Titre pédagogique : *"La neurodiversité, c'est quoi ?"*
- 3-4 cartes animées : TDAH · Autisme (TSA) · Haut Potentiel (HPI) · Hypersensibilité
- Chaque carte : icône Lucide + titre + description courte en langage accessible (pas clinique)
- Ton chaleureux et déstigmatisant
- Reveal au scroll avec stagger entre les cartes

### 2.5 Approches thérapeutiques
- 4 piliers présentés comme des blocs visuels :
  1. Thérapie Centrée sur les Émotions (TCE / EFT)
  2. Communication Non Violente (CNV)
  3. Neurobiologie Interpersonnelle (Stephen Porges)
  4. Thérapie Systémique Brève
- Chaque pilier : icône + titre + 2-3 phrases d'explication
- Reveal au scroll

### 2.6 Quiz d'auto-évaluation neurodiversité
- Titre : *"Et vous ?"* ou *"Mieux se comprendre"*
- **8 questions** à choix unique : Jamais / Parfois / Souvent / Toujours
- Thèmes couverts : concentration, hypersensibilité, interactions sociales, pensée en arborescence, régulation émotionnelle, besoin de routine, créativité atypique, fatigue sociale
- Barre de progression animée (1/8 → 8/8)
- Transitions entre questions : fade in/out
- **3 profils de résultat** calculés côté client (Jamais=0, Parfois=1, Souvent=2, Toujours=3 → max 24) :
  - Score 0-8 : Profil neuronormatif → encouragement, invitation ouverte
  - Score 9-16 : Profil intermédiaire → invitation à explorer avec un professionnel
  - Score 17-24 : Profil potentiellement neurodivers → message chaleureux + CTA fort vers contact
- **Disclaimer** bien visible : *"Ce quiz est un outil de réflexion, pas un diagnostic médical. Seul un professionnel de santé peut poser un diagnostic."*
- Bouton "Recommencer" après le résultat

### 2.7 FAQ (Accordion)
- 8 questions/réponses, une seule ouverte à la fois
- Animation de hauteur fluide (`max-height` CSS transition)
- Questions suggérées :
  1. Qu'est-ce que la neurodiversité ?
  2. Comment se déroule une première séance ?
  3. Proposez-vous des séances en ligne ?
  4. Dans quelles langues travaillez-vous ?
  5. Travaillez-vous avec les couples ?
  6. Quelle est votre approche avec le TDAH ?
  7. Combien de séances sont nécessaires ?
  8. Travaillez-vous avec les enfants ?
- Toutes les questions/réponses traduites dans les 3 langues via i18n

### 2.8 Contact
- Adresse : Plaza Urquinaona 10, 2-1, Barcelona 08010
- Téléphone : +34 634 910 541
- Horaires : Lundi–Vendredi 9h–21h
- Icônes de contact : téléphone, WhatsApp, Skype, Zoom, Teams
- Iframe Google Maps intégrée
- Bouton d'appel direct sur mobile

---

## 3. Système de design visuel

### Palette de couleurs
```css
--color-bg:        #FAFAF7;  /* crème, fond principal */
--color-surface:   #FFFFFF;  /* cartes, sections */
--color-primary:   #6B8F71;  /* vert sauge, CTA, accents */
--color-secondary: #C9A96E;  /* or doux, highlights */
--color-text:      #1A1A2E;  /* quasi-noir */
--color-muted:     #6B7280;  /* texte secondaire */
--color-border:    #E5E7EB;  /* séparateurs */
```

### Typographie
- **Titres :** Playfair Display (Google Fonts) — élégance, caractère
- **Corps :** Nunito (Google Fonts) — douceur, lisibilité

### Composants
- Cartes : `border-radius: 16px`, `box-shadow: 0 4px 20px rgba(0,0,0,0.06)`
- Bouton primaire : fond `--color-primary`, texte blanc, hover avec lift (`translateY(-2px)`)
- Séparateurs entre sections : vagues SVG douces (pas de lignes droites)
- Icônes : Lucide Icons via CDN

### Responsive
- Mobile-first, breakpoints à `768px` et `1200px`
- Nav mobile : menu hamburger avec overlay
- Quiz et accordion 100% fonctionnels sur mobile

---

## 4. Système i18n

**Fonctionnement :**
1. Chaque élément textuel du DOM porte un attribut `data-i18n="section.key"`
2. Au chargement, `i18n.js` détecte la langue active (`localStorage.getItem('lang')` ou `navigator.language`, fallback `fr`)
3. Le fichier JSON correspondant est chargé via `fetch('i18n/fr.json')`
4. Tous les éléments `[data-i18n]` sont mis à jour avec la valeur correspondante
5. Le switcher de langue appelle `setLanguage('en')` → recharge le JSON → met à jour le DOM

**Structure JSON type :**
```json
{
  "nav": {
    "about": "À propos",
    "neurodiversity": "Neurodiversité",
    "approaches": "Approches",
    "quiz": "Quiz",
    "faq": "FAQ",
    "contact": "Contact"
  },
  "hero": {
    "tagline": "Comprendre votre cerveau, c'est reconnaître votre singularité.",
    "subtitle": "Psychologue clinicien à Barcelone · Consultations en ligne",
    "cta_primary": "Prendre rendez-vous",
    "cta_secondary": "En savoir plus"
  },
  "quiz": {
    "q1": "J'ai du mal à maintenir mon attention sur une tâche longue.",
    ...
  }
}
```

---

## 5. Animations

**Scroll reveal :**
- `IntersectionObserver` surveille tous les éléments avec la classe `.reveal`
- Au passage dans le viewport → ajout de `.visible` → transition CSS `opacity + translateY`
- Stagger sur les groupes de cartes via `transition-delay` échelonné

**Accessibilité :**
- `@media (prefers-reduced-motion: reduce)` désactive toutes les animations CSS et JS
- Critique pour la clientèle neurodiverse (certains profils TDAH/TSA sont sensibles au mouvement)

**Quiz :**
- Transitions entre questions : `opacity: 0 → 1` avec `transform: translateX`
- Barre de progression : `width` animé via CSS `transition`

---

## 6. Déploiement

Site 100% statique, déployable sur :
- GitHub Pages (gratuit)
- Netlify / Vercel (gratuit, avec HTTPS automatique)
- N'importe quel hébergement FTP classique

**Développement local :** Nécessite un serveur HTTP local pour les `fetch()` i18n (ex. Live Server dans VS Code, ou `python -m http.server`).

---

## 7. Contenu hors scope

- Formulaire de contact fonctionnel (nécessiterait un backend ou service tiers comme Formspree — à ajouter en V2 si souhaité)
- Blog / articles
- Système de réservation en ligne
- Authentification
