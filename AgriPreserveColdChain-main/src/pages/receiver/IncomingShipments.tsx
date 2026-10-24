import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Globe,
  MapPin,
  PauseCircle,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import {
  agriApi,
  downloadCsv,
  type ProduceItemRecord,
  type ShipmentRecord,
} from "../../services/api";
import {
  ChartCard,
  ExportButton,
  FilterToolbar,
  PageHeader,
  StatusBadge,
} from "../../components/ui/SharedComponents";
import { useAuth } from "../../context/AuthContext";

export default function IncomingShipments() {
  const { user, notify } = useAuth();
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [produceCatalog, setProduceCatalog] = useState<ProduceItemRecord[]>([]);
  const [claims, setClaims] = useState<Array<Record<string, any>>>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // International Quotation Request Builder
  const [quoteForm, setQuoteForm] = useState({
    produce_id: "PRD-INTL-01",
    product: "Export Alphonso & Kesar Mangoes",
    quantity_kg: 6000,
    unit_price_inr: 165,
    currency: "AED",
    incoterm: "CIF",
    incoterm_named_place: "Jebel Ali Port (AEJEA), Dubai, UAE",
    transport_mode: "Sea",
    origin_country: "India",
    destination_country: "United Arab Emirates",
    payment_terms: "Letter of Credit (LC at Sight) · 30% Advance",
  });

  // Claim / Discrepancy Form
  const [claimForm, setClaimForm] = useState({
    shipment_id: "AP1025",
    claim_type: "Thermal Excursion & Partial Spoilage",
    claimed_qty_kg: 180,
    claimed_amount_inr: 12600,
    currency: "INR",
    evidence_summary:
      "Pulp temp measured at 8.9°C on arrival dock; 180 kg boxes showed premature ripening.",
  });

  const loadAll = () => {
    agriApi
      .shipments(search, statusFilter)
      .then(setShipments)
      .catch(() => {});
    agriApi
      .produce()
      .then(setProduceCatalog)
      .catch(() => {});
    agriApi
      .claims()
      .then(setClaims)
      .catch(() => {});
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const handleDockDecision = async (id: string, nextStatus: string) => {
    try {
      await agriApi.updateShipmentStatus(id, {
        status: nextStatus,
        location: "Receiving Dock",
        notes: `Receiver (${user?.name ?? "FreshMart"}) set status to ${nextStatus}`,
        actor_name: user?.name ?? "FreshMart Receiver",
        actor_role: "receiver",
      });
      notify(
        `Shipment ${id} Updated`,
        `Receiving decision recorded: ${nextStatus}.`,
        "success",
      );
      loadAll();
    } catch (err) {
      notify(
        "Update failed",
        err instanceof Error ? err.message : "Error",
        "error",
      );
    }
  };

  const handleRequestQuote = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const created = await agriApi.createQuotation({
        ...quoteForm,
        buyer_name: user?.name ?? "Al Maya / FreshMart Retail",
        buyer_email: user?.email ?? "receiver@agripreserve.com",
      });
      notify(
        "Quotation & Incoterm Contract Created",
        `Quote ${created.id} (${quoteForm.incoterm} ${quoteForm.incoterm_named_place}) submitted to Producer & Admin.`,
        "success",
      );
    } catch (err) {
      notify(
        "Incoterm / Quotation Validation Error",
        err instanceof Error ? err.message : "Error",
        "error",
      );
    }
  };

  const handleFileClaim = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const created = await agriApi.createClaim({
        ...claimForm,
        claimant_name: user?.name ?? "FreshMart Receiver",
      });
      notify(
        "Quality Discrepancy Claim Filed",
        `Claim ${created.id} filed for ${claimForm.shipment_id}. Shipment transitioned to Disputed until resolved.`,
        "warning",
      );
      loadAll();
    } catch (err) {
      notify(
        "Could not file claim",
        err instanceof Error ? err.message : "Error",
        "error",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        role="receiver"
        eyebrow="INBOUND ARRIVALS, GLOBAL PROCUREMENT & CLAIMS"
        title="Incoming Shipments, Incoterms® 2020 Marketplace & Discrepancy Claims"
        description="Browse verified export/domestic harvest batches, place Incoterm-validated purchase quotations, track customs status, and file receiving claims."
        actions={
          <ExportButton
            label="Export Arrivals CSV"
            onClick={() =>
              downloadCsv(
                "agripreserve_incoming_shipments.csv",
                shipments as unknown as Array<Record<string, unknown>>,
              )
            }
          />
        }
      />

      {/* Marketplace Quotation Builder + Claim Filing */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ChartCard
            title="Verified Produce Marketplace & Incoterms® 2020 Quotation Builder"
            subtitle="Validates transport mode against Incoterm rules (e.g., FAS/FOB/CFR/CIF restricted to Sea/Waterway)"
            badge="MARKETPLACE"
          >
            <form onSubmit={handleRequestQuote} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <label className="space-y-1 block col-span-2">
                  <span className="text-[#9AA7BA]">
                    Select Verified Harvest Batch
                  </span>
                  <select
                    value={quoteForm.produce_id}
                    onChange={(e) => {
                      const found = produceCatalog.find(
                        (p) => p.id === e.target.value,
                      );
                      setQuoteForm({
                        ...quoteForm,
                        produce_id: e.target.value,
                        product: found ? found.crop_name : quoteForm.product,
                        unit_price_inr: found
                          ? found.unit_price_inr
                          : quoteForm.unit_price_inr,
                      });
                    }}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-1.5 text-white"
                  >
                    {produceCatalog.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} · {p.crop_name} ({p.available_kg} kg avail @ ₹
                        {p.unit_price_inr}/kg)
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Order Quantity (kg)</span>
                  <input
                    type="number"
                    required
                    value={quoteForm.quantity_kg}
                    onChange={(e) =>
                      setQuoteForm({
                        ...quoteForm,
                        quantity_kg: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-1.5 text-white"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Incoterm® 2020</span>
                  <select
                    value={quoteForm.incoterm}
                    onChange={(e) =>
                      setQuoteForm({ ...quoteForm, incoterm: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-1.5 text-white"
                  >
                    {[
                      "EXW",
                      "FCA",
                      "CPT",
                      "CIP",
                      "DAP",
                      "DPU",
                      "DDP",
                      "FAS",
                      "FOB",
                      "CFR",
                      "CIF",
                    ].map((inc) => (
                      <option key={inc} value={inc}>
                        {inc}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Transport Mode</span>
                  <select
                    value={quoteForm.transport_mode}
                    onChange={(e) =>
                      setQuoteForm({
                        ...quoteForm,
                        transport_mode: e.target.value,
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-1.5 text-white"
                  >
                    <option value="Sea">Sea CA Reefer</option>
                    <option value="Multimodal">
                      Multimodal (Road + Sea + Road)
                    </option>
                    <option value="Air">Air Cargo ULD</option>
                    <option value="Road">Road Reefer</option>
                  </select>
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Destination Country</span>
                  <select
                    value={quoteForm.destination_country}
                    onChange={(e) =>
                      setQuoteForm({
                        ...quoteForm,
                        destination_country: e.target.value,
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-1.5 text-white"
                  >
                    <option value="United Arab Emirates">
                      United Arab Emirates (CEPA 0% Duty)
                    </option>
                    <option value="Netherlands">
                      Netherlands / EU (TARIC)
                    </option>
                    <option value="United Kingdom">
                      United Kingdom (DCTS)
                    </option>
                    <option value="India">India (Domestic)</option>
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#303846] bg-[#11151D] px-3 py-2">
                <span className="text-[#9AA7BA]">
                  Est. FOB Value:{" "}
                  <b className="text-emerald-400">
                    ₹
                    {(
                      quoteForm.quantity_kg * quoteForm.unit_price_inr
                    ).toLocaleString("en-IN")}
                  </b>{" "}
                  · Named Place:{" "}
                  <b className="text-sky-300">
                    {quoteForm.incoterm_named_place}
                  </b>
                </span>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500 hover:bg-violet-400 px-4 py-1.5 font-bold text-slate-950 transition"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Submit Purchase
                  Quotation
                </button>
              </div>
            </form>
          </ChartCard>
        </div>

        <div className="lg:col-span-5">
          <ChartCard
            title="Report Quality Discrepancy / File Claim"
            subtitle="Places shipment in Disputed state and blocks premature closure"
            badge={`${claims.length} CLAIMS`}
          >
            <form onSubmit={handleFileClaim} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Shipment ID</span>
                  <select
                    value={claimForm.shipment_id}
                    onChange={(e) =>
                      setClaimForm({
                        ...claimForm,
                        shipment_id: e.target.value,
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-2.5 py-1.5 text-white"
                  >
                    {shipments.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id} · {s.product}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Claim Amount (INR)</span>
                  <input
                    type="number"
                    required
                    value={claimForm.claimed_amount_inr}
                    onChange={(e) =>
                      setClaimForm({
                        ...claimForm,
                        claimed_amount_inr: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-2.5 py-1.5 text-white"
                  />
                </label>
              </div>
              <label className="space-y-1 block">
                <span className="text-[#9AA7BA]">
                  Discrepancy Evidence &amp; Thermal Log Reference
                </span>
                <input
                  type="text"
                  required
                  value={claimForm.evidence_summary}
                  onChange={(e) =>
                    setClaimForm({
                      ...claimForm,
                      evidence_summary: e.target.value,
                    })
                  }
                  className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-2.5 py-1.5 text-white"
                />
              </label>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-3 py-2 font-bold text-slate-950 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> File Official Claim
                &amp; Flag Disputed
              </button>
            </form>
          </ChartCard>
        </div>
      </div>

      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by shipment ID (AP-INTL-2026, AP1024), crop, supplier farmer, or driver..."
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-xs text-[#F1F5F9]"
            aria-label="Filter incoming status"
          >
            <option value="">All Statuses</option>
            <option value="Customs Clearance">Customs Clearance</option>
            <option value="In Transit">In Transit</option>
            <option value="At Risk">At Risk</option>
            <option value="Delayed">Delayed</option>
            <option value="Delivered">Delivered</option>
            <option value="Disputed">Disputed</option>
          </select>
        }
      />

      <div className="rounded-2xl border border-[#303846] bg-[#171B24] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#303846] bg-[#11151D] text-[#9AA7BA]">
                <th className="py-3.5 px-4">Shipment &amp; ETA</th>
                <th className="py-3.5 px-4">Produce &amp; Quantity</th>
                <th className="py-3.5 px-4">Mode &amp; Incoterm</th>
                <th className="py-3.5 px-4">Route &amp; Customs</th>
                <th className="py-3.5 px-4">Arrival Temp / RH</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Dock Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#303846]/60">
              {shipments.map((s) => (
                <tr key={s.id} className="hover:bg-[#1D2330]/60 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#F1F5F9]">{s.id}</p>
                    <p className="text-[11px] text-[#9AA7BA]">ETA: {s.eta}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-[#F1F5F9]">{s.product}</p>
                    <p className="text-[#9AA7BA]">
                      {Number(s.quantity_kg).toLocaleString()} kg
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-sky-300 font-semibold">
                      {s.transport_mode || "Road Reefer"}
                    </p>
                    <p className="text-[#9AA7BA]">
                      Incoterm: <b>{s.incoterm || "CIP"}</b> ({s.currency || "INR"})
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[#F1F5F9]">
                      {s.is_international ? (
                        <Globe className="w-3 h-3 text-sky-400" />
                      ) : (
                        <MapPin className="w-3 h-3 text-violet-400" />
                      )}
                      {s.origin} → {s.destination}
                    </span>
                    {s.customs_status && (
                      <p className="text-[11px] text-amber-300 mt-0.5">
                        {s.customs_status}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span
                      className={
                        Number(s.temperature_c ?? 4) > 10
                          ? "text-rose-400 font-bold"
                          : "text-emerald-400 font-semibold"
                      }
                    >
                      {s.temperature_c ?? "--"}°C
                    </span>{" "}
                    · {s.humidity_pct ?? "--"}% RH
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                      <Link
                        to={`/receiver/quality?shipment=${s.id}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-violet-500 hover:bg-violet-400 px-2.5 py-1.5 text-xs font-bold text-slate-950 transition"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" /> Inspect
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDockDecision(s.id, "Delivered")}
                        className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 p-1.5 text-emerald-300"
                        title="Accept Delivery"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDockDecision(s.id, "Customs Hold")}
                        className="rounded-lg border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 p-1.5 text-amber-300"
                        title="Place on Quality / Customs Hold"
                      >
                        <PauseCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDockDecision(s.id, "Disputed")}
                        className="rounded-lg border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 p-1.5 text-rose-300"
                        title="Dispute Batch"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
