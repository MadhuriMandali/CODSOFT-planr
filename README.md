# Planr — Full-Stack Project Management Tool

A complete project management app built with **React**, **Node.js**, **Express**, and **MongoDB**.

---

## Features
- **JWT Authentication** — Register, login, protected routes
- **Projects** — Create, edit, delete with color palettes & deadlines
- **Tasks** — Full CRUD, assignees, priorities, deadlines
- **3 Views** — Kanban board, List, Overview/Analytics
- **Progress tracking** — Animated rings, bar charts, overdue alerts
- **Filtering** — By status, priority, and free-text search

---

## Project Structure
```
planr/
├── frontend/          # React app (CRA)
│   └── src/
│       ├── App.js         # Router + AuthContext
│       ├── api.js         # Axios API client
│       ├── tokens.js      # Design tokens
│       ├── utils.js       # Date/progress helpers
│       ├── components/    # Reusable UI components
│       └── pages/         # LoginPage, RegisterPage, Dashboard
│
└── backend/           # Node.js / Express API
    └── src/
        ├── server.js      # Entry point
        ├── app.js         # Express setup
        ├── config/db.js   # MongoDB connection
        ├── middleware/    # auth.js, errorHandler.js
        ├── models/        # User.js, Project.js (with Task subdoc)
        └── routes/        # auth.js, projects.js, tasks.js
```

---

## Quick Start

### 1. Prerequisites
- Node.js v18+
- MongoDB running locally (or a MongoDB Atlas URI)

### 2. Backend
```bash
cd backend
cp .env.example .env          # Edit MONGODB_URI and JWT_SECRET
npm install
npm run dev                   # Starts on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm start                     # Starts on http://localhost:3000
```

The frontend proxies `/api` requests to `http://localhost:5000` automatically.

---

## API Endpoints

| Method | Endpoint                              | Description          |
|--------|---------------------------------------|----------------------|
| POST   | /api/auth/register                    | Register user        |
| POST   | /api/auth/login                       | Login + get token    |
| GET    | /api/auth/me                          | Get current user     |
| GET    | /api/projects                         | List projects        |
| POST   | /api/projects                         | Create project       |
| PUT    | /api/projects/:id                     | Update project       |
| DELETE | /api/projects/:id                     | Delete project       |
| GET    | /api/projects/:id/tasks               | List tasks           |
| POST   | /api/projects/:id/tasks               | Create task          |
| PUT    | /api/projects/:id/tasks/:tid          | Update task          |
| DELETE | /api/projects/:id/tasks/:tid          | Delete task          |

---

## Environment Variables (backend/.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/planr
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

---

## Production Build
```bash
# Build frontend
cd frontend && npm run build

# Serve static files from backend (add this to backend/src/app.js):
# const path = require('path');
# app.use(express.static(path.join(__dirname, '../../frontend/build')));
# app.get('*', (_, res) => res.sendFile(path.join(__dirname, '../../frontend/build/index.html')));
```
