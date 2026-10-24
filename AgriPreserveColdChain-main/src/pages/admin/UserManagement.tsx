import { useEffect, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Edit3,
  Plus,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
} from "lucide-react";
import { agriApi, downloadCsv } from "../../services/api";
import {
  ExportButton,
  FilterToolbar,
  PageHeader,
  StatusBadge,
} from "../../components/ui/SharedComponents";
import { useAuth } from "../../context/AuthContext";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  organization: string;
  region: string;
  status: string;
  last_login_at?: string;
  created_at?: string;
}

export default function UserManagement() {
  const { notify } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "ChangeMe123!",
    role: "farmer",
    phone: "+91 98200 11223",
    organization: "Nashik Fresh Growers",
    region: "Nashik, Maharashtra",
    status: "Active",
  });

  const loadUsers = () => {
    agriApi
      .users({ role: roleFilter, status: statusFilter, q: search })
      .then((list) => setUsers(list as unknown as UserRecord[]))
      .catch(() => {});
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter, search]);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "ChangeMe123!",
      role: "farmer",
      phone: "+91 98200 11223",
      organization: "Nashik Fresh Growers",
      region: "Nashik, Maharashtra",
      status: "Active",
    });
    setShowModal(true);
  };

  const openEditModal = (u: UserRecord) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      phone: u.phone || "",
      organization: u.organization || "",
      region: u.region || "",
      status: u.status || "Active",
    });
    setShowModal(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await agriApi.updateUser(editingUser.id, {
          name: formData.name,
          role: formData.role,
          phone: formData.phone,
          organization: formData.organization,
          region: formData.region,
          status: formData.status,
          ...(formData.password ? { password: formData.password } : {}),
        });
        notify("User updated", `${formData.name} saved to SQLite.`, "success");
      } else {
        await agriApi.createUser(formData);
        notify(
          "User created",
          `${formData.name} (${formData.role}) added with PBKDF2 password hash.`,
          "success",
        );
      }
      setShowModal(false);
      loadUsers();
    } catch (err) {
      notify(
        "Operation failed",
        err instanceof Error ? err.message : "Could not save user",
        "error",
      );
    }
  };

  const toggleStatus = async (u: UserRecord) => {
    const nextStatus = u.status === "Active" ? "Inactive" : "Active";
    try {
      await agriApi.updateUser(u.id, { status: nextStatus });
      notify(
        `User ${nextStatus}`,
        `${u.name} is now ${nextStatus}.`,
        "info",
      );
      loadUsers();
    } catch (err) {
      notify(
        "Error updating status",
        err instanceof Error ? err.message : "Failed",
        "error",
      );
    }
  };

  const handleDelete = async (u: UserRecord) => {
    try {
      await agriApi.deleteUser(u.id);
      notify("User removed", `${u.email} deleted from directory.`, "warning");
      loadUsers();
    } catch (err) {
      notify(
        "Delete blocked",
        err instanceof Error ? err.message : "Cannot delete demo account",
        "error",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        role="admin"
        eyebrow="IDENTITY & ACCESS GOVERNANCE"
        title="Platform User & Role Management"
        description="Manage farmers, cold-chain transport drivers, receiving businesses, and platform administrators with PBKDF2-SHA256 hashed credentials."
        dataMode="SQLITE PERSISTED"
        actions={
          <>
            <ExportButton
              label="Export Users CSV"
              onClick={() =>
                downloadCsv(
                  "agripreserve_users.csv",
                  users as unknown as Array<Record<string, unknown>>,
                )
              }
            />
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Platform User
            </button>
          </>
        }
      />

      {/* Role Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        {(["admin", "farmer", "driver", "receiver"] as const).map((r) => {
          const count = users.filter((u) => u.role === r).length;
          return (
            <div
              key={r}
              className="rounded-2xl border border-[#303846] bg-[#171B24] p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-[#9AA7BA]">
                  {r} Accounts
                </p>
                <p className="mt-1 text-2xl font-bold text-[#F1F5F9]">
                  {count}
                </p>
              </div>
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
          );
        })}
      </div>

      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, or organization..."
        filters={
          <>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-xs text-[#F1F5F9]"
              aria-label="Filter by role"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="farmer">Farmer</option>
              <option value="driver">Driver</option>
              <option value="receiver">Receiver</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-xs text-[#F1F5F9]"
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </>
        }
      />

      {/* Users Table */}
      <div className="rounded-2xl border border-[#303846] bg-[#171B24] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#303846] bg-[#11151D] text-[#9AA7BA]">
                <th className="py-3.5 px-4">User &amp; Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Organization &amp; Region</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Login</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#303846]/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#1D2330]/60 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#F1F5F9]">{u.name}</p>
                    <p className="text-[#9AA7BA]">{u.email}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="uppercase font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2.5 py-0.5 text-[11px]">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-[#F1F5F9] font-medium">
                      {u.organization || "AgriPreserve Partner"}
                    </p>
                    <p className="text-[#9AA7BA]">{u.region || "Maharashtra"}</p>
                  </td>
                  <td className="py-3.5 px-4 text-[#9AA7BA]">
                    {u.phone || "—"}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={u.status || "Active"} />
                  </td>
                  <td className="py-3.5 px-4 text-[#9AA7BA]">
                    {u.last_login_at
                      ? new Date(u.last_login_at).toLocaleString()
                      : "Seeded Account"}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(u)}
                        className="rounded-lg border border-[#303846] bg-[#1D2330] hover:bg-slate-700 p-1.5 text-sky-300"
                        title="Edit user"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStatus(u)}
                        className="rounded-lg border border-[#303846] bg-[#1D2330] hover:bg-slate-700 p-1.5 text-amber-300"
                        title={
                          u.status === "Active"
                            ? "Deactivate user"
                            : "Activate user"
                        }
                      >
                        {u.status === "Active" ? (
                          <UserX className="w-3.5 h-3.5" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(u)}
                        className="rounded-lg border border-[#303846] bg-[#1D2330] hover:bg-rose-950/50 p-1.5 text-rose-400"
                        title="Delete user"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#303846] bg-[#171B24] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#303846] pb-3">
              <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                {editingUser ? `Edit ${editingUser.name}` : "Add Platform User"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-xs text-[#9AA7BA] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Full Name</span>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Email Address</span>
                  <input
                    type="email"
                    required
                    disabled={Boolean(editingUser)}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9] disabled:opacity-50"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Role</span>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  >
                    <option value="admin">Admin</option>
                    <option value="farmer">Farmer</option>
                    <option value="driver">Driver</option>
                    <option value="receiver">Receiver</option>
                  </select>
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Status</span>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Organization</span>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) =>
                      setFormData({ ...formData, organization: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Region</span>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) =>
                      setFormData({ ...formData, region: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Phone</span>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">
                    {editingUser ? "New Password (optional)" : "Password"}
                  </span>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-[#303846] bg-[#1D2330] px-4 py-2 text-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 font-bold text-slate-950"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}