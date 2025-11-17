-- Ajouter les colonnes pour les options de restauration dans la table reservations

ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS lunch_selected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS breakfast_option INTEGER DEFAULT NULL, -- 1, 2, or 3 pour les 3 options
ADD COLUMN IF NOT EXISTS coffee_break_selected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS number_of_guests INTEGER DEFAULT 1;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_reservations_lunch ON reservations(lunch_selected);
CREATE INDEX IF NOT EXISTS idx_reservations_breakfast ON reservations(breakfast_option);
CREATE INDEX IF NOT EXISTS idx_reservations_coffee_break ON reservations(coffee_break_selected);

COMMENT ON COLUMN reservations.lunch_selected IS 'Déjeuner avec entrée, plat principal, dessert - 25,000 FCFA/pers';
COMMENT ON COLUMN reservations.breakfast_option IS 'Option de petit-déjeuner: 1=6000 FCFA, 2=9000 FCFA, 3=12000 FCFA';
COMMENT ON COLUMN reservations.coffee_break_selected IS 'Pause-café - 3,500 FCFA/pers';
COMMENT ON COLUMN reservations.number_of_guests IS 'Nombre de personnes pour calculer les coûts de restauration';
