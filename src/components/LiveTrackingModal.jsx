import React, { useState, useEffect, useRef } from 'react';
import LiveTripMap from './LiveTripMap';
import { startDriverTracking, pollPassengerLocation } from '../utils/locationService';
import {
  Navigation,
  X,
  Play,
  Square,
  AlertCircle,
  Clock,
  Radio,
  RefreshCw,
  ShieldCheck,
  User,
  Car,
} from 'lucide-react';

export default function LiveTrackingModal({
  ride,
  currentUser,
  isDriver = false,
  onClose,
}) {
  const [activeRole, setActiveRole] = useState(isDriver ? 'driver' : 'passenger');
  const [isTripActive, setIsTripActive] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [error, setError] = useState('');
  const [sharingEndedMessage, setSharingEndedMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const cleanupRef = useRef(null);

  // Clean up tracking/polling on component unmount or role switch
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  // Passenger Auto-Polling Setup
  useEffect(() => {
    if (activeRole === 'passenger') {
      // Clear any prior driver tracking
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      const passengerId = currentUser?.id || 'guest';

      // 1. Ensure passenger is authorized in backend
      fetch('/api/location/authorize-passenger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rideId: ride.id,
          passengerId,
          driverId: ride.driverId || 'unassigned',
        }),
      }).catch((err) => console.warn('Passenger authorization call error:', err));

      // 2. Start 5-second polling
      const stopPolling = pollPassengerLocation({
        rideId: ride.id,
        userId: passengerId,
        onLocationReceived: (data) => {
          setLocationData(data);
          setLastUpdated(new Date());
          setSharingEndedMessage('');
          setError('');
        },
        onSharingEnded: (msg) => {
          setSharingEndedMessage(msg || 'Location sharing has ended.');
          setLocationData(null);
        },
        onError: (err) => {
          setError(err);
        },
      });

      cleanupRef.current = stopPolling;

      return () => {
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
      };
    }
  }, [activeRole, ride.id, ride.driverId, currentUser?.id]);

  // Driver: Start Trip & Location Sharing
  const handleStartTrip = () => {
    setError('');
    setSharingEndedMessage('');
    setIsTripActive(true);

    const stopTracking = startDriverTracking({
      rideId: ride.id,
      driverUser: currentUser,
      passengerIds: ride.passengerIds || [],
      onUpdate: (coords) => {
        setLocationData(coords);
        setLastUpdated(new Date());
        setError('');
      },
      onError: (errMsg) => {
        setError(errMsg);
      },
    });

    cleanupRef.current = stopTracking;
  };

  // Driver: Stop Trip
  const handleStopTrip = () => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    setIsTripActive(false);
    setLocationData(null);
    setSharingEndedMessage('You have stopped sharing live location for this trip.');
  };

  const handleSwitchRole = (role) => {
    if (role === activeRole) return;
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    setIsTripActive(false);
    setLocationData(null);
    setError('');
    setSharingEndedMessage('');
    setActiveRole(role);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  {activeRole === 'driver' ? 'Driver Trip Console' : 'Passenger Live Tracking'}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  5s GPS Polling
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {ride.origin} → {ride.destination} (Ride ID: {ride.id})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Quick Testing Role Switcher */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleSwitchRole('driver')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  activeRole === 'driver'
                    ? 'bg-white text-emerald-950 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Driver view"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Driver</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchRole('passenger')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  activeRole === 'passenger'
                    ? 'bg-white text-emerald-950 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Passenger view"
              >
                <User className="w-3.5 h-3.5" />
                <span>Passenger</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Location Error:</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* 1. DRIVER VIEW */}
          {activeRole === 'driver' && (
            <div className="space-y-4">
              {!isTripActive && !locationData ? (
                /* Driver Start Trip Initial State */
                <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
                    <Navigation className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      Ready to Start this Shared Trip?
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1">
                      Click below to request browser GPS location and broadcast live coordinates to your confirmed co-passengers every 5 seconds.
                    </p>
                  </div>

                  {sharingEndedMessage && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                      {sharingEndedMessage}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleStartTrip}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Start Trip & Share Live Location</span>
                  </button>
                </div>
              ) : (
                /* Driver Live Active Trip View */
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 p-3.5 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                      <div>
                        <span className="text-xs font-bold text-emerald-950 block">
                          Broadcasting GPS Location
                        </span>
                        <span className="text-[11px] text-emerald-800">
                          {lastUpdated ? `Last broadcast: ${lastUpdated.toLocaleTimeString()}` : 'Connecting GPS...'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleStopTrip}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>Stop Trip</span>
                    </button>
                  </div>

                  {locationData && (
                    <LiveTripMap
                      latitude={locationData.latitude}
                      longitude={locationData.longitude}
                      accuracy={locationData.accuracy}
                      speed={locationData.speed}
                      heading={locationData.heading}
                      driverName={currentUser?.name || ride.driverName}
                      isSharing={true}
                      isDriver={true}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* 2. PASSENGER VIEW */}
          {activeRole === 'passenger' && (
            <div className="space-y-4">
              {sharingEndedMessage ? (
                /* When trip sharing ends */
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">
                    Location Sharing Inactive
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {sharingEndedMessage}
                  </p>
                </div>
              ) : !locationData ? (
                /* Waiting for Driver to Start */
                <div className="p-8 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto animate-pulse">
                    <Radio className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    Waiting for Driver GPS Signal...
                  </h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Driver {ride.driverName} has not started the trip yet. When the driver starts the journey, live coordinates will appear here automatically every 5 seconds.
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-white px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Polling backend every 5s</span>
                  </div>
                </div>
              ) : (
                /* Passenger Live Tracking Map */
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-slate-800">
                        Tracking {locationData.driverName || ride.driverName}'s Cab
                      </span>
                    </div>

                    <span className="text-slate-500 text-[11px]">
                      {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Live'}
                    </span>
                  </div>

                  <LiveTripMap
                    latitude={locationData.latitude}
                    longitude={locationData.longitude}
                    accuracy={locationData.accuracy}
                    speed={locationData.speed}
                    heading={locationData.heading}
                    driverName={locationData.driverName || ride.driverName}
                    isSharing={true}
                    isDriver={false}
                  />
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Authorized passengers & driver only</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
