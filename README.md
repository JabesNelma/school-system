# School Information System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-blue?style=for-the-badge&logo=vercel)](https://school-system-copeunqus-jabes-nelmas-projects.vercel.app/)

A modern, full-stack web application for managing school operations including student registration, teacher profiles, course schedules, and educational materials.

---

## Live Demo

**[Visit the Live Application](https://school-system-copeunqus-jabes-nelmas-projects.vercel.app/)**

**Demo URL:** `https://school-system-copeunqus-jabes-nelmas-projects.vercel.app/`

**Default Admin Login:** `admin` / `admin123` (change after first login)

---

## Project Overview

The **School Information System** is a comprehensive digital platform designed to streamline school management operations. It provides administrators, teachers, and students with an intuitive interface to manage registrations, view schedules, access learning materials, and maintain teacher information.

### Problem Solved

Traditional school management relies on manual processes, spreadsheets, and fragmented systems. This platform centralizes all critical information in one accessible location, reducing administrative overhead and improving information accessibility.

### Target Users

| Role | Description |
|------|-------------|
| **Administrators** | Manage the system, handle student registrations, and oversee all operations |
| **Teachers** | Maintain professional profiles, manage course schedules, and upload educational materials |
| **Students** | Register for courses, view class schedules, access learning materials, and discover teacher information |
| **Public Users** | Browse available teachers, view schedules, and submit student registrations |

---

## Features

- **Admin Dashboard** — Comprehensive management interface with JWT-based role-based access control
- **Student Registration** — Streamlined, validated registration workflow with confirmation
- **Teacher Management** — Complete teacher profiles organized by department with search and filtering
- **Course Schedules** — Interactive schedule management with real-time updates and filtering capabilities
- **Learning Materials** — Upload, organize, categorize, and distribute educational resources
- **Secure Authentication** — JWT token-based authentication with refresh token support
- **Responsive Design** — Fully responsive UI optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme** — User preference toggle with persistent storage
- **CORS-Enabled API** — Secure cross-origin request handling between frontend and backend
- **Real-time Feedback** — Toast notifications and skeleton loading states for better UX

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| Next.js 14+ | React framework with App Router |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations and transitions |
| React Context API | State management |
| Lucide React | Icon library |
| Fetch API | HTTP client with custom wrapper |

### Backend

| Technology | Purpose |
|------------|---------|
| Flask 3.0+ | Python web framework |
| SQLAlchemy | ORM with Flask-SQLAlchemy |
| Flask-JWT-Extended | JWT authentication |
| Flask-Migrate | Database migrations |
| Flask-CORS | Cross-origin resource sharing |
| Gunicorn | WSGI HTTP server |

### Database & Infrastructure

| Technology | Purpose |
|------------|---------|
| PostgreSQL 12+ | Production database |
| SQLite | Local development database |
| Git + GitHub | Version control |
| Vercel | Frontend hosting |
| Render | Backend hosting |

---

## Project Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Admin     │  │   Public     │  │   Shared Components │ │
│  │   Pages     │  │   Pages      │  │   & Context         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API (HTTP/HTTPS)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend (Flask)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Routes    │  │   Models     │  │   Utilities         │ │
│  │   & Logic   │  │   & Database │  │   & Validators      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SQL
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                    │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Overview

- **Frontend**: Next.js application serves as the presentation layer, handling all user interfaces and interactions
- **Backend**: Flask REST API manages business logic, authentication, and data processing
- **Database**: PostgreSQL stores all persistent data including users, schedules, materials, and registrations

---

## Installation & Setup

### Prerequisites

| Requirement | Version | Description |
|-------------|---------|-------------|
| Node.js | 18+ | Frontend runtime |
| Python | 3.11+ | Backend runtime |
| PostgreSQL | 12+ | Production database |
| Git | Latest | Version control |
| npm/yarn | Latest | Frontend package manager |

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/JabesNelma/school-system.git
cd school-system/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
# Create a .env file in the backend folder
```

**.env (Backend)**

```env
DATABASE_URL=sqlite:///school.db
JWT_SECRET_KEY=your-secret-key-change-this-in-production
FLASK_ENV=development
FLASK_APP=run.py
SECRET_KEY=your-flask-secret-key-change-this-in-production
ADMIN_PASSWORD=admin123
CORS_ORIGINS=http://localhost:3000
```

**Start the backend server:**

```bash
python run.py
```

Server runs at: `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install Node.js dependencies
npm install

# Configure environment variables
# Create a .env.local file
```

**.env.local (Frontend)**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENV=development
```

**Start the development server:**

```bash
npm run dev
```

Application runs at: `http://localhost:3000`

---

## Running the Project

### Development Mode

**Terminal 1 - Backend:**

```bash
cd backend
source venv/bin/activate
python run.py
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Access the application at `http://localhost:3000` and login at `/admin/login` with `admin` / `admin123`

### Production Build

**Frontend:**

```bash
cd frontend
npm run build && npm start
```

**Backend:**

```bash
cd backend
gunicorn run:app --workers 4
```

---

## Deployment

### Frontend (Vercel)

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `.next` |

**Environment Variables:**

```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

**Live URL:** https://school-system-copeunqus-jabes-nelmas-projects.vercel.app/

### Backend (Render)

| Setting | Value |
|---------|-------|
| Service Type | Web Service |
| Runtime | Python 3.11.9 |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn run:app` |

**Environment Variables:**

```
PYTHON_VERSION=3.11.9
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET_KEY=your-super-secret-key
ADMIN_PASSWORD=your-secure-admin-password
FLASK_ENV=production
CORS_ORIGINS=https://school-system-copeunqus-jabes-nelmas-projects.vercel.app
```

---

## Folder Structure

```
school-system/
├── backend/
│   ├── app/
│   │   ├── models/         # Database models (Student, Teacher, Schedule, etc.)
│   │   ├── routes/         # API endpoints (auth, admin, public)
│   │   ├── utils/          # Helper functions, validators, seed data
│   │   ├── __init__.py     # Application factory
│   │   └── extensions.py   # Flask extensions initialization
│   ├── config.py           # Application configuration
│   ├── run.py              # Application entry point
│   ├── requirements.txt    # Python dependencies
│   └── gunicorn.conf.py    # Gunicorn configuration
│
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js pages (App Router)
│   │   │   ├── admin/      # Admin dashboard pages
│   │   │   ├── materials/  # Materials page
│   │   │   ├── register/   # Registration page
│   │   │   ├── schedules/  # Schedules page
│   │   │   └── teachers/   # Teachers page
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, Theme, Toast)
│   │   └── lib/            # Utility functions and API wrapper
│   ├── package.json        # Node.js dependencies
│   └── next.config.js      # Next.js configuration
│
├── DEPLOYMENT.md           # Detailed deployment guide
└── README.md               # Project documentation
```

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User authentication |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/teachers` | List all teachers |
| GET | `/api/public/materials` | List all materials |
| GET | `/api/public/schedules` | List all schedules |
| POST | `/api/public/register` | Submit student registration |

### Admin Endpoints (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard/stats` | Dashboard statistics |
| GET | `/api/admin/students` | List all students |
| GET | `/api/admin/teachers` | Manage teachers |
| GET | `/api/admin/schedules` | Manage schedules |
| GET | `/api/admin/materials` | Manage materials |

---

## Screenshots

*To add screenshots:*

1. Create a `screenshots/` directory in the project root
2. Add your screenshots in PNG or JPG format
3. Reference them using relative paths:

```markdown
![Admin Dashboard](./screenshots/admin-dashboard.png)
![Student Registration](./screenshots/registration.png)
```

Recommended screenshot dimensions: 1920x1080 pixels

---

## Roadmap

- [ ] **User Roles Expansion** — Add separate login portals for teachers and students
- [ ] **Parent Portal** — Enable parents to track their children's progress
- [ ] **Attendance Tracking** — Digital attendance system with reports
- [ ] **Grade Management** — Grade entry and academic performance tracking
- [ ] **Notification System** — Email and push notifications for events
- [ ] **Analytics Dashboard** — Advanced reporting and data visualization
- [ ] **Multi-language Support** — Internationalization for multiple languages
- [ ] **Mobile App** — React Native companion mobile application
- [ ] **Online Examination** — Conduct and grade assessments online
- [ ] **Fee Management** — Online fee collection and receipt generation

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository** — Click the Fork button on GitHub
2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit your changes**

   ```bash
   git commit -m 'Add some amazing feature'
   ```

4. **Push to the branch**

   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request** — Describe your changes and submit for review

Please ensure your code follows the existing style and includes appropriate tests.

---

## License

This project is licensed under the MIT License.

---

## Author

**Jabes Nelma**

- GitHub: [@JabesNelma](https://github.com/JabesNelma)
- Repository: [school-system](https://github.com/JabesNelma/school-system)

For issues or questions, [open an issue on GitHub](https://github.com/JabesNelma/school-system/issues).

---

**Built with care for educational institutions.** 🚀

