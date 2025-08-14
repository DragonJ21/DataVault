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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
