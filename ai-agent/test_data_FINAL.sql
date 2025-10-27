-- ============================================================
-- Complete Test Data: Travelers and Bookings (CORRECT STATUS)
-- Uses proper ENUM values: PENDING, ACCEPTED, CANCELLED
-- ============================================================

-- 1. Insert Test Travelers
INSERT INTO travelers (name, email, password, phone, created_at) VALUES 
('Sarah Johnson', 'sarah.johnson@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0201', NOW()),
('Michael Chen', 'michael.chen@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0202', NOW()),
('Emma Rodriguez', 'emma.rodriguez@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0203', NOW()),
('James Wilson', 'james.wilson@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0204', NOW()),
('Olivia Martinez', 'olivia.martinez@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0205', NOW()),
('David Lee', 'david.lee@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0206', NOW()),
('Jessica Brown', 'jessica.brown@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0207', NOW()),
('Robert Taylor', 'robert.taylor@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0208', NOW());

-- 2. Insert Test Bookings with correct ENUM status values

-- Booking 1: Family Trip to New York (Vegetarian family with kids)
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(1, 1, '2025-11-01', '2025-11-05', 4, 1200.00, 'ACCEPTED', NOW());

-- Booking 2: Romantic LA Trip
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(3, 3, '2025-12-15', '2025-12-18', 2, 1200.00, 'ACCEPTED', NOW());

-- Booking 3: Solo Chicago Adventure
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(6, 5, '2025-10-20', '2025-10-23', 1, 960.00, 'ACCEPTED', NOW());

-- Booking 4: Friends Miami Beach
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(7, 7, '2026-01-10', '2026-01-15', 4, 1100.00, 'ACCEPTED', NOW());

-- Booking 5: Vegan SF Foodie
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(5, 6, '2025-11-15', '2025-11-19', 1, 1120.00, 'ACCEPTED', NOW());

-- Booking 6: Accessible LA Family
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(4, 2, '2025-12-01', '2025-12-05', 5, 2000.00, 'ACCEPTED', NOW());

-- Booking 7: Anniversary Boston
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(10, 4, '2025-11-25', '2025-11-28', 2, 780.00, 'ACCEPTED', NOW());

-- Booking 8: Seattle Business+Leisure
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(8, 8, '2025-10-15', '2025-10-18', 1, 600.00, 'ACCEPTED', NOW());

-- ============================================================
-- Verification Queries
-- ============================================================

-- Check counts
SELECT 'Total Travelers' as info, COUNT(*) as count FROM travelers
UNION ALL
SELECT 'Total Bookings', COUNT(*) FROM bookings;

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
    b.total_price,
    b.status
FROM bookings b
JOIN travelers t ON b.traveler_id = t.id
JOIN properties p ON b.property_id = p.id
ORDER BY b.id;

-- ============================================================
-- Test Scenarios Summary
-- ============================================================
/*
Booking 1: Family NYC - Vegetarian, museums, parks (ACCEPTED)
Booking 2: Romantic LA - Beaches, fine dining (ACCEPTED)
Booking 3: Solo Chicago - Architecture, photography, budget (ACCEPTED)
Booking 4: Friends Miami - Beaches, nightlife (ACCEPTED)
Booking 5: Vegan SF - Food scene, tech culture (ACCEPTED)
Booking 6: Accessible LA - Wheelchair, theme parks (ACCEPTED)
Booking 7: Anniversary Boston - History, romantic (ACCEPTED)
Booking 8: Solo Seattle - Coffee culture, local experiences (ACCEPTED)
*/
