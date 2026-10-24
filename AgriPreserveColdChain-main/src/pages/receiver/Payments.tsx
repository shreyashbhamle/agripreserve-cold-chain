import { useEffect, useState } from "react";
import { CheckCircle2, IndianRupee, Wallet } from "lucide-react";
import {
  agriApi,
  downloadCsv,
  type OrderSaleRecord,
} from "../../services/api";
import {
  DataSourceBanner,
  ExportButton,
  PageHeader,
  StatusBadge,
} from "../../components/ui/SharedComponents";
import { useAuth } from "../../context/AuthContext";

const PAYMENT_STATUSES = ["Paid", "Pending", "On Hold", "Disputed"];

export default function Payments() {
  const { notify } = useAuth();
  const [orders, setOrders] = useState<OrderSaleRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  const loadOrders = () => {
    agriApi
      .orders(statusFilter)
      .then(setOrders)
      .catch(() => {});
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleUpdatePayment = async (orderId: string, nextStatus: string) => {
    try {
      await agriApi.updateOrderStatus(orderId, {
        payment_status: nextStatus,
        payment_method: "NEFT / RTGS Settlement (Demo)",
      });
      notify(
        `Invoice ${orderId} Updated`,
        `Payment status marked as ${nextStatus} in SQLite.`,
        "success",
      );
      loadOrders();
    } catch (err) {
      notify(
        "Update failed",
        err instanceof Error ? err.message : "Error",
        "error",
      );
    }
  };

  const paidTotal = orders
    .filter((o) => o.payment_status === "Paid")
    .reduce((acc, o) => acc + Number(o.gross_amount_inr || 0), 0);
  const pendingTotal = orders
    .filter((o) => o.payment_status !== "Paid")
    .reduce((acc, o) => acc + Number(o.gross_amount_inr || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        role="receiver"
        eyebrow="SUPPLIER SETTLEMENTS & INVOICE LEDGER"
        title="Supplier Invoices & Payment Status Management"
        description="Track supplier invoices linked to incoming shipments and quality inspection outcomes. Record payment status transitions in SQLite."
        dataMode="DEMO SETTLEMENT LEDGER"
        actions={
          <>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-xs text-[#F1F5F9]"
              aria-label="Filter payment status"
            >
              <option value="">All Payment Statuses</option>
              {PAYMENT_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <ExportButton
              label="Export Invoices CSV"
              onClick={() =>
                downloadCsv(
                  "agripreserve_supplier_invoices.csv",
                  orders as unknown as Array<Record<string, unknown>>,
                )
              }
            />
          </>
        }
      />

      <DataSourceBanner
        mode="SYNTHETIC INVOICE RECORDS"
        note="Payment status updates persist to the local SQLite orders_sales table for workflow demonstration. No live banking or UPI gateway is invoked."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9AA7BA]">Settled Invoices (Paid)</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">
              ₹{paidTotal.toLocaleString()}
            </p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9AA7BA]">
              Pending / On-Hold Supplier Invoices
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-400">
              ₹{pendingTotal.toLocaleString()}
            </p>
          </div>
          <Wallet className="w-5 h-5 text-amber-400" />
        </div>
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9AA7BA]">Total Tracked Invoices</p>
            <p className="mt-1 text-2xl font-bold text-[#F1F5F9]">
              {orders.length}
            </p>
          </div>
          <IndianRupee className="w-5 h-5 text-violet-400" />
        </div>
      </div>

      <div className="rounded-2xl border border-[#303846] bg-[#171B24] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#303846] bg-[#11151D] text-[#9AA7BA]">
                <th className="py-3.5 px-4">Invoice &amp; Shipment</th>
                <th className="py-3.5 px-4">Supplier Farmer</th>
                <th className="py-3.5 px-4">Commodity &amp; Qty</th>
                <th className="py-3.5 px-4">Amount Due</th>
                <th className="py-3.5 px-4">Due Date &amp; Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Update Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#303846]/60">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#1D2330]/60 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#F1F5F9]">
                      {o.invoice_number}
                    </p>
                    <p className="text-[11px] font-mono text-[#9AA7BA]">
                      {o.id} · Ship: {o.shipment_id}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#F1F5F9]">
                    {o.farmer_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-[#F1F5F9]">{o.product}</p>
                    <p className="text-[#9AA7BA]">
                      {o.quantity_kg} kg @ ₹{o.agreed_price_per_kg_inr}/kg
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#F1F5F9]">
                    ₹{Number(o.gross_amount_inr).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-[#9AA7BA]">
                    <p>Due: {o.due_date}</p>
                    <p className="text-[11px]">{o.payment_method}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={o.payment_status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <select
                      value={o.payment_status}
                      onChange={(e) =>
                        handleUpdatePayment(o.id, e.target.value)
                      }
                      className="rounded-lg bg-[#11151D] border border-[#303846] px-2.5 py-1.5 text-xs text-[#F1F5F9]"
                      aria-label={`Change payment status for ${o.invoice_number}`}
                    >
                      {PAYMENT_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
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