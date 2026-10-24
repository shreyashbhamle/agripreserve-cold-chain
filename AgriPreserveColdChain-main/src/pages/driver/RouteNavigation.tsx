import { Compass, MapPin, Navigation } from "lucide-react";
import ShipmentMap from "../../components/maps/ShipmentMap";
import {
  ChartCard,
  DataSourceBanner,
  PageHeader,
} from "../../components/ui/SharedComponents";

export default function RouteNavigation() {
  const checkpoints = [
    {
      step: "1",
      name: "Nashik Packhouse Collection Hub",
      distance: "0 km (Origin)",
      status: "Departed · Pre-cooled at 4.2°C",
    },
    {
      step: "2",
      name: "Pimpalgaon / Sangamner Cold Layby",
      distance: "62 km",
      status: "Passed · Reefer seal verified",
    },
    {
      step: "3",
      name: "Chakan / Pune Cold Storage Hub",
      distance: "148 km",
      status: "Next Checkpoint · Priority Bay 2",
    },
    {
      step: "4",
      name: "Vashi / Mumbai Retail Distribution Terminal",
      distance: "212 km (Destination)",
      status: "Scheduled Arrival",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        role="driver"
        eyebrow="OSRM ROAD ROUTING & CORRIDOR CHECKPOINTS"
        title="Route Navigation & Cold-Chain Checkpoints"
        description="Road-following route visualization powered by OpenStreetMap & OSRM with designated cold-storage laybys and emergency re-icing hubs."
        dataMode="OSRM + DEMO GPS"
      />

      <DataSourceBanner
        mode="DEMO CORRIDOR COORDINATES"
        note="Route geometry is fetched from OSRM along the Nashik–Pune–Mumbai corridor. Click 'Browser GPS' on the map header to plot your current device coordinates."
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ShipmentMap />
        </div>
        <div className="lg:col-span-4">
          <ChartCard
            title="Corridor Turn-by-Turn & Cold Hub Checkpoints"
            subtitle="Designated safe stopping points with backup reefer power"
            badge="4 CHECKPOINTS"
          >
            <div className="space-y-3 text-xs">
              {checkpoints.map((cp) => (
                <div
                  key={cp.step}
                  className="rounded-xl border border-[#303846] bg-[#11151D] p-3.5 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-400 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" /> Stop {cp.step}:{" "}
                      {cp.name}
                    </span>
                    <span className="text-[11px] font-mono text-[#9AA7BA]">
                      {cp.distance}
                    </span>
                  </div>
                  <p className="text-[#9AA7BA] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" /> {cp.status}
                  </p>
                </div>
              ))}
              <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-3 text-sky-200 flex items-start gap-2">
                <Navigation className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Advisory: Avoid opening rear cargo doors during highway rest
                  stops. If temperature exceeds 8°C for &gt;15 min, divert to
                  Pune Cold Hub.
                </span>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}