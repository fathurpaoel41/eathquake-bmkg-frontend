export interface EarthquakeData {
  status: boolean;
  message: string;
  data: Earthquake[];
}

export interface Earthquake {
  Tanggal: string;
  Jam: string;
  DateTime: string;
  Coordinates: string;
  Lintang: string;
  Bujur: string;
  Magnitude: string;
  Kedalaman: string;
  Wilayah: string;
  Dirasakan?: string;
  Potensi?: string;
  Shakemap?: string;
}

export interface ProcessedEarthquake {
  id: string;
  date: string;
  time: string;
  dateTime: Date;
  location: string;
  magnitude: number;
  depth: number;
  latitude: number;
  longitude: number;
  felt: string;
  coordinates: string;
  potential?: string;
  shakemap?: string;
}

// New interfaces for different API response structures
export interface LatestEarthquakeResponse {
  status: boolean;
  message: string;
  data: Earthquake;
}

export interface Latest15EarthquakeResponse {
  status: boolean;
  message: string;
  data: Earthquake[];
}

export interface FeltEarthquakeResponse {
  status: boolean;
  message: string;
  data: Earthquake[];
}

export interface AllEarthquakeResponse {
  status: boolean;
  message: string;
  data: {
    latest: Earthquake;
    latest15: Earthquake[];
    felt: Earthquake[];
  };
}

export type SortField = 'date' | 'magnitude' | 'depth' | 'location';
export type SortOrder = 'asc' | 'desc';