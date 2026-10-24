import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Droplets,
  IndianRupee,
  Leaf,
  Plus,
  Sprout,
  Thermometer,
  TrendingUp,
  Truck,
  Wallet,
} from "lucide-react";
import {
  agriApi,
  downloadCsv,
  type MarketPriceRecord,
  type OrderSaleRecord,
  type ProduceItemRecord,
  type ShipmentRecord,
} from "../../services/api";
import {
  ChartCard,
  DataSourceBanner,
  ExportButton,
  MetricCard,
  PageHeader,
} from "../../components/ui/SharedComponents";
import {
  BarChartVertical,
  DonutChart,
  HorizontalBarList,
  MultiLineChart,
} from "../../components/charts/AgriCharts";
import ShipmentMap from "../../components/maps/ShipmentMap";

export default function FarmerDashboard() {
  const [produce, setProduce] = useState<ProduceItemRecord[]>([]);
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [orders, setOrders] = useState<OrderSaleRecord[]>([]);
  const [prices, setPrices] = useState<MarketPriceRecord[]>([]);

  useEffect(() => {
    agriApi.produce().then(setProduce).catch(() => {});
    agriApi.shipments().then(setShipments).catch(() => {});
    agriApi.orders().then(setOrders).catch(() => {});
    agriApi
      .marketPrices()
      .then((res) => setPrices(res.items ?? []))
      .catch(() => {});
  }, []);

  const totalStockKg =
    produce.reduce((acc, p) => acc + Number(p.available_kg || 0), 0) || 6490;
  const activeShipmentsCount =
    shipments.filter((s) => s.status !== "Delivered").length || 6;
  const deliveredCount =
    shipments.filter((s) => s.status === "Delivered").length || 1;
  const atRiskKg =
    shipments
      .filter((s) => s.status === "At Risk" || s.status === "Delayed")
      .reduce((acc, s) => acc + Number(s.quantity_kg || 0), 0) || 3300;
  const avgTemp =
    shipments.length > 0
      ? (
          shipments.reduce((acc, s) => acc + Number(s.temperature_c ?? 5), 0) /
          shipments.length
        ).toFixed(1)
      : "5.8";
  const avgHumidity =
    shipments.length > 0
      ? Math.round(
          shipments.reduce((acc, s) => acc + Number(s.humidity_pct ?? 78), 0) /
            shipments.length,
        )
      : 78;
  const tomatoPrice =
    prices.find((p) => p.commodity === "Tomatoes")?.modal_price_inr_per_kg ??
    27;
  const expectedRevenueInr =
    orders.reduce((acc, o) => acc + Number(o.gross_amount_inr || 0), 0) ||
    247700;
  const pendingPayoutInr =
    orders
      .filter((o) => o.payment_status !== "Paid")
      .reduce((acc, o) => acc + Number(o.net_payout_inr || 0), 0) || 168950;

  return (
    <div className="space-y-6">
      <PageHeader
        role="farmer"
        eyebrow="PRODUCER / FARMER WORKSPACE"
        title="Harvest, Cold-Room Stock, Dispatch & Mandi Price Intelligence"
        description="Manage harvested crop batches, monitor packhouse and reefer temperatures, compare synthetic mandi benchmarks, and track buyer settlements."
        actions={
          <>
            <ExportButton
              label="Export Produce CSV"
              onClick={() =>
                downloadCsv(
                  "agripreserve_farmer_produce.csv",
                  produce as unknown as Array<Record<string, unknown>>,
                )
              }
            />
            <Link
              to="/farmer/produce"
              className="inline-flex items-center gap-1.5 rounded-xl bg-green-500 hover:bg-green-400 px-4 py-2 text-xs font-bold text-slate-950 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Harvest Batch
            </Link>
          </>
        }
      />

      <DataSourceBanner
        mode="SYNTHETIC MANDI & TELEMETRY DEMO"
        note="Mandi benchmark prices are loaded from datasets/synthetic/market_prices_demo.csv for demonstration and are not live government AGMARKNET feeds."
      />

      {/* 9 KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          title="1. Total Produce Stock"
          value={`${totalStockKg.toLocaleString()} kg`}
          trend="6 active crop batches"
          trendPositive
          subtitle="Available in packhouse"
          sparkline={[5100, 5600, 6100, 6300, totalStockKg]}
          icon={<Leaf className="w-4 h-4 text-green-400" />}
          to="/farmer/produce"
        />
        <MetricCard
          title="2. Active Outbound Shipments"
          value={activeShipmentsCount}
          trend="En route to Pune & Mumbai"
          trendPositive
          subtitle="Cold-chain reefers"
          sparkline={[4, 5, 5, 6, activeShipmentsCount]}
          icon={<Truck className="w-4 h-4 text-green-400" />}
          to="/farmer/shipments"
        />
        <MetricCard
          title="3. Delivered Shipments"
          value={deliveredCount}
          trend="AP1029 settled"
          trendPositive
          subtitle="Verified arrival POD"
          sparkline={[0, 1, 1, 1, deliveredCount]}
          icon={<CheckCircle2 className="w-4 h-4 text-green-400" />}
          to="/farmer/shipments"
        />
        <MetricCard
          title="4. Produce Currently at Risk"
          value={`${atRiskKg.toLocaleString()} kg`}
          trend="Bananas & Okra loads"
          trendPositive={false}
          subtitle="Requires reefer check"
          sparkline={[1200, 1500, 2400, atRiskKg]}
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
          to="/farmer/ai-insights"
        />
        <MetricCard
          title="5. Avg Cold-Storage Temp"
          value={`${avgTemp}°C`}
          trend="Target: 3.5°C – 6.0°C"
          trendPositive
          subtitle="Packhouse + Reefers"
          sparkline={[4.4, 4.8, 5.1, 5.5, Number(avgTemp)]}
          icon={<Thermometer className="w-4 h-4 text-sky-400" />}
          to="/farmer/iot"
        />
        <MetricCard
          title="6. Average Humidity"
          value={`${avgHumidity}% RH`}
          trend="Optimal vapor pressure"
          trendPositive
          subtitle="Prevents shriveling"
          sparkline={[76, 77, 79, 78, avgHumidity]}
          icon={<Droplets className="w-4 h-4 text-sky-400" />}
          to="/farmer/iot"
        />
        <MetricCard
          title="7. Mandi Price (Tomatoes)"
          value={`₹${tomatoPrice}/kg`}
          trend="+₹3/kg over 5 days"
          trendPositive
          subtitle="Nashik APMC (Demo CSV)"
          sparkline={[24, 25, 25, 26, tomatoPrice]}
          icon={<TrendingUp className="w-4 h-4 text-green-400" />}
          to="/farmer/sales"
          badge="DEMO"
        />
        <MetricCard
          title="8. Expected Order Revenue"
          value={`₹${expectedRevenueInr.toLocaleString()}`}
          trend="Across 5 buyer orders"
          trendPositive
          subtitle="Gross invoice value"
          sparkline={[180000, 205000, 225000, expectedRevenueInr]}
          icon={<IndianRupee className="w-4 h-4 text-green-400" />}
          to="/farmer/sales"
        />
        <MetricCard
          title="9. Pending Buyer Payouts"
          value={`₹${pendingPayoutInr.toLocaleString()}`}
          trend="3 invoices pending"
          trendPositive={false}
          subtitle="Net after cold logistics"
          sparkline={[190000, 175000, pendingPayoutInr]}
          icon={<Wallet className="w-4 h-4 text-amber-400" />}
          to="/farmer/sales"
        />
        <MetricCard
          title="Packhouse Cold Rooms"
          value="3 Zones Active"
          trend="98.4% pre-cooled"
          trendPositive
          subtitle="Nashik & Satara Chambers"
          sparkline={[2, 3, 3, 3, 3]}
          icon={<Boxes className="w-4 h-4 text-green-400" />}
          to="/farmer/inventory"
        />
      </div>

      {/* Visualizations Row 1: 1. Produce Inventory by Crop + 2. Harvest vs Sold Quantity Over Time */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <ChartCard
            title="1. Produce Inventory by Crop (Available vs Total Harvested kg)"
            subtitle="Current cold-room stock ready for buyer allocation"
            badge="PACKHOUSE STOCK"
          >
            <BarChartVertical
              items={
                produce.length > 0
                  ? produce.map((p) => ({
                      label: p.crop_name,
                      value: Number(p.available_kg),
                      subtitle: `Grade ${p.quality_grade}`,
                      color: "#22C55E",
                    }))
                  : [
                      { label: "Potatoes", value: 1800, subtitle: "Grade A" },
                      { label: "Onions", value: 1600, subtitle: "Grade A" },
                      { label: "Bananas", value: 1100, subtitle: "Grade A" },
                      { label: "Tomatoes", value: 980, subtitle: "Grade A" },
                      { label: "Grapes", value: 520, subtitle: "Export A+" },
                      { label: "Okra", value: 490, subtitle: "Grade B" },
                    ]
              }
              unit=" kg"
            />
          </ChartCard>
        </div>

        <div className="lg:col-span-6">
          <ChartCard
            title="2. Harvested vs Dispatched Sold Quantity Over Time"
            subtitle="Daily packhouse intake vs buyer-dispatched volume (kg)"
            badge="DUAL-LINE TREND"
          >
            <MultiLineChart
              labels={["14 Apr", "15 Apr", "16 Apr", "17 Apr", "18 Apr", "19 Apr"]}
              series={[
                {
                  name: "Harvest Intake (kg)",
                  color: "#22C55E",
                  values: [1950, 2200, 2100, 2450, 2600, 2850],
                },
                {
                  name: "Sold & Dispatched (kg)",
                  color: "#38BDF8",
                  values: [1600, 1850, 1900, 2100, 2350, 2500],
                },
              ]}
              unit=" kg"
              area
            />
          </ChartCard>
        </div>
      </div>

      {/* Visualizations Row 2: 3. Market Price Trend by Crop + 4. Crop Freshness Distribution */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ChartCard
            title="3. Daily Mandi Benchmark Price Trend by Crop (₹/kg)"
            subtitle="5-day trajectory from datasets/synthetic/market_prices_demo.csv"
            badge="SYNTHETIC MANDI DEMO"
          >
            <MultiLineChart
              labels={["15 Apr", "16 Apr", "17 Apr", "18 Apr", "19 Apr"]}
              series={[
                {
                  name: "Grapes (Sangli)",
                  color: "#A78BFA",
                  values: [68, 70, 71, 72, 74],
                },
                {
                  name: "Okra (Mumbai)",
                  color: "#F59E0B",
                  values: [38, 39, 41, 40, 42],
                },
                {
                  name: "Bananas (Pune)",
                  color: "#22C55E",
                  values: [31, 32, 32, 33, 34],
                },
                {
                  name: "Tomatoes (Nashik)",
                  color: "#10B981",
                  values: [24, 25, 25, 26, 27],
                },
              ]}
              unit=" ₹"
            />
          </ChartCard>
        </div>

        <div className="lg:col-span-5">
          <ChartCard
            title="4. Crop Freshness & Thermal Risk Distribution"
            subtitle="Batch health across farm cold-rooms and active shipments"
            badge="QUALITY HEALTH"
          >
            <DonutChart
              centerTitle="Batches"
              centerValue={produce.length || 6}
              segments={[
                { label: "Fresh (Optimal Cold)", value: 4, color: "#22C55E" },
                {
                  label: "Pre-Cooling / Dispatch Ready",
                  value: 1,
                  color: "#38BDF8",
                },
                {
                  label: "Expiring Soon / Excursion Watch",
                  value: 1,
                  color: "#F59E0B",
                },
              ]}
            />
          </ChartCard>
        </div>
      </div>

      {/* Visualizations Row 3: 5 & 6 Temp/Humidity Trends + 7 Revenue by Crop + 8 & 9 Status & Spoilage Risk */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <ChartCard
            title="5 & 6. Packhouse Temperature & Humidity Trend"
            subtitle="24-hour thermal & relative humidity trace"
            badge="IOT TELEMETRY"
          >
            <MultiLineChart
              height={190}
              labels={["04:00", "08:00", "12:00", "16:00", "20:00", "24:00"]}
              series={[
                {
                  name: "Temp (°C)",
                  color: "#22C55E",
                  values: [4.1, 4.3, 4.8, 5.1, 4.6, 4.2],
                },
                {
                  name: "Humidity (%)",
                  color: "#38BDF8",
                  values: [79, 80, 78, 77, 80, 81],
                },
              ]}
            />
          </ChartCard>
        </div>

        <div className="lg:col-span-4">
          <ChartCard
            title="7. Net Revenue by Crop Category (₹)"
            subtitle="Realized and contracted buyer payouts per crop"
            badge="REVENUE MIX"
          >
            <BarChartVertical
              height={190}
              items={[
                { label: "Grapes", value: 68400, color: "#A78BFA" },
                { label: "Potatoes", value: 52500, color: "#22C55E" },
                { label: "Bananas", value: 49500, color: "#10B981" },
                { label: "Onions", value: 43200, color: "#38BDF8" },
                { label: "Tomatoes", value: 33600, color: "#F59E0B" },
              ]}
              unit=""
            />
          </ChartCard>
        </div>

        <div className="lg:col-span-4">
          <ChartCard
            title="8 & 9. Spoilage Risk by Batch & Shipment Status"
            subtitle="Shelf-life urgency score across active farm batches"
            badge="SPOILAGE RISK"
          >
            <HorizontalBarList
              items={[
                {
                  label: "BATCH-OKR-04 (Okra)",
                  value: 82,
                  secondary: "5d shelf life · High urgency",
                  color: "#F87171",
                },
                {
                  label: "BATCH-BAN-02 (Bananas)",
                  value: 68,
                  secondary: "AP1025 excursion watch",
                  color: "#F59E0B",
                },
                {
                  label: "BATCH-TOM-01 (Tomatoes)",
                  value: 28,
                  secondary: "4.2°C optimal",
                  color: "#22C55E",
                },
                {
                  label: "BATCH-GRP-03 (Grapes)",
                  value: 18,
                  secondary: "1.8°C pre-cooled",
                  color: "#22C55E",
                },
              ]}
              unit="%"
            />
          </ChartCard>
        </div>
      </div>

      {/* Visualization 10: Active Shipments Route Preview Map */}
      <ChartCard
        title="10. Active Farm Outbound Shipments Corridor Map"
        subtitle="Track produce leaving Nashik, Sangli, and Satara toward Pune & Mumbai buyers"
        badge="CORRIDOR MAP"
        rightSlot={
          <Link
            to="/farmer/shipments"
            className="text-xs font-semibold text-green-400 hover:underline inline-flex items-center gap-1"
          >
            <Sprout className="w-3.5 h-3.5" /> Manage Outbound Loads
          </Link>
        }
      >
        <ShipmentMap compact />
      </ChartCard>
    </div>
  );
}