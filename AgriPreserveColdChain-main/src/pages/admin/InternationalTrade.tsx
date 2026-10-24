import React, { useEffect, useState } from "react";
import {
  Globe,
  ShieldCheck,
  FileCheck2,
  Calculator,
  Route,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Upload,
  DollarSign,
  Scale,
  RefreshCw,
  Download,
  Sparkles,
} from "lucide-react";
import { agriApi, downloadCsv, type ShipmentRecord } from "../../services/api";
import ShipmentMap from "../../components/maps/ShipmentMap";

type ActiveTab =
  | "customs"
  | "documents"
  | "landed_cost"
  | "routes"
  | "fleet_partners";

export default function InternationalTrade() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("customs");
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [selectedShipmentId, setSelectedShipmentId] =
    useState<string>("AP-INTL-2026");
  const [reference, setReference] = useState<Record<string, any>>({});
  const [customsData, setCustomsData] = useState<Record<string, any> | null>(
    null,
  );
  const [documents, setDocuments] = useState<Array<Record<string, any>>>([]);
  const [landedCost, setLandedCost] = useState<Record<string, any> | null>(
    null,
  );
  const [legs, setLegs] = useState<Array<Record<string, any>>>([]);
  const [routeOptimization, setRouteOptimization] = useState<Record<
    string,
    any
  > | null>(null);
  const [fleet, setFleet] = useState<Array<Record<string, any>>>([]);
  const [organizations, setOrganizations] = useState<
    Array<Record<string, any>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Interactive Customs Calculator Form State
  const [calcForm, setCalcForm] = useState({
    corridor_code: "IN-AE",
    hs_code: "0804.50.20",
    fob_value_inr: 1980000,
    freight_inr: 168000,
    insurance_inr: 14500,
    preferential_agreement: true,
    clearance_fee_inr: 18500,
    inspection_fee_inr: 9200,
    port_handling_inr: 24000,
    demurrage_inr: 0,
    broker_fee_inr: 12500,
    export_duty_rate_pct: 0,
    is_broker_verified: true,
  });
  const [calcResult, setCalcResult] = useState<Record<string, any> | null>(
    null,
  );

  // Document Upload Form State
  const [docForm, setDocForm] = useState({
    doc_type: "Phytosanitary Certificate",
    doc_number: "PHY-IN-2026-9920",
    issuing_authority: "NPPO / Plant Quarantine Station Mumbai",
    issue_date: "2026-10-20",
    expiry_date: "2026-11-20",
    notes: "Hot-water treatment & pest-free inspection certificate",
  });

  // Add Cost Item State
  const [costForm, setCostForm] = useState({
    cost_category: "Destination Charges",
    description: "Jebel Ali Port Reefer Plug-In & Monitoring",
    amount_inr: 14500,
    currency: "AED",
    payable_by: "Buyer",
    payment_status: "Invoiced",
  });

  // Route Optimizer Constraint Form State
  const [routeParams, setRouteParams] = useState({
    origin: "Nashik Export Packhouse, India",
    destination: "Al Maya Cold Hub, Dubai, UAE",
    origin_country: "India",
    destination_country: "United Arab Emirates",
    cargo_weight_kg: 12000,
    requires_reefer: true,
    target_temp_c: 9.5,
    shelf_life_days: 21,
  });

  // New Fleet Asset Form State
  const [newAsset, setNewAsset] = useState({
    carrier_name: "DP World GCC Cold Express",
    mode: "Road",
    vehicle_Or_vessel_no: "DXB-REEFER-8841",
    container_id: "DPWU-CA-441920",
    reefer_capable: true,
    temp_min_c: -20,
    temp_max_c: 20,
    capacity_kg: 24000,
    gps_device_id: "TELE-DXB-884",
  });

  const loadAll = async (shipId: string) => {
    setLoading(true);
    try {
      const [
        shipList,
        refData,
        custResp,
        docList,
        landedResp,
        legList,
        routeResp,
        fleetList,
        orgList,
      ] = await Promise.all([
        agriApi.shipments(),
        agriApi.logisticsReference(),
        agriApi.customsForShipment(shipId),
        agriApi.tradeDocuments(shipId),
        agriApi.landedCost(shipId),
        agriApi.shipmentLegs(shipId),
        agriApi.optimizeRoutes({
          ...routeParams,
          origin_country: shipId.includes("INTL") ? "India" : "India",
          destination_country: shipId.includes("INTL")
            ? "United Arab Emirates"
            : "India",
        }),
        agriApi.fleet(),
        agriApi.organizations(),
      ]);
      setShipments(shipList);
      setReference(refData);
      setCustomsData(custResp);
      setCalcResult(custResp.live_assessment);
      setDocuments(docList);
      setLandedCost(landedResp);
      setLegs(legList);
      setRouteOptimization(routeResp);
      setFleet(fleetList);
      setOrganizations(orgList);
    } catch (err: any) {
      setBanner({
        type: "error",
        text: err?.message || "Failed to load international trade records.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll(selectedShipmentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShipmentId]);

  const handleRunCustomsCalculation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await agriApi.calculateCustoms(calcForm);
      setCalcResult(res);
      setBanner({
        type: "success",
        text: `Tariff & duty calculation updated (${res.corridor_name}) — Total Customs & Taxes: ₹${Number(res.total_customs_and_tax_inr).toLocaleString("en-IN")}`,
      });
    } catch (err: any) {
      setBanner({
        type: "error",
        text: err?.message || "Customs calculation failed.",
      });
    }
  };

  const handleUpdateCustomsStatus = async (
    importStatus: string,
    holdReason = "",
  ) => {
    if (!selectedShipmentId) return;
    try {
      await agriApi.updateCustomsStatus(selectedShipmentId, {
        clearance_status: importStatus,
        inspector_notes: holdReason,
      });
      setBanner({
        type: "success",
        text: `Import customs status updated: ${importStatus}`,
      });
      await loadAll(selectedShipmentId);
    } catch (err: any) {
      setBanner({
        type: "error",
        text: err?.message || "Could not update customs status.",
      });
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await agriApi.uploadTradeDocument({
        shipment_id: selectedShipmentId,
        ...docForm,
      });
      setBanner({
        type: "info",
        text: `Uploaded ${created.doc_type} (${created.doc_number}) v${created.version}. Status set to "${created.verification_status}" — awaiting legal/broker review.`,
      });
      const updatedDocs = await agriApi.tradeDocuments(selectedShipmentId);
      setDocuments(updatedDocs);
    } catch (err: any) {
      setBanner({
        type: "error",
        text: err?.message || "Document upload failed.",
      });
    }
  };

  const handleReviewDocument = async (
    docId: string,
    status: "Approved" | "Rejected" | "Revision Required",
  ) => {
    try {
      await agriApi.reviewTradeDocument(docId, {
        verification_status: status,
        notes: `Reviewed by Admin / Licensed Customs Broker (${status})`,
      });
      setBanner({
        type: "success",
        text: `Document ${docId} marked as ${status}.`,
      });
      const updatedDocs = await agriApi.tradeDocuments(selectedShipmentId);
      setDocuments(updatedDocs);
    } catch (err: any) {
      setBanner({
        type: "error",
        text: err?.message || "Document review update failed.",
      });
    }
  };

  const handleAddCostItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await agriApi.addCostItem({
        shipment_id: selectedShipmentId,
        ...costForm,
      });
      setBanner({
        type: "success",
        text: `Added ${costForm.cost_category} line item (₹${Number(costForm.amount_inr).toLocaleString("en-IN")}) and recalculated Total Landed Cost.`,
      });
      const updatedLanded = await agriApi.landedCost(selectedShipmentId);
      setLandedCost(updatedLanded);
    } catch (err: any) {
      setBanner({
        type: "error",
        text: err?.message || "Could not add cost item.",
      });
    }
  };

  const handleOptimizeRoutes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await agriApi.optimizeRoutes(routeParams);
      setRouteOptimization(res);
      setBanner({
        type: "success",
        text: `Evaluated ${res.alternatives?.length || 0} multimodal itineraries against shelf-life (${routeParams.shelf_life_days}d) & reefer (${routeParams.target_temp_c}°C) constraints.`,
      });
    } catch (err: any) {
      setBanner({
        type: "error",
        text: err?.message || "Route optimization failed.",
      });
    }
  };

  const handleCreateFleetAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await agriApi.createFleetAsset(newAsset);
      setBanner({
        type: "success",
        text: `Registered carrier asset ${newAsset.vehicle_Or_vessel_no} (${newAsset.mode}).`,
      });
      const list = await agriApi.fleet();
      setFleet(list);
    } catch (err: any) {
      setBanner({
        type: "error",
        text: err?.message || "Failed to add fleet asset.",
      });
    }
  };

  const decl = customsData?.declaration || {};
  const liveAssess = calcResult || customsData?.live_assessment || {};
  const incotermsMap = reference.incoterms_2020 || {};
  const docCatalog: string[] = reference.document_types_catalog || [];

  return (
    <div className="space-y-6 text-[#F1F5F9]">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#303846] bg-[#171B24] p-5 shadow-lg lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 border border-sky-500/40 px-3 py-1 text-xs font-bold text-sky-300">
              <Globe className="h-3.5 w-3.5" /> INTERNATIONAL TRADE &amp;
              MULTIMODAL LOGISTICS COMMAND
            </span>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
              Incoterms® 2020 · HS Tariff · 22-Doc Compliance · Landed Cost
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
            Customs Clearance, Trade Documentation, Landed Cost &amp; Global
            Routing
          </h1>
          <p className="mt-1 text-xs text-[#9AA7BA]">
            End-to-end cross-border agricultural supply chain governancefrom
            APEDA packhouse pre-cooling to destination customs release and
            multi-currency financial settlement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9AA7BA]">
              Active Consignment
            </label>
            <select
              value={selectedShipmentId}
              onChange={(e) => setSelectedShipmentId(e.target.value)}
              className="mt-1 rounded-xl border border-[#303846] bg-[#11151D] px-3 py-2 text-xs font-bold text-white focus:border-sky-500 focus:outline-none"
            >
              {shipments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} · {s.product} ({s.origin_country || "India"} →{" "}
                  {s.destination_country || "India"})
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => loadAll(selectedShipmentId)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[#303846] bg-[#1D2330] hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      {banner && (
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold ${
            banner.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : banner.type === "error"
                ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                : "border-sky-500/40 bg-sky-500/10 text-sky-200"
          }`}
        >
          <span>{banner.text}</span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="ml-4 text-xs underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#303846] pb-3">
        {[
          {
            id: "customs",
            label: "1. Customs & Tariff Engine",
            icon: ShieldCheck,
          },
          {
            id: "documents",
            label: `2. Trade Documents (${documents.length}/22 Catalog)`,
            icon: FileCheck2,
          },
          {
            id: "landed_cost",
            label: "3. Total Landed Cost & Incoterms 2020",
            icon: Calculator,
          },
          {
            id: "routes",
            label: "4. Multimodal Route Optimizer & Global Map",
            icon: Route,
          },
          {
            id: "fleet_partners",
            label: `5. Global Fleet (${fleet.length}) & Trade Partners (${organizations.length})`,
            icon: Truck,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                active
                  ? "bg-sky-500 text-slate-950 shadow-md"
                  : "border border-[#303846] bg-[#171B24] text-[#9AA7BA] hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-8 text-center text-sm text-[#9AA7BA]">
          Loading international trade &amp; customs telemetry for{" "}
          <b>{selectedShipmentId}</b>…
        </div>
      ) : null}

      {/* =================================================================== */}
      {/* TAB 1: CUSTOMS & TARIFF ENGINE                                      */}
      {/* =================================================================== */}
      {!loading && activeTab === "customs" && (
        <div className="space-y-6">
          {/* Top KPI Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4">
              <div className="text-[11px] font-bold uppercase text-[#9AA7BA]">
                HS Code &amp; Trade Corridor
              </div>
              <div className="mt-1 text-lg font-extrabold text-white">
                HS {decl.hs_code || "0804.50.20"}
              </div>
              <div className="mt-1 text-xs text-sky-300">
                {decl.origin_country || "India"} ({decl.export_port || "INNSA"})
                → {decl.destination_country || "UAE"} (
                {decl.import_port || "AEJEA"})
              </div>
            </div>

            <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4">
              <div className="text-[11px] font-bold uppercase text-[#9AA7BA]">
                CIF Customs Valuation Basis
              </div>
              <div className="mt-1 text-lg font-extrabold text-emerald-400">
                ₹
                {Number(
                  liveAssess.cif_value_inr || decl.customs_value_inr || 2162500,
                ).toLocaleString("en-IN")}
              </div>
              <div className="mt-1 text-xs text-[#9AA7BA]">
                AED{" "}
                {Number(liveAssess.cif_value_dest_currency || 0).toLocaleString(
                  "en-IN",
                )}{" "}
                · USD{" "}
                {Number(liveAssess.cif_value_usd || 0).toLocaleString("en-IN")}
              </div>
            </div>

            <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4">
              <div className="text-[11px] font-bold uppercase text-[#9AA7BA]">
                Duties, VAT &amp; Clearance Fees
              </div>
              <div className="mt-1 text-lg font-extrabold text-amber-300">
                ₹
                {Number(
                  liveAssess.total_customs_and_tax_inr || 172325,
                ).toLocaleString("en-IN")}
              </div>
              <div className="mt-1 text-xs text-[#9AA7BA]">
                Import Duty: {liveAssess.applied_import_duty_rate_pct ?? 0}% (
                {liveAssess.preferential_agreement_applied
                  ? "CEPA Preferential"
                  : "MFN Standard"}
                ) + VAT {liveAssess.import_vat_rate_pct ?? 5}%
              </div>
            </div>

            <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4">
              <div className="text-[11px] font-bold uppercase text-[#9AA7BA]">
                Verification &amp; Clearance Status
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                  Export: {decl.export_clearance_status || "Cleared (LEO)"}
                </span>
                <span className="rounded-full bg-amber-500/15 border border-amber-500/40 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                  Import: {decl.import_clearance_status || "Under Inspection"}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-sky-300">
                {liveAssess.verification_badge ||
                  "Official Broker-Verified Customs Record"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Declaration Record & Broker Actions */}
            <div className="lg:col-span-7 space-y-4 rounded-2xl border border-[#303846] bg-[#171B24] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#303846] pb-3">
                <div>
                  <h2 className="text-base font-bold text-white">
                    Customs Declaration Dossier ({decl.id || "CD-INTL-2026-01"})
                  </h2>
                  <p className="text-xs text-[#9AA7BA]">
                    Exporter of Record, Importer of Record, Licensed Customs
                    Broker &amp; Regulatory Inspection Controls
                  </p>
                </div>
                <span
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold ${
                    decl.broker_verified
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                  }`}
                >
                  {decl.broker_verified
                    ? "✓ Broker-Verified Official Record"
                    : "⚠ Platform Estimated Tariff Calculation"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                <div className="rounded-xl border border-[#303846] bg-[#11151D] p-3">
                  <div className="text-[#9AA7BA]">
                    Exporter of Record (Origin)
                  </div>
                  <div className="mt-0.5 font-bold text-white">
                    {decl.exporter_of_record ||
                      "Sahyadri Farmers Producer Co. Ltd (IEC: 0314098211)"}
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-300">
                    Origin Country of Goods:{" "}
                    {decl.country_of_origin_goods || "India (GI Nashik/Ratnagiri)"}
                  </div>
                </div>
                <div className="rounded-xl border border-[#303846] bg-[#11151D] p-3">
                  <div className="text-[#9AA7BA]">
                    Importer of Record (Destination)
                  </div>
                  <div className="mt-0.5 font-bold text-white">
                    {decl.importer_of_record ||
                      "Al Maya FreshMart Trading LLC Dubai (TRN: 100492819200003)"}
                  </div>
                  <div className="mt-1 text-[11px] text-sky-300">
                    Customs Broker:{" "}
                    {decl.customs_broker ||
                      "GulfBridge Customs & Forwarding LLC"}
                  </div>
                </div>
                <div className="rounded-xl border border-[#303846] bg-[#11151D] p-3">
                  <div className="text-[#9AA7BA]">
                    Commodity &amp; Tariff Schedule
                  </div>
                  <div className="mt-0.5 font-bold text-white">
                    {decl.product_description ||
                      "Fresh Export Alphonso & Kesar Mangoes (Mangifera indica)"}
                  </div>
                  <div className="mt-1 text-[11px] text-amber-300">
                    {decl.tariff_classification ||
                      "GCC Common Customs Tariff 0804.50.20 — India-UAE CEPA 0%"}
                  </div>
                </div>
                <div className="rounded-xl border border-[#303846] bg-[#11151D] p-3">
                  <div className="text-[#9AA7BA]">
                    Declared Weights, Currency &amp; Valuation Method
                  </div>
                  <div className="mt-0.5 font-bold text-white">
                    Net: {Number(decl.net_weight_kg || 12000).toLocaleString()}{" "}
                    kg · Gross:{" "}
                    {Number(decl.gross_weight_kg || 13200).toLocaleString()} kg
                  </div>
                  <div className="mt-1 text-[11px] text-[#9AA7BA]">
                    Valuation: {decl.valuation_method || "WTO Transaction Value (CIF)"} ·
                    FX: 1 {decl.currency || "AED"} = ₹
                    {decl.exchange_rate_to_inr || 22.85}
                  </div>
                </div>
              </div>

              {/* Regulatory & Biosecurity Hold / Release Controls */}
              <div className="rounded-xl border border-[#303846] bg-[#11151D] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-white">
                      Customs Clearance &amp; Biosecurity Release Actions (Admin
                      / Broker Only)
                    </div>
                    <p className="text-[11px] text-[#9AA7BA]">
                      Inspection Outcome:{" "}
                      <b className="text-slate-200">
                        {decl.inspection_outcome ||
                          "Phytosanitary & Dubai Municipality Sample Passed"}
                      </b>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateCustomsStatus("Cleared")
                      }
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Certify Import
                      Customs Cleared
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateCustomsStatus(
                          "Customs Hold",
                          "Random MOCCAE Pesticide & Cold-Treatment Log Verification Hold",
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-xl border border-amber-500/50 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" /> Place on Customs
                      Hold
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Tariff & Duty Calculator */}
            <form
              onSubmit={handleRunCustomsCalculation}
              className="lg:col-span-5 space-y-4 rounded-2xl border border-[#303846] bg-[#171B24] p-5"
            >
              <div className="flex items-center justify-between border-b border-[#303846] pb-3">
                <div>
                  <h2 className="text-base font-bold text-white">
                    Jurisdiction Tariff &amp; Duty Calculator
                  </h2>
                  <p className="text-xs text-[#9AA7BA]">
                    Simulate MFN vs Preferential FTA tariffs across global trade
                    corridors
                  </p>
                </div>
                <Scale className="h-5 w-5 text-sky-400" />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#9AA7BA]">
                    Trade Jurisdiction / Corridor Schedule
                  </label>
                  <select
                    value={calcForm.corridor_code}
                    onChange={(e) =>
                      setCalcForm({
                        ...calcForm,
                        corridor_code: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-3 py-2 text-xs text-white"
                  >
                    <option value="IN-AE">
                      India → UAE (CEPA 0% Preferential vs 5% GCC MFN + 5% UAE
                      VAT)
                    </option>
                    <option value="IN-EU">
                      India → European Union (EU TARIC 8% MFN + 7% Import VAT)
                    </option>
                    <option value="IN-UK">
                      India → United Kingdom (UK DCTS 0% Preferential vs 6% MFN)
                    </option>
                    <option value="IN-IN">
                      India Domestic Interstate (0% Customs / 0% Fresh Produce
                      GST)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#9AA7BA]">
                    FOB Product Value (INR)
                  </label>
                  <input
                    type="number"
                    value={calcForm.fob_value_inr}
                    onChange={(e) =>
                      setCalcForm({
                        ...calcForm,
                        fob_value_inr: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#9AA7BA]">
                    Intl Freight + Insurance (INR)
                  </label>
                  <input
                    type="number"
                    value={calcForm.freight_inr}
                    onChange={(e) =>
                      setCalcForm({
                        ...calcForm,
                        freight_inr: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#9AA7BA]">
                    Port Handling &amp; Clearance (INR)
                  </label>
                  <input
                    type="number"
                    value={calcForm.port_handling_inr}
                    onChange={(e) =>
                      setCalcForm({
                        ...calcForm,
                        port_handling_inr: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#9AA7BA]">
                    Demurrage / Detention (INR)
                  </label>
                  <input
                    type="number"
                    value={calcForm.demurrage_inr}
                    onChange={(e) =>
                      setCalcForm({
                        ...calcForm,
                        demurrage_inr: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                  <input
                    id="pref-fta"
                    type="checkbox"
                    checked={calcForm.preferential_agreement}
                    onChange={(e) =>
                      setCalcForm({
                        ...calcForm,
                        preferential_agreement: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-500"
                  />
                  <label
                    htmlFor="pref-fta"
                    className="text-xs font-semibold text-slate-200"
                  >
                    Apply Preferential Trade Agreement (Certificate of Origin
                    Verified)
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-sky-500 py-2 text-xs font-bold text-slate-950 hover:bg-sky-400 transition"
              >
                Calculate Customs Valuation, Duties &amp; Import VAT
              </button>

              {liveAssess && (
                <div className="rounded-xl border border-[#303846] bg-[#11151D] p-3 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#9AA7BA]">CIF Assessable Value:</span>
                    <span className="font-bold text-white">
                      ₹
                      {Number(liveAssess.cif_value_inr || 0).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9AA7BA]">
                      Import Duty ({liveAssess.applied_import_duty_rate_pct ?? 0}
                      %):
                    </span>
                    <span className="font-bold text-amber-300">
                      ₹
                      {Number(liveAssess.import_duty_inr || 0).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9AA7BA]">
                      Import VAT ({liveAssess.import_vat_rate_pct ?? 5}% on CIF +
                      Duty):
                    </span>
                    <span className="font-bold text-amber-300">
                      ₹
                      {Number(liveAssess.import_vat_inr || 0).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#303846] pt-1.5 text-sm">
                    <span className="font-bold text-sky-300">
                      Total Customs &amp; Taxes:
                    </span>
                    <span className="font-extrabold text-emerald-400">
                      ₹
                      {Number(
                        liveAssess.total_customs_and_tax_inr || 0,
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: 22-DOCUMENT TRADE COMPLIANCE & LEGAL APPROVAL WORKFLOW       */}
      {/* =================================================================== */}
      {!loading && activeTab === "documents" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-4 rounded-2xl border border-[#303846] bg-[#171B24] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#303846] pb-3">
              <div>
                <h2 className="text-base font-bold text-white">
                  Trade &amp; Regulatory Document Dossier ({selectedShipmentId})
                </h2>
                <p className="text-xs text-[#9AA7BA]">
                  Uploaded files never auto-approve legal compliance — Admin or
                  Licensed Broker verification is required.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    `trade_documents_${selectedShipmentId}.csv`,
                    documents,
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#303846] bg-[#11151D] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"
              >
                <Download className="h-3.5 w-3.5" /> Export Checklist CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#303846] text-[11px] uppercase text-[#9AA7BA]">
                    <th className="py-2.5 pr-3">Document Type</th>
                    <th className="py-2.5 px-3">Ref No &amp; Ver</th>
                    <th className="py-2.5 px-3">Issuing Authority</th>
                    <th className="py-2.5 px-3">Expiry</th>
                    <th className="py-2.5 px-3">Legal Status</th>
                    <th className="py-2.5 pl-3 text-right">Broker Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#303846]/60">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#11151D]/60">
                      <td className="py-3 pr-3 font-bold text-white">
                        {doc.doc_type}
                        {doc.mandatory ? (
                          <span className="ml-1.5 rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] text-sky-300">
                            Mandatory
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {doc.doc_number}{" "}
                        <span className="text-[#9AA7BA]">v{doc.version}</span>
                      </td>
                      <td className="py-3 px-3 text-[#9AA7BA]">
                        {doc.issuing_authority}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {doc.expiry_date || "Per Voyage"}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            doc.verification_status === "Approved"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : doc.verification_status === "Rejected"
                                ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                                : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {doc.verification_status}
                        </span>
                      </td>
                      <td className="py-3 pl-3 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleReviewDocument(String(doc.id), "Approved")
                          }
                          className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/30"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleReviewDocument(String(doc.id), "Rejected")
                          }
                          className="rounded-lg bg-rose-500/20 border border-rose-500/40 px-2 py-1 text-[11px] font-bold text-rose-300 hover:bg-rose-500/30"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upload New Trade Document Form */}
          <form
            onSubmit={handleUploadDocument}
            className="lg:col-span-4 space-y-4 rounded-2xl border border-[#303846] bg-[#171B24] p-5"
          >
            <div className="flex items-center justify-between border-b border-[#303846] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Upload Trade / Customs Document
                </h3>
                <p className="text-xs text-[#9AA7BA]">
                  Supports all 22 mandatory international trade document types
                </p>
              </div>
              <Upload className="h-5 w-5 text-emerald-400" />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#9AA7BA]">
                  Document Classification (22-Document Catalog)
                </label>
                <select
                  value={docForm.doc_type}
                  onChange={(e) =>
                    setDocForm({ ...docForm, doc_type: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-3 py-2 text-xs text-white"
                >
                  {(docCatalog.length
                    ? docCatalog
                    : [
                        "Commercial Invoice",
                        "Packing List",
                        "Certificate of Origin",
                        "Phytosanitary Certificate",
                        "Health & Sanitary Certificate",
                        "Quality & Laboratory Analysis Report",
                        "Fumigation / Pest-Control Certificate",
                        "Export License / Permit",
                        "Import Permit / NOC",
                        "Customs Declaration / Bill of Entry",
                        "Shipping Bill / Export Declaration",
                        "Bill of Lading / Sea Waybill",
                        "Air Waybill (AWB)",
                        "CMR / Road Consignment Note",
                        "Marine / Cargo Insurance Certificate",
                        "Cold-Chain Temperature Log",
                      ]
                  ).map((dt) => (
                    <option key={dt} value={dt}>
                      {dt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9AA7BA]">
                  Certificate / Reference Number
                </label>
                <input
                  type="text"
                  required
                  value={docForm.doc_number}
                  onChange={(e) =>
                    setDocForm({ ...docForm, doc_number: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9AA7BA]">
                  Issuing Authority / Agency
                </label>
                <input
                  type="text"
                  required
                  value={docForm.issuing_authority}
                  onChange={(e) =>
                    setDocForm({
                      ...docForm,
                      issuing_authority: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#9AA7BA]">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={docForm.issue_date}
                    onChange={(e) =>
                      setDocForm({ ...docForm, issue_date: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#9AA7BA]">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={docForm.expiry_date}
                    onChange={(e) =>
                      setDocForm({ ...docForm, expiry_date: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9AA7BA]">
                  Compliance Notes
                </label>
                <textarea
                  rows={2}
                  value={docForm.notes}
                  onChange={(e) =>
                    setDocForm({ ...docForm, notes: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] p-2.5 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-500 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
            >
              Submit Document for Legal &amp; Broker Review
            </button>
          </form>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: TOTAL LANDED COST & INCOTERMS 2020 ENGINE                    */}
      {/* =================================================================== */}
      {!loading && activeTab === "landed_cost" && landedCost && (
        <div className="space-y-6">
          {/* Landed Cost KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4">
              <div className="text-[11px] font-bold uppercase text-[#9AA7BA]">
                Total Landed Cost (All-Inclusive)
              </div>
              <div className="mt-1 text-xl font-extrabold text-emerald-400">
                ₹
                {Number(landedCost.total_landed_cost_inr || 0).toLocaleString(
                  "en-IN",
                )}
              </div>
              <div className="mt-1 text-xs text-sky-300">
                AED{" "}
                {Number(landedCost.multi_currency?.AED || 0).toLocaleString(
                  "en-IN",
                )}{" "}
                · USD{" "}
                {Number(landedCost.multi_currency?.USD || 0).toLocaleString(
                  "en-IN",
                )}{" "}
                · EUR{" "}
                {Number(landedCost.multi_currency?.EUR || 0).toLocaleString(
                  "en-IN",
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4">
              <div className="text-[11px] font-bold uppercase text-[#9AA7BA]">
                Unit Landed Cost (Per kg &amp; Carton)
              </div>
              <div className="mt-1 text-xl font-extrabold text-white">
                ₹{landedCost.landed_cost_per_kg_inr}/kg
              </div>
              <div className="mt-1 text-xs text-[#9AA7BA]">
                ₹{landedCost.landed_cost_per_package_inr} per 5 kg export carton
                ({landedCost.package_count} cartons)
              </div>
            </div>

            <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4">
              <div className="text-[11px] font-bold uppercase text-[#9AA7BA]">
                Incoterm® 2020 Cost Allocation ({landedCost.incoterm})
              </div>
              <div className="mt-1 text-sm font-bold text-white">
                Seller: ₹
                {Number(
                  landedCost.seller_responsibility_inr || 0,
                ).toLocaleString("en-IN")}
              </div>
              <div className="mt-0.5 text-sm font-bold text-amber-300">
                Buyer: ₹
                {Number(
                  landedCost.buyer_responsibility_inr || 0,
                ).toLocaleString("en-IN")}
              </div>
            </div>

            <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4">
              <div className="text-[11px] font-bold uppercase text-[#9AA7BA]">
                Platform Reconciliation &amp; Margin
              </div>
              <div className="mt-1 text-sm font-bold text-emerald-300">
                Producer Value: ₹
                {Number(
                  landedCost.reconciliation?.producer_product_value_inr || 0,
                ).toLocaleString("en-IN")}
              </div>
              <div className="mt-0.5 text-xs text-[#9AA7BA]">
                Pass-Through Logistics: ₹
                {Number(
                  landedCost.reconciliation
                    ?.pass_through_logistics_expenditure_inr || 0,
                ).toLocaleString("en-IN")}{" "}
                · Est. Margin: ₹
                {Number(
                  landedCost.reconciliation?.estimated_platform_margin_inr || 0,
                ).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Formula Breakdown + Line Items */}
            <div className="lg:col-span-7 space-y-4 rounded-2xl border border-[#303846] bg-[#171B24] p-5">
              <h2 className="text-base font-bold text-white">
                Non-Double-Counted Total Landed Cost Breakdown
              </h2>
              <p className="text-xs text-[#9AA7BA]">
                Formula: Product Value + Packaging + Origin Logistics +
                International Freight + Insurance + Customs Duties + Import
                Taxes + Destination Charges + Demurrage/Other
              </p>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 text-xs">
                {Object.entries(landedCost.category_breakdown_inr || {}).map(
                  ([cat, val]) => (
                    <div
                      key={cat}
                      className="rounded-xl border border-[#303846] bg-[#11151D] p-3"
                    >
                      <div className="text-[11px] text-[#9AA7BA]">{cat}</div>
                      <div className="mt-1 text-sm font-bold text-white">
                        ₹{Number(val).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#303846] text-[11px] uppercase text-[#9AA7BA]">
                      <th className="py-2 pr-3">Category</th>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3">Payable By</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 pl-3 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#303846]/60">
                    {(landedCost.cost_items || []).map(
                      (item: Record<string, any>) => (
                        <tr key={item.id}>
                          <td className="py-2.5 pr-3 font-bold text-white">
                            {item.cost_category}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {item.description}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                item.payable_by === "Seller"
                                  ? "bg-sky-500/15 text-sky-300"
                                  : "bg-amber-500/15 text-amber-300"
                              }`}
                            >
                              {item.payable_by}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[#9AA7BA]">
                            {item.payment_status}
                          </td>
                          <td className="py-2.5 pl-3 text-right font-bold text-emerald-300">
                            ₹{Number(item.amount_inr).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Cost Line Item + Incoterms 2020 Matrix */}
            <div className="lg:col-span-5 space-y-4">
              <form
                onSubmit={handleAddCostItem}
                className="space-y-3 rounded-2xl border border-[#303846] bg-[#171B24] p-5 text-xs"
              >
                <div className="flex items-center justify-between border-b border-[#303846] pb-2">
                  <h3 className="text-sm font-bold text-white">
                    Add Logistics / Customs Cost Line Item
                  </h3>
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-[#9AA7BA]">
                      Cost Category
                    </label>
                    <select
                      value={costForm.cost_category}
                      onChange={(e) =>
                        setCostForm({
                          ...costForm,
                          cost_category: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-2.5 py-1.5 text-white"
                    >
                      <option value="Packaging">Packaging</option>
                      <option value="Origin Logistics">Origin Logistics</option>
                      <option value="International Freight">
                        International Freight
                      </option>
                      <option value="Insurance">Insurance</option>
                      <option value="Customs Duties">Customs Duties</option>
                      <option value="Import Taxes">Import Taxes</option>
                      <option value="Destination Charges">
                        Destination Charges
                      </option>
                      <option value="Demurrage">Demurrage / Detention</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#9AA7BA]">
                      Amount (INR)
                    </label>
                    <input
                      type="number"
                      required
                      value={costForm.amount_inr}
                      onChange={(e) =>
                        setCostForm({
                          ...costForm,
                          amount_inr: Number(e.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] text-[#9AA7BA]">
                      Description
                    </label>
                    <input
                      type="text"
                      required
                      value={costForm.description}
                      onChange={(e) =>
                        setCostForm({
                          ...costForm,
                          description: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-500 py-2 font-bold text-slate-950 hover:bg-emerald-400 transition"
                >
                  Append Cost Item &amp; Recalculate Landed Cost
                </button>
              </form>

              <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-5 space-y-2.5">
                <h3 className="text-sm font-bold text-white">
                  Incoterms® 2020 Responsibility &amp; Mode Matrix
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1 text-xs">
                  {Object.values(incotermsMap).map((inc: any) => (
                    <div
                      key={inc.code}
                      className="rounded-xl border border-[#303846] bg-[#11151D] p-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sky-300">
                          {inc.code} — {inc.name}
                        </span>
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-amber-300">
                          {inc.allowed_modes?.includes("Sea") &&
                          inc.allowed_modes?.length === 2
                            ? "Sea & Inland Waterway Only"
                            : "Any Transport Mode"}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#9AA7BA]">
                        Risk Transfer: {inc.risk_transfer_point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: MULTIMODAL ROUTE OPTIMIZER & GLOBAL MAP                      */}
      {/* =================================================================== */}
      {!loading && activeTab === "routes" && (
        <div className="space-y-6">
          <ShipmentMap
            selectedShipmentId={selectedShipmentId}
            defaultCorridor="international"
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Multimodal Itinerary Comparison */}
            <div className="lg:col-span-8 space-y-4 rounded-2xl border border-[#303846] bg-[#171B24] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#303846] pb-3">
                <div>
                  <h2 className="text-base font-bold text-white">
                    Multimodal Route &amp; Cost Optimization Engine
                  </h2>
                  <p className="text-xs text-[#9AA7BA]">
                    {routeOptimization?.routing_disclosure}
                  </p>
                </div>
                <Sparkles className="h-5 w-5 text-amber-400" />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(routeOptimization?.alternatives || []).map(
                  (alt: Record<string, any>) => (
                    <div
                      key={alt.id}
                      className={`rounded-2xl border p-4 ${
                        alt.feasible
                          ? "border-sky-500/40 bg-[#11151D]"
                          : "border-rose-500/30 bg-rose-950/10 opacity-75"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="text-xs font-extrabold text-white">
                          {alt.name}
                        </span>
                        {alt.recommendation_badge && (
                          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                            ★ {alt.recommendation_badge}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-[11px] text-sky-300">
                        Modes: {(alt.modes || []).join(" → ")}
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded-lg bg-[#171B24] p-2">
                          <div className="text-[10px] text-[#9AA7BA]">
                            Freight Cost
                          </div>
                          <div className="font-bold text-emerald-400">
                            ₹
                            {Number(
                              alt.estimated_freight_cost_inr,
                            ).toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div className="rounded-lg bg-[#171B24] p-2">
                          <div className="text-[10px] text-[#9AA7BA]">
                            Transit Time
                          </div>
                          <div className="font-bold text-white">
                            {alt.transit_hours} hrs ({alt.transit_days}d)
                          </div>
                        </div>
                        <div className="rounded-lg bg-[#171B24] p-2">
                          <div className="text-[10px] text-[#9AA7BA]">
                            Remaining Shelf Life
                          </div>
                          <div className="font-bold text-amber-300">
                            {alt.remaining_shelf_life_days} days
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] text-[#9AA7BA]">
                        <b>Transfer Points:</b>{" "}
                        {(alt.transfer_points || []).join(" · ")}
                      </div>
                      {!alt.feasible && (
                        <div className="mt-2 rounded-lg bg-rose-500/15 p-2 text-[11px] font-semibold text-rose-300">
                          Disqualified:{" "}
                          {(alt.constraint_violations || []).join("; ")}
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>

              {/* Active Shipment Legs Table */}
              <div className="pt-3">
                <h3 className="text-sm font-bold text-white mb-2">
                  Executed Multimodal Shipment Legs ({selectedShipmentId})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#303846] text-[11px] uppercase text-[#9AA7BA]">
                        <th className="py-2 pr-2">Leg</th>
                        <th className="py-2 px-2">Mode</th>
                        <th className="py-2 px-2">Origin → Destination Node</th>
                        <th className="py-2 px-2">Carrier &amp; Vessel/Truck</th>
                        <th className="py-2 px-2">Temp Setpoint</th>
                        <th className="py-2 pl-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#303846]/60">
                      {legs.map((leg) => (
                        <tr key={leg.id}>
                          <td className="py-2.5 pr-2 font-bold text-sky-300">
                            #{leg.leg_sequence}
                          </td>
                          <td className="py-2.5 px-2 font-semibold text-white">
                            {leg.mode}
                          </td>
                          <td className="py-2.5 px-2 text-slate-300">
                            {leg.origin_node} → {leg.destination_node}
                          </td>
                          <td className="py-2.5 px-2 text-[#9AA7BA]">
                            {leg.carrier_name} ({leg.vehicle_Or_vessel_no})
                          </td>
                          <td className="py-2.5 px-2 text-emerald-300">
                            {leg.temp_setpoint_c}°C
                          </td>
                          <td className="py-2.5 pl-2">
                            <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[11px] font-bold text-sky-300">
                              {leg.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Constraint Simulator Form */}
            <form
              onSubmit={handleOptimizeRoutes}
              className="lg:col-span-4 space-y-4 rounded-2xl border border-[#303846] bg-[#171B24] p-5 text-xs"
            >
              <h3 className="text-base font-bold text-white border-b border-[#303846] pb-2">
                Route Constraint Simulator
              </h3>
              <div>
                <label className="block text-[11px] text-[#9AA7BA]">
                  Destination Country
                </label>
                <select
                  value={routeParams.destination_country}
                  onChange={(e) =>
                    setRouteParams({
                      ...routeParams,
                      destination_country: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-3 py-2 text-white"
                >
                  <option value="United Arab Emirates">
                    United Arab Emirates (Multimodal Sea/Air/Road)
                  </option>
                  <option value="Netherlands">
                    European Union / Netherlands (Sea/Air)
                  </option>
                  <option value="India">
                    India Domestic (Road/Rail Reefer Corridor)
                  </option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-[#9AA7BA]">
                    Cargo Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={routeParams.cargo_weight_kg}
                    onChange={(e) =>
                      setRouteParams({
                        ...routeParams,
                        cargo_weight_kg: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#9AA7BA]">
                    Max Shelf-Life (Days)
                  </label>
                  <input
                    type="number"
                    value={routeParams.shelf_life_days}
                    onChange={(e) =>
                      setRouteParams({
                        ...routeParams,
                        shelf_life_days: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-3 py-1.5 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-[#9AA7BA]">
                  Target Reefer Setpoint (°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={routeParams.target_temp_c}
                  onChange={(e) =>
                    setRouteParams({
                      ...routeParams,
                      target_temp_c: Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-3 py-1.5 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-sky-500 py-2 font-bold text-slate-950 hover:bg-sky-400 transition"
              >
                Re-Evaluate Multimodal Corridors
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: GLOBAL FLEET & TRADE PARTNERS                                */}
      {/* =================================================================== */}
      {!loading && activeTab === "fleet_partners" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-5">
              <h2 className="text-base font-bold text-white mb-3">
                Registered Multimodal Fleet &amp; Reefer Containers
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#303846] text-[11px] uppercase text-[#9AA7BA]">
                      <th className="py-2 pr-2">Asset ID</th>
                      <th className="py-2 px-2">Mode</th>
                      <th className="py-2 px-2">Carrier</th>
                      <th className="py-2 px-2">Vehicle / Vessel &amp; Container</th>
                      <th className="py-2 px-2">Temp Range</th>
                      <th className="py-2 pl-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#303846]/60">
                    {fleet.map((f) => (
                      <tr key={f.id}>
                        <td className="py-2.5 pr-2 font-bold text-sky-300">
                          {f.id}
                        </td>
                        <td className="py-2.5 px-2 text-white">{f.mode}</td>
                        <td className="py-2.5 px-2 text-slate-300">
                          {f.carrier_name}
                        </td>
                        <td className="py-2.5 px-2 text-[#9AA7BA]">
                          {f.vehicle_Or_vessel_no} · {f.container_id}
                        </td>
                        <td className="py-2.5 px-2 text-emerald-300">
                          {f.temp_min_c}°C to {f.temp_max_c}°C
                        </td>
                        <td className="py-2.5 pl-2">
                          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                            {f.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-5">
              <h2 className="text-base font-bold text-white mb-3">
                Verified International Trade Organizations (Exporters,
                Importers, Brokers, Carriers)
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                {organizations.map((org) => (
                  <div
                    key={org.id}
                    className="rounded-xl border border-[#303846] bg-[#11151D] p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{org.name}</span>
                      <span className="rounded bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                        {org.org_type}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-[#9AA7BA]">
                      {org.country} · Tax/IEC: {org.tax_id} · License:{" "}
                      {org.license_no}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <form
            onSubmit={handleCreateFleetAsset}
            className="lg:col-span-4 space-y-3 rounded-2xl border border-[#303846] bg-[#171B24] p-5 text-xs h-fit"
          >
            <h3 className="text-base font-bold text-white border-b border-[#303846] pb-2">
              Register Carrier / Reefer Asset
            </h3>
            <div>
              <label className="block text-[11px] text-[#9AA7BA]">
                Carrier Name
              </label>
              <input
                type="text"
                required
                value={newAsset.carrier_name}
                onChange={(e) =>
                  setNewAsset({ ...newAsset, carrier_name: e.target.value })
                }
                className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-3 py-1.5 text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#9AA7BA]">
                Transport Mode
              </label>
              <select
                value={newAsset.mode}
                onChange={(e) =>
                  setNewAsset({ ...newAsset, mode: e.target.value })
                }
                className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-3 py-1.5 text-white"
              >
                <option value="Road">Road Reefer Truck</option>
                <option value="Sea">Sea CA Reefer Vessel/Container</option>
                <option value="Air">Air Active ULD Freighter</option>
                <option value="Rail">Refrigerated Rail Wagon</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-[#9AA7BA]">
                Vehicle / Vessel Registration
              </label>
              <input
                type="text"
                required
                value={newAsset.vehicle_Or_vessel_no}
                onChange={(e) =>
                  setNewAsset({
                    ...newAsset,
                    vehicle_Or_vessel_no: e.target.value,
                  })
                }
                className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-3 py-1.5 text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#9AA7BA]">
                Container / ULD Number
              </label>
              <input
                type="text"
                value={newAsset.container_id}
                onChange={(e) =>
                  setNewAsset({ ...newAsset, container_id: e.target.value })
                }
                className="mt-1 w-full rounded-xl border border-[#303846] bg-[#11151D] px-3 py-1.5 text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-500 py-2 font-bold text-slate-950 hover:bg-emerald-400 transition"
            >
              Add Asset to Fleet Registry
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
