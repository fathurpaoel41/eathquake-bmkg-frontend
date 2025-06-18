import { EarthquakeData, Earthquake, ProcessedEarthquake } from '@/types/earthquake';

// API endpoints - try real BMKG first, then fallback to local
const BMKG_API_URLS = [
  'https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json', // Real BMKG API
  'http://localhost:4000/api/v1/earthquake/felt', // Local fallback
];

// New API endpoints for different data types
const LOCAL_API_ENDPOINTS = {
  latest: 'http://localhost:4000/api/v1/earthquake/latest',
  latest15: 'http://localhost:4000/api/v1/earthquake/latest-15',
  felt: 'http://localhost:4000/api/v1/earthquake/felt',
  all: 'http://localhost:4000/api/v1/earthquake/all',
};

export type DataSourceType = 'latest' | 'latest15' | 'felt' | 'all';

export interface DataSourceOption {
  value: DataSourceType;
  label: string;
  description: string;
}

export const DATA_SOURCE_OPTIONS: DataSourceOption[] = [
  {
    value: 'latest' as DataSourceType,
    label: 'Gempa Terbaru',
    description: 'Gempa bumi terbaru yang tercatat'
  },
  {
    value: 'latest-15' as DataSourceType,
    label: '15 Gempa Terbaru',
    description: '15 gempa bumi terbaru yang tercatat'
  },
  {
    value: 'felt' as DataSourceType,
    label: 'Gempa Dirasakan',
    description: 'Gempa bumi yang dirasakan masyarakat'
  },
  {
    value: 'all' as DataSourceType,
    label: 'Semua Data',
    description: 'Gabungan semua data gempa bumi'
  }
];

/**
 * Fetch earthquake data based on selected data source
 */
