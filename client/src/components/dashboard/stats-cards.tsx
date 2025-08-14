import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Plane, Globe, Briefcase } from 'lucide-react';

export function StatsCards() {
  const { data: travelHistory = [] } = useQuery({
    queryKey: ['/api/travel-history'],
  });

  const { data: flights = [] } = useQuery({
    queryKey: ['/api/flights'],
  });

  const { data: employers = [] } = useQuery({
    queryKey: ['/api/employers'],
  });

  // Calculate unique countries from travel history
  const uniqueCountries = new Set(
    travelHistory.map((trip: any) => {
      const destination = trip.destination || '';
      const parts = destination.split(',');
      return parts[parts.length - 1]?.trim() || '';
    }).filter(Boolean)
  ).size;

  const stats = [
    {
      title: 'Total Trips',
      value: travelHistory.length,
      icon: MapPin,
      color: 'blue'
    },
    {
      title: 'Flights Taken',
      value: flights.length,
      icon: Plane,
      color: 'green'
    },
    {
      title: 'Countries Visited',
      value: uniqueCountries,
      icon: Globe,
      color: 'purple'
    },
    {
      title: 'Career Changes',
      value: employers.length,
      icon: Briefcase,
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
      green: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
      purple: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs lg:text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-xl lg:text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-2 lg:p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="h-4 w-4 lg:h-6 lg:w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
