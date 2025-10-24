import React, { useState, useMemo, useEffect } from 'react';
import { PlusCircle, Loader2, Calendar as CalendarIcon, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay, addMinutes } from 'date-fns';
import { Appointment, Patient, User, Service, Role, AppointmentStatus } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
function AppointmentForm({
  appointment,
  patients,
  doctors,
  services,
  onSave,
  onCancel,
}: {
  appointment: Partial<Appointment> | null;
  patients: Patient[];
  doctors: User[];
  services: Service[];
  onSave: (data: Partial<Appointment>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Appointment>>(appointment || { status: AppointmentStatus.Scheduled });
  const isEditMode = !!appointment?.id;
  const handleSelectChange = (name: keyof Appointment, value: string) => {
    const updatedFormData = { ...formData, [name]: value };
    if (name === 'service_id') {
      const selectedService = services.find(s => s.id === value);
      if (selectedService && formData.start_time) {
        const endTime = addMinutes(new Date(formData.start_time), selectedService.estimated_duration_minutes);
        updatedFormData.end_time = endTime.toISOString();
      }
    }
    setFormData(updatedFormData);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{isEditMode ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
        <DialogDescription>Fill in the details to schedule an appointment.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {/* Patient Selector */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Patient</Label>
          <Popover>
            <PopoverTrigger asChild><Button variant="outline" className="col-span-3 justify-start">{formData.patient_id ? patients.find(p => p.id === formData.patient_id)?.full_name : "Select Patient"}</Button></PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search patient..." /><CommandList><CommandEmpty>No patient found.</CommandEmpty><CommandGroup>{patients.map(p => <CommandItem key={p.id} value={p.full_name} onSelect={() => handleSelectChange('patient_id', p.id)}>{p.full_name}</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent>
          </Popover>
        </div>
        {/* Service Selector */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Service</Label>
          <Popover>
            <PopoverTrigger asChild><Button variant="outline" className="col-span-3 justify-start">{formData.service_id ? services.find(s => s.id === formData.service_id)?.name : "Select Service"}</Button></PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search service..." /><CommandList><CommandEmpty>No service found.</CommandEmpty><CommandGroup>{services.map(s => <CommandItem key={s.id} value={s.name} onSelect={() => handleSelectChange('service_id', s.id)}>{s.name}</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent>
          </Popover>
        </div>
        {/* Doctor Selector */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Doctor</Label>
          <Popover>
            <PopoverTrigger asChild><Button variant="outline" className="col-span-3 justify-start">{formData.doctor_user_id ? doctors.find(d => d.id === formData.doctor_user_id)?.full_name : "Select Doctor"}</Button></PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search doctor..." /><CommandList><CommandEmpty>No doctor found.</CommandEmpty><CommandGroup>{doctors.map(d => <CommandItem key={d.id} value={d.full_name} onSelect={() => handleSelectChange('doctor_user_id', d.id)}>{d.full_name}</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent>
          </Popover>
        </div>
        {/* Start Time */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Start Time</Label>
          <Input type="datetime-local" className="col-span-3" value={formData.start_time ? format(new Date(formData.start_time), "yyyy-MM-dd'T'HH:mm") : ''} onChange={e => setFormData(p => ({...p, start_time: new Date(e.target.value).toISOString()}))} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Appointment</Button>
      </DialogFooter>
    </form>
  );
}
export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Partial<Appointment> | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [apptRes, patientRes, staffRes, serviceRes] = await Promise.all([
        api<{ items: Appointment[] }>('/api/appointments'),
        api<{ items: Patient[] }>('/api/patients'),
        api<{ items: User[] }>('/api/users'),
        api<{ items: Service[] }>('/api/services'),
      ]);
      setAppointments(apptRes.items);
      setPatients(patientRes.items);
      setDoctors(staffRes.items.filter(u => u.role === Role.Doctor));
      setServices(serviceRes.items);
    } catch (error) {
      toast.error("Failed to load schedule data.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const dataMap = useMemo(() => ({
    patients: new Map(patients.map(p => [p.id, p])),
    doctors: new Map(doctors.map(d => [d.id, d])),
    services: new Map(services.map(s => [s.id, s])),
  }), [patients, doctors, services]);
  const todaysAppointments = useMemo(() => {
    if (!selectedDate) return [];
    return appointments
      .filter(appt => isSameDay(new Date(appt.start_time), selectedDate))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [appointments, selectedDate]);
  const handleSaveAppointment = async (data: Partial<Appointment>) => {
    const isEditing = !!data.id;
    const url = isEditing ? `/api/appointments/${data.id}` : '/api/appointments';
    const method = isEditing ? 'PATCH' : 'POST';
    const promise = api(url, { method, body: JSON.stringify(data) });
    toast.promise(promise, {
      loading: isEditing ? 'Updating appointment...' : 'Scheduling appointment...',
      success: () => {
        fetchData();
        setIsDialogOpen(false);
        setSelectedAppointment(null);
        return `Appointment ${isEditing ? 'updated' : 'scheduled'} successfully!`;
      },
      error: `Failed to ${isEditing ? 'update' : 'schedule'} appointment.`,
    });
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment?.id) return;
    const promise = api(`/api/appointments/${selectedAppointment.id}`, { method: 'DELETE' });
    toast.promise(promise, {
      loading: 'Deleting appointment...',
      success: () => {
        fetchData();
        setIsDeleteDialogOpen(false);
        setSelectedAppointment(null);
        return 'Appointment deleted successfully!';
      },
      error: 'Failed to delete appointment.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Schedule and manage patient appointments.</p>
        </div>
        <Button onClick={() => { setSelectedAppointment(null); setIsDialogOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Appointment
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md"
            />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Schedule for {selectedDate ? format(selectedDate, 'PPP') : '...'}</CardTitle>
            <CardDescription>
              {todaysAppointments.length} appointment(s) scheduled for this day.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : todaysAppointments.length > 0 ? (
              <div className="space-y-4">
                {todaysAppointments.map(appt => (
                  <div key={appt.id} className="flex items-center space-x-4 rounded-lg border p-4">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {dataMap.patients.get(appt.patient_id)?.full_name || 'Unknown Patient'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {dataMap.services.get(appt.service_id)?.name || 'Unknown Service'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        with {dataMap.doctors.get(appt.doctor_user_id)?.full_name || 'Unknown Doctor'}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right mr-2">
                        <p className="text-sm font-semibold">
                          {format(new Date(appt.start_time), 'p')} - {format(new Date(appt.end_time), 'p')}
                        </p>
                        <p className="text-xs text-muted-foreground">{appt.status}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedAppointment(appt); setIsDialogOpen(true); }}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedAppointment(appt); setIsDeleteDialogOpen(true); }} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-16">
                <p>No appointments scheduled for this day.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) setSelectedAppointment(null); setIsDialogOpen(isOpen); }}>
        <DialogContent className="sm:max-w-lg">
          <AppointmentForm
            appointment={selectedAppointment}
            patients={patients}
            doctors={doctors}
            services={services}
            onSave={handleSaveAppointment}
            onCancel={() => { setIsDialogOpen(false); setSelectedAppointment(null); }}
          />
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the appointment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedAppointment(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAppointment}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}