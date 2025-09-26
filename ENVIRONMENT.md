# Environment Setup

Create a `.env` file in the project root with the following variables (file is gitignored):

```
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-strong-random-secret"

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Twitter/X OAuth
TWITTER_CLIENT_ID=""
TWITTER_CLIENT_SECRET=""

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

## Quickstart
- Install deps: `npm install`
- Set env: create `.env` using values above
- Initialize DB: `npx prisma migrate dev --name init`
- Start dev: `npm run dev`

Deploy on Vercel and add the same env vars in the Vercel project settings.
