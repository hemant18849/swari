import React, { useEffect, useRef, useState } from 'react';
import { Navigation, ExternalLink } from 'lucide-react';

export default function LiveTripMap({
  latitude,
  longitude,
  driverName = 'Driver',
  accuracy = 0,
  speed = 0,
  heading = 0,
  isSharing = true,
  isDriver = false,
}) {
  const mapRef = useRef(null);
  const googleMapInstance = useRef(null);
  const markerInstance = useRef(null);
  const [mapsLoaded, setMapsLoaded] = useState(() =>
    Boolean(typeof window !== 'undefined' && window.google && window.google.maps)
  );
  const [mapError, setMapError] = useState(false);

  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Load Google Maps JavaScript API
  useEffect(() => {
    if (typeof window === 'undefined' || (window.google && window.google.maps)) {
      return;
    }

    if (!googleApiKey) {
      // If no API key is provided, visual GPS radar map handles display
      return;
    }

    const scriptId = 'sawari-google-maps-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapsLoaded(true);
      script.onerror = () => setMapError(true);
      document.head.appendChild(script);
    }
  }, [googleApiKey]);

  // Initialize or update Google Map
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || !window.google || !window.google.maps) {
      return;
    }

    if (!latitude || !longitude) return;

    const latLng = { lat: Number(latitude), lng: Number(longitude) };

    if (!googleMapInstance.current) {
      googleMapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: latLng,
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      markerInstance.current = new window.google.maps.Marker({
        position: latLng,
        map: googleMapInstance.current,
        title: `${driverName}'s Cab`,
        animation: window.google.maps.Animation.DROP,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="padding: 4px; font-weight: bold; font-family: sans-serif; font-size: 13px;">
          🚖 ${driverName}'s Live Cab<br/>
          <span style="font-size: 11px; color: #16a34a;">GPS Active</span>
        </div>`,
      });

      markerInstance.current.addListener('click', () => {
        infoWindow.open(googleMapInstance.current, markerInstance.current);
      });
    } else {
      // Pan to updated coordinates
      googleMapInstance.current.panTo(latLng);
      if (markerInstance.current) {
        markerInstance.current.setPosition(latLng);
      }
    }
  }, [mapsLoaded, latitude, longitude, driverName]);

  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className="space-y-3">
      {/* Map Container */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100">
        
        {/* If Google Maps script is active */}
        {mapsLoaded && !mapError && googleApiKey ? (
          <div ref={mapRef} className="w-full h-full" />
        ) : (
          /* Interactive High-Res Visual GPS Map View */
          <div className="w-full h-full relative flex flex-col items-center justify-center p-4 overflow-hidden bg-slate-900 text-white">
            {/* Ambient grid lines */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #10b981 1px, transparent 1px), linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Radar scan ring */}
            <div className="absolute w-64 h-64 rounded-full border border-emerald-500/30 animate-ping opacity-25 pointer-events-none" />
            <div className="absolute w-44 h-44 rounded-full border border-emerald-400/40 pointer-events-none" />
            <div className="absolute w-24 h-24 rounded-full border border-emerald-300/60 pointer-events-none" />

            {/* Center vehicle pin with heading orientation */}
            <div className="relative z-10 flex flex-col items-center space-y-1.5 animate-bounce duration-1000">
              <div
                className="w-12 h-12 rounded-2xl bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-lg shadow-emerald-500/50"
                style={{ transform: `rotate(${heading || -45}deg)` }}
              >
                <Navigation className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 shadow-xs">
                {driverName}'s Cab
              </span>
            </div>

            {/* Floating Live Badge */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 font-bold">Live GPS Tracking</span>
            </div>

            {/* Google Maps link button */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-900 text-xs font-bold transition shadow-md"
            >
              <span>View in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Live Trip Sharing Badge */}
        {isSharing && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-md">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>{isDriver ? 'Sharing Location' : 'Live from Driver'}</span>
          </div>
        )}
      </div>

      {/* GPS Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
          <span className="text-slate-400 block font-medium">Latitude</span>
          <span className="font-mono font-bold text-slate-800 text-xs">
            {Number(latitude).toFixed(5)}° N
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
          <span className="text-slate-400 block font-medium">Longitude</span>
          <span className="font-mono font-bold text-slate-800 text-xs">
            {Number(longitude).toFixed(5)}° E
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
            {speed ? `${Math.round(speed * 3.6)} km/h` : 'En Route / Active'}
          </span>
        </div>
      </div>
    </div>
  );
}
