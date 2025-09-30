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
- **Auth & Roles (Dual Auth)**
  - Clerk as the primary authentication provider.
  - Optional DB‑backed credentials login (email/password stored in Postgres) in parallel with Clerk.
  - Unified role enforcement (USER, ADMIN) from the Prisma `User` table.
- **Admin Dashboard**
  - Blog Management (create/edit posts), taxonomy settings, user and comment management, subscriptions, analytics, media.

---

## Tech stack
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS base styles in `src/app/globals.css`.
- **Backend**: Next.js Route Handlers, Prisma ORM.
- **Database**: PostgreSQL (Neon recommended). SQLite used historically for local only.
- **Auth**: Clerk + optional DB credentials (JWT cookie). Unified via server helper `getAuthUser()`.
- **Media**: Cloudinary (signed uploads or admin upload route), `@cloudinary/react` optional.

---

## Project structure
```
src/
  app/
    page.tsx                         # Homepage (latest posts grid)
    search/page.tsx                  # Search with quick bar + FiltersModal
    category/[slug]/page.tsx         # Category listing with thumbnails, reading time, likes
    posts/[slug]/page.tsx            # Post detail
    auth/
      cred/page.tsx                  # DB credentials login page (optional)
      signin/page.tsx                # Clerk Sign in (Clerk UI)
    admin/
      layout.tsx                     # Admin guard (dual-auth) + sidebar
      posts/page.tsx                 # Admin: post management UI
      ...
    api/
      me/route.ts                    # Returns current user (role, source: clerk|cred)
      cred/
        login/route.ts               # DB credentials login (sets JWT cookie)
        logout/route.ts              # DB credentials logout (clears cookie)
      posts/[id]/like/route.ts       # Like API (auth required, one like per user)
      admin/
        posts/route.ts               # Admin APIs (dual-auth, ADMIN role)
        categories/route.ts
        tags/route.ts
        comments/route.ts
        users/route.ts
        subscriptions/route.ts
        analytics/route.ts
        upload/route.ts
      upload/sign/route.ts           # Cloudinary signing (if used)
  components/
    NavBar.tsx                       # Fetches /api/me and shows Admin badge
    PostCard.tsx
    FiltersModal.tsx
    Comments.tsx
    LikeButton.tsx
  lib/
    prisma.ts                        # Prisma client
    ensureDbUser.ts                  # Upserts Clerk user to DB and applies ADMIN_EMAILS allowlist
    credAuth.ts                      # DB credentials auth (JWT cookie helpers)
    dualAuth.ts                      # getAuthUser(): unify Clerk/DB sessions
prisma/
  schema.prisma                      # Prisma models (User, Post, Like, Category, Tag, Comment, ...)
  migrations/                        # Prisma migrations
scripts/
  migrate-sqlite-to-postgres.js      # One-time copy from sqlite → PostgreSQL
```

---

## Environment variables
Create `.env.local` at project root (and set the same on Vercel):
```
# Database (PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require"

# Clerk (App Router)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
SITE_URL="http://localhost:3000"  # Set to your production URL in prod env

# Optional admin allowlist (auto‑promote to ADMIN on first sign‑in via ensureDbUser)
# Comma-separated emails
ADMIN_EMAILS="admin@example.com,other.admin@example.com"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# DB credentials auth (JWT secret for cookie sessions)
CRED_JWT_SECRET="a-very-strong-random-secret"
```
Tip: copy `env.example.txt` to `.env.local` and fill in values for local dev.

---

## Authentication setup (Clerk + optional DB credentials)

- **Primary**: Clerk manages sign‑in/sign‑up and sessions.
  - Server helper: `ensureDbUser(userId, details)` upserts a matching row in your Prisma `User` table and auto‑promotes to `ADMIN` if email matches `ADMIN_EMAILS`.
  - All admin/API checks query the DB user role, not Clerk metadata.
- **Optional**: DB‑backed credentials login (parallel to Clerk).
  - `POST /api/cred/login` sets a signed JWT cookie (`cred_session`).
  - `POST /api/cred/logout` clears it.
  - UI: `/auth/cred` renders a simple email/password form.
  - Passwords are hashed using `bcryptjs` into `user.passwordHash`.
- **Unified server auth**: `getAuthUser()` in `src/lib/dualAuth.ts` returns the Prisma `User` from either source (Clerk or DB creds). Admin APIs and admin layout use this.

