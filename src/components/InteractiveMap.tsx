import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, Zap } from 'lucide-react';

interface InteractiveMapProps {
  origin?: string;
  destination?: string;
  routeData?: any;
  riskScore?: number;
  className?: string;
}

const InteractiveMap = ({ 
  origin, 
  destination, 
  routeData, 
  riskScore = 50,
  className = "w-full h-96" 
}: InteractiveMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const response = await fetch('https://pdirlmmavkzmqbybfdjj.supabase.co/functions/v1/get-mapbox-token', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkaXJsbW1hdmt6bXFieWJmZGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Mzk1MjAsImV4cCI6MjA3MzQxNTUyMH0.B4VyQxP97uUUm-2mdNZmPn3kxv8UA4rraOJAhENQ6N8`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            setMapboxToken(data.token);
          } else {
            console.log('Mapbox token not configured, using fallback');
            setError('Mapbox token not configured');
          }
        } else {
          setError('Failed to fetch Mapbox token');
        }
      } catch (err) {
        console.error('Error fetching Mapbox token:', err);
        setError('Failed to load map');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapboxToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      // Default to Mumbai coordinates
      const mumbaiCoords: [number, number] = [72.8777, 19.0760];
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: mumbaiCoords,
        zoom: 12,
        pitch: 45,
        bearing: -15
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add markers and route when map loads
      map.current.on('load', () => {
        addMarkersAndRoute();
      });

    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, origin, destination]);

  const addMarkersAndRoute = () => {
    if (!map.current) return;

    // Sample coordinates for Mumbai area (Bandra to Andheri)
    const originCoords: [number, number] = [72.8297, 19.0596]; // Bandra
    const destinationCoords: [number, number] = [72.8697, 19.1136]; // Andheri

    // Add origin marker
    const originEl = document.createElement('div');
    originEl.className = 'origin-marker';
    originEl.innerHTML = `
      <div class="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full shadow-lg border-2 border-white">
        <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `;

    new mapboxgl.Marker({ element: originEl })
      .setLngLat(originCoords)
      .setPopup(new mapboxgl.Popup().setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-sm">Origin</h3>
          <p class="text-xs text-gray-600">${origin || 'Starting Point'}</p>
        </div>
      `))
      .addTo(map.current);

    // Add destination marker
    const destinationEl = document.createElement('div');
    destinationEl.className = 'destination-marker';
    destinationEl.innerHTML = `
      <div class="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full shadow-lg border-2 border-white">
        <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
          <path d="M9 11H7l3-3 3 3h-2v8h-2v-8z"/>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
    `;

    new mapboxgl.Marker({ element: destinationEl })
      .setLngLat(destinationCoords)
      .setPopup(new mapboxgl.Popup().setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-sm">Destination</h3>
          <p class="text-xs text-gray-600">${destination || 'End Point'}</p>
        </div>
      `))
      .addTo(map.current);

    // Add route line with risk-based styling
    const routeColor = riskScore > 66 ? '#ef4444' : riskScore > 33 ? '#f59e0b' : '#10b981';
    
    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            originCoords,
            [72.8450, 19.0800], // Mid point
            [72.8600, 19.0950], // Another mid point
            destinationCoords
          ]
        }
      }
    });

    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': routeColor,
        'line-width': 6,
        'line-opacity': 0.8
      }
    });

    // Add risk indicators along the route
    if (riskScore > 66) {
      // Add warning markers for high-risk areas
      const riskPoint: [number, number] = [72.8450, 19.0800];
      
      const riskEl = document.createElement('div');
      riskEl.innerHTML = `
        <div class="flex items-center justify-center w-6 h-6 bg-red-500 rounded-full shadow-lg border-2 border-white animate-pulse">
          <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
            <path d="M12 2L2 22h20L12 2zm0 3.5L19.5 20h-15L12 5.5z"/>
            <path d="M12 18v-2m0-4v-4"/>
          </svg>
        </div>
      `;

      new mapboxgl.Marker({ element: riskEl })
        .setLngLat(riskPoint)
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-sm text-red-600">⚠️ Risk Area</h3>
            <p class="text-xs text-gray-600">Low lighting, reduced visibility</p>
          </div>
        `))
        .addTo(map.current);
    }

    // Fit map to show entire route
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend(originCoords);
    bounds.extend(destinationCoords);
    
    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15
    });
  };

  if (isLoading) {
    return (
      <div className={`${className} bg-muted rounded-lg flex items-center justify-center`}>
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading interactive map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-muted rounded-lg flex flex-col items-center justify-center p-8`}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-guardian-light rounded-full flex items-center justify-center mb-4">
            <Navigation className="h-8 w-8 text-guardian" />
          </div>
          <h3 className="text-lg font-semibold text-guardian">Interactive Map</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {error === 'Mapbox token not configured' 
              ? 'Map visualization will appear here when Mapbox is configured' 
              : 'Route visualization temporarily unavailable'
            }
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground mt-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Origin</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Destination</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Risk Areas</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative rounded-lg overflow-hidden shadow-lg`}>
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map overlay controls */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Start</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>End</span>
          </div>
          {riskScore > 66 && (
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-red-500" />
              <span className="text-red-600">High Risk</span>
            </div>
          )}
        </div>
      </div>

      {/* Risk level indicator */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
        <div className="text-xs font-medium">
          Risk Level: <span className={`${riskScore > 66 ? 'text-red-600' : riskScore > 33 ? 'text-yellow-600' : 'text-green-600'}`}>
            {riskScore > 66 ? 'High' : riskScore > 33 ? 'Medium' : 'Low'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;