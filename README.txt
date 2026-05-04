ETHARA TASKFLOW MVP

Ethara TaskFlow is a focused full-stack task and project tracker built for the assignment scope. It includes JWT authentication, Admin and Member roles, project membership, task assignment, status updates, due dates, and a dashboard with overdue task highlighting.

LIVE DEPLOYMENT

- App: https://ethara-production-ffe9.up.railway.app/
- API health check: https://ethara-production-ffe9.up.railway.app/api/health

FEATURES

- Signup and login with JWT authentication
- Role-based access for Admin and Member users
- Admin project creation and member assignment
- Admin task creation and assignment to project members
- Member project visibility for assigned projects
- Member task status updates
- Dashboard with total tasks, status summary, my tasks, and overdue tasks
- Task filtering by status
- Overdue task highlighting

TECH STACK

- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT and bcryptjs
- Frontend: React with Vite
- Deployment: Railway

LOCAL SETUP

1. Install dependencies:

   npm install

2. Create a .env file using .env.example as reference.

3. Add the required environment variables:

   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_long_random_secret
   CLIENT_ORIGIN=http://localhost:5173,https://ethara-production-ffe9.up.railway.app
   NODE_ENV=development

4. Optional: seed demo data:

   npm run seed

5. Start the backend and frontend:

   npm run dev

The frontend runs on http://localhost:5173.
The backend runs on http://localhost:5000.

DEMO CREDENTIALS

After running npm run seed:

- Admin email: admin@example.com
- Admin password: Admin123!
- Member email: member@example.com
- Member password: Member123!

API ENDPOINTS

Auth:
- POST /api/auth/signup
- POST /api/auth/login

Projects:
- GET /api/projects
- POST /api/projects
- POST /api/projects/:id/add-member

Tasks:
- GET /api/tasks
- POST /api/tasks
- PATCH /api/tasks/:id

Dashboard:
- GET /api/dashboard

Users:
- GET /api/users?role=Member

Health:
- GET /api/health

ROLE-BASED ACCESS

Admin:
- Create projects
- Add members to projects
- Create tasks
- Assign tasks to project members
- View dashboard summaries

Member:
- View assigned projects
- View assigned tasks
- Update task status
- View personal dashboard

RAILWAY DEPLOYMENT

1. Push the project to GitHub.
2. Create a new Railway project from the GitHub repository.
3. Add these environment variables in Railway:

   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_long_random_secret
   CLIENT_ORIGIN=https://ethara-production-ffe9.up.railway.app
   NODE_ENV=production

4. Do not manually add PORT on Railway. Railway provides PORT automatically.
5. Build command: npm install && npm run build
6. Start command: npm start

Live deployment: https://ethara-production-ffe9.up.railway.app/

DEMO VIDEO CHECKLIST

1. Signup or login as Admin.
2. Create a project.
3. Add a Member to the project.
4. Create and assign a task.
5. Login as Member.
6. Update task status.
7. Show dashboard totals, status summary, and overdue task badge.
