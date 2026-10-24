import { useEffect, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Edit3,
  Globe,
  Leaf,
  MapPin,
  Plus,
  ShieldCheck,
  Thermometer,
} from "lucide-react";
import {
  agriApi,
  downloadCsv,
  type ProduceItemRecord,
} from "../../services/api";
import {
  ChartCard,
  ExportButton,
  FilterToolbar,
  PageHeader,
  StatusBadge,
} from "../../components/ui/SharedComponents";
import { useAuth } from "../../context/AuthContext";

export default function MyProduce() {
  const { user, notify } = useAuth();
  const [items, setItems] = useState<ProduceItemRecord[]>([]);
  const [farms, setFarms] = useState<Array<Record<string, any>>>([]);
  const [quotations, setQuotations] = useState<Array<Record<string, any>>>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [editing, setEditing] = useState<ProduceItemRecord | null>(null);

  const [form, setForm] = useState({
    crop_name: "Export Alphonso Mangoes",
    variety: "Ratnagiri GI Class I",
    category: "Fruits",
    harvest_date: "2026-10-19",
    quantity_kg: 2500,
    available_kg: 2500,
    quality_grade: "Export Grade A+",
    storage_temp_min_c: 8.0,
    storage_temp_max_c: 12.0,
    target_humidity_pct: 85.0,
    expected_shelf_life_days: 21,
    unit_price_inr: 165.0,
    storage_location: "Nashik Export Packhouse Chamber A",
    status: "Available",
    hs_code: "0804.50.20",
    certifications: "GlobalG.A.P. · APEDA · NPPO Phytosanitary · India-UAE CEPA",
    packaging_type: "5 kg Corrugated Ventilated Export Cartons on ISPM-15 Pallets",
  });

  const [farmForm, setFarmForm] = useState({
    name: "Sahyadri Export Orchards — Block C",
    location: "Pimpalgaon Baswant, Nashik, Maharashtra",
    country: "India",
    latitude: 20.1667,
    longitude: 73.9833,
    area_hectares: 48.5,
    soil_type: "Well-Drained Basaltic Black Loam",
    irrigation_type: "Automated Drip Fertigation",
    certifications: "GlobalG.A.P. #GGN-4059883, APEDA Packhouse #INI-NSK-042",
  });

  const loadAll = () => {
    agriApi
      .produce(search, categoryFilter)
      .then(setItems)
      .catch(() => {});
    agriApi
      .farms()
      .then(setFarms)
      .catch(() => {});
    agriApi
      .quotations()
      .then(setQuotations)
      .catch(() => {});
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter]);

  const openAdd = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (item: ProduceItemRecord) => {
    setEditing(item);
    setForm({
      crop_name: item.crop_name,
      variety: item.variety || "Export Class I",
      category: item.category,
      harvest_date: item.harvest_date,
      quantity_kg: item.quantity_kg,
      available_kg: item.available_kg,
      quality_grade: item.quality_grade,
      storage_temp_min_c: item.storage_temp_min_c ?? 8.0,
      storage_temp_max_c: item.storage_temp_max_c ?? 12.0,
      target_humidity_pct: item.target_humidity_pct ?? 85.0,
      expected_shelf_life_days: item.expected_shelf_life_days ?? 14,
      unit_price_inr: item.unit_price_inr,
      storage_location: item.storage_location,
      status: item.status,
      hs_code: (item as any).hs_code || "0804.50.20",
      certifications:
        (item as any).certifications ||
        "GlobalG.A.P. · APEDA · NPPO Phytosanitary",
      packaging_type:
        (item as any).packaging_type || "5 kg Export Corrugated Cartons",
    });
    setShowModal(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await agriApi.updateProduce(editing.id, form);
        notify(
          "Batch Updated",
          `${form.crop_name} updated in SQLite.`,
          "success",
        );
      } else {
        await agriApi.createProduce({
          ...form,
          farmer_email: user?.email ?? "farmer@agripreserve.com",
          farmer_name: user?.name ?? "Rajesh Farmer",
        });
        notify(
          "Harvest Batch Logged",
          `${form.crop_name} (${form.quantity_kg} kg, HS ${form.hs_code}) added to catalog.`,
          "success",
        );
      }
      setShowModal(false);
      loadAll();
    } catch (err) {
      notify(
        "Save failed",
        err instanceof Error ? err.message : "Could not save produce",
        "error",
      );
    }
  };

  const handleRegisterFarm = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await agriApi.createFarm({
        ...farmForm,
        farmer_email: user?.email ?? "farmer@agripreserve.com",
      });
      notify(
        "Farm & Packhouse Registered",
        `${farmForm.name} registered with export traceability certifications.`,
        "success",
      );
      setShowFarmModal(false);
      loadAll();
    } catch (err) {
      notify(
        "Farm Registration Failed",
        err instanceof Error ? err.message : "Error",
        "error",
      );
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      await agriApi.updateQuotationStatus(quoteId, { status: "Approved" });
      notify(
        "Export Quotation Confirmed",
        `Quotation ${quoteId} approved and ready for collection & customs booking.`,
        "success",
      );
      loadAll();
    } catch (err) {
      notify(
        "Could not update quotation",
        err instanceof Error ? err.message : "Error",
        "error",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        role="farmer"
        eyebrow="FARM REGISTRY, HARVEST BATCHES & EXPORT QUOTATIONS"
        title="My Registered Farms, Export Harvest Batches & Buyer Quotations"
        description="Maintain GlobalG.A.P. / APEDA farm plots, register traceable harvest batches with HS commodity codes, and approve international buyer quotations."
        actions={
          <>
            <ExportButton
              label="Export Catalog CSV"
              onClick={() =>
                downloadCsv(
                  "agripreserve_produce_catalog.csv",
                  items as unknown as Array<Record<string, unknown>>,
                )
              }
            />
            <button
              type="button"
              onClick={() => setShowFarmModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 px-3.5 py-2 text-xs font-bold text-emerald-300 transition"
            >
              <MapPin className="w-3.5 h-3.5" /> Register Farm Plot
            </button>
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 rounded-xl bg-green-500 hover:bg-green-400 px-4 py-2 text-xs font-bold text-slate-950 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Harvest Batch
            </button>
          </>
        }
      />

      {/* Registered Farms & Buyer Quotations Strip */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <ChartCard
            title="Registered Farms & APEDA Packhouses"
            subtitle="Origin traceability, GPS coordinates, soil & GlobalG.A.P. certifications"
            badge={`${farms.length} FARMS`}
          >
            <div className="space-y-2.5 text-xs">
              {farms.map((f) => (
                <div
                  key={f.id}
                  className="rounded-xl border border-[#303846] bg-[#11151D] p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{f.name}</span>
                    <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {f.area_hectares} Ha · {f.status}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-[#9AA7BA]">
                    {f.location} ({f.latitude}, {f.longitude}) · {f.soil_type}
                  </div>
                  <div className="mt-1 text-[11px] text-sky-300">
                    Certs: {f.certifications}
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        <div className="lg:col-span-6">
          <ChartCard
            title="International & Domestic Buyer Quotations"
            subtitle="Approve retailer purchase orders under Incoterms® 2020 (CIF / CIP / FOB)"
            badge="PROCUREMENT"
          >
            <div className="space-y-2.5 text-xs">
              {quotations.map((q) => (
                <div
                  key={q.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#303846] bg-[#11151D] p-3"
                >
                  <div>
                    <div className="font-bold text-white">
                      {q.id} · {q.product} ({Number(q.quantity_kg).toLocaleString()}{" "}
                      kg)
                    </div>
                    <div className="text-[11px] text-[#9AA7BA]">
                      Buyer: <b className="text-slate-200">{q.buyer_name}</b> ·
                      Incoterm: <b className="text-sky-300">{q.incoterm}</b> (
                      {q.destination_country}) · Ask: ₹{q.unit_price_inr}/kg
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={q.status} />
                    {q.status !== "Approved" && (
                      <button
                        type="button"
                        onClick={() => handleAcceptQuote(String(q.id))}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-slate-950 hover:bg-emerald-400"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Accept Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by crop name, batch code, HS code, or packhouse chamber..."
        filters={
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-xs text-[#F1F5F9]"
            aria-label="Filter by crop category"
          >
            <option value="">All Categories</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
          </select>
        }
      />

      {/* Produce Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-[#303846] bg-[#171B24] p-5 space-y-4 shadow-lg"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F1F5F9]">
                    {item.crop_name}
                  </h3>
                  <p className="text-xs text-[#9AA7BA]">
                    {item.id} · {item.category} · {item.quality_grade}
                  </p>
                </div>
              </div>
              <StatusBadge status={item.status} />
            </div>

            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 text-sky-300 font-semibold">
                <Globe className="h-3 w-3" /> HS{" "}
                {(item as any).hs_code || "0804.50.20"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-300 font-semibold">
                <ShieldCheck className="h-3 w-3" /> Export Traceable
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-xl bg-[#11151D] border border-[#303846] p-2.5">
                <span className="text-[#9AA7BA] block">Available / Total</span>
                <strong className="text-sm text-[#F1F5F9]">
                  {item.available_kg} / {item.quantity_kg} kg
                </strong>
              </div>
              <div className="rounded-xl bg-[#11151D] border border-[#303846] p-2.5">
                <span className="text-[#9AA7BA] block">Ask Price</span>
                <strong className="text-sm text-green-400">
                  ₹{item.unit_price_inr}/kg
                </strong>
              </div>
              <div className="rounded-xl bg-[#11151D] border border-[#303846] p-2.5">
                <span className="text-[#9AA7BA] flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-sky-400" /> Cold Band
                </span>
                <strong className="text-[#F1F5F9]">
                  {(item as any).storage_temp_c ?? 4.0}°C Setpoint
                </strong>
              </div>
              <div className="rounded-xl bg-[#11151D] border border-[#303846] p-2.5">
                <span className="text-[#9AA7BA] block">Harvest Date</span>
                <strong className="text-[#F1F5F9]">{item.harvest_date}</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-[#303846]/70 flex items-center justify-between text-xs">
              <span className="text-[#9AA7BA] truncate">
                {item.storage_location}
              </span>
              <button
                type="button"
                onClick={() => openEdit(item)}
                className="inline-flex items-center gap-1 rounded-lg bg-[#1D2330] hover:bg-slate-700 px-2.5 py-1 text-green-300 font-semibold"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Harvest Batch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#303846] bg-[#171B24] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#303846] pb-3">
              <h3 className="text-base font-bold text-[#F1F5F9]">
                {editing
                  ? `Edit ${editing.crop_name}`
                  : "Register Export-Ready Harvest Batch"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-xs text-[#9AA7BA] hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Crop Name</span>
                  <input
                    type="text"
                    required
                    value={form.crop_name}
                    onChange={(e) =>
                      setForm({ ...form, crop_name: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">HS Commodity Code</span>
                  <input
                    type="text"
                    required
                    value={form.hs_code}
                    onChange={(e) =>
                      setForm({ ...form, hs_code: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Total Harvested (kg)</span>
                  <input
                    type="number"
                    required
                    value={form.quantity_kg}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        quantity_kg: Number(e.target.value),
                        available_kg: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Unit Price (₹/kg)</span>
                  <input
                    type="number"
                    required
                    value={form.unit_price_inr}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        unit_price_inr: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
                <label className="space-y-1 block col-span-2">
                  <span className="text-[#9AA7BA]">
                    Export &amp; Phytosanitary Certifications
                  </span>
                  <input
                    type="text"
                    value={form.certifications}
                    onChange={(e) =>
                      setForm({ ...form, certifications: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
                <label className="space-y-1 block col-span-2">
                  <span className="text-[#9AA7BA]">
                    Packhouse / Cold Chamber Location
                  </span>
                  <input
                    type="text"
                    required
                    value={form.storage_location}
                    onChange={(e) =>
                      setForm({ ...form, storage_location: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#303846]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-[#303846] bg-[#11151D] px-4 py-2 text-[#9AA7BA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-green-500 hover:bg-green-400 px-5 py-2 font-bold text-slate-950"
                >
                  Save Batch to SQLite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Farm Modal */}
      {showFarmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#303846] bg-[#171B24] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#303846] pb-3">
              <h3 className="text-base font-bold text-[#F1F5F9]">
                Register Export Farm &amp; APEDA Packhouse Plot
              </h3>
              <button
                type="button"
                onClick={() => setShowFarmModal(false)}
                className="text-xs text-[#9AA7BA] hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRegisterFarm} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 block col-span-2">
                  <span className="text-[#9AA7BA]">Farm / Orchard Name</span>
                  <input
                    type="text"
                    required
                    value={farmForm.name}
                    onChange={(e) =>
                      setFarmForm({ ...farmForm, name: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-white"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Location / District</span>
                  <input
                    type="text"
                    required
                    value={farmForm.location}
                    onChange={(e) =>
                      setFarmForm({ ...farmForm, location: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-white"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Cultivated Area (Ha)</span>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={farmForm.area_hectares}
                    onChange={(e) =>
                      setFarmForm({
                        ...farmForm,
                        area_hectares: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-white"
                  />
                </label>
                <label className="space-y-1 block col-span-2">
                  <span className="text-[#9AA7BA]">
                    GlobalG.A.P. / APEDA Certifications
                  </span>
                  <input
                    type="text"
                    required
                    value={farmForm.certifications}
                    onChange={(e) =>
                      setFarmForm({
                        ...farmForm,
                        certifications: e.target.value,
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-white"
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#303846]">
                <button
                  type="button"
                  onClick={() => setShowFarmModal(false)}
                  className="rounded-xl border border-[#303846] bg-[#11151D] px-4 py-2 text-[#9AA7BA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2 font-bold text-slate-950"
                >
                  Register Farm Plot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
