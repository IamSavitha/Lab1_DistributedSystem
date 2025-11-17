-- Add profile_image column to travelers table
-- Run this migration to enable profile picture upload functionality

USE airbnb;

-- Add profile_image column if it doesn't exist
ALTER TABLE travelers
ADD COLUMN IF NOT EXISTS profile_image LONGTEXT DEFAULT NULL
COMMENT 'Base64 encoded profile image or image URL';

-- Verify the column was added
DESCRIBE travelers;
