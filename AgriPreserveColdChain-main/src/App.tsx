import type { ReactNode } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { ShieldAlert, ArrowRight, Lock } from "lucide-react";

import { useAuth } from "./context/AuthContext";
import type { UserRole } from "./types/auth";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import DashboardLayout from "./components/layout/DashboardLayout";

// ================= ADMIN =================
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ColdStorage from "./pages/admin/ColdStorage";
import LiveTracking from "./pages/admin/LiveTracking";
import AdminShipments from "./pages/admin/Shipments";
import Analytics from "./pages/admin/Analytics";
import AdminReports from "./pages/admin/Reports";
import AdminAIInsights from "./pages/admin/AIInsights";
import AdminAlerts from "./pages/admin/Alerts";
import AdminInventory from "./pages/admin/Inventory";
import Settings from "./pages/admin/Settings";
import InternationalTrade from "./pages/admin/InternationalTrade";

// ================= FARMER =================
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import MyProduce from "./pages/farmer/MyProduce";
import FarmerShipments from "./pages/farmer/Shipments";
import FarmerInventory from "./pages/farmer/Inventory";
import IoTMonitoring from "./pages/farmer/IoTMonitoring";
import FarmerSales from "./pages/farmer/Sales";
import FarmerReports from "./pages/farmer/Reports";
import FarmerAIInsights from "./pages/farmer/AIInsights";
import FarmerProfile from "./pages/farmer/Profile";

// ================= DRIVER =================
import DriverDashboard from "./pages/driver/DriverDashboard";
import MyTrips from "./pages/driver/MyTrips";
import CurrentShipment from "./pages/driver/CurrentShipment";
import DriverLiveTracking from "./pages/driver/LiveTracking";
import TemperatureMonitor from "./pages/driver/TemperatureMonitor";
import RouteNavigation from "./pages/driver/RouteNavigation";
import DeliveryProof from "./pages/driver/DeliveryProof";
import DriverAlerts from "./pages/driver/Alerts";
import DriverProfile from "./pages/driver/Profile";

// ================= RECEIVER =================
import ReceiverDashboard from "./pages/receiver/ReceiverDashboard";
import IncomingShipments from "./pages/receiver/IncomingShipments";
import ReceiverInventory from "./pages/receiver/Inventory";
import QualityCheck from "./pages/receiver/QualityCheck";
import ReceiverReports from "./pages/receiver/Reports";
import DemandForecast from "./pages/receiver/DemandForecast";
import ReceiverAIInsights from "./pages/receiver/AIInsights";
import Payments from "./pages/receiver/Payments";
import ReceiverProfile from "./pages/receiver/Profile";

