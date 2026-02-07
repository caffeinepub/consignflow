import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import RepsPage from './pages/RepsPage';
import ConsignmentsPage from './pages/ConsignmentsPage';
import SalesPage from './pages/SalesPage';
import ReturnsPage from './pages/ReturnsPage';
import PayoutsPage from './pages/PayoutsPage';
import StatementsPage from './pages/StatementsPage';
import SettlementPeriodsPage from './pages/SettlementPeriodsPage';
import AdjustmentsPage from './pages/AdjustmentsPage';
import AppLayout from './components/AppLayout';

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: ProductsPage,
});

const repsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reps',
  component: RepsPage,
});

const consignmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/consignments',
  component: ConsignmentsPage,
});

const salesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sales',
  component: SalesPage,
});

const returnsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/returns',
  component: ReturnsPage,
});

const payoutsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payouts',
  component: PayoutsPage,
});

const statementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/statements',
  component: StatementsPage,
});

const settlementPeriodsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settlement-periods',
  component: SettlementPeriodsPage,
});

const adjustmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/adjustments',
  component: AdjustmentsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
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

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
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
