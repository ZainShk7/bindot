import { useEffect } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  CalendarDays,
  CarFront,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AdminErrorProvider, useAdminError } from "../context/AdminErrorContext";
import { AppRoute } from "../routes";

const nav = [
  { to: AppRoute.Root, label: "Dashboard", Icon: LayoutDashboard, end: true },
  { to: AppRoute.Customers, label: "Customers", Icon: Users, end: false },
  { to: AppRoute.Vehicles, label: "Vehicles", Icon: CarFront, end: false },
  { to: AppRoute.Bookings, label: "Bookings", Icon: CalendarDays, end: false },
] as const;

function AdminShell() {
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, setError } = useAdminError();

  useEffect(() => {
    setError("");
  }, [location.pathname, setError]);

  function logout() {
    setToken("");
    setError("");
    navigate(AppRoute.Login, { replace: true });
  }

  return (
    <div className="bindot-app">
      <div className="bindot-shell">
        <aside className="bindot-sidebar">
          <Link
            to={AppRoute.Root}
            className="bindot-brand bindot-brand-link"
            aria-label="Go to dashboard"
            onClick={() => setError("")}
          >
            <div className="bindot-brand-mark">
              <CarFront size={20} strokeWidth={2} aria-hidden />
            </div>
            <div>
              <div className="bindot-brand-text-title">BinDot</div>
              <div className="bindot-brand-text-sub">Admin dashboard</div>
            </div>
          </Link>
          {nav.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                isActive ? "bindot-nav-btn active" : "bindot-nav-btn"
              }
            >
              <Icon size={20} strokeWidth={2} aria-hidden />
              {label}
            </NavLink>
          ))}
          <div className="bindot-nav-spacer" aria-hidden />
          <div className="bindot-logout">
            <button type="button" className="bindot-nav-btn" onClick={logout}>
              <LogOut size={20} strokeWidth={2} aria-hidden />
              Logout
            </button>
          </div>
        </aside>
        <main className="bindot-main">
          {error ? (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 12,
                background: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#7f1d1d",
              }}
            >
              {error}
            </div>
          ) : null}
          <Outlet context={{ setError } satisfies AdminOutletContext} />
        </main>
      </div>
    </div>
  );
}

export type AdminOutletContext = {
  setError: (m: string) => void;
};

export function AdminLayout() {
  return (
    <AdminErrorProvider>
      <AdminShell />
    </AdminErrorProvider>
  );
}
