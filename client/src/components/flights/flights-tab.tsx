import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Plane, Clock, MapPin, Trash2, Edit2, Building2 } from 'lucide-react';
import { AddFlightModal } from './add-flight-modal';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Flight } from '@shared/schema';

export function FlightsTab() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: flights = [], isLoading } = useQuery<Flight[]>({
    queryKey: ['/api/flights'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/flights/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flights'] });
      toast({ title: 'Flight deleted successfully' });
    },
    onError: () => {
      toast({
        title: 'Error deleting flight',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (flight: Flight) => {
    setEditingFlight(flight);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this flight?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatTime = (dateTime: Date | null) => {
    if (!dateTime) return 'TBD';
    return new Date(dateTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'on-time':
      case 'landed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Flight Records</h2>
          <Button disabled className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            Add Flight
          </Button>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Flight Records</h2>
          <Button onClick={() => setShowAddModal(true)} className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Flight</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {flights.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Plane className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No flights recorded</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Keep track of all your flights for easy reference and travel history.
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Record Your First Flight
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {flights.map((flight) => (
              <Card key={flight.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Flight Header */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {flight.flight_number}
                          </Badge>
                          {flight.status && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flight.status)}`}>
                              {flight.status}
                            </span>
                          )}
                        </div>
                        {flight.gate && (
                          <Badge variant="secondary" className="text-xs">
                            Gate {flight.gate}
                          </Badge>
                        )}
                      </div>

                      {/* Airline */}
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{flight.airline}</span>
                      </div>

                      {/* Route */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{flight.departure_airport}</div>
                            <div className="text-muted-foreground text-xs">
                              {formatTime(flight.departure_time)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center">
                          <div className="flex items-center text-muted-foreground">
                            <div className="h-px bg-border flex-1" />
                            <Plane className="h-4 w-4 mx-2" />
                            <div className="h-px bg-border flex-1" />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 sm:justify-end">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div className="sm:text-right">
                            <div className="font-medium">{flight.arrival_airport}</div>
                            <div className="text-muted-foreground text-xs">
                              {formatTime(flight.arrival_time)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(flight)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(flight.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddFlightModal
        open={showAddModal}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) setEditingFlight(null);
        }}
        editingFlight={editingFlight}
      />
    </>
  );
}