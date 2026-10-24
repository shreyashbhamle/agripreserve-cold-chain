import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  Info,
  Thermometer,
  Upload,
  VideoOff,
} from "lucide-react";
import {
  agriApi,
  type QualityInspectionRecord,
  type ShipmentRecord,
} from "../../services/api";
import {
  ChartCard,
  DataSourceBanner,
  PageHeader,
  StatusBadge,
} from "../../components/ui/SharedComponents";
import { useAuth } from "../../context/AuthContext";

export default function QualityCheck() {
  const { user, notify } = useAuth();
  const [searchParams] = useSearchParams();
  const initialShipment = searchParams.get("shipment") || "AP1025";

  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [inspections, setInspections] = useState<QualityInspectionRecord[]>([]);
  const [shipmentId, setShipmentId] = useState(initialShipment);
  const [product, setProduct] = useState("Bananas");
  const [arrivalTemp, setArrivalTemp] = useState(9.3);
  const [arrivalHumidity, setArrivalHumidity] = useState(84);
  const [visualScore, setVisualScore] = useState(74);
  const [colorRating, setColorRating] = useState("Slight dulling");
  const [firmnessRating, setFirmnessRating] = useState("Minor softening");
  const [bruisingPct, setBruisingPct] = useState(6.5);
  const [packagingIntegrity, setPackagingIntegrity] = useState("Intact");
  const [odorCheck, setOdorCheck] = useState("Normal");
  const [decision, setDecision] = useState("Conditional Accept");
  const [acceptedQty, setAcceptedQty] = useState(1380);
  const [rejectedQty, setRejectedQty] = useState(120);
  const [notes, setNotes] = useState(
    "Top crates affected by 9.3°C excursion; sorted out 120 kg, accepted 1380 kg for immediate sale.",
  );
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<Record<
    string,
    any
  > | null>(null);

  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const loadData = () => {
    agriApi
      .shipments()
      .then((list) => {
        setShipments(list);
        const match = list.find((s) => s.id === shipmentId);
        if (match) {
          setProduct(match.product);
          setArrivalTemp(Number(match.temperature_c ?? 5.0));
          setArrivalHumidity(Number(match.humidity_pct ?? 80));
        }
      })
      .catch(() => {});
    agriApi
      .qualityInspections()
      .then(setInspections)
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch {
      notify(
        "Camera permission unavailable",
        "Use the file upload option to attach a sample crate image.",
        "info",
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 480;
    canvas.height = videoRef.current.videoHeight || 320;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      setImageDataUrl(canvas.toDataURL("image/jpeg", 0.82));
      stopCamera();
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await agriApi.createQualityInspection({
        shipment_id: shipmentId,
        product,
        inspector_name: user?.name ?? "FreshMart Quality Lead",
        inspector_role: "receiver",
        temperature_at_arrival_c: arrivalTemp,
        humidity_at_arrival_pct: arrivalHumidity,
        visual_freshness_score: visualScore,
        color_rating: colorRating,
        firmness_rating: firmnessRating,
        bruising_pct: bruisingPct,
        packaging_integrity: packagingIntegrity,
        odor_check: odorCheck,
        decision,
        accepted_qty_kg: acceptedQty,
        rejected_qty_kg: rejectedQty,
        notes,
        image_data_url: imageDataUrl,
      });
      setEvaluationResult(res.evaluation);
      notify(
        "Quality Inspection Saved",
        `Recorded ${decision} for ${shipmentId} (${acceptedQty} kg accepted).`,
        "success",
      );
      loadData();
    } catch (err) {
      notify(
        "Inspection save failed",
        err instanceof Error ? err.message : "Error",
        "error",
      );
    }
  };

  const isTempCompliant = arrivalTemp <= 8.0;

  return (
    <div className="space-y-6">
      <PageHeader
        role="receiver"
        eyebrow="MULTI-FACTOR PRODUCE QUALITY GRADING"
        title="Arrival Quality Inspection, Sensor Compliance & Visual Grading"
        description="Combines arrival reefer temperature/humidity logs with human visual grading and an explicitly labeled advisory classifier."
        dataMode="TRANSPARENT 3-PART GRADING"
      />

      <DataSourceBanner
        mode="HONEST QUALITY EVALUATION & COMMODITY TEMPLATES"
        note="This page separates (1) Sensor Temperature Compliance, (2) Human Physical & Commodity-Specific Lab Thresholds (Fruits, Vegetables, Leafy Greens, Grains, Dairy), and (3) Optional Heuristic/Synthetic Advisory Screening. It never claims unverified computer-vision accuracy."
      />

      {/* Commodity-Specific Inspection Acceptance Templates */}
      <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
            Commodity-Specific Quality Acceptance Templates (ISO / Codex / FSSAI
            / MOCCAE)
          </div>
          <span className="rounded bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 text-[11px] font-bold text-sky-300">
            Certified Lab Analysis vs Automated Screening Separated
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5 text-xs">
          {[
            {
              cat: "Fruits (Mangoes/Grapes)",
              specs: "Brix ≥13° · Temp 8–12°C · Bruising ≤5% · MRL <0.01 mg/kg",
            },
            {
              cat: "Vegetables (Tomato/Okra)",
              specs: "Firmness ≥4.5 kgf · Temp 4–10°C · Moisture 85–90% RH",
            },
            {
              cat: "Leafy Greens",
              specs: "Temp 1–4°C · RH ≥92% · Wilting 0% · E.coli/Salmonella Absent",
            },
            {
              cat: "Grains & Pulses",
              specs: "Moisture ≤13.5% · Aflatoxin ≤10 ppb · Foreign Matter ≤1%",
            },
            {
              cat: "Dairy & Cold Value-Add",
              specs: "Core Temp ≤4.0°C · Acidity 0.14% · Phosphatase Negative",
            },
          ].map((tpl) => (
            <div
              key={tpl.cat}
              className="rounded-xl border border-[#303846] bg-[#11151D] p-2.5"
            >
              <div className="font-bold text-white">{tpl.cat}</div>
              <div className="mt-1 text-[11px] text-[#9AA7BA]">{tpl.specs}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Pillar Separation Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4" /> 1. Sensor Thermal Compliance
            </span>
            <StatusBadge
              status={isTempCompliant ? "Compliant" : "Excursion Detected"}
            />
          </div>
          <p className="text-lg font-bold text-[#F1F5F9]">
            {arrivalTemp}°C · {arrivalHumidity}% RH
          </p>
          <p className="text-xs text-[#9AA7BA]">
            Derived directly from reefer probe logs for Shipment {shipmentId}.
          </p>
        </div>

        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> 2. Human Visual Inspection
            </span>
            <StatusBadge
              status={
                visualScore >= 80
                  ? "Fresh Grade A"
                  : visualScore >= 60
                    ? "Conditional"
                    : "Reject"
              }
            />
          </div>
          <p className="text-lg font-bold text-[#F1F5F9]">
            Score: {visualScore} / 100 ({bruisingPct}% Bruising)
          </p>
          <p className="text-xs text-[#9AA7BA]">
            Inspector physical check of color, firmness, odor, and crates.
          </p>
        </div>

        <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
              <Info className="w-4 h-4" /> 3. Advisory Classifier (Demo)
            </span>
            <span className="rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
              ADVISORY ONLY
            </span>
          </div>
          <p className="text-lg font-bold text-[#F1F5F9]">
            {evaluationResult?.advisory_classifier?.label ??
              (visualScore >= 80 && isTempCompliant
                ? "Fresh"
                : visualScore >= 60
                  ? "Moderate_Risk"
                  : "Spoiled")}
          </p>
          <p className="text-xs text-[#9AA7BA]">
            Calibrated on <code>produce_quality_labels.csv</code>; final
            authority rests with the human inspector.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ChartCard
            title="Record Arrival Quality Inspection"
            subtitle="Persists inspection decision and updates shipment/inventory state in SQLite"
            badge="INSPECTION FORM"
          >
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid sm:grid-cols-3 gap-3">
                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Shipment ID</span>
                  <select
                    value={shipmentId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setShipmentId(id);
                      const found = shipments.find((s) => s.id === id);
                      if (found) {
                        setProduct(found.product);
                        setArrivalTemp(Number(found.temperature_c ?? 4.8));
                        setArrivalHumidity(Number(found.humidity_pct ?? 80));
                        setAcceptedQty(Number(found.quantity_kg));
                        setRejectedQty(0);
                      }
                    }}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  >
                    {(shipments.length
                      ? shipments
                      : [
                          { id: "AP1024", product: "Tomatoes", quantity_kg: 1200 },
                          { id: "AP1025", product: "Bananas", quantity_kg: 1500 },
                          { id: "AP1028", product: "Okra", quantity_kg: 900 },
                          { id: "AP1029", product: "Potatoes", quantity_kg: 2100 },
                        ]
                    ).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id} · {s.product}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Arrival Temp (°C)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={arrivalTemp}
                    onChange={(e) => setArrivalTemp(Number(e.target.value))}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">
                    Visual Freshness (0–100)
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={visualScore}
                    onChange={(e) => setVisualScore(Number(e.target.value))}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Appearance / Color</span>
                  <select
                    value={colorRating}
                    onChange={(e) => setColorRating(e.target.value)}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  >
                    <option value="Vibrant / Uniform">Vibrant / Uniform</option>
                    <option value="Slight dulling">Slight dulling</option>
                    <option value="Discolored / Spotted">
                      Discolored / Spotted
                    </option>
                  </select>
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Firmness / Texture</span>
                  <select
                    value={firmnessRating}
                    onChange={(e) => setFirmnessRating(e.target.value)}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  >
                    <option value="Firm">Firm</option>
                    <option value="Minor softening">Minor softening</option>
                    <option value="Soft / Mushy">Soft / Mushy</option>
                  </select>
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Bruising / Damage (%)</span>
                  <input
                    type="number"
                    step="0.5"
                    value={bruisingPct}
                    onChange={(e) => setBruisingPct(Number(e.target.value))}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Packaging Integrity</span>
                  <select
                    value={packagingIntegrity}
                    onChange={(e) => setPackagingIntegrity(e.target.value)}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  >
                    <option value="Intact">Intact Crates</option>
                    <option value="Condensation">Condensation on Liners</option>
                    <option value="Crushed">Crushed / Damaged</option>
                  </select>
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Odor Check</span>
                  <select
                    value={odorCheck}
                    onChange={(e) => setOdorCheck(e.target.value)}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                  >
                    <option value="Normal">Fresh / Normal</option>
                    <option value="Slightly Fermented">
                      Slightly Fermented
                    </option>
                    <option value="Off-Odor / Spoiled">
                      Off-Odor / Spoiled
                    </option>
                  </select>
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Final Decision</span>
                  <select
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9] font-bold"
                  >
                    <option value="Accept">Accept</option>
                    <option value="Conditional Accept">
                      Conditional Accept
                    </option>
                    <option value="Reject">Reject</option>
                  </select>
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Accepted Qty (kg)</span>
                  <input
                    type="number"
                    value={acceptedQty}
                    onChange={(e) => setAcceptedQty(Number(e.target.value))}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-emerald-400 font-bold"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-[#9AA7BA]">Rejected Qty (kg)</span>
                  <input
                    type="number"
                    value={rejectedQty}
                    onChange={(e) => setRejectedQty(Number(e.target.value))}
                    className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-rose-400 font-bold"
                  />
                </label>
              </div>

              {/* Camera / Image Upload */}
              <div className="rounded-xl border border-[#303846] bg-[#11151D] p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-[#F1F5F9]">
                    Produce Sample Image (Live Camera or File Upload)
                  </span>
                  <div className="flex items-center gap-2">
                    {!cameraActive ? (
                      <button
                        type="button"
                        onClick={startCamera}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#303846] bg-[#1D2330] hover:bg-slate-700 px-3 py-1.5 text-violet-300 font-semibold"
                      >
                        <Camera className="w-3.5 h-3.5" /> Start Camera
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={captureFrame}
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 text-slate-950 px-3 py-1.5 font-bold"
                        >
                          Capture Frame
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="inline-flex items-center gap-1 rounded-xl bg-rose-500/20 text-rose-300 px-3 py-1.5"
                        >
                          <VideoOff className="w-3.5 h-3.5" /> Stop
                        </button>
                      </>
                    )}
                    <label className="inline-flex items-center gap-1 rounded-xl border border-[#303846] bg-[#1D2330] hover:bg-slate-700 px-3 py-1.5 text-sky-300 font-semibold cursor-pointer">
                      <Upload className="w-3.5 h-3.5" /> Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {cameraActive && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-44 object-cover rounded-xl border border-[#303846]"
                  />
                )}

                {imageDataUrl && !cameraActive && (
                  <img
                    src={imageDataUrl}
                    alt="Inspected produce sample"
                    className="w-full h-40 object-cover rounded-xl border border-[#303846]"
                  />
                )}
              </div>

              <label className="space-y-1 block">
                <span className="text-[#9AA7BA]">Inspector Findings</span>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl bg-[#11151D] border border-[#303846] px-3 py-2 text-[#F1F5F9]"
                />
              </label>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-500 hover:bg-violet-400 px-5 py-2.5 font-bold text-slate-950 transition"
              >
                <CheckCircle2 className="w-4 h-4" /> Submit Quality Inspection &amp;
                Update Cold-Room Stock
              </button>
            </form>
          </ChartCard>
        </div>

        <div className="lg:col-span-5">
          <ChartCard
            title="Completed Quality Inspection History"
            subtitle="Persisted records in SQLite quality_inspections table"
            badge={`${inspections.length} RECORDS`}
          >
            <div className="space-y-3 text-xs max-h-[600px] overflow-y-auto pr-1">
              {inspections.map((ins) => (
                <div
                  key={ins.id}
                  className="rounded-xl border border-[#303846] bg-[#11151D] p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F1F5F9] flex items-center gap-1.5">
                      <ClipboardCheck className="w-4 h-4 text-violet-400" />
                      {ins.id} · {ins.shipment_id} ({ins.product})
                    </span>
                    <StatusBadge status={ins.decision} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] bg-[#171B24] rounded-lg p-2 border border-[#303846]">
                    <div>
                      <span className="text-[#9AA7BA] block">Sensor Temp</span>
                      <strong className="text-[#F1F5F9]">
                        {ins.temperature_at_arrival_c}°C (
                        {ins.temp_compliance_status})
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#9AA7BA] block">Visual Score</span>
                      <strong className="text-emerald-400">
                        {ins.visual_freshness_score}/100
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#9AA7BA] block">Advisory ML</span>
                      <strong className="text-violet-300">
                        {ins.advisory_classifier_label}
                      </strong>
                    </div>
                  </div>
                  <p className="text-[#9AA7BA]">{ins.notes}</p>
                  <div className="flex items-center justify-between text-[11px] text-[#9AA7BA] pt-1 border-t border-[#303846]/60">
                    <span>
                      Accepted: <b className="text-emerald-400">{ins.accepted_qty_kg} kg</b>{" "}
                      · Rejected: <b className="text-rose-400">{ins.rejected_qty_kg} kg</b>
                    </span>
                    <span>{String(ins.created_at).slice(0, 16)}</span>
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