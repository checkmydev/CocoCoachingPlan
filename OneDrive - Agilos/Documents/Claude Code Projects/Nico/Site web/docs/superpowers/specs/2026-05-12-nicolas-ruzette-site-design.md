# Design Spec — Site Web Nicolas Ruzette (v2)

**Date:** 2026-05-12  
**Stack:** HTML / CSS / JS pur + Cal.com embed  
**Langues:** Français, Anglais, Espagnol  
**Structure:** Multi-pages  
**Direction artistique:** Éditoriale / Revue littéraire (Approche A)

---

## 1. Architecture & fichiers

```
/
├── index.html              ← Accueil (hero très fort, invitation)
├── nicolas.html            ← Présentation incarnée + philosophie
├── approche.html           ← Les 8 axes, vue d'ensemble de la méthode
├── neurodiversite.html     ← TDAH / TSA / HPI / masking / fatigue
├── couples.html            ← Thérapie de couple
├── corps-voix.html         ← Système nerveux + corps + voix + cranio-sacral
├── groupes.html            ← Espaces collectifs, groupes de parole
├── addictions.html         ← Addictions, compulsions, gestion émotionnelle
├── livres.html             ← Kang + Guide pratique + univers créatif
├── reserver.html           ← Cal.com embed
├── css/
│   ├── base.css            ← variables CSS, reset, typographie
│   ├── layout.css          ← grid, sections, espacements
│   └── components.css      ← nav, hero, cartes, footer, accordion
├── js/
│   ├── i18n.js             ← chargement JSON + substitution [data-i18n]
│   ├── nav.js              ← menu mobile + scroll behavior
│   └── animations.js       ← IntersectionObserver, scroll reveal
├── i18n/
│   ├── fr.json
│   ├── en.json
│   └── es.json
└── images/
    ├── nicolas-portrait.jpeg        ← WhatsApp Image 23.33.52
    ├── nicolas-groupe.jpeg          ← WhatsApp Image 23.35.28
    └── illustrations/               ← placeholders → remplis par Nicolas
        ├── illustration-01.svg
        ├── illustration-02.svg
        └── illustration-03.svg
```

**Principe i18n :** chaque élément textuel du DOM porte `data-i18n="page.key"`. `i18n.js` charge le JSON de la langue active (`localStorage` → `navigator.language` → fallback `fr`) et injecte le contenu. La langue est commune à toutes les pages.

---

## 2. Système de design visuel

### Palette

```css
--color-bg:      #F5F2ED;  /* blanc cassé chaud, fond principal */
--color-surface: #EDE9E2;  /* sable doux, sections alternées */
--color-ink:     #1A1714;  /* noir chaud, texte principal */
--color-muted:   #8A8278;  /* gris brun, texte secondaire */
--color-accent:  #9B8B78;  /* sable foncé, accents discrets */
--color-border:  #D8D2C8;  /* séparateurs très discrets */
```

Aucune couleur vive. Les photos N&B se posent sur ces teintes comme sur du papier vergé.

### Typographie

| Usage | Police | Graisse | Notes |
|---|---|---|---|
| Grands titres | Cormorant Garamond | 300–400 | letter-spacing négatif (-0.02em) |
| Titres sections | Cormorant Garamond | 400–600 | |
| Citations / poétique | Cormorant Garamond Italic | 400 | centré, grande taille |
| Corps de texte | Inter | 400 | line-height: 1.85 |
| Labels / navigation | Inter | 400–500 | letter-spacing: 0.08em, minuscules |

- Taille de base : `17px`
- Titres héros : `clamp(3.5rem, 8vw, 7rem)`
- Titres sections : `clamp(2rem, 4vw, 3.5rem)`

### Images

- **Portrait** (`nicolas-portrait.jpeg`) : hero `index.html` et `nicolas.html`, format grand (>50% de la largeur)
- **Groupe** (`nicolas-groupe.jpeg`) : `groupes.html` et `approche.html`
- Toujours en N&B, angles nets (pas de `border-radius` sur les photos)
- Jamais de `box-shadow` sur les images — séparation par l'espace

### Espacements