function ProtectedWorkspace({
  allowedRole,
  children,
}: {
  allowedRole: UserRole;
  children: ReactNode;
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={`/login?role=${allowedRole}`} replace />;
  }

  if (user.role !== allowedRole) {
    return (
      <div className="min-h-screen bg-[#0E1117] text-[#F1F5F9] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-rose-500/40 bg-[#171B24] p-6 text-center space-y-4 shadow-2xl">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-white">
            Role Authorization Required
          </h1>
          <p className="text-xs text-[#9AA7BA] leading-relaxed">
            You are currently signed in as{" "}
            <strong className="text-white">{user.name}</strong> (
            <span className="uppercase text-emerald-400 font-semibold">
              {user.role}
            </span>
            ). This route is restricted to the{" "}
            <strong className="uppercase text-rose-300">{allowedRole}</strong>{" "}
            workspace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={`/${user.role}/dashboard`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition"
            >
              Return to {user.role.toUpperCase()} Dashboard{" "}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to={`/login?role=${allowedRole}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#303846] bg-[#1D2330] hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-white transition"
            >
              <Lock className="h-3.5 w-3.5" /> Switch Role Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function App() {
  return (
    <Routes>
      {/* ================= PUBLIC LANDING & LOGIN ================= */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      {/* ================= ADMIN ================= */}
      <Route
        path="/admin"
        element={<Navigate to="/admin/dashboard" replace />}
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedWorkspace allowedRole="admin">
            <AdminDashboard />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedWorkspace allowedRole="admin">
            <UserManagement />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/admin/cold-storage"
        element={
          <ProtectedWorkspace allowedRole="admin">
            <ColdStorage />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/admin/live-tracking"
        element={
          <ProtectedWorkspace allowedRole="admin">
            <LiveTracking />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/admin/shipments"
        element={
          <ProtectedWorkspace allowedRole="admin">
            <AdminShipments />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/admin/international-trade"
        element={
          <ProtectedWorkspace allowedRole="admin">
            <InternationalTrade />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/admin/customs"
        element={
          <ProtectedWorkspace allowedRole="admin">
            <InternationalTrade />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedWorkspace allowedRole="admin">
            <Analytics />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedWorkspace allowedRole="admin">
            <AdminReports />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/admin/ai-insights"
        element={
          <ProtectedWorkspace allowedRole="admin">
            <AdminAIInsights />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/admin/alerts"
        element={
          <ProtectedWorkspace allowedRole="admin">
            <AdminAlerts />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <ProtectedWorkspace allowedRole="admin">
            <AdminInventory />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedWorkspace allowedRole="admin">
            <Settings />
          </ProtectedWorkspace>
        }
      />

      {/* ================= FARMER ================= */}
      <Route
        path="/farmer"
        element={<Navigate to="/farmer/dashboard" replace />}
      />
      <Route
        path="/farmer/dashboard"
        element={
          <ProtectedWorkspace allowedRole="farmer">
            <FarmerDashboard />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/farmer/produce"
        element={
          <ProtectedWorkspace allowedRole="farmer">
            <MyProduce />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/farmer/shipments"
        element={
          <ProtectedWorkspace allowedRole="farmer">
            <FarmerShipments />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/farmer/inventory"
        element={
          <ProtectedWorkspace allowedRole="farmer">
            <FarmerInventory />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/farmer/iot"
        element={
          <ProtectedWorkspace allowedRole="farmer">
            <IoTMonitoring />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/farmer/sales"
        element={
          <ProtectedWorkspace allowedRole="farmer">
            <FarmerSales />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/farmer/reports"
        element={
          <ProtectedWorkspace allowedRole="farmer">
            <FarmerReports />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/farmer/ai-insights"
        element={
          <ProtectedWorkspace allowedRole="farmer">
            <FarmerAIInsights />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/farmer/profile"
        element={
          <ProtectedWorkspace allowedRole="farmer">
            <FarmerProfile />
          </ProtectedWorkspace>
        }
      />

      {/* ================= DRIVER ================= */}
      <Route
        path="/driver"
        element={<Navigate to="/driver/dashboard" replace />}
      />
      <Route
        path="/driver/dashboard"
        element={
          <ProtectedWorkspace allowedRole="driver">
            <DriverDashboard />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/driver/my-trips"
        element={
          <ProtectedWorkspace allowedRole="driver">
            <MyTrips />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/driver/current-shipment"
        element={
          <ProtectedWorkspace allowedRole="driver">
            <CurrentShipment />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/driver/live-tracking"
        element={
          <ProtectedWorkspace allowedRole="driver">
            <DriverLiveTracking />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/driver/temperature-monitor"
        element={
          <ProtectedWorkspace allowedRole="driver">
            <TemperatureMonitor />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/driver/route-navigation"
        element={
          <ProtectedWorkspace allowedRole="driver">
            <RouteNavigation />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/driver/delivery-proof"
        element={
          <ProtectedWorkspace allowedRole="driver">
            <DeliveryProof />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/driver/alerts"
        element={
          <ProtectedWorkspace allowedRole="driver">
            <DriverAlerts />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/driver/profile"
        element={
          <ProtectedWorkspace allowedRole="driver">
            <DriverProfile />
          </ProtectedWorkspace>
        }
      />

      {/* ================= RECEIVER ================= */}
      <Route
        path="/receiver"
        element={<Navigate to="/receiver/dashboard" replace />}
      />
      <Route
        path="/receiver/dashboard"
        element={
          <ProtectedWorkspace allowedRole="receiver">
            <ReceiverDashboard />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/receiver/incoming"
        element={
          <ProtectedWorkspace allowedRole="receiver">
            <IncomingShipments />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/receiver/inventory"
        element={
          <ProtectedWorkspace allowedRole="receiver">
            <ReceiverInventory />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/receiver/quality"
        element={
          <ProtectedWorkspace allowedRole="receiver">
            <QualityCheck />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/receiver/reports"
        element={
          <ProtectedWorkspace allowedRole="receiver">
            <ReceiverReports />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/receiver/demand"
        element={
          <ProtectedWorkspace allowedRole="receiver">
            <DemandForecast />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/receiver/ai-insights"
        element={
          <ProtectedWorkspace allowedRole="receiver">
            <ReceiverAIInsights />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/receiver/payments"
        element={
          <ProtectedWorkspace allowedRole="receiver">
            <Payments />
          </ProtectedWorkspace>
        }
      />
      <Route
        path="/receiver/profile"
        element={
          <ProtectedWorkspace allowedRole="receiver">
            <ReceiverProfile />
          </ProtectedWorkspace>
        }
      />

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}