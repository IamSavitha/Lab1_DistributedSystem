INSERT INTO owners (name, email, password, phone, city, state, country, created_at)
VALUES 
('John Smith', 'owner1@test.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '555-0101', 'Paris', 'Île-de-France', 'France', NOW()),
('Emma Wilson', 'owner2@test.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '555-0102', 'Tokyo', 'Tokyo', 'Japan', NOW()),
('Marco Rossi', 'owner3@test.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '555-0103', 'Rome', 'Lazio', 'Italy', NOW());

-- 2. 插入测试房源
INSERT INTO properties (owner_id, name, type, city, state, country, address, postal_code, price, max_guests, bedrooms, bathrooms, description, amenities, house_rules, created_at, image_url)
VALUES 
-- 巴黎房源
(1, 'Charming Studio near Eiffel Tower', 'Apartment', 'Paris', 'Île-de-France', 'France', '15 Rue de la Tour', '75015', 120, 2, 1, 1, 'Cozy studio apartment with beautiful Eiffel Tower views. Walking distance to major attractions.', 'WiFi, Kitchen, Heating, Hair Dryer', 'No smoking, No parties', NOW(), 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'),

(1, 'Luxury Apartment in Le Marais', 'Apartment', 'Paris', 'Île-de-France', 'France', '28 Rue des Rosiers', '75004', 250, 4, 2, 2, 'Elegant 2-bedroom apartment in the heart of Le Marais. Perfect for families.', 'WiFi, Kitchen, Air conditioning, Washer, TV', 'No smoking, Check-in after 3pm', NOW(), 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'),

-- 东京房源
(2, 'Modern Apartment in Shibuya', 'Apartment', 'Tokyo', 'Tokyo', 'Japan', '2-21-1 Shibuya', '150-0002', 150, 3, 1, 1, 'Contemporary apartment near Shibuya Station. Easy access to shopping and nightlife.', 'WiFi, Kitchen, AC, TV, Pocket WiFi', 'Quiet hours after 10pm', NOW(), 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400'),

(2, 'Traditional House in Asakusa', 'House', 'Tokyo', 'Tokyo', 'Japan', '3-18-9 Asakusa', '111-0032', 200, 5, 3, 2, 'Authentic Japanese house near Senso-ji Temple. Experience traditional Tokyo living.', 'WiFi, Kitchen, Garden, Tatami rooms, Futon beds', 'Remove shoes indoors', NOW(), 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400'),

-- 罗马房源
(3, 'Vatican View Apartment', 'Apartment', 'Rome', 'Lazio', 'Italy', 'Via Crescenzio 85', '00193', 180, 4, 2, 1, 'Spacious apartment with Vatican views. Walking distance to St. Peters Basilica.', 'WiFi, Kitchen, AC, Balcony, Elevator', 'No smoking', NOW(), 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400'),

(3, 'Colosseum Area Studio', 'Apartment', 'Rome', 'Lazio', 'Italy', 'Via Labicana 50', '00184', 100, 2, 1, 1, 'Convenient studio near the Colosseum. Perfect for solo travelers or couples.', 'WiFi, Kitchen, AC, Coffee maker', 'Check-out before 11am', NOW(), 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400'),

-- 纽约房源
(1, 'Manhattan Loft near Central Park', 'Loft', 'New York', 'NY', 'USA', '100 W 67th St', '10023', 300, 4, 2, 2, 'Stunning loft with Central Park views. Modern amenities and designer furnishings.', 'WiFi, Kitchen, AC, Washer/Dryer, Doorman', 'No smoking, No pets', NOW(), 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'),

-- 伦敦房源
(2, 'Cozy Flat in Notting Hill', 'Apartment', 'London', 'England', 'UK', '45 Portobello Road', 'W11 2QB', 160, 3, 1, 1, 'Charming flat in trendy Notting Hill. Close to Portobello Market.', 'WiFi, Kitchen, Heating, Tea/Coffee', 'Quiet building', NOW(), 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400'),

-- 巴塞罗那房源
(3, 'Beach Apartment in Barceloneta', 'Apartment', 'Barcelona', 'Catalonia', 'Spain', 'Passeig Maritim 32', '08003', 140, 4, 2, 1, 'Beachfront apartment with Mediterranean views. Steps from the beach.', 'WiFi, Kitchen, AC, Balcony, Beach towels', 'No parties', NOW(), 'https://images.unsplash.com/photo-1562663217-6171bcae1ffa?w=400'),

-- 京都房源
(2, 'Traditional Machiya in Gion', 'House', 'Kyoto', 'Kyoto', 'Japan', '570 Gionmachi', '605-0073', 220, 4, 2, 1, 'Historic machiya townhouse in Gion. Authentic Kyoto experience.', 'WiFi, Kitchen, Garden, Yukata robes, Tea set', 'Respect neighbors', NOW(), 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=400');

-- 3. 插入测试旅客（可选）
INSERT INTO travelers (name, email, password, phone, created_at)
VALUES 
('Alice Johnson', 'traveler1@test.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '555-0201', NOW()),
('Bob Williams', 'traveler2@test.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '555-0202', NOW());

-- 验证数据
SELECT COUNT(*) as owner_count FROM owners;
SELECT COUNT(*) as property_count FROM properties;
SELECT COUNT(*) as traveler_count FROM travelers;

-- 查看房源列表
SELECT id, name, city, country, price FROM properties ORDER BY city;