import { useEffect, useState, type FormEvent } from "react";
import {
  Droplets,
  Plus,
  Power,
  Snowflake,
  Thermometer,
  Warehouse,
} from "lucide-react";
import {
  agriApi,
  downloadCsv,
  type StorageFacilityRecord,
} from "../../services/api";
import {
  ChartCard,
  ExportButton,
  PageHeader,
  StatusBadge,
} from "../../components/ui/SharedComponents";
import { HorizontalBarList } from "../../components/charts/AgriCharts";
import { useAuth } from "../../context/AuthContext";

export default function ColdStorage() {
  const { notify } = useAuth();
  const [facilities, setFacilities] = useState<StorageFacilityRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    id: `CS-0${Math.floor(5 + Math.random() * 5)}`,
    name: "Satara Pre-Cooling Hub",
    location: "Satara, Maharashtra",
    temperature_c: 4.0,
    humidity_pct: 81.0,
    capacity_used_pct: 68.0,
    capacity_total_tons: 150,
    power_status: "Grid + Solar Backup",
    door_activity: "Closed",
    status: "Normal",
  });

  const loadStorage = () => {
    agriApi
      .storage()
      .then(setFacilities)
      .catch(() => {});
  };

  useEffect(() => {
    loadStorage();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await agriApi.createStorage(form);
      notify(
        "Facility Saved",
        `${form.name} persisted to cold-storage registry.`,
        "success",
      );
      setShowModal(false);
      loadStorage();
    } catch (err) {
      notify(
        "Save failed",
        err instanceof Error ? err.message : "Could not save facility",
        "error",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        role="admin"
        eyebrow="COLD-STORAGE INFRASTRUCTURE"
        title="Cold-Storage Hubs & Chamber Telemetry"
        description="Monitor chamber temperature, relative humidity, capacity utilization, backup power status, and door activity across regional cold-storage hubs."
        actions={
          <>
            <ExportButton
              label="Export Facilities CSV"
              onClick={() =>
                downloadCsv(
                  "agripreserve_storage_facilities.csv",
                  facilities as unknown as Array<Record<string, unknown>>,
                )
              }
            />
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add / Update Facility
            </button>
          </>
        }
      />

      {/* Facility Cards */}
      <div className="grid gap-5 md:grid-cols-2">
        {facilities.map((f) => {
          const capPct = Number(f.capacity_used_pct);
          return (
            <div
              key={f.id}
              className="rounded-2xl border border-[#303846] bg-[#171B24] p-5 space-y-4 shadow-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#1D2330] border border-[#303846] text-sky-400">
                    <Warehouse className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#F1F5F9]">
                      {f.name}{" "}
                      <span className="text-xs font-mono text-[#9AA7BA]">
                        ({f.id})
                      </span>
                    </h3>
                    <p className="text-xs text-[#9AA7BA]">{f.location}</p>
                  </div>
                </div>
                <StatusBadge status={f.status} />
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl bg-[#11151D] border border-[#303846] p-3">
                  <span className="text-[#9AA7BA] flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
                    Chamber Temp
                  </span>
                  <p className="mt-1 text-lg font-bold text-[#F1F5F9]">
                    {f.temperature_c}°C
                  </p>
                </div>
                <div className="rounded-xl bg-[#11151D] border border-[#303846] p-3">
                  <span className="text-[#9AA7BA] flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-sky-400" />
                    Humidity
                  </span>
                  <p className="mt-1 text-lg font-bold text-[#F1F5F9]">
                    {f.humidity_pct}%
                  </p>
                </div>
                <div className="rounded-xl bg-[#11151D] border border-[#303846] p-3">
                  <span className="text-[#9AA7BA] flex items-center gap-1">
                    <Power className="w-3.5 h-3.5 text-amber-400" />
                    Power &amp; Door
                  </span>
                  <p className="mt-1 text-xs font-semibold text-[#F1F5F9] truncate">
                    {f.power_status ?? "Grid Primary"}
                  </p>
                  <p className="text-[10px] text-[#9AA7BA]">
                    Door: {f.door_activity ?? "Closed"}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9AA7BA]">Capacity Utilization</span>
                  <strong
                    className={
                      capPct > 85 ? "text-rose-400" : "text-emerald-400"
                    }
                  >
                    {capPct}% ({f.capacity_total_tons ?? 150} Tons Cap)
                  </strong>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[#11151D] border border-[#303846] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, capPct)}%`,
                      backgroundColor:
                        capPct > 85
                          ? "#F87171"
                          : capPct > 75
                            ? "#F59E0B"
                            : "#10B981",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ChartCard
        title="Comparative Cold-Storage Occupancy & Thermal Profile"
        subtitle="Percentage of cold-room capacity occupied across Maharashtra hubs"
        badge="STORAGE UTILIZATION"
      >
        <HorizontalBarList
          items={facilities.map((f) => ({
            label: `${f.name} (${f.location})`,
            value: Number(f.capacity_used_pct),
            secondary: `${f.temperature_c}°C · ${f.humidity_pct}% RH`,
          }))}
          unit="%"
        />
      </ChartCard>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#303846] bg-[#171B24] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#303846] pb-3">
              <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-sky-400" /> Add / Update Cold
                Storage Hub
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
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Facility ID</span>
                  <input
                    type="text"
                    required
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Location</span>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
                <label className="space-y-1 block col-span-2">
                  <span className="text-[#9AA7BA]">Facility Name</span>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Temp (°C)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={form.temperature_c}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        temperature_c: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Humidity (%)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={form.humidity_pct}
                    onChange={(e) =>
                      setForm({ ...form, humidity_pct: Number(e.target.value) })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Capacity Used (%)</span>
                  <input
                    type="number"
                    value={form.capacity_used_pct}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        capacity_used_pct: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Status</span>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Near Full">Near Full</option>
                    <option value="Alert">Alert</option>
                  </select>
                </label>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-[#303846] bg-[#1D2330] px-4 py-2 text-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 font-bold text-slate-950"
                >
                  Save Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}