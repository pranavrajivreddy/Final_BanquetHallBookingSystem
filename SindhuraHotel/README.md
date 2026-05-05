# Banquet Hall Booking System

## Local development

Frontend requests use `VITE_API_BASE_URL` when it is set. If it is not set:

- development defaults to `http://localhost:3001`
- production defaults to same-origin requests

Example frontend env:

```bash
VITE_API_BASE_URL=http://localhost:3001
```

## Render deployment

If you deploy the frontend and backend separately on Render:

1. Set `VITE_API_BASE_URL=https://final-banquethallbookingsystem.onrender.com` on the frontend service.
2. Set `FRONTEND_URL=https://your-frontend-url.onrender.com` on the backend service.

If you need to allow more than one deployed frontend origin, you can also set:

```bash
FRONTEND_URLS=https://your-frontend-url.onrender.com,https://another-frontend-url.onrender.com
```

If the frontend is served by this same Express app, you do not need `VITE_API_BASE_URL` in production because the client will use the same origin automatically.
