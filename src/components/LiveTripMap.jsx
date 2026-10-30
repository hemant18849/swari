import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { isGoogleMapsKeyAvailable, loadGoogleMaps } from '../utils/googleMapsLoader';

const createCabDivIcon = () => {
  return L.divIcon({
    className: 'custom-cab-marker',
    html: `
      <div style="
        background-color: #059669;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid #ffffff;
        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
        font-size: 18px;
      ">
        🚖
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
};

export default function LiveTripMap({
  latitude,
  longitude,
  driverName = 'Driver',
  accuracy = 0,
  speed = 0,
  heading: _heading = 0,
  isSharing = true,
  isDriver = false,
}) {
  const mapContainerRef = useRef(null);

  // Google Maps refs
  const googleMapRef = useRef(null);
  const googleMarkerRef = useRef(null);

  // Leaflet refs
  const leafletMapRef = useRef(null);
  const leafletMarkerRef = useRef(null);
  const leafletCircleRef = useRef(null);

  const [mapType, setMapType] = useState('none'); // 'google' | 'leaflet' | 'none'
  const hasGoogleKey = isGoogleMapsKeyAvailable();

  const initialCoordsRef = useRef({
    lat: latitude ? Number(latitude) : 23.2599,
    lng: longitude ? Number(longitude) : 77.4126,
    driverName,
  });

  // Initialize Map: Try Google Maps if key available, else Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;
    const initialLat = initialCoordsRef.current.lat;
    const initialLng = initialCoordsRef.current.lng;
    const name = initialCoordsRef.current.driverName;

    if (hasGoogleKey) {
      loadGoogleMaps()
        .then((maps) => {
          if (!isMounted || !mapContainerRef.current) return;

          const gMap = new maps.Map(mapContainerRef.current, {
            center: { lat: initialLat, lng: initialLng },
            zoom: 16,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          });

          const gMarker = new maps.Marker({
            position: { lat: initialLat, lng: initialLng },
            map: gMap,
            title: `${name}'s Live Cab`,
            animation: maps.Animation.DROP,
          });

          const infoWindow = new maps.InfoWindow({
            content: `
              <div style="padding: 4px; font-family: sans-serif; font-size: 12px; font-weight: bold;">
                🚖 ${name}'s Live Cab<br/>
                <span style="color: #059669; font-size: 11px;">GPS Live Broadcasting</span>
              </div>
            `,
          });
          gMarker.addListener('click', () => infoWindow.open(gMap, gMarker));

          googleMapRef.current = gMap;
          googleMarkerRef.current = gMarker;
          setMapType('google');
        })
        .catch(() => {
          // Fallback to Leaflet if Google Maps loading fails
          if (isMounted) initLeaflet(initialLat, initialLng, name);
        });
    } else {
      initLeaflet(initialLat, initialLng, name);
    }

    function initLeaflet(lat, lng, nameStr) {
      if (!mapContainerRef.current || leafletMapRef.current) return;

      const lMap = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(lMap);

      const lMarker = L.marker([lat, lng], {
        icon: createCabDivIcon(),
      }).addTo(lMap);

      lMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px;">
          <strong>🚖 ${nameStr}'s Live Cab</strong><br/>
          <span style="color: #059669; font-weight: bold;">GPS Active</span>
        </div>
      `);

      leafletMapRef.current = lMap;
      leafletMarkerRef.current = lMarker;
      setMapType('leaflet');

      const handleResize = () => lMap.invalidateSize();
      window.addEventListener('resize', handleResize);
    }

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [hasGoogleKey]);

  // Update Coordinates
  useEffect(() => {
    if (!latitude || !longitude) return;

    const lat = Number(latitude);
    const lng = Number(longitude);

    // Update Google Maps
    if (mapType === 'google' && googleMapRef.current && googleMarkerRef.current) {
      const latLng = { lat, lng };
      googleMapRef.current.panTo(latLng);
      googleMarkerRef.current.setPosition(latLng);
    }

    // Update Leaflet Map
    if (mapType === 'leaflet' && leafletMapRef.current && leafletMarkerRef.current) {
      leafletMarkerRef.current.setLatLng([lat, lng]);

      if (accuracy && accuracy > 0) {
        if (!leafletCircleRef.current) {
          leafletCircleRef.current = L.circle([lat, lng], {
            radius: Math.min(accuracy, 100),
            color: '#059669',
            fillColor: '#10b981',
            fillOpacity: 0.15,
            weight: 1,
          }).addTo(leafletMapRef.current);
        } else {
          leafletCircleRef.current.setLatLng([lat, lng]);
          leafletCircleRef.current.setRadius(Math.min(accuracy, 100));
        }
      }

      leafletMapRef.current.panTo([lat, lng], { animate: true });
    }
  }, [latitude, longitude, mapType, accuracy]);

  return (
    <div className="space-y-3">
      {/* Map Container */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Live Trip Sharing Badge */}
        {isSharing && (
          <div className="absolute top-3 right-3 z-500 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-md">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>{isDriver ? 'Sharing Location' : 'Live from Driver'}</span>
          </div>
        )}

        {/* Map Engine Badge */}
        <div className="absolute bottom-3 left-3 z-500 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs border border-slate-200 text-[10px] font-mono font-bold text-slate-700 shadow-xs">
          {mapType === 'google' ? 'Google Maps GPS' : 'Live GPS Map'}
        </div>
      </div>

      {/* GPS Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
          <span className="text-slate-400 block font-medium">Latitude</span>
          <span className="font-mono font-bold text-slate-800 text-xs">
            {latitude ? `${Number(latitude).toFixed(5)}° N` : '23.25990° N'}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
          <span className="text-slate-400 block font-medium">Longitude</span>
          <span className="font-mono font-bold text-slate-800 text-xs">
            {longitude ? `${Number(longitude).toFixed(5)}° E` : '77.41260° E'}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
          <span className="text-slate-400 block font-medium">GPS Accuracy</span>
          <span className="font-bold text-slate-800 text-xs">
            ±{Math.round(accuracy || 5)} meters
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
          <span className="text-slate-400 block font-medium">Travel Speed</span>
          <span className="font-bold text-emerald-700 text-xs">
            {speed ? `${Math.round(speed * 3.6)} km/h` : 'Active GPS Signal'}
          </span>
        </div>
      </div>
    </div>
  );
}
