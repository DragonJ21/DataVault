interface FlightData {
  flight_number: string;
  airline: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time?: string;
  arrival_time?: string;
  gate?: string;
  status?: string;
}

export async function fetchFlightData(flightNumber: string): Promise<FlightData | null> {
  const apiKey = process.env.AVIATION_STACK_API_KEY || process.env.AVIATIONSTACK_API_KEY || '';
  
  if (!apiKey) {
    console.warn('AviationStack API key not found in environment variables');
    return null;
  }

  try {
    const response = await fetch(
      `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightNumber}&limit=1`
    );

    if (!response.ok) {
      throw new Error(`AviationStack API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return null;
    }

    const flight = data.data[0];
    
    return {
      flight_number: flight.flight?.iata || flightNumber,
      airline: flight.airline?.name || 'Unknown Airline',
      departure_airport: flight.departure?.airport || 'Unknown',
      arrival_airport: flight.arrival?.airport || 'Unknown',
      departure_time: flight.departure?.scheduled || undefined,
      arrival_time: flight.arrival?.scheduled || undefined,
      gate: flight.departure?.gate || undefined,
      status: flight.flight_status || 'Unknown'
    };
  } catch (error) {
    console.error('Error fetching flight data:', error);
    return null;
  }
}
