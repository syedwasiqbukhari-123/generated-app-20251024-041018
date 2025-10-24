import React, { useState, useEffect } from 'react';
import { PlusCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { InventoryItem } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
function InventoryItemForm({ item, onSave, onCancel }: { item: Partial<InventoryItem> | null, onSave: (item: Partial<InventoryItem>) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState<Partial<InventoryItem>>(item || { quantity_on_hand: 0, reorder_threshold: 10 });
  const isEditMode = !!item?.id;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{isEditMode ? 'Edit Item' : 'Add New Inventory Item'}</DialogTitle>
        <DialogDescription>
          {isEditMode ? 'Update the details for this inventory item.' : 'Fill in the details for the new item.'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Item Name</Label>
          <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="sku" className="text-right">SKU</Label>
          <Input id="sku" name="sku" value={formData.sku || ''} onChange={handleChange} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="unit" className="text-right">Unit</Label>
          <Input id="unit" name="unit" value={formData.unit || ''} onChange={handleChange} className="col-span-3" placeholder="e.g., box, piece, ml" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="quantity_on_hand" className="text-right">Quantity</Label>
          <Input id="quantity_on_hand" name="quantity_on_hand" type="number" value={formData.quantity_on_hand || 0} onChange={handleChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="reorder_threshold" className="text-right">Reorder At</Label>
          <Input id="reorder_threshold" name="reorder_threshold" type="number" value={formData.reorder_threshold || 0} onChange={handleChange} className="col-span-3" required />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Item</Button>
      </DialogFooter>
    </form>
  );
}
function UpdateStockDialog({
  item,
  action,
  onSave,
  onCancel,
}: {
  item: InventoryItem;
  action: 'receive' | 'consume';
  onSave: (quantityChange: number) => void;
  onCancel: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{action === 'receive' ? 'Receive Stock' : 'Consume Stock'} for {item.name}</DialogTitle>
        <DialogDescription>
          Current quantity: {item.quantity_on_hand} {item.unit}.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <Label htmlFor="quantity">Quantity to {action}</Label>
        <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))} />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(action === 'receive' ? quantity : -quantity)}>Update Stock</Button>
      </DialogFooter>
    </DialogContent>
  );
}
export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStockUpdateOpen, setIsStockUpdateOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [stockAction, setStockAction] = useState<'receive' | 'consume'>('receive');
  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const { items } = await api<{ items: InventoryItem[] }>('/api/inventory');
      setItems(items);
    } catch (error) {
      toast.error('Failed to fetch inventory items.');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchInventory();
  }, []);
  const handleSaveItem = async (itemData: Partial<InventoryItem>) => {
    const isEdit = !!itemData.id;
    const promise = isEdit
      ? api(`/api/inventory/${itemData.id}`, { method: 'PATCH', body: JSON.stringify(itemData) })
      : api('/api/inventory', { method: 'POST', body: JSON.stringify(itemData) });
    toast.promise(promise, {
      loading: 'Saving inventory item...',
      success: () => {
        fetchInventory();
        setIsFormOpen(false);
        setSelectedItem(null);
        return `Item ${isEdit ? 'updated' : 'added'} successfully!`;
      },
      error: `Failed to ${isEdit ? 'update' : 'add'} item.`,
    });
  };
  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    const promise = api(`/api/inventory/${selectedItem.id}`, { method: 'DELETE' });
    toast.promise(promise, {
      loading: 'Deleting item...',
      success: () => {
        fetchInventory();
        setIsAlertOpen(false);
        setSelectedItem(null);
        return 'Item deleted successfully!';
      },
      error: 'Failed to delete item.',
    });
  };
  const handleOpenStockUpdate = (item: InventoryItem, action: 'receive' | 'consume') => {
    setSelectedItem(item);
    setStockAction(action);
    setIsStockUpdateOpen(true);
  };
  const handleStockUpdate = async (quantityChange: number) => {
    if (!selectedItem) return;
    const newQuantity = selectedItem.quantity_on_hand + quantityChange;
    const promise = api(`/api/inventory/${selectedItem.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity_on_hand: newQuantity }),
    });
    toast.promise(promise, {
      loading: 'Updating stock...',
      success: () => {
        fetchInventory();
        setIsStockUpdateOpen(false);
        setSelectedItem(null);
        return 'Stock updated successfully!';
      },
      error: 'Failed to update stock.',
    });
  };
  const confirmDelete = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsAlertOpen(true);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Track and manage clinic supplies.</p>
        </div>
        <Button onClick={() => { setSelectedItem(null); setIsFormOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Stock List</CardTitle>
          <CardDescription>All dental supplies and their current stock levels.</CardDescription>
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
                  <TableHead>Item Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Quantity on Hand</TableHead>
                  <TableHead>Reorder Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku || 'N/A'}</TableCell>
                    <TableCell>{item.quantity_on_hand} {item.unit}</TableCell>
                    <TableCell>{item.reorder_threshold}</TableCell>
                    <TableCell>
                      {item.quantity_on_hand <= item.reorder_threshold ? (
                        <Badge variant="destructive">Low Stock</Badge>
                      ) : (
                        <Badge variant="default">In Stock</Badge>
                      )}
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
                          <DropdownMenuItem onSelect={() => { setSelectedItem(item); setIsFormOpen(true); }}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleOpenStockUpdate(item, 'receive')}>Receive Stock</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleOpenStockUpdate(item, 'consume')}>Consume Stock</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => confirmDelete(item)} className="text-red-600">Delete</DropdownMenuItem>
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
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <InventoryItemForm item={selectedItem} onSave={handleSaveItem} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
      {selectedItem && (
        <Dialog open={isStockUpdateOpen} onOpenChange={setIsStockUpdateOpen}>
          <UpdateStockDialog
            item={selectedItem}
            action={stockAction}
            onSave={handleStockUpdate}
            onCancel={() => { setIsStockUpdateOpen(false); setSelectedItem(null); }}
          />
        </Dialog>
      )}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item "{selectedItem?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}