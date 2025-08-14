import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Home, Calendar, MapPin, Trash2, Edit2 } from 'lucide-react';
import { AddAddressModal } from './add-address-modal';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@shared/schema';

export function AddressesTab() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: ['/api/addresses'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
      toast({ title: 'Address deleted successfully' });
    },
    onError: () => {
      toast({
        title: 'Error deleting address',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this address record?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatDateRange = (fromDate: string, toDate: string | null) => {
    const start = new Date(fromDate).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
    const end = toDate 
      ? new Date(toDate).toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        })
      : 'Present';
    return `${start} - ${end}`;
  };

  const formatAddress = (address: Address) => {
    const parts = [address.address, address.city];
    if (address.state) parts.push(address.state);
    parts.push(address.country);
    return parts.join(', ');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Address History</h2>
          <Button disabled className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            Add Address
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
          <h2 className="text-lg font-semibold">Address History</h2>
          <Button onClick={() => setShowAddModal(true)} className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Address</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {addresses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Home className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No address history</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Keep track of all the places you've lived.
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {addresses.map((address) => (
              <Card key={address.id} className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium text-foreground">{formatAddress(address)}</h3>
                        </div>
                      </div>
                      
                      <Badge variant="secondary" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDateRange(address.from_date, address.to_date)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(address)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(address.id)}
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

      <AddAddressModal
        open={showAddModal}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) setEditingAddress(null);
        }}
        editingAddress={editingAddress}
      />
    </>
  );
}