- Sections desktop : `padding: 8rem 0`
- Container principal : `max-width: 1100px`, centré
- Éléments "grands format" (photos hero, citations) : jusqu'à `1400px` ou pleine largeur
- Grille : CSS Grid natif, pas de framework

### Navigation

5 liens seulement dans la nav principale : **accueil · nicolas · approche · livres · réserver**

Les 6 pages thématiques (neurodiversité, couples, corps & voix, addictions, groupes) sont accessibles depuis `approche.html` — pas dans la nav principale, pour garder une navigation éditoriale épurée.

- Fixe en haut, `position: sticky`
- Fond `--color-bg` avec `backdrop-filter: blur(8px)` au scroll
- Liens Inter Regular, `letter-spacing: 0.08em`, minuscules
- Page active : `border-bottom: 1px solid var(--color-accent)`
- Switcher langue discret à droite : `FR · EN · ES`
- Mobile : overlay pleine page, fond `--color-ink`, texte Cormorant blanc, fermeture via bouton × ou touche Échap

---

## 3. Contenu page par page

### `index.html` — Accueil

1. **Hero** : photo portrait pleine hauteur (côté droit ou fond) + titre en Cormorant très grand :  
   *"Un espace où l'on peut cesser de se réparer."*  
   Sous-titre court en Inter léger. CTA discret : lien vers `reserver.html`.
2. **Bloc d'invitation** : 3-4 lignes incarnées, pas de liste de services.
3. **4 portes d'entrée** : grille de cartes sobres (Neurodiversité · Couples · Corps & Voix · Groupes) — un mot fort + une ligne + lien.
4. **Citation isolée** : Cormorant Italic, grande, beaucoup d'espace, pleine largeur.
5. **Footer** : navigation secondaire, switcher langue, lien Cal.com.

### `nicolas.html` — À propos

1. Photo portrait pleine colonne + biographie incarnée en regard (pas de CV).
2. Section philosophie : positionnement central en quelques paragraphes profonds, sans listes à puces.
3. Badges discrets : UCLouvain, Ordre des Psychologues de Belgique, 10+ ans.
4. Placeholder illustration personnelle.
5. Langues de consultation (FR / EN / ES).

### `approche.html` — L'approche

1. Introduction sur la philosophie : ralentissement, permission, fin de la performance, arrêt de la course intérieure.
2. Encart dédié : *Ce que l'IA ne peut pas remplacer* — présence réelle, régulation, qualité de rencontre.
3. 8 axes listés comme table des matières éditoriale, numérotés, liens vers pages dédiées :
   1. Neurodivergence
   2. Régulation du système nerveux
   3. Corps & conscience corporelle
   4. Voix & expression
   5. Thérapie de couple → `couples.html`
   6. Addictions & gestion émotionnelle → `addictions.html`
   7. Présence & non-dualité (woven through, pas de page isolée)
   8. Groupes & espaces collectifs → `groupes.html`
4. Photo groupe.

### `neurodiversite.html`

1. Texte long et nuancé sur le vécu neurodivers : masking, fatigue nerveuse, surcharge, sentiment de décalage, anxiété existentielle.
2. Profils décrits de l'intérieur (pas cliniquement) : TDAH, TSA/Asperger, HPI, Hypersensibilité.
3. **Invitation réflexive** : texte sobre — *"Si certains de ces vécus vous parlent…"* — sans quiz scoré (contraire à la philosophie du site).
4. Placeholder illustration Nicolas.
5. CTA vers `reserver.html`.

### `couples.html`

1. Introduction : incompréhension mutuelle des fonctionnements, pas d'approche "chercher les blessures d'enfance".
2. Ce que le travail propose : rendre visibles les mécanismes, régulation mutuelle, sortir des boucles de réaction.
3. Mention des différences neuropsychologiques dans le couple.
4. CTA réservation.

### `corps-voix.html`

1. **Corps & système nerveux** : théorie polyvagale, ancrage, fatigue chronique, travail crânio-sacral.
2. **Voix & expression** : groupes de libération de la voix, souffle, son, spontanéité — jamais performatif.
3. Placeholder illustration.
4. CTA réservation.

### `groupes.html`

