import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, UserCircle, Loader2 } from 'lucide-react';
import { Appointment, Invoice, InvoiceStatus } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
// Mocking a logged-in patient
const MOCK_PATIENT_ID = 'patient-01';
const MOCK_PATIENT_NAME = "Zainab Bibi";
export default function PatientPortalPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [apptRes, invoiceRes] = await Promise.all([
          api<{ items: Appointment[] }>('/api/appointments'),
          api<{ items: Invoice[] }>('/api/invoices'),
        ]);
        setAppointments(apptRes.items.filter(a => a.patient_id === MOCK_PATIENT_ID));
        setInvoices(invoiceRes.items.filter(i => i.patient_id === MOCK_PATIENT_ID));
      } catch (error) {
        toast.error("Failed to load your portal data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  const upcomingAppointment = useMemo(() => {
    return appointments
      .filter(a => new Date(a.start_time) >= new Date())
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0];
  }, [appointments]);
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Patient Portal</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, {MOCK_PATIENT_NAME}</span>
            <Button variant="outline" size="sm">Logout</Button>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Your Health Dashboard</h2>
                <p className="text-muted-foreground">View your appointments and manage your health records.</p>
              </div>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {upcomingAppointment ? (
                        <>
                          <p className="text-lg font-semibold">{format(new Date(upcomingAppointment.start_time), 'PPP p')}</p>
                          <p className="text-xs text-muted-foreground">Status: {upcomingAppointment.status}</p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground pt-2">No upcoming appointments.</p>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Recent Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {invoices.length > 0 ? (
                        <ul className="space-y-2">
                          {invoices.slice(0, 3).map(invoice => (
                            <li key={invoice.id} className="flex justify-between items-center text-sm">
                              <div>
                                <p className="font-medium">{invoice.invoice_number}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(invoice.created_at), 'PPP')}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">PKR {invoice.total_amount.toLocaleString()}</p>
                                <Badge variant={invoice.status === InvoiceStatus.Paid ? 'default' : 'destructive'}>{invoice.status}</Badge>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No invoices found.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}