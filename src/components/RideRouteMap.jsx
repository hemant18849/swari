import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  BHOPAL_CENTER,
  geocodeLocation,
  reverseGeocodeLocation,
  calculateRoute,
} from '../utils/mapService';
import {
  Car,
  Clock,
  Compass,
  Check,
} from 'lucide-react';

// Custom Leaflet DivIcons matching SAWARI branding
const createPinIcon = (letter, colorHex) => {
  return L.divIcon({
    className: 'custom-sawari-marker',
    html: `
      <div style="
        background-color: ${colorHex};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      ">
        <span style="
          transform: rotate(45deg);
          color: #ffffff;
          font-weight: 800;
          font-family: sans-serif;
          font-size: 13px;
        ">${letter}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export default function RideRouteMap({
  origin = '',
  destination = '',
  originCoords = null,
  destinationCoords = null,
  interactive = false,
  onLocationSelect = null,
  onRouteCalculated = null,
  heightClass = 'h-72 sm:h-80 md:h-96',
  className = '',
  title = 'Interactive Route Map',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const originMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  const [activeSelectionMode, setActiveSelectionMode] = useState('origin'); // 'origin' | 'destination'
  const [routeInfo, setRouteInfo] = useState(null);

  const [geocodedOrigin, setGeocodedOrigin] = useState(null);
  const [geocodedDest, setGeocodedDest] = useState(null);

  const activeOriginCoords = originCoords || geocodedOrigin;
  const activeDestCoords = destinationCoords || geocodedDest;

  const selectionModeRef = useRef(activeSelectionMode);
  const onLocationSelectRef = useRef(onLocationSelect);
  const onRouteCalculatedRef = useRef(onRouteCalculated);

  // Handle marker drag or map click
  const handlePointChange = useCallback(async (type, lat, lng) => {
    const geo = await reverseGeocodeLocation(lat, lng);
    if (type === 'origin') {
      setGeocodedOrigin({ lat, lng });
    } else {
      setGeocodedDest({ lat, lng });
    }

    if (onLocationSelectRef.current) {
      onLocationSelectRef.current({
        type,
        lat,
        lng,
        address: geo.name || geo.address,
      });
    }
  }, []);

  const handlePointChangeRef = useRef(handlePointChange);

  // Sync refs in effect
  useEffect(() => {
    selectionModeRef.current = activeSelectionMode;
    onLocationSelectRef.current = onLocationSelect;
    onRouteCalculatedRef.current = onRouteCalculated;
    handlePointChangeRef.current = handlePointChange;
  });

  // Asynchronously resolve Origin coordinates if not passed via props
  useEffect(() => {
    let isCurrent = true;
    if (!originCoords && origin && typeof origin === 'string' && origin.trim()) {
      geocodeLocation(origin).then((geo) => {
        if (isCurrent && geo) {
          setGeocodedOrigin({ lat: geo.lat, lng: geo.lng });
        }
      });
    }
    return () => {
      isCurrent = false;
    };
  }, [origin, originCoords]);

  // Asynchronously resolve Destination coordinates if not passed via props
  useEffect(() => {
    let isCurrent = true;
    if (!destinationCoords && destination && typeof destination === 'string' && destination.trim()) {
      geocodeLocation(destination).then((geo) => {
        if (isCurrent && geo) {
          setGeocodedDest({ lat: geo.lat, lng: geo.lng });
        }
      });
    }
    return () => {
      isCurrent = false;
    };
  }, [destination, destinationCoords]);

  // Initialize Leaflet Map (Runs once on mount)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [BHOPAL_CENTER.lat, BHOPAL_CENTER.lng],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      const handleResize = () => map.invalidateSize();
      window.addEventListener('resize', handleResize);

      // Interactive Map Click
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        handlePointChangeRef.current(selectionModeRef.current, lat, lng);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    let isCurrent = true;
    const pointsToFit = [];

    // 1. Origin Marker
    if (activeOriginCoords) {
      pointsToFit.push([activeOriginCoords.lat, activeOriginCoords.lng]);
      if (!originMarkerRef.current) {
        const marker = L.marker([activeOriginCoords.lat, activeOriginCoords.lng], {
          icon: createPinIcon('A', '#059669'), // Emerald
          draggable: interactive,
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <strong style="color: #059669; text-transform: uppercase; font-size: 11px;">Origin (Pickup)</strong><br/>
            <span>${origin || 'Pickup Location'}</span>
          </div>
        `);

        if (interactive) {
          marker.on('dragend', (e) => {
            const { lat, lng } = e.target.getLatLng();
            handlePointChangeRef.current('origin', lat, lng);
          });
        }

        originMarkerRef.current = marker;
      } else {
        originMarkerRef.current.setLatLng([activeOriginCoords.lat, activeOriginCoords.lng]);
        originMarkerRef.current.getPopup().setContent(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <strong style="color: #059669; text-transform: uppercase; font-size: 11px;">Origin (Pickup)</strong><br/>
            <span>${origin || 'Pickup Location'}</span>
          </div>
        `);
      }
    } else if (originMarkerRef.current) {
      map.removeLayer(originMarkerRef.current);
      originMarkerRef.current = null;
    }

    // 2. Destination Marker
    if (activeDestCoords) {
      pointsToFit.push([activeDestCoords.lat, activeDestCoords.lng]);
      if (!destMarkerRef.current) {
        const marker = L.marker([activeDestCoords.lat, activeDestCoords.lng], {
          icon: createPinIcon('B', '#e11d48'), // Rose
          draggable: interactive,
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <strong style="color: #e11d48; text-transform: uppercase; font-size: 11px;">Destination (Drop)</strong><br/>
            <span>${destination || 'Drop Spot'}</span>
          </div>
        `);

        if (interactive) {
          marker.on('dragend', (e) => {
            const { lat, lng } = e.target.getLatLng();
            handlePointChangeRef.current('destination', lat, lng);
          });
        }

        destMarkerRef.current = marker;
      } else {
        destMarkerRef.current.setLatLng([activeDestCoords.lat, activeDestCoords.lng]);
        destMarkerRef.current.getPopup().setContent(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <strong style="color: #e11d48; text-transform: uppercase; font-size: 11px;">Destination (Drop)</strong><br/>
            <span>${destination || 'Drop Spot'}</span>
          </div>
        `);
      }
    } else if (destMarkerRef.current) {
      map.removeLayer(destMarkerRef.current);
      destMarkerRef.current = null;
    }

    // 3. Route Calculation (OSRM Driving Route)
    if (activeOriginCoords && activeDestCoords) {
      calculateRoute(activeOriginCoords, activeDestCoords).then((route) => {
        if (!isCurrent || !route) return;

        setRouteInfo(route);
        if (onRouteCalculatedRef.current) {
          onRouteCalculatedRef.current(route);
        }

        // Draw polyline
        if (polylineRef.current) {
          map.removeLayer(polylineRef.current);
        }

        const polyline = L.polyline(route.coordinates, {
          color: '#059669', // Emerald
          weight: 5,
          opacity: 0.85,
          lineJoin: 'round',
        }).addTo(map);

        polylineRef.current = polyline;

        // Fit map bounds to show full route
        map.fitBounds(polyline.getBounds(), {
          padding: [50, 50],
          maxZoom: 16,
        });
      });
    } else {
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }
      // Fit bounds to markers if 1 or 2 exist
      if (pointsToFit.length === 1) {
        map.setView(pointsToFit[0], 14);
      } else if (pointsToFit.length > 1) {
        map.fitBounds(L.latLngBounds(pointsToFit), { padding: [50, 50] });
      }
    }

    return () => {
      isCurrent = false;
    };
  }, [activeOriginCoords, activeDestCoords, origin, destination, interactive]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-md bg-slate-100 flex flex-col ${className}`}>
      
      {/* Header Bar */}
      <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {title}
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
            Working Map
          </span>
        </div>

        {/* Interactive Selection Mode Toggles */}
        {interactive && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">
              Click map to set:
            </span>
            <button
              type="button"
              onClick={() => setActiveSelectionMode('origin')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSelectionMode === 'origin'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>Origin (A)</span>
              {activeSelectionMode === 'origin' && <Check className="w-3 h-3" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveSelectionMode('destination')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSelectionMode === 'destination'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>Destination (B)</span>
              {activeSelectionMode === 'destination' && <Check className="w-3 h-3" />}
            </button>
          </div>
        )}
      </div>

      {/* Map Canvas */}
      <div className={`relative w-full ${heightClass}`}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Route Info Overlay */}
        {routeInfo && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-500 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200 shadow-lg text-xs flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Driving Distance
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {routeInfo.distanceText}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Est. Travel Time
                </span>
                <span className="font-extrabold text-emerald-700 text-sm">
                  {routeInfo.durationText}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Footer */}
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200/80 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-semibold text-emerald-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            A: {origin || 'Origin'}
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 font-semibold text-rose-800">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
            B: {destination || 'Destination'}
          </span>
        </div>

        {interactive && (
          <span className="text-slate-500 italic hidden sm:inline">
            Click anywhere or drag pins to pick pickup / drop
          </span>
        )}
      </div>

    </div>
  );
}
