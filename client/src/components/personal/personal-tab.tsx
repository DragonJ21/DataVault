import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import { AddPersonalModal } from './add-personal-modal';
import { api, invalidateQueries } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { PersonalInfo } from '@shared/schema';

export function PersonalTab() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInfo, setEditingInfo] = useState<PersonalInfo | null>(null);
  const { toast } = useToast();

  const { data: personalInfo, isLoading } = useQuery({
    queryKey: ['/api/personal-info'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/personal-info/${id}`),
    onSuccess: () => {
      invalidateQueries(['/api/personal-info']);
      toast({ title: 'Personal information deleted successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete personal information',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleEdit = () => {
    setEditingInfo(personalInfo);
    setShowAddModal(true);
  };

  const handleDelete = () => {
    if (personalInfo && confirm('Are you sure you want to delete your personal information?')) {
      deleteMutation.mutate(personalInfo.id);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <div>Loading personal information...</div>;
  }

  return (
    <>
      <div className="max-w-2xl">
        {!personalInfo ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Personal Information
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                Add your personal information to get started with your profile.
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Personal Information
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-bold">Personal Information</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Full Name
                  </label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {personalInfo.full_name || 'Not provided'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Passport Number
                  </label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {personalInfo.passport_number || 'Not provided'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Date of Birth
                  </label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {formatDate(personalInfo.dob)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AddPersonalModal
        open={showAddModal}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) setEditingInfo(null);
        }}
        editingInfo={editingInfo}
      />
    </>
  );
}
