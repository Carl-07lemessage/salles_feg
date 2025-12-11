-- ============================================
-- PART 1: Drop existing policies and functions
-- ============================================

-- Drop all existing policies first
DO $$ 
BEGIN
    -- Drop policies on rooms table
    DROP POLICY IF EXISTS "Public can view available rooms" ON rooms;
    DROP POLICY IF EXISTS "Admin users can manage rooms" ON rooms;
    DROP POLICY IF EXISTS "Admins can manage rooms" ON rooms;
    DROP POLICY IF EXISTS "Authenticated users can manage rooms" ON rooms;
    
    -- Drop policies on reservations table
    DROP POLICY IF EXISTS "Public can create reservations" ON reservations;
    DROP POLICY IF EXISTS "Public can view reservations" ON reservations;
    DROP POLICY IF EXISTS "Admin users can manage reservations" ON reservations;
    DROP POLICY IF EXISTS "Admins can manage reservations" ON reservations;
    DROP POLICY IF EXISTS "Authenticated users can manage reservations" ON reservations;
    
    -- Drop policies on admin_users table
    DROP POLICY IF EXISTS "Authenticated users can view admin users" ON admin_users;
    DROP POLICY IF EXISTS "Users can register as admin" ON admin_users;
    DROP POLICY IF EXISTS "Admin users can view all admins" ON admin_users;
    DROP POLICY IF EXISTS "Users can view own admin record" ON admin_users;
    DROP POLICY IF EXISTS "Service role can manage admin_users" ON admin_users;
EXCEPTION
    WHEN undefined_table THEN
        NULL; -- Ignore if tables don't exist yet
END $$;

-- Drop the is_admin function if it exists
DROP FUNCTION IF EXISTS is_admin(UUID);

-- ============================================
-- PART 2: Create tables
-- ============================================

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL,
  price_per_day DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  amenities TEXT[], -- Array of amenities like 'WiFi', 'Projecteur', 'Climatisation'
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
  total_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create admin users table for authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PART 3: Create indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_reservations_room_id ON reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_reservations_start_time ON reservations(start_time);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_rooms_available ON rooms(available);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- ============================================
-- PART 4: Enable Row Level Security
-- ============================================

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 5: Create RLS policies
-- ============================================

-- Public can read available rooms
CREATE POLICY "Public can view available rooms" ON rooms
  FOR SELECT
  USING (available = true);

-- Public can create reservations
CREATE POLICY "Public can create reservations" ON reservations
  FOR INSERT
  WITH CHECK (true);

-- Public can view all reservations (needed for booking form to check conflicts)
CREATE POLICY "Public can view reservations" ON reservations
  FOR SELECT
  USING (true);

-- Admin policies for rooms - authenticated users only, no table lookups
-- The middleware will verify admin status using service role
CREATE POLICY "Authenticated users can manage rooms" ON rooms
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Admin policies for reservations - authenticated users only
CREATE POLICY "Authenticated users can manage reservations" ON reservations
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Simplified admin_users policies - only allow viewing own record
-- No INSERT policy here - registration uses service role to bypass RLS
CREATE POLICY "Users can view own admin record" ON admin_users
  FOR SELECT
  USING (auth.uid() = id);
