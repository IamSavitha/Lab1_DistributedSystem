-- ============================================================
-- Complete Test Data: CLEAN and IMPORT
-- This script will delete old test data and insert fresh data
-- ============================================================

-- 1. Clean up existing test data (if any)
DELETE FROM bookings WHERE traveler_id IN (SELECT id FROM travelers WHERE email LIKE '%@email.com');
DELETE FROM travelers WHERE email LIKE '%@email.com';

-- 2. Insert Test Travelers
INSERT INTO travelers (name, email, password, phone, created_at) VALUES 
('Sarah Johnson', 'sarah.johnson@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0201', NOW()),
('Michael Chen', 'michael.chen@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0202', NOW()),
('Emma Rodriguez', 'emma.rodriguez@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0203', NOW()),
('James Wilson', 'james.wilson@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0204', NOW()),
('Olivia Martinez', 'olivia.martinez@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0205', NOW()),
('David Lee', 'david.lee@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0206', NOW()),
('Jessica Brown', 'jessica.brown@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0207', NOW()),
('Robert Taylor', 'robert.taylor@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0208', NOW());

-- 3. Insert Test Bookings with correct ENUM status values

-- Booking 1: Family Trip to New York (Vegetarian family with kids)
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(1, (SELECT id FROM travelers WHERE email = 'sarah.johnson@email.com'), '2025-11-01', '2025-11-05', 4, 1200.00, 'ACCEPTED', NOW());

-- Booking 2: Romantic LA Trip
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(3, (SELECT id FROM travelers WHERE email = 'emma.rodriguez@email.com'), '2025-12-15', '2025-12-18', 2, 1200.00, 'ACCEPTED', NOW());

-- Booking 3: Solo Chicago Adventure
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(6, (SELECT id FROM travelers WHERE email = 'olivia.martinez@email.com'), '2025-10-20', '2025-10-23', 1, 960.00, 'ACCEPTED', NOW());

-- Booking 4: Friends Miami Beach
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(7, (SELECT id FROM travelers WHERE email = 'jessica.brown@email.com'), '2026-01-10', '2026-01-15', 4, 1100.00, 'ACCEPTED', NOW());

-- Booking 5: Vegan SF Foodie
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(5, (SELECT id FROM travelers WHERE email = 'david.lee@email.com'), '2025-11-15', '2025-11-19', 1, 1120.00, 'ACCEPTED', NOW());

-- Booking 6: Accessible LA Family
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(4, (SELECT id FROM travelers WHERE email = 'michael.chen@email.com'), '2025-12-01', '2025-12-05', 5, 2000.00, 'ACCEPTED', NOW());

-- Booking 7: Anniversary Boston
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(10, (SELECT id FROM travelers WHERE email = 'james.wilson@email.com'), '2025-11-25', '2025-11-28', 2, 780.00, 'ACCEPTED', NOW());

-- Booking 8: Seattle Business+Leisure
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(8, (SELECT id FROM travelers WHERE email = 'robert.taylor@email.com'), '2025-10-15', '2025-10-18', 1, 600.00, 'ACCEPTED', NOW());

-- ============================================================
-- Verification Queries
-- ============================================================

SELECT '=== IMPORT COMPLETE ===' as status;
SELECT '' as blank;

-- Check counts
SELECT 'Total Travelers' as info, COUNT(*) as count FROM travelers WHERE email LIKE '%@email.com'
UNION ALL
SELECT 'Total Bookings', COUNT(*) FROM bookings;

SELECT '' as blank;
SELECT '=== BOOKINGS SUMMARY ===' as status;
SELECT '' as blank;

-- View all bookings with details
SELECT 
    b.id as booking_id,
    t.name as traveler_name,
    p.name as property_name,
    p.city,
    p.state,
    b.start_date,
    b.end_date,
    DATEDIFF(b.end_date, b.start_date) as nights,
    b.guests,
    b.status
FROM bookings b
JOIN travelers t ON b.traveler_id = t.id
JOIN properties p ON b.property_id = p.id
ORDER BY b.id;
