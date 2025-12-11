-- Migration script to fix admin_users RLS policies
-- This allows users to register as admins

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can register as admin" ON admin_users;
DROP POLICY IF EXISTS "Admin users can view all admins" ON admin_users;

-- Allow authenticated users to insert their own admin record during registration
CREATE POLICY "Users can register as admin" ON admin_users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow admin users to view all admin records
CREATE POLICY "Admin users can view all admins" ON admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );
