# Railway Deployment Guide for Nexora

## Quick Setup

### 1. Database Setup
1. Create a new **PostgreSQL** database in your Railway project
2. Note: Railway automatically provides `DATABASE_URL` - no manual setup needed

### 2. Backend Service Setup

**Root Directory:** `backend`

**Environment Variables:**
```bash
# Database (automatically provided by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Server Configuration
NODE_ENV=production
PORT=5000

# JWT Configuration
JWT_SECRET=your-strong-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Frontend URL (add both Railway URL and custom domain if you have one)
FRONTEND_URL=https://frontend-production-2190.up.railway.app,https://yourdomain.com

# Company/Profit Configuration
INVESTOR_PROFIT_SHARE=0.60
COMPANY_PROFIT_SHARE=0.40

# Blockchain Configuration (Optional - for crypto features)
NETWORK_RPC_URL=https://mainnet.infura.io/v3/your-infura-key
USDT_CONTRACT_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7
ADMIN_WALLET_ADDRESS=0x...
ADMIN_WALLET_PRIVATE_KEY=your-private-key

# Email Configuration (Optional - for email verification)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
```

**Build Command:** Automatic (uses `nixpacks.toml`)

**Start Command:** Automatic (uses `nixpacks.toml`)

### 3. Frontend Service Setup

**Root Directory:** `frontend`

**Environment Variables:**
```bash
# IMPORTANT: Must include https:// protocol
VITE_API_URL=https://backend-production-62aa.up.railway.app/api
```

**Build Command:** Automatic (uses `nixpacks.toml`)

**Start Command:** Automatic (uses `nixpacks.toml`)

---

## Deployment Order

1. ✅ Deploy **Database** first
2. ✅ Deploy **Backend** second (wait for it to complete)
3. ✅ Deploy **Frontend** last

---

## Common Issues & Fixes

### Issue 1: "Application failed to respond"

**Causes:**
- Missing `https://` in `VITE_API_URL`
- Backend not deployed yet
- Database connection issues
- CORS misconfiguration

**Fix:**
1. Verify `VITE_API_URL=https://your-backend-url.up.railway.app/api` (with `https://`)
2. Check backend logs for errors
3. Ensure `FRONTEND_URL` in backend matches your frontend Railway URL
4. Verify `DATABASE_URL` is set correctly

### Issue 2: CORS Errors

**Fix:**
Update backend `FRONTEND_URL` environment variable to include your Railway frontend URL:
```bash
FRONTEND_URL=https://frontend-production-2190.up.railway.app
```

### Issue 3: Database Connection Failed

**Fix:**
Ensure the database service is linked to backend:
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### Issue 4: Build Failures

**Backend Build Issues:**
- Check that all dependencies are in `package.json`
- Verify TypeScript compiles: `npm run build` locally

**Frontend Build Issues:**
- Ensure `VITE_API_URL` is set BEFORE build
- Check for TypeScript errors

---

## Health Check

After deployment, test these endpoints:

**Backend Health:**
```
https://your-backend-url.up.railway.app/health
```
Should return: `{"status":"ok","database":"connected"}`

**Frontend:**
```
https://your-frontend-url.up.railway.app
```
Should load the login page

---

## Post-Deployment Setup

### 1. Seed Level Bonuses (Optional)
The level bonuses are automatically configured on first startup. To manually update:

```bash
# In Railway backend console
npx tsx src/scripts/seed-level-bonuses.ts
```

### 2. Create Admin User

```bash
# In Railway backend console
npx tsx scripts/seed-admin.ts
```

Or register normally and manually update the database to set `isAdmin = true`

---

## Monitoring

### View Logs
- Go to your service in Railway
- Click on "Deployments" tab
- Click on the latest deployment
- View live logs

### Check Database
- Use Railway's built-in database viewer
- Or connect with your local Prisma Studio:
  ```bash
  npx prisma studio
  ```

---

## Custom Domain Setup

1. Go to your service settings in Railway
2. Click "Generate Domain" or add custom domain
3. Update `FRONTEND_URL` in backend to include new domain
4. Redeploy backend

---

## Security Notes

⚠️ **Important:**
- Never commit `.env` files
- Change `JWT_SECRET` to a strong random string
- Keep `ADMIN_WALLET_PRIVATE_KEY` secure
- Use environment variables for all secrets

---

## Support

If you encounter issues:
1. Check Railway deployment logs
2. Verify all environment variables are set correctly
3. Test backend `/health` endpoint
4. Check browser console for frontend errors
