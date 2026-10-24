import { useEffect, useRef, useState } from "react";
import {
  LocateFixed,
  Satellite,
  Map as MapIcon,
  Wifi,
  WifiOff,
  Navigation,
  Globe,
  Anchor,
  Plane,
} from "lucide-react";
import { agriIntelligenceApi } from "../../services/api";

declare global {
  interface Window {
    L?: any;
  }
}

type MapMode = "street" | "satellite";
type CorridorView = "international" | "domestic";

const NASHIK: [number, number] = [19.9975, 73.7898];
const PUNE: [number, number] = [18.5204, 73.8567];
const MUMBAI: [number, number] = [19.076, 72.8777];
const JNPT_PORT: [number, number] = [18.949, 72.9512];
const ARABIAN_SEA_WP1: [number, number] = [20.5, 67.8];
const ARABIAN_SEA_WP2: [number, number] = [23.4, 60.5];
const STRAIT_OF_HORMUZ: [number, number] = [26.2, 56.4];
const JEBEL_ALI_PORT: [number, number] = [25.0132, 55.0612];
const DUBAI_AL_AWEER: [number, number] = [25.1753, 55.405];
const AHMEDNAGAR: [number, number] = [19.0948, 74.748];

function loadLeaflet(): Promise<void> {
  if (window.L) return Promise.resolve();
  const cssId = "leaflet-css-cdn";
  if (!document.getElementById(cssId)) {
    const link = document.createElement("link");
    link.id = cssId;
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(
      "leaflet-js-cdn",
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      if (window.L) resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = "leaflet-js-cdn";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new Error(
          "Could not load map library. Check your internet connection.",
        ),
      );
    document.body.appendChild(script);
  });
}

