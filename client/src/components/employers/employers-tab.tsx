import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { AddEmployerModal } from './add-employer-modal';
import { api, invalidateQueries } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Employer } from '@shared/schema';

export function EmployersTab() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState<Employer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { data: employers = [], isLoading } = useQuery({
    queryKey: ['/api/employers'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/employers/${id}`),
    onSuccess: () => {
      invalidateQueries(['/api/employers']);
      toast({ title: 'Employer deleted successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete employer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const filteredEmployers = employers.filter((employer: Employer) =>
    employer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employer.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (employer: Employer) => {
    setEditingEmployer(employer);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employer?')) {
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
    return <div>Loading employers...</div>;
  }

  return (
    <>
      {/* Search and Add Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by company or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Employer
        </Button>
      </div>

      {/* Employers Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No employers match your search' : 'No employment history yet. Add your first employer!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployers.map((employer: Employer) => (
                <TableRow key={employer.id}>
                  <TableCell className="font-medium">{employer.company_name}</TableCell>
                  <TableCell>{employer.role}</TableCell>
                  <TableCell>{formatDate(employer.start_date)}</TableCell>
                  <TableCell>{employer.end_date ? formatDate(employer.end_date) : 'Present'}</TableCell>
                  <TableCell className="max-w-xs truncate">{employer.notes || 'No notes'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(employer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(employer.id)}
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

      <AddEmployerModal
        open={showAddModal}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) setEditingEmployer(null);
        }}
        editingEmployer={editingEmployer}
      />
    </>
  );
}
