-- Add is_visible column to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_services_visible ON services(is_visible);
