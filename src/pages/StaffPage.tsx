import React, { useState, useEffect } from 'react';
import { PlusCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { User, Role } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
const roleOptions = Object.values(Role);
function StaffForm({ staff, onSave, onCancel }: { staff: Partial<User> | null, onSave: (staff: Partial<User>) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState<Partial<User>>(staff || { role: Role.Receptionist });
  const isEditMode = !!staff?.id;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleRoleChange = (value: Role) => {
    setFormData(prev => ({ ...prev, role: value }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{isEditMode ? 'Edit Staff' : 'Add New Staff'}</DialogTitle>
        <DialogDescription>
          {isEditMode ? 'Update the details for this staff member.' : 'Fill in the details for the new staff member.'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="full_name" className="text-right">Full Name</Label>
          <Input id="full_name" name="full_name" value={formData.full_name || ''} onChange={handleChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">Username</Label>
          <Input id="username" name="username" value={formData.username || ''} onChange={handleChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} className="col-span-3" required />
        </div>
        {!isEditMode && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">Password</Label>
            <Input id="password" name="password" type="password" value={formData.password || ''} onChange={handleChange} className="col-span-3" required />
          </div>
        )}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="role" className="text-right">Role</Label>
          <Select onValueChange={handleRoleChange} defaultValue={formData.role}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone" className="text-right">Phone</Label>
          <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} className="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
}
export default function StaffPage() {
  const [staffList, setStaffList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [editingStaff, setEditingStaff] = useState<Partial<User> | null>(null);
  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const { items } = await api<{ items: User[] }>('/api/users');
      setStaffList(items);
    } catch (error) {
      toast.error('Failed to fetch staff members.');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchStaff();
  }, []);
  const handleSaveStaff = async (staffData: Partial<User>) => {
    const isEdit = !!staffData.id;
    const promise = isEdit
      ? api(`/api/users/${staffData.id}`, { method: 'PATCH', body: JSON.stringify(staffData) })
      : api('/api/users', { method: 'POST', body: JSON.stringify(staffData) });
    toast.promise(promise, {
      loading: 'Saving staff member...',
      success: () => {
        fetchStaff();
        setIsDialogOpen(false);
        setEditingStaff(null);
        return `Staff member ${isEdit ? 'updated' : 'added'} successfully!`;
      },
      error: `Failed to ${isEdit ? 'update' : 'add'} staff member.`,
    });
  };
  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;
    const promise = api(`/api/users/${selectedStaff.id}`, { method: 'DELETE' });
    toast.promise(promise, {
      loading: 'Deleting staff member...',
      success: () => {
        fetchStaff();
        setIsAlertOpen(false);
        setSelectedStaff(null);
        return 'Staff member deleted successfully!';
      },
      error: 'Failed to delete staff member.',
    });
  };
  const handleAddNew = () => {
    setEditingStaff(null);
    setIsDialogOpen(true);
  };
  const handleEdit = (staff: User) => {
    setEditingStaff(staff);
    setIsDialogOpen(true);
  };
  const confirmDelete = (staff: User) => {
    setSelectedStaff(staff);
    setIsAlertOpen(true);
  };
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">Manage all staff accounts and roles.</p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Staff
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Staff List</CardTitle>
          <CardDescription>A list of all staff members in the clinic.</CardDescription>
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
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffList.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.full_name}</TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell><Badge variant="outline">{staff.role}</Badge></TableCell>
                    <TableCell>{staff.phone || 'N/A'}</TableCell>
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
                          <DropdownMenuItem onSelect={() => handleEdit(staff)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => confirmDelete(staff)} className="text-red-600">Delete</DropdownMenuItem>
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
          <StaffForm staff={editingStaff} onSave={handleSaveStaff} onCancel={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the staff account for {selectedStaff?.full_name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStaff}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}