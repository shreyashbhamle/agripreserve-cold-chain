import { useEffect, useState } from "react";
import { IndianRupee, TrendingUp, Wallet } from "lucide-react";
import {
  agriApi,
  downloadCsv,
  type MarketPriceRecord,
  type OrderSaleRecord,
} from "../../services/api";
import {
  ChartCard,
  DataSourceBanner,
  ExportButton,
  PageHeader,
  StatusBadge,
} from "../../components/ui/SharedComponents";
import { MultiLineChart } from "../../components/charts/AgriCharts";

export default function Sales() {
  const [orders, setOrders] = useState<OrderSaleRecord[]>([]);
  const [prices, setPrices] = useState<MarketPriceRecord[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState("Tomatoes");

  useEffect(() => {
    agriApi.orders().then(setOrders).catch(() => {});
    agriApi
      .marketPrices()
      .then((res) => setPrices(res.items ?? []))
      .catch(() => {});
  }, []);

  const filteredPrices = prices.filter(
    (p) => !selectedCommodity || p.commodity === selectedCommodity,
  );

  const grossTotal = orders.reduce(
    (acc, o) => acc + Number(o.gross_amount_inr || 0),
    0,
  );
  const netTotal = orders.reduce(
    (acc, o) => acc + Number(o.net_payout_inr || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        role="farmer"
        eyebrow="MANDI BENCHMARKS & BUYER SETTLEMENTS"
        title="Produce Sales, Buyer Invoices & Daily Mandi Price Comparison"
        description="Compare contracted buyer rates against regional mandi prices from datasets/synthetic/market_prices_demo.csv and monitor net payouts."
        actions={
          <ExportButton
            label="Export Sales CSV"
            onClick={() =>
              downloadCsv(
                "agripreserve_farmer_sales.csv",
                orders as unknown as Array<Record<string, unknown>>,
              )
            }
          />
        }
      />

      <DataSourceBanner
        mode="SYNTHETIC DEMO MANDI PRICES"
        note="Daily mandi prices below are loaded from datasets/synthetic/market_prices_demo.csv for demonstration and are not live government commodity exchange feeds."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9AA7BA]">Gross Contracted Sales</p>
            <p className="mt-1 text-2xl font-bold text-[#F1F5F9]">
              ₹{grossTotal.toLocaleString()}
            </p>
          </div>
          <IndianRupee className="w-5 h-5 text-green-400" />
        </div>
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9AA7BA]">
              Net Producer Payout (After Cold Logistics)
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">
              ₹{netTotal.toLocaleString()}
            </p>
          </div>
          <Wallet className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9AA7BA]">Avg Quality Premium vs Mandi</p>
            <p className="mt-1 text-2xl font-bold text-sky-400">+6.4%</p>
          </div>
          <TrendingUp className="w-5 h-5 text-sky-400" />
        </div>
      </div>

      {/* Mandi Price Chart */}
      <ChartCard
        title="Mandi Modal vs Min/Max Price Trajectory (₹/kg)"
        subtitle="Synthetic market benchmark series from market_prices_demo.csv"
        badge="SYNTHETIC MANDI"
        rightSlot={
          <select
            value={selectedCommodity}
            onChange={(e) => setSelectedCommodity(e.target.value)}
            className="rounded-xl bg-[#11151D] border border-[#303846] px-3 py-1.5 text-xs text-[#F1F5F9]"
            aria-label="Select commodity for mandi chart"
          >
            {["Tomatoes", "Bananas", "Onions", "Grapes", "Okra", "Potatoes"].map(
              (c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ),
            )}
          </select>
        }
      >
        <MultiLineChart
          labels={filteredPrices.map((p) => p.date.slice(5))}
          series={[
            {
              name: "Modal Price (₹/kg)",
              color: "#22C55E",
              values: filteredPrices.map((p) => p.modal_price_inr_per_kg),
            },
            {
              name: "Max Price (₹/kg)",
              color: "#38BDF8",
              values: filteredPrices.map((p) => p.max_price_inr_per_kg),
            },
            {
              name: "Min Price (₹/kg)",
              color: "#F59E0B",
              values: filteredPrices.map((p) => p.min_price_inr_per_kg),
            },
          ]}
          unit=" ₹"
          area
        />
      </ChartCard>

      {/* Sales Table */}
      <div className="rounded-2xl border border-[#303846] bg-[#171B24] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#303846] bg-[#11151D] text-[#9AA7BA]">
                <th className="py-3.5 px-4">Order &amp; Invoice</th>
                <th className="py-3.5 px-4">Buyer / Receiver</th>
                <th className="py-3.5 px-4">Crop &amp; Qty</th>
                <th className="py-3.5 px-4">Agreed vs Mandi Rate</th>
                <th className="py-3.5 px-4">Gross / Net Payout</th>
                <th className="py-3.5 px-4">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#303846]/60">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#1D2330]/60 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#F1F5F9]">{o.id}</p>
                    <p className="text-[11px] font-mono text-[#9AA7BA]">
                      {o.invoice_number} · Ship: {o.shipment_id}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-[#F1F5F9] font-medium">
                    {o.buyer_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-[#F1F5F9]">{o.product}</p>
                    <p className="text-[#9AA7BA]">{o.quantity_kg} kg</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-green-400 font-bold">
                      ₹{o.agreed_price_per_kg_inr}/kg Agreed
                    </p>
                    <p className="text-[11px] text-[#9AA7BA]">
                      Mandi Demo: ₹{o.market_benchmark_per_kg_inr}/kg
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#F1F5F9]">
                      Net: ₹{Number(o.net_payout_inr).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-[#9AA7BA]">
                      Gross: ₹{Number(o.gross_amount_inr).toLocaleString()}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={o.payment_status} />
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