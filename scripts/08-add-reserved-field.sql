-- Add reserved field to rooms table for admin to mark rooms as reserved
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS reserved BOOLEAN DEFAULT false;

-- Add comment to explain the difference between available and reserved
COMMENT ON COLUMN rooms.available IS 'General availability status of the room';
COMMENT ON COLUMN rooms.reserved IS 'Admin can mark room as reserved/unavailable temporarily';

-- Update existing rooms to have reserved = false
UPDATE rooms SET reserved = false WHERE reserved IS NULL;

-- Create index for reserved field
CREATE INDEX IF NOT EXISTS idx_rooms_reserved ON rooms(reserved);
