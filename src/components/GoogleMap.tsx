import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Navigation, Zap } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

declare global {
  interface Window {
    google: typeof google;
  }
}

interface GoogleMapProps {
  origin?: string;
  destination?: string;
  routeData?: any;
  riskScore?: number;
  showAlternateRoute?: boolean;
  className?: string;
}

const GoogleMap = ({ 
  origin, 
  destination, 
  routeData, 
  riskScore = 50,
  showAlternateRoute = false,
  className = "w-full h-96" 
}: GoogleMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null); // google.maps.Map | L.Map
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useLeafletFallback, setUseLeafletFallback] = useState(false);

  // Fetch Google Maps API key (reusing the mapbox token endpoint since it returns Google Maps key)
  useEffect(() => {
    const fetchGoogleMapsKey = async () => {
      try {
        console.log('Fetching Google Maps API key...');
        let response = await fetch('https://pdirlmmavkzmqbybfdjj.supabase.co/functions/v1/get-google-maps-key', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkaXJsbW1hdmt6bXFieWJmZGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Mzk1MjAsImV4cCI6MjA3MzQxNTUyMH0.B4VyQxP97uUUm-2mdNZmPn3kxv8UA4rraOJAhENQ6N8`,
          },
        });
        
        // Fallback to mapbox endpoint if new one doesn't work
        if (!response.ok) {
          console.log('New endpoint failed, trying fallback...');
          response = await fetch('https://pdirlmmavkzmqbybfdjj.supabase.co/functions/v1/get-mapbox-token', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkaXJsbW1hdmt6bXFieWJmZGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Mzk1MjAsImV4cCI6MjA3MzQxNTUyMH0.B4VyQxP97uUUm-2mdNZmPn3kxv8UA4rraOJAhENQ6N8`,
            },
          });
        }
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Response data:', data);
          if (data.token) {
            console.log('Setting Google Maps API key:', data.token.substring(0, 10) + '...');
            setGoogleMapsApiKey(data.token);
          } else {
            console.log('Google Maps API key not configured in response');
            setError('Google Maps API key not configured');
          }
        } else {
          console.error('Failed to fetch Google Maps API key, status:', response.status);
          setError('Failed to fetch Google Maps API key');
        }
      } catch (err) {
        console.error('Error fetching Google Maps API key:', err);
        setError('Failed to load map');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoogleMapsKey();
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    if (!mapContainer.current || !googleMapsApiKey) {
      console.log('Map container or API key not ready:', { 
        hasContainer: !!mapContainer.current, 
        hasApiKey: !!googleMapsApiKey 
      });
      return;
    }

    console.log('Initializing Google Maps with key:', googleMapsApiKey.substring(0, 10) + '...');

    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: googleMapsApiKey,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        console.log('Loading Google Maps...');
        const google = await loader.load();
        console.log('Google Maps loaded successfully');
        
        // Default to Mumbai coordinates
        const mumbaiCoords = { lat: 19.0760, lng: 72.8777 };
        
        console.log('Creating map instance...');
        map.current = new google.maps.Map(mapContainer.current!, {
          center: mumbaiCoords,
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            }
          ]
        });

        console.log('Map created, adding markers and route...');
        addMarkersAndRoute(google);
        console.log('Map initialization complete');

        // Detect Google Maps error overlay and fall back to Leaflet
        setTimeout(() => {
          const text = mapContainer.current?.innerText || '';
          const hasErrorOverlay = /Something went wrong|This page didn't load Google Maps/i.test(text);
          if (hasErrorOverlay) {
            console.warn('Google Maps error overlay detected, switching to Leaflet fallback');
            setUseLeafletFallback(true);
          }
        }, 1200);

      } catch (err) {
        console.error('Error initializing Google Maps:', err);
        setError('Failed to initialize map: ' + (err as Error).message);
      }
    };

    initMap();
  }, [googleMapsApiKey, origin, destination, riskScore, showAlternateRoute]);

  // Initialize Leaflet fallback if needed
  useEffect(() => {
    if (!useLeafletFallback || !mapContainer.current) return;
    try {
      // Clear existing contents
      mapContainer.current.innerHTML = '';
      const originCoords: [number, number] = [19.0596, 72.8297];
      const destinationCoords: [number, number] = [19.1136, 72.8697];
      
      map.current = L.map(mapContainer.current).setView(originCoords, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map.current);
      
      // Markers
      L.circleMarker(originCoords, { radius: 8, color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 1 }).addTo(map.current)
        .bindPopup(`<b>Origin</b><br/>${origin || 'Starting Point'}`);
      L.circleMarker(destinationCoords, { radius: 8, color: '#10B981', fillColor: '#10B981', fillOpacity: 1 }).addTo(map.current)
        .bindPopup(`<b>Destination</b><br/>${destination || 'End Point'}`);
      
      // Route line for Leaflet
      const routeLatLngs: [number, number][] = [
        originCoords,
        [19.0800, 72.8450],
        [19.0950, 72.8600],
        destinationCoords
      ];
      const routeColor = riskScore > 66 ? '#EF4444' : riskScore > 33 ? '#F59E0B' : '#10B981';
      L.polyline(routeLatLngs, { 
        color: routeColor, 
        weight: 6, 
        opacity: showAlternateRoute ? 0.4 : 0.9 
      }).addTo(map.current);

      // Add alternate route for Leaflet if requested
      if (showAlternateRoute) {
        const alternateRouteLatLngs: [number, number][] = [
          originCoords,
          [19.0650, 72.8400], // Different path via main road
          [19.0900, 72.8500], // Highway route
          [19.1050, 72.8650], // Well-lit area
          destinationCoords
        ];
        
        L.polyline(alternateRouteLatLngs, { 
          color: '#10B981', 
          weight: 8, 
          opacity: 1.0,
          dashArray: '10, 10' // Dashed line to distinguish
        }).addTo(map.current);

        // Add safety markers
        const safetyPoints: Array<[number, number, string]> = [
          [19.0650, 72.8400, 'Well-lit Main Road'],
          [19.0900, 72.8500, 'CCTV Coverage'],
          [19.1050, 72.8650, 'Police Station Nearby']
        ];

        safetyPoints.forEach(([lat, lng, label]) => {
          L.circleMarker([lat, lng], { 
            radius: 4, 
            color: '#10B981', 
            fillColor: '#10B981', 
            fillOpacity: 1 
          }).addTo(map.current)
            .bindPopup(`<b>✅ Safety Feature</b><br/>${label}`);
        });
      }

      // Fit bounds
      const bounds = L.latLngBounds(routeLatLngs);
      map.current.fitBounds(bounds, { padding: [30, 30] });
    } catch (e) {
      console.error('Leaflet fallback failed:', e);
      setError('Map failed to load');
    }
  }, [useLeafletFallback, origin, destination, riskScore, showAlternateRoute]);

  const addMarkersAndRoute = (google: any) => {
    if (!map.current) return;

    // Default fallback coordinates (Mumbai area) used only if geocoding fails
    const originCoords = { lat: 19.0596, lng: 72.8297 }; // Bandra
    const destinationCoords = { lat: 19.1136, lng: 72.8697 }; // Andheri

    // Markers are created after DirectionsService returns so they match the road route exactly

    // Use Google DirectionsService to draw road-following routes
    const routeColor = riskScore > 66 ? '#EF4444' : riskScore > 33 ? '#F59E0B' : '#10B981';

    const directionsService = new google.maps.DirectionsService();

    const request = {
      origin: origin || originCoords,
      destination: destination || destinationCoords,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: showAlternateRoute,
    };

    directionsService.route(request, (result: any, status: any) => {
      if (status === 'OK' && result.routes.length) {
        const primaryRoute = result.routes[0];
        const primaryPath = primaryRoute.overview_path;
        const leg = primaryRoute.legs && primaryRoute.legs[0];

        // Create accurate start/end markers from the routed leg
        if (leg) {
          const startMarker = new google.maps.Marker({
            position: leg.start_location,
            map: map.current,
            title: leg.start_address || (origin || 'Starting Point'),
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#3B82F6',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 3,
              scale: 8,
            },
          });
          const endMarker = new google.maps.Marker({
            position: leg.end_location,
            map: map.current,
            title: leg.end_address || (destination || 'Destination'),
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#10B981',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 3,
              scale: 8,
            },
          });

          const originInfoWindow = new google.maps.InfoWindow({
            content: `<div class="p-2"><h3 class="font-semibold text-sm">Origin</h3><p class="text-xs text-gray-600">${startMarker.getTitle()}</p></div>`
          });
          const destinationInfoWindow = new google.maps.InfoWindow({
            content: `<div class="p-2"><h3 class="font-semibold text-sm">Destination</h3><p class="text-xs text-gray-600">${endMarker.getTitle()}</p></div>`
          });
          startMarker.addListener('click', () => originInfoWindow.open(map.current, startMarker));
          endMarker.addListener('click', () => destinationInfoWindow.open(map.current, endMarker));
        }

        // Main route
        new google.maps.Polyline({
          path: primaryPath,
          strokeColor: routeColor,
          strokeOpacity: showAlternateRoute ? 0.4 : 1.0,
          strokeWeight: 6,
          map: map.current,
        });

        // Alternate (safer) route
        if (showAlternateRoute && result.routes[1]) {
          const altPath = result.routes[1].overview_path;
          const dashSymbol = { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 };
          new google.maps.Polyline({
            path: altPath,
            strokeColor: '#10B981',
            strokeOpacity: 0,
            icons: [{ icon: dashSymbol, offset: '0', repeat: '20px' }],
            strokeWeight: 8,
            map: map.current,
          });

          // Safety markers along the alternate route
          const pts = [
            altPath[Math.floor(altPath.length * 0.25)],
            altPath[Math.floor(altPath.length * 0.5)],
            altPath[Math.floor(altPath.length * 0.75)],
          ].filter(Boolean);
          pts.forEach((pt: any) => {
            new google.maps.Marker({
              position: pt,
              map: map.current,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#10B981',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
                scale: 4,
              },
            });
          });
        }

        // Risk indicator on main route
        if (riskScore > 66 && primaryPath.length) {
          const riskPt = primaryPath[Math.floor(primaryPath.length / 2)];
          new google.maps.Marker({
            position: riskPt,
            map: map.current,
            icon: {
              path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              fillColor: '#EF4444',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
              scale: 6,
            },
          });
        }

        // Fit map to the route
        const bounds = primaryRoute.bounds || new google.maps.LatLngBounds();
        if (!primaryRoute.bounds) {
          primaryPath.forEach((p: any) => bounds.extend(p));
        }
        map.current.fitBounds(bounds);
        const listener = google.maps.event.addListener(map.current, 'idle', () => {
          if (map.current!.getZoom()! > 16) {
            map.current!.setZoom(16);
          }
          google.maps.event.removeListener(listener);
        });
      } else {
        console.warn('Directions request failed:', status);
        // Fallback: simple polyline between points
        const fallbackPath = [originCoords, destinationCoords];
        new google.maps.Polyline({
          path: fallbackPath,
          strokeColor: routeColor,
          strokeOpacity: 1.0,
          strokeWeight: 6,
          map: map.current,
        });
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(originCoords);
        bounds.extend(destinationCoords);
        map.current.fitBounds(bounds);
      }
    });
  };

  if (isLoading) {
    return (
      <div className={`${className} bg-muted rounded-lg flex items-center justify-center`}>
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading Google Maps...</p>
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
            {error === 'Google Maps API key not configured' 
              ? 'Map visualization will appear here when Google Maps is configured' 
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
          {showAlternateRoute && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full border border-green-700" style={{ borderStyle: 'dashed' }}></div>
              <span className="text-green-600 font-medium">Safer Route</span>
            </div>
          )}
          {riskScore > 66 && !showAlternateRoute && (
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
          {showAlternateRoute && (
            <div className="mt-1 text-green-600 font-medium">
              ✅ Safer Route Active
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleMap;