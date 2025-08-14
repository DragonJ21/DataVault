import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Briefcase, Calendar, FileText, Trash2, Edit2, Building2 } from 'lucide-react';
import { AddEmployerModal } from './add-employer-modal';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Employer } from '@shared/schema';

export function EmployersTab() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState<Employer | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: employers = [], isLoading } = useQuery<Employer[]>({
    queryKey: ['/api/employers'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/employers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employers'] });
      toast({ title: 'Employer deleted successfully' });
    },
    onError: () => {
      toast({
        title: 'Error deleting employer',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (employer: Employer) => {
    setEditingEmployer(employer);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employer record?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatDateRange = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
    const end = endDate 
      ? new Date(endDate).toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        })
      : 'Present';
    return `${start} - ${end}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Employment History</h2>
          <Button disabled className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            Add Job
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
          <h2 className="text-lg font-semibold">Employment History</h2>
          <Button onClick={() => setShowAddModal(true)} className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Job</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {employers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No employment history</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Keep track of your career journey by adding your work experience.
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {employers.map((employer) => (
              <Card key={employer.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="space-y-1">
                        <h3 className="font-medium text-foreground">{employer.role}</h3>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{employer.company_name}</span>
                        </div>
                      </div>
                      
                      <Badge variant="secondary" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDateRange(employer.start_date, employer.end_date)}
                      </Badge>
                      
                      {employer.notes && (
                        <div className="flex items-start gap-2 mt-2">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">{employer.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(employer)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(employer.id)}
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