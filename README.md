
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

# 🚀 AstroLingo - Space Science Education Platform

AstroLingo is a comprehensive space education web application that fetches the latest NASA and ISRO news and uses AI to simplify complex scientific language for different user levels — Children, Students, and Researchers.

## 🌟 Features

### 🔄 Fresh Space News
- Fetches the latest articles from NASA APIs (NASA News RSS Feed)
- Real-time data instead of cached content
- Ensures users always get the latest space discoveries and events

### 🧠 AI-Powered Simplification
- Uses HuggingFace NLP models to simplify complex scientific content
- Three learning modes:
  - 👧 **Child Mode**: Simple, friendly explanations for kids
  - 🎓 **Student Mode**: Educational content for college students
  - 🔬 **Researcher Mode**: Technical details for researchers

### 👤 User Authentication
- Secure user registration and login system
- JWT token-based authentication
- Personalized dashboard for each user

### 📱 Modern UI/UX
- Responsive design with CSS Grid and Flexbox
- Dark space-themed gradient backgrounds
- Interactive cards with hover animations
- Mobile-friendly navigation

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB |
| AI/NLP | HuggingFace API |
| External APIs | NASA RSS Feed, NASA APOD |
| Authentication | JWT Tokens |
| Styling | CSS3 + Modern Animations |

## 📁 Project Structure

```
astrolingo/
├── astro-backend/
│   ├── controllers/
│   │   ├── articleController.js
│   │   ├── newsController.js
│   │   ├── simplifyController.js
│   │   ├── userController.js
│   │   └── nasaController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Article.js
│   │   └── User.js
│   ├── routes/
│   │   ├── articleRoutes.js
│   │   ├── newsRoutes.js
│   │   ├── userRoutes.js
│   │   └── nasaRoutes.js
│   ├── scripts/
│   │   └── resetArticles.js
│   ├── .env
│   ├── server.js
│   └── package.json
└── astro-frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── PrivateRoute.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── News.jsx
    │   │   └── Apod.jsx
    │   ├── styles/
    │   │   ├── Navbar.css
    │   │   ├── Dashboard.css
    │   │   └── News.css
    │   ├── api.js
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- HuggingFace API key
- NASA API key (optional, for APOD)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd astrolingo
   ```

2. **Backend Setup**
   ```bash
   cd astro-backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../astro-frontend
   npm install
   ```

4. **Environment Variables**
   Create a `.env` file in the `astro-backend` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NASA_API_KEY=your_nasa_api_key
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   HUGGINGFACE_MODEL=facebook/bart-large-cnn
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd astro-backend
   npm run dev
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd astro-frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## 📋 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (protected)

### News & Articles
- `GET /api/news/fetch` - Fetch fresh news from NASA
- `GET /api/news/latest` - Get latest saved articles
- `POST /api/articles/:id/simplify` - Simplify article content

### NASA APIs
- `GET /api/nasa/apod` - Get NASA Astronomy Picture of the Day

## 🎯 Application Flow

1. **User Registration/Login**
   - Users create an account or log in
   - JWT token is generated and stored

2. **Dashboard Access**
   - Authenticated users access their personalized dashboard
   - View profile information and quick actions

3. **News Fetching**
   - Click "Fetch Fresh News" to get latest NASA articles
   - Articles are saved to MongoDB database

4. **Content Simplification**
   - Navigate to News page
   - Select learning mode (Child/Student/Researcher)
   - AI automatically simplifies all articles for the selected mode

5. **Interactive Learning**
   - Read original articles or simplified versions
   - Switch between different complexity levels
   - Access NASA APOD for daily space imagery

## 🔧 Key Features Implementation

### AI Simplification
- Uses HuggingFace's `facebook/bart-large-cnn` model
- Caches simplified content to avoid redundant API calls
- Mode-specific prompts for different user levels

### Real-time Data
- Fetches fresh content from NASA RSS feeds
- Avoids duplicate articles using link-based deduplication
- Stores articles with metadata (title, description, images, dates)

### Responsive Design
- Mobile-first approach with CSS Grid and Flexbox
- Dark space theme with gradient backgrounds
- Smooth animations and hover effects

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify your MONGO_URI in the .env file
   - Ensure your IP is whitelisted in MongoDB Atlas

2. **HuggingFace API Errors**
   - Check your HUGGINGFACE_API_KEY
   - Verify the model name is correct
   - Ensure you have sufficient API quota

3. **CORS Issues**
   - Backend includes CORS middleware
   - Ensure frontend is running on the correct port

4. **Authentication Problems**
   - Check JWT_SECRET is set
   - Verify token is being stored in localStorage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- NASA for providing open APIs and data
- HuggingFace for AI/NLP capabilities
- React and Node.js communities for excellent documentation


**Made with ❤️ for space science education**

