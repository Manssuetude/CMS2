-- Add rich-text body column to productions
ALTER TABLE productions ADD COLUMN IF NOT EXISTS body text;