Checklist:
- Configure Clerk in dashboard and set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.
- Set `ADMIN_EMAILS` for auto‑promotion (optional).
- If using DB credentials login, set `CRED_JWT_SECRET` and ensure the user row has `passwordHash`.
- Start the app; `/api/me` will return `{ role, source: "clerk"|"cred" }` and the `NavBar` shows an Admin badge when `role === 'ADMIN'`.

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

## Content management (Admin) – Mini manual
- **Access**: `/admin` (requires `role === ADMIN`). Auth works via Clerk or DB credentials.
- **Sections**:
  - **Dashboard**: overview metrics (posts, users, comments, subscriptions; latest posts).
  - **Blog Management**: create/edit posts (title, content, cover image, gallery, optional video, published flag).
  - **Categories**: create/delete categories.
  - **Tags**: create/delete tags.
  - **Comments**: review and remove comments.
  - **Users**: list users, create/update roles, optional password management for DB login.
  - **Subscriptions**: view and delete newsletter signups.
  - **Media**: upload/delete via Cloudinary using the admin upload endpoint.
- **Editor**:
  - Markdown with toolbar + live preview.
  - Supports images, quotes, code, lists, links, headings, horizontal rule.
- **Publishing workflow**:
  - Save draft (unpublished), then toggle Published when ready.
  - Assign categories and tags for discoverability.
  - Upload cover image and additional gallery images to Cloudinary.

---

## Media uploads (Cloudinary)
- **Preferred**: Direct uploads from the admin UI using Cloudinary; store `secure_url` and (optionally) `public_id`.
- **Signing route (optional)**: `src/app/api/upload/sign/route.ts` if you want signed client‑side uploads.
- **Admin upload route**: `src/app/api/admin/upload/route.ts` supports POST (upload) and DELETE (by `public_id` or URL parsing).
- **Env**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

---

## Database & Prisma
- **Schema**: See `prisma/schema.prisma`.
  - `User` has `role` (USER|ADMIN), optional `passwordHash` for DB credentials login.
  - `Like` enforces one-like-per-user via `@@unique([postId, userId])`.
  - `Post` relates to categories, tags, images, comments, likes.
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
### Neon (remote PostgreSQL)
- Create a Postgres database and obtain a pooled connection string.
- Set `DATABASE_URL` in Vercel (or your host). Ensure SSL mode is required if needed.

### Clerk
- Create a Clerk application.
- In Clerk dashboard, copy Publishable key and Secret key.
- Add authorized redirect URLs for App Router if needed (generally not required for the built‑in UI widgets).
- Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in Vercel.
- Optional: set `ADMIN_EMAILS` to auto‑promote admins on first Clerk sign‑in.

### Cloudinary
- Create a Cloudinary account and a product environment.
- Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in Vercel.
- Choose either signed direct uploads or use the admin upload route.

### Vercel (serverless)
- Set env vars: `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLOUDINARY_*`, `CRED_JWT_SECRET`, optional `ADMIN_EMAILS`, `SITE_URL`.
- CI Build runs: `npx prisma generate && npx prisma migrate deploy && npm run build`.
- Note: Local filesystem is ephemeral—use Cloudinary for media.

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
- **Authentication**: Dual-auth unified on the server (`getAuthUser()`), DB role‑based enforcement.
- **Likes**: `POST /api/posts/[id]/like` requires auth; one-like-per-user.
- **Sanitization**: If you allow raw HTML in Markdown, sanitize outputs (e.g., DOMPurify) in admin preview and public post pages.
- **Secrets**: Keep `CLERK_SECRET_KEY`, `CRED_JWT_SECRET`, and `CLOUDINARY_API_SECRET` private.

---

## API endpoints overview
- **Public**
  - `GET /api/me` – current user `{ id, role, email, source: clerk|cred|null }`
  - `POST /api/cred/login` – DB credentials login (sets cookie)
  - `POST /api/cred/logout` – clears DB credentials cookie
  - `POST /api/posts/[id]/like` – like/unlike a post (auth required)
  - `GET /api/upload/sign` – Cloudinary signing (if used)
- **Admin** (dual-auth + role check in handlers)
  - `GET/POST/PATCH/DELETE /api/admin/posts` – manage posts
  - `GET/POST/DELETE /api/admin/categories` – manage categories
  - `GET/POST/DELETE /api/admin/tags` – manage tags
  - `GET/DELETE /api/admin/comments` – moderate comments
  - `GET/DELETE /api/admin/subscriptions` – manage subscriptions
  - `GET /api/admin/analytics` – dashboard metrics
  - `POST/DELETE /api/admin/upload` – media upload/delete (Cloudinary)

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
