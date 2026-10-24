import { useEffect, useState } from "react";
import {
  MapPinned,
  Navigation,
  Thermometer,
  Truck,
} from "lucide-react";
import { agriApi, type ShipmentRecord } from "../../services/api";
import {
  ChartCard,
  DataSourceBanner,
  PageHeader,
  StatusBadge,
} from "../../components/ui/SharedComponents";
import ShipmentMap from "../../components/maps/ShipmentMap";
import SensorMonitor from "../../iot/components/SensorMonitor";

export default function LiveTracking() {
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [selectedId, setSelectedId] = useState("AP1024");

  useEffect(() => {
    agriApi
      .shipments()
      .then((list) => {
        setShipments(list);
        if (list.length && !list.some((s) => s.id === selectedId)) {
          setSelectedId(list[0].id);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current =
    shipments.find((s) => s.id === selectedId) ?? shipments[0] ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        role="admin"
        eyebrow="GIS CORRIDOR & IOT TELEMETRY"
        title="Live Fleet Tracking & Sensor Node Telemetry"
        description="Interactive OpenStreetMap & Satellite corridor visualization paired with ESP32/LoRaWAN reefer telemetry simulation."
        dataMode="DEMO GPS & SIMULATED IOT"
      />

      <DataSourceBanner
        mode="DEMO CORRIDOR COORDINATES"
        note="Vehicle coordinates and OSRM routes illustrate the Nashik–Pune–Mumbai supply corridor from sensor_readings.csv. Click 'Browser GPS' on the map to plot your live device location."
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ShipmentMap selectedShipmentId={selectedId} />
        </div>

        <div className="lg:col-span-4 space-y-4">
          <ChartCard
            title="Select Active Corridor Vehicle"
            subtitle="Click a shipment to center map and inspect reefer status"
            badge="7 VEHICLES"
          >
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {shipments.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full text-left rounded-xl border p-3 transition flex items-center justify-between gap-2 text-xs ${
                    selectedId === s.id
                      ? "border-emerald-500 bg-emerald-500/10 text-[#F1F5F9]"
                      : "border-[#303846] bg-[#11151D] text-[#9AA7BA] hover:text-white"
                  }`}
                >
                  <div>
                    <p className="font-bold text-[#F1F5F9] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      {s.id} · {s.product}
                    </p>
                    <p className="text-[11px] text-[#9AA7BA] mt-0.5">
                      {s.origin} → {s.destination} ({s.driver})
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={s.status} />
                    <p className="font-mono text-[11px] text-[#F1F5F9] mt-1">
                      {s.temperature_c ?? "--"}°C · {s.humidity_pct ?? "--"}%
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </ChartCard>

          {current && (
            <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" /> Selected Vehicle:{" "}
                  {current.id}
                </span>
                <span className="font-mono text-[#9AA7BA]">
                  ETA: {current.eta}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="rounded-lg bg-[#11151D] border border-[#303846] p-2.5">
                  <span className="text-[#9AA7BA] block text-[10px]">
                    Coordinates (Demo)
                  </span>
                  <strong className="text-[#F1F5F9] flex items-center gap-1 mt-0.5">
                    <MapPinned className="w-3 h-3 text-sky-400" />
                    {current.latitude ?? 19.99}, {current.longitude ?? 73.78}
                  </strong>
                </div>
                <div className="rounded-lg bg-[#11151D] border border-[#303846] p-2.5">
                  <span className="text-[#9AA7BA] block text-[10px]">
                    Cargo Environment
                  </span>
                  <strong className="text-[#F1F5F9] flex items-center gap-1 mt-0.5">
                    <Thermometer className="w-3 h-3 text-amber-400" />
                    {current.temperature_c ?? "--"}°C /{" "}
                    {current.humidity_pct ?? "--"}% RH
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Sensor Fleet Monitor & Simulator */}
      <SensorMonitor />
    </div>
  );
}