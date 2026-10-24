import { useEffect, useState, type FormEvent } from "react";
import { Boxes, History, PlusCircle } from "lucide-react";
import {
  agriApi,
  downloadCsv,
  type InventoryItemRecord,
} from "../../services/api";
import {
  ChartCard,
  ExportButton,
  FilterToolbar,
  PageHeader,
  StatusBadge,
} from "../../components/ui/SharedComponents";
import { useAuth } from "../../context/AuthContext";

export default function Inventory({
  ownerRole = "",
}: {
  ownerRole?: "" | "farmer" | "receiver";
}) {
  const { user, notify } = useAuth();
  const [items, setItems] = useState<InventoryItemRecord[]>([]);
  const [movements, setMovements] = useState<Array<Record<string, any>>>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [adjustItem, setAdjustItem] = useState<InventoryItemRecord | null>(
    null,
  );
  const [deltaKg, setDeltaKg] = useState(100);
  const [movementType, setMovementType] = useState("Inbound Replenishment");
  const [reason, setReason] = useState("Scheduled cold-room batch update");

  const loadInventory = () => {
    agriApi
      .inventory(ownerRole, statusFilter, search)
      .then((res) => {
        setItems(res.items ?? []);
        setMovements(res.movements ?? []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerRole, statusFilter, search]);

  const handleAdjust = async (e: FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;
    try {
      await agriApi.adjustInventory(adjustItem.id, {
        delta_kg: deltaKg,
        movement_type: movementType,
        reason,
        actor_name: user?.name ?? "Operator",
        actor_role: user?.role ?? "admin",
      });
      notify(
        "Stock Adjusted",
        `Updated ${adjustItem.product} (${adjustItem.batch_code}) by ${deltaKg > 0 ? `+${deltaKg}` : deltaKg} kg.`,
        "success",
      );
      setAdjustItem(null);
      loadInventory();
    } catch (err) {
      notify(
        "Adjustment failed",
        err instanceof Error ? err.message : "Error",
        "error",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        role={(ownerRole || "admin") as "admin" | "farmer" | "receiver"}
        eyebrow="COLD-ROOM STOCK & FEFO LEDGER"
        title="Perishable Inventory & Stock Movement Control"
        description="Track cold-room batches by harvest/expiry date, monitor chamber temperature & humidity, and record stock adjustments with full movement audit logs."
        actions={
          <ExportButton
            label="Export Inventory CSV"
            onClick={() =>
              downloadCsv(
                "agripreserve_inventory.csv",
                items as unknown as Array<Record<string, unknown>>,
              )
            }
          />
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4">
          <p className="text-xs text-[#9AA7BA]">Tracked Batches</p>
          <p className="mt-1 text-2xl font-bold text-[#F1F5F9]">
            {items.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4">
          <p className="text-xs text-[#9AA7BA]">Total Cold Stock</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {items
              .reduce((acc, i) => acc + Number(i.quantity_kg || 0), 0)
              .toLocaleString()}{" "}
            kg
          </p>
        </div>
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4">
          <p className="text-xs text-[#9AA7BA]">Expiring Soon Batches</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">
            {
              items.filter((i) =>
                i.status.toLowerCase().includes("expiring"),
              ).length
            }
          </p>
        </div>
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4">
          <p className="text-xs text-[#9AA7BA]">Logged Stock Movements</p>
          <p className="mt-1 text-2xl font-bold text-sky-400">
            {movements.length}
          </p>
        </div>
      </div>

      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by product, batch code, or storage zone..."
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-xs text-[#F1F5F9]"
            aria-label="Filter inventory status"
          >
            <option value="">All Statuses</option>
            <option value="Fresh">Fresh</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Low Stock">Low Stock</option>
          </select>
        }
      />

      {/* Inventory Table */}
      <div className="rounded-2xl border border-[#303846] bg-[#171B24] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#303846] bg-[#11151D] text-[#9AA7BA]">
                <th className="py-3.5 px-4">Batch &amp; Product</th>
                <th className="py-3.5 px-4">Owner / Role</th>
                <th className="py-3.5 px-4">Quantity / Reorder</th>
                <th className="py-3.5 px-4">Storage Zone &amp; Telemetry</th>
                <th className="py-3.5 px-4">Received / Expiry</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#303846]/60">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-[#1D2330]/60 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#F1F5F9]">{item.product}</p>
                    <p className="text-[11px] font-mono text-[#9AA7BA]">
                      {item.batch_code} · {item.quality_grade}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-[#F1F5F9]">{item.owner_name}</p>
                    <p className="text-[10px] uppercase text-emerald-400">
                      {item.owner_role}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#F1F5F9]">
                      {Number(item.quantity_kg).toLocaleString()} kg
                    </p>
                    <p className="text-[11px] text-[#9AA7BA]">
                      Min: {item.reorder_level_kg} kg
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-[#F1F5F9]">{item.storage_zone}</p>
                    <p className="font-mono text-[11px] text-sky-300">
                      {item.temperature_c}°C · {item.humidity_pct}% RH
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-[#9AA7BA]">
                    <p>In: {item.received_date}</p>
                    <p className="text-amber-300">Exp: {item.expiry_date}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setAdjustItem(item);
                        setDeltaKg(100);
                      }}
                      className="inline-flex items-center gap-1 rounded-xl border border-[#303846] bg-[#1D2330] hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-emerald-300"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Movement History */}
      <ChartCard
        title="Stock Movement & Adjustment Audit Trail"
        subtitle="Chronological log of inbound, outbound, and spoilage adjustments"
        badge="AUDIT TRAIL"
      >
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
          {movements.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-[#303846] bg-[#11151D] p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-sky-400" />
                <div>
                  <p className="font-semibold text-[#F1F5F9]">
                    {m.product} · {m.movement_type} (
                    {Number(m.delta_kg) > 0 ? `+${m.delta_kg}` : m.delta_kg} kg)
                  </p>
                  <p className="text-[11px] text-[#9AA7BA]">
                    {m.reason} · By {m.actor_name}
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-[#9AA7BA]">
                {String(m.created_at).slice(0, 16)}
              </span>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Adjust Modal */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#303846] bg-[#171B24] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#303846] pb-3">
              <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-400" /> Adjust Stock:{" "}
                {adjustItem.product}
              </h3>
              <button
                type="button"
                onClick={() => setAdjustItem(null)}
                className="text-xs text-[#9AA7BA] hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAdjust} className="space-y-3 text-xs">
              <label className="space-y-1 block">
                <span className="text-[#9AA7BA]">
                  Quantity Delta in kg (use negative for dispatch/spoilage)
                </span>
                <input
                  type="number"
                  required
                  value={deltaKg}
                  onChange={(e) => setDeltaKg(Number(e.target.value))}
                  className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                />
              </label>
              <label className="space-y-1 block">
                <span className="text-[#9AA7BA]">Movement Type</span>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value)}
                  className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                >
                  <option value="Inbound Replenishment">
                    Inbound Replenishment
                  </option>
                  <option value="Outbound Dispatch">Outbound Dispatch</option>
                  <option value="FEFO Retail Allocation">
                    FEFO Retail Allocation
                  </option>
                  <option value="Spoilage Write-off">Spoilage Write-off</option>
                </select>
              </label>
              <label className="space-y-1 block">
                <span className="text-[#9AA7BA]">Audit Reason</span>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                />
              </label>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="rounded-xl border border-[#303846] bg-[#1D2330] px-4 py-2 text-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 font-bold text-slate-950"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}