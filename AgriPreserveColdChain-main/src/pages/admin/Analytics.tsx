import { useEffect, useState } from "react";
import {
  agriApi,
  agriIntelligenceApi,
  downloadCsv,
} from "../../services/api";
import {
  ChartCard,
  DataSourceBanner,
  ExportButton,
  PageHeader,
} from "../../components/ui/SharedComponents";
import {
  BarChartVertical,
  DonutChart,
  HorizontalBarList,
  MultiLineChart,
  StackedBarChart,
} from "../../components/charts/AgriCharts";

export default function Analytics() {
  const [riskItems, setRiskItems] = useState<Array<Record<string, any>>>([]);
  const [forecast, setForecast] = useState<Record<string, any> | null>(null);
  const [commodity, setCommodity] = useState("Tomatoes");

  useEffect(() => {
    agriIntelligenceApi
      .riskRanking()
      .then((res) => setRiskItems(res.items ?? []))
      .catch(() => {});
    agriApi.shipments().catch(() => {});
  }, []);

  useEffect(() => {
    agriIntelligenceApi
      .demandForecast(commodity, 7)
      .then(setForecast)
      .catch(() => {});
  }, [commodity]);

  return (
    <div className="space-y-6">
      <PageHeader
        role="admin"
        eyebrow="DEEP-DIVE ANALYTICS & FORECASTING"
        title="Cold-Chain Performance, Spoilage Risk & Corridor Efficiency"
        description="Multi-dimensional analysis of thermal excursion drivers, route transit efficiency, cold-room utilization, and time-aware commodity demand."
        actions={
          <ExportButton
            label="Export Risk Analytics CSV"
            onClick={() =>
              downloadCsv("agripreserve_risk_analytics.csv", riskItems)
            }
          />
        }
      />

      <DataSourceBanner />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ChartCard
            title="Time-Series Commodity Demand Forecast (Historical vs Holdout vs 7-Day Forecast)"
            subtitle={
              forecast?.evaluation
                ? `Holdout MAE: ${forecast.evaluation.mae_kg} kg · RMSE: ${forecast.evaluation.rmse_kg} kg (${forecast.evaluation.split_method})`
                : "Chronological train/holdout split with uncertainty intervals"
            }
            badge="TIME-SERIES ML"
            rightSlot={
              <select
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                className="rounded-xl bg-[#11151D] border border-[#303846] px-2.5 py-1.5 text-xs text-[#F1F5F9]"
                aria-label="Select commodity for forecast"
              >
                {[
                  "Tomatoes",
                  "Bananas",
                  "Onions",
                  "Grapes",
                  "Okra",
                  "Potatoes",
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            }
          >
            <MultiLineChart
              labels={
                forecast?.forecast?.map((f: any) => f.date.slice(5)) ?? [
                  "D+1",
                  "D+2",
                  "D+3",
                  "D+4",
                  "D+5",
                  "D+6",
                  "D+7",
                ]
              }
              series={[
                {
                  name: "Predicted Demand (kg)",
                  color: "#10B981",
                  values:
                    forecast?.forecast?.map((f: any) => f.predicted_kg) ?? [
                      1420, 1480, 1510, 1460, 1550, 1610, 1590,
                    ],
                },
                {
                  name: "Upper 90% Band (kg)",
                  color: "#38BDF8",
                  values:
                    forecast?.forecast?.map((f: any) => f.upper_band_kg) ?? [
                      1580, 1640, 1680, 1620, 1710, 1780, 1760,
                    ],
                },
                {
                  name: "Lower 90% Band (kg)",
                  color: "#A78BFA",
                  values:
                    forecast?.forecast?.map((f: any) => f.lower_band_kg) ?? [
                      1260, 1320, 1340, 1300, 1390, 1440, 1420,
                    ],
                },
              ]}
              unit=" kg"
              area
            />
          </ChartCard>
        </div>

        <div className="lg:col-span-5">
          <ChartCard
            title="Spoilage Probability by Active Shipment"
            subtitle="Composite risk score (0–100) from thermal excursions & door state"
            badge="RISK ENGINE"
          >
            <HorizontalBarList
              items={
                riskItems.length > 0
                  ? riskItems.map((r) => ({
                      label: `${r.shipment_id} · ${r.product}`,
                      value: Number(r.risk_score),
                      secondary: `${r.temperature_c}°C · ${r.risk_level}`,
                    }))
                  : [
                      {
                        label: "AP1028 · Okra",
                        value: 88,
                        secondary: "11.4°C · High",
                      },
                      {
                        label: "AP1025 · Bananas",
                        value: 84,
                        secondary: "9.3°C · High",
                      },
                      {
                        label: "AP1026 · Onions",
                        value: 46,
                        secondary: "5.2°C · Medium",
                      },
                      {
                        label: "AP1024 · Tomatoes",
                        value: 22,
                        secondary: "4.6°C · Low",
                      },
                    ]
              }
              unit=" pts"
              max={100}
            />
          </ChartCard>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <ChartCard
          title="Corridor Route Efficiency (Avg Transit Hours)"
          subtitle="Benchmark vs actual transit duration across Maharashtra routes"
          badge="CORRIDOR SLA"
        >
          <BarChartVertical
            items={[
              {
                label: "Nashik→Pune",
                value: 5.4,
                subtitle: "Target: 5.0h",
                color: "#10B981",
              },
              {
                label: "Nashik→Mumbai",
                value: 4.8,
                subtitle: "Target: 4.5h",
                color: "#38BDF8",
              },
              {
                label: "Pune→Mumbai",
                value: 3.6,
                subtitle: "Target: 3.5h",
                color: "#10B981",
              },
              {
                label: "Solapur→Mumbai",
                value: 8.9,
                subtitle: "Delayed (AP1028)",
                color: "#F87171",
              },
            ]}
            unit="h"
          />
        </ChartCard>

        <ChartCard
          title="Root Causes of Cold-Chain Exceptions"
          subtitle="Distribution of telemetry anomalies in synthetic dataset"
          badge="ROOT CAUSE"
        >
          <DonutChart
            centerTitle="Exceptions"
            centerValue="14"
            segments={[
              { label: "Cargo Door Left Open", value: 6, color: "#F87171" },
              { label: "Evaporator Airflow Drift", value: 4, color: "#F59E0B" },
              { label: "Highway Traffic Delay", value: 3, color: "#38BDF8" },
              { label: "Sensor Battery Low", value: 1, color: "#A78BFA" },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Sensor Fleet Reliability by Corridor Segment"
          subtitle="Packet delivery vs delayed/missing heartbeats"
          badge="IOT HEALTH"
        >
          <StackedBarChart
            rows={[
              {
                label: "Nashik Packhouse Gateway",
                segments: [
                  { name: "On-Time", value: 96, color: "#10B981" },
                  { name: "Delayed", value: 4, color: "#F59E0B" },
                ],
              },
              {
                label: "Kasara Ghat Highway",
                segments: [
                  { name: "On-Time", value: 84, color: "#10B981" },
                  { name: "Delayed", value: 16, color: "#F87171" },
                ],
              },
              {
                label: "Pune–Mumbai Expressway",
                segments: [
                  { name: "On-Time", value: 94, color: "#10B981" },
                  { name: "Delayed", value: 6, color: "#F59E0B" },
                ],
              },
            ]}
          />
        </ChartCard>
      </div>
    </div>
  );
}