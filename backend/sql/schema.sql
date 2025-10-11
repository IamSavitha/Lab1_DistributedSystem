#user table 
CREATE TABLE IF NOT EXISTS users (
  id                INT    AUTO_INCREMENT  PRIMARY KEY,
  role              ENUM('traveler','owner')    NOT NULL,
  name              VARCHAR(100)                NOT NULL,
  email             VARCHAR(160)                NOT NULL UNIQUE,
  password_hash     VARCHAR(255)                NOT NULL,
  phone             VARCHAR(30),
  about             TEXT,
  city              VARCHAR(100),
  state             CHAR(2),
  country           VARCHAR(100),
  languages         VARCHAR(255),
  gender            VARCHAR(30),
  avatar_url        VARCHAR(255),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

#property table

CREATE TABLE IF NOT EXISTS properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  city VARCHAR(100),
  state CHAR(2),
  country VARCHAR(100),
  address VARCHAR(200),
  price_per_night DECIMAL(10,2) NOT NULL,
  bedrooms INT DEFAULT 1,
  bathrooms DECIMAL(3,1) DEFAULT 1.0,
  amenities JSON,
  max_guests INT DEFAULT 1,
  available_from DATE,
  available_to DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);



#property images table

CREATE TABLE IF NOT EXISTS property_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);


#booking table 

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  traveler_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  guests INT NOT NULL,
  status ENUM('PENDING','ACCEPTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  total_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id),
  FOREIGN KEY (traveler_id) REFERENCES users(id)
);



#Favorite table

CREATE TABLE IF NOT EXISTS favorites (
  user_id INT NOT NULL,
  property_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, property_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);



CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_bookings_property_dates ON bookings(property_id, start_date, end_date);
CREATE INDEX idx_users_email ON users(email);
