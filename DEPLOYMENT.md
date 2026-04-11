# Production Deployment Guide

This project has:
- `Male-neuro-network-backend`: Spring Boot 3.4.4 backend packaged as a runnable JAR
- `Male-neuro-network-frontend`: Vite + React frontend

## 1. Production architecture

Recommended setup:
- Deploy backend as a Java service
- Deploy frontend as a static site
- Use MongoDB Atlas for the database
- Point the frontend to the backend with `VITE_API_BASE_URL`
- Add your frontend production URL to backend `CORS_ALLOWED_ORIGINS`

Example:
- Frontend: `https://app.example.com`
- Backend: `https://api.example.com`

## 2. Backend environment variables

Copy `Male-neuro-network-backend/.env.example` and set real values in your hosting platform.

Required production values:
- `PORT`
- `MONGODB_URI`
- `MONGODB_DATABASE`
- `CORS_ALLOWED_ORIGINS`
- `GROQ_API_KEY`
- `JWT_SECRET`
- `APP_BASE_URL`
- `FRONTEND_URL`

Optional mail values:
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_FROM`
- `MAIL_FROM_NAME`
- `MAIL_ENABLED`

### Example backend production values
```env
PORT=8080
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/maleneuro?retryWrites=true&w=majority
MONGODB_DATABASE=maleneuro
CORS_ALLOWED_ORIGINS=https://app.example.com
GROQ_API_KEY=your_real_groq_key
JWT_SECRET=use-a-long-random-secret-at-least-32-characters
APP_BASE_URL=https://api.example.com
FRONTEND_URL=https://app.example.com
MAIL_ENABLED=true
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your-gmail@gmail.com
MAIL_FROM_NAME=Male Neural Network
APP_LOG_LEVEL=INFO
MONGODB_LOG_LEVEL=INFO
```

## 3. Frontend environment variables

Copy `Male-neuro-network-frontend/.env.example` or set variables in your static hosting provider.

### Example frontend production values
```env
VITE_API_BASE_URL=https://api.example.com
```

If frontend and backend are served from the same origin behind a reverse proxy, you can leave `VITE_API_BASE_URL` empty and keep using relative `/api` paths.

## 4. Build commands

### Backend
From `Male-neuro-network-backend`:
```bash
./mvnw clean package
```

Output:
- `target/male-neuro-backend-1.0.0.jar`

Run locally for production-style testing:
```bash
java -jar target/male-neuro-backend-1.0.0.jar
```

### Frontend
From `Male-neuro-network-frontend`:
```bash
npm install
npm run build
```

Output:
- `dist/`

Preview locally:
```bash
npm run preview
```

## 5. Recommended hosting options

### Option A: Render
- Backend: create a Web Service
  - Root directory: `Male-neuro-network-backend`
  - Build command: `./mvnw clean package`
  - Start command: `java -jar target/male-neuro-backend-1.0.0.jar`
- Frontend: create a Static Site
  - Root directory: `Male-neuro-network-frontend`
  - Build command: `npm install && npm run build`
  - Publish directory: `dist`

### Option B: Railway
- Deploy backend service from `Male-neuro-network-backend`
- Deploy frontend service from `Male-neuro-network-frontend`
- Set environment variables in Railway dashboard
- Attach MongoDB Atlas externally

### Option C: VPS with Nginx
- Run backend JAR as a systemd service
- Serve frontend `dist/` with Nginx
- Reverse proxy `/api` to the Spring Boot app

## 6. Important production fixes already applied

The codebase was prepared for deployment by:
- Removing hardcoded backend secrets from Spring properties
- Making backend config read from environment variables
- Making frontend API base URL configurable with `VITE_API_BASE_URL`
- Adding `.env.example` files for backend and frontend

## 7. Security checklist

Before going live:
- Replace `JWT_SECRET` with a strong random secret
- Set a real `MONGODB_URI`
- Set a real `GROQ_API_KEY`
- Set `MAIL_PASSWORD` as an app password, not your normal email password
- Restrict `CORS_ALLOWED_ORIGINS` to your real frontend domain only
- Use HTTPS for both frontend and backend
- Do not commit real secrets to Git

## 8. Deploy order

1. Deploy MongoDB Atlas and get connection string
2. Deploy backend with production env vars
3. Verify backend health/API endpoints
4. Deploy frontend with `VITE_API_BASE_URL`
5. Test login, registration, mail verification, profile APIs, and chat

## 9. Suggested smoke tests after deployment

- Open frontend and confirm it loads
- Register a user
- Confirm verification email link redirects to frontend correctly
- Log in and confirm JWT-based auth works
- Create/update/delete profiles
- Test chat endpoints
- Confirm browser console has no CORS errors
