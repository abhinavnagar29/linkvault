# LinkVault - Setup Guide

Quick setup instructions for running LinkVault locally.

---

## Quick Start (5 Minutes)

### Prerequisites
- Node.js v18+ ([Download](https://nodejs.org/))
- PostgreSQL v14+ ([Download](https://www.postgresql.org/download/))
- Cloudinary account ([Sign up free](https://cloudinary.com/))

---

## Installation Steps

### 1. Clone Repository
```bash
git clone <repository-url>
cd project_1
```

### 2. Database Setup

**Create Database:**
```bash
psql -U postgres
CREATE DATABASE linkvault;
\q
```

**Run Migrations:**
```bash
psql -U postgres -d linkvault -f backend/migrations/combined_migration.sql
```

**Verify:**
```bash
psql -U postgres -d linkvault -c "\dt"
# Should show: users, links tables
```

### 3. Backend Configuration

**Install Dependencies:**
```bash
cd backend
npm install
```

**Create `.env` File:**
```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/linkvault

# Cloudinary (get from cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Secret (generate random string)
JWT_SECRET=your_random_secret_key_here

# Server
PORT=3000
NODE_ENV=development
```

**Test Backend:**
```bash
npm run dev
# Should see: "Server running on port 3000"
```

### 4. Frontend Configuration

**Install Dependencies:**
```bash
cd ../frontend
npm install
```

**Verify Config:**
```javascript
// src/utils/api.js should have:
baseURL: 'http://localhost:3000/api'
```

**Test Frontend:**
```bash
npm run dev
# Should see: "Local: http://localhost:5173"
```

---

## Verification Checklist

**Backend (http://localhost:3000):**
- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Cloudinary credentials valid
- [ ] Health endpoint responds: `GET /health`

**Frontend (http://localhost:5173):**
- [ ] Page loads successfully
- [ ] Can switch between Text/File tabs
- [ ] No console errors

**Integration:**
- [ ] Can register new account
- [ ] Can login successfully
- [ ] Can create text link
- [ ] Can upload file
- [ ] Can view created link

---

## Troubleshooting

### Database Issues

**Error: "database does not exist"**
```bash
psql -U postgres -c "CREATE DATABASE linkvault;"
```

**Error: "password authentication failed"**
```bash
# Update DATABASE_URL in backend/.env with correct password
```

**Error: "relation does not exist"**
```bash
# Run migrations again
psql -U postgres -d linkvault -f backend/migrations/combined_migration.sql
```

### Backend Issues

**Error: "Cannot find module"**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

**Error: "Port 3000 already in use"**
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9
# Or change PORT in .env
```

**Error: "Cloudinary credentials invalid"**
- Verify credentials at cloudinary.com/console
- Check for extra spaces in .env file
- Ensure all three values are set

### Frontend Issues

**Error: "Network Error"**
- Ensure backend is running on port 3000
- Check CORS settings in backend/server.js
- Verify API baseURL in frontend/src/utils/api.js

**Error: "Module not found"**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
# Output in dist/ folder
```

**Backend:**
```bash
cd backend
NODE_ENV=production node server.js
```

---

## Environment Variables

### Backend `.env`
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| DATABASE_URL | Yes | PostgreSQL connection | `postgresql://user:pass@localhost:5432/linkvault` |
| CLOUDINARY_CLOUD_NAME | Yes | Cloudinary cloud name | `your_cloud_name` |
| CLOUDINARY_API_KEY | Yes | Cloudinary API key | `123456789012345` |
| CLOUDINARY_API_SECRET | Yes | Cloudinary API secret | `abcdefghijklmnopqrstuvwxyz` |
| JWT_SECRET | Yes | JWT signing secret | `random_secret_key` |
| PORT | No | Server port | `3000` (default) |
| NODE_ENV | No | Environment | `development` |

### Frontend Configuration
No environment variables needed. API URL is configured in `src/utils/api.js`.

---

## Next Steps

After setup:
1. Create an account at http://localhost:5173/register
2. Login and create your first link
3. Test expiry, password protection, and one-time view
4. Explore My Links dashboard
5. Try search and filter features

---

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/)

---

**Estimated Setup Time:** 10-15 minutes

**Need Help?** Check the main README.md for more details.
