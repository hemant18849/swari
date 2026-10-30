// SAWARI OpenStreetMap & Free Routing Utility (Zero API Key Required)

export const BHOPAL_CENTER = { lat: 23.2599, lng: 77.4126 };

export const KNOWN_LOCATIONS = [
  {
    name: 'Rani Kamlapati',
    address: 'Rani Kamlapati Railway Station (Habibganj), Bhopal',
    lat: 23.2185,
    lng: 77.4398,
  },
  {
    name: 'Lalghati',
    address: 'Lalghati Square / Airport Road, Bhopal',
    lat: 23.2754,
    lng: 77.3673,
  },
  {
    name: 'Bhopal Junction',
    address: 'Bhopal Junction Railway Station (Platform 1 / 6), Old Bhopal',
    lat: 23.2687,
    lng: 77.4116,
  },
  {
    name: 'RGPV College',
    address: 'Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV), Airport Bypass Road',
    lat: 23.3108,
    lng: 77.3615,
  },
  {
    name: 'MANIT Bhopal',
    address: 'Maulana Azad National Institute of Technology (MANIT), Link Road 3',
    lat: 23.2162,
    lng: 77.4069,
  },
  {
    name: 'MP Nagar',
    address: 'Maharana Pratap Nagar (Zone 1 / DB Mall), Bhopal',
    lat: 23.2332,
    lng: 77.4326,
  },
  {
    name: 'AIIMS Bhopal',
    address: 'All India Institute of Medical Sciences (AIIMS), Saket Nagar, Bhopal',
    lat: 23.2078,
    lng: 77.4589,
  },
  {
    name: 'Raja Bhoj Airport',
    address: 'Raja Bhoj Airport (BHO), Gandhi Nagar, Bhopal',
    lat: 23.2874,
    lng: 77.3378,
  },
  {
    name: 'DB City Mall',
    address: 'DB City Mall, Hoshangabad Rd, Arera Hills, Bhopal',
    lat: 23.2323,
    lng: 77.4308,
  },
  {
    name: 'Kolar Road',
    address: 'Kolar Road / Sarvdharm Colony, Bhopal',
    lat: 23.1812,
    lng: 77.4215,
  },
  {
    name: 'New Market',
    address: 'New Market, TT Nagar, Bhopal',
    lat: 23.2367,
    lng: 77.4038,
  },
  {
    name: 'Indore',
    address: 'Indore, Madhya Pradesh',
    lat: 22.7196,
    lng: 75.8577,
  },
  {
    name: 'Ujjain',
    address: 'Ujjain, Madhya Pradesh',
    lat: 23.1765,
    lng: 75.7885,
  },
];

/**
 * Find coordinates for an address query (checking local hubs first, then Nominatim)
 */
