# Money Tracker - Full Stack Application

A comprehensive money tracking application built with React (frontend) and Node.js/Express (backend) with TypeScript.

## 🏗️ Project Structure

```
Money tracker/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # Utilities and types
│   └── package.json
├── backend/                  # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   └── package.json
└── package.json             # Root package.json for concurrent development
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**
   ```bash
   # Copy the example environment file
   cp backend/env.example backend/.env
   
   # Edit backend/.env with your configuration
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```

This will start both frontend (http://localhost:5173) and backend (http://localhost:5000) concurrently.

## 📋 Available Scripts

### Root Level Scripts
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run start` - Start both frontend and backend in production mode
- `npm run install:all` - Install dependencies for all projects
- `npm run lint` - Run linting for both frontend and backend

### Frontend Scripts (in frontend/ directory)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Scripts (in backend/ directory)
- `npm run dev` - Start with nodemon (auto-restart)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Joi** - Data validation

## 🔧 Development Setup

### Backend Configuration

1. **Database Setup:**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in `backend/.env`

2. **Environment Variables:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/money-tracker
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   ```

### Frontend Configuration

The frontend is already configured with Vite and should work out of the box. Make sure the backend is running on port 5000 for API calls.

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Accounts
- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

## 🚀 Deployment

For detailed step-by-step deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Deployment Overview

**Backend Deployment:**
1. Build the backend: `cd backend && npm run build`
2. Set production environment variables
3. Start the server: `npm start`

**Frontend Deployment:**
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `dist` folder to your hosting service

**Recommended Platforms:**
- **Frontend**: Vercel, Netlify, or Render (Static Site)
- **Backend**: Railway, Render, or Heroku
- **Database**: MongoDB Atlas (free tier available)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.












