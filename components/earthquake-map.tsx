'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
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
  const [mapReady, setMapReady] = useState(false);
  const isInitializingRef = useRef(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

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

  // Safe map operation wrapper
  const safeMapOperation = useCallback((operation: () => void, operationName: string) => {
    try {
      if (!mapInstanceRef.current || !mapReady) {
        console.warn(`Map not ready for operation: ${operationName}`);
        return false;
      }
      
      // Check if map container exists and is valid
      const container = mapInstanceRef.current.getContainer();
      if (!container || !container.offsetParent) {
        console.warn(`Map container not available for operation: ${operationName}`);
        return false;
      }

      operation();
      return true;
    } catch (error) {
      console.error(`Error in map operation "${operationName}":`, error);
      return false;
    }
  }, [mapReady]);

  // Initialize map
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;
    let initTimeout: NodeJS.Timeout;

    const initializeMap = async () => {
      if (typeof window === 'undefined' || !mapRef.current || isInitializingRef.current) return;

      try {
        isInitializingRef.current = true;
        
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
        if (!mapInstanceRef.current && mapRef.current) {
          // Check container dimensions with retry logic
          const container = mapRef.current;
          const containerRect = container.getBoundingClientRect();
          const hasValidDimensions = containerRect.width > 0 && containerRect.height > 0;
          
          if (!hasValidDimensions) {
            retryCount++;
            if (retryCount <= maxRetries) {
              console.warn(`Map container has no dimensions (attempt ${retryCount}/${maxRetries}), retrying...`);
              initTimeout = setTimeout(() => initializeMap(), 200);
              return;
            } else {
              console.error('Max retries reached for map initialization. Container may not be visible.');
              // Try to initialize anyway with fallback dimensions
              container.style.minHeight = '400px';
              container.style.minWidth = '100%';
            }
          }

          console.log('Initializing map with container dimensions:', containerRect);

          mapInstanceRef.current = L.map(container, {
            center: [-2.5, 118], // Center of Indonesia
            zoom: 5,
            zoomControl: true,
            attributionControl: true,
            preferCanvas: true, // Better performance
          });

          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
          }).addTo(mapInstanceRef.current);

          // Wait for map to be ready
          mapInstanceRef.current.whenReady(() => {
            setTimeout(() => {
              if (mapInstanceRef.current) {
                setMapReady(true);
                console.log('Map initialized and ready');
              }
            }, 100);
          });

          // Force invalidate size after a short delay to ensure proper rendering
          setTimeout(() => {
            if (mapInstanceRef.current) {
              try {
                mapInstanceRef.current.invalidateSize();
                console.log('Map size invalidated after initialization');
              } catch (error) {
                console.warn('Error invalidating map size during initialization:', error);
              }
            }
          }, 300);

          // Set up ResizeObserver to handle container size changes
          if (typeof ResizeObserver !== 'undefined') {
            resizeObserverRef.current = new ResizeObserver((entries) => {
              for (const entry of entries) {
                if (entry.target === container && mapInstanceRef.current) {
                  const { width, height } = entry.contentRect;
                  if (width > 0 && height > 0) {
                    setTimeout(() => {
                      if (mapInstanceRef.current) {
                        try {
                          mapInstanceRef.current.invalidateSize();
                          console.log('Map size invalidated due to container resize:', { width, height });
                        } catch (error) {
                          console.warn('Error invalidating map size on resize:', error);
                        }
                      }
                    }, 100);
                  }
                }
              }
            });
            
            resizeObserverRef.current.observe(container);
          }
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
        retryCount++;
        if (retryCount <= maxRetries) {
          console.log(`Retrying map initialization (attempt ${retryCount}/${maxRetries})...`);
          initTimeout = setTimeout(() => initializeMap(), 500);
        }
      } finally {
        isInitializingRef.current = false;
      }
    };

    // Start initialization with a small delay to ensure DOM is ready
    const startTimeout = setTimeout(() => initializeMap(), 100);

    // Cleanup on unmount
    return () => {
      if (startTimeout) clearTimeout(startTimeout);
      if (initTimeout) clearTimeout(initTimeout);
      
      // Cleanup ResizeObserver
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      
      if (mapInstanceRef.current) {
        try {
          setMapReady(false);
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          console.log('Map cleaned up');
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
    };
  }, []); // Empty dependency array to run only once

  // Update markers when earthquakes data changes
  useEffect(() => {
    if (!mapReady) return;

    const updateMarkers = async () => {
      if (typeof window === 'undefined') return;

      const success = safeMapOperation(async () => {
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
              safeMapOperation(() => {
                try {
                  const L = require('leaflet');
                  const group = L.featureGroup(markersRef.current);
                  const bounds = group.getBounds();
                  
                  if (bounds.isValid() && mapInstanceRef.current) {
                    mapInstanceRef.current.fitBounds(bounds, {
                      padding: [20, 20],
                      maxZoom: 10
                    });
                    console.log('Map bounds fitted to show all earthquakes');
                  }
                } catch (error) {
                  console.warn('Error fitting bounds:', error);
                }
              }, 'fitBounds');
            }

            // Force map to invalidate size and refresh
            setTimeout(() => {
              safeMapOperation(() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.invalidateSize();
                  console.log(`Successfully added ${markersRef.current.length} markers to map`);
                }
              }, 'invalidateSize');
              
              // Call onLoadingComplete when markers are successfully added
              onLoadingComplete?.();
            }, 200);
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
      }, 'updateMarkers');

      if (!success) {
        // Call onLoadingComplete even if operation failed
        onLoadingComplete?.();
      }
    };

    updateMarkers();
  }, [earthquakes, mapReady, onLoadingComplete, onEarthquakeSelect, safeMapOperation]);

  // Highlight selected earthquake
  useEffect(() => {
    if (!mapReady) return;

    const highlightSelectedEarthquake = () => {
      safeMapOperation(async () => {
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
            console.log('Highlighting selected earthquake:', selectedEarthquake.id || 'no-id');
            
            // Find the corresponding marker
            let selectedMarkerIndex = -1;
            const selectedMarker = markersRef.current.find((marker, index) => {
              const earthquake = earthquakes[index];
              if (!earthquake) return false;
              
              const isMatch = earthquake.id === selectedEarthquake.id ||
                (earthquake.dateTime.getTime() === selectedEarthquake.dateTime.getTime() && 
                 Math.abs(parseFloat(earthquake.latitude.toString()) - parseFloat(selectedEarthquake.latitude.toString())) < 0.001 &&
                 Math.abs(parseFloat(earthquake.longitude.toString()) - parseFloat(selectedEarthquake.longitude.toString())) < 0.001);
              
              if (isMatch) {
                selectedMarkerIndex = index;
              }
              return isMatch;
            });

            if (selectedMarker) {
              console.log('Found selected marker at index:', selectedMarkerIndex);
              
              // Highlight the marker
              if (selectedMarker.setStyle) {
                selectedMarker.setStyle({
                  weight: 4,
                  opacity: 1,
                  color: '#FF4444',
                });
              }

              // Get coordinates and pan to marker with smooth animation
              const lat = parseFloat(selectedEarthquake.latitude.toString());
              const lng = parseFloat(selectedEarthquake.longitude.toString());
              
              if (!isNaN(lat) && !isNaN(lng)) {
                console.log('Panning to coordinates:', lat, lng);
                
                // Safe map panning with additional checks
                safeMapOperation(() => {
                  if (mapInstanceRef.current) {
                    // Calculate appropriate zoom level based on current zoom
                    const currentZoom = mapInstanceRef.current.getZoom();
                    const targetZoom = Math.max(currentZoom, 8); // Minimum zoom level of 8
                    
                    // Pan and zoom to the selected earthquake with smooth animation
                    mapInstanceRef.current.setView([lat, lng], targetZoom, {
                      animate: true,
                      duration: 1.0, // Smooth 1-second animation
                      easeLinearity: 0.1
                    });
                    
                    // Open popup if marker has one (with safety check)
                    setTimeout(() => {
                      if (selectedMarker && selectedMarker.openPopup && mapInstanceRef.current) {
                        try {
                          selectedMarker.openPopup();
                        } catch (error) {
                          console.warn('Error opening popup:', error);
                        }
                      }
                    }, 1200); // Open popup after animation completes
                  }
                }, 'panToEarthquake');
              } else {
                console.warn('Invalid coordinates for selected earthquake:', { lat, lng });
              }
            } else {
              console.warn('Could not find marker for selected earthquake:', selectedEarthquake.id);
              
              // Fallback: try to pan to coordinates even without marker
              const lat = parseFloat(selectedEarthquake.latitude.toString());
              const lng = parseFloat(selectedEarthquake.longitude.toString());
              
              if (!isNaN(lat) && !isNaN(lng)) {
                console.log('Fallback: panning to coordinates without marker:', lat, lng);
                safeMapOperation(() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([lat, lng], Math.max(mapInstanceRef.current.getZoom(), 8), {
                      animate: true,
                      duration: 1.0,
                      easeLinearity: 0.1
                    });
                  }
                }, 'fallbackPanToEarthquake');
              }
            }
          }
        } catch (error) {
          console.error('Error highlighting selected earthquake:', error);
        }
      }, 'highlightSelectedEarthquake');
    };

    highlightSelectedEarthquake();
  }, [selectedEarthquake, earthquakes, mapReady, safeMapOperation]);

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