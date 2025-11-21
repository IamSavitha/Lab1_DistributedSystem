-- Airbnb Clone Database Schema
-- Version: 1.1
-- Updated: 2025-01-XX
-- 
-- IMPORTANT: If you already have the database running, use migration_v1.1.sql instead
-- This schema.sql is for fresh installations only

DROP DATABASE IF EXISTS airbnb_db;
CREATE DATABASE airbnb_db;
USE airbnb_db;

-- ============================================
-- Travelers Table
-- ============================================
CREATE TABLE travelers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    about TEXT,
    languages VARCHAR(255),
    profile_image LONGTEXT DEFAULT NULL COMMENT 'Base64 encoded profile image or image URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Owners Table
-- ============================================
CREATE TABLE owners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    about TEXT,
    profile_image LONGTEXT DEFAULT NULL COMMENT 'Base64 encoded profile image or image URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Properties Table
-- ============================================
CREATE TABLE properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    max_guests INT NOT NULL,
    image_url VARCHAR(500),
    description TEXT,
    amenities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE,
    INDEX idx_owner (owner_id),
    INDEX idx_city (city),
    INDEX idx_price (price),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Bookings Table
-- ============================================
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    traveler_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    guests INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL DEFAULT NULL,
    cancelled_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (traveler_id) REFERENCES travelers(id) ON DELETE CASCADE,
    INDEX idx_property (property_id),
    INDEX idx_traveler (traveler_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Favorites Table
-- ============================================
CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    traveler_id INT NOT NULL,
    property_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (traveler_id) REFERENCES travelers(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (traveler_id, property_id),
    INDEX idx_traveler (traveler_id),
    INDEX idx_property (property_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Sample Data (Optional)
-- ============================================

-- Sample Travelers
INSERT INTO travelers (name, email, password, city, state, country, about, languages) VALUES
('John Doe', 'john@example.com', '$2b$10$abcdefghijklmnopqrstuv', 'San Francisco', 'CA', 'USA', 'Travel enthusiast', 'English, Spanish'),
('Jane Smith', 'jane@example.com', '$2b$10$abcdefghijklmnopqrstuv', 'New York', 'NY', 'USA', 'Love exploring', 'English, French');

-- Sample Owners
INSERT INTO owners (name, email, password, city, state, country, about) VALUES
('Alice Johnson', 'alice@example.com', '$2b$10$abcdefghijklmnopqrstuv', 'Los Angeles', 'CA', 'USA', 'Property owner with 5+ years experience'),
('Bob Wilson', 'bob@example.com', '$2b$10$abcdefghijklmnopqrstuv', 'Chicago', 'IL', 'USA', 'Hospitality professional');

-- Sample Properties
INSERT INTO properties (owner_id, name, type, location, city, state, country, price, bedrooms, bathrooms, max_guests, image_url, description, amenities) VALUES
(1, 'Cozy Downtown Apartment', 'Apartment', '123 Main St', 'San Francisco', 'CA', 'USA', 150.00, 2, 1, 4, 'https://images.unsplash.com/photo-1502672260066-6bc86e9e4c72?w=400', 'Beautiful apartment in the heart of SF', 'WiFi, Kitchen, Parking'),
(1, 'Beach House', 'House', '456 Ocean Ave', 'Los Angeles', 'CA', 'USA', 300.00, 3, 2, 6, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400', 'Stunning beach view', 'Pool, WiFi, Beach Access'),
(2, 'Chicago Penthouse', 'Penthouse', '789 Tower Blvd', 'Chicago', 'IL', 'USA', 250.00, 2, 2, 4, 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=400', 'Luxury penthouse with city views', 'Gym, WiFi, Parking');

-- Sample Bookings (mix of statuses for testing)
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status, accepted_at) VALUES
(1, 1, '2025-11-15', '2025-11-20', 2, 750.00, 'ACCEPTED', NOW()),
(2, 1, '2025-12-01', '2025-12-05', 4, 1200.00, 'PENDING', NULL),
(3, 2, '2025-11-10', '2025-11-12', 2, 500.00, 'PENDING', NULL);

-- ============================================
-- Verification Queries
-- ============================================

-- Show all tables
SHOW TABLES;

-- Show travelers count
SELECT COUNT(*) as travelers_count FROM travelers;

-- Show properties count
SELECT COUNT(*) as properties_count FROM properties;

-- Show bookings by status
SELECT status, COUNT(*) as count FROM bookings GROUP BY status;

-- ============================================
-- Schema Version Info
-- ============================================
SELECT 
    'airbnb_db' as database_name,
    '1.1' as schema_version,
    NOW() as initialized_at;
