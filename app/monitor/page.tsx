'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProcessedEarthquake } from '@/types/earthquake';
import { 
  fetchEarthquakeDataBySource, 
  DataSourceType, 
  DATA_SOURCE_OPTIONS,
  getEarthquakeStats 
} from '@/lib/earthquake-api';
import { notificationService } from '@/lib/notification-service';
import { EarthquakeHeader } from '@/components/earthquake-header';
import { EarthquakeMap } from '@/components/earthquake-map';
import { EarthquakeList } from '@/components/earthquake-list';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { AlertCircle, RefreshCw, ArrowLeft, ChevronDown, BarChart3, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function MonitorPage() {
  const [earthquakes, setEarthquakes] = useState<ProcessedEarthquake[]>([]);
  const [selectedEarthquake, setSelectedEarthquake] = useState<ProcessedEarthquake | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState<DataSourceType>('felt');

  const loadEarthquakeData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const data = await fetchEarthquakeDataBySource(dataSource);
      setEarthquakes(data);
      setLastUpdated(new Date());
      
      // Check for recent earthquakes and send notifications
      notificationService.checkForRecentEarthquakes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load earthquake data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dataSource]);

  // Initial load
  useEffect(() => {
    loadEarthquakeData();
  }, [loadEarthquakeData]);

  // Auto-refresh every 10 seconds for monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      loadEarthquakeData(true);
    }, 10 * 1000); // 10 seconds

    return () => clearInterval(interval);
  }, [loadEarthquakeData]);

  const handleManualRefresh = () => {
    loadEarthquakeData(true);
  };

  const handleDataSourceChange = (newDataSource: DataSourceType) => {
    setDataSource(newDataSource);
    setSelectedEarthquake(null); // Clear selection when changing data source
  };

  const stats = getEarthquakeStats(earthquakes);
  const currentDataOption = DATA_SOURCE_OPTIONS.find(option => option.value === dataSource);

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
          <div className="space-y-3">
            <Button onClick={() => loadEarthquakeData()} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Monitor Gempa Bumi</h1>
        </div>
      </div>

      {/* Header */}
      <EarthquakeHeader 
        lastUpdated={lastUpdated || undefined} 
        isLoading={refreshing}
      />

      {/* Controls */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Data Source Selector */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Sumber Data:</span>
              </div>
              <Select value={dataSource} onValueChange={handleDataSourceChange}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATA_SOURCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-gray-500">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stats and Refresh */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Info className="w-4 h-4" />
                <span>{stats.total} data</span>
                <span>•</span>
                <span>Update: 10 detik</span>
                <span>•</span>
                <span>WIB (GMT+7)</span>
              </div>
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

          {/* Current Data Info */}
          {currentDataOption && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-blue-900">{currentDataOption.label}</h3>
                    <Badge variant="secondary">{stats.total} data</Badge>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">{currentDataOption.description}</p>
                  {stats.total > 0 && (
                    <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600">
                      <span>Magnitudo tertinggi: M{stats.maxMagnitude.toFixed(1)}</span>
                      <span>•</span>
                      <span>Gempa signifikan (≥M5.0): {stats.significantCount}</span>
                      <span>•</span>
                      <span>24 jam terakhir: {stats.recentCount}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {earthquakes.length > 0 ? (
        <div className="flex h-[calc(100vh-280px)]">
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
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-gray-500" />
              </div>
              <CardTitle className="text-gray-900">Tidak Ada Data</CardTitle>
              <CardDescription>
                Tidak ada data gempa bumi untuk sumber "{currentDataOption?.label}" saat ini.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={handleManualRefresh} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Coba Lagi
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

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