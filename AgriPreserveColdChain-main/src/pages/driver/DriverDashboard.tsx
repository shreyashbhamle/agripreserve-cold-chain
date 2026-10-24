import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Droplets,
  Gauge,
  MapPin,
  Navigation,
  Snowflake,
  Thermometer,
  Truck,
} from "lucide-react";
import {
  agriApi,
  type AlertRecord,
  type ShipmentRecord,
} from "../../services/api";
import {
  ChartCard,
  DataSourceBanner,
  MetricCard,
  PageHeader,
  StatusBadge,
} from "../../components/ui/SharedComponents";
import {
  BarChartVertical,
  HorizontalBarList,
  MultiLineChart,
} from "../../components/charts/AgriCharts";
import ShipmentMap from "../../components/maps/ShipmentMap";

export default function DriverDashboard() {
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [readings, setReadings] = useState<Array<Record<string, any>>>([]);
  const [selectedId, setSelectedId] = useState("AP1024");

  useEffect(() => {
    agriApi
      .shipments()
      .then((list) => setShipments(list))
      .catch(() => {});
    agriApi
      .alerts()
      .then(setAlerts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    agriApi
      .shipmentSensors(selectedId)
      .then((rows) => setReadings([...rows].reverse()))
      .catch(() => setReadings([]));
  }, [selectedId]);

  const current =
    shipments.find((s) => s.id === selectedId) ??
    shipments[0] ?? {
      id: "AP1024",
      product: "Tomatoes",
      quantity_kg: 1200,
      origin: "Nashik",
      destination: "Pune Cold Hub",
      status: "In Transit",
      eta: "2026-04-19 15:30",
      temperature_c: 4.6,
      humidity_pct: 79,
      driver: "Amit Shinde",
    };

  const latestReading = readings[readings.length - 1] ?? {
    temperature_c: current.temperature_c ?? 4.6,
    humidity_pct: current.humidity_pct ?? 79,
    speed_kmph: 55,
    door_status: "CLOSED",
    reefer_status: "ON",
  };

  const timeLabels =
    readings.length > 0
      ? readings.map((r) => String(r.recorded_at ?? "").slice(11, 16) || "08:00")
      : ["07:00", "07:20", "07:40", "08:00", "08:20", "08:40"];
  const tempSeries =
    readings.length > 0
      ? readings.map((r) => Number(r.temperature_c ?? 4.6))
      : [4.2, 4.4, 4.5, 4.7, 4.6, 4.6];
  const humSeries =
    readings.length > 0
      ? readings.map((r) => Number(r.humidity_pct ?? 79))
      : [78, 78, 79, 80, 79, 79];
  const speedSeries =
    readings.length > 0
      ? readings.map((r) => Number(r.speed_kmph ?? 52))
      : [48, 54, 58, 52, 60, 55];

  const driverAlerts = alerts.filter(
    (a) => a.shipment_id === current.id || a.status !== "Resolved",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        role="driver"
        eyebrow="COLD-CHAIN TRANSPORT DRIVER COCKPIT"
        title="Active Dispatch, Reefer Telemetry & Corridor Navigation"
        description="Mobile-ready driver command deck with OSRM road routing, cargo temperature & door monitoring, milestone transitions, and digital Proof of Delivery."
        actions={
          <>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-xs text-[#F1F5F9]"
              aria-label="Select assigned shipment"
            >
              {(shipments.length
                ? shipments.map((s) => s.id)
                : ["AP1024", "AP1025", "AP1026", "AP1027", "AP1028", "AP1029"]
              ).map((id) => (
                <option key={id} value={id}>
                  Assigned Load: {id}
                </option>
              ))}
            </select>
            <Link
              to="/driver/current-shipment"
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 px-4 py-2 text-xs font-bold text-slate-950 transition"
            >
              <Truck className="w-3.5 h-3.5" /> Update Status
            </Link>
            <Link
              to="/driver/delivery-proof"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#303846] bg-[#1D2330] hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-[#F1F5F9] transition"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" /> Submit
              POD
            </Link>
          </>
        }
      />

      <DataSourceBanner />

      {/* 10 Driver KPI Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard
          title="1. Assigned Shipment ID"
          value={current.id}
          trend={`${current.product} (${current.quantity_kg} kg)`}
          trendPositive
          subtitle={`Driver: ${current.driver}`}
          icon={<Truck className="w-4 h-4 text-sky-400" />}
          to="/driver/current-shipment"
        />
        <MetricCard
          title="2. Current Trip Status"
          value={current.status}
          trend="Tap to update milestone"
          trendPositive={current.status !== "At Risk"}
          subtitle="SQLite state machine"
          icon={<CheckCircle2 className="w-4 h-4 text-sky-400" />}
          to="/driver/current-shipment"
        />
        <MetricCard
          title="3. Next Stop / Destination"
          value={current.destination}
          trend={`Origin: ${current.origin}`}
          trendPositive
          subtitle="Dock 2 Priority Unload"
          icon={<MapPin className="w-4 h-4 text-sky-400" />}
          to="/driver/route-navigation"
        />
        <MetricCard
          title="4. Estimated Arrival (ETA)"
          value={String(current.eta).slice(11, 16) || "15:30"}
          trend={String(current.eta).slice(0, 10)}
          trendPositive
          subtitle="OSRM corridor estimate"
          icon={<Clock className="w-4 h-4 text-sky-400" />}
          to="/driver/route-navigation"
        />
        <MetricCard
          title="5. Remaining Distance"
          value="64 km"
          trend={`Speed: ${latestReading.speed_kmph ?? 54} km/h`}
          trendPositive
          subtitle="Via NH-60 / Chakan"
          icon={<Navigation className="w-4 h-4 text-sky-400" />}
          to="/driver/route-navigation"
        />
        <MetricCard
          title="6. Cargo Temperature"
          value={`${latestReading.temperature_c ?? 4.6}°C`}
          trend="Safe band: 2°C – 8°C"
          trendPositive={Number(latestReading.temperature_c ?? 4.6) <= 8}
          subtitle="Reefer probe #1"
          sparkline={tempSeries}
          icon={<Thermometer className="w-4 h-4 text-sky-400" />}
          to="/driver/temperature-monitor"
        />
        <MetricCard
          title="7. Cargo Humidity"
          value={`${latestReading.humidity_pct ?? 79}% RH`}
          trend="Target: 70% – 90%"
          trendPositive
          subtitle="Vapor seal intact"
          sparkline={humSeries}
          icon={<Droplets className="w-4 h-4 text-sky-400" />}
          to="/driver/temperature-monitor"
        />
        <MetricCard
          title="8. Reefer Unit Status"
          value={String(latestReading.reefer_status ?? "ON")}
          trend="Evaporator fan active"
          trendPositive={latestReading.reefer_status !== "OFF"}
          subtitle="Diesel/Electric hybrid"
          icon={<Snowflake className="w-4 h-4 text-emerald-400" />}
          to="/driver/temperature-monitor"
        />
        <MetricCard
          title="9. Rear Cargo Door"
          value={String(latestReading.door_status ?? "CLOSED")}
          trend={
            latestReading.door_status === "OPEN"
              ? "Close door immediately!"
              : "Magnetic reed locked"
          }
          trendPositive={latestReading.door_status !== "OPEN"}
          subtitle="Seal sensor active"
          icon={<Gauge className="w-4 h-4 text-sky-400" />}
          to="/driver/temperature-monitor"
        />
        <MetricCard
          title="10. Active Route Alerts"
          value={driverAlerts.length}
          trend="Check SOP guidance"
          trendPositive={driverAlerts.length === 0}
          subtitle="Thermal & traffic advisories"
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
          to="/driver/alerts"
        />
      </div>

      {/* Visualizations 1 & 4: Current Route Map + Trip Milestone Progress */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ChartCard
            title="1. Current Corridor Route Map with Checkpoints"
            subtitle="Road-following OSRM path with origin, cold-storage hub, and destination pins"
            badge="DEMO GPS"
          >
            <ShipmentMap compact selectedShipmentId={current.id} />
          </ChartCard>
        </div>

        <div className="lg:col-span-4 space-y-5">
          <ChartCard
            title="4 & 8. Trip Milestone Progress & On-Time SLA"
            subtitle="Current corridor completion and thermal compliance score"
            badge="MILESTONE TRACKER"
          >
            <div className="space-y-4">
              <HorizontalBarList
                items={[
                  {
                    label: "Corridor Distance Completed",
                    value: 68,
                    secondary: "146 / 210 km",
                    color: "#38BDF8",
                  },
                  {
                    label: "Trip Thermal Compliance",
                    value:
                      Number(latestReading.temperature_c ?? 4.6) <= 8 ? 96 : 62,
                    secondary: "Target > 90%",
                    color: "#10B981",
                  },
                  {
                    label: "On-Time Delivery Reliability",
                    value: 94,
                    secondary: "Last 15 trips",
                    color: "#22C55E",
                  },
                ]}
                unit="%"
              />

              <div className="rounded-xl bg-[#11151D] border border-[#303846] p-3 space-y-2 text-xs">
                <p className="font-bold text-[#F1F5F9]">
                  Corridor Checkpoints ({current.origin} → {current.destination})
                </p>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>✓ 1. Origin Packhouse Pre-Cool &amp; Seal</span>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center justify-between text-sky-300 font-semibold">
                    <span>● 2. Highway Corridor Transit &amp; Telemetry</span>
                    <span>Active</span>
                  </div>
                  <div className="flex items-center justify-between text-[#9AA7BA]">
                    <span>○ 3. Destination Cold Dock Arrival &amp; POD</span>
                    <span>Upcoming</span>
                  </div>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Visualizations 2, 3 & 5: Cargo Temp, Humidity & Speed History */}
      <div className="grid gap-5 lg:grid-cols-3">
        <ChartCard
          title="2. Cargo Temperature Over Trip (°C)"
          subtitle="Reefer probe trace with 8°C upper safe threshold"
          badge="TEMP TRACE"
        >
          <MultiLineChart
            height={195}
            labels={timeLabels}
            series={[
              {
                name: "Cargo Temp (°C)",
                color: "#38BDF8",
                values: tempSeries,
              },
            ]}
            referenceMax={8}
            referenceLabel="8°C Safe Limit"
            unit="°C"
            area
          />
        </ChartCard>

        <ChartCard
          title="3. Cargo Relative Humidity Over Trip (%)"
          subtitle="Continuous moisture preservation inside trailer"
          badge="HUMIDITY"
        >
          <MultiLineChart
            height={195}
            labels={timeLabels}
            series={[
              {
                name: "Relative Humidity (%)",
                color: "#10B981",
                values: humSeries,
              },
            ]}
            unit="%"
            area
          />
        </ChartCard>

        <ChartCard
          title="5. Vehicle Speed & Movement Profile (km/h)"
          subtitle="Identifies highway transit vs stationary door stops"
          badge="SPEED LOG"
        >
          <MultiLineChart
            height={195}
            labels={timeLabels}
            series={[
              {
                name: "Speed (km/h)",
                color: "#F59E0B",
                values: speedSeries,
              },
            ]}
            unit=" km/h"
          />
        </ChartCard>
      </div>

      {/* Visualizations 6 & 7: Alert Timeline + Completed Trips by Day */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <ChartCard
            title="6. Active Driver Alert & SOP Advisory Timeline"
            subtitle="Immediate actions for reefer or route exceptions"
            badge="ALERT TIMELINE"
          >
            <div className="space-y-2.5 text-xs">
              {driverAlerts.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-[#303846] bg-[#11151D] p-3 flex items-start justify-between gap-2"
                >
                  <div>
                    <p className="font-bold text-[#F1F5F9]">
                      {a.shipment_id} · {a.type}
                    </p>
                    <p className="text-[#9AA7BA] mt-0.5">{a.message}</p>
                  </div>
                  <StatusBadge status={a.severity} />
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        <div className="lg:col-span-6">
          <ChartCard
            title="7. Completed Cold-Chain Trips by Day"
            subtitle="Weekly dispatch completion count across corridor"
            badge="TRIP HISTORY"
          >
            <BarChartVertical
              height={185}
              items={[
                { label: "Mon", value: 2, color: "#38BDF8" },
                { label: "Tue", value: 3, color: "#38BDF8" },
                { label: "Wed", value: 2, color: "#38BDF8" },
                { label: "Thu", value: 3, color: "#10B981" },
                { label: "Fri", value: 2, color: "#10B981" },
                { label: "Sat", value: 3, color: "#10B981" },
              ]}
              unit=" trips"
            />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}