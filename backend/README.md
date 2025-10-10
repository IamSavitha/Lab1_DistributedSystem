Lab 1 – Backend (Node.js + Express + MySQL)
What this service does

The backend is a REST API that powers the Airbnb-style app. 

It handles:

Session-based auth (signup/login/logout) using cookies

Traveler features: search properties, book stays, manage favorites, view history

Owner features: create/edit properties, manage booking requests (Accept/Cancel)

Shared: profiles, dashboards, basic analytics

MySQL for data storage, with an Express session store

Tech stack

Node.js, Express, express-session, express-mysql-session

MySQL (mysql2/promise)

bcryptjs, CORS, morgan, dotenv

(Optional) Swagger UI or Postman collection for API docs

Default ports & URLs

API base URL: http://localhost:4000

Health check: GET /health → { ok: true }