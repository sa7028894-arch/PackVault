# Random Joke Generator

This adds a simple Random Joke Generator to the PackVault Next.js backend branch.

What was added

- backend/app/api/joke/route.ts — server API route that proxies a random joke from https://icanhazdadjoke.com/.
- backend/app/joke/page.tsx — a minimal Next.js page that calls the API and displays a random joke.
- backend/package.json, backend/next.config.js, backend/tsconfig.json — minimal Next app setup files.

How to run locally

1. From the repository root, install dependencies:

   cd backend
   npm install

2. Start the dev server:

   npm run dev

3. Open http://localhost:3000/joke to view the Random Joke Generator.

Notes

- The API route fetches jokes from icanhazdadjoke.com using the Accept: application/json header.
- No rate-limiting or caching beyond Next's `revalidate` option is implemented yet; for production add caching (Redis) or rate limits.

Next steps (optional)

- Add server-side caching (Redis) to avoid hitting the external API on every request.
- Add a client-side UI improvement and styling.
- Add tests for the API route.
