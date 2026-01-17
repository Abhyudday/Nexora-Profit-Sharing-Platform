# 🚂 Railway Deployment Fix - Monorepo Configuration

## ⚠️ Critical Issue: Root Directory Not Set

Railway is detecting your monorepo but doesn't know which folder to deploy. You MUST configure the **Root Directory** for each service in Railway settings.

---

## 🔧 Step-by-Step Fix

### For Backend Service:

1. Go to your **backend service** in Railway
2. Click **"Settings"** tab
3. Scroll to **"Root Directory"** section
4. Set it to: **`backend`**
5. Click **"Save"**
6. Click **"Deploy"** or wait for auto-redeploy

### For Frontend Service:

1. Go to your **frontend service** in Railway
2. Click **"Settings"** tab
3. Scroll to **"Root Directory"** section
4. Set it to: **`frontend`**
5. Click **"Save"**
6. Click **"Deploy"** or wait for auto-redeploy

---

## 📸 Visual Guide:

```
Railway Dashboard → Your Service → Settings

┌─────────────────────────────────────────┐
│ Settings                                │
├─────────────────────────────────────────┤
│                                         │
│ Root Directory                          │
│ ┌─────────────────────────────────────┐ │
│ │ backend                             │ │  ← Type this for backend
│ └─────────────────────────────────────┘ │
│                                         │
│ OR                                      │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ frontend                            │ │  ← Type this for frontend
│ └─────────────────────────────────────┘ │
│                                         │
│ [Save Changes]                          │
└─────────────────────────────────────────┘
```

---

## ✅ Verification Steps

After setting root directories:

### 1. Check Backend Logs
Should see:
```
🚀 Starting Nexora Backend...
📦 Generating Prisma Client...
✅ Starting Node.js server...
```

### 2. Check Frontend Logs
Should see:
```
Building frontend...
Vite build complete
Starting serve...
```

### 3. Test Backend Health
Visit: `https://your-backend-url.up.railway.app/health`

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## 🎯 Complete Environment Variables Reference

### Backend Service Settings:
```bash
# CRITICAL: Set Root Directory to "backend"

# Environment Variables:
NODE_ENV=production
PORT=5000
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-strong-secret-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-url.up.railway.app
INVESTOR_PROFIT_SHARE=0.60
COMPANY_PROFIT_SHARE=0.40

# Optional (for blockchain features):
NETWORK_RPC_URL=https://mainnet.infura.io/v3/your-key
USDT_CONTRACT_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7
ADMIN_WALLET_ADDRESS=0x...
ADMIN_WALLET_PRIVATE_KEY=xxx

# Optional (for emails):
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@yourdomain.com
```

### Frontend Service Settings:
```bash
# CRITICAL: Set Root Directory to "frontend"

# Environment Variables:
VITE_API_URL=https://your-backend-url.up.railway.app/api
```

---

## 🚨 Common Mistakes to Avoid

❌ **NOT setting Root Directory** - This is the #1 cause of "monorepo" error  
❌ Leaving Root Directory empty  
❌ Using `/backend` or `/frontend` (should be `backend` or `frontend` without slash)  
❌ Setting Root Directory in the wrong service  
❌ Not redeploying after changing Root Directory  

---

## 📋 Deployment Checklist

- [ ] PostgreSQL database created and running
- [ ] Backend service created with Root Directory = `backend`
- [ ] Backend environment variables configured
- [ ] Backend deployed successfully
- [ ] Frontend service created with Root Directory = `frontend`
- [ ] Frontend `VITE_API_URL` points to backend (with `https://`)
- [ ] Frontend deployed successfully
- [ ] Backend `/health` endpoint returns `200 OK`
- [ ] Frontend loads without errors

---

## 🔍 Troubleshooting

### Error: "This is a monorepo..."
**Solution:** Set the Root Directory in service settings (see above)

### Error: "Application failed to respond"
**Possible causes:**
1. Root Directory not set
2. Environment variables missing
3. Database not connected
4. Wrong start command

**Check:**
- Deployment logs for actual error
- Service settings → Root Directory is set correctly
- All required environment variables are present

### CORS Errors
**Solution:** Update `FRONTEND_URL` in backend to match your Railway frontend URL exactly

### Database Connection Issues
**Solution:** Verify `DATABASE_URL=${{Postgres.DATABASE_URL}}` is set correctly in backend

---

## 🎓 Understanding Railway Monorepo

Railway automatically detects monorepos (projects with multiple services in one repo).

**Without Root Directory set:**
- Railway sees multiple folders with `package.json`
- Doesn't know which one to build
- Shows "This is a monorepo" error

**With Root Directory set:**
- Railway builds only the specified folder
- Treats that folder as the project root
- Runs build commands from that directory

---

## 💡 Alternative: Separate Services

If you continue having issues, you can also:

1. Create service from GitHub repo
2. During creation, Railway asks "Root Directory?"
3. Enter `backend` for backend service
4. Enter `frontend` for frontend service

---

## ✨ Success Indicators

When everything is working:

**Backend:**
- Status: ✅ Healthy
- Logs: Server running on port 5000
- `/health` endpoint: Returns 200 OK

**Frontend:**
- Status: ✅ Healthy  
- Logs: Serving on port 8080
- URL: Loads login page

**Together:**
- Login page loads
- No CORS errors in browser console
- Can register/login successfully

---

Need more help? Check Railway's official monorepo docs or provide the full error message from the deployment logs.
