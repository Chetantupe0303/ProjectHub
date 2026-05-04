# Student Project Manager (Phub)

A comprehensive full-stack web application for managing student projects with AI-powered GitHub repository analysis, dual-portal authentication (Student & Faculty), and real-time collaboration metrics.

## Features

### For Students
- Submit projects with GitHub repository URLs
- Real-time AI analysis of repositories (commits, contributors, rating)
- Track project status (Pending, Reviewed, Approved, Rejected)
- View detailed feedback and analysis
- Faculty selection for project submission
- Draggable dashboard widgets
- Collaboration metrics dashboard

### For Faculty/Admins
- Dashboard with project analytics and statistics
- Filter and search through all submissions
- Update project statuses with custom feedback
- Delete inappropriate submissions
- DataGrid interface for efficient project management
- Faculty account management (add/remove with project transfer)

## Technology Stack

### Backend (Node.js/Express)
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **axios** - GitHub API integration
- **Node-Cache** - In-memory caching

### Frontend (React)
- **Material-UI (MUI)** - UI components
- **React Router** - Navigation and routing
- **Framer Motion** - Animations
- **dnd-kit** - Drag and drop functionality
- **Tailwind CSS** - Utility-first CSS framework
- **MUI DataGrid** - Advanced data tables

## Project Structure

```
student-project-manager/
|-- server/
|   |-- models/
|   |   |-- User.js          # User schema (student/faculty roles)
|   |   |-- Project.js       # Project schema with AI analysis
|   |-- routes/
|   |   |-- auth.js          # Authentication endpoints
|   |   |-- projects.js      # Project CRUD operations
|   |   |-- github.js      # GitHub analysis endpoint
|   |   |-- dashboard.js   # Dashboard/stats endpoints
|   |-- controllers/
|   |   |-- analysisController.js  # AI analysis logic
|   |-- middleware/
|   |   |-- auth.js         # JWT verification middleware
|   |-- server.js           # Express server setup
|   |-- .env               # Environment variables
|   `-- package.json
|
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |   |-- layout/     # Layout components (Sidebar, MainLayout)
|   |   |   |-- ui/         # UI components (EmptyState)
|   |   |   |-- Navbar.js   # Navigation bar
|   |   |   |-- ProtectedRoute.js  # Route protection
|   |   |-- pages/
|   |   |   |-- AuthPage.js        # Login/Register forms
|   |   |   |-- StudentDashboard.js # Student interface
|   |   |   |-- AdminDashboard.js  # Faculty interface
|   |   |   |-- LandingPage.js     # Landing page
|   |   |-- context/
|   |   |   |-- AuthContext.js     # Global auth state
|   |   |-- services/
|   |   |   |-- api.js             # API service layer
|   |   |-- theme/                 # MUI theme configuration
|   |   |   |-- theme.js
|   |   |   |-- designSystem.js
|   |   |-- App.js                 # Main app with routing
|   |   |-- index.js               # React entry point
|   |-- public/
|   |-- .env                      # Client environment variables
|   |-- package.json
|   |-- tailwind.config.js
|   |-- postcss.config.js
|   `-- README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas cloud)
- GitHub Personal Access Token (optional, for higher API rate limits)

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/student-project-manager
JWT_SECRET=your_jwt_secret_key_here
GITHUB_TOKEN=your_github_personal_access_token_here
CORS_ORIGIN=http://localhost:3000
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the React app:
```bash
npm start
```

## Usage

### Faculty Workflow (First-time Setup)
1. Register at `/admin/register` with an email and password
2. Login at `/admin/login`
3. Manage student project submissions

### Student Workflow
1. Register at `/auth/register` with roll number, name, email, and password
2. Login at `/auth/login`
3. Click the + button to submit a new project
4. Select faculty members to receive the project
5. Enter project details and GitHub repository URL
6. System automatically analyzes the repository
7. Submit the project
8. Track status and view feedback on dashboard

### Admin/Faculty Workflow
1. Login as faculty member
2. View all submitted projects in the dashboard
3. Use filters to find specific projects
4. Click edit icon to update project status
5. Add custom feedback if needed
6. View detailed project information

## AI Analysis Features

The system analyzes GitHub repositories and provides:

- **Commit Count**: Total number of commits
- **Contributor List**: Repository contributors
- **AI Rating**: 1-10 scale based on activity metrics
- **Feedback**: Automated analysis summary
- **Metadata**: Wiki presence, issues, stars, forks
- **Activity Tracking**: Last commit date and activity level

### Rating Algorithm

- Base rating: 5/10
- +2 for 100+ commits, +1 for 50+ commits, -2 for <10 commits
- +1 for wiki, +1 for issue tracking
- +1 for 10+ stars, +1 for 5+ forks
- +1 for recent activity (last 7 days), -1 for inactive (>30 days)

## Security Features

- JWT-based authentication with 24h expiration
- Role-based access control (student/faculty)
- Password hashing with bcryptjs (12 rounds)
- Protected API routes with middleware
- Input validation and sanitization
- CORS configuration

## API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - Student login
- `POST /api/auth/admin/register` - Faculty registration
- `POST /api/auth/admin/login` - Faculty login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/faculties` - List all faculty members
- `DELETE /api/auth/faculties/:id` - Delete faculty account

### Projects
- `GET /api/projects/my` - Get student's projects
- `GET /api/projects` - Get faculty's assigned projects
- `POST /api/projects` - Submit new project
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id/status` - Update project status
- `DELETE /api/projects/:id` - Delete project

### GitHub
- `POST /api/github/analyze` - Analyze repository

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics
- `GET /api/dashboard/collaboration` - Get collaboration metrics

## Environment Variables

### Server (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/student-project-manager |
| JWT_SECRET | Secret for JWT signing | fallback_secret |
| GITHUB_TOKEN | GitHub PAT (optional) | - |
| CORS_ORIGIN | Allowed frontend origin | http://localhost:3000 |

### Client (.env)
| Variable | Description |
|----------|-------------|
| REACT_APP_API_URL | Backend API URL |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License