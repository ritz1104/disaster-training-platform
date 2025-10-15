# NDMA Training Platform - Render Deployment Guide

## 🚀 Deploying to Render

### Prerequisites
1. Create a GitHub repository for your project
2. Push your code to GitHub
3. Create a Render account at [render.com](https://render.com)

### Step 1: Prepare Your Code for Deployment

#### A. Create render.yaml (Infrastructure as Code)
This file tells Render how to deploy your application.

#### B. Update Environment Variables
Your MongoDB Atlas connection is already configured.

#### C. Build Scripts
Your Dockerfiles are ready for deployment.

### Step 2: Deploy Backend (Server)

1. **Connect Repository**: In Render dashboard, click "New +" → "Web Service"
2. **Connect GitHub**: Link your GitHub repository
3. **Configure Service**:
   - Name: `ndma-training-server`
   - Environment: `Docker`
   - Region: Choose closest to your users
   - Instance Type: `Starter` (free tier)
   - Docker Command: Leave default
   - Docker Context Directory: `./server`

4. **Environment Variables**: Add these in Render dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://ritikrajput2611:IG1RxW6FFBXMGAJo@cluster0.dezkd.mongodb.net/ndma-training-monitor
   JWT_SECRET=8a486ad7953cab835117af873d0f79a96bd48af6d85e86f92bd82ee2d8b04a5b
   JWT_EXPIRE=24h
   CLIENT_URL=https://your-frontend-url.onrender.com
   PORT=5000
   ```

### Step 3: Deploy Frontend (Client)

1. **New Service**: Click "New +" → "Static Site"
2. **Connect Repository**: Same GitHub repo
3. **Configure**:
   - Name: `ndma-training-client`
   - Build Command: `cd client && npm install && npm run build`
   - Publish Directory: `client/dist`

### Step 4: Update CORS Configuration

After both services are deployed, update your server's CLIENT_URL environment variable with the actual frontend URL.

### 🔗 Expected URLs
- **Frontend**: `https://ndma-training-client.onrender.com`  
- **Backend**: `https://ndma-training-server.onrender.com`

### 📝 Additional Notes
- Free tier services may sleep after 15 minutes of inactivity
- First deployment takes 5-10 minutes
- Subsequent deployments are faster
- Monitor logs in Render dashboard for any issues

### 🛠 Troubleshooting
- Check build logs for any errors
- Verify environment variables are set correctly
- Ensure MongoDB Atlas allows connections from 0.0.0.0/0
- Check CORS configuration in server