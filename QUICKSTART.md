# Quick Start Guide

Get the School Information System running locally in minutes!

## Prerequisites

- Python 3.9 or higher
- Node.js 18 or higher
- PostgreSQL (or use SQLite for quick testing)

## Step 1: Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd school-system
```

## Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials
```

### Database Setup (PostgreSQL)

```bash
# Create database
createdb school_db

# Update .env
DATABASE_URL=postgresql://localhost/school_db
```

### Or Use SQLite (Quick Testing)

```bash
# Update .env
DATABASE_URL=sqlite:///school.db
```

### Run Backend

```bash
python run.py
```

Backend will be available at: `http://localhost:5000`

## Step 3: Frontend Setup

```bash
# Open a new terminal
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Set up environment
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Run development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## Step 4: Access the Application

### Public Pages
- **Home:** http://localhost:3000
- **Registration:** http://localhost:3000/register
- **Teachers:** http://localhost:3000/teachers
- **Materials:** http://localhost:3000/materials
- **Schedules:** http://localhost:3000/schedules

### Admin Dashboard
- **Login:** http://localhost:3000/admin/login
- **Default Credentials:**
  - Username: `admin`
  - Password: `admin123`

## API Documentation

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Authentication
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Public Endpoints
```bash
# Get teachers
curl http://localhost:5000/api/public/teachers

# Get materials
curl http://localhost:5000/api/public/materials

# Get schedules
curl http://localhost:5000/api/public/schedules
```

## Development Workflow

### Backend Development
```bash
cd backend
source venv/bin/activate

# Run with auto-reload
FLASK_DEBUG=1 python run.py
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Database Migrations
```bash
cd backend
source venv/bin/activate

# Initialize migrations (first time)
flask db init

# Create migration
flask db migrate -m "Description"

# Apply migrations
flask db upgrade
```

## Common Issues

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Database Connection Error
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Try using SQLite for quick testing

### Node Modules Issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Project Structure

```
school-system/
├── backend/              # Flask API
│   ├── app/
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   └── utils/       # Utilities
│   ├── config.py        # Configuration
│   ├── run.py           # Entry point
│   └── requirements.txt # Dependencies
│
└── frontend/            # Next.js App
    ├── src/
    │   ├── app/         # Pages
    │   ├── components/  # UI components
    │   ├── contexts/    # React contexts
    │   └── lib/         # Utilities & API
    └── package.json     # Dependencies
```

## Next Steps

1. **Explore the Code:** Familiarize yourself with the project structure
2. **Customize:** Modify styles, add features, or integrate additional services
3. **Test:** Run tests and ensure everything works
4. **Deploy:** Follow DEPLOYMENT.md to deploy to production

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the main README.md
3. Check the API documentation in the code