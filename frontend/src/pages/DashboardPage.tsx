import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { CalendarDays, CarFront, DollarSign, Loader2, Users } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import type { AdminOutletContext } from "../layouts/AdminLayout";
import { Card } from "../components/ui";
import { AppRoute } from "../routes";

type Summary = {
  bookingsCount: number;
  customersCount: number;
  vehiclesCount: number;
  revenue: number;
};

function StatValue({
  data,
  format,
}: {
  data: Summary | null;
  format: "bookings" | "customers" | "vehicles" | "revenue";
}) {
  if (!data) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Loader2 className="bindot-spin" size={22} aria-hidden />
        Loading…
      </span>
    );
  }
  const text =
    format === "revenue"
      ? `$${Number(data.revenue || 0).toFixed(2)}`
      : format === "bookings"
        ? String(data.bookingsCount)
        : format === "customers"
          ? String(data.customersCount)
          : String(data.vehiclesCount);
  return (
    <div
      style={{
        fontSize: "clamp(1.85rem, 4.5vw, 2.75rem)",
        fontWeight: 800,
        color: "var(--text-h)",
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
      }}
    >
      {text}
    </div>
  );
}

export function DashboardPage() {
  const { token } = useAuth();
  const { setError } = useOutletContext<AdminOutletContext>();
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    let mounted = true;
    api<Summary>("/api/dashboard/summary", {}, token)
      .then((d) => mounted && setData(d))
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load dashboard"),
      );
    return () => {
      mounted = false;
    };
  }, [token, setError]);

  return (
    <div className="bindot-dash-fullbleed">
      <Link
        to={AppRoute.Bookings}
        className="bindot-dash-stat-link"
        aria-label="Open bookings"
      >
        <Card title="Bookings" icon={CalendarDays} className="bindot-dash-stat-card">
          <div className="bindot-dash-stat-value">
            <StatValue data={data} format="bookings" />
          </div>
        </Card>
      </Link>
      <Link
        to={AppRoute.Customers}
        className="bindot-dash-stat-link"
        aria-label="Open customers"
      >
        <Card title="Customers" icon={Users} className="bindot-dash-stat-card">
          <div className="bindot-dash-stat-value">
            <StatValue data={data} format="customers" />
          </div>
        </Card>
      </Link>
      <Link
        to={AppRoute.Vehicles}
        className="bindot-dash-stat-link"
        aria-label="Open vehicles"
      >
        <Card title="Vehicles" icon={CarFront} className="bindot-dash-stat-card">
          <div className="bindot-dash-stat-value">
            <StatValue data={data} format="vehicles" />
          </div>
        </Card>
      </Link>
      <Link
        to={AppRoute.Bookings}
        className="bindot-dash-stat-link"
        aria-label="Open bookings to review amounts and revenue"
      >
        <Card title="Revenue" icon={DollarSign} className="bindot-dash-stat-card">
          <div className="bindot-dash-stat-value">
            <StatValue data={data} format="revenue" />
          </div>
        </Card>
      </Link>
    </div>
  );
}
