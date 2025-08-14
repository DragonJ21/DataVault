import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, User, Calendar, IdCard, Edit2 } from 'lucide-react';
import { AddPersonalModal } from './add-personal-modal';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { PersonalInfo } from '@shared/schema';

export function PersonalTab() {
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: personalInfo, isLoading } = useQuery<PersonalInfo>({
    queryKey: ['/api/personal-info'],
  });

  const handleEdit = () => {
    setShowAddModal(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <Button disabled className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            Edit Info
          </Button>
        </div>
        <div className="h-48 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <Button onClick={() => setShowAddModal(true)} className="h-9">
            <Edit2 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Edit Info</span>
            <span className="sm:hidden">Edit</span>
          </Button>
        </div>

        {!personalInfo ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No personal information</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Add your basic personal details for complete records.
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Personal Info
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {personalInfo.full_name && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-foreground">{personalInfo.full_name}</p>
                </div>
              )}

              {personalInfo.dob && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-foreground">{formatDate(personalInfo.dob)}</p>
                  </div>
                </div>
              )}

              {personalInfo.passport_number && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Passport Number</label>
                  <div className="flex items-center gap-2">
                    <IdCard className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="font-mono">
                      {personalInfo.passport_number}
                    </Badge>
                  </div>
                </div>
              )}

              {!personalInfo.full_name && !personalInfo.dob && !personalInfo.passport_number && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    No personal details added yet. Click "Edit Info" to add your information.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <AddPersonalModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        personalInfo={personalInfo}
      />
    </>
  );
}