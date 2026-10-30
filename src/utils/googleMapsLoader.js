import { Loader } from '@googlemaps/js-api-loader';

let loaderInstance = null;
let mapsPromise = null;
let authFailed = false;

// Listen for Google Maps Authentication failure
if (typeof window !== 'undefined') {
  const originalAuthFailure = window.gm_authFailure;
  window.gm_authFailure = () => {
    authFailed = true;
    if (typeof originalAuthFailure === 'function') {
      originalAuthFailure();
    }
    window.dispatchEvent(new CustomEvent('sawari_maps_auth_failure'));
  };
}

/**
 * Get Google Maps API key from Vite environment
 */
export function getGoogleMapsApiKey() {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key || typeof key !== 'string') return '';
  return key.trim();
}

/**
 * Check if a valid-looking API key is present
 */
export function isGoogleMapsKeyAvailable() {
  const key = getGoogleMapsApiKey();
  return Boolean(
    key &&
      key.length > 5 &&
      !key.includes('your_') &&
      !key.includes('YOUR_') &&
      !key.includes('placeholder')
  );
}

/**
 * Check if Google Maps failed authentication
 */
export function hasGoogleMapsAuthFailed() {
  return authFailed;
}

/**
 * Asynchronously load the Google Maps JavaScript API
 */
export function loadGoogleMaps() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is not available'));
  }

  // Already loaded
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey || !isGoogleMapsKeyAvailable()) {
    return Promise.reject(
      new Error(
        'VITE_GOOGLE_MAPS_API_KEY is missing or invalid. Please configure it in your .env file.'
      )
    );
  }

  if (mapsPromise) {
    return mapsPromise;
  }

  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });
  }

  mapsPromise = loaderInstance
    .load()
    .then(() => {
      return window.google.maps;
    })
    .catch((err) => {
      mapsPromise = null;
      throw err;
    });

  return mapsPromise;
}

/**
 * Reverse geocode latitude and longitude to a human-readable address
 */
export async function reverseGeocode(lat, lng) {
  try {
    const maps = await loadGoogleMaps();
    const geocoder = new maps.Geocoder();
    const response = await geocoder.geocode({
      location: { lat: Number(lat), lng: Number(lng) },
    });

    if (response.results && response.results.length > 0) {
      return {
        formattedAddress: response.results[0].formatted_address,
        placeId: response.results[0].place_id,
        addressComponents: response.results[0].address_components,
      };
    }
    return {
      formattedAddress: `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`,
    };
  } catch (err) {
    console.warn('Reverse geocoding error:', err);
    return {
      formattedAddress: `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`,
    };
  }
}

/**
 * Geocode an address string to latitude and longitude
 */
export async function geocodeAddress(address) {
  if (!address || !address.trim()) return null;

  try {
    const maps = await loadGoogleMaps();
    const geocoder = new maps.Geocoder();
    const response = await geocoder.geocode({ address: address.trim() });

    if (response.results && response.results.length > 0) {
      const loc = response.results[0].geometry.location;
      return {
        lat: loc.lat(),
        lng: loc.lng(),
        formattedAddress: response.results[0].formatted_address,
      };
    }
    return null;
  } catch (err) {
    console.warn('Geocoding error for address:', address, err);
    return null;
  }
}
