# Account & tokens

- Added account page (/account) to view profile and manage API tokens.
- API endpoints:
  - POST /api/tokens/create — create a new API token (returns raw token once)
  - POST /api/tokens/revoke — revoke an API token by id
  - GET  /api/tokens — list tokens for the authenticated user
  - GET  /api/me — get current user profile

Notes:
- Access tokens (API tokens) are stored hashed. The raw token is shown only once when created.
