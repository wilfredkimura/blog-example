export { default } from "next-auth/middleware";

// Protect these routes with authentication. Role checks happen server-side in routes.
export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
