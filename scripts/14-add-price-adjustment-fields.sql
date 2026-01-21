-- Migration: Ajouter les champs pour la réduction demi-journée et l'ajustement de prix admin
-- Script 14: Add price adjustment fields

-- Ajouter les nouveaux champs à la table reservations
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS is_half_day BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS room_price_original DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS room_price_applied DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS admin_adjusted_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS admin_price_note TEXT;

-- Commentaires pour documentation
COMMENT ON COLUMN reservations.is_half_day IS 'True si la réservation est pour 5 heures ou moins (demi-journée avec 50% de réduction)';
COMMENT ON COLUMN reservations.room_price_original IS 'Prix original de la salle sans réduction';
COMMENT ON COLUMN reservations.room_price_applied IS 'Prix de la salle appliqué (avec réduction demi-journée si applicable)';
COMMENT ON COLUMN reservations.admin_adjusted_price IS 'Prix final ajusté manuellement par l''administrateur (null si non modifié)';
COMMENT ON COLUMN reservations.admin_price_note IS 'Note de l''administrateur expliquant l''ajustement de prix';
