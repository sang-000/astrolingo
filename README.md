# AstroLingo 

AstroLingo is an AI-powered space education platform built using the MERN stack. The application fetches real-time astronomy and space news from NASA and other space-related sources, then simplifies complex scientific content into different learning levels using AI.

## Features
Real-time astronomy and space news
NASA Astronomy Picture of the Day (APOD)
AI-powered content simplification
Three adaptive learning modes:
Child Mode
Student Mode
Researcher Mode
Secure user authentication with JWT
Responsive modern space-themed UI
MongoDB-based article and user storage
Automated news fetching using cron jobs

## Tech Stack
### Frontend
React
Vite
React Router
Axios
CSS / Bootstrap
### Backend
Node.js
Express.js
MongoDB Atlas
Mongoose
JWT Authentication
bcryptjs
node-cron

## APIs & AI
NASA APIs
Space News APIs
Google Gemini AI 

## Project Structure
astro-backend/
astro-frontend/

### Backend Handles:

Authentication
API integration
Database operations
AI content processing

### Frontend Handles:

User interface
Routing
News display
Authentication flow
Adaptive learning mode selection

## Authentication Features
User Registration
User Login
JWT-based authentication
Protected routes

## AI Learning Modes
AstroLingo dynamically changes the complexity of astronomy concepts:

Child Mode → simple and fun explanations
Student Mode → educational explanations
Researcher Mode → technical scientific explanations
