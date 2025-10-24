import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Role, User } from '@shared/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';
const modules = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'patients', label: 'Patients' },
  { id: 'staff', label: 'Staff' },
  { id: 'services', label: 'Services' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
];
const roles = Object.values(Role).filter(r => r !== Role.Patient);
type PermissionsByRole = Record<Role, string[]>;
export default function SettingsPage() {
  const { user, login } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [permissions, setPermissions] = useState<PermissionsByRole>({} as PermissionsByRole);
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { items } = await api<{ items: User[] }>('/api/users');
      setAllUsers(items);
      const permsByRole = items.reduce((acc, u) => {
        if (!acc[u.role] && u.permissions) {
          acc[u.role] = u.permissions;
        }
        return acc;
      }, {} as PermissionsByRole);
      setPermissions(permsByRole);
    } catch (error) {
      toast.error("Failed to load user data.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const promise = api(`/api/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify(formData),
      }).then((updatedUser: User) => {
        login(updatedUser);
        return updatedUser;
      });
      toast.promise(promise, {
        loading: 'Updating profile...',
        success: 'Profile updated successfully!',
        error: 'Failed to update profile.',
      });
    }
  };
  const handlePermissionChange = (role: Role, moduleId: string, checked: boolean) => {
    setPermissions(prev => {
      const currentPermissions = prev[role] || [];
      const newPermissions = checked
        ? [...currentPermissions, moduleId]
        : currentPermissions.filter(id => id !== moduleId);
      return { ...prev, [role]: newPermissions };
    });
  };
  const handlePermissionsSave = async () => {
    const promises = Object.entries(permissions).flatMap(([role, perms]) => {
      const usersOfRole = allUsers.filter(u => u.role === role);
      return usersOfRole.map(u =>
        api(`/api/users/${u.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ permissions: perms }),
        })
      );
    });
    toast.promise(Promise.all(promises), {
      loading: 'Saving permissions...',
      success: () => {
        fetchUsers(); // Re-fetch to confirm changes
        // If the current user is admin, update their context
        if (user?.role === Role.Admin) {
          login({ ...user, permissions: permissions[Role.Admin] });
        }
        return 'Permissions updated successfully!';
      },
      error: 'Failed to save some permissions.',
    });
  };
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage clinic settings and user permissions.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Admin Profile</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" value={formData.username} onChange={handleProfileChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleProfileChange} />
                </div>
                <Button type="submit" className="w-full">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>Control module visibility for each staff role.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Module</TableHead>
                      {roles.map(role => <TableHead key={role} className="text-center">{role}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modules.map(module => (
                      <TableRow key={module.id}>
                        <TableCell className="font-medium">{module.label}</TableCell>
                        {roles.map(role => (
                          <TableCell key={role} className="text-center">
                            <Checkbox
                              checked={permissions[role]?.includes(module.id) || false}
                              onCheckedChange={(checked) => handlePermissionChange(role, module.id, !!checked)}
                              disabled={role === Role.Admin}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handlePermissionsSave}>Save Permissions</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}