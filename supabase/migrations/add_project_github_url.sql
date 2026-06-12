-- Add github_url column to the projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_url text;
