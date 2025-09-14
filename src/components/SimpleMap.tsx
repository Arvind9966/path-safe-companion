import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface SimpleMapProps {
  origin?: string;
  destination?: string;
  riskScore?: number;
  showAlternateRoute?: boolean;
  className?: string;
}

const SimpleMap = ({ 
  origin, 
  destination, 
  riskScore = 50,
  showAlternateRoute = false,
  className = "w-full h-96" 
}: SimpleMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map only once
    if (!map.current) {
      console.log('Initializing Leaflet map...');
      
      // Mumbai coordinates (Bandra to Andheri)
      const originCoords: [number, number] = [19.0596, 72.8297]; // Bandra
      const destinationCoords: [number, number] = [19.1136, 72.8697]; // Andheri
      
      map.current = L.map(mapContainer.current).setView(originCoords, 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map.current);
      
      console.log('Map initialized successfully');
    }

    // Clear existing layers (except the base tile layer)
    map.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
        map.current!.removeLayer(layer);
      }
    });

    // Mumbai coordinates
    const originCoords: [number, number] = [19.0596, 72.8297]; // Bandra
    const destinationCoords: [number, number] = [19.1136, 72.8697]; // Andheri

    // Add origin marker (blue)
    L.circleMarker(originCoords, { 
      radius: 10, 
      color: '#2563eb', 
      fillColor: '#3b82f6', 
      fillOpacity: 1,
      weight: 3
    }).addTo(map.current)
      .bindPopup(`<div class="p-2"><b>Origin</b><br/>${origin || 'College Campus, Bandra'}</div>`);

    // Add destination marker (green)
    L.circleMarker(destinationCoords, { 
      radius: 10, 
      color: '#059669', 
      fillColor: '#10b981', 
      fillOpacity: 1,
      weight: 3
    }).addTo(map.current)
      .bindPopup(`<div class="p-2"><b>Destination</b><br/>${destination || 'Home, Andheri West'}</div>`);

    // Original route (main route)
    const originalRouteCoords: [number, number][] = [
      originCoords,
      [19.0750, 72.8350], // Via Link Road (risky area)
      [19.0900, 72.8500], 
      [19.1000, 72.8600],
      destinationCoords
    ];

    const routeColor = riskScore > 66 ? '#ef4444' : riskScore > 33 ? '#f59e0b' : '#10b981';
    
    L.polyline(originalRouteCoords, { 
      color: routeColor, 
      weight: showAlternateRoute ? 4 : 6, 
      opacity: showAlternateRoute ? 0.5 : 0.9,
      dashArray: showAlternateRoute ? '5, 10' : undefined
    }).addTo(map.current)
      .bindPopup(`<div class="p-2"><b>Original Route</b><br/>Risk Level: ${riskScore}</div>`);

    // Add risk indicator for high-risk areas on original route
    if (riskScore > 66 && !showAlternateRoute) {
      const riskPoint: [number, number] = [19.0750, 72.8350];
      L.circleMarker(riskPoint, { 
        radius: 8, 
        color: '#dc2626', 
        fillColor: '#ef4444', 
        fillOpacity: 0.8,
        weight: 2
      }).addTo(map.current)
        .bindPopup(`<div class="p-2"><b>⚠️ High Risk Area</b><br/>Poor lighting, low foot traffic</div>`);
    }

    // Alternate (safer) route - only show when requested
    if (showAlternateRoute) {
      console.log('Adding alternate route...');
      
      const alternateRouteCoords: [number, number][] = [
        originCoords,
        [19.0650, 72.8400], // Via SV Road (main road)
        [19.0800, 72.8480], // Via Highway
        [19.0950, 72.8580], // Via well-lit areas
        [19.1080, 72.8650], // Near police station
        destinationCoords
      ];

      // Safer route in green with thicker line
      L.polyline(alternateRouteCoords, { 
        color: '#10b981', 
        weight: 8, 
        opacity: 1.0,
        dashArray: '15, 10' // Dashed to distinguish from original
      }).addTo(map.current)
        .bindPopup(`<div class="p-2"><b>✅ Safer Route</b><br/>Via main roads with better lighting</div>`);

      // Add safety indicators along alternate route
      const safetyPoints: Array<[number, number, string, string]> = [
        [19.0650, 72.8400, '🛣️ Main Road', 'Well-lit SV Road with regular traffic'],
        [19.0800, 72.8480, '📹 CCTV Area', 'Highway with security cameras'],
        [19.0950, 72.8580, '🏪 Commercial Area', 'Shops and businesses open late'],
        [19.1080, 72.8650, '🚓 Police Station', 'Police chowki nearby']
      ];

      safetyPoints.forEach(([lat, lng, icon, description]) => {
        L.circleMarker([lat, lng], { 
          radius: 6, 
          color: '#059669', 
          fillColor: '#10b981', 
          fillOpacity: 1,
          weight: 2
        }).addTo(map.current!)
          .bindPopup(`<div class="p-2"><b>${icon}</b><br/>${description}</div>`);
      });
    }

    // Fit map to show all routes
    const allCoords = showAlternateRoute 
      ? [...originalRouteCoords, [19.0650, 72.8400], [19.1080, 72.8650]]
      : originalRouteCoords;
    
    const bounds = L.latLngBounds(allCoords as [number, number][]);
    map.current.fitBounds(bounds, { padding: [20, 20] });

    console.log('Map updated with routes. Show alternate:', showAlternateRoute);

    // Cleanup function
    return () => {
      // Don't destroy the map, just clear layers when component unmounts
    };
  }, [origin, destination, riskScore, showAlternateRoute]);

  return (
    <div className={`${className} relative rounded-lg overflow-hidden shadow-lg bg-gray-100`}>
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map overlay controls */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Start</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>End</span>
          </div>
          {showAlternateRoute && (
            <div className="flex items-center space-x-1">
              <div className="w-4 h-1 bg-green-500" style={{ borderRadius: '1px' }}></div>
              <span className="text-green-600 font-medium">Safer Route</span>
            </div>
          )}
          {riskScore > 66 && !showAlternateRoute && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-red-600">Risk Area</span>
            </div>
          )}
        </div>
      </div>

      {/* Risk level indicator */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
        <div className="text-xs font-medium">
          <div>
            Risk Level: <span className={`${riskScore > 66 ? 'text-red-600' : riskScore > 33 ? 'text-yellow-600' : 'text-green-600'}`}>
              {riskScore > 66 ? 'High' : riskScore > 33 ? 'Medium' : 'Low'} ({riskScore})
            </span>
          </div>
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

export default SimpleMap;