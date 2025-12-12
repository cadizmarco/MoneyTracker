# Full-Stack Vercel Deployment Guide - Money Tracker

This guide covers deploying the complete Money Tracker application (frontend + backend) on Vercel.

## Architecture

- **Frontend**: React/Vite app deployed as static files
- **Backend**: Express API wrapped as Vercel serverless function in `/api`
- **Database**: MongoDB (MongoDB Atlas recommended for production)

## Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **MongoDB Database**: 
   - Local MongoDB for development
   - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available) for production

## Step 1: Set Up MongoDB Atlas (Production)

1. **Create MongoDB Atlas Account:**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account
   - Create a new cluster (free tier M0)

2. **Configure Database Access:**
   - Go to **Database Access** → **Add New Database User**
   - Create username and password (save these!)
   - Set user privileges to **Read and write to any database**

3. **Configure Network Access:**
   - Go to **Network Access** → **Add IP Address**
   - Click **Allow Access from Anywhere** (or add Vercel IP ranges)
   - This allows Vercel serverless functions to connect

4. **Get Connection String:**
   - Go to **Clusters** → **Connect** → **Connect your application**
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/money-tracker`

## Step 2: Configure Vercel Project

1. **Import Project in Vercel:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Project Settings:**
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: Leave blank (project root)
   - **Build Command**: Leave blank (uses `vercel.json`)
   - **Output Directory**: Leave blank (uses `vercel.json`)
   - **Install Command**: Leave blank (uses `vercel.json`)

## Step 3: Environment Variables

Add these in **Vercel Dashboard → Settings → Environment Variables**:

### Frontend Variables

```
VITE_API_URL=/api
```

**Note:** Use `/api` (relative path) since both frontend and backend are on the same domain.

### Backend Variables

```
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/money-tracker
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/money-tracker
MONGO_DB_NAME=money-tracker
DB_NAME=money-tracker

# JWT Secret (generate a strong random string)
# Use: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=https://your-app.vercel.app
# Or use VERCEL_URL environment variable (auto-provided by Vercel)
# FRONTEND_URL=https://${VERCEL_URL}

# Server Configuration
NODE_ENV=production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important:**
- Replace MongoDB connection string with your actual Atlas connection string
- Generate a strong JWT_SECRET (use the command above)
- Add these for **Production**, **Preview**, and **Development** environments
- After adding, redeploy your application

## Step 4: Deploy

1. **Automatic Deployment:**
   - Push to your main branch: `git push`
   - Vercel will automatically detect changes and deploy

2. **Manual Deployment:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

3. **Monitor Build:**
   - Watch the build logs in Vercel dashboard
   - Ensure both backend and frontend build successfully
   - Check for any errors in the logs

## Step 5: Verify Deployment

1. **Check Frontend:**
   - Visit your Vercel deployment URL
   - Should see the login page

2. **Check Backend API:**
   - Visit: `https://your-app.vercel.app/api/health`
   - Should return JSON with database connection status

3. **Test Functionality:**
   - Register a new user
   - Login
   - Create accounts, transactions, budgets
   - Check browser console for errors

## Project Structure

```
.
├── api/
│   ├── index.ts          # Vercel serverless function wrapper
│   └── package.json      # Serverless function dependencies
├── backend/
│   ├── src/
│   │   └── server.ts     # Express app (exported for serverless)
│   └── package.json
├── frontend/
│   ├── src/
│   └── package.json
├── vercel.json           # Vercel configuration
└── package.json          # Root package.json
```

## How It Works

1. **Build Process:**
   - Vercel builds the backend TypeScript code
   - Vercel builds the frontend React app
   - Both are packaged for deployment

2. **Request Routing:**
   - Requests to `/api/*` → routed to `api/index.ts` serverless function
   - All other requests → served as static files from `frontend/dist`

3. **Serverless Function:**
   - `api/index.ts` wraps the Express app using `serverless-http`
   - Express app handles all API routes
   - MongoDB connection is maintained across function invocations

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Ensure all dependencies are in `package.json` files
- Check that `node_modules` is in `.gitignore`
- Try clearing Vercel build cache

