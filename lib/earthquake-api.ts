import { EarthquakeData, Earthquake, ProcessedEarthquake } from '@/types/earthquake';

const BMKG_API_URL = 'http://localhost:4000/api/v1/earthquake/felt';

export async function fetchEarthquakeData(): Promise<ProcessedEarthquake[]> {
  try {
    const response = await fetch(BMKG_API_URL, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: EarthquakeData = await response.json();
    
    // Check if the API response is successful
    if (!data.status) {
      throw new Error(data.message || 'API returned unsuccessful status');
    }
    
    return data.data.map((earthquake, index) => 
      processEarthquakeData(earthquake, index)
    );
  } catch (error) {
    console.error('Error fetching earthquake data:', error);
    throw new Error('Failed to fetch earthquake data from local API');
  }
}

function processEarthquakeData(earthquake: Earthquake, index: number): ProcessedEarthquake {
  const [lat, lng] = earthquake.Coordinates.split(',').map(coord => parseFloat(coord.trim()));
  
  // Parse magnitude, handling potential non-numeric values
  let magnitude = parseFloat(earthquake.Magnitude);
  if (isNaN(magnitude)) {
    magnitude = 0;
  }
  
  // Parse depth, extracting numeric value from string like "10 km"
  let depth = parseFloat(earthquake.Kedalaman.replace(/[^\d.]/g, ''));
  if (isNaN(depth)) {
    depth = 0;
  }

  // Create a proper Date object
  const dateTimeStr = `${earthquake.Tanggal} ${earthquake.Jam}`;
  const dateTime = parseIndonesianDateTime(earthquake.Tanggal, earthquake.Jam);

  return {
    id: `${earthquake.DateTime}-${index}`,
    date: earthquake.Tanggal,
    time: earthquake.Jam,
    dateTime,
    location: earthquake.Wilayah,
    magnitude,
    depth,
    latitude: lat,
    longitude: lng,
    felt: earthquake.Dirasakan,
    coordinates: earthquake.Coordinates,
  };
}

function parseIndonesianDateTime(dateStr: string, timeStr: string): Date {
  try {
    // Format: "12 Des 2023" and "10:30:45 WIB"
    const monthMap: { [key: string]: number } = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mei': 4, 'Jun': 5,
      'Jul': 6, 'Agu': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Des': 11
    };

    const [day, monthStr, year] = dateStr.split(' ');
    const month = monthMap[monthStr];
    const [time] = timeStr.split(' '); // Remove timezone part
    const [hours, minutes, seconds] = time.split(':').map(Number);

    return new Date(parseInt(year), month, parseInt(day), hours, minutes, seconds);
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date();
  }
}

export function getMagnitudeColor(magnitude: number): string {
  if (magnitude >= 7) return '#DC2626'; // Red for major earthquakes
  if (magnitude >= 6) return '#EA580C'; // Orange for strong earthquakes
  if (magnitude >= 5) return '#D97706'; // Amber for moderate earthquakes
  if (magnitude >= 4) return '#EAB308'; // Yellow for light earthquakes
  if (magnitude >= 3) return '#65A30D'; // Lime for minor earthquakes
  return '#16A34A'; // Green for micro earthquakes
}

export function getMagnitudeLabel(magnitude: number): string {
  if (magnitude >= 7) return 'Major';
  if (magnitude >= 6) return 'Strong';
  if (magnitude >= 5) return 'Moderate';
  if (magnitude >= 4) return 'Light';
  if (magnitude >= 3) return 'Minor';
  return 'Micro';
}