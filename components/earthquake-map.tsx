'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { ProcessedEarthquake } from '@/types/earthquake';
import { getMagnitudeColor, getMagnitudeLabel } from '@/lib/earthquake-api';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, MapPin } from 'lucide-react';

// Leaflet imports
import 'leaflet/dist/leaflet.css';

interface EarthquakeMapProps {
  earthquakes: ProcessedEarthquake[];
  selectedEarthquake?: ProcessedEarthquake | null;
  onEarthquakeSelect?: (earthquake: ProcessedEarthquake | null) => void;
  onLoadingComplete?: () => void;
}

export function EarthquakeMap({ 
  earthquakes, 
  selectedEarthquake, 
  onEarthquakeSelect,
  onLoadingComplete
}: EarthquakeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Add custom CSS for earthquake markers
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-earthquake-marker {
        background: transparent !important;
        border: none !important;
      }
      
      .custom-earthquake-marker div {
        transition: transform 0.2s ease;
      }
      
      .custom-earthquake-marker:hover div {
        transform: scale(1.1);
      }
      
      .leaflet-popup-content-wrapper {
        border-radius: 8px;
      }
      
      .earthquake-popup .leaflet-popup-content {
        margin: 0;
        font-family: system-ui, -apple-system, sans-serif;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      if (typeof window === 'undefined' || !mapRef.current) return;

      try {
        // Dynamic imports for client-side only
        const L = (await import('leaflet')).default;
        
        // Fix default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/leaflet/marker-icon-2x.png',
          iconUrl: '/leaflet/marker-icon.png',
          shadowUrl: '/leaflet/marker-shadow.png',
        });

        // Create map if it doesn't exist
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = L.map(mapRef.current, {
            center: [-2.5, 118], // Center of Indonesia
            zoom: 5,
            zoomControl: true,
            attributionControl: true,
          });

          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
          }).addTo(mapInstanceRef.current);

          console.log('Map initialized successfully');
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    initializeMap();

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          console.log('Map cleaned up');
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
    };
  }, []);

  // Update markers when earthquakes data changes
  useEffect(() => {
    const updateMarkers = async () => {
      if (typeof window === 'undefined' || !mapInstanceRef.current) return;

      try {
        const L = (await import('leaflet')).default;

        // Clear existing markers with error handling
        console.log('Clearing existing markers...');
        markersRef.current.forEach((marker, index) => {
          try {
            if (marker && mapInstanceRef.current) {
              mapInstanceRef.current.removeLayer(marker);
            }
          } catch (error) {
            console.warn(`Error removing marker ${index}:`, error);
          }
        });
        markersRef.current = [];

        // Add new markers if earthquakes exist
        if (earthquakes.length > 0) {
          console.log(`Adding ${earthquakes.length} earthquake markers to map`);
          
          const validEarthquakes: ProcessedEarthquake[] = [];
          
          earthquakes.forEach((earthquake, index) => {
            try {
              const lat = parseFloat(earthquake.latitude?.toString() || '0');
              const lng = parseFloat(earthquake.longitude?.toString() || '0');

              // Validate coordinates
              if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                console.warn(`Invalid coordinates for earthquake ${earthquake.id || index}:`, { lat, lng, earthquake });
                return;
              }

              validEarthquakes.push(earthquake);

              // Get magnitude-based styling
              const magnitude = parseFloat(earthquake.magnitude?.toString() || '0');
              const color = getMagnitudeColor(magnitude);
              
              // Create custom marker based on magnitude
              const radius = Math.max(6, Math.min(20, magnitude * 3));
              
              const marker = L.circleMarker([lat, lng], {
                radius: radius,
                fillColor: color,
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8,
              });

              // Create a custom HTML icon with magnitude text
              const magnitudeText = magnitude.toFixed(1);
              const iconHtml = `
                <div style="
                  position: relative;
                  width: ${radius * 2}px;
                  height: ${radius * 2}px;
                  border-radius: 50%;
                  background-color: ${color};
                  border: 2px solid #ffffff;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: ${Math.max(8, Math.min(12, radius * 0.6))}px;
                  font-weight: bold;
                  color: #ffffff;
                  text-shadow: 0 0 2px rgba(0,0,0,0.8);
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                ">
                  ${magnitudeText}
                </div>
              `;

              // Create custom divIcon with magnitude text
              const customIcon = L.divIcon({
                html: iconHtml,
                className: 'custom-earthquake-marker',
                iconSize: [radius * 2, radius * 2],
                iconAnchor: [radius, radius],
              });

              // Create marker with custom icon
              const textMarker = L.marker([lat, lng], { icon: customIcon });

              // Create popup content with enhanced styling
              const popupContent = `
                <div class="p-3 min-w-64">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-4 h-4 rounded-full" style="background-color: ${color}"></div>
                    <span class="font-bold text-lg">M ${magnitude.toFixed(1)}</span>
                    <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                      ${getMagnitudeLabel(magnitude)}
                    </span>
                  </div>
                  <h3 class="font-semibold text-gray-900 mb-1">${earthquake.location}</h3>
                  <div class="space-y-1 text-sm text-gray-600">
                    <div><strong>Waktu:</strong> ${earthquake.date} ${earthquake.time} WIB</div>
                    <div><strong>Kedalaman:</strong> ${earthquake.depth}</div>
                    <div><strong>Koordinat:</strong> ${lat.toFixed(3)}°, ${lng.toFixed(3)}°</div>
                    ${earthquake.felt ? `<div><strong>Dirasakan:</strong> ${earthquake.felt}</div>` : ''}
                    ${earthquake.shakemap ? `<div class="mt-2"><img src="${earthquake.shakemap}" alt="Shakemap" class="w-full rounded border" /></div>` : ''}
                  </div>
                </div>
              `;

              textMarker.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'earthquake-popup'
              });

              // Add click handler for earthquake selection
              textMarker.on('click', () => {
                onEarthquakeSelect?.(earthquake);
              });

              // Add marker to map
              textMarker.addTo(mapInstanceRef.current);
              markersRef.current.push(textMarker);

              console.log(`Added marker for earthquake ${earthquake.id || `local-${earthquake.dateTime}-${index}`} at [${lat}, ${lng}]`);
            } catch (error) {
              console.error(`Error adding marker for earthquake ${earthquake.id || index}:`, error);
            }
          });

          // Fit map bounds to show all earthquakes if valid earthquakes exist
          if (validEarthquakes.length > 0) {
            try {
              const group = L.featureGroup(markersRef.current);
              const bounds = group.getBounds();
              
              if (bounds.isValid()) {
                mapInstanceRef.current.fitBounds(bounds, {
                  padding: [20, 20],
                  maxZoom: 10
                });
                console.log('Map bounds fitted to show all earthquakes');
              }
            } catch (error) {
              console.warn('Error fitting bounds:', error);
            }
          }

          // Force map to invalidate size and refresh
          setTimeout(() => {
            if (mapInstanceRef.current) {
              try {
                mapInstanceRef.current.invalidateSize();
                console.log(`Successfully added ${markersRef.current.length} markers to map`);
                
                // Call onLoadingComplete when markers are successfully added
                onLoadingComplete?.();
              } catch (error) {
                console.warn('Error invalidating map size:', error);
                // Still call onLoadingComplete even if invalidation fails
                onLoadingComplete?.();
              }
            }
          }, 100);
        } else {
          console.log('No earthquakes to display on map');
          // Call onLoadingComplete even when no earthquakes to display
          onLoadingComplete?.();
        }
      } catch (error) {
        console.error('Error updating markers:', error);
        // Call onLoadingComplete even on error to prevent indefinite loading
        onLoadingComplete?.();
      }
    };

    updateMarkers();
  }, [earthquakes, onLoadingComplete, onEarthquakeSelect]);

  // Highlight selected earthquake
  useEffect(() => {
    if (typeof window === 'undefined' || !mapInstanceRef.current) return;

    const highlightSelectedEarthquake = async () => {
      try {
        const L = (await import('leaflet')).default;

        // Reset all markers to normal style
        markersRef.current.forEach((marker) => {
          if (marker && marker.setStyle) {
            marker.setStyle({
              weight: 2,
              opacity: 1,
            });
          }
        });

        // Highlight selected earthquake
        if (selectedEarthquake) {
          const selectedMarker = markersRef.current.find((marker, index) => {
            const earthquake = earthquakes[index];
            return earthquake && (
              earthquake.id === selectedEarthquake.id ||
              (earthquake.dateTime === selectedEarthquake.dateTime && 
               earthquake.latitude === selectedEarthquake.latitude &&
               earthquake.longitude === selectedEarthquake.longitude)
            );
          });

          if (selectedMarker && selectedMarker.setStyle) {
            selectedMarker.setStyle({
              weight: 4,
              opacity: 1,
              color: '#FF4444',
            });

            // Pan to selected marker
            const latLng = selectedMarker.getLatLng();
            if (latLng) {
              mapInstanceRef.current.setView(latLng, Math.max(mapInstanceRef.current.getZoom(), 8), {
                animate: true,
                duration: 0.5
              });
            }
          }
        }
      } catch (error) {
        console.error('Error highlighting selected earthquake:', error);
      }
    };

    highlightSelectedEarthquake();
  }, [selectedEarthquake, earthquakes]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full rounded-lg overflow-hidden border border-gray-200" />
      
      {/* Earthquake count indicator */}
      {earthquakes.length > 0 && (
        <div className="absolute top-4 right-4 z-[1000]">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-700">
                {earthquakes.length} Gempa
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Selected earthquake info */}
      {selectedEarthquake && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <span className="font-bold text-lg">M {parseFloat(selectedEarthquake.magnitude?.toString() || '0').toFixed(1)}</span>
                  <Badge variant="outline" className="text-xs">
                    {getMagnitudeLabel(parseFloat(selectedEarthquake.magnitude?.toString() || '0'))}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{selectedEarthquake.location}</h3>
                <div className="text-sm text-gray-600">
                  <div>{selectedEarthquake.date} • {selectedEarthquake.time} WIB</div>
                  <div>Kedalaman: {selectedEarthquake.depth}</div>
                </div>
              </div>
              <button
                onClick={() => onEarthquakeSelect?.(null)}
                className="ml-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Close"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}