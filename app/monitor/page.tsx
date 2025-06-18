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
import { AlertCircle, RefreshCw, ArrowLeft, ChevronDown, BarChart3, Info, Loader2, Clock, Bell } from 'lucide-react';
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

// Refresh interval options
const REFRESH_INTERVALS = [
  { value: 0, label: 'Tidak Otomatis', description: 'Refresh manual saja' },
  { value: 10, label: '10 Detik', description: 'Pembaruan sangat cepat' },
  { value: 30, label: '30 Detik', description: 'Pembaruan cepat' },
  { value: 60, label: '1 Menit', description: 'Pembaruan standar' },
  { value: 300, label: '5 Menit', description: 'Pembaruan hemat' },
];

export default function MonitorPage() {
  const [earthquakes, setEarthquakes] = useState<ProcessedEarthquake[]>([]);
  const [selectedEarthquake, setSelectedEarthquake] = useState<ProcessedEarthquake | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState<DataSourceType>('felt');
  const [refreshInterval, setRefreshInterval] = useState<number>(60); // Default 10 seconds
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const loadEarthquakeData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        // Only set dataLoading if auto-refresh is enabled
        if (refreshInterval > 0) {
          setDataLoading(true);
        }
      } else {
        setLoading(true);
        setDataLoading(true);
      }
      setError(null);
      
      // Only set map loading if we're actually loading data
      if (!isRefresh || refreshInterval > 0) {
        setMapLoading(true);
      }
      
      const data = await fetchEarthquakeDataBySource(dataSource);
      setEarthquakes(data);
      setLastUpdated(new Date());
      
      // Check for recent earthquakes and send notifications
      notificationService.checkForRecentEarthquakes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data gempa bumi');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setDataLoading(false);
    }
  }, [dataSource, refreshInterval]);

  // Initial load
  useEffect(() => {
    loadEarthquakeData();
  }, [loadEarthquakeData]);

  // Auto-refresh with configurable interval
  useEffect(() => {
    // Clear existing interval
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    // Set new interval if not disabled
    if (refreshInterval > 0) {
      const newIntervalId = setInterval(() => {
        loadEarthquakeData(true);
      }, refreshInterval * 1000);
      setIntervalId(newIntervalId);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [refreshInterval, loadEarthquakeData]);

  const handleManualRefresh = () => {
    loadEarthquakeData(true);
  };

  const handleDataSourceChange = (newDataSource: DataSourceType) => {
    setDataSource(newDataSource);
    setSelectedEarthquake(null);
  };

  const handleRefreshIntervalChange = (newInterval: string) => {
    const interval = parseInt(newInterval);
    setRefreshInterval(interval);
    
    // If switching to manual mode, clear any loading states
    if (interval === 0) {
      setDataLoading(false);
      setRefreshing(false);
    }
  };

  const handleMapLoadingComplete = () => {
    setMapLoading(false);
  };

  // Enhanced earthquake selection handler
  const handleEarthquakeSelect = (earthquake: ProcessedEarthquake) => {
    setSelectedEarthquake(earthquake);
  };

  // Test notification function
  const handleTestNotification = async () => {
    try {
      const hasPermission = await notificationService.requestPermission();
      if (hasPermission) {
        // Create a test earthquake notification
        new Notification('🧪 Tes Notifikasi Bhukampa', {
          body: '✅ Sistem notifikasi berfungsi dengan baik!\n📱 Anda akan menerima peringatan untuk gempa M4.0+ dalam 10 menit terakhir',
          icon: '/favicon.ico',
          tag: 'test-notification',
        });
      } else {
        alert('Izin notifikasi belum diberikan. Silakan aktifkan notifikasi di pengaturan browser.');
      }
    } catch (error) {
      console.error('Error testing notification:', error);
      alert('Gagal mengirim notifikasi tes. Pastikan browser mendukung notifikasi.');
    }
  };

  const stats = getEarthquakeStats(earthquakes);
  const currentDataOption = DATA_SOURCE_OPTIONS.find(option => option.value === dataSource);
  const currentRefreshOption = REFRESH_INTERVALS.find(option => option.value === refreshInterval);

  // Show error page only for initial load failures
  if (loading && error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-red-200 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Tidak Dapat Memuat Data Gempa
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <div className="space-y-3">
            <Button onClick={() => loadEarthquakeData()} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Coba Lagi
            </Button>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation - Always visible, no loading */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Pemantauan Gempa Bumi</h1>
        </div>
      </div>

      {/* Header - Always visible, no loading */}
      <EarthquakeHeader 
        lastUpdated={lastUpdated || undefined} 
        isLoading={refreshing && refreshInterval > 0}
      />

      {/* Controls - Always visible, no loading */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-4">
            {/* First row - Data Source and Refresh Interval */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Data Source Selector */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Sumber Data:</span>
                </div>
                <Select value={dataSource} onValueChange={handleDataSourceChange} disabled={dataLoading && refreshInterval > 0}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Pilih sumber data" />
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

              {/* Refresh Interval Selector */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Pembaruan Otomatis:</span>
                </div>
                <Select value={refreshInterval.toString()} onValueChange={handleRefreshIntervalChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Pilih interval" />
                  </SelectTrigger>
                  <SelectContent>
                    {REFRESH_INTERVALS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-gray-500">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Second row - Stats, Test Notification, and Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Stats */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Info className="w-4 h-4" />
                {dataLoading && refreshInterval > 0 ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memuat data...</span>
                  </div>
                ) : (
                  <>
                    <span>{stats.total} data</span>
                    <span>•</span>
                    <span>Pembaruan: {currentRefreshOption?.label || 'Manual'}</span>
                    <span>•</span>
                    <span>WIB (GMT+7)</span>
                  </>
                )}
              </div>

              {/* Test Notification and Refresh buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestNotification}
                  className="flex items-center space-x-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Tes Notifikasi</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={refreshing || (dataLoading && refreshInterval > 0)}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Perbarui</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Current Data Info
          {currentDataOption && !loading && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-blue-900">{currentDataOption.label}</h3>
                    {dataLoading && refreshInterval > 0 ? (
                      <div className="flex items-center space-x-1">
                        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                        <span className="text-xs text-blue-600">Memuat...</span>
                      </div>
                    ) : (
                      <Badge variant="secondary">{stats.total} data</Badge>
                    )}
                  </div>
                  <p className="text-sm text-blue-700 mt-1">{currentDataOption.description}</p>
                  {stats.total > 0 && !(dataLoading && refreshInterval > 0) && (
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
          )} */}
        </div>
      </div>

      {/* Main Content - Show loading states here */}
      {loading ? (
        <div className="flex h-[calc(100vh-320px)]">
          <div className="w-full lg:w-1/3 border-r border-gray-200 p-4">
            <LoadingSkeleton />
          </div>
          <div className="hidden lg:block lg:w-2/3 p-4">
            <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-500" />
                <p className="text-gray-500">Memuat peta...</p>
              </div>
            </div>
          </div>
        </div>
      ) : earthquakes.length > 0 ? (
        <div className="flex h-[calc(100vh-320px)]">
          {/* Earthquake List - Left Panel */}
          <div className="w-full lg:w-1/3 border-r border-gray-200 relative">
            {dataLoading && refreshInterval > 0 && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600">Memperbarui data...</p>
                </div>
              </div>
            )}
            <EarthquakeList
              earthquakes={earthquakes}
              selectedEarthquake={selectedEarthquake}
              onEarthquakeSelect={handleEarthquakeSelect}
            />
          </div>

          {/* Map - Right Panel */}
          <div className="hidden lg:block lg:w-2/3 relative">
            {mapLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-gray-600">Memuat penanda gempa...</p>
                  <p className="text-sm text-gray-500 mt-1">Menampilkan {earthquakes.length} gempa</p>
                </div>
              </div>
            )}
            <EarthquakeMap
              earthquakes={earthquakes}
              selectedEarthquake={selectedEarthquake}
              onEarthquakeSelect={setSelectedEarthquake}
              onLoadingComplete={handleMapLoadingComplete}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          {dataLoading && refreshInterval > 0 ? (
            <Card className="max-w-md w-full">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 mb-2">Memuat Data</h3>
                  <p className="text-gray-600">Mengambil data gempa dari {currentDataOption?.label}...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
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
                <Button onClick={handleManualRefresh} disabled={refreshing || (dataLoading && refreshInterval > 0)}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Coba Lagi
                </Button>
              </CardContent>
            </Card>
          )}
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
                Tutup
              </Button>
            </div>
            <div className="flex-1 relative">
              {mapLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-gray-600">Memuat peta...</p>
                  </div>
                </div>
              )}
              <EarthquakeMap
                earthquakes={earthquakes}
                selectedEarthquake={selectedEarthquake}
                onEarthquakeSelect={setSelectedEarthquake}
                onLoadingComplete={handleMapLoadingComplete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 