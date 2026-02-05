 # Streamify Video Calls

Streamify is a full-stack video calling and chat app with authentication, friend management, real‑time messaging, and language‑exchange features.

## Features

- Email/password authentication with onboarding flow
- Friend requests, notifications, and friends list
- 1:1 chat and video call pages
- Theming with Tailwind + DaisyUI
- REST API with protected routes

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, DaisyUI, React Router, TanStack Query
- Backend: Node.js, Express, MongoDB (Mongoose)

## Project Structure

```
backend/
	src/
		controllers/
		lib/
		middleware/
		models/
		routes/
frontend/
	src/
		components/
		hooks/
		lib/
		pages/
		store/
```

## Prerequisites

- Node.js 18+
- MongoDB (local or cloud)

## Environment Variables

Create a .env file inside backend/:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
```

If your frontend needs API base URL, set it in frontend/.env:

```
VITE_API_URL=http://localhost:5000
```

## Install

From the repo root:

1) Backend

```
cd backend
npm install
```

2) Frontend

```
cd ../frontend
npm install
```

## Run Locally

Open two terminals:

1) Backend

```
cd backend
npm run dev
```

2) Frontend

```
cd frontend
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

## API Overview

Base URL: /api

- Auth
	- POST /auth/signup
	- POST /auth/login
	- POST /auth/logout
	- GET /auth/me
	- POST /auth/onboarding

- Users
	- GET /users (recommended users)
	- GET /users/friends
	- GET /users/friend-requests
	- GET /users/outgoing-friend-requests
	- POST /users/friend-request/:id
	- PUT /users/friend-request/:id/accept

- Chat
	- GET /chat/token

## Scripts

Backend

- npm run dev

Frontend

- npm run dev
- npm run build
- npm run preview

## Notes

- Ensure MongoDB is running before starting the backend.
- The /friends page shows the authenticated user’s friends list.
