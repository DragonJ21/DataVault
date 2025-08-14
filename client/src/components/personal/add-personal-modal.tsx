import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { insertPersonalInfoSchema } from '@shared/schema';
import { api, invalidateQueries } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { PersonalInfo } from '@shared/schema';

interface AddPersonalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingInfo?: PersonalInfo | null;
}

export function AddPersonalModal({ open, onOpenChange, editingInfo }: AddPersonalModalProps) {
  const { toast } = useToast();
  const isEditing = !!editingInfo;

  const form = useForm({
    resolver: zodResolver(insertPersonalInfoSchema),
    defaultValues: {
      full_name: editingInfo?.full_name || '',
      passport_number: editingInfo?.passport_number || '',
      dob: editingInfo?.dob || '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/personal-info', data),
    onSuccess: () => {
      invalidateQueries(['/api/personal-info']);
      onOpenChange(false);
      form.reset();
      toast({ title: 'Personal information added successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add personal information',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/api/personal-info/${editingInfo!.id}`, data),
    onSuccess: () => {
      invalidateQueries(['/api/personal-info']);
      onOpenChange(false);
      form.reset();
      toast({ title: 'Personal information updated successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update personal information',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: any) => {
    const processedData = {
      ...data,
      full_name: data.full_name || null,
      passport_number: data.passport_number || null,
      dob: data.dob || null,
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
          <DialogTitle>{isEditing ? 'Edit Personal Information' : 'Add Personal Information'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="passport_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passport Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                {isPending ? 'Saving...' : (isEditing ? 'Update' : 'Save')} Information
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
