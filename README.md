# KaamMitra – Voice-Based Local Services Marketplace

KaamMitra is a voice-first local services marketplace tailored for Indian/Bharat users. It connects customers with verified nearby workers (Electrician, Plumber, Carpenter, etc.) without relying on middlemen.

## Technology Stack
- **Frontend**: React (Vite), Tailwind CSS, React Router, Lucide React (Icons), Web Speech API.
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), bcrypt.
- **Database**: MongoDB (Mongoose) with GeoJSON geospatial indexing for location matching.

## Prerequisites
- Node.js (v18+)
- MongoDB running locally or Atlas URI.

## Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory (already created for you in this setup):
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/kaammitra
   JWT_SECRET=supersecretjwtkey_kaammitra
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```

### 2. Frontend Setup
1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

## Features Built in MVP Phase 1 & 2
- User Authentication (Customer & Worker Roles).
- JWT generation and password hashing.
- Mongoose Geospatial Data Models (Point).
- Beautiful, fully-responsive Tailwind UI with modern glass-morphism hints.
- Voice-search integration ("Kaam bolo, worker pao").

## How to Test Voice Search
- Ensure you give Microphone permissions to `localhost:5173`.
- Click the large blue microphone icon on the Home Page and speak (e.g., "Plumber"). 
- The text will be transcribed on screen using the Web Speech API.
