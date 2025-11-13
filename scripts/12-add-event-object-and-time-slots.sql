-- Add event_object column to reservations table
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS event_object TEXT NOT NULL DEFAULT '';

-- Add time slot columns for start and end times
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS start_hour INTEGER DEFAULT 8;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS end_hour INTEGER DEFAULT 18;

-- Make customer_phone required
ALTER TABLE reservations ALTER COLUMN customer_phone SET NOT NULL;

-- Update existing records to have default values
UPDATE reservations SET event_object = 'Non spécifié' WHERE event_object = '' OR event_object IS NULL;
UPDATE reservations SET customer_phone = 'Non fourni' WHERE customer_phone = '' OR customer_phone IS NULL;

-- Add constraint to ensure valid time range
ALTER TABLE reservations ADD CONSTRAINT valid_hour_range CHECK (start_hour >= 0 AND start_hour <= 23 AND end_hour >= 0 AND end_hour <= 23 AND end_hour > start_hour);
