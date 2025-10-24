import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css';
import { AuthProvider } from '@/providers/AuthProvider';
import LoginPage from '@/pages/HomePage';
import DashboardPage from '@/pages/DashboardPage';
import StaffPage from '@/pages/StaffPage';
import PatientsPage from '@/pages/PatientsPage';
import ServicesPage from '@/pages/ServicesPage';
import AppointmentsPage from '@/pages/AppointmentsPage';
import InvoicesPage from '@/pages/InvoicesPage';
import InventoryPage from '@/pages/InventoryPage';
import ReportsPage from '@/pages/ReportsPage';
import SettingsPage from '@/pages/SettingsPage';
import PatientPortalPage from '@/pages/PatientPortalPage';
import PatientProfilePage from '@/pages/PatientProfilePage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute, UnauthenticatedRoute } from './components/Routes';
const router = createBrowserRouter([
  {
    element: <UnauthenticatedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/login", element: <LoginPage /> },
    ],
  },
  {
    path: "/portal",
    element: <PatientPortalPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "staff", element: <StaffPage /> },
      { path: "patients", element: <PatientsPage /> },
      { path: "patients/:id", element: <PatientProfilePage /> },
      { path: "services", element: <ServicesPage /> },
      { path: "appointments", element: <AppointmentsPage /> },
      { path: "invoices", element: <InvoicesPage /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  }
]);
export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster richColors closeButton />
    </AuthProvider>
  );
}
const queryClient = new QueryClient();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);