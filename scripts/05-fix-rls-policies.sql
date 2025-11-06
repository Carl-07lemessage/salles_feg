-- Script to fix infinite recursion in RLS policies
-- This script can be run safely on an existing database with data

-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Public can view available rooms" ON rooms;
DROP POLICY IF EXISTS "Public can create reservations" ON reservations;
DROP POLICY IF EXISTS "Public can view reservations" ON reservations;
DROP POLICY IF EXISTS "Admin users can manage rooms" ON rooms;
DROP POLICY IF EXISTS "Admin users can manage reservations" ON reservations;
DROP POLICY IF EXISTS "Authenticated users can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Users can register as admin" ON admin_users;
DROP POLICY IF EXISTS "Admin users can view all admins" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage rooms" ON rooms;
DROP POLICY IF EXISTS "Admins can manage reservations" ON reservations;
DROP POLICY IF EXISTS "Users can view own admin record" ON admin_users;
DROP POLICY IF EXISTS "Service role can manage admin_users" ON admin_users;
DROP POLICY IF EXISTS "Authenticated users can manage rooms" ON rooms;
DROP POLICY IF EXISTS "Authenticated users can manage reservations" ON reservations;

-- Drop the problematic is_admin function if it exists
DROP FUNCTION IF EXISTS is_admin(UUID);

-- Create new simplified policies without circular references

-- PUBLIC POLICIES (no authentication required)

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

-- ADMIN POLICIES (authenticated users only)
-- The middleware verifies admin status using service role, so we just check authentication here

-- Authenticated users can manage rooms
CREATE POLICY "Authenticated users can manage rooms" ON rooms
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Authenticated users can manage reservations
CREATE POLICY "Authenticated users can manage reservations" ON reservations
  FOR ALL
  USING (auth.role() = 'authenticated');

-- ADMIN_USERS POLICIES
-- Only allow viewing own record - no circular references
-- Registration uses service role to bypass RLS

CREATE POLICY "Users can view own admin record" ON admin_users
  FOR SELECT
  USING (auth.uid() = id);
