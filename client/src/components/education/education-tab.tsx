import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { AddEducationModal } from './add-education-modal';
import { api, invalidateQueries } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Education } from '@shared/schema';

export function EducationTab() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { data: education = [], isLoading } = useQuery({
    queryKey: ['/api/education'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/education/${id}`),
    onSuccess: () => {
      invalidateQueries(['/api/education']);
      toast({ title: 'Education record deleted successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete education record',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const filteredEducation = education.filter((edu: Education) =>
    edu.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
    edu.degree.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (edu: Education) => {
    setEditingEducation(edu);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this education record?')) {
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
    return <div>Loading education records...</div>;
  }

  return (
    <>
      {/* Search and Add Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by institution or degree..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </div>

      {/* Education Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Institution</TableHead>
              <TableHead>Degree</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEducation.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No education records match your search' : 'No education records yet. Add your first one!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredEducation.map((edu: Education) => (
                <TableRow key={edu.id}>
                  <TableCell className="font-medium">{edu.institution}</TableCell>
                  <TableCell>{edu.degree}</TableCell>
                  <TableCell>{formatDate(edu.start_date)}</TableCell>
                  <TableCell>{edu.end_date ? formatDate(edu.end_date) : 'In Progress'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(edu)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(edu.id)}
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

      <AddEducationModal
        open={showAddModal}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) setEditingEducation(null);
        }}
        editingEducation={editingEducation}
      />
    </>
  );
}
