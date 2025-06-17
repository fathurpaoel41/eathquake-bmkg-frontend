'use client';

import { useEffect, useRef } from 'react';
import { ProcessedEarthquake } from '@/types/earthquake';
import { getMagnitudeColor, getMagnitudeLabel } from '@/lib/earthquake-api';

interface EarthquakeMapProps {
  earthquakes: ProcessedEarthquake[];
  selectedEarthquake?: ProcessedEarthquake | null;
  onEarthquakeSelect?: (earthquake: ProcessedEarthquake) => void;
}

export function EarthquakeMap({ 
  earthquakes, 
  selectedEarthquake, 
  onEarthquakeSelect 
}: EarthquakeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeMap = async () => {
      // Dynamically import Leaflet to avoid SSR issues
      const L = (await import('leaflet')).default;
      
      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (mapRef.current && !mapInstanceRef.current) {
        // Initialize map centered on Indonesia
        mapInstanceRef.current = L.map(mapRef.current).setView([-2.5, 118], 5);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(mapInstanceRef.current);
      }
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;

      // Clear existing markers
      markersRef.current.forEach(marker => {
        mapInstanceRef.current.removeLayer(marker);
      });
      markersRef.current = [];

      // Add new markers
      earthquakes.forEach((earthquake) => {
        if (earthquake.latitude && earthquake.longitude) {
          const color = getMagnitudeColor(earthquake.magnitude);
          const label = getMagnitudeLabel(earthquake.magnitude);

          // Create custom icon
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div class="relative">
                <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white" 
                     style="background-color: ${color}">
                  ${earthquake.magnitude.toFixed(1)}
                </div>
                ${selectedEarthquake?.id === earthquake.id ? 
                  '<div class="absolute -inset-2 rounded-full border-2 border-blue-500 animate-pulse"></div>' : 
                  ''
                }
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const marker = L.marker([earthquake.latitude, earthquake.longitude], {
            icon: customIcon,
          });

          // Create popup content
          const popupContent = `
            <div class="p-2 min-w-64">
              <div class="font-semibold text-lg mb-2">${earthquake.location}</div>
              <div class="space-y-1 text-sm">
                <div><strong>Magnitude:</strong> ${earthquake.magnitude.toFixed(1)} (${label})</div>
                <div><strong>Depth:</strong> ${earthquake.depth} km</div>
                <div><strong>Date:</strong> ${earthquake.date}</div>
                <div><strong>Time:</strong> ${earthquake.time}</div>
                <div><strong>Felt:</strong> ${earthquake.felt}</div>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);

          // Add click handler
          marker.on('click', () => {
            onEarthquakeSelect?.(earthquake);
          });

          marker.addTo(mapInstanceRef.current);
          markersRef.current.push(marker);
        }
      });
    };

    updateMarkers();
  }, [earthquakes, selectedEarthquake, onEarthquakeSelect]);

  // Handle selected earthquake change
  useEffect(() => {
    if (selectedEarthquake && mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [selectedEarthquake.latitude, selectedEarthquake.longitude], 
        8,
        { animate: true }
      );
    }
  }, [selectedEarthquake]);

  return (
    <div className="relative h-full w-full">
      <div 
        ref={mapRef} 
        className="h-full w-full rounded-lg overflow-hidden shadow-sm border border-gray-200"
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-xs">
        <div className="font-semibold mb-2">Magnitude Scale</div>
        <div className="space-y-1">
          {[
            { min: 7, max: 10, label: 'Major', color: '#DC2626' },
            { min: 6, max: 6.9, label: 'Strong', color: '#EA580C' },
            { min: 5, max: 5.9, label: 'Moderate', color: '#D97706' },
            { min: 4, max: 4.9, label: 'Light', color: '#EAB308' },
            { min: 3, max: 3.9, label: 'Minor', color: '#65A30D' },
            { min: 0, max: 2.9, label: 'Micro', color: '#16A34A' },
          ].map(({ min, max, label, color }) => (
            <div key={label} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full border border-white"
                style={{ backgroundColor: color }}
              />
              <span>{label} ({min}+)</span>
            </div>
          ))}
        </div>
      </div>

      {/* CSS for custom markers */}
      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .leaflet-popup-content {
          margin: 0;
        }
      `}</style>
    </div>
  );
}