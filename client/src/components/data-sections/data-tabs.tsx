import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Plane, Briefcase, GraduationCap, Home, User } from 'lucide-react';
import { TravelTab } from '../travel/travel-tab';
import { FlightsTab } from '../flights/flights-tab';
import { EmployersTab } from '../employers/employers-tab';
import { EducationTab } from '../education/education-tab';
import { AddressesTab } from '../addresses/addresses-tab';
import { PersonalTab } from '../personal/personal-tab';

export function DataTabs() {
  const tabs = [
    { id: 'travel', label: 'Travel History', icon: MapPin, component: TravelTab },
    { id: 'flights', label: 'Flights', icon: Plane, component: FlightsTab },
    { id: 'employers', label: 'Employers', icon: Briefcase, component: EmployersTab },
    { id: 'education', label: 'Education', icon: GraduationCap, component: EducationTab },
    { id: 'addresses', label: 'Addresses', icon: Home, component: AddressesTab },
    { id: 'personal', label: 'Personal Info', icon: User, component: PersonalTab },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <Tabs defaultValue="travel" className="w-full">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 bg-transparent">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <div className="p-6">
          {tabs.map((tab) => {
            const Component = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                <Component />
              </TabsContent>
            );
          })}
        </div>
      </Tabs>
    </div>
  );
}
