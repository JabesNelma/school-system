<div align="center">
   <h1>School Information System</h1>
   <p>Full‑stack School Information System with Flask API and Next.js App Router.</p>
   <p><strong>Admin login (default):</strong> admin / admin123 — change after first login.</p>
</div>

## Contents
- Overview
- Tech Stack
- Project Structure
- Prerequisites
- Environment Variables
- Quick Start (Development)
- Database & Migrations
- Common Tasks
- Testing & Health Checks
- Deployment Notes
- Troubleshooting

## Overview
Modern, responsive school platform with:
- Public site: hero, teacher directory, materials, schedules, student registration.
- Admin: JWT auth, dashboard stats, CRUD for students/teachers/materials/schedules, registration review.
- UX: light/dark theme, toasts, skeletons, Framer Motion animations.

## Tech Stack
- 🐍 **Backend:** Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-Migrate, Flask-CORS, PostgreSQL (SQLite for local quick start).
- ⚛️ **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Framer Motion, Lucide Icons.
- 🗄️ **Database:** PostgreSQL (prod), SQLite (local), SQLAlchemy ORM.
- 🧪 **Auth & Security:** JWT, password hashing (Werkzeug), CORS.
- 🎨 **UI/UX:** Tailwind CSS, Framer Motion, theme toggle (light/dark), toast & skeleton states.

## Project Structure
```
school-system/
├── backend/              # Flask API
│   ├── app/              # models, routes, utils, extensions
│   ├── config.py         # config classes
│   ├── run.py            # app entrypoint
│   └── requirements.txt  # Python deps
└── frontend/             # Next.js app
      ├── src/              # app router pages, components, contexts, lib
      └── package.json      # JS deps
```

## Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL (or use SQLite for local dev)

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://username:password@localhost:5432/school_db
JWT_SECRET_KEY=change-me
FLASK_ENV=development
FLASK_APP=run.py
```
For quick local dev you can use SQLite:
```
DATABASE_URL=sqlite:///school.db
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Quick Start (Development)

### 1) Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # edit values as needed
python run.py             # starts on http://localhost:5000
```

### 2) Frontend
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
npm run dev                # starts on http://localhost:3000
```

### 3) Login (Admin)
- URL: http://localhost:3000/admin/login
- Default: **admin / admin123** (change after first login via Users management).

## Database & Migrations (Flask-Migrate)
```bash
cd backend
source venv/bin/activate
flask db init      # first time only
flask db migrate -m "message"
flask db upgrade
```

## Common Tasks
- **Run backend with auto-reload:** `FLASK_DEBUG=1 python run.py`
- **Run frontend dev server:** `npm run dev`
- **Reset frontend cache:** from frontend dir `rm -rf .next && npm run dev`
- **Create admin user manually (if needed):** default seed creates admin/admin123; update password via Users API/UI.

## Testing & Health Checks
- Backend health: `curl http://localhost:5000/api/health`
- Auth test: `curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'`
- Public endpoints: `/api/public/teachers`, `/api/public/materials`, `/api/public/schedules`, `/api/public/register`
- Admin stats (needs Bearer token): `/api/admin/dashboard/stats`

## Deployment Notes
- **Backend (e.g., Render / any WSGI host):**
   - Set env vars: `DATABASE_URL`, `JWT_SECRET_KEY`, `FLASK_ENV=production`.
   - Run with gunicorn using `run.py` / app factory.
- **Frontend (e.g., Vercel):** set `NEXT_PUBLIC_API_URL` to deployed backend URL.

## Troubleshooting
- **JWT errors / 401/422 in admin calls:** clear browser storage (access_token/refresh_token/user) then login again.
- **ChunkLoadError / stale assets:** remove `.next` and restart `npm run dev`.
- **DB auth failures:** verify `DATABASE_URL`; for local quick use SQLite as shown above.
- **CORS issues:** backend uses Flask-CORS; ensure `NEXT_PUBLIC_API_URL` matches backend URL.

## License
MIT