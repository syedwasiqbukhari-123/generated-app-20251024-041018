import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { Patient, Appointment, Invoice, User, Service, InvoiceStatus } from '@shared/types';
import { toast } from 'sonner';
import { Loader2, User as UserIcon, Mail, Phone, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
export default function PatientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dataMap, setDataMap] = useState<{ doctors: Map<string, User>, services: Map<string, Service> }>({
    doctors: new Map(),
    services: new Map(),
  });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const [patientRes, appointmentsRes, invoicesRes, usersRes, servicesRes] = await Promise.all([
          api<Patient>(`/api/patients/${id}`),
          api<{ items: Appointment[] }>('/api/appointments'),
          api<{ items: Invoice[] }>('/api/invoices'),
          api<{ items: User[] }>('/api/users'),
          api<{ items: Service[] }>('/api/services'),
        ]);
        setPatient(patientRes);
        setAppointments(appointmentsRes.items.filter(a => a.patient_id === id).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()));
        setInvoices(invoicesRes.items.filter(i => i.patient_id === id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        setDataMap({
          doctors: new Map(usersRes.items.map(u => [u.id, u])),
          services: new Map(servicesRes.items.map(s => [s.id, s])),
        });
      } catch (error) {
        toast.error('Failed to load patient profile.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);
  const getStatusVariant = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.Paid: return 'default';
      case InvoiceStatus.Unpaid: return 'destructive';
      case InvoiceStatus.PartiallyPaid: return 'secondary';
      default: return 'outline';
    }
  };
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }
  if (!patient) {
    return <div className="text-center py-10">Patient not found.</div>;
  }
  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/patients" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to All Patients
      </Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{patient.full_name}</h1>
        <p className="text-muted-foreground">Patient Profile & History</p>
      </div>
      <Tabs defaultValue="summary">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center"><UserIcon className="h-4 w-4 mr-3 text-muted-foreground" /> <strong className="w-28">Gender:</strong><span>{patient.gender || 'N/A'}</span></div>
              <div className="flex items-center"><CalendarIcon className="h-4 w-4 mr-3 text-muted-foreground" /> <strong className="w-28">Date of Birth:</strong><span>{patient.dob ? format(new Date(patient.dob), 'PPP') : 'N/A'}</span></div>
              <div className="flex items-center"><Phone className="h-4 w-4 mr-3 text-muted-foreground" /> <strong className="w-28">Phone:</strong><span>{patient.phone}</span></div>
              <div className="flex items-center"><Mail className="h-4 w-4 mr-3 text-muted-foreground" /> <strong className="w-28">Email:</strong><span>{patient.email || 'N/A'}</span></div>
              <div>
                <h4 className="font-semibold mb-2 mt-4">Medical History</h4>
                <p className="text-sm text-muted-foreground p-4 bg-muted rounded-md border">{patient.medical_history || 'No medical history provided.'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appointments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.length > 0 ? appointments.map(appt => (
                    <TableRow key={appt.id}>
                      <TableCell>{format(new Date(appt.start_time), 'PPP p')}</TableCell>
                      <TableCell>{dataMap.services.get(appt.service_id)?.name || 'N/A'}</TableCell>
                      <TableCell>{dataMap.doctors.get(appt.doctor_user_id)?.full_name || 'N/A'}</TableCell>
                      <TableCell><Badge variant="outline">{appt.status}</Badge></TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center">No appointments found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount (PKR)</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length > 0 ? invoices.map(inv => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                      <TableCell>{format(new Date(inv.created_at), 'PPP')}</TableCell>
                      <TableCell className="text-right">{inv.total_amount.toLocaleString()}</TableCell>
                      <TableCell className="text-center"><Badge variant={getStatusVariant(inv.status)}>{inv.status}</Badge></TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center">No invoices found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}