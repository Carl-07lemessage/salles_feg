-- Updated to use price_per_day instead of price_per_hour with XAF prices
-- Insert sample rooms
INSERT INTO rooms (name, description, capacity, price_per_day, image_url, amenities, available) VALUES
  (
    'Salle de Conférence A',
    'Grande salle moderne idéale pour les conférences et présentations professionnelles. Équipée d''un système audio-visuel de pointe.',
    50,
    150000.00,
    '/salle-de-conf-rence-moderne.jpg',
    ARRAY['WiFi', 'Projecteur', 'Climatisation', 'Tableau blanc', 'Système audio'],
    true
  ),
  (
    'Salle de Réunion B',
    'Salle intime parfaite pour les réunions d''équipe et les sessions de brainstorming. Ambiance chaleureuse et productive.',
    12,
    80000.00,
    '/salle-de-r-union-intime.jpg',
    ARRAY['WiFi', 'Écran TV', 'Climatisation', 'Tableau blanc'],
    true
  ),
  (
    'Salle de Formation C',
    'Espace spacieux conçu pour les formations et ateliers. Configuration flexible avec tables modulables.',
    30,
    120000.00,
    '/salle-de-formation.jpg',
    ARRAY['WiFi', 'Projecteur', 'Climatisation', 'Tables modulables', 'Paperboard'],
    true
  ),
  (
    'Salle Polyvalente D',
    'Salle polyvalente adaptable pour événements, séminaires ou réceptions. Grand espace lumineux avec vue panoramique.',
    80,
    200000.00,
    '/salle-polyvalente--v-nement.jpg',
    ARRAY['WiFi', 'Système audio', 'Climatisation', 'Scène', 'Éclairage modulable'],
    true
  ),
  (
    'Salle Créative E',
    'Espace créatif et inspirant pour les sessions de design thinking et innovation. Décoration moderne et colorée.',
    15,
    90000.00,
    '/salle-cr-ative-moderne.jpg',
    ARRAY['WiFi', 'Écran TV', 'Tableau blanc', 'Mobilier confortable'],
    true
  ),
  (
    'Salle Exécutive F',
    'Salle de réunion haut de gamme pour les rencontres exécutives. Mobilier premium et technologie de visioconférence.',
    8,
    180000.00,
    '/salle-ex-cutive-luxe.jpg',
    ARRAY['WiFi', 'Écran 4K', 'Climatisation', 'Visioconférence', 'Service café'],
    true
  );

-- Updated sample reservations to use full-day bookings
-- Insert sample reservations (for demonstration)
INSERT INTO reservations (room_id, customer_name, customer_email, customer_phone, start_time, end_time, status, total_price, notes) 
SELECT 
  id,
  'Jean Dupont',
  'jean.dupont@example.com',
  '+241 XX XX XX XX',
  (NOW() + INTERVAL '2 days')::date,
  (NOW() + INTERVAL '4 days')::date + INTERVAL '23 hours 59 minutes',
  'confirmed',
  450000.00,
  'Réunion trimestrielle - 3 jours'
FROM rooms WHERE name = 'Salle de Conférence A' LIMIT 1;

INSERT INTO reservations (room_id, customer_name, customer_email, customer_phone, start_time, end_time, status, total_price, notes) 
SELECT 
  id,
  'Marie Martin',
  'marie.martin@example.com',
  '+241 YY YY YY YY',
  (NOW() + INTERVAL '5 days')::date,
  (NOW() + INTERVAL '5 days')::date + INTERVAL '23 hours 59 minutes',
  'pending',
  80000.00,
  'Formation équipe - 1 jour'
FROM rooms WHERE name = 'Salle de Réunion B' LIMIT 1;
