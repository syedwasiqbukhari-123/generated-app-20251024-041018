import React, { useState, useEffect } from 'react';
import { PlusCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Service } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
function ServiceForm({ service, onSave, onCancel }: { service: Partial<Service> | null, onSave: (service: Partial<Service>) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState<Partial<Service>>(service || {});
  const isEditMode = !!service?.id;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? parseFloat(value) : value;
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{isEditMode ? 'Edit Service' : 'Add New Service'}</DialogTitle>
        <DialogDescription>
          {isEditMode ? 'Update the details for this service.' : 'Fill in the details for the new service.'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Name</Label>
          <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">Category</Label>
          <Input id="category" name="category" value={formData.category || ''} onChange={handleChange} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="default_price" className="text-right">Price (PKR)</Label>
          <Input id="default_price" name="default_price" type="number" value={formData.default_price || ''} onChange={handleChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="estimated_duration_minutes" className="text-right">Duration (min)</Label>
          <Input id="estimated_duration_minutes" name="estimated_duration_minutes" type="number" value={formData.estimated_duration_minutes || ''} onChange={handleChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="description" className="text-right pt-2">Description</Label>
          <Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} className="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
}
export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const { items } = await api<{ items: Service[] }>('/api/services');
      setServices(items);
    } catch (error) {
      toast.error('Failed to fetch services.');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchServices();
  }, []);
  const handleSaveService = async (serviceData: Partial<Service>) => {
    const isEdit = !!serviceData.id;
    const promise = isEdit
      ? api(`/api/services/${serviceData.id}`, { method: 'PATCH', body: JSON.stringify(serviceData) })
      : api('/api/services', { method: 'POST', body: JSON.stringify(serviceData) });
    toast.promise(promise, {
      loading: 'Saving service...',
      success: () => {
        fetchServices();
        setIsDialogOpen(false);
        setEditingService(null);
        return `Service ${isEdit ? 'updated' : 'added'} successfully!`;
      },
      error: `Failed to ${isEdit ? 'update' : 'add'} service.`,
    });
  };
  const handleDeleteService = async () => {
    if (!selectedService) return;
    const promise = api(`/api/services/${selectedService.id}`, { method: 'DELETE' });
    toast.promise(promise, {
      loading: 'Deleting service...',
      success: () => {
        fetchServices();
        setIsAlertOpen(false);
        setSelectedService(null);
        return 'Service deleted successfully!';
      },
      error: 'Failed to delete service.',
    });
  };
  const handleAddNew = () => {
    setEditingService(null);
    setIsDialogOpen(true);
  };
  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };
  const confirmDelete = (service: Service) => {
    setSelectedService(service);
    setIsAlertOpen(true);
  };
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">Manage the services offered by the clinic.</p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Service List</CardTitle>
          <CardDescription>A list of all dental services and their prices.</CardDescription>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price (PKR)</TableHead>
                  <TableHead>Duration (min)</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.category}</TableCell>
                    <TableCell>{service.default_price.toLocaleString()}</TableCell>
                    <TableCell>{service.estimated_duration_minutes}</TableCell>
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
                          <DropdownMenuItem onSelect={() => handleEdit(service)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => confirmDelete(service)} className="text-red-600">Delete</DropdownMenuItem>
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
          <ServiceForm service={editingService} onSave={handleSaveService} onCancel={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service "{selectedService?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteService}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}