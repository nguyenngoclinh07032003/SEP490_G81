# HRMSS

Starter structure for the HRMSS project with a React + Vite frontend, an Express API, and a MySQL schema entry point.

## Requirements

- Node.js 20 or newer
- MySQL 8 or newer

## Setup

1. Install dependencies from the project root:

   ```bash
   npm install
   ```

2. Copy `backend/.env.example` to `backend/.env` and set the MySQL connection values.
3. Run `database/schema.sql` using your MySQL client against a fresh database. The script creates the `hrmss` database, all 25 tables, and the initial role records. It targets MySQL 8.0.16 or newer.
4. Start both applications from the project root:

   ```bash
   npm run dev
   ```

The Vite development server runs at `http://localhost:5173`; the API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health` to verify the API.

Run either side separately with `npm run dev:frontend` or `npm run dev:backend`.
