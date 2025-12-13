# 📋 Your Action Items - Render Setup

## ✅ What We've Done
1. ✅ Fixed GitHub Actions deprecation (actions/download-artifact v3 → v4)
2. ✅ Created detailed Render setup guides
3. ✅ Backend ConfigController ready
4. ✅ CSRF protection in place
5. ✅ Database schema ready (gastro_configs table)

---

## 🚀 YOUR NEXT STEPS (Today)

### 1. Create PostgreSQL Database on Render (5 minutes)
```
https://dashboard.render.com → New + → PostgreSQL
- Name: twojaknajpa-db
- Database: twojaknajpa
- Region: Frankfurt EU-WEST (or closest)
- Save the Database URL!
```

### 2. Create Backend Service on Render (5 minutes)
```
https://dashboard.render.com → New + → Web Service
- GitHub Repo: stefano-eliksir-backend
- Build: npm ci && npm run build
- Start: npm run start
- Environment: Add DATABASE_URL=[from step 1] + others
- Deploy!
```

### 3. Initialize Database (2 minutes)
```bash
# Once backend is deployed and running
DATABASE_URL="postgresql://user:pass@host:5432/db" npm run seed
```

### 4. Test It Works (1 minute)
```bash
curl https://[your-backend].onrender.com/api/health
# Should return: {"status": "healthy", ...}
```

---

## 📚 Reference Documents

### For Quick Setup (Start here!)
👉 **RENDER_QUICK_START.md** - 5-minute version with essentials

### For Detailed Reference
👉 **RENDER_DATABASE_SETUP.md** - Complete guide with all steps

---

## 🔐 Environment Variables You'll Need

```env
DATABASE_URL=postgresql://user:password@host:5432/twojaknajpa
NODE_ENV=production
SESSION_SECRET=generate-a-random-32-character-string
CORS_ORIGIN=https://twojaknajpa-app.vercel.app

# Optional (if you want SMS features)
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+xxx
```

---

## 🧪 Test Endpoints

Once everything is set up:

```bash
# 1. Health check
curl https://backend-url/api/health

# 2. Get CSRF token
curl https://backend-url/api/csrf-token

# 3. Try login (after seed data exists)
curl -X POST https://backend-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## ✨ After Database is Running

Once your Render database and backend are live:

**Frontend will automatically work because:**
- ✅ AuthContext has CSRF protection
- ✅ configStore has CSRF protection
- ✅ All endpoints are secured with tenant isolation
- ✅ Auto-save (30s) will persist to database

---

## 💡 Pro Tips

1. **Keep DATABASE_URL secret!** Use Render's Environment Variables, not git
2. **Seed script creates test data** - useful for initial testing
3. **First request to Render backend takes ~30s** (free tier spins down) - be patient
4. **Check logs frequently** - Use Render dashboard → Logs tab
5. **Test locally first** - Run `npm run dev` locally with real DATABASE_URL

---

## 📞 When You're Done Setting Up

Tell me:
```
✅ Database created and accessible
✅ Backend deployed on Render
✅ /api/health endpoint responds
```

Then I'll help with **Krok 5: GHOST Bot Marketing** (AI captions + Meta integration) 🚀

---

## 🆘 Stuck? 

Check these in order:
1. Backend logs on Render dashboard (shows actual errors)
2. DATABASE_URL format: `postgresql://user:pass@host:port/db`
3. Render IP whitelisted in database (if applicable)
4. `npm ci && npm run build` works locally first
5. Session secret is set (not empty)

