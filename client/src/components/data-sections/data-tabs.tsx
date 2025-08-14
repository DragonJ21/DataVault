import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { MapPin, Plane, Briefcase, GraduationCap, Home, User } from 'lucide-react';
import { TravelTab } from '../travel/travel-tab';
import { FlightsTab } from '../flights/flights-tab';
import { EmployersTab } from '../employers/employers-tab';
import { EducationTab } from '../education/education-tab';
import { AddressesTab } from '../addresses/addresses-tab';
import { PersonalTab } from '../personal/personal-tab';
import { UnifiedList } from '../mobile/unified-list';
import { useIsMobile } from '@/hooks/use-mobile';

export function DataTabs() {
  const isMobile = useIsMobile();
  
  const tabs = [
    { id: 'travel', label: 'Travel History', icon: MapPin, component: TravelTab },
    { id: 'flights', label: 'Flights', icon: Plane, component: FlightsTab },
    { id: 'employers', label: 'Employers', icon: Briefcase, component: EmployersTab },
    { id: 'education', label: 'Education', icon: GraduationCap, component: EducationTab },
    { id: 'addresses', label: 'Addresses', icon: Home, component: AddressesTab },
    { id: 'personal', label: 'Personal Info', icon: User, component: PersonalTab },
  ];

  // Mobile view with unified list
  if (isMobile) {
    return (
      <Card className="border-0 shadow-sm">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">All Data</h2>
          <UnifiedList />
        </div>
      </Card>
    );
  }

  // Desktop view with tabs
  return (
    <Card className="border-0 shadow-sm">
      <Tabs defaultValue="travel" className="w-full">
        <div className="border-b">
          <div className="container mx-auto px-0">
            <TabsList className="grid w-full grid-cols-6 bg-transparent h-auto p-0 gap-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex flex-col items-center gap-1 px-1 sm:px-2 lg:px-4 py-2 sm:py-3 text-xs font-medium data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent"
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate text-[10px] sm:text-xs lg:text-sm">{tab.label.split(' ')[0]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </div>

        <div className="p-4 lg:p-6">
          {tabs.map((tab) => {
            const Component = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id} className="mt-0 space-y-4">
                <Component />
              </TabsContent>
            );
          })}
        </div>
      </Tabs>
    </Card>
  );
}
