# Disaster Training Platform

A comprehensive platform for managing disaster preparedness training programs. This application enables organizations to create, manage, and track disaster training sessions with real-time updates and analytics.

## Features

### 🎯 Core Features
- **Training Management**: Create, update, and manage disaster preparedness training programs
- **Multi-Role Support**: Different access levels for Admin, SDMA, NGO, and Volunteer roles
- **Real-time Updates**: Socket.IO integration for live updates on training activities
- **Location-based Services**: Geographic mapping and location-based training discovery
- **Analytics Dashboard**: Comprehensive statistics and reporting
- **Feedback System**: Participant feedback and rating system

### 🛡️ Security
- JWT-based authentication and authorization
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting and security headers

### 📱 User Interface
- Responsive design with Tailwind CSS
- Interactive dashboard with charts and analytics
- Real-time notifications
- Modern React components with hooks

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React 18** with modern hooks
- **React Router** for navigation
- **React Query** for data fetching and caching
- **Tailwind CSS** for styling
- **React Hook Form** for form management
- **Recharts** for data visualization
- **Socket.IO Client** for real-time updates

## Project Structure

```
disaster-training-platform/
├── server/                     # Backend server
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/
│   │   ├── auth.controller.js  # Authentication logic
│   │   └── training.controller.js # Training management
│   ├── middleware/
│   │   └── auth.middleware.js  # Authentication middleware
│   ├── models/
│   │   ├── user.model.js      # User schema
│   │   └── training.model.js   # Training schema
│   ├── routes/
│   │   ├── authRoutes.js      # Authentication routes
│   │   └── trainingRoutes.js   # Training routes
│   ├── server.js              # Server entry point
│   ├── package.json
│   └── .env.example           # Environment variables template
├── client/                     # Frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts
│   │   ├── pages/             # Page components
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # App entry point
│   │   └── index.css          # Global styles
│   ├── package.json
│   ├── tailwind.config.js     # Tailwind configuration
│   └── .env.example           # Environment variables template
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. **Clone the repository and navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/disaster-training
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=30d
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Trainings
- `GET /api/trainings` - Get all trainings (with filters)
- `POST /api/trainings` - Create new training (Admin/SDMA/NGO)
- `GET /api/trainings/:id` - Get training by ID
- `PUT /api/trainings/:id` - Update training
- `DELETE /api/trainings/:id` - Delete training
- `GET /api/trainings/stats/analytics` - Get training statistics
- `GET /api/trainings/nearby/:lng/:lat` - Get nearby trainings
- `POST /api/trainings/:id/feedback` - Add feedback to training

## User Roles & Permissions

### Admin
- Full system access
- Manage all trainings
- View all analytics
- User management

### SDMA (State Disaster Management Authority)
- Create and manage trainings
- View regional analytics
- Approve training programs

### NGO (Non-Governmental Organization)
- Create community trainings
- Manage organization's trainings
- View participation analytics

### Volunteer
- View and join trainings
- Provide feedback
- View personal dashboard

## Features Overview

### Dashboard
- Training statistics and analytics
- Recent activity feed
- Quick action buttons
- Performance metrics

### Training Management
- Create comprehensive training programs
- Set location coordinates for mapping
- Manage participant capacity
- Track training status

### Real-time Features
- Live training updates
- Instant notifications
- Real-time participant counts
- Socket.IO integration

### Analytics & Reporting
- Training distribution by theme
- Participation statistics
- Geographic analysis
- Performance trends

## Development

### Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### Building for Production
```bash
# Build frontend
cd client
npm run build

# The built files will be in the dist/ directory
```

### Environment Variables

#### Server (.env)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration time
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `CLIENT_URL` - Frontend application URL

#### Client (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - Socket.IO server URL
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

---

**Disaster Training Platform** - Empowering communities through comprehensive disaster preparedness training.