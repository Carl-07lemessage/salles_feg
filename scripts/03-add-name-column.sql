-- Migration script to add name column to existing admin_users table
-- Run this if you already created the admin_users table without the name column

-- Add name column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'admin_users' 
    AND column_name = 'name'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN name TEXT;
  END IF;
END $$;
