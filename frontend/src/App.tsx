import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AdminLayout } from "./layouts/AdminLayout";
import { BookingsPage } from "./pages/BookingsPage";
import { CustomersPage } from "./pages/CustomersPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { VehiclesPage } from "./pages/VehiclesPage";
import { AppRoute, appRouteLayoutSegment } from "./routes";

function RequireAuth() {
  const { token } = useAuth();
  if (!token) return <Navigate to={AppRoute.Login} replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path={AppRoute.Login} element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route
            path={appRouteLayoutSegment(AppRoute.Customers)}
            element={<CustomersPage />}
          />
          <Route
            path={appRouteLayoutSegment(AppRoute.Vehicles)}
            element={<VehiclesPage />}
          />
          <Route
            path={appRouteLayoutSegment(AppRoute.Bookings)}
            element={<BookingsPage />}
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={AppRoute.Root} replace />} />
    </Routes>
  );
}
