-- Update existing rooms to use actual image URLs from public folder
UPDATE rooms SET image_url = '/salle-de-conf-rence-moderne.jpg' WHERE name = 'Salle de Conférence A';
UPDATE rooms SET image_url = '/salle-de-r-union-intime.jpg' WHERE name = 'Salle de Réunion B';
UPDATE rooms SET image_url = '/salle-de-formation.jpg' WHERE name = 'Salle de Formation C';
UPDATE rooms SET image_url = '/salle-polyvalente--v-nement.jpg' WHERE name = 'Salle Polyvalente D';
UPDATE rooms SET image_url = '/salle-cr-ative-moderne.jpg' WHERE name = 'Salle Créative E';
UPDATE rooms SET image_url = '/salle-ex-cutive-luxe.jpg' WHERE name = 'Salle Exécutive F';
