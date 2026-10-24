import { useEffect, useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import {
  agriApi,
  downloadCsv,
  type AlertRecord,
  type ShipmentRecord,
  type StorageFacilityRecord,
} from "../../services/api";
import { PageHeader, StatusBadge } from "../../components/ui/SharedComponents";
import { useAuth } from "../../context/AuthContext";

export default function Reports() {
  const { notify } = useAuth();
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [facilities, setFacilities] = useState<StorageFacilityRecord[]>([]);
  const [dateRange, setDateRange] = useState("last_7_days");

  useEffect(() => {
    agriApi.shipments().then(setShipments).catch(() => {});
    agriApi.alerts().then(setAlerts).catch(() => {});
    agriApi.storage().then(setFacilities).catch(() => {});
  }, []);

  const exportReport = (
    name: string,
    rows: Array<Record<string, unknown>>,
  ) => {
    downloadCsv(name, rows);
    notify("Report Downloaded", `Generated ${name} (${rows.length} rows).`, "success");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        role="admin"
        eyebrow="COMPLIANCE & AUDIT EXPORTS"
        title="Cold-Chain Operational & Compliance Reports"
        description="Generate and download audit-ready CSV reports for shipments, thermal excursions, cold-storage utilization, and quality compliance."
        actions={
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-xs text-[#F1F5F9]"
            aria-label="Select report period"
          >
            <option value="today">Today (19 Apr 2026)</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
          </select>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-5 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F1F5F9]">
              Fleet Shipment &amp; Thermal Compliance Ledger
            </h3>
            <p className="text-xs text-[#9AA7BA]">
              Includes all {shipments.length} shipments, origin/destination,
              latest reefer temperature, humidity, and composite risk score.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              exportReport(
                `shipments_compliance_${dateRange}.csv`,
                shipments as unknown as Array<Record<string, unknown>>,
              )
            }
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition"
          >
            <Download className="w-3.5 h-3.5" /> Download Shipment CSV
          </button>
        </div>

        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-5 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F1F5F9]">
              Cold-Chain Excursion &amp; Alert SLA Log
            </h3>
            <p className="text-xs text-[#9AA7BA]">
              Complete log of {alerts.length} critical/warning alerts, root-cause
              types, acknowledgement status, and timestamps.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              exportReport(
                `coldchain_alerts_${dateRange}.csv`,
                alerts as unknown as Array<Record<string, unknown>>,
              )
            }
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#303846] bg-[#1D2330] hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-[#F1F5F9] transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" /> Download Alert
            Log CSV
          </button>
        </div>

        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-5 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F1F5F9]">
              Cold-Storage Hub Occupancy &amp; Energy Audit
            </h3>
            <p className="text-xs text-[#9AA7BA]">
              Chamber temperature, relative humidity, and capacity utilization
              across {facilities.length} regional storage facilities.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              exportReport(
                `storage_facilities_${dateRange}.csv`,
                facilities as unknown as Array<Record<string, unknown>>,
              )
            }
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#303846] bg-[#1D2330] hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-[#F1F5F9] transition"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" /> Download Storage
            CSV
          </button>
        </div>
      </div>

      {/* Preview Table */}
      <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-5 space-y-3">
        <h3 className="text-sm font-bold text-[#F1F5F9]">
          Live Report Preview: Shipment Thermal Compliance Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#303846] text-[#9AA7BA]">
                <th className="py-2.5 px-3">Shipment</th>
                <th className="py-2.5 px-3">Crop</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Corridor</th>
                <th className="py-2.5 px-3">Temp / RH</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#303846]/60">
              {shipments.map((s) => (
                <tr key={s.id}>
                  <td className="py-2.5 px-3 font-bold text-[#F1F5F9]">
                    {s.id}
                  </td>
                  <td className="py-2.5 px-3 text-[#F1F5F9]">{s.product}</td>
                  <td className="py-2.5 px-3 text-[#9AA7BA]">
                    {s.quantity_kg} kg
                  </td>
                  <td className="py-2.5 px-3 text-[#9AA7BA]">
                    {s.origin} → {s.destination}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#F1F5F9]">
                    {s.temperature_c ?? "--"}°C / {s.humidity_pct ?? "--"}%
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}