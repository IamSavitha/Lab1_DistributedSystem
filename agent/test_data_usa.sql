-- 美国房源测试数据

-- 1. 插入测试房东（美国本土）
INSERT INTO owners (name, email, password, phone, city, state, country, created_at)
VALUES 
('Michael Johnson', 'owner1@test.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '555-0101', 'New York', 'NY', 'USA', NOW()),
('Sarah Davis', 'owner2@test.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '555-0102', 'Los Angeles', 'CA', 'USA', NOW()),
('David Martinez', 'owner3@test.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '555-0103', 'Chicago', 'IL', 'USA', NOW());

-- 2. 插入美国各地房源

-- 纽约房源
INSERT INTO properties (owner_id, name, type, city, state, country, address, postal_code, price, max_guests, bedrooms, bathrooms, description, amenities, house_rules, created_at, image_url)
VALUES 
(1, 'Manhattan Loft near Central Park', 'Loft', 'New York', 'NY', 'USA', '100 W 67th St', '10023', 300, 4, 2, 2, 'Stunning loft with Central Park views. Modern amenities and designer furnishings in the heart of Manhattan.', 'WiFi, Kitchen, AC, Washer/Dryer, Doorman, Gym access', 'No smoking, No pets', NOW(), 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'),

(1, 'Brooklyn Townhouse with Garden', 'House', 'Brooklyn', 'NY', 'USA', '245 Prospect Park West', '11215', 250, 6, 3, 2, 'Charming townhouse in Park Slope. Private garden, close to Prospect Park and great restaurants.', 'WiFi, Kitchen, AC, Backyard, BBQ grill, Washer/Dryer', 'No parties, Quiet hours after 10pm', NOW(), 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'),

-- 洛杉矶房源
(2, 'Santa Monica Beach House', 'House', 'Santa Monica', 'CA', 'USA', '2455 Ocean Ave', '90405', 400, 6, 3, 3, 'Gorgeous beach house steps from Santa Monica Pier. Ocean views, rooftop deck, perfect for families.', 'WiFi, Kitchen, AC, Beach gear, Rooftop deck, Parking', 'No smoking', NOW(), 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400'),

(2, 'Hollywood Hills Modern Villa', 'Villa', 'Los Angeles', 'CA', 'USA', '8221 Sunset Blvd', '90046', 500, 8, 4, 3, 'Luxurious villa in Hollywood Hills with stunning city views. Infinity pool, home theater, and spa.', 'WiFi, Kitchen, AC, Pool, Hot tub, Home theater, Gym', 'No smoking, No parties over 10 guests', NOW(), 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400'),

-- 旧金山房源
(2, 'Victorian House in Haight-Ashbury', 'House', 'San Francisco', 'CA', 'USA', '1450 Haight St', '94117', 280, 5, 3, 2, 'Classic Victorian home in iconic Haight-Ashbury. Walking distance to Golden Gate Park and great cafes.', 'WiFi, Kitchen, Heating, Washer/Dryer, Vintage decor', 'No smoking, Street parking only', NOW(), 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400'),

-- 芝加哥房源
(3, 'Downtown Chicago Penthouse', 'Apartment', 'Chicago', 'IL', 'USA', '401 N Wabash Ave', '60611', 320, 4, 2, 2, 'Luxurious penthouse in the Loop. Floor-to-ceiling windows with breathtaking skyline and lake views.', 'WiFi, Kitchen, AC, Heating, Parking, Doorman, Lake views', 'No smoking', NOW(), 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'),

-- 迈阿密房源
(1, 'South Beach Art Deco Apartment', 'Apartment', 'Miami Beach', 'FL', 'USA', '1500 Ocean Drive', '33139', 220, 4, 2, 2, 'Stylish apartment in historic Art Deco building. Steps from the beach, nightlife, and restaurants.', 'WiFi, Kitchen, AC, Beach chairs, Pool access', 'No parties, Quiet hours after 11pm', NOW(), 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400'),

-- 西雅图房源
(3, 'Capitol Hill Modern Loft', 'Loft', 'Seattle', 'WA', 'USA', '1234 Broadway E', '98102', 200, 3, 1, 1, 'Contemporary loft in trendy Capitol Hill. Close to coffee shops, restaurants, and nightlife.', 'WiFi, Kitchen, Heating, Coffee maker, Workspace', 'No smoking, Building has gym', NOW(), 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'),

-- 奥斯汀房源
(2, 'South Congress Bungalow', 'Bungalow', 'Austin', 'TX', 'USA', '1500 S Congress Ave', '78704', 180, 4, 2, 1, 'Cozy bungalow on South Congress. Walking distance to food trucks, live music, and downtown Austin.', 'WiFi, Kitchen, AC, Patio, BBQ grill, Parking', 'No smoking, Keep Austin weird!', NOW(), 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'),

-- 波士�ン房源
(1, 'Back Bay Historic Brownstone', 'Townhouse', 'Boston', 'MA', 'USA', '234 Beacon St', '02116', 260, 5, 3, 2, 'Beautiful brownstone in prestigious Back Bay. Close to Newbury Street shopping and Boston Common.', 'WiFi, Kitchen, Heating, Fireplace, Parking', 'No smoking, Historic building', NOW(), 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400');

-- 3. 插入测试旅客（可选）
INSERT INTO travelers (name, email, password, phone, created_at)
VALUES 
('Jessica Smith', 'traveler1@test.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '555-0201', NOW()),
('Robert Brown', 'traveler2@test.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '555-0202', NOW());

-- 验证数据
SELECT COUNT(*) as owner_count FROM owners;
SELECT COUNT(*) as property_count FROM properties;
SELECT COUNT(*) as traveler_count FROM travelers;

-- 查看美国房源列表
SELECT id, name, city, state, price, max_guests FROM properties ORDER BY state, city;
