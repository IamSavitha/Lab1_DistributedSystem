-- ============================================================
-- Complete Test Data: Travelers and Bookings
-- Import this file to test AI Agent database integration
-- ============================================================

-- 1. Insert Test Travelers (Diverse profiles for testing)
INSERT INTO travelers (name, email, password, phone, created_at) VALUES 
-- Family travelers
('Sarah Johnson', 'sarah.johnson@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0201', NOW()),
('Michael Chen', 'michael.chen@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0202', NOW()),

-- Couple travelers
('Emma Rodriguez', 'emma.rodriguez@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0203', NOW()),
('James Wilson', 'james.wilson@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0204', NOW()),

-- Solo travelers
('Olivia Martinez', 'olivia.martinez@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0205', NOW()),
('David Lee', 'david.lee@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0206', NOW()),

-- Group/Friends travelers
('Jessica Brown', 'jessica.brown@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0207', NOW()),
('Robert Taylor', 'robert.taylor@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '+1-555-0208', NOW());

-- 2. Get property IDs for bookings
-- We'll reference the properties that were inserted earlier
-- Property 1: Manhattan Loft near Central Park (New York)
-- Property 2: Brooklyn Townhouse with Garden (New York)
-- Property 3: Santa Monica Beach House (Los Angeles)
-- Property 4: Hollywood Hills Modern Villa (Los Angeles)
-- Property 5: Victorian House in Haight-Ashbury (San Francisco)
-- Property 6: Downtown Chicago Penthouse (Chicago)
-- Property 7: South Beach Art Deco Apartment (Miami)
-- Property 8: Capitol Hill Modern Loft (Seattle)
-- Property 9: South Congress Bungalow (Austin)
-- Property 10: Back Bay Historic Brownstone (Boston)

-- 3. Insert Test Bookings (Various scenarios)

-- Booking 1: Family Trip to New York (Vegetarian family with kids)
-- Sarah Johnson's family visiting NYC
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(1, 1, '2025-11-01', '2025-11-05', 4, 1200.00, 'confirmed', NOW());
-- Scenario: Family with 2 kids, vegetarian, love museums
-- Property: Manhattan Loft near Central Park ($300/night × 4 nights)

-- Booking 2: Romantic Couple Trip to Los Angeles
-- Emma Rodriguez and partner visiting Santa Monica
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(3, 3, '2025-12-15', '2025-12-18', 2, 1200.00, 'confirmed', NOW());
-- Scenario: Romantic couple, high budget, love beaches and fine dining
-- Property: Santa Monica Beach House ($400/night × 3 nights)

-- Booking 3: Solo Adventure in Chicago
-- Olivia Martinez solo trip for architecture photography
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(6, 5, '2025-10-20', '2025-10-23', 1, 960.00, 'confirmed', NOW());
-- Scenario: Solo traveler, budget-conscious, loves architecture and photography
-- Property: Downtown Chicago Penthouse ($320/night × 3 nights)

-- Booking 4: Friends Trip to Miami
-- Jessica Brown and friends, beach party vacation
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(7, 7, '2026-01-10', '2026-01-15', 4, 1100.00, 'confirmed', NOW());
-- Scenario: Group of friends, medium budget, beaches and nightlife
-- Property: South Beach Art Deco Apartment ($220/night × 5 nights)

-- Booking 5: Vegan Foodie Solo Trip to San Francisco
-- David Lee exploring SF vegan food scene
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(5, 6, '2025-11-15', '2025-11-19', 1, 1120.00, 'confirmed', NOW());
-- Scenario: Solo vegan foodie, tech enthusiast, medium budget
-- Property: Victorian House in Haight-Ashbury ($280/night × 4 nights)

-- Booking 6: Family with Accessibility Needs - Los Angeles
-- Michael Chen family, one member uses wheelchair
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(4, 2, '2025-12-01', '2025-12-05', 5, 2000.00, 'confirmed', NOW());
-- Scenario: Family with wheelchair accessibility needs, visiting theme parks
-- Property: Hollywood Hills Modern Villa ($500/night × 4 nights)

-- Booking 7: Couple Anniversary in Boston
-- James Wilson celebrating anniversary
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(10, 4, '2025-11-25', '2025-11-28', 2, 780.00, 'confirmed', NOW());
-- Scenario: Romantic couple, history lovers, anniversary celebration
-- Property: Back Bay Historic Brownstone ($260/night × 3 nights)

-- Booking 8: Solo Business + Leisure in Seattle
-- Robert Taylor combining work with exploration
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, created_at) VALUES 
(8, 8, '2025-10-15', '2025-10-18', 1, 600.00, 'confirmed', NOW());
-- Scenario: Solo business traveler, coffee lover, wants local experiences
-- Property: Capitol Hill Modern Loft ($200/night × 3 nights)

