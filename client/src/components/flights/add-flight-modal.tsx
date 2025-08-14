import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { insertFlightSchema } from '@shared/schema';
import { api, invalidateQueries } from '@/lib/api';
import { fetchFlightAutofill } from '@/lib/export';
import { useToast } from '@/hooks/use-toast';
import type { Flight } from '@shared/schema';

interface AddFlightModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingFlight?: Flight | null;
}

export function AddFlightModal({ open, onOpenChange, editingFlight }: AddFlightModalProps) {
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const { toast } = useToast();
  const isEditing = !!editingFlight;

  const form = useForm({
    resolver: zodResolver(insertFlightSchema),
    defaultValues: {
      flight_number: editingFlight?.flight_number || '',
      airline: editingFlight?.airline || '',
      departure_airport: editingFlight?.departure_airport || '',
      arrival_airport: editingFlight?.arrival_airport || '',
      departure_time: editingFlight?.departure_time ? new Date(editingFlight.departure_time).toISOString().slice(0, 16) : '',
      arrival_time: editingFlight?.arrival_time ? new Date(editingFlight.arrival_time).toISOString().slice(0, 16) : '',
      gate: editingFlight?.gate || '',
      status: editingFlight?.status || '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/flights', data),
    onSuccess: () => {
      invalidateQueries(['/api/flights']);
      onOpenChange(false);
      form.reset();
      toast({ title: 'Flight added successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add flight',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/api/flights/${editingFlight!.id}`, data),
    onSuccess: () => {
      invalidateQueries(['/api/flights']);
      onOpenChange(false);
      form.reset();
      toast({ title: 'Flight updated successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update flight',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleAutofill = async () => {
    const flightNumber = form.getValues('flight_number');
    if (!flightNumber) {
      toast({
        title: 'Flight number required',
        description: 'Please enter a flight number first',
        variant: 'destructive',
      });
      return;
    }

    setIsAutoFilling(true);
    try {
      const flightData = await fetchFlightAutofill(flightNumber);
      form.setValue('airline', flightData.airline);
      form.setValue('departure_airport', flightData.departure_airport);
      form.setValue('arrival_airport', flightData.arrival_airport);
      form.setValue('status', flightData.status || '');
      
      if (flightData.departure_time) {
        form.setValue('departure_time', new Date(flightData.departure_time).toISOString().slice(0, 16));
      }
      if (flightData.arrival_time) {
        form.setValue('arrival_time', new Date(flightData.arrival_time).toISOString().slice(0, 16));
      }
      if (flightData.gate) {
        form.setValue('gate', flightData.gate);
      }

      toast({ title: 'Flight data auto-filled successfully' });
    } catch (error: any) {
      let description = `Flight ${flightNumber} not found. Enter details manually.`;
      
      // Check if the error response includes suggestions
      if (error?.response?.data?.suggestions) {
        const suggestions = error.response.data.suggestions.slice(0, 3).join(', ');
        description = `Flight ${flightNumber} not found. Try these active flights: ${suggestions}`;
      } else {
        description = `Flight ${flightNumber} not found. Only current/scheduled flights work with autofill.`;
      }
      
      toast({
        title: 'Auto-fill failed',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsAutoFilling(false);
    }
  };

  const onSubmit = (data: any) => {
    // Convert datetime-local inputs to ISO strings
    const processedData = {
      ...data,
      departure_time: data.departure_time ? new Date(data.departure_time).toISOString() : null,
      arrival_time: data.arrival_time ? new Date(data.arrival_time).toISOString() : null,
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
          <DialogTitle>{isEditing ? 'Edit Flight' : 'Add Flight'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="flight_number"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Flight Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., AA123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isEditing && (
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAutofill}
                    disabled={isAutoFilling}
                  >
                    {isAutoFilling ? 'Auto-filling...' : 'Auto-fill'}
                  </Button>
                </div>
              )}
            </div>
            
            <FormField
              control={form.control}
              name="airline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Airline</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., American Airlines" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departure_airport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure Airport</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., JFK" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="arrival_airport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arrival Airport</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., LAX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departure_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="arrival_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arrival Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gate</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., On Time" {...field} />
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
                {isPending ? 'Saving...' : (isEditing ? 'Update' : 'Save')} Flight
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
