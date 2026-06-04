# FieldVault CRM

Multi-tenant contractor CRM. Built on React + Vite + Express + Supabase. Deployable to Railway.

## Role Hierarchy
- **superadmin** (Jordan) — sees all tenants, manages platform
- **admin** (e.g. Dad at Sunlight) — manages their own tenant, users, all data
- **staff** — sees assigned jobs, own todos, shared calendar

## Setup

### 1. Supabase
1. Create new Supabase project at supabase.com
2. Run `supabase_schema.sql` in the SQL editor
3. Copy your project URL and service role key

### 2. Create Users in Supabase Auth
1. Go to Auth > Users in Supabase dashboard
2. Create your superadmin user (your email)
3. Create dad's admin user
4. Note both UUIDs

### 3. Seed the Database
Run the commented seed SQL at the bottom of `supabase_schema.sql`:
- Insert the Sunlight tenant
- Insert your superadmin user (tenant_id = NULL, role = 'superadmin')
- Insert dad's user (tenant_id = sunlight tenant id, role = 'admin')

### 4. Local Dev
```bash
# Root
npm install

# Server
cd server && npm install
cp .env.example .env  # fill in your Supabase creds
cd ..

# Client
cd client && npm install
cd ..

# Run both
npm run dev
```

### 5. Railway Deploy
1. Push to GitHub: `git init && git add . && git commit -m "init fieldvault"`
2. New Railway project > Deploy from GitHub
3. Set environment variables:
   - `PORT=3001`
   - `NODE_ENV=production`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CLIENT_URL` (your Railway URL)
4. Build command: `npm run build`
5. Start command: `npm start`

Add the production static file serving from `RAILWAY_DEPLOY.js` to `server/index.js` before deploying.

## Features
- ✅ Multi-tenant with RLS (Row Level Security)
- ✅ Dashboard with stats, recent jobs, upcoming events, todos
- ✅ Clients — full CRUD, status tracking, source tracking
- ✅ Jobs — full pipeline from new → invoiced, service types, follow-up dates
- ✅ Calendar — monthly view, event types, click-to-add
- ✅ Todos — priority levels, due dates, complete/incomplete toggle
- ✅ Team management — admin can add/deactivate staff
- ✅ Superadmin panel — view/add all tenants

## Stack
- Frontend: React 18 + Vite + React Router
- Backend: Express.js
- Database: Supabase (PostgreSQL + Auth + RLS)
- Fonts: Syne (display) + DM Sans (body)
- Deploy: Railway
