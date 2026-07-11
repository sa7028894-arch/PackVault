# Integration tests

These integration tests exercise the publish and download flow using the running dev server and MinIO/Postgres started via docker-compose.

Run locally (after docker-compose up and backend prepared):

  cd backend
  npm install
  npx prisma generate
  npx prisma migrate dev --name init
  npm run prisma:seed
  npm test

CI will run these tests against services started in the workflow.
