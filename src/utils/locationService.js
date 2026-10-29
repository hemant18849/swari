/**
 * Location Tracking Service for SAWARI
 * Uses Browser Geolocation API and 5-second polling (No Socket.IO)
 */

/**
 * Start tracking driver location and sending updates to backend
 */
export function startDriverTracking({
  rideId,
  driverUser,
  passengerIds = [],
  onUpdate,
  onError,
}) {
  if (!navigator.geolocation) {
    if (onError) onError('Geolocation is not supported by your browser.');
    return () => {};
  }

  let isTracking = true;
  let intervalId = null;

  const sendLocationUpdate = (position) => {
    if (!isTracking) return;

    const { latitude, longitude, accuracy, speed, heading } = position.coords;

    const payload = {
      rideId,
      userId: driverUser.id,
      driverName: driverUser.name,
      passengerIds,
      latitude,
      longitude,
      accuracy,
      speed: speed !== null ? speed : 0,
      heading: heading !== null ? heading : 0,
      isSharing: true,
    };

    fetch('/api/location/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error || 'Failed to update location');
          });
        }
        return res.json();
      })
      .then((data) => {
        if (onUpdate && isTracking) {
          onUpdate({
            latitude,
            longitude,
            accuracy,
            speed,
            heading,
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        }
      })
      .catch((err) => {
        console.error('Network error updating location:', err);
        if (onError && isTracking) {
          onError(`Network error: ${err.message}`);
        }
      });
  };

  const handleGeoError = (err) => {
    let message = 'Unable to retrieve location.';
    switch (err.code) {
      case err.PERMISSION_DENIED:
        message = 'Location permission denied. Please allow location access in your browser.';
        break;
      case err.POSITION_UNAVAILABLE:
        message = 'GPS location is currently unavailable on your device.';
        break;
      case err.TIMEOUT:
        message = 'Location request timed out. Retrying...';
        break;
      default:
        message = err.message || 'Location error occurred.';
    }
    if (onError && isTracking) onError(message);
  };

  const geoOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  };

  // Immediate initial request to prompt permission
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      sendLocationUpdate(pos);
      // Poll every 5 seconds as per requirements
      intervalId = setInterval(() => {
        if (!isTracking) return;
        navigator.geolocation.getCurrentPosition(sendLocationUpdate, handleGeoError, geoOptions);
      }, 5000);
    },
    handleGeoError,
    geoOptions
  );

  // Stop trip tracking cleanup function
  const stop = () => {
    isTracking = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    // Notify backend that driver stopped sharing
    fetch('/api/location/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rideId,
        userId: driverUser.id,
      }),
    }).catch((err) => console.error('Error stopping location on backend:', err));
  };

  return stop;
}

/**
 * Passenger polling service for driver location
 * Polls backend every 5 seconds (No Socket.IO)
 */
export function pollPassengerLocation({
  rideId,
  userId,
  onLocationReceived,
  onSharingEnded,
  onError,
}) {
  let isPolling = true;
  let intervalId = null;

  const fetchLocation = () => {
    if (!isPolling) return;

    fetch(`/api/location/${encodeURIComponent(rideId)}?userId=${encodeURIComponent(userId)}`)
      .then((res) => {
        if (res.status === 403) {
          throw new Error('Unauthorized: You are not authorized to view this cab location.');
        }
        if (res.status === 404) {
          return { isSharing: false, notStarted: true };
        }
        if (!res.ok) {
          throw new Error(`Server returned error: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!isPolling) return;

        if (data.isSharing === false) {
          if (onSharingEnded) onSharingEnded(data.message || 'Location sharing has ended.');
        } else {
          if (onLocationReceived) onLocationReceived(data);
        }
      })
      .catch((err) => {
        if (!isPolling) return;
        console.error('Passenger polling error:', err);
        if (onError) onError(err.message);
      });
  };

  // Initial fetch
  fetchLocation();

  // 5-second polling interval
  intervalId = setInterval(fetchLocation, 5000);

  const stop = () => {
    isPolling = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  return stop;
}
