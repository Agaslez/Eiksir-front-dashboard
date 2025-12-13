# 🔧 QUICK REFERENCE - Render Database Setup (5 Minutes)

## TLDR Version

### 1. Create PostgreSQL Database
- Go to https://dashboard.render.com
- Click **New +** → **PostgreSQL**
- Name: `twojaknajpa-db`
- Database: `twojaknajpa`
- **Copy the Database URL!** (you'll need this)

### 2. Create Backend Service
- Click **New +** → **Web Service**
- Select your `stefano-eliksir-backend` GitHub repo
- Build: `npm ci && npm run build`
- Start: `npm run start`
- **Add Environment Variables:**
  ```
  DATABASE_URL=[paste-the-url-from-step-1]
  NODE_ENV=production
  SESSION_SECRET=generate-random-string
  CORS_ORIGIN=https://twojaknajpa-app.vercel.app
  ```
- Click **Deploy**

### 3. Initialize Database
Wait for backend to deploy, then run:
```bash
DATABASE_URL="your-database-url" npm run seed
```

### 4. Test It Works
```bash
curl https://[your-backend-name].onrender.com/api/health
```

Should return:
```json
{"status": "healthy", ...}
```

### 5. Update Frontend
```bash
# In twojaknajpa-app directory
export VITE_API_URL=https://[your-backend-name].onrender.com
npm run build
```

---

## Environment Variables to Add

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
NODE_ENV=production
SESSION_SECRET=abc123def456ghi789jkl012mno345pqr
CORS_ORIGIN=https://yourdomain.vercel.app
TWILIO_ACCOUNT_SID=optional
TWILIO_AUTH_TOKEN=optional
```

---

## Database URL Format

```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

Example:
```
postgresql://dbuser:mySecurePassword123@oregon-postgres.render.com:5432/twojaknajpa
```

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Backend won't start | Check logs, ensure `npm ci && npm run build` works locally |
| Can't connect to DB | Verify DATABASE_URL format and credentials |
| CORS error | Add CORS_ORIGIN to environment variables |
| Timeout on first request | Render free tier spins down, wait 30s for warmup |

---

## Test Commands

```bash
# Health check
curl https://backend-url/api/health

# Get CSRF token
curl https://backend-url/api/csrf-token

# Try login
curl -X POST https://backend-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

Once done → Tell me and I'll help with **Krok 5: GHOST Bot Marketing** 🚀
