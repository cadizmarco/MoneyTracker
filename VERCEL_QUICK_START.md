# Vercel Deployment - Quick Start

## Prerequisites Checklist

- [ ] GitHub repository with your code
- [ ] Vercel account (sign up at vercel.com)
- [ ] MongoDB Atlas account (free tier available)

## Deployment Steps

### 1. Set Up MongoDB Atlas (5 minutes)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account and cluster
3. Create database user (save username/password!)
4. Allow access from anywhere (Network Access)
5. Copy connection string (replace `<password>` with your password)

### 2. Deploy to Vercel (5 minutes)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. **Don't change any settings** - `vercel.json` handles everything
5. Click "Deploy"

### 3. Add Environment Variables (2 minutes)

In Vercel Dashboard → Settings → Environment Variables, add:

**Frontend:**
```
VITE_API_URL=/api
```

**Backend:**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/money-tracker
JWT_SECRET=<generate-random-64-char-string>
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Redeploy

After adding environment variables, go to Deployments → Redeploy

### 5. Test

1. Visit your Vercel URL
2. Test: `https://your-app.vercel.app/api/health` (should return JSON)
3. Register a new user
4. Login and test the app

## That's It! 🎉

Your full-stack app is now live on Vercel.

## Need Help?

See `VERCEL_DEPLOYMENT.md` for detailed troubleshooting and advanced configuration.

