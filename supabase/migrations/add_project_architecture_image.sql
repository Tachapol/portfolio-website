-- Add architecture_image column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS architecture_image text;
