import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { AddAddressModal } from './add-address-modal';
import { api, invalidateQueries } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@shared/schema';

export function AddressesTab() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['/api/addresses'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/addresses/${id}`),
    onSuccess: () => {
      invalidateQueries(['/api/addresses']);
      toast({ title: 'Address deleted successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete address',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const filteredAddresses = addresses.filter((address: Address) =>
    address.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    address.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  if (isLoading) {
    return <div>Loading addresses...</div>;
  }

  return (
    <>
      {/* Search and Add Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by address, city, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      {/* Addresses Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Address</TableHead>
              <TableHead>City</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>From Date</TableHead>
              <TableHead>To Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAddresses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No addresses match your search' : 'No address history yet. Add your first address!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredAddresses.map((address: Address) => (
                <TableRow key={address.id}>
                  <TableCell className="font-medium">{address.address}</TableCell>
                  <TableCell>{address.city}</TableCell>
                  <TableCell>{address.state || 'N/A'}</TableCell>
                  <TableCell>{address.country}</TableCell>
                  <TableCell>{formatDate(address.from_date)}</TableCell>
                  <TableCell>{address.to_date ? formatDate(address.to_date) : 'Present'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(address)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(address.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
