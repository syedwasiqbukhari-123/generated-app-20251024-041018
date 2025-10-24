import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Briefcase,
  Stethoscope,
  FileText,
  Warehouse,
  BarChart,
  Settings,
  HeartPulse,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
const allNavItems = [
  { id: 'dashboard', to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'appointments', to: '/appointments', icon: Calendar, label: 'Appointments' },
  { id: 'patients', to: '/patients', icon: Users, label: 'Patients' },
  { id: 'staff', to: '/staff', icon: Briefcase, label: 'Staff' },
  { id: 'services', to: '/services', icon: Stethoscope, label: 'Services' },
  { id: 'invoices', to: '/invoices', icon: FileText, label: 'Invoices' },
  { id: 'inventory', to: '/inventory', icon: Warehouse, label: 'Inventory' },
  { id: 'reports', to: '/reports', icon: BarChart, label: 'Reports' },
  { id: 'settings', to: '/settings', icon: Settings, label: 'Settings' },
];
export function AppSidebar(): JSX.Element {
  const { user } = useAuth();
  const navItems =
    user?.role === 'Admin'
      ? allNavItems
      : user?.permissions
      ? allNavItems.filter((item) => user.permissions?.includes(item.id))
      : [];
  return (
    <div className="hidden border-r bg-background md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <NavLink to="/dashboard" className="flex items-center gap-2 font-semibold">
            <HeartPulse className="h-6 w-6 text-blue-500" />
            <span className="">DentaFlow OS</span>
          </NavLink>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    isActive && 'bg-muted text-primary'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}