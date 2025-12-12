# 🚀 Vercel Deployment Settings - Quick Reference

## Vercel Dashboard Configuration

### Build Command
```bash
cd backend && npm install && npm run build && cd ../frontend && npm install && npm run build
```

### Output Directory
```
frontend/dist
```

### Install Command
```
cd api && npm install
```

### Framework Preset
```
Vite
```

---

## Environment Variables (Required)

Add these in **Vercel Dashboard → Settings → Environment Variables**:

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.net/money-tracker` | MongoDB connection string |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.net/money-tracker` | Same as MONGO_URI |
| `MONGO_DB_NAME` | `money-tracker` | Database name |
| `DB_NAME` | `money-tracker` | Same as MONGO_DB_NAME |
| `JWT_SECRET` | `your-64-char-random-string` | JWT signing secret |
| `JWT_EXPIRE` | `7d` | Token expiration time |
| `NODE_ENV` | `production` | Environment |
| `VITE_API_URL` | `/api` | API base URL (relative) |

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Quick Deployment Steps

1. **Import repository** to Vercel
2. **Leave default settings** (they will be overridden by vercel.json)
3. **Add environment variables** (all 8 required variables above)
4. **Click Deploy**
5. **Wait for build** to complete
6. **Test** at `https://your-app.vercel.app/api/health`

---

## Files Changed

- ✅ `backend/package.json` - Fixed build script
- ✅ `backend/src/types/index.ts` - Fixed TypeScript errors
- ✅ `api/package.json` - Added dependencies
- ✅ `vercel.json` - Updated configuration
- ✅ `.env.example` - Created

---

## Verify Deployment

### 1. API Health Check
Visit: `https://your-app.vercel.app/api/health`

Expected:
```json
{
  "success": true,
  "message": "OK",
  "db": {
    "connected": true
  }
}
```

### 2. Frontend Check
Visit: `https://your-app.vercel.app`
- Should show login page
- No console errors

---

## Need Help?

See detailed guide: `vercel_deployment_final.md`
