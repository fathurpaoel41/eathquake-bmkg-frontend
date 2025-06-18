'use client';

import { useState, useMemo } from 'react';
import { ProcessedEarthquake, SortField, SortOrder } from '@/types/earthquake';
import { getMagnitudeColor, getMagnitudeLabel } from '@/lib/earthquake-api';
import { ArrowUpDown, ArrowUp, ArrowDown, MapPin, Clock, Gauge, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EarthquakeListProps {
  earthquakes: ProcessedEarthquake[];
  selectedEarthquake?: ProcessedEarthquake | null;
  onEarthquakeSelect?: (earthquake: ProcessedEarthquake) => void;
}

export function EarthquakeList({ 
  earthquakes, 
  selectedEarthquake, 
  onEarthquakeSelect 
}: EarthquakeListProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [magnitudeFilter, setMagnitudeFilter] = useState<'all' | '3+' | '4+' | '5+' | '6+'>('all');

  const sortedAndFilteredEarthquakes = useMemo(() => {
    let filtered = earthquakes.filter(earthquake => {
      const matchesSearch = earthquake.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMagnitude = 
        magnitudeFilter === 'all' ||
        (magnitudeFilter === '3+' && earthquake.magnitude >= 3) ||
        (magnitudeFilter === '4+' && earthquake.magnitude >= 4) ||
        (magnitudeFilter === '5+' && earthquake.magnitude >= 5) ||
        (magnitudeFilter === '6+' && earthquake.magnitude >= 6);
      
      return matchesSearch && matchesMagnitude;
    });

    return filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'date') {
        aValue = a.dateTime.getTime();
        bValue = b.dateTime.getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [earthquakes, sortField, sortOrder, searchTerm, magnitudeFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header and Filters */}
      <div className="p-4 border-b border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Gempa Bumi Terbaru ({sortedAndFilteredEarthquakes.length})
          </h2>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="space-y-3">
          <Input
            placeholder="Cari berdasarkan lokasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          
          <Select value={magnitudeFilter} onValueChange={(value: any) => setMagnitudeFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter berdasarkan magnitudo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Magnitudo</SelectItem>
              <SelectItem value="3+">3.0+ (Kecil ke atas)</SelectItem>
              <SelectItem value="4+">4.0+ (Ringan ke atas)</SelectItem>
              <SelectItem value="5+">5.0+ (Sedang ke atas)</SelectItem>
              <SelectItem value="6+">6.0+ (Kuat ke atas)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={sortField === 'date' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('date')}
            className="flex items-center space-x-1"
          >
            <Clock className="w-3 h-3" />
            <span>Tanggal</span>
            {getSortIcon('date')}
          </Button>
          
          <Button
            variant={sortField === 'magnitude' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('magnitude')}
            className="flex items-center space-x-1"
          >
            <Gauge className="w-3 h-3" />
            <span>Magnitudo</span>
            {getSortIcon('magnitude')}
          </Button>
          
          <Button
            variant={sortField === 'depth' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('depth')}
            className="flex items-center space-x-1"
          >
            <Layers className="w-3 h-3" />
            <span>Kedalaman</span>
            {getSortIcon('depth')}
          </Button>
          
          <Button
            variant={sortField === 'location' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('location')}
            className="flex items-center space-x-1"
          >
            <MapPin className="w-3 h-3" />
            <span>Lokasi</span>
            {getSortIcon('location')}
          </Button>
        </div>
      </div>

      {/* Earthquake List */}
      <div className="flex-1 overflow-y-auto">
        {sortedAndFilteredEarthquakes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Tidak ada gempa bumi yang sesuai dengan kriteria pencarian.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedAndFilteredEarthquakes.map((earthquake) => (
              <div
                key={earthquake.id}
                className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedEarthquake?.id === earthquake.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                }`}
                onClick={() => onEarthquakeSelect?.(earthquake)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getMagnitudeColor(earthquake.magnitude) }}
                        title={`Gempa ${getMagnitudeLabel(earthquake.magnitude)}`}
                      />
                      <span className="font-semibold text-gray-900 text-sm">
                        M {earthquake.magnitude.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {getMagnitudeLabel(earthquake.magnitude)}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 mb-1 text-sm leading-tight">
                      {earthquake.location}
                    </h3>
                    
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center space-x-4">
                        <span>{earthquake.date} • {earthquake.time}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span>Kedalaman: {earthquake.depth} km</span>
                        {earthquake.felt && (
                          <span className="text-orange-600">Dirasakan: {earthquake.felt}</span>
                        )}
                      </div>
                      <div className="text-gray-500">
                        {earthquake.latitude.toFixed(3)}°, {earthquake.longitude.toFixed(3)}°
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-2 flex-shrink-0">
                    <MapPin className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}