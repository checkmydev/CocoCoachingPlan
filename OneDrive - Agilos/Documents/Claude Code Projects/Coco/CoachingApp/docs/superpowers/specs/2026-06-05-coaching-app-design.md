# Coaching App — Design Spec
*Date: 2026-06-05*

## Overview

Application web de coaching sportif inspirée de Wibbi, permettant à un coach de créer des programmes d'entraînement sur mesure, de les partager avec ses clients et de suivre leur progression.

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + Vite, TailwindCSS, React Router v6 |
| Auth | Supabase Auth (email/password) |
| Base de données | Supabase PostgreSQL |
| Stockage vidéo | Supabase Storage (uploads) + embed YouTube/Vimeo |
| Backend | Supabase Edge Functions (invitation email) |
| Déploiement | GitHub Actions → GitHub Pages |

## Architecture

SPA statique compilée avec Vite, hébergée sur GitHub Pages. Supabase JS SDK utilisé directement depuis le client pour DB, auth et storage. Edge Functions uniquement pour les opérations côté serveur (envoi d'emails d'invitation).

## Rôles et espaces

Deux rôles : `coach` et `client`. Au login, redirection automatique vers l'espace correspondant selon le rôle stocké dans `profiles`.

### Pages coach (`/coach/*`)

| Route | Description |
|-------|-------------|
| `/coach/dashboard` | Vue d'ensemble : clients actifs, activité récente |
| `/coach/exercises` | Bibliothèque d'exercices avec filtres |
| `/coach/exercises/new` | Création d'un exercice |
| `/coach/exercises/:id` | Détail / édition d'un exercice |
| `/coach/programs` | Liste des programmes |
| `/coach/programs/new` | Création d'un programme |
| `/coach/programs/:id` | Éditeur de programme (builder) |
| `/coach/clients` | Liste des clients |
| `/coach/clients/:id` | Profil client + suivi progression |

### Pages client (`/client/*`)

| Route | Description |
|-------|-------------|
| `/client/programs` | Programmes assignés |
| `/client/programs/:id` | Détail programme — planning semaine par semaine |
| `/client/session/:id` | Séance active : vidéos, logging des séries |

## Modèle de données

### `profiles`
```sql
id          uuid references auth.users
role        text  -- 'coach' | 'client'
name        text
email       text
```

### `exercises`
```sql
id              uuid
name            text
description     text
instructions    text
muscle_groups   text[]
equipment       text[]
video_url       text
video_type      text  -- 'youtube' | 'vimeo' | 'upload'
thumbnail_url   text
created_by      uuid references profiles
```

### `programs`
```sql
id          uuid
name        text
description text
coach_id    uuid references profiles
created_at  timestamptz
```

### `program_sessions`
```sql
id          uuid
program_id  uuid references programs
week        int   -- ex: 1
day         int   -- ex: 1
name        text  -- ex: "Full Body A"
```

### `session_exercises`
```sql
id           uuid
session_id   uuid references program_sessions
exercise_id  uuid references exercises
sets         int
reps         text  -- "8-12" ou "10"
rest_seconds int
notes        text
order        int
```

### `client_programs`
```sql
id          uuid
client_id   uuid references profiles
program_id  uuid references programs
start_date  date
status      text  -- 'active' | 'paused' | 'done'
```

### `session_logs`
```sql
id                  uuid
client_id           uuid references profiles
program_session_id  uuid references program_sessions
logged_at           timestamptz
exercises_data      jsonb  -- [{exercise_id, sets_done, reps_done, weight, effort, notes}]
completed           boolean
```

## Row Level Security

- **Coach** : accès complet à ses propres exercices, programmes, et données de ses clients
- **Client** : lecture de ses programmes assignés, lecture/écriture de ses propres logs uniquement

## Fonctionnalités détaillées

### Bibliothèque d'exercices
- Liste filtrée par groupe musculaire et équipement
- Fiche exercice : nom, description, instructions, lecteur vidéo (embed ou player Supabase Storage), tags
- Formulaire de création : upload vidéo **ou** URL YouTube/Vimeo
- Exercices réutilisables dans tous les programmes

### Constructeur de programme
- Ajout de semaines et de séances (structure arborescente)
- Recherche et ajout d'exercices depuis la bibliothèque
- Paramètres par exercice : séries, reps, repos, notes
- Réordonner les exercices par drag & drop (`@dnd-kit`)
- Assignation à un ou plusieurs clients avec date de début

### Vue client
- Liste des programmes avec statut
- Planning semaine par semaine avec état des séances (à faire / complété)
- Séance active :
  - Vidéo de chaque exercice
  - Checkbox par série, saisie poids et reps réels
  - Effort perçu 1–10
  - Notes libres
  - Bouton "Terminer la séance"

### Suivi coach
- Page client : taux de complétion, historique des séances
- Graphique progression par exercice (poids ou reps dans le temps) via `recharts`
- Indicateur visuel des séances réalisées cette semaine

## Edge Functions

| Fonction | Déclencheur | Rôle |
|----------|-------------|------|
| `send-client-invitation` | Coach ajoute un client | Envoie email avec lien de création de compte |

## Déploiement

```
GitHub repo
  └── main branch
       ├── GitHub Action: build Vite → dist/
       └── GitHub Pages serve dist/
```

Variables d'environnement Vite : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (stockées dans GitHub Secrets).

## Hors scope (v1)

- Messagerie coach-client
- Génération PDF du programme
- Paiement / abonnement
- Multi-coach / agence
- App mobile native
