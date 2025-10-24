import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Banknote, FileWarning, Archive, Loader2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Appointment, Invoice, InventoryItem, InvoiceStatus } from '@shared/types';
import { isToday } from 'date-fns';
import { toast } from 'sonner';
interface DashboardStats {
  todayAppointments: number;
  todayRevenue: number;
  outstandingInvoices: number;
  lowStockItems: number;
}
export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [appointmentsRes, invoicesRes, inventoryRes] = await Promise.all([
          api<{ items: Appointment[] }>('/api/appointments'),
          api<{ items: Invoice[] }>('/api/invoices'),
          api<{ items: InventoryItem[] }>('/api/inventory'),
        ]);
        const todayAppointments = appointmentsRes.items.filter(a => isToday(new Date(a.start_time))).length;
        const todayRevenue = invoicesRes.items
          .filter(i => i.status === InvoiceStatus.Paid && isToday(new Date(i.created_at)))
          .reduce((sum, i) => sum + i.total_amount, 0);
        const outstandingInvoices = invoicesRes.items.filter(i => i.status === InvoiceStatus.Unpaid || i.status === InvoiceStatus.PartiallyPaid).length;
        const lowStockItems = inventoryRes.items.filter(i => i.quantity_on_hand <= i.reorder_threshold).length;
        setStats({
          todayAppointments,
          todayRevenue,
          outstandingInvoices,
          lowStockItems,
        });
      } catch (error) {
        toast.error("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);
  const kpiCards = [
    { title: "Today's Appointments", value: stats?.todayAppointments, icon: Calendar, description: "Scheduled for today" },
    { title: "Today's Revenue", value: `PKR ${stats?.todayRevenue.toLocaleString()}`, icon: Banknote, description: "From paid invoices" },
    { title: "Outstanding Invoices", value: stats?.outstandingInvoices, icon: FileWarning, description: "Unpaid or partially paid" },
    { title: "Low Stock Items", value: stats?.lowStockItems, icon: Archive, description: "Items needing reorder" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.full_name}!</p>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value ?? '...'}</div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}