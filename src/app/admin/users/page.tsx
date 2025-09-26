"use client";
import { useEffect, useState } from "react";

interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  role: "USER" | "ADMIN";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"USER" | "ADMIN">("USER");
  const [newPassword, setNewPassword] = useState("");

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load users");
      setUsers(data.users || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function onRoleChange(userId: string, role: "USER" | "ADMIN") {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user");
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <div className="space-y-2 p-4 border rounded-lg">
        <h2 className="font-semibold">Add User</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input className="px-3 py-2 border rounded-md" placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <input className="px-3 py-2 border rounded-md" placeholder="Name (optional)" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <select className="px-3 py-2 border rounded-md" value={newRole} onChange={(e) => setNewRole(e.target.value as any)}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <input className="px-3 py-2 border rounded-md" placeholder="Password (min 8, optional)" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <div>
          <button className="btn-accent px-4 py-2 rounded-md font-semibold" onClick={async () => {
            setError(null);
            try {
              const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: newEmail, name: newName, role: newRole, password: newPassword || undefined }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Failed to create user");
              setNewEmail(""); setNewName(""); setNewRole("USER"); setNewPassword("");
              await fetchUsers();
            } catch (e: any) {
              setError(e.message);
            }
          }}>Create User</button>
        </div>
      </div>
      {loading && <p>Loading users…</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!loading && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-[var(--secondary)] text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{u.name || "—"}</td>
                  <td className="p-3">{u.email || "—"}</td>
                  <td className="p-3">
                    <select
                      className="border rounded-md px-2 py-1"
                      value={u.role}
                      onChange={(e) => onRoleChange(u.id, e.target.value as any)}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <button className="underline text-red-600" onClick={async () => {
                      if (!confirm("Delete this user? This cannot be undone.")) return;
                      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(u.id)}`, { method: "DELETE" });
                      const data = await res.json();
                      if (!res.ok) { alert(data.error || "Failed to delete user"); return; }
                      await fetchUsers();
                    }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
