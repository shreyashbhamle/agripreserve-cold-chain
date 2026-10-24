import { useEffect, useState, type FormEvent } from "react";
import {
  Clock,
  Eye,
  MapPin,
  Plus,
  Thermometer,
  Truck,
} from "lucide-react";
import {
  agriApi,
  downloadCsv,
  type ShipmentRecord,
} from "../../services/api";
import {
  ExportButton,
  FilterToolbar,
  PageHeader,
  StatusBadge,
} from "../../components/ui/SharedComponents";
import { useAuth } from "../../context/AuthContext";

const STATUS_OPTIONS = [
  "Created",
  "Assigned",
  "Picked Up",
  "In Transit",
  "At Risk",
  "Delayed",
  "Delivered",
  "Completed",
  "Cancelled",
];

export default function Shipments() {
  const { user, notify } = useAuth();
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<Record<string, any> | null>(
    null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newShipment, setNewShipment] = useState({
    id: `AP${Math.floor(1031 + Math.random() * 60)}`,
    product: "Tomatoes",
    quantity_kg: 1400,
    origin: "Nashik",
    destination: "Pune Cold Hub",
    status: "In Transit",
    eta: "2026-04-20 14:30",
    farmer: "Rajesh Patil",
    driver: "Amit Shinde",
    receiver: "FreshMart Receiver",
    vehicle_number: "MH-15-CR-4021",
    temperature_c: 4.5,
    humidity_pct: 79,
  });

  const loadShipments = () => {
    agriApi
      .shipments(search, statusFilter)
      .then((list) => setShipments(list))
      .catch(() => {});
  };

  useEffect(() => {
    loadShipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const openDetails = async (id: string) => {
    try {
      const detail = await agriApi.shipment(id);
      setSelectedDetail(detail);
    } catch {
      const fallback = shipments.find((s) => s.id === id);
      if (fallback) {
        setSelectedDetail({
          ...fallback,
          readings: [],
          alerts: [],
          incidents: [],
          events: [],
        });
      }
    }
  };

  const handleStatusUpdate = async (id: string, nextStatus: string) => {
    try {
      await agriApi.updateShipmentStatus(id, {
        status: nextStatus,
        location: "Corridor Checkpoint",
        notes: `Updated by ${user?.name ?? "Admin"} via Shipment Operations`,
        actor_name: user?.name ?? "Admin",
        actor_role: user?.role ?? "admin",
      });
      notify(
        `Shipment ${id} Updated`,
        `Status transitioned to ${nextStatus}.`,
        "success",
      );
      loadShipments();
      if (selectedDetail?.id === id) {
        openDetails(id);
      }
    } catch (err) {
      notify(
        "Status update failed",
        err instanceof Error ? err.message : "Could not update status",
        "error",
      );
    }
  };

  const handleCreateShipment = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await agriApi.createShipment(newShipment);
      notify(
        `Shipment ${newShipment.id} Dispatched`,
        `${newShipment.product} (${newShipment.quantity_kg} kg) created with initial sensor telemetry.`,
        "success",
      );
      setShowCreateModal(false);
      loadShipments();
    } catch (err) {
      notify(
        "Creation failed",
        err instanceof Error ? err.message : "Could not create shipment",
        "error",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        role="admin"
        eyebrow="FLEET & DISPATCH OPERATIONS"
        title="Cold-Chain Shipments & Lifecycle Control"
        description="Inspect active reefer shipments, audit 12-point sensor histories, transition shipment milestones, and dispatch new cold-chain loads."
        actions={
          <>
            <ExportButton
              label="Export Shipments CSV"
              onClick={() =>
                downloadCsv(
                  "agripreserve_shipments.csv",
                  shipments as unknown as Array<Record<string, unknown>>,
                )
              }
            />
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Create Shipment
            </button>
          </>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4">
          <p className="text-xs text-[#9AA7BA]">Total Tracked Shipments</p>
          <p className="mt-1 text-2xl font-bold text-[#F1F5F9]">
            {shipments.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4">
          <p className="text-xs text-[#9AA7BA]">In Transit</p>
          <p className="mt-1 text-2xl font-bold text-sky-400">
            {shipments.filter((s) => s.status === "In Transit").length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4">
          <p className="text-xs text-[#9AA7BA]">At Risk / Delayed</p>
          <p className="mt-1 text-2xl font-bold text-rose-400">
            {
              shipments.filter(
                (s) => s.status === "At Risk" || s.status === "Delayed",
              ).length
            }
          </p>
        </div>
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4">
          <p className="text-xs text-[#9AA7BA]">Total Active Cargo Load</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {shipments
              .reduce((acc, s) => acc + Number(s.quantity_kg || 0), 0)
              .toLocaleString()}{" "}
            kg
          </p>
        </div>
      </div>

      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by shipment ID (AP1024), crop, origin, farmer, or driver..."
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-xs text-[#F1F5F9]"
            aria-label="Filter by shipment status"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        }
      />

      {/* Shipments Table */}
      <div className="rounded-2xl border border-[#303846] bg-[#171B24] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#303846] bg-[#11151D] text-[#9AA7BA]">
                <th className="py-3.5 px-4">Shipment ID</th>
                <th className="py-3.5 px-4">Produce &amp; Load</th>
                <th className="py-3.5 px-4">Corridor Route</th>
                <th className="py-3.5 px-4">Farmer &amp; Driver</th>
                <th className="py-3.5 px-4">Latest Telemetry</th>
                <th className="py-3.5 px-4">Risk Score</th>
                <th className="py-3.5 px-4">Status &amp; Transition</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#303846]/60">
              {shipments.map((s) => (
                <tr key={s.id} className="hover:bg-[#1D2330]/60 transition">
                  <td className="py-3.5 px-4 font-bold text-[#F1F5F9]">
                    {s.id}
                    <span className="block text-[10px] font-normal text-[#9AA7BA]">
                      ETA: {s.eta}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-[#F1F5F9]">{s.product}</p>
                    <p className="text-[#9AA7BA]">
                      {Number(s.quantity_kg).toLocaleString()} kg
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-[#F1F5F9] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      {s.origin} → {s.destination}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-[#F1F5F9]">Farmer: {s.farmer}</p>
                    <p className="text-[#9AA7BA]">Driver: {s.driver}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span
                      className={
                        Number(s.temperature_c ?? 4) > 8
                          ? "text-rose-400 font-bold"
                          : "text-emerald-400 font-semibold"
                      }
                    >
                      {s.temperature_c ?? "--"}°C
                    </span>{" "}
                    · {s.humidity_pct ?? "--"}% RH
                  </td>
                  <td className="py-3.5 px-4">
                    {s.risk ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#F1F5F9]">
                          {s.risk.risk_score}
                        </span>
                        <StatusBadge status={s.risk.risk_level} />
                      </div>
                    ) : (
                      <StatusBadge status={s.status} />
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={s.status}
                      onChange={(e) => handleStatusUpdate(s.id, e.target.value)}
                      className="rounded-lg bg-[#11151D] border border-[#303846] px-2.5 py-1 text-xs text-[#F1F5F9]"
                      aria-label={`Change status for ${s.id}`}
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => openDetails(s.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-[#303846] bg-[#1D2330] hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-emerald-300"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipment Details Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl border border-[#303846] bg-[#171B24] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#303846] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-400" />
                  Shipment {selectedDetail.id} · {selectedDetail.product} (
                  {selectedDetail.quantity_kg} kg)
                </h3>
                <p className="text-xs text-[#9AA7BA]">
                  {selectedDetail.origin} → {selectedDetail.destination} ·
                  Driver: {selectedDetail.driver}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="rounded-lg bg-[#1D2330] px-2.5 py-1 text-xs text-[#9AA7BA] hover:text-white"
              >
                Close ✕
              </button>
            </div>

            {selectedDetail.risk && (
              <div className="rounded-xl border border-[#303846] bg-[#11151D] p-4 grid sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[#9AA7BA] block">Composite Risk</span>
                  <strong className="text-base text-[#F1F5F9]">
                    {selectedDetail.risk.risk_score} / 100 (
                    {selectedDetail.risk.risk_level})
                  </strong>
                </div>
                <div>
                  <span className="text-[#9AA7BA] block">
                    Spoilage Probability
                  </span>
                  <strong className="text-base text-amber-300">
                    {selectedDetail.risk.spoilage_probability_pct}%
                  </strong>
                </div>
                <div>
                  <span className="text-[#9AA7BA] block">Primary Driver</span>
                  <strong className="text-[#F1F5F9]">
                    {selectedDetail.risk.primary_driver}
                  </strong>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5" /> Recent Sensor Readings
                </h4>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {((selectedDetail.readings as Array<Record<string, any>>) ?? [])
                    .slice(0, 8)
                    .map((r, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-[#11151D] border border-[#303846] px-3 py-2 text-xs flex items-center justify-between"
                      >
                        <span className="font-mono text-[#F1F5F9]">
                          {r.temperature_c}°C · {r.humidity_pct}% RH · Door:{" "}
                          {r.door_status}
                        </span>
                        <span className="text-[11px] text-[#9AA7BA]">
                          {String(r.recorded_at).slice(11, 16)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Lifecycle Audit Trail
                </h4>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {((selectedDetail.events as Array<Record<string, any>>) ?? [])
                    .map((ev, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-[#11151D] border border-[#303846] px-3 py-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-[#F1F5F9]">
                            {ev.status}
                          </strong>
                          <span className="text-[10px] text-[#9AA7BA]">
                            {String(ev.created_at).slice(0, 16)}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#9AA7BA] mt-0.5">
                          {ev.notes} ({ev.actor_name})
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Shipment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#303846] bg-[#171B24] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#303846] pb-3">
              <h3 className="text-base font-bold text-[#F1F5F9]">
                Dispatch New Cold-Chain Shipment
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-xs text-[#9AA7BA] hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateShipment} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Shipment ID</span>
                  <input
                    type="text"
                    required
                    value={newShipment.id}
                    onChange={(e) =>
                      setNewShipment({ ...newShipment, id: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Produce Crop</span>
                  <select
                    value={newShipment.product}
                    onChange={(e) =>
                      setNewShipment({
                        ...newShipment,
                        product: e.target.value,
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  >
                    {[
                      "Tomatoes",
                      "Bananas",
                      "Onions",
                      "Grapes",
                      "Okra",
                      "Potatoes",
                      "Strawberries",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Quantity (kg)</span>
                  <input
                    type="number"
                    required
                    value={newShipment.quantity_kg}
                    onChange={(e) =>
                      setNewShipment({
                        ...newShipment,
                        quantity_kg: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Initial Temp (°C)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={newShipment.temperature_c}
                    onChange={(e) =>
                      setNewShipment({
                        ...newShipment,
                        temperature_c: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Origin</span>
                  <input
                    type="text"
                    required
                    value={newShipment.origin}
                    onChange={(e) =>
                      setNewShipment({ ...newShipment, origin: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Destination</span>
                  <input
                    type="text"
                    required
                    value={newShipment.destination}
                    onChange={(e) =>
                      setNewShipment({
                        ...newShipment,
                        destination: e.target.value,
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Farmer</span>
                  <input
                    type="text"
                    value={newShipment.farmer}
                    onChange={(e) =>
                      setNewShipment({ ...newShipment, farmer: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Driver</span>
                  <input
                    type="text"
                    value={newShipment.driver}
                    onChange={(e) =>
                      setNewShipment({ ...newShipment, driver: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-[#303846] bg-[#1D2330] px-4 py-2 text-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 font-bold text-slate-950"
                >
                  Dispatch Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}