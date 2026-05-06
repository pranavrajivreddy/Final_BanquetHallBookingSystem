# SindhuraHotel

SindhuraHotel is a full-stack banquet hall booking system built with a React + Vite frontend and a Node.js + Express + PostgreSQL backend. The application supports customer registration and login, banquet hall booking requests, admin-side booking management, and a super admin approval flow for admin access requests.

This README explains the project structure and the steps needed to run it locally.

## Project Overview

Main user flows available in this project:

- Customers can register and log in.
- Customers can submit banquet hall booking requests.
- Customers can view their submitted bookings.
- Admin users can review bookings and update booking status.
- Users can request admin access.
- A super admin can review and approve pending admin requests.

## Tech Stack

- Frontend: React, TypeScript, Vite, React Router
- Backend: Node.js, Express
- Database: PostgreSQL
- Authentication: JWT
- Password hashing: bcrypt

## Deployment URL

There is no confirmed live deployment URL stored in this repository.

The project does reference this backend URL as an example for hosted deployments:

`https://final-banquethallbookingsystem.onrender.com`

## Prerequisites

Before running the project on your local PC, make sure the following are installed:

- Node.js 18+ recommended
- npm
- PostgreSQL

You can verify installation with:

```bash
node -v
npm -v
psql --version
```

## Folder Structure

Below is a practical explanation of the important folders and files inside the `SindhuraHotel` project:

```text
SindhuraHotel/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── db.cjs
│   ├── package.json
│   └── server.cjs
├── docs/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── lib/
│   ├── pages/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── dist/
├── index.html
├── package.json
├── server.cjs
└── README.md
```

### Root-level files and folders

- `README.md`
  Main project documentation.

- `package.json`
  Frontend project dependencies and scripts such as `npm run dev` and `npm run build`.

- `server.cjs`
  Root entry file that forwards startup to `backend/server.cjs`. This allows the app to be started from the root with `npm start`.

- `index.html`
  Vite HTML entry file for the frontend.

- `dist/`
  Production frontend build output generated after running `npm run build`.

- `docs/`
  Contains supporting project documentation.

- `public/`
  Public static files served directly by Vite.

### Frontend: `src/`

- `src/main.tsx`
  Frontend entry point. It mounts the React application.

- `src/App.tsx`
  Main router setup for the application. It defines page routes such as home, login, booking, admin dashboard, and super admin dashboard.

- `src/index.css`
  Global styles for the application.

- `src/assets/`
  Stores local static assets used by the frontend, such as images.

- `src/components/`
  Reusable UI components. Currently includes the navigation bar.

- `src/lib/api.ts`
  Centralized frontend API helper. It builds API requests, reads the auth token from local storage, and handles API errors.

- `src/pages/`
  Route-level pages for the application. Important pages include:
  - `Home.tsx`: Landing page
  - `Login.tsx`: User login
  - `Register.tsx`: Customer registration
  - `Booking.tsx`: Booking form
  - `CustomerDashboard.tsx`: Customer booking dashboard
  - `AdminDashboard.tsx`: Admin booking management
  - `AdminRegister.tsx`: Admin access request page
  - `Notifications.tsx`: Notification-related page
  - `BookingSuccess.tsx`: Confirmation page after a booking action
  - `SuperAdminDashboard.tsx`: Super admin approval dashboard

### Backend: `backend/`

- `backend/server.cjs`
  Main Express server. It:
  - loads environment variables
  - enables CORS
  - registers API routes
  - serves the built frontend in production
  - checks required environment variables
  - ensures database tables exist before starting

- `backend/db.cjs`
  PostgreSQL connection setup. It also creates required tables if they do not already exist.

- `backend/routes/`
  Defines backend API endpoints:
  - `authRoutes.cjs`: registration and login routes
  - `bookingRoutes.cjs`: booking creation, booking fetch, booking approval/rejection routes
  - `adminRequestRoutes.cjs`: admin request submission and super admin approval routes

- `backend/controllers/`
  Contains the main backend business logic:
  - `authController.cjs`
  - `bookingController.cjs`
  - `adminRequestController.cjs`

- `backend/middleware/`
  Contains reusable request middleware such as JWT verification and role-based access control.

- `backend/package.json`
  Backend-specific dependencies and scripts.

## Database Notes

This project uses PostgreSQL.

On server startup, the backend automatically ensures that these tables exist:

- `users`
- `bookings`
- `admin_requests`

That means you do not need to manually import a schema file before running the app, but you do need a working PostgreSQL database and a valid `DATABASE_URL`.

## Environment Variables

The project needs backend environment variables. The frontend environment variable is optional for local development but useful for deployed setups.

