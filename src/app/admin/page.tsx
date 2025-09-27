import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role || "USER";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-foreground/70">Signed in as: {session?.user?.email || session?.user?.name} • Role: <span className="font-semibold">{role}</span></div>
      </div>

      {role !== "ADMIN" ? (
        <div className="p-4 border rounded-md bg-yellow-50 text-yellow-900">
          <p className="font-semibold">Limited access</p>
          <p className="text-sm">You are signed in but not an ADMIN. Ask an administrator to add your email to <code>ADMIN_EMAILS</code> or promote your role.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg section-secondary">
            <h3 className="font-semibold">Blog Management</h3>
            <p className="text-sm text-foreground/70">Create, edit, publish posts</p>
          </div>
          <div className="p-4 rounded-lg section-secondary">
            <h3 className="font-semibold">Users</h3>
            <p className="text-sm text-foreground/70">Manage roles and access</p>
          </div>
          <div className="p-4 rounded-lg section-secondary">
            <h3 className="font-semibold">Subscriptions</h3>
            <p className="text-sm text-foreground/70">Newsletter subscribers</p>
          </div>
          <div className="p-4 rounded-lg section-secondary">
            <h3 className="font-semibold">Comments</h3>
            <p className="text-sm text-foreground/70">Moderation queue</p>
          </div>
          <div className="p-4 rounded-lg section-secondary">
            <h3 className="font-semibold">Analytics</h3>
            <p className="text-sm text-foreground/70">Traffic and popular posts</p>
          </div>
          <div className="p-4 rounded-lg section-secondary">
            <h3 className="font-semibold">Settings</h3>
            <p className="text-sm text-foreground/70">Categories, tags, Kiswahili</p>
          </div>
        </div>
      )}
    </div>
  );
}
