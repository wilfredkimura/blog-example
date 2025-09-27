# Unveiling Truth – Blog Platform

A full‑stack Next.js blog with admin dashboard, categories/tags, search & filters, Cloudinary media, comments, likes, and PostgreSQL via Prisma.

## Table of contents
- **Features**
- **Tech stack**
- **Project structure**
- **Environment variables**
- **Authentication setup**
- **Local development (PostgreSQL)**
- **Content management (Admin)**
- **Media uploads (Cloudinary)**
- **Database & Prisma**
- **Migrate existing SQLite data to Postgres**
- **Deployment (Vercel & Render)**
- **Security & hardening**
- **API endpoints overview**
- **Troubleshooting**

---

## Features
- **Posts**
  - Create, edit, publish/unpublish posts with image, optional video, and gallery.
  - Markdown content with Stack Overflow–style editor: toolbar + live preview.
  - Server-side rendered post pages with SEO metadata.
- **Categories & Tags**
  - Assign multiple categories/tags per post.
  - Category pages include thumbnails, estimated reading time, comments count, and like button.
- **Search & Filters**
  - `/search` with quick search bar and advanced filters (`FiltersModal`): date range, sort, pagination.
  - Category pages support sorting and paging.
- **Comments**
  - Public comments per post. Admin moderation via dashboard.
- **Likes**
  - Heart button per post. One like per user. Live count.
- **Media**
  - Cloudinary direct uploads. Thumbnails and post cover images shown site‑wide inside a bordered, rounded rectangle.
- **Auth & Roles**
  - NextAuth with credentials + optional Google/Twitter OAuth. Roles: USER, ADMIN.
- **Admin Dashboard**
  - Blog Management (create/edit posts), taxonomy settings, user and comment management, subscriptions.

---

## Tech stack
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS base styles in `src/app/globals.css`.
- **Backend**: Next.js Route Handlers, Prisma ORM.
- **Database**: PostgreSQL (development and production). Previously SQLite supported for local only.
- **Auth**: NextAuth (JWT sessions), Prisma Adapter.
- **Media**: Cloudinary (signed direct uploads), `@cloudinary/react` optional.

---

## Project structure
```
src/
  app/
    page.tsx                    # Homepage (latest posts grid)
    search/page.tsx             # Search with quick bar + FiltersModal
    category/[slug]/page.tsx    # Category listing with thumbnails, reading time, likes
    posts/[slug]/page.tsx       # Post detail with share icons, likes, comments
    api/
      upload/sign/route.ts      # Cloudinary signing
      posts/[id]/like/route.ts  # Like API (auth required, one like per user)
      ... (admin APIs for posts, categories, tags, comments, subscriptions)
  components/
    PostCard.tsx                # Bordered image card used on homepage
    FiltersModal.tsx            # Advanced filters modal
    Comments.tsx                # Comments list & form
    LikeButton.tsx              # Client like button component
    ...
  lib/
    prisma.ts                   # Prisma client
    auth.ts                     # NextAuth configuration
prisma/
  schema.prisma                 # Prisma models (Post, Like, Category, Tag, Comment, ...)
  sqlite.schema.prisma          # SQLite-only schema for one-time migration client
  migrations/                   # Prisma migrations
scripts/
  migrate-sqlite-to-postgres.js # One-time copy from prisma/dev.db → PostgreSQL
```

---

## Environment variables
Create `.env` at project root:
```
# Database (PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"           # or your production URL
NEXTAUTH_SECRET="set-a-strong-random-secret"
# Optional: admin email allowlist (comma-separated)
ADMIN_EMAILS="admin@example.com"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```
If using pooled serverless DBs (e.g., Supabase/Neon), include pooling params as required by your provider.

You can also copy the template at `env.example.txt` and fill in your values. On Render, set these in your Web Service dashboard. See `render.yaml` for IaC configuration.

---

## Authentication setup

This project uses NextAuth with credentials (email/password) and optional Google and Twitter OAuth. Key files:

- `src/lib/auth.ts` – NextAuth configuration (providers, callbacks, `NEXTAUTH_SECRET`, `ADMIN_EMAILS`).
- `src/app/api/auth/[...nextauth]/route.ts` – NextAuth API route.
- `src/components/providers/AuthProvider.tsx` – wraps app with `SessionProvider`.
- `src/app/auth/signin/page.tsx` – Sign in (credentials + optional OAuth buttons).
- `src/app/auth/signup/page.tsx` – Sign up (email/password).
- `src/middleware.ts` – protects `/admin/:path*` (requires login). Role checks happen in API routes.

Required environment variables (production):

- `DATABASE_URL` – Postgres connection string.
- `NEXTAUTH_URL` – base URL of the site (e.g., `https://<your-service>.onrender.com`).
- `NEXTAUTH_SECRET` – a long random string.

Optional variables:

- `ADMIN_EMAILS` – comma-separated list promoted to ADMIN on login.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` – enable Google OAuth.
- `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET` – enable Twitter OAuth.

OAuth redirect URLs (configure in provider consoles):

- Google: `https://<your-service>.onrender.com/api/auth/callback/google`
- Twitter: `https://<your-service>.onrender.com/api/auth/callback/twitter`

Local testing checklist:

1. Add `.env` with `DATABASE_URL`, `NEXTAUTH_URL=http://localhost:3000`, `NEXTAUTH_SECRET`, optional `ADMIN_EMAILS` and provider keys.
2. Run `npm ci`, `npx prisma migrate dev`, `npx prisma generate`, then `npm run dev`.
3. Visit `/auth/signup` to create an account, then `/auth/signin` to log in.
4. If your email is in `ADMIN_EMAILS`, confirm admin access to admin APIs/pages.

