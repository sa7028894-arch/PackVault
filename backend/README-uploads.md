feat: add checksum verification, public downloads, and packages UI

- prisma: add isPublic field on PackageVersion
- s3 helper: add verifyObjectChecksum and headObject
- upload complete: verify checksum if provided and allow makePublic flag
- download: allow unauthenticated downloads for public versions
- packages page: UI to list packages and download versions

After pulling these changes run:
  cd backend
  npx prisma migrate dev --name add-ispublic

