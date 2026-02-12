-- Migration: Add incident fields to services table

ALTER TABLE services 
ADD COLUMN IF NOT EXISTS incident TEXT,
ADD COLUMN IF NOT EXISTS incident_published BOOLEAN DEFAULT false;

ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

ALTER TABLE services 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
