import React, { useState, useEffect } from 'react';
import { PlusCircle, MoreHorizontal, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Patient } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
function PatientForm({ patient, onSave, onCancel }: { patient: Partial<Patient> | null, onSave: (patient: Partial<Patient>) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState<Partial<Patient>>(patient || {});
  const isEditMode = !!patient?.id;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{isEditMode ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
        <DialogDescription>
          {isEditMode ? 'Update the details for this patient.' : 'Fill in the details for the new patient.'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="full_name" className="text-right">Full Name</Label>
          <Input id="full_name" name="full_name" value={formData.full_name || ''} onChange={handleChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone" className="text-right">Phone</Label>
          <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="dob" className="text-right">Date of Birth</Label>
          <Input id="dob" name="dob" type="date" value={formData.dob ? format(new Date(formData.dob), 'yyyy-MM-dd') : ''} onChange={handleChange} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="medical_history" className="text-right pt-2">Medical History</Label>
          <Textarea id="medical_history" name="medical_history" value={formData.medical_history || ''} onChange={handleChange} className="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
}
export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Partial<Patient> | null>(null);
  const navigate = useNavigate();
  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const { items } = await api<{ items: Patient[] }>('/api/patients');
      setPatients(items);
    } catch (error) {
      toast.error('Failed to fetch patients.');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchPatients();
  }, []);
  const handleSavePatient = async (patientData: Partial<Patient>) => {
    const isEdit = !!patientData.id;
    const promise = isEdit
      ? api(`/api/patients/${patientData.id}`, { method: 'PATCH', body: JSON.stringify(patientData) })
      : api('/api/patients', { method: 'POST', body: JSON.stringify(patientData) });
    toast.promise(promise, {
      loading: 'Saving patient...',
      success: () => {
        fetchPatients();
        setIsDialogOpen(false);
        setEditingPatient(null);
        return `Patient ${isEdit ? 'updated' : 'added'} successfully!`;
      },
      error: `Failed to ${isEdit ? 'update' : 'add'} patient.`,
    });
  };
  const handleDeletePatient = async () => {
    if (!selectedPatient) return;
    const promise = api(`/api/patients/${selectedPatient.id}`, { method: 'DELETE' });
    toast.promise(promise, {
      loading: 'Deleting patient...',
      success: () => {
        fetchPatients();
        setIsAlertOpen(false);
        setSelectedPatient(null);
        return 'Patient deleted successfully!';
      },
      error: 'Failed to delete patient.',
    });
  };
  const handleAddNew = () => {
    setEditingPatient(null);
    setIsDialogOpen(true);
  };
  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setIsDialogOpen(true);
  };
  const confirmDelete = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsAlertOpen(true);
  };
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Records</h1>
          <p className="text-muted-foreground">Manage all patient information.</p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Patient
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
          <CardDescription>A list of all patients registered at the clinic.</CardDescription>
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
                  <TableHead>Full Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.full_name}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{patient.email || 'N/A'}</TableCell>
                    <TableCell>{patient.dob ? format(new Date(patient.dob), 'PPP') : 'N/A'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => navigate(`/patients/${patient.id}`)}>
                            <Eye className="mr-2 h-4 w-4" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleEdit(patient)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => confirmDelete(patient)} className="text-red-600">Delete</DropdownMenuItem>
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <PatientForm patient={editingPatient} onSave={handleSavePatient} onCancel={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the patient record for {selectedPatient?.full_name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePatient}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}