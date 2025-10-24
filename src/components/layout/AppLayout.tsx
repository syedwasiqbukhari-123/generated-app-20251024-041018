import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDialogStore } from '@/stores/dialogStore';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { api } from '@/lib/api-client';
import { Patient, Appointment, Invoice } from '@shared/types';
import { toast } from 'sonner';
// These forms are simplified for global use. In a real-world scenario,
// they would be more robust and likely live in their own files.
// For this project, keeping them here centralizes the global dialog logic.
function GlobalPatientForm({ onSave, onCancel }: { onSave: (data: Partial<Patient>) => void, onCancel: () => void }) {
    const [formData, setFormData] = React.useState<Partial<Patient>>({});
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
            <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">New Patient</h3>
                <input name="full_name" placeholder="Full Name" onChange={handleChange} className="w-full p-2 border rounded-md" required />
                <input name="phone" placeholder="Phone" onChange={handleChange} className="w-full p-2 border rounded-md" required />
                <input name="email" placeholder="Email (optional)" onChange={handleChange} className="w-full p-2 border rounded-md" />
            </div>
            <div className="flex justify-end gap-2 p-4 bg-muted/50 border-t rounded-b-lg">
                <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Save Patient</button>
            </div>
        </form>
    );
}
function GlobalAppointmentForm({ onSave, onCancel }: { onSave: (data: Partial<Appointment>) => void, onCancel: () => void }) {
    const [formData, setFormData] = React.useState<Partial<Appointment>>({});
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
            <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">New Appointment</h3>
                <p className="text-sm text-muted-foreground">Quick add is simplified. For full options, please use the Appointments page.</p>
                <input name="patient_id" placeholder="Patient ID" onChange={handleChange} className="w-full p-2 border rounded-md" required />
                <input name="service_id" placeholder="Service ID" onChange={handleChange} className="w-full p-2 border rounded-md" required />
                <input name="doctor_user_id" placeholder="Doctor ID" onChange={handleChange} className="w-full p-2 border rounded-md" required />
                <input name="start_time" type="datetime-local" onChange={handleChange} className="w-full p-2 border rounded-md" required />
            </div>
            <div className="flex justify-end gap-2 p-4 bg-muted/50 border-t rounded-b-lg">
                <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Save Appointment</button>
            </div>
        </form>
    );
}
function GlobalInvoiceForm({ onSave, onCancel }: { onSave: (data: Partial<Invoice>) => void, onCancel: () => void }) {
    const [formData, setFormData] = React.useState<Partial<Invoice>>({});
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
            <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">New Invoice</h3>
                <p className="text-sm text-muted-foreground">Quick add is simplified. For full options, please use the Invoices page.</p>
                <input name="patient_id" placeholder="Patient ID" onChange={handleChange} className="w-full p-2 border rounded-md" required />
                <input name="total_amount" type="number" placeholder="Total Amount" onChange={handleChange} className="w-full p-2 border rounded-md" required />
            </div>
            <div className="flex justify-end gap-2 p-4 bg-muted/50 border-t rounded-b-lg">
                <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Save Invoice</button>
            </div>
        </form>
    );
}
export function AppLayout({ children }: { children: React.ReactNode }): JSX.Element {
  const isMobile = useIsMobile();
  const dialogType = useDialogStore(s => s.dialogType);
  const isOpen = useDialogStore(s => s.isOpen);
  const closeDialog = useDialogStore(s => s.closeDialog);
  const queryClient = useQueryClient();
  const handleSavePatient = async (patientData: Partial<Patient>) => {
    const promise = api('/api/patients', { method: 'POST', body: JSON.stringify(patientData) });
    toast.promise(promise, {
      loading: 'Saving patient...',
      success: () => {
        closeDialog();
        queryClient.invalidateQueries({ queryKey: ['patients'] });
        return `Patient added successfully!`;
      },
      error: `Failed to add patient.`,
    });
  };
  const handleSaveAppointment = async (appointmentData: Partial<Appointment>) => {
    const promise = api('/api/appointments', { method: 'POST', body: JSON.stringify(appointmentData) });
    toast.promise(promise, {
      loading: 'Saving appointment...',
      success: () => {
        closeDialog();
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
        return `Appointment added successfully!`;
      },
      error: `Failed to add appointment.`,
    });
  };
  const handleSaveInvoice = async (invoiceData: Partial<Invoice>) => {
    const promise = api('/api/invoices', { method: 'POST', body: JSON.stringify(invoiceData) });
    toast.promise(promise, {
      loading: 'Saving invoice...',
      success: () => {
        closeDialog();
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        return `Invoice added successfully!`;
      },
      error: `Failed to add invoice.`,
    });
  };
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {!isMobile && <AppSidebar />}
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40 overflow-y-auto">
          <div className="max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="p-0">
          {dialogType === 'newPatient' && <GlobalPatientForm onSave={handleSavePatient} onCancel={closeDialog} />}
          {dialogType === 'newAppointment' && <GlobalAppointmentForm onSave={handleSaveAppointment} onCancel={closeDialog} />}
          {dialogType === 'newInvoice' && <GlobalInvoiceForm onSave={handleSaveInvoice} onCancel={closeDialog} />}
          {/* Placeholders for other dialogs if they were to be implemented */}
          {(dialogType === 'userProfile' || dialogType === 'settings') && (
            <div className="p-6">
              <h3 className="text-lg font-semibold">Coming Soon</h3>
              <p className="text-sm text-muted-foreground">This feature is not yet available via quick actions.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}