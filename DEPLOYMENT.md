# GitHub Deployment Guide - Money Tracker

This guide will walk you through deploying your Money Tracker application to GitHub and setting it up for production deployment.

## 📋 Prerequisites

- GitHub account
- Git installed on your computer
- Node.js (v18 or higher) installed
- MongoDB Atlas account (for cloud database) or local MongoDB

---

## 🚀 Step 1: Prepare Your Repository

### 1.1 Check Your .gitignore File

Make sure your `.gitignore` file includes sensitive files:

```gitignore
# Environment variables
.env
.env.local
.env.production

# Dependencies
node_modules/
frontend/node_modules/
backend/node_modules/

# Build outputs
dist/
frontend/dist/
backend/dist/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

### 1.2 Create Environment Variable Templates

Create example environment files (these will be committed to GitHub):

**Create `.env.example` in the root directory:**

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGO_URI=mongodb://localhost:27017/money-tracker
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/money-tracker
MONGO_DB_NAME=money-tracker

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
# For production, use your deployed frontend URL:
# FRONTEND_URL=https://your-frontend-domain.com

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Create `frontend/.env.example`:**

```env
VITE_API_URL=http://localhost:5000/api
# For production, use your deployed backend URL:
# VITE_API_URL=https://your-backend-api.com/api
```

---

## 📦 Step 2: Initialize Git Repository

### 2.1 Initialize Git (if not already done)

Open your terminal in the project root directory and run:

```bash
# Check if git is already initialized
git status

# If not initialized, run:
git init
```

### 2.2 Stage All Files

```bash
# Add all files to staging
git add .

# Check what will be committed
git status
```

### 2.3 Create Initial Commit

```bash
git commit -m "Initial commit: Money Tracker full-stack application"
```

---

## 🌐 Step 3: Create GitHub Repository

### 3.1 Create New Repository on GitHub

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the repository details:
   - **Repository name**: `money-tracker` (or your preferred name)
   - **Description**: "Full-stack Money Tracker application with React and Node.js"
   - **Visibility**: Choose **Public** or **Private**
   - **DO NOT** initialize with README, .gitignore, or license (you already have these)
5. Click **"Create repository"**

### 3.2 Connect Local Repository to GitHub

GitHub will show you commands. Run these in your terminal:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/money-tracker.git

# Verify the remote was added
git remote -v
```

### 3.3 Push Your Code to GitHub

```bash
# Push to GitHub (first time)
git branch -M main
git push -u origin main
```

If prompted for credentials:
- Use a **Personal Access Token** (not your password)
- Create one at: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Give it `repo` scope

---

## 🔐 Step 4: Set Up Environment Variables

### 4.1 For Local Development

Create `.env` files in your project (these are gitignored):

**Root `.env` file:**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/money-tracker
MONGO_DB_NAME=money-tracker
JWT_SECRET=your-development-secret-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

**`frontend/.env` file:**
```env
VITE_API_URL=http://localhost:5000/api
```

### 4.2 For Production Deployment

You'll set these in your hosting platform (see Step 5).

---

## 🚢 Step 5: Deploy to Production

You have several options for deployment. Here are the most popular:

---

### Option A: Deploy with Vercel (Frontend) + Railway/Render (Backend)

#### **Frontend on Vercel:**

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.com/api` (you'll get this after deploying backend)
6. Click **"Deploy"**

#### **Backend on Railway:**

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Add a new service → **"Empty Service"**
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
6. Add Environment Variables:
   ```
   PORT=5000
   NODE_ENV=production
   MONGO_URI=your-mongodb-atlas-connection-string
   MONGO_DB_NAME=money-tracker
   JWT_SECRET=your-production-secret-key
   JWT_EXPIRE=7d
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
7. Deploy!

#### **Backend on Render (Alternative):**

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `money-tracker-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variables (same as Railway above)
6. Click **"Create Web Service"**

---

### Option B: Deploy with Netlify (Frontend) + Heroku (Backend)

#### **Frontend on Netlify:**

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select your repository
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your backend URL
6. Deploy!

#### **Backend on Heroku:**

1. Install Heroku CLI: [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)
2. Login: `heroku login`
3. Create app: `heroku create money-tracker-api`
4. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGO_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-secret
   heroku config:set FRONTEND_URL=https://your-netlify-app.netlify.app
   ```
5. Deploy: `git push heroku main`

---

### Option C: Full Stack on Render

1. Go to [render.com](https://render.com)
2. Create **two services**:

   **Backend Service:**
   - Type: Web Service
   - Root Directory: `backend`
   - Build: `npm run build`
   - Start: `npm start`
   - Environment Variables: (same as above)

   **Frontend Service:**
   - Type: Static Site
   - Root Directory: `frontend`
   - Build: `npm run build`
   - Publish Directory: `dist`
   - Environment Variable: `VITE_API_URL`

---

## 🗄️ Step 6: Set Up MongoDB Atlas (Cloud Database)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new cluster (free tier available)
4. Click **"Connect"** → **"Connect your application"**
5. Copy the connection string
6. Replace `<password>` with your database password
7. Add this to your backend environment variables as `MONGO_URI`

**Example connection string:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/money-tracker?retryWrites=true&w=majority
```

---

## ✅ Step 7: Update Frontend API URL

After deploying your backend:

1. Get your backend URL (e.g., `https://money-tracker-api.railway.app`)
2. Update your frontend environment variable:
   - **Vercel**: Go to Project Settings → Environment Variables
   - **Netlify**: Go to Site Settings → Environment Variables
   - **Render**: Go to Environment tab
3. Set `VITE_API_URL` to `https://your-backend-url.com/api`
4. Redeploy your frontend

---

## 🔄 Step 8: Update CORS Settings

Update your backend's `FRONTEND_URL` environment variable to include your deployed frontend URL:

```env
FRONTEND_URL=https://your-frontend-domain.com
# Or multiple URLs:
FRONTEND_URLS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

---

## 📝 Step 9: Update README with Deployment Info

Update your `README.md` to include:

```markdown
## 🌐 Live Demo

- Frontend: [Your Frontend URL]
- Backend API: [Your Backend URL]

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.
```

---

## 🔍 Step 10: Test Your Deployment

1. **Test Backend:**
   - Visit: `https://your-backend-url.com/api/health`
   - Should return: `{"success": true, "message": "OK", ...}`

2. **Test Frontend:**
   - Visit your frontend URL
   - Try registering a new user
   - Test login functionality

3. **Check CORS:**
   - Open browser DevTools → Console
   - Look for any CORS errors
   - If errors occur, verify `FRONTEND_URL` in backend env vars

---

## 🛠️ Troubleshooting

### Backend Issues:

- **"Cannot connect to MongoDB"**: Check your `MONGO_URI` and ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- **"Port already in use"**: Most hosting platforms set `PORT` automatically, don't hardcode it
- **"Module not found"**: Ensure `npm install` runs before `npm run build`

### Frontend Issues:

- **"API calls failing"**: Check `VITE_API_URL` matches your backend URL
- **"CORS errors"**: Verify `FRONTEND_URL` in backend includes your frontend domain
- **"Build fails"**: Check Node.js version (should be 18+)

### Common Fixes:

```bash
# Clear build cache
rm -rf frontend/dist backend/dist
rm -rf node_modules frontend/node_modules backend/node_modules

# Rebuild
npm run build
```

---

## 📚 Additional Resources

- [GitHub Docs](https://docs.github.com)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)

---

## 🎉 You're Done!

Your Money Tracker application should now be live on the internet! Share your deployed URLs and celebrate! 🚀

---

**Need Help?** Open an issue on GitHub or check the troubleshooting section above.

