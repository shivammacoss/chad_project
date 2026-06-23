# Chad Formation Platform

A company-formation platform for Chad (OHADA / ANIE), BusinessAssist-style.

## Structure
- `frontend/` — Vite + React + TypeScript + Tailwind app
- `backend/`  — Express + TypeScript + MongoDB (Mongoose) API
- `docs/`     — design specs and implementation plans

## Run locally
1. MongoDB running locally (or set `MONGODB_URI`).
2. Backend: `cd backend && npm install && npm run seed && npm run dev`  (http://localhost:4000)
3. Frontend: `cd frontend && npm install && npm run dev`  (http://localhost:5173)

Demo logins: admin `admin@chad.demo` / `Admin@123`, user `user@chad.demo` / `User@123`.
