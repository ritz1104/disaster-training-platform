# 🚀 NDMA Training Platform - Complete Deployment Guide

## 🎯 Quick Deployment Steps

### 1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment: Complete NDMA Training Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ndma-training-platform.git
git push -u origin main
```

### 2. **Deploy to Render (Recommended - Free Tier Available)**

#### Option A: Blueprint Deployment (Automated)
1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically use `render.yaml` to deploy both services
5. Wait 10-15 minutes for deployment to complete

#### Option B: Manual Deployment
**Backend Service:**
1. Click **"New +"** → **"Web Service"**
2. Connect GitHub repository
3. Configure:
   - **Name**: `ndma-training-server`
   - **Runtime**: Docker
   - **Docker Context Directory**: `./server`
   - **Instance Type**: Starter (Free)

**Environment Variables for Backend:**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://ritikrajput2611:IG1RxW6FFBXMGAJo@cluster0.dezkd.mongodb.net/ndma-training-monitor
JWT_SECRET=8a486ad7953cab835117af873d0f79a96bd48af6d85e86f92bd82ee2d8b04a5b
JWT_EXPIRE=24h
PORT=5000
CLIENT_URL=https://ndma-training-client.onrender.com
```

**Frontend Service:**
1. Click **"New +"** → **"Static Site"**
2. Connect same GitHub repository
3. Configure:
   - **Name**: `ndma-training-client`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`

### 3. **Alternative Deployment Options**

#### **Vercel (Frontend Only)**
```bash
cd client
npx vercel --prod
```

#### **Heroku (Backend + Frontend)**
1. Create Heroku apps:
```bash
heroku create ndma-training-server
heroku create ndma-training-client
```

2. Deploy backend:
```bash
git subtree push --prefix server heroku main
```

#### **Netlify (Frontend Only)**
1. Connect GitHub repository to Netlify
2. Build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`

## 🔗 Expected Live URLs

After successful deployment:
- **🌐 Frontend**: `https://ndma-training-client.onrender.com`
- **🔧 Backend API**: `https://ndma-training-server.onrender.com`
- **📊 Health Check**: `https://ndma-training-server.onrender.com/api/health`

## ✅ Deployment Checklist

- [x] Git repository initialized
- [x] MongoDB Atlas configured
- [x] Environment variables set
- [x] CORS configured for production
- [x] Docker files ready
- [x] Build scripts configured
- [x] Logo assets included
- [x] Auto-complete disabled
- [ ] Push to GitHub
- [ ] Deploy to Render
- [ ] Test live application

## 🛠 Post-Deployment Tasks

1. **Test the application**: Visit your live URL
2. **Create SuperAdmin account**: Register and approve via MongoDB
3. **Test all features**: Login, create training, analytics
4. **Monitor performance**: Check Render dashboard for logs

## 📞 Support & Troubleshooting

**Common Issues:**
- **502 errors**: Check if MongoDB Atlas allows connections from 0.0.0.0/0
- **CORS errors**: Verify CLIENT_URL environment variable
- **Build failures**: Check build logs in Render dashboard
- **Slow loading**: Free tier services sleep after 15 min inactivity

**Logs Access:**
- Render: Dashboard → Service → Logs tab
- Heroku: `heroku logs --tail -a your-app-name`

## 🎉 Success!

Once deployed, your NDMA Training Platform will be live and accessible worldwide. Share your live URL to demonstrate the complete disaster management training system!

**Remember**: Free tier services may take 30-60 seconds for first load after being idle.