export async function fetchEarthquakeDataBySource(
  dataSource: DataSourceType = 'felt'
): Promise<ProcessedEarthquake[]> {
  try {
    console.log(`Fetching ${dataSource} earthquake data...`);
    
    const endpoint = LOCAL_API_ENDPOINTS[dataSource];
    const response = await fetch(endpoint, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
      headers: {
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} from ${endpoint}`);
    }

    const data = await response.json();
    
    if (!data.status) {
      throw new Error(data.message || 'API returned unsuccessful status');
    }

    return processDataBySource(data, dataSource);
  } catch (error) {
    console.error(`Failed to fetch ${dataSource} data:`, error);
    // Fallback to original API if specific endpoint fails
    if (dataSource === 'felt') {
      return fetchEarthquakeData(); // Use original fallback
    }
    throw error;
  }
}

/**
 * Process data based on source type
 */
function processDataBySource(data: any, dataSource: DataSourceType): ProcessedEarthquake[] {
  switch (dataSource) {
    case 'latest':
      return [processLocalEarthquake(data.data, 0)];
    
    case 'latest15':
      return data.data.map((earthquake: any, index: number) => 
        processLocalEarthquake(earthquake, index)
      );
    
    case 'felt':
      return data.data.map((earthquake: any, index: number) => 
        processLocalEarthquake(earthquake, index)
      );
    
    case 'all':
      const allEarthquakes: ProcessedEarthquake[] = [];
      
      // Add latest earthquake
      if (data.data.latest) {
        allEarthquakes.push(processLocalEarthquake(data.data.latest, 0));
      }
      
      // Add latest 15 earthquakes
      if (data.data.latest15 && Array.isArray(data.data.latest15)) {
        const latest15 = data.data.latest15.map((earthquake: any, index: number) => 
          processLocalEarthquake(earthquake, index + 1)
        );
        allEarthquakes.push(...latest15);
      }
      
      // Add felt earthquakes (avoid duplicates)
      if (data.data.felt && Array.isArray(data.data.felt)) {
        const existingIds = new Set(allEarthquakes.map(eq => eq.id));
        const felt = data.data.felt
          .map((earthquake: any, index: number) => 
            processLocalEarthquake(earthquake, index + allEarthquakes.length)
          )
          .filter((eq: ProcessedEarthquake) => !existingIds.has(eq.id));
        allEarthquakes.push(...felt);
      }
      
      return allEarthquakes;
    
    default:
      throw new Error(`Unknown data source: ${dataSource}`);
  }
}

/**
 * Original function for backward compatibility
 */
export async function fetchEarthquakeData(): Promise<ProcessedEarthquake[]> {
  let lastError: Error | null = null;

  // Try each API endpoint
  for (const apiUrl of BMKG_API_URLS) {
    try {
      console.log(`Trying to fetch from: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        next: { revalidate: 300 }, // Revalidate every 5 minutes
        headers: {
          'Cache-Control': 'no-cache',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} from ${apiUrl}`);
      }

      const data = await response.json();
      
      // Process data based on API source
      if (apiUrl.includes('bmkg.go.id')) {
        return processBMKGData(data);
      } else {
        return processLocalAPIData(data);
      }
    } catch (error) {
      console.error(`Failed to fetch from ${apiUrl}:`, error);
      lastError = error instanceof Error ? error : new Error(`Unknown error from ${apiUrl}`);
      continue;
    }
  }

  // If all APIs fail, throw the last error
  throw lastError || new Error('All earthquake data sources are unavailable');
}

/**
 * Process data from the real BMKG API
 */
function processBMKGData(data: any): ProcessedEarthquake[] {
  try {
    // BMKG API structure: { Infogempa: { gempa: [] } }
    const earthquakes = data.Infogempa?.gempa || [];
    
    if (!Array.isArray(earthquakes)) {
      throw new Error('Invalid BMKG API response structure');
    }

    return earthquakes.map((earthquake: any, index: number) => 
      processBMKGEarthquake(earthquake, index)
    );
  } catch (error) {
    console.error('Error processing BMKG data:', error);
    throw new Error('Failed to process BMKG earthquake data');
  }
}

/**
 * Process data from local API (existing format)
 */
function processLocalAPIData(data: EarthquakeData): ProcessedEarthquake[] {
  // Check if the API response is successful
  if (!data.status) {
    throw new Error(data.message || 'API returned unsuccessful status');
  }
  
  return data.data.map((earthquake, index) => 
    processLocalEarthquake(earthquake, index)
  );
}

/**
 * Process earthquake data from BMKG API format
 */
function processBMKGEarthquake(earthquake: any, index: number): ProcessedEarthquake {
  // BMKG format fields
  const {
    Tanggal,
    Jam,
    DateTime,
    Coordinates,
    Lintang,
    Bujur,
    Magnitude,
    Kedalaman,
    Wilayah,
    Dirasakan
  } = earthquake;

  const [lat, lng] = Coordinates.split(',').map((coord: string) => parseFloat(coord.trim()));
  
  // Parse magnitude
  let magnitude = parseFloat(Magnitude);
  if (isNaN(magnitude)) {
    magnitude = 0;
  }
  
  // Parse depth
  let depth = parseFloat(Kedalaman.replace(/[^\d.]/g, ''));
  if (isNaN(depth)) {
    depth = 0;
  }

  // Create proper Date object
  const dateTime = parseIndonesianDateTime(Tanggal, Jam);

  return {
    id: `bmkg-${DateTime}-${index}`,
    date: Tanggal,
    time: Jam,
    dateTime,
    location: Wilayah,
    magnitude,
    depth,
    latitude: lat,
    longitude: lng,
    felt: Dirasakan || 'Tidak dirasakan',
    coordinates: Coordinates,
  };
}

/**
 * Process earthquake data from local API format (existing)
 */
function processLocalEarthquake(earthquake: Earthquake, index: number): ProcessedEarthquake {
  const [lat, lng] = earthquake.Coordinates.split(',').map(coord => parseFloat(coord.trim()));
  
  // Parse magnitude
  let magnitude = parseFloat(earthquake.Magnitude);
  if (isNaN(magnitude)) {
    magnitude = 0;
  }
  
  // Parse depth
  let depth = parseFloat(earthquake.Kedalaman.replace(/[^\d.]/g, ''));
  if (isNaN(depth)) {
    depth = 0;
  }

  // Create proper Date object
  const dateTime = parseIndonesianDateTime(earthquake.Tanggal, earthquake.Jam);

  return {
    id: `local-${earthquake.DateTime}-${index}`,
    date: earthquake.Tanggal,
    time: earthquake.Jam,
    dateTime,
    location: earthquake.Wilayah,
    magnitude,
    depth,
    latitude: lat,
    longitude: lng,
    felt: earthquake.Dirasakan || 'Tidak dirasakan',
    coordinates: earthquake.Coordinates,
    potential: earthquake.Potensi,
    shakemap: earthquake.Shakemap,
  };
}

/**
 * Parse Indonesian date and time format to JavaScript Date
 * Supports various formats from BMKG
 */
function parseIndonesianDateTime(dateStr: string, timeStr: string): Date {
  try {
    // Format: "12 Des 2023" and "10:30:45 WIB"
    const monthMap: { [key: string]: number } = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mei': 4, 'Jun': 5,
      'Jul': 6, 'Agu': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Des': 11
    };

    // Parse date
    const dateParts = dateStr.trim().split(' ');
    if (dateParts.length !== 3) {
      throw new Error(`Invalid date format: ${dateStr}`);
    }

    const [day, monthStr, year] = dateParts;
    const month = monthMap[monthStr];
    
    if (month === undefined) {
      throw new Error(`Unknown month: ${monthStr}`);
    }

    // Parse time (remove timezone info)
    const timePart = timeStr.split(' ')[0]; // Remove WIB/WITA/WIT
    const timeParts = timePart.split(':');
    
    if (timeParts.length < 2) {
      throw new Error(`Invalid time format: ${timeStr}`);
    }

    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const seconds = timeParts[2] ? parseInt(timeParts[2]) : 0;

    // Create date in local timezone (will be interpreted as local time)
    const date = new Date(parseInt(year), month, parseInt(day), hours, minutes, seconds);
    
    // Validate the created date
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date/time: ${dateStr} ${timeStr}`);
    }

    return date;
  } catch (error) {
    console.error('Error parsing Indonesian date/time:', error, { dateStr, timeStr });
    // Return current date as fallback
    return new Date();
  }
}

