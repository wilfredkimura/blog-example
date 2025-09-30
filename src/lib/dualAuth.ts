import { auth, currentUser } from "@clerk/nextjs/server";
import { ensureDbUser } from "@/lib/ensureDbUser";
import { getCredUser } from "@/lib/credAuth";
import prisma from "@/lib/prisma";

export type DbUser = Awaited<ReturnType<typeof prisma.user.findUnique>>;

export async function getAuthUser(): Promise<DbUser> {
  const { userId } = await auth();
  if (userId) {
    const cu = await currentUser();
    return await ensureDbUser(userId, {
      email: cu?.emailAddresses?.[0]?.emailAddress ?? null,
      firstName: cu?.firstName ?? null,
      lastName: cu?.lastName ?? null,
      username: (cu as any)?.username ?? null,
    });
  }
  const cred = await getCredUser();
  if (cred) return cred;
  return null as unknown as DbUser; // explicit null typed
}