---

## Local development (PostgreSQL)
- **Install deps**
```
npm ci
```
- **Apply schema and generate client**
```
npx prisma migrate dev --name init
npx prisma generate
```
- **Run**
```
npm run dev
```
- **Browse**: http://localhost:3000

---

## Content management (Admin)
- **Location**: Admin → Blog Management (`src/app/admin/posts/page.tsx`).
- **Editor**: Markdown with live preview and a toolbar (bold/italic, code, lists, headings, links, images, quote, HR).
- **Media**: Cover image, optional video, gallery uploads.
- **Taxonomies**: Choose categories and tags.
- **Status**: Toggle `Published`.

---

## Media uploads (Cloudinary)
- **Server route**: `src/app/api/upload/sign/route.ts` returns `{ cloudName, apiKey, timestamp, signature }`.
- **Client flow**: Upload directly to Cloudinary with the signature; store `secure_url` in the DB.
- **Delete (optional)**: Add a destroy route using Cloudinary Admin API and `public_id` if you want server‑side deletes.

---

## Database & Prisma
- **Schema**: See `prisma/schema.prisma`.
  - `Post` includes `likes Int @default(0)` and relations to `Category`, `Tag`, `Comment`, `PostImage`, and `Like` (`likesList`).
  - `Like` enforces one-like-per-user via `@@unique([postId, userId])`.
- **Common commands**:
```
# Create migration from schema changes
yarn prisma migrate dev --name <name>
# or
npx prisma migrate dev --name <name>

# Sync prod (apply migrations)
npx prisma migrate deploy

# Open DB UI
npx prisma studio
```

---

## Migrate existing SQLite data to Postgres (one time)
If you started on SQLite (local) and want to copy data to Postgres:
1) Ensure `prisma/dev.db` contains your old data.
2) Generate a dedicated SQLite Prisma Client:
```
npx prisma generate --schema prisma/sqlite.schema.prisma
```
3) Ensure `.env` `DATABASE_URL` points to your Postgres DB and that the schema is applied:
```
npx prisma migrate dev --name init
```
4) Run the script:
```
npm run migrate:sqlite-to-postgres
```
This reads from SQLite and upserts into Postgres, preserving IDs and relations.

---

## Deployment
### Vercel (serverless)
- Set project env vars: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `CLOUDINARY_*`.
- Deploy via Git. After schema changes, run `npx prisma migrate deploy` against prod DB.
- Note: Local filesystem is ephemeral on Vercel—use Cloudinary for all media.

### Render (Node Web Service)
- Prefer using the included `render.yaml` (Infrastructure-as-Code). It provisions a Postgres database, wires `DATABASE_URL`, and sets build/start commands.
- Set env vars as above (in the Web Service dashboard): `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, optional `ADMIN_EMAILS`, OAuth keys, and `CLOUDINARY_*`.
- Build Command (matches `render.yaml`):
```
npm ci
npx prisma generate
npm run build
```
- Start Command (matches `render.yaml`):
```
npx prisma migrate deploy
npm run start
```
- No disk attachment is required since media is in Cloudinary and DB is Postgres.

---

## Security & hardening
- **Authentication**: NextAuth with JWT sessions. Customize providers in `src/lib/auth.ts`.
- **Likes**: `POST /api/posts/[id]/like` requires login; enforces one-like-per-user.
- **Sanitization**: If you allow raw HTML in Markdown, consider sanitizing render output (e.g., DOMPurify) in both:
  - Admin preview (`src/app/admin/posts/page.tsx`).
  - Post page (`src/app/posts/[slug]/page.tsx`).
- **Secrets**: Keep `NEXTAUTH_SECRET` and `CLOUDINARY_API_SECRET` private.

---

## API endpoints overview
- **Public**
  - `GET /api/comments?postId=...` – list comments for a post
  - `POST /api/comments` – create a comment
  - `POST /api/posts/[id]/like` – like a post (auth required)
  - `GET /api/upload/sign` – Cloudinary signing (server-only secrets)
- **Admin** (typically auth + role check applied in handlers)
  - `GET/POST/PATCH/DELETE /api/admin/posts` – manage posts
  - `GET/POST/DELETE /api/admin/upload` – legacy local upload route (prefer Cloudinary)
  - `GET/POST/PATCH/DELETE /api/admin/categories` – manage categories
  - `GET/POST/PATCH/DELETE /api/admin/tags` – manage tags
  - `GET/POST/PATCH/DELETE /api/admin/comments` – manage comments
  - `GET/POST/PATCH/DELETE /api/admin/subscriptions` – manage subscriptions

---

## Troubleshooting
- **500 Unknown field `likes`**
  - Run migrations: `npx prisma migrate dev --name add_likes` then `npx prisma generate`.
- **P1012: URL must start with `postgresql://`**
  - Fix `.env` `DATABASE_URL` formatting and ensure no hidden characters.
- **P1000: Auth failed**
  - Check DB user/password; URL-encode password if needed.
- **Windows EPERM on Prisma generate**
  - Ensure no dev server is locking `.prisma` DLL; stop processes, then `npx prisma generate`.
- **Cloudinary Unauthorized (401)**
  - Verify `CLOUDINARY_*` env vars; ensure client uploads use server signature from `/api/upload/sign`.

---

## Scripts
```
# Dev
npm run dev
# Build & Start
npm run build && npm start
# Prisma
npx prisma migrate dev --name <name>
npx prisma migrate deploy
npx prisma generate
npx prisma studio
# One-time data copy SQLite → Postgres
npm run migrate:sqlite-to-postgres
```

---

## License
MIT (c) Unveiling Truth. Feel free to use and adapt.
