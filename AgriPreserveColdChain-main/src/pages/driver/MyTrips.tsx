import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardCheck, MapPin, Truck } from "lucide-react";
import {
  agriApi,
  downloadCsv,
  type ShipmentRecord,
} from "../../services/api";
import {
  ExportButton,
  PageHeader,
  StatusBadge,
} from "../../components/ui/SharedComponents";

export default function MyTrips() {
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);

  useEffect(() => {
    agriApi
      .shipments()
      .then(setShipments)
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        role="driver"
        eyebrow="FLEET TRIP LEDGER"
        title="My Assigned & Completed Cold-Chain Trips"
        description="Review active and completed reefer dispatches, thermal compliance ratings, and Proof of Delivery status."
        actions={
          <ExportButton
            label="Export Trips CSV"
            onClick={() =>
              downloadCsv(
                "agripreserve_driver_trips.csv",
                shipments as unknown as Array<Record<string, unknown>>,
              )
            }
          />
        }
      />

      <div className="rounded-2xl border border-[#303846] bg-[#171B24] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#303846] bg-[#11151D] text-[#9AA7BA]">
                <th className="py-3.5 px-4">Trip / Shipment</th>
                <th className="py-3.5 px-4">Cargo &amp; Weight</th>
                <th className="py-3.5 px-4">Corridor Route</th>
                <th className="py-3.5 px-4">Driver</th>
                <th className="py-3.5 px-4">Reefer Telemetry</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#303846]/60">
              {shipments.map((s) => (
                <tr key={s.id} className="hover:bg-[#1D2330]/60 transition">
                  <td className="py-3.5 px-4 font-bold text-[#F1F5F9]">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-sky-400" />
                      {s.id}
                    </span>
                    <span className="text-[11px] font-normal text-[#9AA7BA]">
                      ETA: {s.eta}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-[#F1F5F9]">{s.product}</p>
                    <p className="text-[#9AA7BA]">{s.quantity_kg} kg</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[#F1F5F9]">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      {s.origin} → {s.destination}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#9AA7BA]">{s.driver}</td>
                  <td className="py-3.5 px-4 font-mono text-[#F1F5F9]">
                    {s.temperature_c ?? "--"}°C · {s.humidity_pct ?? "--"}% RH
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to="/driver/delivery-proof"
                      className="inline-flex items-center gap-1 rounded-xl border border-[#303846] bg-[#1D2330] hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-sky-300"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" /> POD
                    </Link>
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