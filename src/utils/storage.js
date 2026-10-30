import { INITIAL_RIDES } from '../data/mockRides.js';

const RIDES_STORAGE_KEY = 'sawari_rides_v2';
const BOOKINGS_STORAGE_KEY = 'sawari_bookings';
const AUTH_USER_KEY = 'sawari_auth_user';

export const DEFAULT_DEMO_USER = {
  id: 'usr-demo-01',
  name: 'Demo Student',
  email: 'student@demo.college',
};

/**
 * Retrieve the currently authenticated demo user, or null if logged out
 */
export function getCurrentUser() {
  try {
    const data = localStorage.getItem(AUTH_USER_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    return parsed && parsed.name ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Log in or Sign up user with Name and Email
 */
export function loginUser({ name, email }) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanName || !cleanEmail) {
    throw new Error('Name and email are required.');
  }

  const user = {
    id: `usr-${cleanEmail.replace(/[^a-z0-9]/g, '') || Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    role: 'Student Commuter',
    loggedInAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sawari_auth_change'));
    }
  } catch (err) {
    console.error('Error saving user to localStorage:', err);
  }

  return user;
}

/**
 * Log out active user
 */
export function logoutUser() {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sawari_auth_change'));
    }
  } catch (err) {
    console.error('Error removing auth user:', err);
  }
}

/**
 * Retrieve active user, falling back to default demo user if not logged in
 */
export function getDemoUser() {
  const user = getCurrentUser();
  return user || DEFAULT_DEMO_USER;
}

/**
 * Retrieve rides from localStorage, initializing with INITIAL_RIDES if empty.
 */
export function getStoredRides() {
  try {
    const data = localStorage.getItem(RIDES_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(INITIAL_RIDES));
      return INITIAL_RIDES;
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(INITIAL_RIDES));
      return INITIAL_RIDES;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading rides from localStorage:', err);
    return INITIAL_RIDES;
  }
}

/**
 * Persist rides to localStorage.
 */
export function saveStoredRides(rides) {
  try {
    localStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(rides));
  } catch (err) {
    console.error('Error saving rides to localStorage:', err);
  }
}

/**
 * Prepend a newly created ride to localStorage.
 */
export function addStoredRide(newRide) {
  const currentRides = getStoredRides();
  const updatedRides = [newRide, ...currentRides];
  saveStoredRides(updatedRides);
  return updatedRides;
}

/**
 * Retrieve all bookings from localStorage
 */
export function getStoredBookings() {
  try {
    const data = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading bookings:', err);
    return [];
  }
}

/**
 * Persist bookings to localStorage
 */
export function saveStoredBookings(bookings) {
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  } catch (err) {
    console.error('Error saving bookings:', err);
  }
}

/**
 * Check if the user already has a confirmed booking for a specific ride
 */
export function isRideBookedByUser(rideId, userId = getDemoUser().id) {
  const bookings = getStoredBookings();
  return bookings.some(
    (b) => b.rideId === rideId && b.userId === userId && b.status === 'Confirmed'
  );
}

/**
 * Join / Book a ride with validations:
 * - Checks available seats
 * - Prevents joining full rides
 * - Prevents duplicate bookings by same demo user
 * - Updates available seats and persists booking in localStorage
 */
export function bookRide(rideId, user = getDemoUser()) {
  const rides = getStoredRides();
  const rideIndex = rides.findIndex((r) => r.id === rideId);

  if (rideIndex === -1) {
    return { success: false, message: 'Ride not found.' };
  }

  const ride = rides[rideIndex];

  // 1. Check if ride has available seats
  if (ride.availableSeats <= 0) {
    return {
      success: false,
      message: 'This ride is full. No available seats remaining.',
    };
  }

  // 2. Prevent duplicate booking by the same user
  const bookings = getStoredBookings();
  const alreadyBooked = bookings.some(
    (b) => b.rideId === rideId && b.userId === user.id && b.status === 'Confirmed'
  );

  if (alreadyBooked) {
    return {
      success: false,
      message: 'You have already booked a seat on this ride.',
    };
  }

  // 3. Update available seats
  ride.availableSeats -= 1;
  rides[rideIndex] = { ...ride };
  saveStoredRides(rides);

  // 4. Create booking record
  const newBooking = {
    id: `bkg-${Date.now()}`,
    rideId: ride.id,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    origin: ride.origin,
    destination: ride.destination,
    pickupLocation: ride.pickupLocation,
    dropLocation: ride.dropLocation,
    travelDate: ride.travelDate,
    departureTime: ride.departureTime,
    driverName: ride.driverName,
    fare: ride.farePerPassenger,
    vehicleModel: ride.vehicleModel,
    seatsBooked: 1,
    status: 'Confirmed',
    bookedAt: new Date().toISOString(),
  };

  const updatedBookings = [newBooking, ...bookings];
  saveStoredBookings(updatedBookings);

  // Authorize passenger with backend for live GPS tracking
  if (typeof fetch !== 'undefined') {
    fetch('/api/location/authorize-passenger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rideId: ride.id,
        passengerId: user.id,
        driverId: ride.driverId || 'unassigned',
      }),
    }).catch(() => {});
  }

  return {
    success: true,
    booking: newBooking,
    updatedRide: ride,
    message: 'Booking confirmed successfully!',
  };
}

/**
 * Cancel a booking:
 * - Updates booking status to 'Cancelled'
 * - Restores available seat on the ride
 * - Persists changes in localStorage
 */
export function cancelBooking(bookingId) {
  const bookings = getStoredBookings();
  const bookingIndex = bookings.findIndex((b) => b.id === bookingId);

  if (bookingIndex === -1) {
    return { success: false, message: 'Booking record not found.' };
  }

  const booking = bookings[bookingIndex];

  if (booking.status === 'Cancelled') {
    return { success: false, message: 'This booking is already cancelled.' };
  }

  // 1. Update booking status
  booking.status = 'Cancelled';
  booking.cancelledAt = new Date().toISOString();
  bookings[bookingIndex] = { ...booking };
  saveStoredBookings(bookings);

  // 2. Restore available seat on the associated ride
  const rides = getStoredRides();
  const rideIndex = rides.findIndex((r) => r.id === booking.rideId);
  if (rideIndex !== -1) {
    const ride = rides[rideIndex];
    ride.availableSeats = Math.min(ride.totalSeats, ride.availableSeats + 1);
    rides[rideIndex] = { ...ride };
    saveStoredRides(rides);
  }

  return {
    success: true,
    message: 'Booking cancelled. Your reserved seat has been restored to the cab.',
    booking,
  };
}

/**
 * Driver accepts an open user-created ride request
 */
export function acceptRideAsDriver(rideId, driver = getDemoUser(), vehicleModel = 'Standard AC Cab') {
  const rides = getStoredRides();
  const rideIndex = rides.findIndex((r) => r.id === rideId);

  if (rideIndex === -1) {
    return { success: false, message: 'Ride not found.' };
  }

  const ride = rides[rideIndex];
  if (ride.driverId && ride.status === 'Driver Confirmed') {
    return { success: false, message: 'This ride has already been accepted by a driver.' };
  }

  ride.driverId = driver.id || `drv-${Date.now()}`;
  ride.driverName = driver.name || 'Verified Driver';
  ride.driverRole = driver.role || 'Verified Commuter Driver';
  ride.driverRating = 4.9;
  ride.vehicleModel = vehicleModel || ride.vehicleModel || 'Standard AC Cab';
  ride.status = 'Driver Confirmed';
  ride.acceptedAt = new Date().toISOString();

  rides[rideIndex] = { ...ride };
  saveStoredRides(rides);

  return {
    success: true,
    ride,
    message: `You have accepted this ride as Driver (${ride.driverName})!`,
  };
}

/**
 * Retrieve rides created by demo user
 */
export function getDemoUserRides(userId = getDemoUser().id) {
  const rides = getStoredRides();
  return rides.filter((r) => r.createdByDemo === true || r.driverId === userId);
}

/**
 * Retrieve bookings made by demo user
 */
export function getDemoUserBookings(userId = getDemoUser().id) {
  const bookings = getStoredBookings();
  return bookings.filter((b) => b.userId === userId);
}

/**
 * Format a YYYY-MM-DD date string into human-friendly format
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, parseInt(month, 10) - 1, day);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