### 1. Backend `.env`

Create a file at:

`<project-root>/backend/.env`

Add:

```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/YOUR_DATABASE_NAME
JWT_SECRET=your_secure_jwt_secret
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Notes:

- `DATABASE_URL` is required.
- `JWT_SECRET` is required.
- `PORT` is optional. If not provided, the backend uses `3001`.
- `FRONTEND_URL` is recommended for local frontend-backend communication.

If you want to allow multiple frontend origins in deployment, you can also use:

```env
FRONTEND_URLS=https://your-frontend-url.com,https://another-frontend-url.com
```

### 2. Frontend `.env` (optional for local use)

Create a file at:

`<project-root>/.env`

Add:

```env
VITE_API_BASE_URL=http://localhost:3001
```

Important note:

- In development, if `VITE_API_BASE_URL` is not set, the frontend already defaults to `http://localhost:3001`.
- In production, if frontend and backend are served from the same origin, `VITE_API_BASE_URL` is not required.

## Step-by-Step: How to Run the Project Locally

### 1. Open the project

```bash
cd SindhuraHotel
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Create a PostgreSQL database

Create a database in PostgreSQL, for example:

```sql
CREATE DATABASE sindhurahotel;
```

Then update `backend/.env` with the correct `DATABASE_URL`.

Example:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/sindhurahotel
```

### 5. Add environment variables

Create:

- `backend/.env`
- optional root `.env`

Use the examples shown in the Environment Variables section above.

### 6. Start the backend server

Open one terminal:

```bash
cd SindhuraHotel/backend
npm run dev
```

Expected backend URL:

`http://localhost:3001`

### 7. Start the frontend server

Open a second terminal:

```bash
cd SindhuraHotel
npm run dev
```

Expected frontend URL:

`http://localhost:5173`

### 8. Open the application in the browser

Visit:

`http://localhost:5173`

## Production Build Steps

To create a production frontend build:

```bash
cd SindhuraHotel
npm run build
```

This generates the `dist/` folder.

To start the project using the root start command:

```bash
cd SindhuraHotel
npm start
```

What this does:

- `npm start` runs the root `server.cjs`
- root `server.cjs` loads `backend/server.cjs`
- backend Express server starts
- if `dist/` exists, the backend can serve the frontend build

## API Behavior Notes

- Frontend API requests use `VITE_API_BASE_URL` if it is set.
- If `VITE_API_BASE_URL` is not set in development, the frontend defaults to `http://localhost:3001`.
- Authenticated requests use a JWT token stored in local storage.
- Booking routes and admin routes are protected by middleware.

## Default Roles in the System

- `customer`
  A regular user who can register, log in, and create bookings.

- `admin`
  A user who can view and manage booking requests.

- `superadmin`
  A privileged user who can review pending admin access requests.

Important note:

The backend creates the database tables automatically, but it does not automatically create a super admin account. If you want to test the super admin flow, a user role must be updated manually in the database.

Example approach:

1. Register a normal user from the UI.
2. Open PostgreSQL and update that user's role to `superadmin`.

Example SQL:

```sql
UPDATE users
SET role = 'superadmin'
WHERE mobile = 'YOUR_MOBILE_NUMBER';
```

## Suggested Testing Flow

If you want to test the project quickly, this is a good order:

1. Run backend and frontend locally.
2. Register as a customer.
3. Log in and create a booking.
4. Check customer dashboard booking history.
5. Submit an admin access request from the admin registration page.
6. If a super admin user is prepared in the database, log in as super admin and approve the pending admin request.
7. Log in as the approved admin and review bookings.

## Troubleshooting

### Backend does not start

Check:

- `backend/.env` exists
- `DATABASE_URL` is valid
- `JWT_SECRET` is present
- PostgreSQL service is running

### Frontend loads but API calls fail

Check:

- backend is running on port `3001`
- `FRONTEND_URL=http://localhost:5173` is present in backend `.env`
- `VITE_API_BASE_URL` is correct if you set it manually

### CORS error

The backend only allows approved origins. For local development, ensure the frontend is running from:

- `http://localhost:5173`
- or `http://127.0.0.1:5173`

For deployed environments, add the correct frontend URL using `FRONTEND_URL` or `FRONTEND_URLS`.

## Summary

To run this project successfully on a local machine:

1. Install frontend and backend dependencies.
2. Create a PostgreSQL database.
3. Add `backend/.env` with `DATABASE_URL` and `JWT_SECRET`.
4. Start backend on port `3001`.
5. Start frontend on port `5173`.
6. Open `http://localhost:5173`.
