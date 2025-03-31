# Personal Timesheet Application

A personal timesheet application built with Next.js, TypeScript, MongoDB, Tailwind CSS, and iron-session authentication. This app allows you to log daily activities with ratings, filter entries by month, and manage your timesheet data—all secured by a static password authentication system.

## Features

- **CRUD Operations:** Create, read, and view timesheet entries with fields for date, task/activity, category/project, and ratings (e.g., focus, energy, productivity).
- **Monthly Filtering:** Select a month to view corresponding timesheet entries.
- **Static Password Authentication:** Simple, secure login using iron-session. Password is hashed with SHA-256 and stored in environment variables.
- **API Routes:** Implemented using Next.js Route Handlers (App Router) for seamless server-side functionality.
- **MongoDB Integration:** Uses Mongoose to interact with a MongoDB database for storing timesheet entries.

## Tech Stack

- **Frontend:** Next.js (App Router) with React and TypeScript
- **Backend:** Next.js API routes (App Router) with Node.js
- **Database:** MongoDB (using Mongoose)
- **Authentication:** iron-session (static password, hashed with SHA-256)
- **Styling:** Tailwind CSS with custom synthwave theme
- **Deployment:** Can be deployed on Vercel or using Docker for local development

## Setup and Installation

### Prerequisites

- Node.js (v20 or later recommended)
- npm (v10+)
- MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- (Optional) Docker and Docker Compose for development

### Environment Variables

Create a `.env` file in the root of your project with the following (update values as needed):

```env
# MongoDB connection string (local or Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/yourDatabase?retryWrites=true&w=majority

# Session secret for iron-session (min. 32 characters)
SESSION_SECRET=your_generated_session_secret_here

# Hashed password (SHA-256 hash of your desired static password)
HASHED_PASSWORD=your_generated_hashed_password_here
```

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/personal-timesheet.git
   cd personal-timesheet
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app if running locally, not publishing the link of online version until I am totally sure about the security implications.

## Docker Development (Optional)

If you prefer to run the app in a containerized environment with hot-reloading:

1. **Build and run using Docker Compose:**

   ```bash
   docker-compose up --build
   ```

2. **Access the app:**

   Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
.
├── app/                   # Next.js App Router pages and API routes
│   ├── login/             # Login page for authentication
│   │   └── page.tsx
│   ├── api/
│   │   ├── login/         # Login API route using iron-session
│   │   │   └── route.ts
│   │   └── timesheet/     # Timesheet CRUD API routes
│   │       └── route.ts
│   └── page.tsx           # Main timesheet page (UI)
├── lib/                   # Utility functions and configuration (e.g., session.ts, dbConnect.ts)
├── models/                # Mongoose models (e.g., TimesheetEntry.ts)
├── styles/                # Global CSS and Tailwind configuration
├── .env.local             # Environment variables (not committed)
├── package.json           # Project metadata and dependencies
└── README.md              # This file
```

## Authentication Flow

- **Login Page:**  
  The `/login` page collects your static password and sends it to the `/api/login` API route.

- **API Route:**  
  The API route validates the password by comparing its SHA-256 hash (without salt) against the stored `HASHED_PASSWORD` from the environment. On success, a session flag (`isLoggedIn: true`) is set using iron-session.

- **Middleware Protection:**  
  A custom middleware checks for a valid session cookie (`timesheet-session`) on protected routes and redirects unauthorized users to `/login`.

## Styling & Theming

The application uses a custom synthwave theme inspired by neon aesthetics. Key styling features include:

- **Neon Gradient Background:** A vibrant background gradient for a retro-futuristic vibe.
- **Synth Cards:** Semi-transparent, dark cards with neon borders to highlight content.
- **Neon Accents:** Bright neon pink (`#ff77e9`) for headings, borders, and buttons.
- **Responsive Design:** Tailwind CSS grid and utility classes ensure the UI is responsive on mobile and desktop.