export async function geocodeLocation(query) {
  if (!query || typeof query !== 'string' || !query.trim()) return null;
  const qLower = query.trim().toLowerCase();

  // 1. Direct match with known local spots
  const match = KNOWN_LOCATIONS.find(
    (loc) =>
      loc.name.toLowerCase() === qLower ||
      loc.address.toLowerCase().includes(qLower) ||
      qLower.includes(loc.name.toLowerCase())
  );
  if (match) {
    return {
      lat: match.lat,
      lng: match.lng,
      name: match.name,
      address: match.address,
    };
  }

  // 2. Query OpenStreetMap Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query.trim() + (query.toLowerCase().includes('bhopal') ? '' : ' Bhopal')
    )}&limit=1&countrycodes=in`;

    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en' },
    });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        name: query.trim(),
        address: data[0].display_name,
      };
    }
  } catch (err) {
    console.warn('Nominatim geocode failed, using Bhopal center fallback:', err);
  }

  // Fallback to Bhopal center
  return {
    lat: BHOPAL_CENTER.lat,
    lng: BHOPAL_CENTER.lng,
    name: query.trim(),
    address: query.trim(),
  };
}

/**
 * Autocomplete search for location inputs
 */
export async function searchLocations(query) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return KNOWN_LOCATIONS.slice(0, 5).map((l) => ({
      name: l.name,
      address: l.address,
      lat: l.lat,
      lng: l.lng,
    }));
  }

  const qLower = query.trim().toLowerCase();

  // Filter local spots
  const localMatches = KNOWN_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(qLower) ||
      loc.address.toLowerCase().includes(qLower)
  ).map((l) => ({
    name: l.name,
    address: l.address,
    lat: l.lat,
    lng: l.lng,
  }));

  // If query is short, return local matches
  if (query.trim().length < 3) {
    return localMatches;
  }

  // Fetch online suggestions from Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query.trim()
    )}&limit=4&countrycodes=in`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();

    if (Array.isArray(data)) {
      const onlineMatches = data.map((item) => {
        const parts = item.display_name.split(',');
        const shortName = parts[0]?.trim() || item.display_name;
        return {
          name: shortName,
          address: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        };
      });

      // Combine without duplicates
      const combined = [...localMatches];
      for (const item of onlineMatches) {
        if (!combined.some((c) => Math.abs(c.lat - item.lat) < 0.005 && Math.abs(c.lng - item.lng) < 0.005)) {
          combined.push(item);
        }
      }
      return combined.slice(0, 6);
    }
  } catch (err) {
    console.warn('Nominatim search failed:', err);
  }

  return localMatches;
}

/**
 * Reverse geocode coordinate to human-readable address
 */
export async function reverseGeocodeLocation(lat, lng) {
  // Check if near any known spot
  for (const loc of KNOWN_LOCATIONS) {
    const dLat = Math.abs(loc.lat - lat);
    const dLng = Math.abs(loc.lng - lng);
    if (dLat < 0.005 && dLng < 0.005) {
      return {
        name: loc.name,
        address: loc.address,
      };
    }
  }

  // Query Nominatim reverse API
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    if (data && data.display_name) {
      const parts = data.display_name.split(',');
      const shortName = `${parts[0]?.trim() || 'Selected Spot'}, ${parts[1]?.trim() || 'Bhopal'}`;
      return {
        name: shortName,
        address: data.display_name,
      };
    }
  } catch (err) {
    console.warn('Reverse geocode failed:', err);
  }

  return {
    name: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    address: `GPS: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`,
  };
}

/**
 * Calculate driving route using free OSRM with geodesic fallback
 */
export async function calculateRoute(originCoords, destCoords) {
  if (!originCoords || !destCoords) return null;

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
      const durationMins = Math.round(route.duration / 60);

      // GeoJSON coordinates come as [lng, lat], Leaflet expects [lat, lng]
      const latLngPoints = route.geometry.coordinates.map((coord) => [coord[1], coord[0]]);

      return {
        coordinates: latLngPoints,
        distanceKm,
        durationMins,
        distanceText: `${distanceKm} km`,
        durationText: `${durationMins} mins`,
      };
    }
  } catch (err) {
    console.warn('OSRM routing unavailable, using direct fallback:', err);
  }

  // Fallback: Haversine distance + direct route line
  const dLat = (destCoords.lat - originCoords.lat) * (Math.PI / 180);
  const dLng = (destCoords.lng - originCoords.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(originCoords.lat * (Math.PI / 180)) *
      Math.cos(destCoords.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = 6371 * c;
  const estimatedKm = Math.round(straightKm * 1.3 * 10) / 10;
  const estimatedMins = Math.round((estimatedKm / 35) * 60);

  return {
    coordinates: [
      [originCoords.lat, originCoords.lng],
      [destCoords.lat, destCoords.lng],
    ],
    distanceKm: estimatedKm,
    durationMins: estimatedMins,
    distanceText: `${estimatedKm} km`,
    durationText: `${estimatedMins} mins`,
  };
}
