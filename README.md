# KeepAlive App - Monorepo (API + Worker + Web)

This repo is a minimal **MVP** for a "Keep Alive" service to ping hosted apps (Render, etc.)
Structure:
- `api/` - Express API + Prisma (CRUD for user apps)
- `worker/` - Background worker (cron) that pings apps
- `web/` - Next.js dashboard using Supabase Auth client

This ZIP is scaffolded for local testing and deployment. You need to provide environment variables
(see `.env.example`) and run `npm install` in each subfolder.

## Quick start (local)
1. Create a Postgres database (e.g. Supabase) and set `DATABASE_URL` in each service.
2. Fill other env variables in `.env` files based on `.env.example`.
3. Run Prisma migrations from `api/`:
   ```
   cd api
   npm install
   npx prisma migrate dev --name init
   npx prisma generate
   ```
4. Start API:
   ```
   npm run dev
   ```
5. Start Worker (in another terminal):
   ```
   cd worker
   npm install
   npm run dev
   ```
6. Start Web (Next.js):
   ```
   cd web
   npm install
   npm run dev
   ```

## Notes
- This is an MVP scaffold. Replace Supabase project values and secure service role keys.
- For production, deploy `api` and `worker` on an always-on host (Render background worker, Railway, Fly).
- `web` (Next.js) can be deployed on Vercel.

