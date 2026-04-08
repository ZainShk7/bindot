# BinDot Interview — Vehicle Booking System

Tech stack: **React (Vite + TS)**, **Node.js (Express)**, **MongoDB (Mongoose)**.

## Features (per requirements)
- **Admin auth**: signup + login (JWT)
- **CRUD**: Customers, Vehicles, Bookings
- **Vehicle availability**: prevents double-booking + availability endpoint
- **Dashboard**: totals (customers/vehicles/bookings) + **revenue**

## Prerequisites
- Node.js + npm
- MongoDB running locally (or Atlas connection string)

## Setup

### Backend
Create `backend/.env` (see `backend/.env.example`):

- `PORT=5050` (avoid **5000** on macOS — Apple AirPlay often uses it and returns **403** to HTTP)
- `MONGO_URI=mongodb://127.0.0.1:27017/bindot`
- `JWT_SECRET=<long random string>`

Install + run:

```bash
cd backend
npm install
npm run dev
```

Health check: `GET /health`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

**Dev / CORS:** With `vite dev`, leave `VITE_API_URL` unset. The app calls **`/api/...` on the same origin** and Vite **proxies** to `http://127.0.0.1:5050`, so the browser never does a cross-origin request.

For production builds, set `VITE_API_URL` to your real API origin if it differs from where the static files are hosted.

## Seed demo data (optional)

This creates:
- 1 admin (`admin@bindot.local` / `admin123`)
- sample customers, vehicles, and bookings

```bash
cd backend
npm run seed
```

## API (summary)

### Auth
- `POST /api/auth/signup` `{ email, password }` → `{ token }`
- `POST /api/auth/login` `{ email, password }` → `{ token }`

### Customers (JWT required)
- `GET /api/customers`
- `POST /api/customers`
- `GET /api/customers/:id`
- `PUT /api/customers/:id`
- `DELETE /api/customers/:id`

### Vehicles (JWT required)
- `GET /api/vehicles`
- `GET /api/vehicles/available?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `POST /api/vehicles`
- `GET /api/vehicles/:id`
- `PUT /api/vehicles/:id`
- `DELETE /api/vehicles/:id`

### Bookings (JWT required)
- `GET /api/bookings`
- `POST /api/bookings` `{ customerId, vehicleId, startDate, endDate }`
- `GET /api/bookings/:id`
- `PUT /api/bookings/:id`
- `DELETE /api/bookings/:id`

### Dashboard (JWT required)
- `GET /api/dashboard/summary`