**Error: "Backend build failed"**
- Check TypeScript compilation errors
- Verify `backend/tsconfig.json` is correct
- Test locally: `cd backend && npm run build`

**Error: "Frontend build failed"**
- Check for missing dependencies
- Verify `VITE_API_URL` is set correctly
- Test locally: `cd frontend && npm run build`

### Runtime Errors

**MongoDB Connection Fails:**
- Verify `MONGO_URI` is set correctly in Vercel
- Check MongoDB Atlas network access (allow all IPs or Vercel IPs)
- Verify database user credentials
- Check MongoDB Atlas cluster is running

**CORS Errors:**
- Verify `FRONTEND_URL` matches your Vercel deployment URL
- Check backend CORS configuration in `server.ts`
- Ensure credentials are allowed

**API Returns 404:**
- Check that requests are going to `/api/*` paths
- Verify `vercel.json` rewrites are correct
- Check serverless function logs in Vercel dashboard

**Authentication Issues:**
- Verify `JWT_SECRET` is set in environment variables
- Check token is being sent in Authorization header
- Verify token expiration settings

### Performance Issues

**Cold Starts:**
- First request after inactivity may be slow (serverless cold start)
- Subsequent requests will be faster
- Consider using Vercel Pro for better performance

**Function Timeout:**
- Default timeout is 10 seconds (Hobby plan)
- Increased to 30 seconds in `vercel.json`
- For longer operations, consider Vercel Pro (up to 60s)

## Environment Variables Reference

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | API base URL | `/api` (relative) or `https://api.example.com/api` |

### Backend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `MONGODB_URI` | Alternative MongoDB URI | Same as above |
| `MONGO_DB_NAME` | Database name | `money-tracker` |
| `DB_NAME` | Alternative DB name | `money-tracker` |
| `JWT_SECRET` | JWT signing secret | Random 64+ character string |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-app.vercel.app` |
| `FRONTEND_URLS` | Multiple frontend URLs (comma-separated) | `https://app1.vercel.app,https://app2.vercel.app` |
| `NODE_ENV` | Environment | `production` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend API accessible at `/api/health`
- [ ] MongoDB connection working (check health endpoint)
- [ ] Environment variables set correctly
- [ ] User registration working
- [ ] User login working
- [ ] API calls from frontend successful
- [ ] No console errors in browser
- [ ] CORS configured correctly

## Custom Domain

1. **Add Domain in Vercel:**
   - Go to **Settings** → **Domains**
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Environment Variables:**
   - Update `FRONTEND_URL` with your custom domain
   - Redeploy application

## Monitoring & Analytics

1. **Vercel Analytics:**
   - Enable in **Settings** → **Analytics**
   - Monitor performance and errors

2. **Function Logs:**
   - View in **Deployments** → **Functions** tab
   - Monitor API performance and errors

3. **MongoDB Atlas Monitoring:**
   - Monitor database performance
   - Set up alerts for connection issues

## Cost Considerations

**Vercel Hobby Plan (Free):**
- 100GB bandwidth/month
- Serverless function execution time: 10s (up to 30s with config)
- Unlimited deployments
- Perfect for small to medium applications

**Vercel Pro Plan ($20/month):**
- 1TB bandwidth/month
- Serverless function execution time: up to 60s
- Team collaboration
- Better performance and support

**MongoDB Atlas:**
- Free tier (M0): 512MB storage
- Shared clusters: $9/month
- Dedicated clusters: $57+/month

## Support

If you encounter issues:
1. Check Vercel build logs
2. Check serverless function logs
3. Verify environment variables
4. Test locally first
5. Check MongoDB Atlas connection status

## Next Steps

- Set up CI/CD for automatic deployments
- Configure custom domain
- Set up monitoring and alerts
- Optimize performance
- Add error tracking (Sentry, etc.)
