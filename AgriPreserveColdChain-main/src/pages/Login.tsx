import { useState, useEffect, type FormEvent, type CSSProperties } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Eye,
  EyeOff,
  Info,
  Leaf,
  LockKeyhole,
  Mail,
  MapPinned,
  ShieldCheck,
  Sprout,
  Thermometer,
  Truck,
  Users,
  Warehouse,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { agriApi } from "../services/api";

const accounts = {
  admin: {
    id: "1",
    name: "Admin User",
    email: "admin@agripreserve.com",
    password: "admin123",
    organization: "AgriPreserve Command Center",
    region: "Maharashtra Corridor",
  },
  farmer: {
    id: "2",
    name: "Rajesh Farmer",
    email: "farmer@agripreserve.com",
    password: "farmer123",
    organization: "Nashik Fresh Growers Co-op",
    region: "Nashik, Maharashtra",
  },
  driver: {
    id: "3",
    name: "Amit Driver",
    email: "driver@agripreserve.com",
    password: "driver123",
    organization: " Sahyadri Cold Logistics",
    region: "Nashik–Pune–Mumbai Route",
  },
  receiver: {
    id: "4",
    name: "FreshMart Receiver",
    email: "receiver@agripreserve.com",
    password: "receiver123",
    organization: "FreshMart Retail Distribution",
    region: "Mumbai & Pune",
  },
};

type Role = keyof typeof accounts;

const roleMeta: Record<
  Role,
  { title: string; icon: typeof Users; color: string; hint: string }
