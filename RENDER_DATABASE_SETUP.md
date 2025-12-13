# 🚀 Render Setup Guide - PostgreSQL Database & Deployment

## PART 1: Create PostgreSQL Database on Render

### Step 1: Log in to Render
1. Go to https://dashboard.render.com/
2. Sign in with your GitHub account (or create account)

### Step 2: Create PostgreSQL Database
1. Click **New +** button → **PostgreSQL**
2. Configure:
   - **Name:** `twojaknajpa-db` (or your preferred name)
   - **Database:** `twojaknajpa` (database name)
   - **User:** `dbuser` (username)
   - **Region:** Select closest to your location (e.g., Frankfurt EU-WEST)
   - **PostgreSQL Version:** 15 (or latest)
   - **Datadog:** Skip for now

3. Click **Create Database**

### Step 3: Get Database Credentials
After database is created, you'll see:
```
External Database URL:
postgresql://dbuser:[PASSWORD]@[HOST]:[PORT]/twojaknajpa

Internal Database URL:
postgresql://dbuser:[PASSWORD]@[INTERNAL_HOST]:[PORT]/twojaknajpa
```

⚠️ **Save these credentials securely!**

---

## PART 2: Create Backend Service on Render

### Step 1: Deploy Backend Service
1. Click **New +** → **Web Service**
2. Connect your GitHub repository:
   - Select your `stefano-eliksir-backend` repo
   - Click **Connect**

### Step 2: Configure Service
- **Name:** `twojaknajpa-backend`
- **Region:** Same as database (Frankfurt EU-WEST)
- **Branch:** `main`
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm run start` or `node dist/server.js`
- **Environment:** Node
- **Instance Type:** Starter (free tier) or Standard

### Step 3: Set Environment Variables
Click **Environment** and add:

```env
# Database
DATABASE_URL=postgresql://dbuser:[PASSWORD]@[HOST]:[PORT]/twojaknajpa

# Node
NODE_ENV=production

# API Keys (if using)
TWILIO_ACCOUNT_SID=[your_sid]
TWILIO_AUTH_TOKEN=[your_token]
TWILIO_PHONE_NUMBER=[your_number]

# Session
SESSION_SECRET=your-secret-key-here-generate-random-32-chars

# CORS
CORS_ORIGIN=https://twojaknajpa-app.vercel.app
```

### Step 4: Deploy
Click **Deploy** and watch the logs

---

## PART 3: Connect Frontend to Backend

### In twojaknajpa-app:

1. **Update .env.local**
```env
VITE_API_URL=https://twojaknajpa-backend.onrender.com
```

2. **Or update Vercel environment variables** (after deploying to Vercel):
   - Go to Vercel project → Settings → Environment Variables
   - Add: `VITE_API_URL=https://twojaknajpa-backend.onrender.com`

---

## PART 4: Initialize Database Schema

### Option A: Using Drizzle CLI (Recommended)
```bash
# From backend directory
DATABASE_URL="postgresql://user:pass@host:port/db" npx drizzle-kit push:pg
```

### Option B: Using Seed Script
```bash
# From backend directory
DATABASE_URL="postgresql://user:pass@host:port/db" npm run seed
```

### Option C: Manual SQL Migration
Run the SQL migrations from `server/migrations/` folder

---

## PART 5: Test Connection

### Test Backend Health
```bash
curl https://twojaknajpa-backend.onrender.com/api/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-14T10:00:00Z",
  "services": ["auth", "ai", "echo"],
  "version": "1.0.0"
}
```

### Test Auth Endpoint
```bash
curl -X POST https://twojaknajpa-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Test Config Endpoint (Authenticated)
First get CSRF token:
```bash
curl https://twojaknajpa-backend.onrender.com/api/csrf-token
```

Then POST config (with session cookie + CSRF token):
```bash
curl -X POST https://twojaknajpa-backend.onrender.com/api/config \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: [token-from-above]" \
  -d '{"config":{...}}'
```

---

## PART 6: Verify Database Connection

### Check if tables exist:
```bash
# Connect to database
psql postgresql://user:pass@host:port/db

# List tables
\dt

# Check gastro_configs table
SELECT * FROM gastro_configs;
```

---

## TROUBLESHOOTING

### Database Connection Errors
- ❌ **Error: ECONNREFUSED** → Check DATABASE_URL format
- ❌ **Error: 28P01 (auth failed)** → Check username/password
- ❌ **Timeout** → Whitelist Render IP in firewall (if applicable)

### Render Service Not Starting
1. Check logs: Click service → Logs tab
2. Common issues:
   - Missing dependencies: Run `npm ci`
   - Build script failing: Check `npm run build`
   - Missing environment variables: Add to Environment tab

### Frontend Can't Connect to Backend
1. Check CORS origin in backend (should include Vercel domain)
2. Check environment variables in Vercel
3. Test: `curl https://backend-url/api/health`

---

## NEXT STEPS

Once database and backend are running:
1. ✅ Verify auth endpoints work (login/register/logout)
2. ✅ Test config GET/POST with CSRF protection
3. ✅ Deploy frontend to Vercel
4. ✅ Test full dashboard flow (login → save config → live preview)

---

## USEFUL RENDER COMMANDS

```bash
# Restart service
curl -X POST https://api.render.com/v1/services/[service-id]/restart \
  -H "Authorization: Bearer [api-key]"

# View logs in real-time
# Use Render dashboard → Service → Logs tab

# Access database CLI
# Use Render dashboard → Database → Database Details → psql command
```

---

## 📋 CHECKLIST

- [ ] PostgreSQL database created in Render
- [ ] Database credentials saved securely
- [ ] Backend service created on Render
- [ ] Environment variables configured
- [ ] Database schema initialized
- [ ] Backend health check working
- [ ] Auth endpoints responding
- [ ] Config endpoints with CSRF working
- [ ] Frontend can reach backend (CORS OK)
- [ ] Frontend deployed to Vercel (optional)

