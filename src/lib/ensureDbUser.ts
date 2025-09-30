import prisma from "@/lib/prisma";

type EnsureDetails = {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
};

export async function ensureDbUser(userId: string, details: EnsureDetails = {}) {
  const primaryEmail = details.email ? String(details.email) : null;
  const fullName =
    [details.firstName, details.lastName].filter(Boolean).join(" ") ||
    (details.username ? String(details.username) : null);

  // Determine role via ADMIN_EMAILS allowlist
  const adminList = (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const isAdmin = primaryEmail ? adminList.includes(primaryEmail.toLowerCase()) : false;

  // Upsert DB user with any new fields and role promotion if allowed
  const dbUser = await prisma.user.upsert({
    where: { id: userId },
    update: {
      ...(primaryEmail ? { email: primaryEmail.toLowerCase() } : {}),
      ...(fullName ? { name: fullName } : {}),
      ...(isAdmin ? { role: "ADMIN" } : {}),
    },
    create: {
      id: userId,
      email: primaryEmail?.toLowerCase() || null,
      name: fullName,
      role: isAdmin ? "ADMIN" : "USER",
    },
  });

  return dbUser;
}