-- ============================================================
-- Verification Queries
-- ============================================================

-- Check travelers
SELECT 
    'Total Travelers' as info,
    COUNT(*) as count
FROM travelers;

-- Check bookings
SELECT 
    'Total Bookings' as info,
    COUNT(*) as count
FROM bookings;

-- View all bookings with details
SELECT 
    b.id as booking_id,
    t.name as traveler_name,
    t.email as traveler_email,
    p.name as property_name,
    p.city,
    p.state,
    p.country,
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

Booking ID 1: Family Trip to NYC
- Traveler: Sarah Johnson
- Location: New York (Manhattan)
- Dates: Nov 1-5, 2025 (4 nights)
- Guests: 4
- Scenario: Family with kids, vegetarian, museum lovers
- Test Query: "We're a family with two kids, vegetarian, love museums and parks"

Booking ID 2: Romantic LA Trip
- Traveler: Emma Rodriguez
- Location: Los Angeles (Santa Monica)
- Dates: Dec 15-18, 2025 (3 nights)
- Guests: 2
- Scenario: Romantic couple, high budget, beaches and dining
- Test Query: "Planning romantic getaway, love beaches and fine dining"

Booking ID 3: Solo Chicago Adventure
- Traveler: Olivia Martinez
- Location: Chicago
- Dates: Oct 20-23, 2025 (3 nights)
- Guests: 1
- Scenario: Solo, budget-conscious, architecture and photography
- Test Query: "Solo trip, love architecture and photography, on a budget"

Booking ID 4: Friends Miami Beach
- Traveler: Jessica Brown
- Location: Miami Beach
- Dates: Jan 10-15, 2026 (5 nights)
- Guests: 4
- Scenario: Group of friends, beaches and nightlife
- Test Query: "Friends trip, want beaches, nightlife, and fun activities"

Booking ID 5: Vegan SF Foodie
- Traveler: David Lee
- Location: San Francisco
- Dates: Nov 15-19, 2025 (4 nights)
- Guests: 1
- Scenario: Solo vegan foodie, tech enthusiast
- Test Query: "Vegan traveler, want to explore SF food scene and tech culture"

Booking ID 6: Accessible LA Family
- Traveler: Michael Chen
- Location: Los Angeles (Hollywood Hills)
- Dates: Dec 1-5, 2025 (4 nights)
- Guests: 5
- Scenario: Family with wheelchair accessibility needs
- Test Query: "Family trip, need wheelchair accessible activities, visiting theme parks"

Booking ID 7: Anniversary Boston
- Traveler: James Wilson
- Location: Boston
- Dates: Nov 25-28, 2025 (3 nights)
- Guests: 2
- Scenario: Anniversary celebration, history lovers
- Test Query: "Celebrating our anniversary, love history and romantic restaurants"

Booking ID 8: Seattle Business+Leisure
- Traveler: Robert Taylor
- Location: Seattle
- Dates: Oct 15-18, 2025 (3 nights)
- Guests: 1
- Scenario: Business traveler, coffee enthusiast
- Test Query: "Business trip but want to explore local coffee culture and attractions"

*/
