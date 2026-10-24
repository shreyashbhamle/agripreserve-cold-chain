import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Leaf,
  MapPinned,
  ShieldCheck,
  Snowflake,
  Sprout,
  Thermometer,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  const roles = [
    {
      role: "admin",
      title: "Platform Administrator",
      accent: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
      icon: Users,
      summary:
        "End-to-end command center across shipments, cold-storage hubs, IoT sensor fleets, alert SLA resolution, and AI risk rankings.",
      highlights: [
        "10-chart executive cold-chain analytics",
        "User & role access management",
        "RAG SOP Copilot & controlled agent actions",
      ],
    },
    {
      role: "farmer",
      title: "Producer / Farmer",
      accent: "border-green-500/40 text-green-400 bg-green-500/10",
      icon: Sprout,
      summary:
        "Manage harvested crops, cold-room stock, outbound reefers, IoT pre-cooling telemetry, and benchmark mandi prices.",
      highlights: [
        "Batch harvest & shelf-life tracking",
        "Real-time mandi price comparison (demo)",
        "Spoilage risk & pre-cooling alerts",
      ],
    },
    {
      role: "driver",
      title: "Cold-Chain Transport Driver",
      accent: "border-sky-500/40 text-sky-400 bg-sky-500/10",
      icon: Truck,
      summary:
        "Mobile-ready dispatch cockpit with road-following navigation, cargo reefer monitoring, status updates, and digital Proof of Delivery.",
      highlights: [
        "One-tap shipment milestone transitions",
        "Cargo temperature & door sensor alerts",
        "Digital POD with signature & photo",
      ],
    },
    {
      role: "receiver",
      title: "Receiving Business / Retailer",
      accent: "border-violet-500/40 text-violet-400 bg-violet-500/10",
      icon: Warehouse,
      summary:
        "Inspect incoming produce, combine arrival temperature compliance with human visual grading, manage cold-room stock, and forecast demand.",
      highlights: [
        "Multi-factor arrival quality inspection",
        "Expiry & FEFO cold-room inventory control",
        "Time-series demand forecast with MAE/RMSE",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0E1117] text-[#F1F5F9] selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-[#303846] bg-[#0E1117]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                Agri<span className="text-emerald-400">Preserve</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#9AA7BA]">
                Cold Chain Intelligence
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#9AA7BA]">
            <a href="#features" className="hover:text-white transition">
              Platform Features
            </a>
            <a href="#workflow" className="hover:text-white transition">
              How It Works
            </a>
            <a href="#ai-iot" className="hover:text-white transition">
              AI &amp; IoT
            </a>
            <a href="#workspaces" className="hover:text-white transition">
              Role Workspaces
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl border border-[#303846] bg-[#171B24] hover:bg-[#1D2330] px-4 py-2 text-xs sm:text-sm font-semibold text-[#F1F5F9] transition"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 transition shadow-lg shadow-emerald-500/20"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#303846] py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300">
                <Snowflake className="h-3.5 w-3.5" />
                Farm-to-Destination Cold Chain Command Center
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                Every Harvest Deserves a{" "}
                <span className="text-emerald-400">Fresh Journey.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#9AA7BA] max-w-2xl leading-relaxed">
                Monitor produce, protect freshness, optimize deliveries, and
                connect every stage of the agricultural cold chain—from Nashik
                farm collection to Pune cold storage and Mumbai retail shelves.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 transition shadow-lg shadow-emerald-500/20"
                >
                  Launch Role Portal <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="#workspaces"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#303846] bg-[#171B24] hover:bg-[#1D2330] px-6 py-3 text-sm font-semibold text-[#F1F5F9] transition"
                >
                  Explore Platform Workspaces
                </a>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#303846]/80 max-w-xl">
                <div>
                  <p className="text-xl font-bold text-white">4 Workspaces</p>
                  <p className="text-xs text-[#9AA7BA]">
                    Admin · Farmer · Driver · Receiver
                  </p>
                </div>
                <div>
                  <p className="text-xl font-bold text-emerald-400">
                    2°C – 14°C
                  </p>
                  <p className="text-xs text-[#9AA7BA]">
                    Crop-specific thermal thresholds
                  </p>
                </div>
                <div>
                  <p className="text-xl font-bold text-sky-400">
                    AI + IoT + GIS
                  </p>
                  <p className="text-xs text-[#9AA7BA]">
                    Anomaly, Forecast &amp; SOP RAG
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-3 shadow-2xl">
                <div className="relative overflow-hidden rounded-xl border border-[#303846]">
                  <img
                    src="/assets/agripreserve-login-hero.png"
                    alt="AgriPreserve farm-to-city cold chain illustration"
                    className="w-full h-64 sm:h-72 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E1117] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-[#303846] bg-[#11151D]/95 p-3.5 backdrop-blur">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5" /> Corridor Telemetry
                        (Synthetic Demo)
                      </span>
                      <span className="text-[#9AA7BA]">
                        Nashik → Pune → Mumbai
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-lg bg-[#171B24] p-2 border border-[#303846]">
                        <span className="text-[#9AA7BA] block text-[10px]">
                          Reefer AP1024
                        </span>
                        <strong className="text-emerald-300">
                          4.6°C · 79% RH
                        </strong>
                      </div>
                      <div className="rounded-lg bg-[#171B24] p-2 border border-[#303846]">
                        <span className="text-[#9AA7BA] block text-[10px]">
                          Reefer AP1025
                        </span>
                        <strong className="text-amber-300">
                          9.3°C · Excursion
                        </strong>
                      </div>
                      <div className="rounded-lg bg-[#171B24] p-2 border border-[#303846]">
                        <span className="text-[#9AA7BA] block text-[10px]">
                          Pune Cold Hub
                        </span>
                        <strong className="text-sky-300">3.8°C · 78% Cap</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section
        id="features"
        className="border-b border-[#303846] py-14 bg-[#11151D]/60"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Platform Capabilities
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-white">
              Engineered for Perishable Supply-Chain Integrity
            </h2>
            <p className="mt-2 text-sm text-[#9AA7BA]">
              Combines cold-storage telemetry, road corridor tracking, arrival
              quality grading, and grounded AI decision support.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Thermometer,
                title: "Multi-Crop Thermal Guardrails",
                desc: "Continuous monitoring of crop-specific temperature & relative humidity bands with rate-of-change spike detection.",
              },
              {
                icon: MapPinned,
                title: "GIS Corridor & OSRM Routing",
                desc: "Interactive OpenStreetMap & satellite views across Nashik, Pimpalgaon, Pune, and Mumbai cold-chain checkpoints.",
              },
              {
                icon: BrainCircuit,
                title: "Explainable AI & SOP RAG",
                desc: "IsolationForest telemetry scoring, time-aware demand forecasting with MAE/RMSE, and SOP-cited RAG copilot.",
              },
              {
                icon: ShieldCheck,
                title: "Audit-Ready Quality & POD",
                desc: "Separates arrival sensor compliance from human visual grading and captures digital Proof of Delivery records.",
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border border-[#303846] bg-[#171B24] p-5 space-y-3"
                >
                  <div className="h-10 w-10 rounded-xl bg-[#1D2330] border border-[#303846] flex items-center justify-center text-emerald-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">{f.title}</h3>
                  <p className="text-xs text-[#9AA7BA] leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Farm-to-Market Workflow */}
      <section id="workflow" className="border-b border-[#303846] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
              End-to-End Lifecycle
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-white">
              Connected Farm-to-Market Cold Chain Workflow
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              {
                step: "01",
                title: "Harvest & Pre-Cooling",
                role: "Farmer Workspace",
                detail:
                  "Log harvested batches, assign target storage temperature bands, and monitor farm packhouse humidity.",
              },
              {
                step: "02",
                title: "Reefer Dispatch & Transit",
                role: "Driver Workspace",
                detail:
                  "Pair ESP32/reefer telemetry nodes, follow OSRM corridor routes, and log transit milestones.",
              },
              {
                step: "03",
                title: "Command & Exception Triage",
                role: "Admin Workspace",
                detail:
                  "Detect thermal excursions early, run RAG SOP playbooks, and coordinate re-icing or hub diversion.",
              },
              {
                step: "04",
                title: "Arrival Grading & Retail Replenishment",
                role: "Receiver Workspace",
                detail:
                  "Execute arrival quality checks, update FEFO cold-room stock, settle invoices, and forecast 7-day demand.",
              },
            ].map((w) => (
              <div
                key={w.step}
                className="rounded-2xl border border-[#303846] bg-[#171B24] p-5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">
                      STAGE {w.step}
                    </span>
                    <span className="rounded bg-[#1D2330] border border-[#303846] px-2 py-0.5 text-[10px] text-[#9AA7BA]">
                      {w.role}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{w.title}</h3>
                  <p className="text-xs text-[#9AA7BA] leading-relaxed">
                    {w.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI & IoT Architecture */}
      <section
        id="ai-iot"
        className="border-b border-[#303846] py-14 bg-[#11151D]/60"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-6 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-400">
              <BrainCircuit className="h-4 w-4" /> AI / ML &amp; Agentic
              Intelligence
            </div>
            <h3 className="text-xl font-bold text-white">
              Transparent, Grounded Cold-Chain AI
            </h3>
            <ul className="space-y-2 text-xs text-[#9AA7BA]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">
                    IsolationForest + Domain Thresholds:
                  </strong>{" "}
                  Detects thermal spikes, door-open events, and rapid warming
                  rates with precision/recall evaluation on the synthetic fleet.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">
                    Time-Aware Demand Forecasting:
                  </strong>{" "}
                  Chronological train/holdout split reporting actual MAE and
                  RMSE (kg) plus uncertainty intervals.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">
                    SOP-Grounded RAG &amp; Controlled Agent:
                  </strong>{" "}
                  5-step incident workflow with mandatory human-in-the-loop
                  confirmation before persisting operational actions.
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-6 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <Cpu className="h-4 w-4" /> IoT Telemetry &amp; Hardware Readiness
            </div>
            <h3 className="text-xl font-bold text-white">
              Simulated Stream Today, ESP32 Ready Tomorrow
            </h3>
            <ul className="space-y-2 text-xs text-[#9AA7BA]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">
                    REST Ingestion Endpoint:
                  </strong>{" "}
                  Physical ESP32 + DHT22/DS18B20 nodes can POST telemetry
                  directly to <code>/api/sensors/readings</code>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">
                    Interactive Fault Simulator:
                  </strong>{" "}
                  Inject normal drift, temperature spikes, or door-open events
                  on any shipment to verify alert rules in real time.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">
                    Honest Provenance Labeling:
                  </strong>{" "}
                  All synthetic CSV records and simulated streams are clearly
                  badged so operators never confuse demo data with live hardware.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Role Workspaces */}
      <section id="workspaces" className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Role-Based Portals
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-white">
                Dedicated Workspaces for Every Cold-Chain Stakeholder
              </h2>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Sign in with demo credentials <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {roles.map((r) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.role}
                  className="rounded-2xl border border-[#303846] bg-[#171B24] p-6 flex flex-col justify-between gap-5 hover:border-slate-500 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase ${r.accent}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {r.title}
                      </span>
                      <span className="text-xs text-[#9AA7BA] font-mono">
                        /{r.role}/dashboard
                      </span>
                    </div>
                    <p className="text-sm text-[#F1F5F9] leading-relaxed">
                      {r.summary}
                    </p>
                    <ul className="space-y-1.5 pt-1">
                      {r.highlights.map((h) => (
                        <li
                          key={h}
                          className="text-xs text-[#9AA7BA] flex items-center gap-2"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-[#303846]/70 flex items-center justify-between">
                    <span className="text-xs text-[#9AA7BA]">
                      Demo account:{" "}
                      <code className="text-slate-200">
                        {r.role}@agripreserve.com
                      </code>
                    </span>
                    <Link
                      to={`/login?role=${r.role}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#1D2330] hover:bg-slate-700 border border-[#303846] px-3.5 py-2 text-xs font-semibold text-white transition"
                    >
                      Open {r.title.split(" ").pop()} Portal{" "}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#303846] bg-[#11151D] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9AA7BA]">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold text-[#F1F5F9]">
              AgriPreserve Cold Chain Intelligence Platform
            </span>
            <span>· Local SQLite + FastAPI + React 18</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/login" className="hover:text-white">
              Role Login
            </Link>
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#workspaces" className="hover:text-white">
              Workspaces
            </a>
            <span className="text-amber-300/90">
              Includes Synthetic Demo Datasets (AP1024–AP1030)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
