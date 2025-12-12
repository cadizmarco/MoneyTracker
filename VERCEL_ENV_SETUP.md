# 🔐 Environment Variables for Vercel Deployment

## Your Current Configuration

Based on your `.env` file, here are the environment variables you need to add to Vercel:

---

## ✅ Add These to Vercel Dashboard

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add each variable below and set it for **Production**, **Preview**, and **Development**:

### MongoDB Configuration

| Variable Name | Value from Your .env |
|---------------|---------------------|
| `MONGO_URI` | `mongodb+srv://MoneytrackerCoder:JmdQkW89iWLqxU7K@moneytrackerdb.zhovfco.mongodb.net/?appName=MoneyTrackerDB` |
| `MONGODB_URI` | `mongodb+srv://MoneytrackerCoder:JmdQkW89iWLqxU7K@moneytrackerdb.zhovfco.mongodb.net/?appName=MoneyTrackerDB` |
| `MONGO_DB_NAME` | `MoneyTrackerDB` |
| `DB_NAME` | `money-tracker` |

### JWT Configuration

| Variable Name | Value |
|---------------|-------|
| `JWT_SECRET` | `your-super-secret-jwt-key-here` |
| `JWT_EXPIRE` | `7d` |

> [!WARNING]
> **Your JWT_SECRET is not secure!** 
> 
> Generate a new secure secret with this command:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```
> Then replace `your-super-secret-jwt-key-here` with the generated string.

### Server Configuration

| Variable Name | Value |
|---------------|-------|
| `NODE_ENV` | `production` |

> **Note:** Don't set `PORT` in Vercel - it's automatically managed.

### CORS Configuration

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `FRONTEND_URL` | `https://your-app-name.vercel.app` | Replace with your actual Vercel URL |

> **Alternative:** If you want to allow multiple URLs:
> ```
> FRONTEND_URLS=https://your-app.vercel.app,https://preview.vercel.app
> ```

### Rate Limiting

| Variable Name | Value |
|---------------|-------|
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `100` |

### Frontend Environment Variable

| Variable Name | Value |
|---------------|-------|
| `VITE_API_URL` | `/api` |

---

## 📋 Complete List for Copy-Paste

Here's the complete list you can copy directly:

### Environment Variables (Update FRONTEND_URL and JWT_SECRET!)

```bash
# MongoDB
MONGO_URI=mongodb+srv://MoneytrackerCoder:JmdQkW89iWLqxU7K@moneytrackerdb.zhovfco.mongodb.net/?appName=MoneyTrackerDB
MONGODB_URI=mongodb+srv://MoneytrackerCoder:JmdQkW89iWLqxU7K@moneytrackerdb.zhovfco.mongodb.net/?appName=MoneyTrackerDB
MONGO_DB_NAME=MoneyTrackerDB
DB_NAME=money-tracker

# JWT (⚠️ GENERATE A NEW SECRET!)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server
NODE_ENV=production

# CORS (Update with your actual Vercel URL!)
FRONTEND_URL=https://your-app-name.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend
VITE_API_URL=/api
```

---

## 🔒 Security Checklist

Before deploying:

- [ ] **Generate a new JWT_SECRET** (don't use `your-super-secret-jwt-key-here`)
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

- [ ] **Verify MongoDB Atlas Network Access**
  - Go to MongoDB Atlas → Network Access
  - Ensure "Allow Access from Anywhere" is enabled
  - Or add Vercel IP ranges

- [ ] **Update FRONTEND_URL** after first deployment
  - Get your Vercel URL from deployment
  - Update the environment variable
  - Redeploy if needed

---

## 📝 How to Add in Vercel

1. Go to https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** tab
4. Click **Environment Variables** in the sidebar
5. For each variable:
   - Click **Add New**
   - Enter **Key** (e.g., `MONGO_URI`)
   - Enter **Value** (from the table above)
   - Select **Production**, **Preview**, **Development** (all three)
   - Click **Save**

---

## ⚠️ Important Notes

1. **MongoDB Connection String:**
   - Your current MongoDB connection is already configured for MongoDB Atlas
   - This will work perfectly with Vercel
   - Make sure Network Access allows connections from anywhere

2. **JWT Secret:**
   - **CRITICAL:** Change this before production deployment
   - The current value is insecure
   - Use the command above to generate a strong random secret

3. **Frontend URL:**
   - You won't know your Vercel URL until after first deployment
   - Deploy first, then:
     - Copy the deployment URL (e.g., `https://moneytracker-abc123.vercel.app`)
     - Add `FRONTEND_URL` environment variable with that URL
     - Optionally trigger a re-deployment

4. **VITE_API_URL:**
   - Must be `/api` (relative path) for Vercel
   - This allows frontend to call backend on same domain

---

## 🧪 After Deployment - Verify

1. **Check API Health:**
   ```
   https://your-app.vercel.app/api/health
   ```
   Should return:
   ```json
   {
     "success": true,
     "db": {
       "connected": true,
       "dbName": "MoneyTrackerDB"
     }
   }
   ```

2. **Check MongoDB Connection:**
   - If `db.connected` is `false`, check:
     - MongoDB Atlas Network Access
     - Connection string is correct
     - Database user has permissions

3. **Test Frontend:**
   - Visit `https://your-app.vercel.app`
   - Should show login page
   - Try registering and logging in

---

## 🎯 Quick Deploy Steps

1. ✅ Generate new JWT secret (command above)
2. ✅ Add all environment variables to Vercel (use tables above)
3. ✅ Deploy to Vercel
4. ✅ Get deployment URL
5. ✅ Update `FRONTEND_URL` with actual URL
6. ✅ Test `/api/health` endpoint
7. ✅ Test app functionality

---

## Need Help?

If deployment fails:
1. Check Vercel build logs
2. Verify all environment variables are set
3. Test MongoDB connection from Vercel function logs
4. Check MongoDB Atlas allows connections from anywhere
