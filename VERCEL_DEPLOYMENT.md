# Vercel Deployment Fix - Money Tracker

## Problem
The build was failing with `MODULE_NOT_FOUND` error for rollup native modules. This was caused by:
1. Root `package.json` had hundreds of unnecessary dependencies
2. Vercel wasn't properly configured for the monorepo structure
3. Build commands weren't targeting the frontend directory correctly

## Solution Applied

### 1. Cleaned Root `package.json`
- Removed all unnecessary dependencies (they belong in `frontend/` and `backend/` only)
- Kept only dev dependencies: `concurrently` and `nodemon`
- Added Node.js version requirement

### 2. Created `vercel.json`
- Configured build to run from `frontend/` directory
- Set proper install and build commands
- Configured output directory

## Vercel Project Settings

**IMPORTANT:** In your Vercel dashboard, configure these settings:

1. Go to your project → **Settings** → **General**
2. Set **Root Directory** to: `frontend` (if available, otherwise leave blank)
3. Go to **Build & Development Settings**
4. Verify:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (or leave blank to use vercel.json)
   - **Output Directory**: `dist`
   - **Install Command**: `npm ci` (or leave blank to use vercel.json)

## Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://your-backend-url.com/api
```

Replace `https://your-backend-url.com/api` with your actual backend API URL.

## Deployment Steps

1. **Commit and push the changes:**
   ```bash
   git add .
   git commit -m "Fix Vercel deployment configuration"
   git push
   ```

2. **Vercel will automatically redeploy** (if connected to GitHub)

3. **Or manually trigger deployment** in Vercel dashboard

## If Build Still Fails

### Option 1: Use Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd frontend
vercel
```

### Option 2: Check Node Version
Vercel should use Node 18+ automatically, but you can force it:
- Add `.nvmrc` file in `frontend/` directory with: `18`
- Or set in Vercel dashboard: Settings → Node.js Version → 18.x

### Option 3: Alternative vercel.json
If the current config doesn't work, try this simpler version:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "framework": "vite"
}
```

Then set **Root Directory** in Vercel dashboard to `frontend`.

## Troubleshooting

### Error: "Cannot find module"
- Make sure `frontend/package.json` has all dependencies
- Check that `node_modules` is in `.gitignore` (it should be)

### Error: "Build command failed"
- Check Vercel build logs for specific error
- Try building locally: `cd frontend && npm ci && npm run build`

### Error: "Rollup native module not found"
- This should be fixed now, but if it persists:
  - Clear Vercel build cache
  - Try using `npm install` instead of `npm ci` in vercel.json

## Next Steps

After frontend is deployed:
1. Deploy backend separately (Railway, Render, or Heroku)
2. Update `VITE_API_URL` in Vercel with your backend URL
3. Update backend `FRONTEND_URL` with your Vercel frontend URL

