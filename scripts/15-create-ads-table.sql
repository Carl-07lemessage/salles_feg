-- Migration: Create advertisements table
-- Script 15: Create ads management system

CREATE TABLE IF NOT EXISTS advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  link_text VARCHAR(100) DEFAULT 'En savoir plus',
  position VARCHAR(50) NOT NULL CHECK (position IN ('homepage_top', 'homepage_bottom', 'homepage_middle', 'room_sidebar', 'room_bottom', 'global_popup')),
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  click_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active ads
CREATE POLICY "Anyone can view active ads" ON advertisements
  FOR SELECT
  USING (
    is_active = true 
    AND (start_date IS NULL OR start_date <= NOW()) 
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage ads" ON advertisements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_ads_position ON advertisements(position);
CREATE INDEX IF NOT EXISTS idx_ads_active ON advertisements(is_active);
CREATE INDEX IF NOT EXISTS idx_ads_dates ON advertisements(start_date, end_date);

-- Comments
COMMENT ON TABLE advertisements IS 'Table for managing advertising banners and promotional content';
COMMENT ON COLUMN advertisements.position IS 'Ad placement: homepage_top, homepage_bottom, homepage_middle, room_sidebar, room_bottom, global_popup';
