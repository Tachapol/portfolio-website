-- Add new content columns to the projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS overview text,
ADD COLUMN IF NOT EXISTS technologies text,
ADD COLUMN IF NOT EXISTS achievements text,
ADD COLUMN IF NOT EXISTS challenges text;
