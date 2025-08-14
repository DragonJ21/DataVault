import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { insertEducationSchema } from '@shared/schema';
import { api, invalidateQueries } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Education } from '@shared/schema';

interface AddEducationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEducation?: Education | null;
}

export function AddEducationModal({ open, onOpenChange, editingEducation }: AddEducationModalProps) {
  const { toast } = useToast();
  const isEditing = !!editingEducation;

  const form = useForm({
    resolver: zodResolver(insertEducationSchema),
    defaultValues: {
      institution: editingEducation?.institution || '',
      degree: editingEducation?.degree || '',
      start_date: editingEducation?.start_date || '',
      end_date: editingEducation?.end_date || '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/education', data),
    onSuccess: () => {
      invalidateQueries(['/api/education']);
      onOpenChange(false);
      form.reset();
      toast({ title: 'Education record added successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add education record',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/api/education/${editingEducation!.id}`, data),
    onSuccess: () => {
      invalidateQueries(['/api/education']);
      onOpenChange(false);
      form.reset();
      toast({ title: 'Education record updated successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update education record',
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
          <DialogTitle>{isEditing ? 'Edit Education' : 'Add Education'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., University of California" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Degree</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Bachelor of Science in Computer Science" {...field} />
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
                {isPending ? 'Saving...' : (isEditing ? 'Update' : 'Save')} Education
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
