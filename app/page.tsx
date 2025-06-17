'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProcessedEarthquake } from '@/types/earthquake';
import { fetchEarthquakeData } from '@/lib/earthquake-api';
import { EarthquakeHeader } from '@/components/earthquake-header';
import { EarthquakeMap } from '@/components/earthquake-map';
import { EarthquakeList } from '@/components/earthquake-list';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [earthquakes, setEarthquakes] = useState<ProcessedEarthquake[]>([]);
  const [selectedEarthquake, setSelectedEarthquake] = useState<ProcessedEarthquake | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadEarthquakeData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const data = await fetchEarthquakeData();
      setEarthquakes(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load earthquake data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadEarthquakeData();
  }, [loadEarthquakeData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadEarthquakeData(true);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [loadEarthquakeData]);

  const handleManualRefresh = () => {
    loadEarthquakeData(true);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-red-200 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to Load Earthquake Data
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <Button onClick={() => loadEarthquakeData()} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <EarthquakeHeader 
        lastUpdated={lastUpdated || undefined} 
        isLoading={refreshing}
      />

      {/* Manual Refresh Button */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Earthquake List - Left Panel */}
        <div className="w-full lg:w-1/3 border-r border-gray-200">
          <EarthquakeList
            earthquakes={earthquakes}
            selectedEarthquake={selectedEarthquake}
            onEarthquakeSelect={setSelectedEarthquake}
          />
        </div>

        {/* Map - Right Panel */}
        <div className="hidden lg:block lg:w-2/3">
          <EarthquakeMap
            earthquakes={earthquakes}
            selectedEarthquake={selectedEarthquake}
            onEarthquakeSelect={setSelectedEarthquake}
          />
        </div>
      </div>

      {/* Mobile Map Modal - Show when earthquake is selected on mobile */}
      {selectedEarthquake && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  M {selectedEarthquake.magnitude.toFixed(1)} - {selectedEarthquake.location}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedEarthquake.date} • {selectedEarthquake.time}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEarthquake(null)}
              >
                Close
              </Button>
            </div>
            <div className="flex-1">
              <EarthquakeMap
                earthquakes={earthquakes}
                selectedEarthquake={selectedEarthquake}
                onEarthquakeSelect={setSelectedEarthquake}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}