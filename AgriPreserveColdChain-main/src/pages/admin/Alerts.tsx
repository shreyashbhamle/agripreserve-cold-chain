import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  ShieldAlert,
} from "lucide-react";
import {
  agriApi,
  downloadCsv,
  type AlertRecord,
  type IncidentRecord,
} from "../../services/api";
import {
  ChartCard,
  ExportButton,
  FilterToolbar,
  PageHeader,
  StatusBadge,
} from "../../components/ui/SharedComponents";
import { useAuth } from "../../context/AuthContext";

export default function Alerts() {
  const { user, notify } = useAuth();
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadData = () => {
    agriApi
      .alerts(severityFilter, statusFilter)
      .then(setAlerts)
      .catch(() => {});
    agriApi
      .incidents()
      .then(setIncidents)
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [severityFilter, statusFilter]);

  const handleAlertAction = async (
    alertId: number,
    nextStatus: "Acknowledged" | "Resolved",
  ) => {
    try {
      await agriApi.updateAlertStatus(alertId, {
        status: nextStatus,
        actor: user?.name ?? "Admin",
        resolution_note: `${nextStatus} via Admin Alert Console`,
      });
      notify(
        `Alert #${alertId} ${nextStatus}`,
        `Alert state updated to ${nextStatus} in SQLite.`,
        "success",
      );
      loadData();
    } catch (err) {
      notify(
        "Update failed",
        err instanceof Error ? err.message : "Could not update alert",
        "error",
      );
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.shipment_id.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q) ||
      a.message.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        role="admin"
        eyebrow="EXCEPTION & INCIDENT SLA MANAGEMENT"
        title="Cold-Chain Alerts & Incident Resolution Center"
        description="Triage critical thermal excursions, cargo door events, and route delays. Acknowledge and resolve alerts with persisted operator audit logs."
        actions={
          <ExportButton
            label="Export Alerts CSV"
            onClick={() =>
              downloadCsv(
                "agripreserve_alerts.csv",
                filteredAlerts as unknown as Array<Record<string, unknown>>,
              )
            }
          />
        }
      />

      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by shipment ID (AP1025), alert type, or message..."
        filters={
          <>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-xs text-[#F1F5F9]"
              aria-label="Filter by severity"
            >
              <option value="">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="Warning">Warning</option>
              <option value="Info">Info</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-xs text-[#F1F5F9]"
              aria-label="Filter by alert status"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Resolved">Resolved</option>
            </select>
          </>
        }
      />

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl border border-[#303846] bg-[#171B24] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={a.severity} />
                <StatusBadge status={a.status} />
                <span className="text-xs font-bold text-[#F1F5F9]">
                  Shipment {a.shipment_id} · {a.type}
                </span>
                <span className="text-[11px] text-[#9AA7BA] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {a.created_at}
                </span>
              </div>
              <p className="text-xs md:text-sm text-[#F1F5F9] pt-1">
                {a.message}
              </p>
              <p className="text-[11px] text-[#9AA7BA]">
                Recommended SOP Action:{" "}
                {a.type === "Temperature"
                  ? "Verify reefer evaporator fan & seal cargo door per temperature_excursion_sop.md"
                  : a.type === "Delay"
                    ? "Assign priority unloading dock at destination per shipment_delay_sop.md"
                    : "Monitor next 3 telemetry heartbeats"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {a.status === "Open" && (
                <button
                  type="button"
                  onClick={() => handleAlertAction(a.id, "Acknowledged")}
                  className="rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 px-3 py-1.5 text-xs font-semibold text-amber-200 transition"
                >
                  Acknowledge
                </button>
              )}
              {a.status !== "Resolved" && (
                <button
                  type="button"
                  onClick={() => handleAlertAction(a.id, "Resolved")}
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 text-xs font-bold text-slate-950 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Resolve Alert
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Logged Operational Incidents */}
      <ChartCard
        title="Logged Field & Agent Incidents"
        subtitle="Incidents reported by drivers or confirmed through the AI Agent workflow"
        badge={`${incidents.length} INCIDENTS`}
      >
        <div className="space-y-2.5">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className="rounded-xl border border-[#303846] bg-[#11151D] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <strong className="text-[#F1F5F9]">
                    {inc.shipment_id} · {inc.title}
                  </strong>
                  <StatusBadge status={inc.status} />
                </div>
                <p className="text-[#9AA7BA] mt-1">{inc.notes}</p>
              </div>
              <span className="text-[11px] text-[#9AA7BA] shrink-0">
                Reported by {inc.reported_by ?? "Operator"} ·{" "}
                {String(inc.created_at).slice(0, 16)}
              </span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}