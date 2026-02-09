-- Add is_visible column to incidents table
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT false;

-- Update existing incidents to be visible (optional - remove if you want them hidden by default)
-- UPDATE incidents SET is_visible = true WHERE status != 'resolved';
