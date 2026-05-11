# 🚀 AstroLingo Deployment Guide

## Quick Start Commands

### 1. Start Backend Server
```bash
cd astro-backend
npm run dev
```
**Expected Output:**
```
✅ MongoDB connected
🚀 Server running on port 5000
```

### 2. Start Frontend Server
```bash
cd astro-frontend
npm run dev
```
**Expected Output:**
```
VITE ready in XXXms
➜ Local: http://localhost:5173/
```

## 🧪 Testing the Application

### Manual Testing Steps

1. **Open Browser**: Navigate to `http://localhost:5173` (or the port shown by Vite)

2. **Test Registration**:
   - Click "Register" in the navbar
   - Fill out the form with test credentials
   - Should redirect to dashboard on success

3. **Test Login**:
   - Use the credentials you just created
   - Should see personalized dashboard

4. **Test News Fetching**:
   - In dashboard, click "🔄 Fetch Fresh News"
   - Should fetch articles from NASA RSS feed
   - Check browser console for any errors

5. **Test News Viewing**:
   - Navigate to "Space News" in navbar
   - Should see list of articles
   - Try switching between Child/Student/Researcher modes
   - Articles should be simplified automatically

6. **Test NASA APOD**:
   - Navigate to "NASA Picture of Day"
   - Should display today's astronomy picture

### API Endpoint Testing

You can test individual endpoints using browser or tools like Postman:

- `GET http://localhost:5000/` - Server status
- `GET http://localhost:5000/api/news/fetch` - Fetch fresh news
- `GET http://localhost:5000/api/news/latest` - Get saved articles
- `GET http://localhost:5000/api/nasa/apod` - NASA Picture of the Day

## 🔧 Troubleshooting Common Issues

### Backend Issues

**MongoDB Connection Error**
```
❌ MongoDB connection error: MongoServerError
```
**Solution:**
- Check your `MONGO_URI` in `.env` file
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify network connectivity

**HuggingFace API Error**
```
❌ Hugging Face API key missing
```
**Solution:**
- Add `HUGGINGFACE_API_KEY` to `.env` file
- Get a free API key from https://huggingface.co/
- Verify the key has sufficient quota

**Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
- Kill existing process on port 5000
- Or change `PORT` in `.env` file

### Frontend Issues

**API Connection Error**
```
Failed to fetch from http://localhost:5000
```
**Solution:**
- Ensure backend server is running
- Check CORS configuration in backend
- Verify API endpoints are correct

**Build Errors**
```
Module not found: Can't resolve './api'
```
**Solution:**
- Check import paths in components
- Ensure all dependencies are installed with `npm install`

### Network Issues

**Cannot Access Application**
- Check Windows Firewall settings
- Ensure ports 5000 and 5173/5174 are not blocked
- Try accessing via `127.0.0.1` instead of `localhost`

## 📊 Performance Optimization

### Backend Optimizations
- Enable MongoDB connection pooling
- Implement caching for simplified articles
- Add rate limiting for API endpoints
- Use compression middleware

### Frontend Optimizations
- Implement lazy loading for components
- Add service worker for offline functionality
- Optimize images and assets
- Use React.memo for expensive components

## 🔒 Security Considerations

### Environment Variables
Never commit `.env` files to version control. Required variables:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_strong_secret
NASA_API_KEY=your_nasa_key
HUGGINGFACE_API_KEY=your_hf_key
```

### Authentication
- JWT tokens expire after 24 hours
- Passwords are hashed with bcrypt
- Protected routes require valid tokens

## 🌐 Production Deployment

### Backend Deployment (Heroku/Railway/Render)
1. Set environment variables in hosting platform
2. Ensure MongoDB Atlas is accessible
3. Update CORS origins for production domain

### Frontend Deployment (Netlify/Vercel)
1. Update API base URL for production
2. Build the project: `npm run build`
3. Deploy the `dist` folder

### Environment-Specific Configuration
Create separate `.env` files for different environments:
- `.env.development`
- `.env.production`
- `.env.test`

## 📈 Monitoring and Logging

### Backend Logging
- Server startup logs
- API request/response logs
- Error tracking with stack traces
- MongoDB connection status

### Frontend Monitoring
- Console error tracking
- API response monitoring
- User interaction analytics
- Performance metrics

## 🔄 Continuous Integration

### Automated Testing
```bash
# Backend tests
cd astro-backend
npm test

# Frontend tests  
cd astro-frontend
npm test
```

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] API endpoints tested
- [ ] Frontend builds successfully
- [ ] Security vulnerabilities checked

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify all environment variables are set
4. Ensure all dependencies are installed
5. Check network connectivity and firewall settings

## 🎯 Next Steps

### Feature Enhancements
- Add user preferences for simplification levels
- Implement article bookmarking
- Add social sharing functionality
- Create mobile app version
- Integrate more space news sources (SpaceX, ESA, etc.)

### Technical Improvements
- Add comprehensive test coverage
- Implement GraphQL API
- Add real-time notifications
- Enhance AI simplification with custom models
- Add multilingual support