export default function ShipmentMap({
  compact = false,
  showStatus = true,
  selectedShipmentId,
  defaultCorridor = "international",
}: {
  compact?: boolean;
  showStatus?: boolean;
  selectedShipmentId?: string;
  defaultCorridor?: CorridorView;
}) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const tileRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [mode, setMode] = useState<MapMode>("street");
  const [corridor, setCorridor] = useState<CorridorView>(
    selectedShipmentId && !selectedShipmentId.includes("INTL")
      ? "domestic"
      : defaultCorridor,
  );
  const [mapError, setMapError] = useState("");
  const [refreshedAt, setRefreshedAt] = useState("Connecting to map tiles…");
  const [browserGpsStatus, setBrowserGpsStatus] = useState("");

  useEffect(() => {
    if (selectedShipmentId) {
      setCorridor(
        selectedShipmentId.includes("INTL") ? "international" : "domestic",
      );
    }
  }, [selectedShipmentId]);

  useEffect(() => {
    let disposed = false;
    let map: any;
    loadLeaflet()
      .then(() => {
        if (disposed || !mapNode.current || !window.L) return;
        const L = window.L;
        const initialCenter: [number, number] =
          corridor === "international" ? [22.2, 64.5] : [19.35, 73.55];
        const initialZoom = corridor === "international" ? 5 : 7;

        map = L.map(mapNode.current, {
          zoomControl: true,
          scrollWheelZoom: true,
        }).setView(initialCenter, initialZoom);
        mapRef.current = map;

        const street = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 19,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        );
        const satellite = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 19,
            attribution:
              "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics",
          },
        );
        tileRef.current = { street, satellite };
        (mode === "satellite" ? satellite : street).addTo(map);

        const markersGroup = L.layerGroup().addTo(map);
        markersLayerRef.current = markersGroup;

        const pointIcon = (emoji: string, color: string) =>
          L.divIcon({
            className: "agri-map-pin-wrap",
            html: `<div style="width:36px;height:36px;border-radius:50% 50% 50% 8px;transform:rotate(-45deg);background:${color};border:2.5px solid #0E1117;box-shadow:0 5px 16px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:16px">${emoji}</span></div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 34],
            popupAnchor: [0, -32],
          });

        // Hub markers for Domestic & International Origin
        L.marker(NASHIK, { icon: pointIcon("🌿", "#10B981") })
          .addTo(markersGroup)
          .bindPopup(
            "<b>Sahyadri Export Packhouse & Farm Hub</b><br/>Pimpalgaon Baswant, Nashik, India<br/><small>APEDA Certified · Pre-Cooling & Phytosanitary Station</small>",
          );
        L.marker(PUNE, { icon: pointIcon("❄", "#A78BFA") })
          .addTo(markersGroup)
          .bindPopup(
            "<b>Pune Cold Storage & Consolidation Hub</b><br/>Chakan MIDC, Maharashtra",
          );
        L.marker(JNPT_PORT, { icon: pointIcon("⚓", "#0EA5E9") })
          .addTo(markersGroup)
          .bindPopup(
            "<b>JNPT Nhava Sheva Seaport (INNSA)</b><br/>Navi Mumbai, India · Export Customs & Reefer Yard<br/><small>ICEGATE Let Export Order (LEO) Gate</small>",
          );

        // International UAE / Arabian Sea Corridor markers & multimodal legs
        L.marker(JEBEL_ALI_PORT, { icon: pointIcon("🚢", "#F59E0B") })
          .addTo(markersGroup)
          .bindPopup(
            "<b>Jebel Ali Port Terminal 2 (AEJEA)</b><br/>Dubai, UAE · Import Customs & MOCCAE Biosecurity<br/><small>India-UAE CEPA 0% Duty Corridor</small>",
          );
        L.marker(DUBAI_AL_AWEER, { icon: pointIcon("🏬", "#10B981") })
          .addTo(markersGroup)
          .bindPopup(
            "<b>Al Maya / FreshMart Central Cold Hub</b><br/>Al Aweer Fruit & Vegetable Market, Dubai, UAE<br/><small>Final-Mile Reefer Receiving Dock</small>",
          );

        // Leg 1: Origin Road Drayage (Nashik -> JNPT)
        const originRoadLeg = L.polyline([NASHIK, JNPT_PORT, PUNE, MUMBAI], {
          color: "#10b981",
          weight: 4,
          opacity: 0.9,
          dashArray: "8 6",
        }).addTo(map);

        // Leg 2: Ocean CA Reefer Lane (JNPT -> Arabian Sea -> Hormuz -> Jebel Ali)
        L.polyline(
          [
            JNPT_PORT,
            ARABIAN_SEA_WP1,
            ARABIAN_SEA_WP2,
            STRAIT_OF_HORMUZ,
            JEBEL_ALI_PORT,
          ],
          {
            color: "#38BDF8",
            weight: 4,
            opacity: 0.92,
            dashArray: "12 8",
          },
        )
          .addTo(map)
          .bindPopup(
            "<b>Maritime Reefer Lane (INNSA → AEJEA)</b><br/>1,950 km (1,050 NM) · 40ft CA Container MAEU-CA-984120<br/><small>Waypoints for multimodal corridor visualization</small>",
          );

        // Leg 3: Air Cargo Alternative Corridor (BOM -> DWC)
        L.polyline([MUMBAI, DUBAI_AL_AWEER], {
          color: "#A78BFA",
          weight: 2.5,
          opacity: 0.55,
          dashArray: "4 8",
        })
          .addTo(map)
          .bindPopup(
            "<b>Alternative Air Cargo Corridor (BOM → DWC)</b><br/>Envirotainer LD3 Active ULD · 30 hrs total transit",
          );

        // Leg 4: Destination UAE Road Delivery (Jebel Ali -> Al Aweer Dubai)
        L.polyline([JEBEL_ALI_PORT, DUBAI_AL_AWEER], {
          color: "#F59E0B",
          weight: 4,
          opacity: 0.95,
        }).addTo(map);

        // Fetch shipment positions from backend
        agriIntelligenceApi
          .mapShipments()
          .then((payload) => {
            if (disposed || !window.L) return;
            const items = (payload.items as Array<Record<string, any>>) ?? [];
            items.forEach((s) => {
              const lat = Number(s.latitude ?? AHMEDNAGAR[0]);
              const lng = Number(s.longitude ?? AHMEDNAGAR[1]);
              const isSelected =
                selectedShipmentId && s.id === selectedShipmentId;
              const isIntl =
                Boolean(s.is_international) || String(s.id).includes("INTL");
              const isRisk =
                String(s.status).toLowerCase().includes("risk") ||
                Number(s.temperature_c ?? 4) > 12;
              const pinColor = isSelected
                ? "#F59E0B"
                : isIntl
                  ? "#0EA5E9"
                  : isRisk
                    ? "#F87171"
                    : "#2563EB";
              const emoji = isIntl ? "🚢" : "🚚";
              const marker = L.marker([lat, lng], {
                icon: pointIcon(emoji, pinColor),
              }).addTo(markersGroup);
              marker.bindPopup(
                `<b>${s.id} · ${s.product}</b><br/>${s.origin} → ${s.destination}<br/>Mode: <b>${s.transport_mode ?? "Road Reefer"}</b> · Incoterm: <b>${s.incoterm ?? "CIP"}</b><br/>Temp: <b>${s.temperature_c ?? "--"}°C</b> · RH: <b>${s.humidity_pct ?? "--"}%</b><br/>Status: <b>${s.status}</b><br/><small>Corridor waypoint / synthetic demo coordinates</small>`,
              );
              if (isSelected) {
                marker.openPopup();
                map.setView([lat, lng], isIntl ? 6 : 8);
              }
            });
          })
          .catch(() => {
            if (disposed || !window.L) return;
            L.marker(AHMEDNAGAR, { icon: pointIcon("🚚", "#2563eb") })
              .addTo(markersGroup)
              .bindPopup(
                "<b>Vehicle AP1024</b><br/>Sample position — not live GPS",
              );
          });

        // Try OSRM road route for Indian origin leg
        fetch(
          "https://router.project-osrm.org/route/v1/driving/73.7898,19.9975;72.9512,18.9490;73.8567,18.5204?overview=full&geometries=geojson",
        )
          .then((response) =>
            response.ok
              ? response.json()
              : Promise.reject(new Error("Routing unavailable")),
          )
          .then((data) => {
            if (disposed || !data.routes?.[0]?.geometry?.coordinates) return;
            const roadCoords = data.routes[0].geometry.coordinates.map(
              (point: [number, number]) => [point[1], point[0]],
            );
            originRoadLeg.setLatLngs(roadCoords);
            setRefreshedAt(
              `OSRM Road + Sea/Air Multimodal Corridors · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
            );
          })
          .catch(() => {
            if (!disposed)
              setRefreshedAt(
                `Multimodal Corridor Map · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
              );
          });

        setTimeout(() => map.invalidateSize(), 140);
      })
      .catch((error) =>
        setMapError(error.message || "Map could not be loaded."),
      );

    return () => {
      disposed = true;
      if (map) map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShipmentId, corridor]);

  useEffect(() => {
    const map = mapRef.current;
    const layers = tileRef.current;
    if (!map || !layers || !window.L) return;
    Object.values(layers).forEach((layer: any) => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });
    (mode === "satellite" ? layers.satellite : layers.street).addTo(map);
  }, [mode]);

  const locateBrowser = () => {
    if (!navigator.geolocation) {
      setBrowserGpsStatus("Browser geolocation API not supported.");
      return;
    }
    setBrowserGpsStatus("Requesting browser GPS permission…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setBrowserGpsStatus(
          `Browser GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        );
        if (mapRef.current && window.L) {
          window.L.circleMarker([latitude, longitude], {
            radius: 8,
            color: "#38BDF8",
            fillColor: "#38BDF8",
            fillOpacity: 0.8,
          })
            .addTo(mapRef.current)
            .bindPopup("<b>Your Browser GPS Location</b>")
            .openPopup();
          mapRef.current.setView([latitude, longitude], 10);
        }
      },
      () => {
        setBrowserGpsStatus(
          "Browser GPS declined — displaying trade corridor waypoints.",
        );
      },
    );
  };

  const height = compact ? "h-[280px]" : "h-[420px]";
  return (
    <section className="overflow-hidden rounded-2xl border border-[#303846] bg-[#171B24] shadow-lg">
      <div className="flex flex-col gap-3 border-b border-[#303846] bg-[#11151D] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#F1F5F9]">
            <LocateFixed className="h-4 w-4 text-emerald-400" />
            Global Multimodal Cold-Chain &amp; Trade Corridor Map
            <span className="rounded bg-[#1D2330] border border-[#303846] px-2 py-0.5 text-[10px] font-semibold text-amber-300">
              CORRIDOR WAYPOINTS &amp; DEMO TELEMETRY
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[#9AA7BA]">
            {corridor === "international"
              ? "India → UAE Multimodal Corridor: Nashik Packhouse · JNPT (INNSA) · Arabian Sea · Jebel Ali (AEJEA) · Dubai"
              : "Maharashtra Domestic Cold Corridor: Nashik · Pimpalgaon · Pune Cold Hub · Mumbai / Vashi"}
            {browserGpsStatus ? ` · ${browserGpsStatus}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCorridor("international")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              corridor === "international"
                ? "bg-sky-500 text-slate-950 shadow"
                : "border border-[#303846] bg-[#1D2330] text-[#9AA7BA] hover:text-white"
            }`}
          >
            <Globe className="h-3.5 w-3.5" /> India → UAE Trade Lane
          </button>
          <button
            type="button"
            onClick={() => setCorridor("domestic")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              corridor === "domestic"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "border border-[#303846] bg-[#1D2330] text-[#9AA7BA] hover:text-white"
            }`}
          >
            <Anchor className="h-3.5 w-3.5" /> Domestic Corridor
          </button>
          <button
            type="button"
            onClick={locateBrowser}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#303846] bg-[#1D2330] hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-sky-300 transition"
          >
            <Navigation className="h-3.5 w-3.5" /> Browser GPS
          </button>
          <button
            type="button"
            onClick={() => setMode("street")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${
              mode === "street"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "border border-[#303846] bg-[#1D2330] text-[#9AA7BA] hover:text-white"
            }`}
          >
            <MapIcon className="h-3.5 w-3.5" /> Street
          </button>
          <button
            type="button"
            onClick={() => setMode("satellite")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${
              mode === "satellite"
                ? "bg-sky-500 text-slate-950 shadow"
                : "border border-[#303846] bg-[#1D2330] text-[#9AA7BA] hover:text-white"
            }`}
          >
            <Satellite className="h-3.5 w-3.5" /> Satellite
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={mapNode}
          className={`${height} w-full bg-[#0E1117]`}
          aria-label="Interactive shipment map"
        />
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0E1117]/95 p-6 text-center">
            <div>
              <WifiOff className="mx-auto h-8 w-8 text-amber-400" />
              <p className="mt-2 font-semibold text-[#F1F5F9]">
                Map tiles unavailable
              </p>
              <p className="mt-1 max-w-sm text-xs text-[#9AA7BA]">
                {mapError} Connect to the internet and refresh this page to load
                OpenStreetMap tiles.
              </p>
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute left-3 top-3 z-[400] rounded-xl border border-[#303846] bg-[#11151D]/90 px-3 py-2 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F1F5F9]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {corridor === "international"
              ? "Multimodal Sea/Air/Road Trade Corridor"
              : "Domestic Reefer Road Corridor"}
          </div>
          <p className="mt-0.5 text-[10px] text-[#9AA7BA]">
            OSRM road geometry + maritime/air corridor waypoints · No fake live AIS/GPS claimed
          </p>
        </div>
      </div>

      {showStatus && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#303846] bg-[#11151D] px-4 py-2.5 text-xs text-[#9AA7BA]">
          <span className="inline-flex items-center gap-1.5">
            <Wifi className="h-3.5 w-3.5 text-emerald-400" /> {refreshedAt}
          </span>
          <span className="inline-flex flex-wrap items-center gap-3">
            <span>
              <i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />{" "}
              Packhouse / Origin
            </span>
            <span>
              <i className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-400" />{" "}
              Ocean CA Reefer (INNSA→AEJEA)
            </span>
            <span className="inline-flex items-center gap-1">
              <Plane className="h-3 w-3 text-violet-400" /> Air Cargo (BOM→DWC)
            </span>
            <span>
              <i className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-400" />{" "}
              Customs Port / Final Mile
            </span>
          </span>
        </div>
      )}
    </section>
  );
}
