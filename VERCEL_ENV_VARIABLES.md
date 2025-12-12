# Vercel Environment Variables Setup

## Required Environment Variables for Vercel

Add these in **Vercel Dashboard → Settings → Environment Variables**:

### Frontend Variables

```
VITE_API_URL=/api
```

**Note:** Use `/api` (relative path) since both frontend and backend are on the same Vercel domain.

### Backend Variables

Based on your `.env` file, add these to Vercel:

```
# MongoDB Connection (from your .env)
MONGO_URI=mongodb+srv://MoneytrackerCoder:JmdQkW89iWLqxU7K@moneytrackerdb.zhovfco.mongodb.net/?appName=MoneyTrackerDB
MONGODB_URI=mongodb+srv://MoneytrackerCoder:JmdQkW89iWLqxU7K@moneytrackerdb.zhovfco.mongodb.net/?appName=MoneyTrackerDB
MONGO_DB_NAME=MoneyTrackerDB
DB_NAME=MoneyTrackerDB

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# CORS Configuration
# Replace with your actual Vercel deployment URL after first deploy
FRONTEND_URLS=https://your-app.vercel.app
# Or use VERCEL_URL (auto-provided by Vercel):
# FRONTEND_URLS=https://${VERCEL_URL}

# Server Configuration
NODE_ENV=production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Important Notes

1. **Security Warning:** Your MongoDB credentials are in your `.env` file. Make sure:
   - `.env` is in `.gitignore` (it should be)
   - Never commit `.env` to Git
   - Add these values to Vercel environment variables (they're encrypted)

2. **FRONTEND_URLS:** After your first deployment, Vercel will give you a URL like `https://your-app.vercel.app`. Update `FRONTEND_URLS` with that URL.

3. **JWT_SECRET:** Generate a strong random secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **Environment Scope:** Add these variables for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development (optional, for preview deployments)

## Step-by-Step

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click "Add New"
3. Add each variable one by one
4. Select the environment scope (Production, Preview, Development)
5. Click "Save"
6. Redeploy your application

## After First Deployment

1. Get your Vercel URL (e.g., `https://money-tracker-abc123.vercel.app`)
2. Update `FRONTEND_URLS` in Vercel environment variables:
   ```
   FRONTEND_URLS=https://money-tracker-abc123.vercel.app
   ```
3. Redeploy

