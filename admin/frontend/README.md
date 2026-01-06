# SipZy Admin Portal

A simple admin portal to view all restaurants uploaded by users on the onboarding platform.

## Features

- View all restaurants in the system
- View restaurant details including:
  - Basic info (name, bio, phone, address, etc.)
  - Gallery images
  - Beverages
  - Events
  - Documents
  - Legal information
  - Bank details
- Simple hardcoded authentication (temporary)

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3100

# Admin Credentials (TEMPORARY - DO NOT USE IN PRODUCTION)
VITE_ADMIN_PHONE=9999999999
VITE_ADMIN_PASSWORD=admin123
```

## Backend Setup

```bash
cd backend
docker-compose up --build
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
API_GATEWAY_PORT=3100
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NODE_ENV=development
```

## Architecture

### Frontend
- React + Vite
- Tailwind CSS for styling
- Read-only views (no edit functionality)
- Hardcoded login credentials stored in environment variables

### Backend
- Single API Gateway on port 3100
- Single Admin Service (all endpoints in one service)
- No authentication middleware (relies on frontend auth only)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /restaurants | Get all restaurants |
| GET | /restaurants/:id | Get single restaurant |
| GET | /restaurants/:id/legal | Get restaurant legal info |
| GET | /restaurants/:id/bank | Get restaurant bank details |
| GET | /restaurants/:id/beverages | Get restaurant beverages |
| GET | /restaurants/:id/events | Get restaurant events |
| GET | /beverages/:id | Get single beverage |
| GET | /events/:id | Get single event |

## ⚠️ Security Notice

This is a **temporary admin portal** with hardcoded authentication. 
- Do NOT use in production
- Do NOT expose to public internet
- Credentials are stored in frontend .env file (visible in browser)

For production use, implement proper authentication with:
- Backend session/JWT authentication
- Role-based access control
- Secure credential storage
