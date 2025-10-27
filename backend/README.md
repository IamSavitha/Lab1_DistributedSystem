# Airbnb Lab 1 Backend (Node.js + Express + MySQL)

This backend implements the **Lab 1 Distributed Systems** project — a simplified Airbnb clone built using **Node.js**, **Express**, and **MySQL**.  
It provides routes and controllers for **Travelers** and **Owners** to manage authentication, properties, favorites, and bookings.

## Tech Stack
- Node.js / Express — REST API framework  
- MySQL — Relational database  
- bcryptjs — Password hashing  
- express-session — Session-based authentication  
- cors — Cross-Origin Resource Sharing  
- dotenv — Environment configuration  
- multer — File uploads (profile/property images)  

## 📁 Project Setup
### 1️. Initialize Node Project
```bash
cd backend
npm init -y
```
### 2️. Install Dependencies
```bash
npm install express mysql2 bcryptjs express-session cors dotenv multer
npm install --save-dev nodemon
```

## Folder Structure
```
backend/
├── server.js
├── config/
│   ├── database.js
│   └── schema.sql
├── controllers/
│   ├── travelerController.js
│   ├── ownerController.js
│   ├── propertyController.js
│   ├── bookingController.js
│   └── favoriteController.js
├── middleware/
│   ├── auth.js
│   └── upload.js
├── routes/
│   ├── travelerRoutes.js
│   ├── ownerRoutes.js
│   ├── propertyRoutes.js
│   ├── ownerPropertyRoutes.js
│   ├── bookingRoutes.js
│   └── favoriteRoutes.js
├── utils/
│   └── validation.js
└── .env
```

## Environment Variables (`.env`)
```
PORT=4000
NODE_ENV=development
SESSION_SECRET=change_me_please

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=airbnb_db
```

## Database Setup
```bash
mysql -u root -p < config/schema.sql
# or
mysql -u root -p < backend/config/schema.sql
```

Verify:
```bash
mysql -u root -p -e "SHOW DATABASES; USE airbnb_db; SHOW TABLES;"
```

## Start the Server
### Add scripts to package.json
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "db:load": "mysql -u root -p < config/schema.sql"
  }
}
```
Run:
```bash
npm run dev
```
Test health:
```
http://localhost:4000/health
```

## Authentication Flow
### Traveler
| Method | Route | Description |
|--------|--------|-------------|
| POST | `/api/traveler/signup` | Register traveler |
| POST | `/api/traveler/login` | Login traveler |
| POST | `/api/traveler/logout` | Logout traveler |
| GET  | `/api/traveler/profile` | View profile |
| PUT  | `/api/traveler/profile` | Update profile |
| POST | `/api/traveler/upload-image` | Upload profile image |

### Owner
| Method | Route | Description |
|--------|--------|-------------|
| POST | `/api/owner/signup` | Register owner |
| POST | `/api/owner/login` | Login owner |
| POST | `/api/owner/logout` | Logout owner |
| GET  | `/api/owner/profile` | View profile |
| PUT  | `/api/owner/profile` | Update profile |

## Property Management
| Method | Route | Description |
|--------|--------|-------------|
| GET | `/api/properties/search` | Search properties |
| GET | `/api/properties/:id` | Get property details |
| GET | `/api/owner/properties` | View all owner properties |
| POST | `/api/owner/properties` | Create property |
| PUT | `/api/owner/properties/:id` | Update property |
| DELETE | `/api/owner/properties/:id` | Delete property |

## Traveler Favorites
| Method | Route | Description |
|--------|--------|-------------|
| POST | `/api/favorites` | Add to favorites |
| GET  | `/api/favorites` | List favorites |
| GET  | `/api/favorites/check/:propertyId` | Check favorite |
| DELETE | `/api/favorites/:propertyId` | Remove favorite |

## Bookings
### Traveler
| Method | Route | Description |
|--------|--------|-------------|
| POST | `/api/bookings/request` | Create booking |
| GET | `/api/bookings/traveler` | Traveler bookings |
| PUT | `/api/bookings/:id/cancel` | Cancel booking |

### Owner
| Method | Route | Description |
|--------|--------|-------------|
| GET | `/api/bookings/owner` | Owner bookings |
| PUT | `/api/bookings/:id/accept` | Accept booking |
| PUT | `/api/bookings/:id/cancel` | Cancel booking |

## Testing with Postman
- Traveler: signup, login, profile, upload image ,create booking
- Owner: signup, login, create/view/update/delete property , accept/delete booking
- all : Search properties

## Troubleshooting
| Problem | Solution |
|----------|-----------|
| express not found | Run `npm install` |
| Route not found | Double-check path and HTTP method |
| Schema not found | Run `mysql -u root -p < backend/config/schema.sql` |
| Session not persisting | Enable cookies in Postman |


