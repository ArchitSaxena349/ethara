# Ethara TaskFlow MVP

Ethara TaskFlow is a focused full-stack task and project tracker for the assignment scope: JWT auth, Admin/Member roles, project membership, task assignment, status updates, due dates, and a dashboard with overdue highlighting.

## Live Deployment

- App: [https://ethara-production-ffe9.up.railway.app/](https://ethara-production-ffe9.up.railway.app/)
- API health check: [https://ethara-production-ffe9.up.railway.app/api/health](https://ethara-production-ffe9.up.railway.app/api/health)

## Features

- Signup and login with JWT authentication
- Role-based access for `Admin` and `Member`
- Admin project creation and member assignment
- Admin task creation and assignment to project members
- Member project visibility for assigned projects
- Member task status updates
- Dashboard with total tasks, status summary, my tasks, and overdue tasks
- Task filtering by status
- Overdue task highlighting

## Tech Stack

- Node.js, Express, MongoDB, Mongoose
- JWT, bcryptjs
- React with Vite
- Railway-ready single-service deployment

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set real values:

```bash
copy .env.example .env
```

3. Optional demo seed:

```bash
npm run seed
```

4. Start backend and frontend:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to `http://localhost:5000`.

## Demo Credentials

After running `npm run seed`:

- Admin: `admin@example.com` / `Admin123!`
- Member: `member@example.com` / `Member123!`

You can also create accounts from the signup screen.

## API Endpoints

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`

Projects:

- `GET /api/projects`
- `POST /api/projects`
- `POST /api/projects/:id/add-member`

Tasks:

- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`

Dashboard:

- `GET /api/dashboard`

Users:

- `GET /api/users?role=Member`

Health:

- `GET /api/health`

## Railway Deployment

1. Push this repository to GitHub.
2. Create a Railway project from the GitHub repo.
3. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLIENT_ORIGIN=https://ethara-production-ffe9.up.railway.app`
   - `NODE_ENV=production`
   - Do not manually add `PORT`; Railway provides it automatically.
4. Use build command:

```bash
npm install && npm run build
```

5. Use start command:

```bash
npm start
```

The Express server serves the built React app from `client/dist` in production.

## Demo Video Checklist

1. Signup or login as Admin.
2. Create a project.
3. Add a Member to the project.
4. Create and assign a task.
5. Login as Member and update the task status.
6. Show dashboard totals, status summary, and overdue task badge.
