import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Invoice, Patient, InvoiceStatus, Service } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
interface InvoiceItem {
  service_id: string;
  description: string;
  quantity: number;
  unit_price: number;
}
function InvoiceForm({
  patients,
  services,
  onSave,
  onCancel,
}: {
  patients: Patient[];
  services: Service[];
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const [patientId, setPatientId] = useState<string | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const handleAddService = (service: Service) => {
    setItems(prev => [...prev, { service_id: service.id, description: service.name, quantity: 1, unit_price: service.default_price }]);
  };
  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0), [items]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || items.length === 0 || !user) {
      toast.error("Please select a patient and add at least one service.");
      return;
    }
    onSave({
      patient_id: patientId,
      created_by_user_id: user.id,
      total_amount: totalAmount,
      items: items,
    });
  };
  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Create New Invoice</DialogTitle>
        <DialogDescription>Select a patient and add services to generate an invoice.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Patient</Label>
          <Popover>
            <PopoverTrigger asChild><Button variant="outline" className="col-span-3 justify-start">{patientId ? patients.find(p => p.id === patientId)?.full_name : "Select Patient"}</Button></PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search patient..." /><CommandList><CommandEmpty>No patient found.</CommandEmpty><CommandGroup>{patients.map(p => <CommandItem key={p.id} value={p.full_name} onSelect={() => setPatientId(p.id)}>{p.full_name}</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent>
          </Popover>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Add Service</Label>
          <Popover>
            <PopoverTrigger asChild><Button variant="outline" className="col-span-3 justify-start">Click to add a service</Button></PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search service..." /><CommandList><CommandEmpty>No service found.</CommandEmpty><CommandGroup>{services.map(s => <CommandItem key={s.id} value={s.name} onSelect={() => handleAddService(s)}>{s.name} - PKR {s.default_price}</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent>
          </Popover>
        </div>
        <div className="col-span-4 space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
              <span>{item.description} (x{item.quantity})</span>
              <span>PKR {(item.quantity * item.unit_price).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="col-span-4 text-right font-bold text-lg">
          Total: PKR {totalAmount.toLocaleString()}
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Create Invoice</Button>
      </DialogFooter>
    </form>
  );
}
function RecordPaymentDialog({
  invoice,
  onSave,
  onCancel,
}: {
  invoice: Invoice;
  onSave: (status: InvoiceStatus) => void;
  onCancel: () => void;
}) {
  const [status, setStatus] = useState<InvoiceStatus>(invoice.status);
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Record Payment for {invoice.invoice_number}</DialogTitle>
        <DialogDescription>Update the payment status for this invoice.</DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <Label htmlFor="status">Payment Status</Label>
        <Select onValueChange={(value: InvoiceStatus) => setStatus(value)} defaultValue={status}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(InvoiceStatus).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(status)}>Save Status</Button>
      </DialogFooter>
    </DialogContent>
  );
}
export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [invoiceRes, patientRes, serviceRes] = await Promise.all([
        api<{ items: Invoice[] }>('/api/invoices'),
        api<{ items: Patient[] }>('/api/patients'),
        api<{ items: Service[] }>('/api/services'),
      ]);
      setInvoices(invoiceRes.items);
      setPatients(patientRes.items);
      setServices(serviceRes.items);
    } catch (error) {
      toast.error("Failed to load page data.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const patientMap = useMemo(() => new Map(patients.map(p => [p.id, p])), [patients]);
  const getStatusVariant = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.Paid: return 'default';
      case InvoiceStatus.Unpaid: return 'destructive';
      case InvoiceStatus.PartiallyPaid: return 'secondary';
      default: return 'outline';
    }
  };
  const handleSaveInvoice = async (data: any) => {
    const promise = api('/api/invoices', { method: 'POST', body: JSON.stringify(data) });
    toast.promise(promise, {
      loading: 'Creating invoice...',
      success: () => {
        fetchData();
        setIsCreateDialogOpen(false);
        return 'Invoice created successfully!';
      },
      error: 'Failed to create invoice.',
    });
  };
  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentDialogOpen(true);
  };
  const handleStatusUpdate = async (status: InvoiceStatus) => {
    if (!selectedInvoice) return;
    const promise = api(`/api/invoices/${selectedInvoice.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    toast.promise(promise, {
      loading: 'Updating status...',
      success: () => {
        fetchData();
        setIsPaymentDialogOpen(false);
        setSelectedInvoice(null);
        return 'Invoice status updated!';
      },
      error: 'Failed to update status.',
    });
  };
  const confirmDelete = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsAlertOpen(true);
  };
  const handleDeleteInvoice = async () => {
    if (!selectedInvoice) return;
    const promise = api(`/api/invoices/${selectedInvoice.id}`, { method: 'DELETE' });
    toast.promise(promise, {
      loading: 'Deleting invoice...',
      success: () => {
        fetchData();
        setIsAlertOpen(false);
        setSelectedInvoice(null);
        return 'Invoice deleted successfully!';
      },
      error: 'Failed to delete invoice.',
    });
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage all patient billing and payments.</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>A list of all invoices generated for patients.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount (PKR)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{patientMap.get(invoice.patient_id)?.full_name || 'Unknown'}</TableCell>
                    <TableCell>{format(new Date(invoice.created_at), 'PPP')}</TableCell>
                    <TableCell>{invoice.total_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleRecordPayment(invoice)}>Record Payment</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => confirmDelete(invoice)} className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <InvoiceForm
            patients={patients}
            services={services}
            onSave={handleSaveInvoice}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      {selectedInvoice && (
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <RecordPaymentDialog
            invoice={selectedInvoice}
            onSave={handleStatusUpdate}
            onCancel={() => { setIsPaymentDialogOpen(false); setSelectedInvoice(null); }}
          />
        </Dialog>
      )}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete invoice {selectedInvoice?.invoice_number}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInvoice}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}