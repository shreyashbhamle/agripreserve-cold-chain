import { useEffect, useState } from "react";
import { ShieldCheck, Snowflake, Thermometer } from "lucide-react";
import { agriApi } from "../../services/api";
import {
  ChartCard,
  PageHeader,
  StatusBadge,
} from "../../components/ui/SharedComponents";
import { MultiLineChart } from "../../components/charts/AgriCharts";
import SensorMonitor from "../../iot/components/SensorMonitor";

export default function TemperatureMonitor() {
  const [shipmentId, setShipmentId] = useState("AP1025");
  const [readings, setReadings] = useState<Array<Record<string, any>>>([]);

  useEffect(() => {
    agriApi
      .shipmentSensors(shipmentId)
      .then((rows) => setReadings([...rows].reverse()))
      .catch(() => setReadings([]));
  }, [shipmentId]);

  const labels =
    readings.length > 0
      ? readings.map((r) => String(r.recorded_at).slice(11, 16))
      : ["07:00", "07:20", "07:40", "08:00", "08:20", "08:40"];
  const temps =
    readings.length > 0
      ? readings.map((r) => Number(r.temperature_c))
      : [6.4, 7.2, 8.1, 8.7, 9.1, 9.3];
  const hums =
    readings.length > 0
      ? readings.map((r) => Number(r.humidity_pct))
      : [79, 80, 82, 83, 84, 85];

  const excursions = temps.filter((t) => t > 8).length;

  return (
    <div className="space-y-6">
      <PageHeader
        role="driver"
        eyebrow="REEFER TELEMETRY & SOP GUIDANCE"
        title="Cargo Temperature, Humidity & Excursion Monitor"
        description="Real-time reefer probe monitoring with excursion counter, safe temperature band verification, and SOP corrective checklists."
        actions={
          <select
            value={shipmentId}
            onChange={(e) => setShipmentId(e.target.value)}
            className="rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-xs text-[#F1F5F9]"
            aria-label="Select shipment for temperature monitor"
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
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9AA7BA]">Latest Cargo Temp</p>
            <p className="mt-1 text-2xl font-bold text-[#F1F5F9]">
              {temps[temps.length - 1] ?? 4.6}°C
            </p>
          </div>
          <Thermometer className="w-5 h-5 text-sky-400" />
        </div>
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9AA7BA]">Readings Above 8°C Limit</p>
            <p className="mt-1 text-2xl font-bold text-rose-400">
              {excursions} packets
            </p>
          </div>
          <Snowflake className="w-5 h-5 text-rose-400" />
        </div>
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9AA7BA]">Compliance Status</p>
            <div className="mt-1.5">
              <StatusBadge
                status={excursions > 0 ? "Excursion Watch" : "Compliant"}
              />
            </div>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      <ChartCard
        title={`Reefer Probe Telemetry History (${shipmentId})`}
        subtitle="Temperature (°C) and Relative Humidity (%) with 8°C excursion guardrail"
        badge="12-POINT TRACE"
      >
        <MultiLineChart
          labels={labels}
          series={[
            { name: "Temperature (°C)", color: "#F59E0B", values: temps },
            { name: "Humidity (%)", color: "#38BDF8", values: hums },
          ]}
          referenceMax={8}
          referenceLabel="8°C Excursion Threshold"
          area
        />
      </ChartCard>

      <SensorMonitor />
    </div>
  );
}