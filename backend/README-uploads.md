
# Upload & Download

This commit adds presigned upload and download endpoints and a simple client page to publish packages.

New API endpoints

- POST /api/upload/presign  — Request a presigned PUT URL for a package version. Body: { packageName, version, contentType, size }. Requires Authorization: Bearer <token> and package ownership.
- POST /api/upload/complete — Tell the server the upload finished. Body: { packageName, versionId, checksum? }. Requires Authorization: Bearer <token>.
- GET  /api/download?name=<pkg>&version=<ver> — Get a presigned download URL.

New client page

- /publish — simple UI to provide a token, package name, version, and file. It requests a presigned URL, uploads the file directly, then calls the complete endpoint and shows a download URL.

Rate limiting

- A simple per-user rate limiter is applied to the presign endpoint (stored in Redis). This is intentionally minimal — for production use a more robust limiter is recommended.