> = {
  admin: {
    title: "Admin",
    icon: Users,
    color: "#10b981",
    hint: "Command center, users, cold-storage & AI intelligence",
  },
  farmer: {
    title: "Farmer",
    icon: Sprout,
    color: "#22c55e",
    hint: "Produce catalog, harvest inventory & mandi price insights",
  },
  driver: {
    title: "Driver",
    icon: Truck,
    color: "#38bdf8",
    hint: "Assigned route, reefer telemetry & digital delivery proof",
  },
  receiver: {
    title: "Receiver",
    icon: Warehouse,
    color: "#a78bfa",
    hint: "Arrival quality checks, FEFO stock & demand forecast",
  },
};

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, notify } = useAuth();

  const initialRoleParam = searchParams.get("role") as Role | null;
  const initialRole: Role =
    initialRoleParam && initialRoleParam in accounts
      ? initialRoleParam
      : "admin";

  const [role, setRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState(accounts[initialRole].email);
  const [password, setPassword] = useState(accounts[initialRole].password);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotDemo, setShowForgotDemo] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (initialRoleParam && initialRoleParam in accounts) {
      selectRole(initialRoleParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRoleParam]);

  const selectRole = (newRole: Role) => {
    setRole(newRole);
    setEmail(accounts[newRole].email);
    setPassword(accounts[newRole].password);
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter both your email address and password.");
      return;
    }
    setBusy(true);
    try {
      const result = await agriApi.login({
        email: email.trim(),
        password,
        role,
        remember_me: rememberMe,
      });
      login(result.user, result.token, rememberMe);
      notify(
        `Welcome back, ${result.user.name}`,
        `Signed in to ${result.user.role.toUpperCase()} workspace.`,
        "success",
      );
      navigate(`/${result.user.role}/dashboard`, { replace: true });
    } catch (apiError) {
      const message =
        apiError instanceof Error ? apiError.message : "Unable to sign in.";
      // If backend is offline during static preview, allow clearly labeled local demo fallback for matching demo credentials
      if (message.includes("Failed to fetch")) {
        const matchedRole = (Object.keys(accounts) as Role[]).find(
          (r) =>
            accounts[r].email.toLowerCase() === email.trim().toLowerCase() &&
            accounts[r].password === password,
        );
        if (matchedRole) {
          if (matchedRole !== role) {
            setError(
              `Role mismatch: ${email} belongs to the '${matchedRole}' role.`,
            );
            setBusy(false);
            return;
          }
          const demoAcc = accounts[matchedRole];
          login(
            {
              id: demoAcc.id,
              name: demoAcc.name,
              email: demoAcc.email,
              role: matchedRole,
              organization: demoAcc.organization,
              region: demoAcc.region,
            },
            `offline-demo-token-${matchedRole}`,
            rememberMe,
          );
          notify(
            `Signed in (${demoAcc.name})`,
            "Running in offline demo fallback mode. Start FastAPI backend for full SQLite persistence.",
            "warning",
          );
          navigate(`/${matchedRole}/dashboard`, { replace: true });
          return;
        }
        setError(
          "Backend server is not reachable and credentials did not match local demo accounts.",
        );
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="login-scene login-scene-premium min-h-screen"
      data-role={role}
    >
      <div className="login-art-panel">
        <div className="flex items-center justify-between gap-4">
          <div className="login-brand-lockup">
            <div className="brand-mark">
              <Leaf size={28} />
            </div>
            <div>
              <div className="brand-name">
                Agri <span>Preserve</span>
              </div>
              <div className="brand-tagline">COLD CHAIN INTELLIGENCE</div>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-slate-900/60 hover:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 transition"
          >
            <ArrowLeft size={14} /> Home
          </Link>
        </div>

        <div className="login-hero-copy">
          <p className="eyebrow">
            <Sparkles size={15} /> FARM TO SHELF, WITH CONFIDENCE
          </p>
          <h2>
            <span>Freshness,</span>
            <br />
            protected.
          </h2>
          <p>
            Keep every shipment visible, cool, and on track — from harvest
            collection to retail delivery.
          </p>
        </div>

        <div className="login-feature-row">
          <div className="login-feature">
            <span className="feature-icon mint">
              <MapPinned />
            </span>
            <div>
              <b>Live corridor map</b>
              <small>Nashik · Pune · Mumbai</small>
            </div>
          </div>
          <div className="login-feature">
            <span className="feature-icon cyan">
              <Thermometer />
            </span>
            <div>
              <b>Thermal guardrails</b>
              <small>Excursion &amp; door alerts</small>
            </div>
          </div>
          <div className="login-feature">
            <span className="feature-icon violet">
              <BrainCircuit />
            </span>
            <div>
              <b>AI &amp; SOP Copilot</b>
              <small>Grounded cold-chain RAG</small>
            </div>
          </div>
        </div>

        <div className="login-art-footer">
          <ShieldCheck size={16} /> PBKDF2-SHA256 authenticated sessions ·
          Role-verified access control
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-card login-card-premium">
          <div className="mobile-brand">
            <div className="brand-mark">
              <Leaf size={25} />
            </div>
            <div>
              <div className="brand-name">
                Agri <span>Preserve</span>
              </div>
              <div className="brand-tagline">COLD CHAIN INTELLIGENCE</div>
            </div>
          </div>

          <div className="login-welcome">
            <div className="welcome-icon">
              <Sprout size={25} />
            </div>
            <div>
              <p className="welcome-kicker">ROLE-BASED AUTHENTICATION</p>
              <h1>Freshness in every mile.</h1>
              <p>Select your cold-chain workspace and sign in below.</p>
            </div>
          </div>

          <div className="role-grid" aria-label="Choose portal">
            {(Object.keys(accounts) as Role[]).map((item) => {
              const Icon = roleMeta[item].icon;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => selectRole(item)}
                  className={`role-tile ${role === item ? "active" : ""}`}
                  style={
                    { "--tile-color": roleMeta[item].color } as CSSProperties
                  }
                >
                  <Icon size={19} />
                  <span>{roleMeta[item].title}</span>
                  {role === item && <span className="role-selected-dot" />}
                </button>
              );
            })}
          </div>

          <div className="role-hint">
            <Activity size={15} />
            {roleMeta[role].hint}
          </div>

          <form onSubmit={handleSubmit} className="login-fields">
            <label className="login-input-wrap">
              <Mail size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                autoComplete="username"
                required
              />
            </label>

            <label className="login-input-wrap">
              <LockKeyhole size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                required
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </label>

            <div className="flex items-center justify-between text-xs text-slate-300 pt-0.5">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Remember session on this device</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotDemo((prev) => !prev)}
                className="text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Forgot password? (Demo)
              </button>
            </div>

            {showForgotDemo && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-xs text-amber-200 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Info size={14} /> Local Development Demo Password Reset
                </p>
                <p className="text-amber-200/80">
                  In this local evaluation build, click any role tile above to
                  auto-fill its verified demo credentials, or ask an Admin user
                  to reset your password in <b>Admin → User Management</b>.
                </p>
              </div>
            )}

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="login-submit login-submit-premium"
            >
              {busy ? "Verifying credentials…" : `Sign In as ${roleMeta[role].title}`}
              <ArrowRight size={19} />
            </button>
          </form>

          <div className="demo-access">
            <div className="demo-access-top">
              <span className="demo-shield">
                <ShieldCheck size={17} />
              </span>
              <div>
                <b>Local Development Demo Credentials</b>
                <small>
                  Backed by PBKDF2-HMAC-SHA256 hashes in SQLite (not for
                  production use)
                </small>
              </div>
            </div>
            <div className="demo-credentials">
              <span>
                <Mail size={13} />
                {accounts[role].email}
              </span>
              <span>
                <LockKeyhole size={13} />
                {accounts[role].password}
              </span>
            </div>
          </div>

          <p className="login-privacy">
            Protected role routes <span>•</span> Synthetic demo telemetry
            clearly labeled
          </p>
        </div>
      </div>
    </div>
  );
}
