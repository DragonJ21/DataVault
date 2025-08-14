import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, GraduationCap, Calendar, Building2, Trash2, Edit2 } from 'lucide-react';
import { AddEducationModal } from './add-education-modal';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Education } from '@shared/schema';

export function EducationTab() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: education = [], isLoading } = useQuery<Education[]>({
    queryKey: ['/api/education'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/education/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/education'] });
      toast({ title: 'Education record deleted successfully' });
    },
    onError: () => {
      toast({
        title: 'Error deleting education record',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (edu: Education) => {
    setEditingEducation(edu);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this education record?')) {
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
          <h2 className="text-lg font-semibold">Education Records</h2>
          <Button disabled className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Education Records</h2>
          <Button onClick={() => setShowAddModal(true)} className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Education</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {education.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No education records</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Track your educational background and achievements.
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Record
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {education.map((edu) => (
              <Card key={edu.id} className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="space-y-1">
                        <h3 className="font-medium text-foreground">{edu.degree}</h3>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{edu.institution}</span>
                        </div>
                      </div>
                      
                      <Badge variant="secondary" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDateRange(edu.start_date, edu.end_date)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(edu)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(edu.id)}
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