import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Info } from 'lucide-react';
import { AddFlightModal } from './add-flight-modal';
import { api, invalidateQueries } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Flight } from '@shared/schema';

export function FlightsTab() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { data: flights = [], isLoading } = useQuery({
    queryKey: ['/api/flights'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/flights/${id}`),
    onSuccess: () => {
      invalidateQueries(['/api/flights']);
      toast({ title: 'Flight deleted successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete flight',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const filteredFlights = flights.filter((flight: Flight) =>
    flight.flight_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flight.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flight.departure_airport.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flight.arrival_airport.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (flight: Flight) => {
    setEditingFlight(flight);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this flight?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatTime = (timeString?: string | null) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case 'on time':
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
      case 'delayed':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return <div>Loading flights...</div>;
  }

  return (
    <>
      {/* Search and Add Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by flight number or airline..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Flight
        </Button>
      </div>

      {/* Flight Auto-fill Feature Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Info className="text-blue-500 mt-1 mr-3 h-5 w-5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100">Flight Auto-fill Integration</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Enter a flight number to automatically populate airline, airports, times, and status using AviationStack API.
            </p>
          </div>
        </div>
      </div>

      {/* Flights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredFlights.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No flights match your search' : 'No flights recorded yet. Add your first flight!'}
          </div>
        ) : (
          filteredFlights.map((flight: Flight) => (
            <div key={flight.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{flight.flight_number}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{flight.airline}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(flight.status)}`}>
                    {flight.status || 'Unknown'}
                  </span>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(flight)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(flight.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{flight.departure_airport}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{formatTime(flight.departure_time)}</p>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="w-8 h-px bg-gray-400 relative">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-400 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{flight.arrival_airport}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{formatTime(flight.arrival_time)}</p>
                </div>
              </div>
              {flight.gate && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Gate: {flight.gate}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <AddFlightModal
        open={showAddModal}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) setEditingFlight(null);
        }}
        editingFlight={editingFlight}
      />
    </>
  );
}
