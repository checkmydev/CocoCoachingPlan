-- Ajoute la colonne selected_objectives à client_profiles.
-- Stocke un tableau d'IDs d'objectifs choisis lors de l'onboarding (ex: [1]).
ALTER TABLE client_profiles
  ADD COLUMN IF NOT EXISTS selected_objectives JSONB DEFAULT '[]'::jsonb;
