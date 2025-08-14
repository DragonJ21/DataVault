import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Calendar, FileText, Trash2, Edit2 } from 'lucide-react';
import { AddTravelModal } from './add-travel-modal';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { TravelHistory } from '@shared/schema';

export function TravelTab() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TravelHistory | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: travelHistory = [], isLoading } = useQuery<TravelHistory[]>({
    queryKey: ['/api/travel-history'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/travel-history/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/travel-history'] });
      toast({ title: 'Entry deleted successfully' });
    },
    onError: () => {
      toast({
        title: 'Error deleting entry',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (entry: TravelHistory) => {
    setEditingEntry(entry);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this travel entry?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Travel History</h2>
          <Button disabled className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            Add Trip
          </Button>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Travel History</h2>
          <Button onClick={() => setShowAddModal(true)} className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Trip</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {travelHistory.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No travel history yet</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Start tracking your travels by adding your first trip.
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Trip
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {travelHistory.map((entry) => (
              <Card key={entry.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-foreground">{entry.destination}</h3>
                        <Badge variant="secondary" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(entry.date).toLocaleDateString()}
                        </Badge>
                      </div>
                      
                      {entry.notes && (
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">{entry.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(entry)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
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

      <AddTravelModal
        open={showAddModal}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) setEditingEntry(null);
        }}
        editingEntry={editingEntry}
      />
    </>
  );
}