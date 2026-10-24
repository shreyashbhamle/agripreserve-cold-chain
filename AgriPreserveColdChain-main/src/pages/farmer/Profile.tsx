import { useState, type FormEvent } from "react";
import { CheckCircle2, KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { agriApi } from "../../services/api";
import {
  ChartCard,
  PageHeader,
  type RoleAccent,
} from "../../components/ui/SharedComponents";

export default function Profile({
  roleOverride,
}: {
  roleOverride?: RoleAccent;
}) {
  const { user, updateUser, notify } = useAuth();
  const activeRole = (roleOverride || user?.role || "farmer") as RoleAccent;

  const [name, setName] = useState(user?.name ?? "Rajesh Farmer");
  const [phone, setPhone] = useState(user?.phone ?? "+91 98230 11220");
  const [organization, setOrganization] = useState(
    user?.organization ?? "Nashik Fresh Growers Co-op",
  );
  const [region, setRegion] = useState(
    user?.region ?? "Nashik, Maharashtra",
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await agriApi.updateProfile({
        email: user?.email,
        name,
        phone,
        organization,
        region,
        ...(newPassword
          ? { current_password: currentPassword, new_password: newPassword }
          : {}),
      });
      updateUser({
        name: String(res.user.name ?? name),
        phone: String(res.user.phone ?? phone),
        organization: String(res.user.organization ?? organization),
        region: String(res.user.region ?? region),
      });
      setCurrentPassword("");
      setNewPassword("");
      notify(
        "Profile Updated",
        "Your account details have been persisted to SQLite.",
        "success",
      );
    } catch (err) {
      updateUser({ name, phone, organization, region });
      notify(
        "Profile Saved Locally",
        err instanceof Error ? err.message : "Updated local session profile.",
        "info",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        role={activeRole}
        eyebrow="ACCOUNT & SECURITY SETTINGS"
        title="Operator Profile, Organization & Password Management"
        description="Update your contact details, cold-chain regional hub assignment, and PBKDF2-SHA256 account password."
        dataMode="SQLITE PROFILE"
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ChartCard
            title="Personal & Organization Details"
            subtitle="Changes are persisted to the backend SQLite users table"
            badge={activeRole.toUpperCase()}
          >
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3.5">
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Full Name</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Email Address (Login ID)</span>
                  <input
                    type="email"
                    disabled
                    value={user?.email ?? ""}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#9AA7BA] opacity-60"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Phone / Dispatch Contact</span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Organization / Hub</span>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>

                <label className="space-y-1 block sm:col-span-2">
                  <span className="text-[#9AA7BA]">Operating Region / Corridor</span>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
              </div>

              <div className="pt-3 border-t border-[#303846] space-y-3">
                <p className="font-semibold text-[#F1F5F9] flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-400" /> Optional
                  Password Update
                </p>
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <label className="space-y-1 block">
                    <span className="text-[#9AA7BA]">Current Password</span>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                    />
                  </label>
                  <label className="space-y-1 block">
                    <span className="text-[#9AA7BA]">New Password</span>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to keep existing"
                      className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 font-bold text-slate-950 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                {busy ? "Saving..." : "Save Profile & Security Settings"}
              </button>
            </form>
          </ChartCard>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-5 space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <UserRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F1F5F9]">{name}</h3>
                <p className="text-[#9AA7BA]">
                  {user?.email} ·{" "}
                  <span className="uppercase text-emerald-400 font-semibold">
                    {activeRole}
                  </span>
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-[#303846] space-y-1.5 text-[#9AA7BA]">
              <p>
                <strong className="text-[#F1F5F9]">Organization:</strong>{" "}
                {organization}
              </p>
              <p>
                <strong className="text-[#F1F5F9]">Region:</strong> {region}
              </p>
              <p className="flex items-center gap-1.5 text-emerald-400 pt-1">
                <ShieldCheck className="w-4 h-4" /> Authenticated PBKDF2-SHA256
                Role Session
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}