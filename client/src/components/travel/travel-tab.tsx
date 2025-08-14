import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { AddTravelModal } from './add-travel-modal';
import { api, invalidateQueries } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { TravelHistory } from '@shared/schema';

export function TravelTab() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TravelHistory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const { toast } = useToast();

  const { data: travelHistory = [], isLoading } = useQuery({
    queryKey: ['/api/travel-history'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/travel-history/${id}`),
    onSuccess: () => {
      invalidateQueries(['/api/travel-history']);
      toast({ title: 'Travel entry deleted successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete travel entry',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const filteredHistory = travelHistory.filter((entry: TravelHistory) => {
    const matchesSearch = entry.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.notes && entry.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const entryYear = new Date(entry.date).getFullYear().toString();
    const matchesYear = filterYear === 'all' || entryYear === filterYear;
    
    return matchesSearch && matchesYear;
  });

  const years = Array.from(new Set(travelHistory.map((entry: TravelHistory) => 
    new Date(entry.date).getFullYear().toString()
  ))).sort((a, b) => parseInt(b) - parseInt(a));

  const handleEdit = (entry: TravelHistory) => {
    setEditingEntry(entry);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this travel entry?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <div>Loading travel history...</div>;
  }

  return (
    <>
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Trip
          </Button>
        </div>
      </div>

      {/* Travel History Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchTerm || filterYear !== 'all' ? 'No trips match your filters' : 'No travel history yet. Add your first trip!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredHistory.map((entry: TravelHistory) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>{entry.destination}</TableCell>
                  <TableCell className="max-w-xs truncate">{entry.notes || 'No notes'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
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

      {/* Pagination */}
      {filteredHistory.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing {filteredHistory.length} of {travelHistory.length} trips
          </p>
        </div>
      )}

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
