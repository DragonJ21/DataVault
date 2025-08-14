import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { insertTravelHistorySchema } from '@shared/schema';
import { api, invalidateQueries } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { TravelHistory } from '@shared/schema';

interface AddTravelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEntry?: TravelHistory | null;
}

export function AddTravelModal({ open, onOpenChange, editingEntry }: AddTravelModalProps) {
  const { toast } = useToast();
  const isEditing = !!editingEntry;

  const form = useForm({
    resolver: zodResolver(insertTravelHistorySchema),
    defaultValues: {
      date: editingEntry?.date || '',
      destination: editingEntry?.destination || '',
      notes: editingEntry?.notes || '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/travel-history', data),
    onSuccess: () => {
      invalidateQueries(['/api/travel-history']);
      onOpenChange(false);
      form.reset();
      toast({ title: 'Travel entry added successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add travel entry',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/api/travel-history/${editingEntry!.id}`, data),
    onSuccess: () => {
      invalidateQueries(['/api/travel-history']);
      onOpenChange(false);
      form.reset();
      toast({ title: 'Travel entry updated successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update travel entry',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: any) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Travel Entry' : 'Add Travel Entry'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tokyo, Japan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Purpose of travel, memorable experiences, etc."
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
                {isPending ? 'Saving...' : (isEditing ? 'Update' : 'Save')} Travel Entry
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