/**
 * Get color based on earthquake magnitude
 */
export function getMagnitudeColor(magnitude: number): string {
  if (magnitude >= 7) return '#DC2626'; // Red for major earthquakes (7.0+)
  if (magnitude >= 6) return '#EA580C'; // Orange for strong earthquakes (6.0-6.9)
  if (magnitude >= 5) return '#D97706'; // Amber for moderate earthquakes (5.0-5.9)
  if (magnitude >= 4) return '#EAB308'; // Yellow for light earthquakes (4.0-4.9)
  if (magnitude >= 3) return '#65A30D'; // Lime for minor earthquakes (3.0-3.9)
  return '#16A34A'; // Green for micro earthquakes (< 3.0)
}

/**
 * Get magnitude label based on Richter scale
 */
export function getMagnitudeLabel(magnitude: number): string {
  if (magnitude < 2.0) return 'Sangat Kecil';
  if (magnitude < 3.0) return 'Kecil';
  if (magnitude < 4.0) return 'Ringan';
  if (magnitude < 5.0) return 'Sedang';
  if (magnitude < 6.0) return 'Kuat';
  if (magnitude < 7.0) return 'Besar';
  if (magnitude < 8.0) return 'Sangat Besar';
  return 'Dahsyat';
}

/**
 * Get earthquake intensity description in Indonesian
 */
export function getIntensityDescription(magnitude: number): string {
  if (magnitude >= 8) return 'Sangat Merusak';
  if (magnitude >= 7) return 'Merusak Berat';
  if (magnitude >= 6) return 'Merusak';
  if (magnitude >= 5) return 'Agak Kuat';
  if (magnitude >= 4) return 'Sedang';
  if (magnitude >= 3) return 'Lemah';
  return 'Sangat Lemah';
}

/**
 * Sort earthquakes by various criteria
 */
export function sortEarthquakes(
  earthquakes: ProcessedEarthquake[], 
  sortBy: 'date' | 'magnitude' | 'depth' | 'location' = 'date',
  order: 'asc' | 'desc' = 'desc'
): ProcessedEarthquake[] {
  return [...earthquakes].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = a.dateTime.getTime() - b.dateTime.getTime();
        break;
      case 'magnitude':
        comparison = a.magnitude - b.magnitude;
        break;
      case 'depth':
        comparison = a.depth - b.depth;
        break;
      case 'location':
        comparison = a.location.localeCompare(b.location, 'id');
        break;
    }
    
    return order === 'desc' ? -comparison : comparison;
  });
}

/**
 * Filter earthquakes by magnitude range
 */
export function filterEarthquakesByMagnitude(
  earthquakes: ProcessedEarthquake[],
  minMagnitude: number = 0,
  maxMagnitude: number = 10
): ProcessedEarthquake[] {
  return earthquakes.filter(eq => 
    eq.magnitude >= minMagnitude && eq.magnitude <= maxMagnitude
  );
}

/**
 * Get earthquake statistics
 */
export function getEarthquakeStats(earthquakes: ProcessedEarthquake[]) {
  if (earthquakes.length === 0) {
    return {
      total: 0,
      averageMagnitude: 0,
      maxMagnitude: 0,
      minMagnitude: 0,
      averageDepth: 0,
      significantCount: 0, // >= 5.0 magnitude
      recentCount: 0, // within last 24 hours
    };
  }

  const magnitudes = earthquakes.map(eq => eq.magnitude);
  const depths = earthquakes.map(eq => eq.depth);
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return {
    total: earthquakes.length,
    averageMagnitude: magnitudes.reduce((sum, mag) => sum + mag, 0) / magnitudes.length,
    maxMagnitude: Math.max(...magnitudes),
    minMagnitude: Math.min(...magnitudes),
    averageDepth: depths.reduce((sum, depth) => sum + depth, 0) / depths.length,
    significantCount: earthquakes.filter(eq => eq.magnitude >= 5.0).length,
    recentCount: earthquakes.filter(eq => eq.dateTime >= oneDayAgo).length,
  };
}