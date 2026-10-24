import { useEffect, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  MapPin,
  Phone,
  Receipt,
  ShieldAlert,
  Thermometer,
  Truck,
} from "lucide-react";
import { agriApi, type ShipmentRecord } from "../../services/api";
import {
  ChartCard,
  PageHeader,
  StatusBadge,
} from "../../components/ui/SharedComponents";
import { useAuth } from "../../context/AuthContext";

const DRIVER_MILESTONES = [
  "Picked Up",
  "Arrived at Export Port",
  "Loaded on Vessel",
  "In Transit",
  "Arrived at Destination Port",
  "Out for Delivery",
  "Delayed",
  "Delivered",
];

export default function CurrentShipment() {
  const { user, notify } = useAuth();
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [selectedId, setSelectedId] = useState("AP-INTL-2026");
  const [verifications, setVerifications] = useState<Array<Record<string, any>>>(
    [],
  );
  const [expenses, setExpenses] = useState<Array<Record<string, any>>>([]);

  // 10-Step Pickup Verification State
  const [pickupForm, setPickupForm] = useState({
    quantity_verified_kg: 12000,
    package_count_verified: 2400,
    packaging_condition: "Intact — 20 ISPM-15 Pallets Shrink-Wrapped",
    batch_label_verified: true,
    seal_number: "IN-ESEAL-994120",
    cargo_temp_c: 9.5,
    reefer_precool_temp_c: 9.2,
    hygiene_check_passed: true,
    smell_check_passed: true,
    moisture_check_passed: true,
    notes:
      "Forced-air pre-cooling verified at Nashik Packhouse dock prior to container stuffing.",
  });

  // Driver Expense Claim Form State
  const [expenseForm, setExpenseForm] = useState({
    category: "Port Gate & Reefer Plug-In Fee",
    amount_inr: 4200,
    currency: "INR",
    receipt_ref: "JNPT-GATE-88412",
    notes: "JNPT Nhava Sheva Direct Port Entry reefer yard power plug-in",
  });

  // Incident Form State
  const [incidentTitle, setIncidentTitle] = useState(
    "Reefer Evaporator Airflow Check & Door Seal",
  );
  const [incidentSeverity, setIncidentSeverity] = useState("Warning");
  const [incidentNotes, setIncidentNotes] = useState(
    "Pulled over at highway layby to inspect rear door gasket and verify airflow.",
  );

  const loadData = (shipId: string) => {
    agriApi
      .shipments()
      .then(setShipments)
      .catch(() => {});
    agriApi
      .pickupVerifications(shipId)
      .then(setVerifications)
      .catch(() => {});
    agriApi
      .driverExpenses(shipId)
      .then(setExpenses)
      .catch(() => {});
  };

  useEffect(() => {
    loadData(selectedId);
  }, [selectedId]);

  const current: ShipmentRecord =
    shipments.find((s) => s.id === selectedId) ??
    shipments[0] ?? {
      id: "AP-INTL-2026",
      product: "Export Alphonso & Kesar Mangoes",
      quantity_kg: 12000,
      origin: "Nashik Export Packhouse, India",
      destination: "Al Maya Cold Hub, Dubai, UAE",
      status: "Customs Clearance",
      eta: "2026-10-25 14:00",
      temperature_c: 9.4,
      humidity_pct: 84,
      latitude: 25.0132,
      longitude: 55.0612,
      farmer: "Rajesh Farmer",
      driver: "Amit Driver",
      transport_mode: "Multimodal (Road + Sea Reefer + Road)",
      incoterm: "CIF",
      container_no: "MAEU-CA-984120",
      vehicle_number: "MH-15-AB-4821",
    };

  const triggerMilestone = async (status: string) => {
    try {
      await agriApi.updateShipmentStatus(current.id, {
        status,
        location: `${current.origin} → ${current.destination}`,
        notes: `Driver ${user?.name ?? current.driver} updated milestone to ${status}`,
        actor_name: user?.name ?? current.driver,
        actor_role: "driver",
      });
      notify(
        `Milestone Recorded: ${status}`,
        `Shipment ${current.id} updated in central database.`,
        "success",
      );
      loadData(current.id);
    } catch (err) {
      notify(
        "Transition Blocked by Guardrail",
        err instanceof Error ? err.message : "Error",
        "error",
      );
    }
  };

  const handlePickupVerification = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await agriApi.createPickupVerification({
        shipment_id: current.id,
        ...pickupForm,
      });
      notify(
        "10-Step Pickup Verification Saved",
        `Container seal ${pickupForm.seal_number} & pre-cool temp ${pickupForm.reefer_precool_temp_c}°C recorded for ${current.id}.`,
        "success",
      );
      loadData(current.id);
    } catch (err) {
      notify(
        "Pickup Verification Rejected",
        err instanceof Error ? err.message : "Error",
        "error",
      );
    }
  };

  const handleExpenseSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await agriApi.createDriverExpense({
        shipment_id: current.id,
        ...expenseForm,
      });
      notify(
        "Transport Expense Submitted",
        `Claim ${expenseForm.receipt_ref} (₹${expenseForm.amount_inr}) queued for Admin settlement.`,
        "success",
      );
      loadData(current.id);
    } catch (err) {
      notify(
        "Expense Submission Failed",
        err instanceof Error ? err.message : "Error",
        "error",
      );
    }
  };

  const handleReportIncident = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await agriApi.createIncident({
        shipment_id: current.id,
        title: incidentTitle,
        category: "Cold-Chain Transit",
        severity: incidentSeverity,
        notes: incidentNotes,
        reported_by: user?.name ?? current.driver,
      });
      notify(
        "Field Incident Logged",
        `Incident persisted to SQLite and visible in Admin Alert Queue.`,
        "warning",
      );
    } catch (err) {
      notify(
        "Failed to log incident",
        err instanceof Error ? err.message : "Error",
        "error",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        role="driver"
        eyebrow="ACTIVE SHIPMENT DISPATCH & PICKUP VERIFICATION"
        title="Current Assigned Shipment, 10-Step Pickup Check & Expense Claims"
        description="Execute mandatory 10-point cargo & reefer pre-cool verification, transition multimodal transit milestones, and submit trip expenses."
        actions={
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-xs text-[#F1F5F9]"
            aria-label="Select shipment"
          >
            {shipments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} · {s.product} ({s.origin} → {s.destination})
              </option>
            ))}
          </select>
        }
      />

      {/* Active Load Summary Card */}
      <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-6 space-y-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#303846] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F1F5F9]">
                Shipment {current.id} · {current.product} (
                {Number(current.quantity_kg).toLocaleString()} kg)
              </h2>
              <p className="text-xs text-[#9AA7BA] flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {current.origin} → {current.destination} · Mode:{" "}
                <b className="text-sky-300">
                  {current.transport_mode ?? "Road Reefer"}
                </b>{" "}
                · Incoterm: <b>{current.incoterm ?? "CIP"}</b>
              </p>
            </div>
          </div>
          <StatusBadge status={current.status} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3 text-xs">
          <div className="rounded-xl bg-[#11151D] border border-[#303846] p-4 space-y-1">
            <span className="text-[#9AA7BA]">Origin Packhouse / Producer</span>
            <p className="font-bold text-[#F1F5F9] text-sm">{current.farmer}</p>
            <p className="text-sky-400 flex items-center gap-1">
              <Phone className="w-3 h-3" /> +91 98230 11220 ({current.origin})
            </p>
          </div>

          <div className="rounded-xl bg-[#11151D] border border-[#303846] p-4 space-y-1">
            <span className="text-[#9AA7BA]">
              Port / Receiving Terminal Contact
            </span>
            <p className="font-bold text-[#F1F5F9] text-sm">
              {current.destination}
            </p>
            <p className="text-sky-400 flex items-center gap-1">
              <Phone className="w-3 h-3" /> Container/Vehicle:{" "}
              {current.container_no || current.vehicle_number || "MH-15-EF-2024"}
            </p>
          </div>

          <div className="rounded-xl bg-[#11151D] border border-[#303846] p-4 space-y-1">
            <span className="text-[#9AA7BA] flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-emerald-400" /> Safe
              Thermal Band &amp; Telemetry
            </span>
            <p className="font-bold text-[#F1F5F9] text-sm">
              Current: {current.temperature_c ?? 4.6}°C /{" "}
              {current.humidity_pct ?? 79}% RH
            </p>
            <p className="text-emerald-400">
              Guardrail: Keep within commodity cold-chain band
            </p>
          </div>
        </div>

        {/* One-Tap Milestone Transition Buttons */}
        <div className="space-y-2 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#9AA7BA]">
              Driver Transit Milestone Controls (RBAC Guardrail Enforced)
            </p>
            <span className="text-[11px] text-amber-300">
              Note: Drivers cannot certify Customs Clearance or override Disputed
              deliveries.
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DRIVER_MILESTONES.map((st) => {
              const active = current.status === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => triggerMilestone(st)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    active
                      ? "bg-sky-500 text-slate-950 shadow-lg"
                      : "border border-[#303846] bg-[#1D2330] text-[#F1F5F9] hover:bg-slate-700"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {st}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mandatory 10-Step Pickup Verification + Driver Expenses */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ChartCard
            title="Mandatory 10-Step Pickup & Reefer Pre-Cool Verification"
            subtitle="Verifies weight, carton count, seal number, pulp temperature, pre-cooling, and hygiene before departure"
            badge="10-POINT CHECK"
          >
            <form
              onSubmit={handlePickupVerification}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">1. Verified Weight (kg)</span>
                  <input
                    type="number"
                    required
                    value={pickupForm.quantity_verified_kg}
                    onChange={(e) =>
                      setPickupForm({
                        ...pickupForm,
                        quantity_verified_kg: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-1.5 text-white"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">2. Package/Carton Count</span>
                  <input
                    type="number"
                    required
                    value={pickupForm.package_count_verified}
                    onChange={(e) =>
                      setPickupForm({
                        ...pickupForm,
                        package_count_verified: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-1.5 text-white"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">3. Container/Door Seal #</span>
                  <input
                    type="text"
                    required
                    value={pickupForm.seal_number}
                    onChange={(e) =>
                      setPickupForm({
                        ...pickupForm,
                        seal_number: e.target.value,
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-1.5 text-white"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">4. Cargo Pulp Temp (°C)</span>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={pickupForm.cargo_temp_c}
                    onChange={(e) =>
                      setPickupForm({
                        ...pickupForm,
                        cargo_temp_c: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-1.5 text-white"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">
                    5. Reefer Pre-Cool Temp (°C)
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={pickupForm.reefer_precool_temp_c}
                    onChange={(e) =>
                      setPickupForm({
                        ...pickupForm,
                        reefer_precool_temp_c: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-1.5 text-white"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">6. Packaging Condition</span>
                  <input
                    type="text"
                    required
                    value={pickupForm.packaging_condition}
                    onChange={(e) =>
                      setPickupForm({
                        ...pickupForm,
                        packaging_condition: e.target.value,
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-1.5 text-white"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[
                  {
                    key: "batch_label_verified",
                    label: "7. Batch/Traceability Labels",
                  },
                  {
                    key: "hygiene_check_passed",
                    label: "8. Container Hygiene Clean",
                  },
                  {
                    key: "smell_check_passed",
                    label: "9. Odor & Cross-Contamination Free",
                  },
                  {
                    key: "moisture_check_passed",
                    label: "10. Moisture & Floor Drains Clear",
                  },
                ].map((chk) => (
                  <label
                    key={chk.key}
                    className="flex items-center gap-2 rounded-xl border border-[#303846] bg-[#11151D] p-2.5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean((pickupForm as any)[chk.key])}
                      onChange={(e) =>
                        setPickupForm({
                          ...pickupForm,
                          [chk.key]: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded text-emerald-500"
                    />
                    <span className="text-[11px] font-semibold text-slate-200">
                      {chk.label}
                    </span>
                  </label>
                ))}
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 font-bold text-slate-950 transition"
              >
                <ClipboardCheck className="w-4 h-4" /> Certify 10-Point Pickup
                &amp; Seal Container
              </button>
            </form>

            {verifications.length > 0 && (
              <div className="mt-4 border-t border-[#303846] pt-3 text-xs">
                <div className="font-bold text-emerald-300">
                  Latest Verified Pickup Record ({verifications[0].id}):
                </div>
                <p className="text-[#9AA7BA] mt-0.5">
                  Seal: <b className="text-white">{verifications[0].seal_number}</b>{" "}
                  · Verified Weight:{" "}
                  <b className="text-white">
                    {verifications[0].quantity_verified_kg} kg
                  </b>{" "}
                  ({verifications[0].package_count_verified} pkgs) · Cargo Temp:{" "}
                  <b className="text-emerald-300">
                    {verifications[0].cargo_temp_c}°C
                  </b>
                </p>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Driver Transport Expense Claims */}
        <div className="lg:col-span-5">
          <ChartCard
            title="Driver Transit Expense & Port Fee Claims"
            subtitle="Submit fuel, toll, port gate, or reefer plug-in receipts for settlement"
            badge="EXPENSES"
          >
            <form onSubmit={handleExpenseSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <label className="space-y-1 block col-span-2">
                  <span className="text-[#9AA7BA]">Expense Category</span>
                  <select
                    value={expenseForm.category}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-1.5 text-white"
                  >
                    <option value="Port Gate & Reefer Plug-In Fee">
                      Port Gate &amp; Reefer Plug-In Fee
                    </option>
                    <option value="Highway Toll & Fastag">
                      Highway Toll &amp; Fastag
                    </option>
                    <option value="Reefer Diesel / Fuel">
                      Reefer Diesel / Fuel
                    </option>
                    <option value="Cold-Storage Layover Plug-In">
                      Cold-Storage Layover Plug-In
                    </option>
                    <option value="Emergency Maintenance">
                      Emergency Maintenance
                    </option>
                  </select>
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Amount (INR)</span>
                  <input
                    type="number"
                    required
                    value={expenseForm.amount_inr}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        amount_inr: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-1.5 text-white"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Receipt / Voucher #</span>
                  <input
                    type="text"
                    required
                    value={expenseForm.receipt_ref}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        receipt_ref: e.target.value,
                      })
                    }
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-1.5 text-white"
                  />
                </label>
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 px-4 py-2 font-bold text-slate-950 transition"
              >
                <Receipt className="w-4 h-4" /> Submit Trip Expense Claim
              </button>
            </form>

            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto text-xs">
              {expenses.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between rounded-xl border border-[#303846] bg-[#11151D] px-3 py-2"
                >
                  <div>
                    <div className="font-bold text-white">{ex.category}</div>
                    <div className="text-[11px] text-[#9AA7BA]">
                      Ref: {ex.receipt_ref}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-400">
                      ₹{Number(ex.amount_inr).toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-sky-300">{ex.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Report Incident Form */}
      <ChartCard
        title="Report Field or Reefer Incident"
        subtitle="Logs an operational incident and notifies the Admin & Receiver teams"
        badge="INCIDENT LOG"
      >
        <form onSubmit={handleReportIncident} className="space-y-3 text-xs">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="space-y-1 block">
              <span className="text-[#9AA7BA]">Incident Summary</span>
              <input
                type="text"
                required
                value={incidentTitle}
                onChange={(e) => setIncidentTitle(e.target.value)}
                className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-[#9AA7BA]">Severity</span>
              <select
                value={incidentSeverity}
                onChange={(e) => setIncidentSeverity(e.target.value)}
                className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
              >
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
                <option value="Info">Info</option>
              </select>
            </label>
          </div>
          <label className="space-y-1 block">
            <span className="text-[#9AA7BA]">Field Notes &amp; Action Taken</span>
            <textarea
              rows={2}
              required
              value={incidentNotes}
              onChange={(e) => setIncidentNotes(e.target.value)}
              className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 font-bold text-slate-950 transition"
          >
            <ShieldAlert className="w-4 h-4" /> Submit Field Incident Report
          </button>
        </form>
      </ChartCard>
    </div>
  );
}
