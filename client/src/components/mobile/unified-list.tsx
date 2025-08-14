import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Plane, 
  Briefcase, 
  GraduationCap, 
  Home, 
  User, 
  Calendar,
  Plus,
  Clock,
  Building2,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { TravelHistory, Flight, Employer, Education, Address, PersonalInfo } from '@shared/schema';

interface UnifiedItem {
  id: string;
  type: 'travel' | 'flight' | 'employer' | 'education' | 'address' | 'personal';
  title: string;
  subtitle: string;
  date?: string;
  badge?: string;
  badgeColor?: string;
  icon: any;
  data: any;
}

export function UnifiedList() {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch all data
  const { data: travelHistory = [] } = useQuery<TravelHistory[]>({
    queryKey: ['/api/travel-history'],
  });

  const { data: flights = [] } = useQuery<Flight[]>({
    queryKey: ['/api/flights'],
  });

  const { data: employers = [] } = useQuery<Employer[]>({
    queryKey: ['/api/employers'],
  });

  const { data: education = [] } = useQuery<Education[]>({
    queryKey: ['/api/education'],
  });

  const { data: addresses = [] } = useQuery<Address[]>({
    queryKey: ['/api/addresses'],
  });

  const { data: personalInfo } = useQuery<PersonalInfo>({
    queryKey: ['/api/personal-info'],
  });

  // Transform data into unified format
  const unifiedItems: UnifiedItem[] = [
    // Travel History
    ...travelHistory.map(item => ({
      id: item.id,
      type: 'travel' as const,
      title: item.destination,
      subtitle: item.notes || 'No notes',
      date: new Date(item.date).toLocaleDateString(),
      icon: MapPin,
      data: item
    })),

    // Flights
    ...flights.map(item => ({
      id: item.id,
      type: 'flight' as const,
      title: `${item.flight_number} - ${item.airline}`,
      subtitle: `${item.departure_airport} → ${item.arrival_airport}`,
      date: item.departure_time ? new Date(item.departure_time).toLocaleDateString() : undefined,
      badge: item.status || 'Scheduled',
      badgeColor: getFlightStatusColor(item.status),
      icon: Plane,
      data: item
    })),

    // Employers
    ...employers.map(item => ({
      id: item.id,
      type: 'employer' as const,
      title: item.company_name,
      subtitle: item.role,
      date: `${new Date(item.start_date).toLocaleDateString()} - ${item.end_date ? new Date(item.end_date).toLocaleDateString() : 'Present'}`,
      icon: Briefcase,
      data: item
    })),

    // Education
    ...education.map(item => ({
      id: item.id,
      type: 'education' as const,
      title: item.institution,
      subtitle: item.degree,
      date: `${new Date(item.start_date).toLocaleDateString()} - ${item.end_date ? new Date(item.end_date).toLocaleDateString() : 'Present'}`,
      icon: GraduationCap,
      data: item
    })),

    // Addresses
    ...addresses.map(item => ({
      id: item.id,
      type: 'address' as const,
      title: `${item.city}, ${item.country}`,
      subtitle: item.address,
      date: `${new Date(item.from_date).toLocaleDateString()} - ${item.to_date ? new Date(item.to_date).toLocaleDateString() : 'Present'}`,
      icon: Home,
      data: item
    })),

    // Personal Info
    ...(personalInfo ? [{
      id: personalInfo.id,
      type: 'personal' as const,
      title: personalInfo.full_name || 'Personal Information',
      subtitle: personalInfo.passport_number ? `Passport: ${personalInfo.passport_number}` : 'No passport number',
      date: personalInfo.dob ? `Born: ${new Date(personalInfo.dob).toLocaleDateString()}` : undefined,
      icon: User,
      data: personalInfo
    }] : [])
  ];

  // Sort by most recent first (if date available)
  const sortedItems = unifiedItems.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Filter and search items
  const filteredItems = sortedItems
    .filter(item => filter === 'all' || item.type === filter)
    .filter(item => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
      );
    });

  const filters = [
    { value: 'all', label: 'All', icon: FileText },
    { value: 'travel', label: 'Travel', icon: MapPin },
    { value: 'flight', label: 'Flights', icon: Plane },
    { value: 'employer', label: 'Work', icon: Briefcase },
    { value: 'education', label: 'Education', icon: GraduationCap },
    { value: 'address', label: 'Address', icon: Home },
    { value: 'personal', label: 'Personal', icon: User },
  ];

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search your data..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {filters.map((filterOption) => {
          const Icon = filterOption.icon;
          const count = filterOption.value === 'all' 
            ? unifiedItems.length 
            : unifiedItems.filter(item => item.type === filterOption.value).length;
          
          return (
            <Button
              key={filterOption.value}
              variant={filter === filterOption.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterOption.value)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Icon className="h-4 w-4" />
              <span>{filterOption.label}</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Unified list */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No data found</h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'all' 
                  ? "You haven't added any data yet. Start by adding your first entry." 
                  : `No ${filter} entries found. Add your first ${filter} entry to get started.`}
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={`${item.type}-${item.id}`} className="transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-foreground truncate">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 overflow-hidden">
                            <span className="block truncate">
                              {item.subtitle}
                            </span>
                          </p>
                          {item.date && (
                            <div className="flex items-center gap-1 mt-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{item.date}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 ml-2">
                          {item.badge && (
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${item.badgeColor || ''}`}
                            >
                              {item.badge}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs capitalize">
                            {item.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

function getFlightStatusColor(status: string | null) {
  switch (status?.toLowerCase()) {
    case 'on-time':
    case 'landed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'delayed':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}