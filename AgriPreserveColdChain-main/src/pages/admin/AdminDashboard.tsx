import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Boxes,
  CheckCircle2,
  Cpu,
  Plus,
  Radio,
  ShieldAlert,
  Snowflake,
  Thermometer,
  Truck,
  Users,
} from "lucide-react";
import {
  agriApi,
  agriIntelligenceApi,
  downloadCsv,
  type AlertRecord,
  type SensorDeviceRecord,
  type ShipmentRecord,
  type StorageFacilityRecord,
} from "../../services/api";
import {
  ChartCard,
  DataSourceBanner,
  ExportButton,
  MetricCard,
  PageHeader,
  StatusBadge,
} from "../../components/ui/SharedComponents";
import {
  BarChartVertical,
  DonutChart,
  HorizontalBarList,
  MultiLineChart,
  StackedBarChart,
} from "../../components/charts/AgriCharts";
import ShipmentMap from "../../components/maps/ShipmentMap";

export default function AdminDashboard() {
  const [summary, setSummary] = useState<Record<string, any> | null>(null);
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [facilities, setFacilities] = useState<StorageFacilityRecord[]>([]);
  const [sensors, setSensors] = useState<SensorDeviceRecord[]>([]);
  const [riskRanking, setRiskRanking] = useState<Array<Record<string, any>>>([]);
  const [selectedShipmentId, setSelectedShipmentId] = useState("AP1025");
  const [selectedReadings, setSelectedReadings] = useState<
    Array<Record<string, any>>
  >([]);

  useEffect(() => {
    agriApi
      .summary()
      .then(setSummary)
      .catch(() => {});
    agriApi
      .shipments()
      .then(setShipments)
      .catch(() => {});
    agriApi
      .alerts()
      .then(setAlerts)
      .catch(() => {});
    agriApi
      .storage()
      .then(setFacilities)
      .catch(() => {});
    agriApi
      .sensorDevices()
      .then(setSensors)
      .catch(() => {});
    agriIntelligenceApi
      .riskRanking()
      .then((res) => setRiskRanking(res.items ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    agriApi
      .shipmentSensors(selectedShipmentId)
      .then((rows) => setSelectedReadings([...rows].reverse()))
      .catch(() => setSelectedReadings([]));
  }, [selectedShipmentId]);

  const totalUsers = Number(summary?.total_users ?? 7);
  const activeShipments = Number(
    summary?.active_shipments ??
      shipments.filter((s) => s.status !== "Delivered").length ??
      5,
  );
  const deliveredToday = Number(
    summary?.delivered_today ??
      shipments.filter((s) => s.status === "Delivered").length ??
      1,
  );
  const atRiskShipments = Number(
    summary?.at_risk_shipments ??
      shipments.filter(
        (s) => s.status === "At Risk" || s.status === "Delayed",
      ).length ??
      3,
  );
  const totalSensors = Number(
    summary?.total_sensors ?? (sensors.length || 7),
  );
  const onlineSensors = Number(
    summary?.online_sensors ??
      (sensors.filter((s) => s.online_status === "online").length || 6),
  );
  const openCriticalAlerts = Number(
    summary?.open_critical_alerts ??
      (alerts.filter(
        (a) => a.status !== "Resolved" && a.severity === "Critical",
      ).length || 2),
  );
  const activeFacilities = Number(
    summary?.active_facilities ?? (facilities.length || 4),
  );
  const transitQtyKg = Number(
    summary?.in_transit_quantity_kg ??
      (shipments
        .filter((s) => s.status !== "Delivered")
        .reduce((acc, s) => acc + Number(s.quantity_kg || 0), 0) ||
        7350),
  );
  const spoilageAvoidedKg = Number(
    summary?.estimated_spoilage_avoided_kg ?? Math.round(transitQtyKg * 0.042),
  );

  // Chart 1: Shipment volume over time
  const volumeLabels = ["14 Apr", "15 Apr", "16 Apr", "17 Apr", "18 Apr", "19 Apr"];
  const volumeSeries = [
    {
      name: "Dispatched Produce (kg)",
      color: "#10B981",
      values: [6400, 7100, 6850, 7900, 8250, 9150],
    },
    {
      name: "Compliant Cold Delivery (kg)",
      color: "#38BDF8",
      values: [6100, 6750, 6400, 7250, 7500, 7350],
    },
  ];

  // Chart 2: Shipment status distribution
  const statusCounts = {
    inTransit:
      shipments.filter((s) => s.status === "In Transit").length || 3,
    atRisk: shipments.filter((s) => s.status === "At Risk").length || 2,
    delayed: shipments.filter((s) => s.status === "Delayed").length || 1,
    delivered: shipments.filter((s) => s.status === "Delivered").length || 1,
  };

  // Chart 3: Temperature history for selected shipment
  const tempLabels =
    selectedReadings.length > 0
      ? selectedReadings.map((r) =>
          String(r.recorded_at ?? "").slice(11, 16) || "08:00",
        )
      : ["07:00", "07:20", "07:40", "08:00", "08:20", "08:40"];
  const tempValues =
    selectedReadings.length > 0
      ? selectedReadings.map((r) => Number(r.temperature_c ?? 5.0))
      : [6.4, 7.1, 7.8, 8.5, 9.1, 9.3];
  const humValues =
    selectedReadings.length > 0
      ? selectedReadings.map((r) => Number(r.humidity_pct ?? 80))
      : [79, 80, 82, 83, 85, 86];

  // Chart 4: Produce volume by category
  const produceVolumeItems =
    shipments.length > 0
      ? shipments.map((s) => ({
          label: s.product,
          value: Number(s.quantity_kg),
          subtitle: s.id,
          color:
            s.status === "At Risk"
              ? "#F87171"
              : s.status === "Delayed"
                ? "#F59E0B"
                : "#10B981",
        }))
      : [
          { label: "Potatoes", value: 2100, subtitle: "AP1029", color: "#10B981" },
          { label: "Onions", value: 1800, subtitle: "AP1026", color: "#10B981" },
          { label: "Bananas", value: 1500, subtitle: "AP1025", color: "#F87171" },
          { label: "Tomatoes", value: 1200, subtitle: "AP1024", color: "#10B981" },
          { label: "Grapes", value: 950, subtitle: "AP1027", color: "#38BDF8" },
          { label: "Okra", value: 900, subtitle: "AP1028", color: "#F87171" },
        ];

  // Chart 5: Alerts by severity & status
  const criticalAlerts = alerts.filter((a) => a.severity === "Critical");
  const warningAlerts = alerts.filter((a) => a.severity === "Warning");
  const infoAlerts = alerts.filter((a) => a.severity === "Info");

  const stackedAlertRows = [
    {
      label: "Critical Alerts",
      segments: [
        {
          name: "Open",
          value: criticalAlerts.filter((a) => a.status === "Open").length || 2,
          color: "#F87171",
        },
        {
          name: "Acknowledged",
          value:
            criticalAlerts.filter((a) => a.status === "Acknowledged").length ||
            0,
          color: "#F59E0B",
        },
        {
          name: "Resolved",
          value:
            criticalAlerts.filter((a) => a.status === "Resolved").length || 0,
          color: "#10B981",
        },
      ],
    },
    {
      label: "Warning Alerts",
      segments: [
        {
          name: "Open",
          value: warningAlerts.filter((a) => a.status === "Open").length || 2,
          color: "#F87171",
        },
        {
          name: "Acknowledged",
          value:
            warningAlerts.filter((a) => a.status === "Acknowledged").length ||
            1,
          color: "#F59E0B",
        },
        {
          name: "Resolved",
          value:
            warningAlerts.filter((a) => a.status === "Resolved").length || 0,
          color: "#10B981",
        },
      ],
    },
    {
      label: "Info Advisories",
      segments: [
        {
          name: "Open",
          value: infoAlerts.filter((a) => a.status === "Open").length || 1,
          color: "#F87171",
        },
        {
          name: "Acknowledged",
          value:
            infoAlerts.filter((a) => a.status === "Acknowledged").length || 0,
          color: "#F59E0B",
        },
        {
          name: "Resolved",
          value: infoAlerts.filter((a) => a.status === "Resolved").length || 1,
          color: "#10B981",
        },
      ],
    },
  ];

  // Chart 7: Cold-storage capacity utilization
  const storageBars =
    facilities.length > 0
      ? facilities.map((f) => ({
          label: f.name,
          value: Number(f.capacity_used_pct),
          secondary: `${f.temperature_c}°C · ${f.humidity_pct}% RH`,
          color:
            f.capacity_used_pct > 85
              ? "#F87171"
              : f.capacity_used_pct > 75
                ? "#F59E0B"
                : "#10B981",
        }))
      : [
          {
            label: "Mumbai Retail Buffer",
            value: 91,
            secondary: "6.4°C · 84% RH",
            color: "#F87171",
          },
          {
            label: "Pune Cold Hub",
            value: 78,
            secondary: "3.8°C · 80% RH",
            color: "#F59E0B",
          },
          {
            label: "Nashik Packhouse",
            value: 72,
            secondary: "4.1°C · 79% RH",
            color: "#10B981",
          },
          {
            label: "Ahmednagar Transit",
            value: 64,
            secondary: "5.0°C · 82% RH",
            color: "#10B981",
          },
        ];

  return (
    <div className="space-y-6">
      <PageHeader
        role="admin"
        eyebrow="ADMIN COMMAND CENTER"
        title="Supply Chain & Cold-Chain Intelligence Overview"
        description="Real-time operational telemetry, fleet risk rankings, cold-storage capacity, and grounded AI decision support across the Nashik–Pune–Mumbai agricultural corridor."
        actions={
          <>
            <ExportButton
              label="Export Fleet CSV"
              onClick={() =>
                downloadCsv(
                  "agripreserve_admin_shipments.csv",
                  shipments as unknown as Array<Record<string, unknown>>,
                )
              }
            />
            <Link
              to="/admin/international-trade"
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 px-4 py-2 text-xs font-bold text-slate-950 transition"
            >
              <Activity className="w-3.5 h-3.5" /> Customs &amp; Intl Trade
            </Link>
            <Link
              to="/admin/shipments"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Create Shipment
            </Link>
            <Link
              to="/admin/ai-insights"
              className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/40 bg-violet-500/15 hover:bg-violet-500/25 px-4 py-2 text-xs font-semibold text-violet-200 transition"
            >
              <BrainCircuit className="w-3.5 h-3.5" /> AI Copilot &amp; SOPs
            </Link>
          </>
        }
      />

      <DataSourceBanner />

      {/* 10 KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Total Registered Users"
          value={totalUsers}
          trend="+2 active operators"
          trendPositive
          subtitle="Across 4 role portals"
          sparkline={[4, 5, 5, 6, 6, 7]}
          icon={<Users className="w-4 h-4" />}
          to="/admin/users"
        />
        <MetricCard
          title="Active Shipments"
          value={activeShipments}
          trend="84 telemetry packets"
          trendPositive
          subtitle="Corridor reefers active"
          sparkline={[4, 5, 6, 5, 6, activeShipments]}
          icon={<Truck className="w-4 h-4" />}
          to="/admin/shipments"
        />
        <MetricCard
          title="Shipments Delivered Today"
          value={deliveredToday}
          trend="100% POD verified"
          trendPositive
          subtitle="AP1029 · Vashi Hub"
          sparkline={[0, 1, 1, 2, 1, deliveredToday]}
          icon={<CheckCircle2 className="w-4 h-4" />}
          to="/admin/shipments"
        />
        <MetricCard
          title="Shipments Currently at Risk"
          value={atRiskShipments}
          trend="AP1025 & AP1028"
          trendPositive={false}
          subtitle="Thermal / door excursion"
          sparkline={[1, 1, 2, 2, 3, atRiskShipments]}
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
          to="/admin/alerts"
        />
        <MetricCard
          title="Total Connected Sensors"
          value={totalSensors}
          trend="ESP32-S3 + LoRa"
          trendPositive
          subtitle="Simulated fleet nodes"
          sparkline={[5, 6, 6, 7, 7, totalSensors]}
          icon={<Cpu className="w-4 h-4" />}
          to="/admin/live-tracking"
          badge="DEMO"
        />
        <MetricCard
          title="Online Sensors"
          value={`${onlineSensors} / ${totalSensors}`}
          trend={`${Math.round((onlineSensors / Math.max(totalSensors, 1)) * 100)}% connectivity`}
          trendPositive
          subtitle="1 node delayed heartbeat"
          sparkline={[5, 6, 6, 6, 7, onlineSensors]}
          icon={<Radio className="w-4 h-4" />}
          to="/admin/live-tracking"
        />
        <MetricCard
          title="Open Critical Alerts"
          value={openCriticalAlerts}
          trend="Requires SLA triage"
          trendPositive={false}
          subtitle="Temp > threshold"
          sparkline={[1, 2, 1, 3, 2, openCriticalAlerts]}
          icon={<ShieldAlert className="w-4 h-4 text-rose-400" />}
          to="/admin/alerts"
        />
        <MetricCard
          title="Active Cold-Storage Hubs"
          value={activeFacilities}
          trend="Avg 76.3% utilized"
          trendPositive
          subtitle="Nashik · Pune · Mumbai"
          sparkline={[3, 4, 4, 4, 4, activeFacilities]}
          icon={<Snowflake className="w-4 h-4 text-sky-400" />}
          to="/admin/cold-storage"
        />
        <MetricCard
          title="Produce Quantity in Transit"
          value={`${transitQtyKg.toLocaleString()} kg`}
          trend="7 active batches"
          trendPositive
          subtitle="Tomatoes, Grapes, Bananas..."
          sparkline={[5200, 6100, 6800, 7100, 7350]}
          icon={<Boxes className="w-4 h-4" />}
          to="/admin/inventory"
        />
        <MetricCard
          title="Est. Spoilage Avoided (Demo)"
          value={`${spoilageAvoidedKg.toLocaleString()} kg`}
          trend="4.2% modeled reduction"
          trendPositive
          subtitle="Formula: compliant_kg × 0.042"
          sparkline={[180, 210, 245, 280, spoilageAvoidedKg]}
          icon={<Thermometer className="w-4 h-4" />}
          to="/admin/analytics"
          badge="CALC"
          tooltip="Calculated as 4.2% baseline cold-chain loss prevented across temperature-compliant shipments in the synthetic dataset."
        />
      </div>

      {/* International Trade, Customs, Freight & Financial Settlement Strip */}
      <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#303846]">
          <div className="text-xs font-extrabold uppercase tracking-wider text-sky-300">
            Global Trade, Customs Duties, Freight Expenditure &amp; Financial
            Reconciliation
          </div>
          <Link
            to="/admin/international-trade"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline"
          >
            Open International Trade &amp; Landed Cost Engine{" "}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 text-xs">
          <div className="rounded-xl border border-[#303846] bg-[#11151D] p-3">
            <div className="text-[10px] uppercase text-[#9AA7BA]">
              Customs Clearance Pending
            </div>
            <div className="mt-1 text-lg font-extrabold text-amber-300">
              {Number(summary?.customs_clearance_pending ?? 1)}
            </div>
            <div className="text-[11px] text-[#9AA7BA]">
              AP-INTL-2026 (Jebel Ali AEJEA)
            </div>
          </div>
          <div className="rounded-xl border border-[#303846] bg-[#11151D] p-3">
            <div className="text-[10px] uppercase text-[#9AA7BA]">
              Total Freight Charges
            </div>
            <div className="mt-1 text-lg font-extrabold text-white">
              ₹
              {Number(
                summary?.total_freight_charges_inr ?? 285200,
              ).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-sky-300">
              Multimodal Road + Sea + Air
            </div>
          </div>
          <div className="rounded-xl border border-[#303846] bg-[#11151D] p-3">
            <div className="text-[10px] uppercase text-[#9AA7BA]">
              Customs Duties &amp; Import VAT
            </div>
            <div className="mt-1 text-lg font-extrabold text-amber-300">
              ₹
              {Number(
                summary?.customs_duties_and_taxes_inr ?? 172325,
              ).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-[#9AA7BA]">
              0% CEPA Duty + 5% UAE VAT
            </div>
          </div>
          <div className="rounded-xl border border-[#303846] bg-[#11151D] p-3">
            <div className="text-[10px] uppercase text-[#9AA7BA]">
              Gross Trade Revenue
            </div>
            <div className="mt-1 text-lg font-extrabold text-emerald-400">
              ₹
              {Number(summary?.total_revenue_inr ?? 2826500).toLocaleString(
                "en-IN",
              )}
            </div>
            <div className="text-[11px] text-[#9AA7BA]">
              Export + Domestic Orders
            </div>
          </div>
          <div className="rounded-xl border border-[#303846] bg-[#11151D] p-3">
            <div className="text-[10px] uppercase text-[#9AA7BA]">
              Outstanding Settlements
            </div>
            <div className="mt-1 text-lg font-extrabold text-rose-300">
              ₹
              {Number(
                summary?.outstanding_payments_inr ?? 2320500,
              ).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-[#9AA7BA]">
              LC / Escrow &amp; Open Invoices
            </div>
          </div>
          <div className="rounded-xl border border-[#303846] bg-[#11151D] p-3">
            <div className="text-[10px] uppercase text-[#9AA7BA]">
              Estimated Platform Profit
            </div>
            <div className="mt-1 text-lg font-extrabold text-emerald-300">
              ₹
              {Number(summary?.estimated_profit_inr ?? 183722).toLocaleString(
                "en-IN",
              )}
            </div>
            <div className="text-[11px] text-emerald-400">
              Net of Pass-Through Costs
            </div>
          </div>
        </div>
      </div>

      {/* Row 1 of Visualizations: 1. Shipment Volume Over Time + 2. Shipment Status Distribution */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ChartCard
            title="1. Shipment Volume & Cold-Compliant Tonnage Over Time"
            subtitle="Daily dispatched produce vs temperature-compliant volume (kg)"
            badge="SYNTHETIC DEMO"
          >
            <MultiLineChart
              labels={volumeLabels}
              series={volumeSeries}
              unit=" kg"
              area
            />
          </ChartCard>
        </div>

        <div className="lg:col-span-5">
          <ChartCard
            title="2. Shipment Status Distribution"
            subtitle="Live breakdown of active and completed shipments"
            badge="LIVE DB"
          >
            <DonutChart
              centerTitle="Shipments"
              centerValue={shipments.length || 7}
              segments={[
                {
                  label: "In Transit",
                  value: statusCounts.inTransit,
                  color: "#38BDF8",
                },
                {
                  label: "At Risk (Excursion)",
                  value: statusCounts.atRisk,
                  color: "#F87171",
                },
                {
                  label: "Delayed",
                  value: statusCounts.delayed,
                  color: "#F59E0B",
                },
                {
                  label: "Delivered",
                  value: statusCounts.delivered,
                  color: "#10B981",
                },
              ]}
            />
          </ChartCard>
        </div>
      </div>

      {/* Row 2 of Visualizations: 3. Temperature History for Selected Shipment + 4. Produce Volume by Category */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <ChartCard
            title="3. Temperature & Humidity History by Shipment"
            subtitle="12-point reefer telemetry trace from sensor_readings.csv"
            badge="TELEMETRY TRACE"
            rightSlot={
              <select
                value={selectedShipmentId}
                onChange={(e) => setSelectedShipmentId(e.target.value)}
                className="rounded-xl bg-[#11151D] border border-[#303846] px-2.5 py-1.5 text-xs text-[#F1F5F9]"
                aria-label="Select shipment for temperature chart"
              >
                {(shipments.length
                  ? shipments.map((s) => s.id)
                  : ["AP1024", "AP1025", "AP1026", "AP1027", "AP1028", "AP1029", "AP1030"]
                ).map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            }
          >
            <MultiLineChart
              labels={tempLabels}
              series={[
                {
                  name: "Temperature (°C)",
                  color: "#F59E0B",
                  values: tempValues,
                },
                {
                  name: "Humidity (%)",
                  color: "#38BDF8",
                  values: humValues,
                },
              ]}
              referenceMax={8}
              referenceLabel="8°C Cold Alert Limit"
            />
          </ChartCard>
        </div>

        <div className="lg:col-span-6">
          <ChartCard
            title="4. Produce Volume by Crop Category"
            subtitle="Active shipment load (kg) per perishable commodity"
            badge="SYNTHETIC DEMO"
          >
            <BarChartVertical items={produceVolumeItems} unit=" kg" />
          </ChartCard>
        </div>
      </div>

      {/* Row 3 of Visualizations: 5. Alerts by Severity + 7. Cold Storage Capacity + 9. Sensor Connectivity */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <ChartCard
            title="5. Alerts by Severity & Resolution State"
            subtitle="Open vs Acknowledged vs Resolved cold-chain alerts"
            badge="ALERT SLA"
          >
            <StackedBarChart rows={stackedAlertRows} />
          </ChartCard>
        </div>

        <div className="lg:col-span-4">
          <ChartCard
            title="7. Cold-Storage Capacity Utilization"
            subtitle="Current occupancy (%) and chamber conditions across hubs"
            badge="FACILITIES"
          >
            <HorizontalBarList items={storageBars} unit="%" max={100} />
          </ChartCard>
        </div>

        <div className="lg:col-span-4">
          <ChartCard
            title="8 & 9. Delivery SLA Trend & Sensor Connectivity"
            subtitle="On-time thermal compliance (%) and node online status"
            badge="FLEET HEALTH"
          >
            <div className="space-y-4">
              <MultiLineChart
                height={155}
                labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
                series={[
                  {
                    name: "On-Time Delivery %",
                    color: "#10B981",
                    values: [91, 93, 89, 94, 92, 95],
                  },
                  {
                    name: "Sensor Uptime %",
                    color: "#A78BFA",
                    values: [96, 95, 98, 94, 97, 86],
                  },
                ]}
                unit="%"
              />
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="rounded-xl bg-[#11151D] border border-[#303846] p-2.5 flex items-center justify-between">
                  <span className="text-[#9AA7BA]">Online Nodes</span>
                  <strong className="text-emerald-400">{onlineSensors}</strong>
                </div>
                <div className="rounded-xl bg-[#11151D] border border-[#303846] p-2.5 flex items-center justify-between">
                  <span className="text-[#9AA7BA]">Offline Nodes</span>
                  <strong className="text-rose-400">
                    {Math.max(0, totalSensors - onlineSensors)}
                  </strong>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Row 4: 6. Regional Shipment Distribution Map + 10. High-Risk Shipments Ranked Table */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ChartCard
            title="6. Regional Shipment Distribution & Corridor Telemetry Map"
            subtitle="Interactive OpenStreetMap & Satellite view with OSRM road routing"
            badge="DEMO GPS"
          >
            <ShipmentMap compact selectedShipmentId={selectedShipmentId} />
          </ChartCard>
        </div>

        <div className="lg:col-span-5">
          <ChartCard
            title="10. High-Risk Shipments Ranked Table"
            subtitle="Ranked by composite thermal excursion, door status, and spoilage probability"
            badge="AI RISK ENGINE"
            rightSlot={
              <Link
                to="/admin/ai-insights"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
              >
                Full Risk Matrix <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#303846] text-[#9AA7BA]">
                    <th className="py-2 pr-2">Shipment</th>
                    <th className="py-2 px-2">Temp / RH</th>
                    <th className="py-2 px-2">Risk Score</th>
                    <th className="py-2 pl-2">Driver / Cause</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#303846]/60">
                  {(riskRanking.length > 0
                    ? riskRanking.slice(0, 6)
                    : shipments.slice(0, 6).map((s) => ({
                        shipment_id: s.id,
                        product: s.product,
                        temperature_c: s.temperature_c,
                        humidity_pct: s.humidity_pct,
                        risk_score: s.risk?.risk_score ?? 45,
                        risk_level: s.risk?.risk_level ?? s.status,
                        primary_driver:
                          s.risk?.primary_driver ?? "Corridor monitoring",
                      }))
                  ).map((item) => (
                    <tr
                      key={item.shipment_id}
                      onClick={() => setSelectedShipmentId(item.shipment_id)}
                      className="hover:bg-[#1D2330]/70 cursor-pointer transition"
                    >
                      <td className="py-2.5 pr-2">
                        <p className="font-bold text-[#F1F5F9]">
                          {item.shipment_id}
                        </p>
                        <p className="text-[11px] text-[#9AA7BA]">
                          {item.product}
                        </p>
                      </td>
                      <td className="py-2.5 px-2 font-mono text-[#F1F5F9]">
                        {item.temperature_c ?? "--"}°C /{" "}
                        {item.humidity_pct ?? "--"}%
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#F1F5F9]">
                            {item.risk_score}
                          </span>
                          <StatusBadge status={String(item.risk_level)} />
                        </div>
                      </td>
                      <td className="py-2.5 pl-2 text-[11px] text-[#9AA7BA] max-w-[160px] truncate">
                        {item.primary_driver}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Operational Panels: Live Activity, Critical Incident Queue, AI Recommendations */}
      <div className="grid gap-5 lg:grid-cols-3">
        <ChartCard
          title="Critical Alert & Incident Queue"
          subtitle="Immediate cold-chain exceptions requiring triage"
          badge="LIVE QUEUE"
          rightSlot={
            <Link
              to="/admin/alerts"
              className="text-xs text-emerald-400 hover:underline"
            >
              Manage Alerts
            </Link>
          }
        >
          <div className="space-y-2.5">
            {alerts.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-[#303846] bg-[#11151D] p-3 flex items-start justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#F1F5F9]">
                      {a.shipment_id}
                    </span>
                    <span className="text-[#9AA7BA]">· {a.type}</span>
                  </div>
                  <p className="text-[#9AA7BA] mt-1 leading-relaxed">
                    {a.message}
                  </p>
                </div>
                <StatusBadge status={a.severity} />
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard
          title="Cold-Storage Health Summary"
          subtitle="Chamber power, door activity, and thermal stability"
          badge="4 HUBS"
          rightSlot={
            <Link
              to="/admin/cold-storage"
              className="text-xs text-emerald-400 hover:underline"
            >
              Open Storage
            </Link>
          }
        >
          <div className="space-y-2.5">
            {facilities.slice(0, 4).map((f) => (
              <div
                key={f.id}
                className="rounded-xl border border-[#303846] bg-[#11151D] p-3 flex items-center justify-between gap-2 text-xs"
              >
                <div>
                  <p className="font-bold text-[#F1F5F9]">{f.name}</p>
                  <p className="text-[11px] text-[#9AA7BA]">
                    {f.location} · {f.temperature_c}°C · {f.humidity_pct}% RH
                  </p>
                </div>
                <StatusBadge status={f.status} />
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard
          title="AI Operational Recommendations"
          subtitle="Grounded in cold-chain SOPs (backend/knowledge_base/*.md)"
          badge="RAG + AGENT"
          rightSlot={
            <Link
              to="/admin/ai-insights"
              className="text-xs text-violet-400 hover:underline"
            >
              Run Agent
            </Link>
          }
        >
          <div className="space-y-2.5 text-xs">
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3">
              <p className="font-bold text-rose-200 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Action 1: Inspect AP1025
                Reefer Airflow
              </p>
              <p className="text-rose-200/80 mt-1">
                Per <code>temperature_excursion_sop.md</code>: Bananas load at
                9.3°C with door OPEN event. Contact driver Mahesh Kale to close
                seal and verify evaporator fan.
              </p>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3">
              <p className="font-bold text-amber-200">
                Action 2: Prioritize Dock Unloading for AP1028 (Okra)
              </p>
              <p className="text-amber-200/80 mt-1">
                Per <code>shipment_delay_sop.md</code>: Delayed shipment at
                11.4°C should bypass standard queue at Mumbai Retail Buffer.
              </p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
              <p className="font-bold text-emerald-200">
                Action 3: Rebalance Mumbai Retail Buffer (91% Full)
              </p>
              <p className="text-emerald-200/80 mt-1">
                Divert non-urgent Nashik potato batches to Pune Cold Hub (78%
                utilized).
              </p>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}