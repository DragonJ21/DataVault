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

  // Clean and format flight number
  const cleanFlightNumber = flightNumber.trim().toUpperCase();

  try {
    // Try different search parameters
    const searchQueries = [
      `flight_iata=${cleanFlightNumber}`,
      `flight_icao=${cleanFlightNumber}`,
      `flight_number=${cleanFlightNumber}`
    ];

    for (const query of searchQueries) {
      const response = await fetch(
        `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&${query}&limit=1`
      );

      if (!response.ok) {
        console.warn(`AviationStack API error: ${response.status} for query ${query}`);
        continue;
      }

      const data = await response.json();
      
      // Log the API response for debugging
      console.log(`AviationStack response for ${query}:`, JSON.stringify(data, null, 2));
      
      if (data.data && data.data.length > 0) {
        const flight = data.data[0];
        
        return {
          flight_number: flight.flight?.iata || flight.flight?.icao || cleanFlightNumber,
          airline: flight.airline?.name || 'Unknown Airline',
          departure_airport: flight.departure?.airport || flight.departure?.iata || 'Unknown',
          arrival_airport: flight.arrival?.airport || flight.arrival?.iata || 'Unknown',
          departure_time: flight.departure?.scheduled || undefined,
          arrival_time: flight.arrival?.scheduled || undefined,
          gate: flight.departure?.gate || undefined,
          status: flight.flight_status || 'Unknown'
        };
      }
    }

    // If no flight found, provide helpful sample data for common test flights
    console.log(`No flight data found for flight number: ${cleanFlightNumber}`);
    
    // Return sample data for demonstration purposes when using common test flight numbers
    const testFlights: Record<string, FlightData> = {
      'TEST123': {
        flight_number: 'TEST123',
        airline: 'Sample Airlines',
        departure_airport: 'JFK - John F. Kennedy International',
        arrival_airport: 'LAX - Los Angeles International',
        departure_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        arrival_time: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours from now
        gate: 'A12',
        status: 'Scheduled'
      },
      'DEMO456': {
        flight_number: 'DEMO456',
        airline: 'Demo Airways',
        departure_airport: 'ORD - Chicago O\'Hare International',
        arrival_airport: 'DFW - Dallas/Fort Worth International',
        departure_time: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
        arrival_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        gate: 'B5',
        status: 'On Time'
      }
    };

    if (testFlights[cleanFlightNumber]) {
      console.log(`Returning sample data for test flight: ${cleanFlightNumber}`);
      return testFlights[cleanFlightNumber];
    }
    
    return null;
    
  } catch (error) {
    console.error('Error fetching flight data:', error);
    return null;
  }
}
