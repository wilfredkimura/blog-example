export default async function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
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
    </div>
  );
}
