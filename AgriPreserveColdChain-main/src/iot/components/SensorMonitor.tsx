import { useEffect, useState } from "react";
import {
  Activity,
  BatteryCharging,
  Cpu,
  Play,
  Radio,
  RefreshCw,
  Thermometer,
  Droplets,
  Wifi,
} from "lucide-react";
import {
  agriApi,
  agriIntelligenceApi,
  type SensorDeviceRecord,
} from "../../services/api";
import { useSensorData } from "../hooks/useSensorData";
import { StatusBadge } from "../../components/ui/SharedComponents";
import { useAuth } from "../../context/AuthContext";

export default function SensorMonitor() {
  const { notify } = useAuth();
  const { readings: localReadings, alerts: localAlerts } = useSensorData(4000);
  const [devices, setDevices] = useState<SensorDeviceRecord[]>([]);
  const [selectedShipment, setSelectedShipment] = useState("AP1025");
  const [scenario, setScenario] = useState("normal_drift");
  const [simulating, setSimulating] = useState(false);

  const loadDevices = () => {
    agriApi
      .sensorDevices()
      .then((list) => setDevices(list))
      .catch(() => {
        // Fallback to local hook if backend is not reachable
      });
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await agriIntelligenceApi.simulateSensors(
        selectedShipment,
        3,
        scenario,
      );
      notify(
        "Simulated Telemetry Ingested",
        `Generated ${(res.readings as unknown[])?.length ?? 3} synthetic readings for ${selectedShipment} (${scenario}).`,
        scenario === "temp_spike" ? "warning" : "success",
      );
      loadDevices();
    } catch {
      notify(
        "Local Simulation Active",
        "Using browser-side sensor simulator stream.",
        "info",
      );
    } finally {
      setSimulating(false);
    }
  };

  const displayDevices =
    devices.length > 0
      ? devices
      : localReadings.map((s) => ({
          device_id: s.deviceId,
          shipment_id: "AP1024",
          device_type: "ESP32-DHT22-SIM",
          firmware_version: "v2.4.1-sim",
          battery_pct: s.battery,
          signal_rssi_dbm: -66,
          online_status: s.status,
          sampling_interval_sec: 300,
          calibration_offset_c: 0,
          data_mode: "SIMULATED",
          last_seen_at: s.timestamp,
          product: "Fresh Produce",
          temperature_c: s.temperature,
          humidity_pct: s.humidity,
        }));

  const onlineCount = displayDevices.filter(
    (d) => d.online_status === "online",
  ).length;
  const offlineCount = displayDevices.length - onlineCount;

  return (
    <div className="space-y-5">
      {/* Simulator Control Bar */}
      <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-[#F1F5F9]">
              ESP32 / Reefer Telemetry Simulator &amp; Hardware Ingestion Interface
            </h3>
            <span className="rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
              SIMULATED TELEMETRY
            </span>
          </div>
          <p className="text-xs text-[#9AA7BA]">
            Physical ESP32 nodes can POST JSON directly to{" "}
            <code className="text-emerald-300 bg-[#11151D] px-1.5 py-0.5 rounded">
              POST /api/sensors/readings
            </code>
            . Trigger synthetic telemetry below to test anomaly detection &amp;
            alert creation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedShipment}
            onChange={(e) => setSelectedShipment(e.target.value)}
            className="rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-xs text-[#F1F5F9]"
            aria-label="Select shipment for simulation"
          >
            {[
              "AP1024",
              "AP1025",
              "AP1026",
              "AP1027",
              "AP1028",
              "AP1029",
              "AP1030",
            ].map((id) => (
              <option key={id} value={id}>
                Shipment {id}
              </option>
            ))}
          </select>

          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-xs text-[#F1F5F9]"
            aria-label="Select telemetry scenario"
          >
            <option value="normal_drift">Normal Drift (±0.4°C)</option>
            <option value="temp_spike">Temperature Excursion Spike</option>
            <option value="door_open">Cargo Door Open Event</option>
          </select>

          <button
            type="button"
            disabled={simulating}
            onClick={handleSimulate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-3.5 py-2 text-xs transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            {simulating ? "Simulating..." : "Inject 3 Readings"}
          </button>

          <button
            type="button"
            onClick={loadDevices}
            className="inline-flex items-center gap-1 rounded-xl border border-[#303846] bg-[#1D2330] hover:bg-slate-700 px-3 py-2 text-xs text-[#F1F5F9]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* IoT Status Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4">
          <p className="text-xs text-[#9AA7BA]">Registered Sensor Nodes</p>
          <p className="mt-1 text-2xl font-bold text-[#F1F5F9]">
            {displayDevices.length}
          </p>
          <p className="text-[11px] text-[#9AA7BA] mt-1">
            ESP32-S3 &amp; LoRaWAN Reefers
          </p>
        </div>

        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4">
          <p className="text-xs text-[#9AA7BA]">Online Nodes</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {onlineCount}
          </p>
          <p className="text-[11px] text-emerald-400/80 mt-1">
            Active heartbeat &lt; 5 min
          </p>
        </div>

        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4">
          <p className="text-xs text-[#9AA7BA]">Offline / Delayed</p>
          <p className="mt-1 text-2xl font-bold text-rose-400">
            {offlineCount}
          </p>
          <p className="text-[11px] text-[#9AA7BA] mt-1">
            Check cellular/gateway RSSI
          </p>
        </div>

        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4">
          <p className="text-xs text-[#9AA7BA]">Data Source Mode</p>
          <p className="mt-1 text-lg font-bold text-amber-300">
            SIMULATED / DEMO
          </p>
          <p className="text-[11px] text-[#9AA7BA] mt-1">
            Ready for hardware webhook
          </p>
        </div>
      </div>

      {/* Local Simulator Stream Alerts */}
      {localAlerts.length > 0 && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Live Simulator Threshold Warnings
          </h3>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {localAlerts.slice(0, 3).map((alert, index) => (
              <div
                key={`${alert.deviceId}-${alert.type}-${index}`}
                className="rounded-xl bg-[#171B24] border border-[#303846] p-3 text-xs flex items-start justify-between gap-2"
              >
                <div>
                  <p className="font-semibold text-[#F1F5F9]">
                    {alert.deviceId}
                  </p>
                  <p className="text-[#9AA7BA] mt-0.5">{alert.message}</p>
                </div>
                <StatusBadge status={alert.severity} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sensor Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {displayDevices.map((sensor) => {
          const temp = Number(sensor.temperature_c ?? 4.2);
          const hum = Number(sensor.humidity_pct ?? 80);
          return (
            <div
              key={sensor.device_id}
              className="rounded-2xl border border-[#303846] bg-[#171B24] p-5 shadow-lg hover:border-slate-500 transition"
            >
              <div className="mb-4 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-[#F1F5F9] text-sm">
                      {sensor.device_id}
                    </h3>
                  </div>
                  <p className="text-xs text-[#9AA7BA] mt-0.5">
                    Shipment{" "}
                    <span className="text-slate-200 font-semibold">
                      {sensor.shipment_id}
                    </span>{" "}
                    · {sensor.product ?? "Cold Cargo"}
                  </p>
                </div>
                <StatusBadge status={sensor.online_status} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-[#11151D] border border-[#303846] p-3">
                  <p className="text-[#9AA7BA] flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-sky-400" />
                    Temperature
                  </p>
                  <p
                    className={`mt-1 text-lg font-bold ${
                      temp > 8
                        ? "text-rose-400"
                        : temp > 6
                          ? "text-amber-400"
                          : "text-emerald-400"
                    }`}
                  >
                    {temp.toFixed(1)}°C
                  </p>
                </div>

                <div className="rounded-xl bg-[#11151D] border border-[#303846] p-3">
                  <p className="text-[#9AA7BA] flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-sky-400" />
                    Humidity
                  </p>
                  <p
                    className={`mt-1 text-lg font-bold ${
                      hum < 65 || hum > 92
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {hum.toFixed(0)}%
                  </p>
                </div>

                <div className="rounded-xl bg-[#11151D] border border-[#303846] p-3">
                  <p className="text-[#9AA7BA] flex items-center gap-1">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    Battery
                  </p>
                  <p
                    className={`mt-1 text-sm font-bold ${
                      sensor.battery_pct < 25
                        ? "text-rose-400"
                        : "text-[#F1F5F9]"
                    }`}
                  >
                    {sensor.battery_pct}%
                  </p>
                </div>

                <div className="rounded-xl bg-[#11151D] border border-[#303846] p-3">
                  <p className="text-[#9AA7BA] flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5 text-violet-400" />
                    Signal RSSI
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#F1F5F9]">
                    {sensor.signal_rssi_dbm} dBm
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#303846]/70 flex items-center justify-between text-[11px] text-[#9AA7BA]">
                <span>FW: {sensor.firmware_version}</span>
                <span className="text-amber-300 font-medium">
                  {sensor.data_mode}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
