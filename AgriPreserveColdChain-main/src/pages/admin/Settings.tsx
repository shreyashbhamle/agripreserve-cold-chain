import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Database, Settings as SettingsIcon } from "lucide-react";
import { agriApi } from "../../services/api";
import { ChartCard, PageHeader, StatusBadge } from "../../components/ui/SharedComponents";
import { useAuth } from "../../context/AuthContext";

export default function Settings() {
  const { user, notify } = useAuth();
  const [settings, setSettings] = useState<Record<string, string>>({
    default_temp_threshold_c: "8.0",
    default_humidity_min_pct: "65.0",
    default_humidity_max_pct: "90.0",
    sensor_sampling_interval_sec: "300",
    alert_escalation_minutes: "15",
    llm_mode: "LOCAL_RAG_DEFAULT",
    telemetry_mode: "SYNTHETIC_DEMO_CSV",
  });
  const [dataSources, setDataSources] = useState<Array<Record<string, any>>>([]);
  const [auditLogs, setAuditLogs] = useState<Array<Record<string, any>>>([]);

  useEffect(() => {
    agriApi
      .settings()
      .then((res) => {
        if (res.settings && Object.keys(res.settings).length > 0) {
          setSettings(res.settings);
        }
      })
      .catch(() => {});
    agriApi
      .dataSources()
      .then((res) => {
        setDataSources(res.sources ?? []);
        setAuditLogs(res.audit_logs ?? []);
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await agriApi.updateSettings(settings, user?.email ?? "admin");
      notify(
        "Platform Settings Saved",
        "Cold-chain threshold rules and telemetry settings persisted to SQLite.",
        "success",
      );
    } catch (err) {
      notify(
        "Save failed",
        err instanceof Error ? err.message : "Could not save settings",
        "error",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        role="admin"
        eyebrow="SYSTEM CONFIGURATION & DATA PROVENANCE"
        title="Platform Settings, Guardrail Thresholds & Data Sources"
        description="Configure global temperature/humidity alert thresholds, inspect synthetic CSV dataset provenance, and review operator audit logs."
        dataMode="SQLITE CONFIG"
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <ChartCard
            title="Global Cold-Chain Alert Thresholds & AI Configuration"
            subtitle="Persisted in SQLite system_settings table"
            badge="CONFIG"
          >
            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">
                    Default Max Temperature (°C)
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.default_temp_threshold_c ?? "8.0"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        default_temp_threshold_c: e.target.value,
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">
                    Min Relative Humidity (%)
                  </span>
                  <input
                    type="number"
                    value={settings.default_humidity_min_pct ?? "65.0"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        default_humidity_min_pct: e.target.value,
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">
                    Max Relative Humidity (%)
                  </span>
                  <input
                    type="number"
                    value={settings.default_humidity_max_pct ?? "90.0"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        default_humidity_max_pct: e.target.value,
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">
                    Sensor Sampling Interval (sec)
                  </span>
                  <input
                    type="number"
                    value={settings.sensor_sampling_interval_sec ?? "300"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sensor_sampling_interval_sec: e.target.value,
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">
                    Alert Escalation SLA (minutes)
                  </span>
                  <input
                    type="number"
                    value={settings.alert_escalation_minutes ?? "15"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        alert_escalation_minutes: e.target.value,
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Telemetry Ingestion Mode</span>
                  <select
                    value={settings.telemetry_mode ?? "SYNTHETIC_DEMO_CSV"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        telemetry_mode: e.target.value,
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  >
                    <option value="SYNTHETIC_DEMO_CSV">
                      SYNTHETIC_DEMO_CSV (Default)
                    </option>
                    <option value="HYBRID_ESP32_WEBHOOK">
                      HYBRID_ESP32_WEBHOOK
                    </option>
                  </select>
                </label>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 font-bold text-slate-950 transition"
              >
                <CheckCircle2 className="w-4 h-4" /> Save System Configuration
              </button>
            </form>
          </ChartCard>
        </div>

        <div className="lg:col-span-6">
          <ChartCard
            title="Data Source Provenance & Honesty Registry"
            subtitle="Explicit documentation of synthetic CSV files vs live database records"
            badge="PROVENANCE"
          >
            <div className="space-y-2.5 text-xs">
              {dataSources.map((ds) => (
                <div
                  key={ds.source_key}
                  className="rounded-xl border border-[#303846] bg-[#11151D] p-3 flex items-start justify-between gap-2"
                >
                  <div>
                    <p className="font-bold text-[#F1F5F9] flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-400" />
                      {ds.name} ({ds.record_count} rows)
                    </p>
                    <p className="text-[11px] font-mono text-sky-300 mt-0.5">
                      {ds.file_path}
                    </p>
                    <p className="text-[11px] text-[#9AA7BA] mt-0.5">
                      {ds.notes}
                    </p>
                  </div>
                  <StatusBadge status={String(ds.mode)} />
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Security & Operator Audit Log */}
      <ChartCard
        title="Security & Operational Audit Log"
        subtitle="Recent authenticated logins, status changes, and system updates"
        badge="AUDIT LOG"
      >
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="rounded-xl border border-[#303846] bg-[#11151D] px-3.5 py-2.5 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-[#F1F5F9]">
                  {log.action}
                </span>
                <span className="text-[#9AA7BA]">· {log.details}</span>
              </div>
              <span className="text-[11px] text-[#9AA7BA]">
                {log.actor_email} ({log.actor_role}) ·{" "}
                {String(log.created_at).slice(0, 16)}
              </span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}