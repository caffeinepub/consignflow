import { Toaster } from "@/components/ui/sonner";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import AppLayout from "./components/AppLayout";
import { useAuth } from "./hooks/useAuth";
import { useFirstRun } from "./hooks/useFirstRun";
import AdjustmentsPage from "./pages/AdjustmentsPage";
import ConsignmentsPage from "./pages/ConsignmentsPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import PayoutsPage from "./pages/PayoutsPage";
import ProductsPage from "./pages/ProductsPage";
import RepsPage from "./pages/RepsPage";
import ReturnsPage from "./pages/ReturnsPage";
import SalesPage from "./pages/SalesPage";
import SettlementPeriodsPage from "./pages/SettlementPeriodsPage";
import StatementsPage from "./pages/StatementsPage";
import WelcomeScreen from "./pages/WelcomeScreen";

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

/**
 * Guards: redirect to /login when not authenticated.
 * After auth is confirmed, also enforce first-run onboarding.
 */
function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();
  const { isFirstRun } = useFirstRun();

  // While II is booting, trust the stored principal to avoid flash-redirect
  if (isInitializing) {
    // Check localStorage directly so we don't bounce authenticated users
    const stored = (() => {
      try {
        return localStorage.getItem("consignflow-auth-principal");
      } catch {
        return null;
      }
    })();
    if (!stored) return <Navigate to="/login" />;
    // stored principal exists — render children (II will confirm shortly)
    if (isFirstRun) return <Navigate to="/welcome" />;
    return <AppLayout>{children}</AppLayout>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (isFirstRun) {
    return <Navigate to="/welcome" />;
  }

  return <AppLayout>{children}</AppLayout>;
}

// Route components
function DashboardRouteComponent() {
  return (
    <AuthenticatedRoute>
      <DashboardPage />
    </AuthenticatedRoute>
  );
}
function ProductsRouteComponent() {
  return (
    <AuthenticatedRoute>
      <ProductsPage />
    </AuthenticatedRoute>
  );
}
function RepsRouteComponent() {
  return (
    <AuthenticatedRoute>
      <RepsPage />
    </AuthenticatedRoute>
  );
}
function ConsignmentsRouteComponent() {
  return (
    <AuthenticatedRoute>
      <ConsignmentsPage />
    </AuthenticatedRoute>
  );
}
function SalesRouteComponent() {
  return (
    <AuthenticatedRoute>
      <SalesPage />
    </AuthenticatedRoute>
  );
}
function ReturnsRouteComponent() {
  return (
    <AuthenticatedRoute>
      <ReturnsPage />
    </AuthenticatedRoute>
  );
}
function PayoutsRouteComponent() {
  return (
    <AuthenticatedRoute>
      <PayoutsPage />
    </AuthenticatedRoute>
  );
}
function StatementsRouteComponent() {
  return (
    <AuthenticatedRoute>
      <StatementsPage />
    </AuthenticatedRoute>
  );
}
function SettlementPeriodsRouteComponent() {
  return (
    <AuthenticatedRoute>
      <SettlementPeriodsPage />
    </AuthenticatedRoute>
  );
}
function AdjustmentsRouteComponent() {
  return (
    <AuthenticatedRoute>
      <AdjustmentsPage />
    </AuthenticatedRoute>
  );
}

// Route definitions
const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/welcome",
  component: WelcomeScreen,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardRouteComponent,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products",
  component: ProductsRouteComponent,
});

const repsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reps",
  component: RepsRouteComponent,
});

const consignmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/consignments",
  component: ConsignmentsRouteComponent,
});

const salesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sales",
  component: SalesRouteComponent,
});

const returnsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/returns",
  component: ReturnsRouteComponent,
});

const payoutsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payouts",
  component: PayoutsRouteComponent,
});

const statementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/statements",
  component: StatementsRouteComponent,
});

const settlementPeriodsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settlement-periods",
  component: SettlementPeriodsRouteComponent,
});

const adjustmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/adjustments",
  component: AdjustmentsRouteComponent,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  welcomeRoute,
  dashboardRoute,
  productsRoute,
  repsRoute,
  consignmentsRoute,
  salesRoute,
  returnsRoute,
  payoutsRoute,
  statementsRoute,
  settlementPeriodsRoute,
  adjustmentsRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
