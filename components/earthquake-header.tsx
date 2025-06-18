import { Activity, Clock } from 'lucide-react';

interface EarthquakeHeaderProps {
  lastUpdated?: Date;
  isLoading?: boolean;
}

export function EarthquakeHeader({ lastUpdated, isLoading }: EarthquakeHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pemantauan Gempa Indonesia
              </h1>
              <p className="text-sm text-gray-600">
                Data aktivitas seismik real-time dari BMKG
              </p>
            </div>
          </div>
          
          {lastUpdated && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>
                Terakhir diperbarui: {lastUpdated.toLocaleTimeString('id-ID')}
              </span>
              {isLoading && (
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}