-- Migration: Add profile_image and fix booking status
-- Version: 1.1
-- Date: 2025-01-XX
-- Description: Add profile images support and ensure booking status consistency

-- ============================================
-- 1. Add profile_image column to travelers
-- ============================================
ALTER TABLE travelers 
ADD COLUMN IF NOT EXISTS profile_image LONGTEXT DEFAULT NULL
COMMENT 'Base64 encoded profile image or image URL';

-- ============================================
-- 2. Add profile_image column to owners (optional, for future)
-- ============================================
ALTER TABLE owners 
ADD COLUMN IF NOT EXISTS profile_image LONGTEXT DEFAULT NULL
COMMENT 'Base64 encoded profile image or image URL';

-- ============================================
-- 3. Ensure proper indexes exist
-- ============================================
-- Check if index exists before creating
-- (MySQL will error if index already exists)

-- Add index on booking status for faster filtering
CREATE INDEX IF NOT EXISTS idx_booking_status ON bookings(status);

-- Add index on traveler_id for faster profile queries
CREATE INDEX IF NOT EXISTS idx_booking_traveler ON bookings(traveler_id);

-- ============================================
-- 4. Fix existing test data (if needed)
-- ============================================

-- Reset booking statuses for testing
-- Only run if you want to reset test data
-- UPDATE bookings 
-- SET 
--     status = CASE 
--         WHEN id % 3 = 0 THEN 'PENDING'
--         WHEN id % 3 = 1 THEN 'ACCEPTED'
--         ELSE 'CANCELLED'
--     END,
--     accepted_at = CASE 
--         WHEN id % 3 = 1 THEN NOW()
--         ELSE NULL
--     END,
--     cancelled_at = CASE 
--         WHEN id % 3 = 2 THEN NOW()
--         ELSE NULL
--     END;

-- ============================================
-- 5. Verify migration
-- ============================================

-- Check travelers table
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'travelers'
AND COLUMN_NAME = 'profile_image';

-- Check owners table
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'owners'
AND COLUMN_NAME = 'profile_image';

-- Show indexes on bookings
SHOW INDEXES FROM bookings WHERE Key_name LIKE 'idx_%';

-- ============================================
-- Migration Complete
-- ============================================
SELECT 'Migration v1.1 completed successfully!' AS status;
