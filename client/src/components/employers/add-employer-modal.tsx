import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { insertEmployerSchema } from '@shared/schema';
import { api, invalidateQueries } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Employer } from '@shared/schema';

interface AddEmployerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEmployer?: Employer | null;
}

export function AddEmployerModal({ open, onOpenChange, editingEmployer }: AddEmployerModalProps) {
  const { toast } = useToast();
  const isEditing = !!editingEmployer;

  const form = useForm({
    resolver: zodResolver(insertEmployerSchema),
    defaultValues: {
      company_name: editingEmployer?.company_name || '',
      role: editingEmployer?.role || '',
      start_date: editingEmployer?.start_date || '',
      end_date: editingEmployer?.end_date || '',
      notes: editingEmployer?.notes || '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/employers', data),
    onSuccess: () => {
      invalidateQueries(['/api/employers']);
      onOpenChange(false);
      form.reset();
      toast({ title: 'Employer added successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add employer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/api/employers/${editingEmployer!.id}`, data),
    onSuccess: () => {
      invalidateQueries(['/api/employers']);
      onOpenChange(false);
      form.reset();
      toast({ title: 'Employer updated successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update employer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: any) => {
    const processedData = {
      ...data,
      end_date: data.end_date || null,
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
          <DialogTitle>{isEditing ? 'Edit Employer' : 'Add Employer'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Acme Corporation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role/Position</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Key responsibilities, achievements, reason for leaving..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                {isPending ? 'Saving...' : (isEditing ? 'Update' : 'Save')} Employer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
