# HRMSS

Starter structure for the HRMSS project with a React + Vite frontend, an Express API, and a PostgreSQL schema entry point.

## Requirements

- Node.js 20 or newer
- PostgreSQL 14 or newer

## Setup

1. Install frontend dependencies:

   ```powershell
   cd D:\KLTN_FA26\HRMSS\frontend
   npm install
   ```

2. In a separate terminal, install backend dependencies, copy the environment example, and set the PostgreSQL connection values in `backend/.env`:

   ```powershell
   cd D:\KLTN_FA26\HRMSS\backend
   npm install
   Copy-Item .env.example .env
   ```
3. Create an empty PostgreSQL database and apply the schema (adjust the user if needed):

   ```bash
   createdb -U postgres hrmss
   psql -U postgres -d hrmss -v ON_ERROR_STOP=1 -f D:/KLTN_FA26/HRMSS/database/schema.postgresql.sql
   ```

   The script creates 25 tables, constraints, initial roles, and automatic updated_at triggers in one transaction. The original MySQL schema in database/Database/ is retained as a reference; use database/schema.postgresql.sql for this backend.
4. Start the frontend from its own directory:

   ```powershell
   cd D:\KLTN_FA26\HRMSS\frontend
   npm run dev
   ```

5. Start the backend in a separate terminal from its own directory:

   ```powershell
   cd D:\KLTN_FA26\HRMSS\backend
   npm run dev
   ```

The Vite development server runs at `http://localhost:5173`; the API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health` to verify the API.

Press `Ctrl + C` in the corresponding terminal to stop either application.

## Frontend structure

- `frontend/src/components/`: reusable UI, including API status.
- `frontend/src/pages/`: page components.
- `frontend/src/services/`: API requests.
- `frontend/src/styles/`: shared styles.
- `frontend/src/App.jsx`: application shell.
- `frontend/vite.config.js`: React plugin and development API proxy.

The starter screen displays planned hotel management modules as placeholders. The health endpoint checks the API process, not PostgreSQL connectivity.

## Production build

Build and preview from the frontend directory:

```powershell
cd D:\KLTN_FA26\HRMSS\frontend
npm run build
npm run preview
```

The build output is in `frontend/dist`.

For a separately hosted API, copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` before building. For same-origin hosting, configure the host to route `/api` to Express. Vite's API proxy applies only during development. Frontend environment variables are public; store database credentials only in the backend environment.

## Backend database access

The backend exports a pg.Pool from backend/config/database.js. Use parameterized queries such as `const { rows } = await pool.query("SELECT * FROM role WHERE role_code = $1", [roleCode])`. PostgreSQL uses $1, $2, etc. for parameters; pg returns a result object containing rows. BIGINT and NUMERIC values are returned as strings by default to preserve precision.
