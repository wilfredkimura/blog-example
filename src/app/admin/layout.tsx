import { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ensureDbUser } from "@/lib/ensureDbUser";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/auth/signin");
  const cu = await currentUser();
  const dbUser = await ensureDbUser(userId, {
    email: cu?.emailAddresses?.[0]?.emailAddress ?? null,
    firstName: cu?.firstName ?? null,
    lastName: cu?.lastName ?? null,
    username: (cu as any)?.username ?? null,
  });
  if (dbUser.role !== "ADMIN") redirect("/auth/signin");
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 grid grid-cols-12 gap-6">
      <aside className="col-span-12 md:col-span-3 space-y-2">
        <div className="p-4 rounded-lg section-secondary">
          <h2 className="font-semibold">Admin</h2>
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          <Link href="/admin" className="underline">Dashboard</Link>
          <Link href="/admin/posts" className="underline">Blog Management</Link>
          <Link href="/admin/users" className="underline">User Management</Link>
          <Link href="/admin/subscriptions" className="underline">Subscriptions</Link>
          <Link href="/admin/comments" className="underline">Comments</Link>
          <Link href="/admin/analytics" className="underline">Analytics</Link>
          <Link href="/admin/settings" className="underline">Settings</Link>
        </nav>
      </aside>
      <section className="col-span-12 md:col-span-9">
        {children}
      </section>
    </div>
  );
}
