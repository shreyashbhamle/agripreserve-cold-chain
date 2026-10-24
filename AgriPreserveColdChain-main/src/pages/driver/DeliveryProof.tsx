import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, CheckCircle2, ClipboardCheck, Upload } from "lucide-react";
import {
  agriApi,
  type DeliveryProofRecord,
  type ShipmentRecord,
} from "../../services/api";
import {
  ChartCard,
  PageHeader,
  StatusBadge,
} from "../../components/ui/SharedComponents";
import { useAuth } from "../../context/AuthContext";

export default function DeliveryProof() {
  const { user, notify } = useAuth();
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [proofs, setProofs] = useState<DeliveryProofRecord[]>([]);
  const [shipmentId, setShipmentId] = useState("AP1024");
  const [receiverName, setReceiverName] = useState("FreshMart Dock Supervisor");
  const [designation, setDesignation] = useState("Cold-Room Receiving Lead");
  const [receivedQty, setReceivedQty] = useState(1200);
  const [arrivalTemp, setArrivalTemp] = useState(4.6);
  const [conditionNotes, setConditionNotes] = useState(
    "Crates intact, reefer seal unbroken, arrival pulp temperature within 4–5°C band.",
  );
  const [signature, setSignature] = useState(
    "Signed Digitally — FreshMart Bay 2",
  );
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadData = () => {
    agriApi
      .shipments()
      .then((list) => setShipments(list))
      .catch(() => {});
    agriApi
      .deliveryProofs()
      .then(setProofs)
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoDataUrl(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      notify(
        "Confirmation required",
        "Please check the handover confirmation box before submitting.",
        "warning",
      );
      return;
    }
    setBusy(true);
    try {
      await agriApi.createDeliveryProof({
        shipment_id: shipmentId,
        driver_name: user?.name ?? "Amit Driver",
        receiver_name: receiverName,
        recipient_designation: designation,
        received_quantity_kg: receivedQty,
        arrival_temperature_c: arrivalTemp,
        condition_notes: conditionNotes,
        signature_text: signature,
        photo_data_url: photoDataUrl,
        latitude: 18.5204,
        longitude: 73.8567,
      });
      notify(
        "Delivery Proof Persisted",
        `POD recorded for ${shipmentId} and shipment marked as Delivered in SQLite.`,
        "success",
      );
      loadData();
    } catch (err) {
      notify(
        "POD submission failed",
        err instanceof Error ? err.message : "Error",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        role="driver"
        eyebrow="DIGITAL PROOF OF DELIVERY (POD)"
        title="Cold-Chain Handover & Delivery Proof Submission"
        description="Record recipient sign-off, arrival pulp temperature, accepted quantity, and cargo photo evidence. Persists to SQLite and marks the shipment as Delivered."
        dataMode="SQLITE POD LEDGER"
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ChartCard
            title="Submit Digital Proof of Delivery"
            subtitle="Updates shipment status to Delivered and notifies Farmer & Receiver"
            badge="POD FORM"
          >
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Shipment ID</span>
                  <select
                    value={shipmentId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setShipmentId(id);
                      const found = shipments.find((s) => s.id === id);
                      if (found) {
                        setReceivedQty(Number(found.quantity_kg));
                        setArrivalTemp(Number(found.temperature_c ?? 4.6));
                      }
                    }}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  >
                    {(shipments.length
                      ? shipments
                      : [
                          { id: "AP1024", product: "Tomatoes", quantity_kg: 1200 },
                          { id: "AP1025", product: "Bananas", quantity_kg: 1500 },
                          { id: "AP1029", product: "Potatoes", quantity_kg: 2100 },
                        ]
                    ).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id} · {s.product} ({s.quantity_kg} kg)
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Recipient Name</span>
                  <input
                    type="text"
                    required
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">
                    Accepted Quantity (kg)
                  </span>
                  <input
                    type="number"
                    required
                    value={receivedQty}
                    onChange={(e) => setReceivedQty(Number(e.target.value))}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">
                    Arrival Temperature (°C)
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={arrivalTemp}
                    onChange={(e) => setArrivalTemp(Number(e.target.value))}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Recipient Designation</span>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Digital Sign-Off Text</span>
                  <input
                    type="text"
                    required
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>
              </div>

              <label className="space-y-1 block">
                <span className="text-[#9AA7BA]">
                  Cargo Condition &amp; Seal Handover Notes
                </span>
                <textarea
                  rows={2}
                  required
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                  className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                />
              </label>

              <div className="rounded-xl border border-dashed border-[#303846] bg-[#11151D] p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Camera className="w-4 h-4 text-sky-400" />
                  <div>
                    <p className="font-semibold text-[#F1F5F9]">
                      Attach Arrival Crate / Seal Photo (Optional)
                    </p>
                    <p className="text-[11px] text-[#9AA7BA]">
                      Upload image from mobile camera or file system
                    </p>
                  </div>
                </div>
                <label className="inline-flex items-center gap-1.5 rounded-xl bg-[#1D2330] hover:bg-slate-700 border border-[#303846] px-3 py-1.5 font-semibold text-sky-300 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> Choose Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {photoDataUrl && (
                <div className="rounded-xl overflow-hidden border border-[#303846] max-h-40">
                  <img
                    src={photoDataUrl}
                    alt="POD attachment preview"
                    className="h-36 w-full object-cover"
                  />
                </div>
              )}

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-[#F1F5F9]">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-900 text-sky-500"
                />
                <span>
                  I confirm that the cargo seal was inspected at the receiving
                  dock and the temperature reading above was verified.
                </span>
              </label>

              <button
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 px-5 py-2.5 font-bold text-slate-950 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                {busy
                  ? "Submitting POD..."
                  : "Submit Delivery Proof & Mark Delivered"}
              </button>
            </form>
          </ChartCard>
        </div>

        <div className="lg:col-span-5">
          <ChartCard
            title="Submitted Delivery Proof Ledger"
            subtitle="Verified POD records persisted in SQLite"
            badge={`${proofs.length} PODS`}
          >
            <div className="space-y-3 text-xs">
              {proofs.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-[#303846] bg-[#11151D] p-3.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F1F5F9] flex items-center gap-1.5">
                      <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                      {p.id} · Shipment {p.shipment_id}
                    </span>
                    <StatusBadge status="Delivered" />
                  </div>
                  <p className="text-[#F1F5F9]">
                    Accepted: <b>{p.received_quantity_kg} kg</b> at{" "}
                    <b>{p.arrival_temperature_c}°C</b>
                  </p>
                  <p className="text-[#9AA7BA]">{p.condition_notes}</p>
                  <div className="pt-1 border-t border-[#303846]/60 flex items-center justify-between text-[11px] text-[#9AA7BA]">
                    <span>Signed: {p.receiver_name}</span>
                    <span>{String(p.delivered_at).slice(0, 16)}</span>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}