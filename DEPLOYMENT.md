# Deployment Guide

This guide will walk you through deploying the School Information System to production.

## Backend Deployment (Render)

### Option 1: Using render.yaml (Blueprint)

1. Push your code to GitHub
2. Log in to [Render](https://render.com)
3. Click "New" → "Blueprint"
4. Connect your repository
5. Render will automatically detect `render.yaml` and create:
   - Web Service for the Flask API
   - PostgreSQL database

### Option 2: Manual Setup

1. **Create PostgreSQL Database**
   - Go to Dashboard → "New" → "PostgreSQL"
   - Name: `school-system-db`
   - Note the connection string

2. **Create Web Service**
   - Go to Dashboard → "New" → "Web Service"
   - Connect your repository
   - Configure:
     - **Name:** `school-system-api`
     - **Environment:** Python 3
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `gunicorn run:app`
   - Set environment variables:
     - `DATABASE_URL`: (from PostgreSQL)
     - `JWT_SECRET_KEY`: (generate a secure random string)
     - `ADMIN_PASSWORD`: (default admin password)
     - `FLASK_ENV`: `production`

3. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your backend

## Frontend Deployment (Vercel)

### Option 1: Using Vercel Dashboard

1. Push your code to GitHub
2. Log in to [Vercel](https://vercel.com)
3. Click "Add New Project"
4. Import your repository
5. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
6. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://school-system-api.onrender.com`)
7. Click "Deploy"

### Option 2: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET_KEY=your-super-secret-key
ADMIN_PASSWORD=your-secure-admin-password
FLASK_ENV=production
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

## Post-Deployment Checklist

- [ ] Backend health check: Visit `https://your-api.com/api/health`
- [ ] Test login with default credentials
- [ ] Change default admin password
- [ ] Verify frontend can connect to backend
- [ ] Test all major features
- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificates (auto-enabled on Render/Vercel)

## Troubleshooting

### Backend Issues

**Database connection errors:**
- Verify `DATABASE_URL` is correct
- Check if PostgreSQL service is running

**CORS errors:**
- Update `CORS_ORIGINS` in backend config to include your frontend URL

**JWT errors:**
- Ensure `JWT_SECRET_KEY` is set and consistent

### Frontend Issues

**API connection errors:**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check browser console for CORS errors

**Build failures:**
- Ensure all dependencies are in `package.json`
- Check for TypeScript/JavaScript syntax errors

## Updating Deployments

### Backend
1. Push changes to GitHub
2. Render will automatically redeploy

### Frontend
1. Push changes to GitHub
2. Vercel will automatically redeploy

## Custom Domains

### Backend (Render)
1. Go to your Web Service dashboard
2. Click "Settings" → "Custom Domains"
3. Add your domain and follow DNS configuration

### Frontend (Vercel)
1. Go to your Project dashboard
2. Click "Settings" → "Domains"
3. Add your domain and follow DNS configuration

## Monitoring

- **Render Dashboard:** Monitor backend logs and performance
- **Vercel Dashboard:** Monitor frontend analytics and deployments
- **PostgreSQL:** Monitor database usage in Render dashboard