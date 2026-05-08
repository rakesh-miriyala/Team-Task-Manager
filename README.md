# Team Task Manager

A professional, full-stack project and task management application designed for modern teams. This application features role-based access control, interactive dashboards, and real-time status tracking.

Live Link: team-task-manager-production-d011.up.railway.app

## 🚀 Features

- **Authentication & Authorization**: Secure JWT-based authentication with ADMIN and MEMBER roles.
- **Dynamic Dashboard**: Visualize project health with Recharts, track task distribution, and monitor overdue items.
- **Project Management**: Create, update, and manage team projects (Admin only).
- **Task Tracking**: Comprehensive task list with priority levels, status updates, and assignment tracking.
- **Modern UI**: Polished SaaS-style interface built with Tailwind CSS and Framer Motion.
- **Responsive Design**: Fully functional on mobile and desktop devices.
- **Robust Backend**: Node.js/Express server with type-safe database interactions via Prisma.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Zustand, Recharts, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM.
- **Database**: SQLite (Development) / PostgreSQL (Production ready).
- **Security**: JWT, Bcrypt, Helmet, CORS.

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Local Installation
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd team-task-manager
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file based on `.env.example`:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-secret-key"
   PORT=3000
   ```

4. **Initialize Database**:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 🚢 Deployment (Railway)

1. Connect your GitHub repository to [Railway](https://railway.app/).
2. Add a **PostgreSQL** service to your Railway project.
3. Configure Environment Variables in Railway:
   - `DATABASE_URL`: (Automatically provided by Railway for Postgres)
   - `JWT_SECRET`: A long, random string.
   - `NODE_ENV`: production
4. The application will automatically build and deploy using the `Dockerfile` provided.

## 📁 API Documentation

### Auth
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/me` - Get current user profile

### Projects
- `GET /api/projects` - List all projects (filtered by role)
- `POST /api/projects` - Create new project (Admin)
- `GET /api/projects/:id` - Get project details with tasks and members
- `PUT /api/projects/:id` - Update project (Admin)
- `DELETE /api/projects/:id` - Delete project (Admin)

### Tasks
- `GET /api/tasks` - List tasks with filters (status, priority, projectId)
- `POST /api/tasks` - Create task for a project (Admin)
- `PUT /api/tasks/:id` - Update task status or details
- `DELETE /api/tasks/:id` - Delete task (Admin)

### Dashboard
- `GET /api/dashboard/stats` - Get summary statistics and activity logs

---

*Developed with ❤️ as a production-ready hiring assignment submission.*
