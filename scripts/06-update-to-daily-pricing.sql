-- Migration script to update from hourly to daily pricing
-- This script updates the rooms table to use daily pricing instead of hourly

-- Add new price_per_day column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'rooms' AND column_name = 'price_per_day') THEN
    ALTER TABLE rooms ADD COLUMN price_per_day DECIMAL(10, 2);
  END IF;
END $$;

-- Convert existing hourly prices to daily prices (multiply by 8 hours as default workday)
UPDATE rooms 
SET price_per_day = price_per_hour * 8 
WHERE price_per_day IS NULL AND price_per_hour IS NOT NULL;

-- Make price_per_day NOT NULL after migration
ALTER TABLE rooms ALTER COLUMN price_per_day SET NOT NULL;

-- Drop the old price_per_hour column if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'rooms' AND column_name = 'price_per_hour') THEN
    ALTER TABLE rooms DROP COLUMN price_per_hour;
  END IF;
END $$;
