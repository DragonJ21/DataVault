import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { insertAddressSchema } from '@shared/schema';
import { api, invalidateQueries } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@shared/schema';

interface AddAddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAddress?: Address | null;
}

export function AddAddressModal({ open, onOpenChange, editingAddress }: AddAddressModalProps) {
  const { toast } = useToast();
  const isEditing = !!editingAddress;

  const form = useForm({
    resolver: zodResolver(insertAddressSchema),
    defaultValues: {
      address: editingAddress?.address || '',
      city: editingAddress?.city || '',
      state: editingAddress?.state || '',
      country: editingAddress?.country || '',
      from_date: editingAddress?.from_date || '',
      to_date: editingAddress?.to_date || '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/addresses', data),
    onSuccess: () => {
      invalidateQueries(['/api/addresses']);
      onOpenChange(false);
      form.reset();
      toast({ title: 'Address added successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add address',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/api/addresses/${editingAddress!.id}`, data),
    onSuccess: () => {
      invalidateQueries(['/api/addresses']);
      onOpenChange(false);
      form.reset();
      toast({ title: 'Address updated successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update address',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: any) => {
    const processedData = {
      ...data,
      state: data.state || null,
      to_date: data.to_date || null,
    };

    if (isEditing) {
      updateMutation.mutate(processedData);
    } else {
      createMutation.mutate(processedData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Address' : 'Add Address'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 123 Main Street, Apt 4B" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., United States" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="from_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="to_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? 'Saving...' : (isEditing ? 'Update' : 'Save')} Address
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