1. Photo groupe de Nicolas.
2. Description des espaces : sécurité, simplicité, absence de jugement, pas de masking nécessaire.
3. Types de groupes proposés : neurodivergence, parole, voix.
4. CTA contact / réservation.

### `addictions.html`

1. Introduction non moraliste : les addictions et compulsions comme tentatives de régulation, stratégies de survie.
2. Problématiques couvertes : addictions comportementales, obsessions, anxiété relationnelle, dépendance affective, difficulté à gérer les émotions.
3. Ce que le travail propose : comprendre ce que le symptôme tente de résoudre, sortir de la lutte contre soi-même.
4. Placeholder illustration.
5. CTA réservation.

### `livres.html`

1. **Kang – El parto neurodivergente** : placeholder couverture + description poétique courte.
2. **Guide pratique pour souffrir** : placeholder couverture + description.
3. Espace pour fragments d'écriture ou extraits.
4. Univers créatif de Nicolas : lien entre écriture et approche thérapeutique.

### `reserver.html`

1. Texte d'accueil très court (2-3 lignes humaines avant le widget).
2. **Cal.com embed** pleine largeur — couleurs configurées : fond `#F5F2ED`, texte `#1A1714`.
3. Informations pratiques : adresse Barcelone, langues, horaires.

---

## 4. Fonctionnalités interactives

### Animations au scroll

- `IntersectionObserver` sur éléments `.reveal` : `opacity 0→1` + `translateY(20px→0)`, durée `0.7s ease`
- Délais échelonnés sur grilles (`.reveal--delay-1`, `--delay-2`, `--delay-3`)
- **`prefers-reduced-motion`** : toutes animations désactivées — essentiel pour la clientèle neurodiverse

### Navigation mobile

- Hamburger → overlay pleine page fond `--color-ink`
- Liens en Cormorant grand, blanc
- Fermeture : bouton × ou touche `Escape`
- `aria-expanded` géré correctement pour l'accessibilité

### Cal.com embed (`reserver.html` uniquement)

```html
<div id="cal-booking"></div>
<script>
  (function(C,A,L){
    let p=function(a,ar){a.q.push(ar)};
    let d=C.document;
    C.Cal=C.Cal||function(){let cal=C.Cal;let ar=arguments;
      if(!cal.loaded){cal.ns={};cal.q=cal.q||[];
      d.head.appendChild(d.createElement("script")).src=A;
      cal.loaded=true}if(ar[0]===L){const api=function(){p(api,arguments)};
      const namespace=ar[1];api.q=api.q||[];
      typeof namespace==="string"?cal.ns[namespace]=api:cal.q.push(ar);
      return}p(cal,ar)};
  })(window,"https://app.cal.com/embed/embed.js","init");
  Cal("init", {origin: "https://cal.com"});
  Cal("inline", {
    elementOrSelector: "#cal-booking",
    calLink: "nicolas-ruzette",
    config: { theme: "light" }
  });
</script>
```

### Système i18n

```javascript
// Flux : localStorage → navigator.language → 'fr'
// i18n.js charge i18n/{lang}.json via fetch()
// Tous les [data-i18n="key"] sont mis à jour
// t('key') disponible globalement pour le JS dynamique
```

Structure JSON : clés organisées par page (`index.*`, `nicolas.*`, `neuro.*`, etc.)

---

## 5. Philosophie de design — règles à respecter

- **Jamais de `box-shadow`** sur les images
- **Jamais de `border-radius`** sur les photos
- **Jamais de couleurs vives** dans les accents
- **Aucun emoji** dans le contenu
- **Pas de listes à puces** dans les textes incarnés — uniquement des paragraphes
- **Pas de badges colorés** — les certifications en texte sobre uniquement
- **Espace > effet** — un élément isolé sur fond vide vaut mieux qu'un effet visuel
- Les illustrations de Nicolas doivent sembler **intégrées naturellement**, jamais décoratives

---

## 6. Ce qui est hors scope (V1)

- Formulaire de contact fonctionnel (Cal.com couvre ce besoin)
- Blog / flux d'articles
- Authentification
- Couvertures des livres (placeholders uniquement — Nicolas fournira les images)
- Illustrations finales (emplacements réservés — Nicolas les fournira)
