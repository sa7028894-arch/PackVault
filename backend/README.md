# Backend README

This backend scaffold adds Prisma, basic JWT auth endpoints, package metadata endpoints, and helpers for S3 and Redis.

Setup (local)

1. Copy the example env and fill values:

   cp .env.example .env

2. Install dependencies:

   cd backend
   npm install

3. Generate Prisma client and run migrations:

   npx prisma generate
   npx prisma migrate dev --name init

4. Seed admin user:

   npm run prisma:seed

5. Start dev server:

   npm run dev

Key endpoints

- POST /api/auth/register  — body: { email, username, password }
- POST /api/auth/login     — body: { email, password }
- GET  /api/auth/me        — header: Authorization: Bearer <token>
- GET  /api/packages       — list packages
- POST /api/packages       — create package metadata (requires Bearer token)
- GET  /api/packages?name=packname — get package detail

