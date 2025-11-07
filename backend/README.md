Hotel Booking Backend

Stack: Node.js (Express), MongoDB (Mongoose), JWT auth.

Endpoints (base: /api)
- GET /health -> { status: 'ok' }
- Auth: POST /auth/register, POST /auth/login, GET /auth/me (Bearer token)
- Hotels: GET /hotels, GET /hotels/:id, POST/PATCH/DELETE (admin only)
- Bookings: POST /bookings, GET /bookings/me, POST /bookings/:id/cancel

Quick start (local without Docker)
1) Copy .env.example to .env and adjust values
2) Install deps: npm install
3) Run dev: npm run dev

Docker
- docker-compose-dev.yml runs mongo, backend (port 4000), and frontend (port 3000)

