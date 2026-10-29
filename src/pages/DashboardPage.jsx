import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getDemoUser,
  getDemoUserRides,
  getDemoUserBookings,
  cancelBooking,
  formatDate,
  getStoredRides,
} from '../utils/storage';
import {
  User,
  ArrowRight,
  PlusCircle,
  Search,
  CheckCircle2,
  XCircle,
  Car,
  Users,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  ArrowUpRight,
  Radio,
} from 'lucide-react';
import LiveTrackingModal from '../components/LiveTrackingModal';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'rides'
  const demoUser = getDemoUser();

  const [bookings, setBookings] = useState(() => getDemoUserBookings(demoUser.id));
  const [createdRides, setCreatedRides] = useState(() => getDemoUserRides(demoUser.id));
  const [actionFeedback, setActionFeedback] = useState(null);
  const [trackingTarget, setTrackingTarget] = useState(null);

  // Re-fetch all stored rides to ensure latest seats are shown
  const allRides = getStoredRides();
  const getRideAvailableSeats = (rideId) => {
    const r = allRides.find((item) => item.id === rideId);
    return r ? r.availableSeats : 0;
  };

  const handleCancelBooking = (bookingId) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this booking? Your reserved seat will be restored to other co-passengers.'
    );
    if (!confirmed) return;

    const result = cancelBooking(bookingId);
    if (result.success) {
      // Refresh local state
      setBookings(getDemoUserBookings(demoUser.id));
      setCreatedRides(getDemoUserRides(demoUser.id));
      setActionFeedback({
        type: 'success',
        message: result.message,
      });
    } else {
      setActionFeedback({
        type: 'error',
        message: result.message,
      });
    }
  };

  const confirmedBookingsCount = bookings.filter((b) => b.status === 'Confirmed').length;

  return (
    <div className="flex-1 bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* User Profile & Overview Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-600/20">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {demoUser.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Demo Student
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {demoUser.email} • Bhopal Commuter Account
              </p>
            </div>
          </div>

          {/* Quick Counter Badges */}
          <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-initial bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-center sm:text-left">
              <span className="text-xs text-slate-500 font-medium block">Active Bookings</span>
              <span className="text-xl font-black text-emerald-700">{confirmedBookingsCount}</span>
            </div>
            <div className="flex-1 md:flex-initial bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-center sm:text-left">
              <span className="text-xs text-slate-500 font-medium block">Rides Offered</span>
              <span className="text-xl font-black text-slate-900">{createdRides.length}</span>
            </div>
          </div>
        </div>

        {/* Action Feedback Notification */}
        {actionFeedback && (
          <div
            className={`p-4 rounded-2xl border text-sm font-medium flex items-center justify-between animate-in fade-in duration-200 ${
              actionFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {actionFeedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{actionFeedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="text-slate-400 hover:text-slate-600 font-bold ml-4 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dashboard Tabs & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>My Bookings</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                  activeTab === 'bookings'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {bookings.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rides')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'rides'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>My Rides</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                  activeTab === 'rides'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {createdRides.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/rides"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 text-xs font-bold transition shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-emerald-600" />
              <span>Find Rides</span>
            </Link>
            <Link
              to="/create-ride"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Ride</span>
            </Link>
          </div>
        </div>

        {/* SECTION 1: MY BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {bookings.map((booking) => {
                  const isConfirmed = booking.status === 'Confirmed';
                  const liveAvailableSeats = getRideAvailableSeats(booking.rideId);

                  return (
                    <div
                      key={booking.id}
                      className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        {/* Status & Booking ID header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isConfirmed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200 line-through'
                            }`}
                          >
                            {isConfirmed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            {booking.status}
                          </span>

                          <span className="text-xs font-mono text-slate-400">
                            {booking.id}
                          </span>
                        </div>

                        {/* Route & Driver */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                            <span>{booking.origin}</span>
                            <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{booking.destination}</span>
                          </div>
                          {(booking.pickupLocation || booking.dropLocation) && (
                            <p className="text-xs text-slate-500">
                              Pickup: {booking.pickupLocation || `${booking.origin} Point`}
                            </p>
                          )}
                        </div>

                        {/* Booking Meta Grid */}
                        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 text-xs border border-slate-100">
                          <div>
                            <span className="text-slate-400 block font-medium">Date</span>
                            <span className="font-bold text-slate-800">
                              {formatDate(booking.travelDate)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Time</span>
                            <span className="font-bold text-slate-800">
                              {booking.departureTime}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Driver</span>
                            <span className="font-bold text-slate-800 truncate block">
                              {booking.driverName}
                            </span>
                          </div>
                        </div>

                        {/* Live Available Seats & Fare */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Users className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Cab Open Seats:</span>
                            <strong className="text-slate-900">{liveAvailableSeats} left</strong>
                          </div>

                          <div className="text-right">
                            <span className="text-slate-400 block text-[11px]">Payable Split</span>
                            <span className="text-lg font-black text-emerald-700">
                              ₹{booking.fare}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <Link
                          to={`/rides/${booking.rideId}`}
                          className="text-xs font-bold text-slate-600 hover:text-emerald-700 transition flex items-center gap-1"
                        >
                          <span>Ride Details</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>

                        <div className="flex items-center gap-2">
                          {isConfirmed && (
                            <button
                              type="button"
                              onClick={() =>
                                setTrackingTarget({
                                  ride: {
                                    id: booking.rideId,
                                    origin: booking.origin,
                                    destination: booking.destination,
                                    driverName: booking.driverName,
                                  },
                                  isDriver: false,
                                })
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                            >
                              <Radio className="w-3.5 h-3.5 animate-pulse" />
                              <span>Track Live</span>
                            </button>
                          )}

                          {isConfirmed && (
                            <button
                              type="button"
                              onClick={() => handleCancelBooking(booking.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200/90 shadow-sm max-w-xl mx-auto space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                  <Car className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No Bookings Yet</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  You haven't reserved seats on any shared cabs. Search for co-travellers along your Bhopal commute.
                </p>
                <Link
                  to="/rides"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
                >
                  <Search className="w-4 h-4" />
                  <span>Explore Available Rides</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: MY CREATED RIDES */}
        {activeTab === 'rides' && (
          <div className="space-y-4">
            {createdRides.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {createdRides.map((ride) => {
                  const isFull = ride.availableSeats <= 0;

                  return (
                    <div
                      key={ride.id}
                      className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        {/* Header Badge */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isFull
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {isFull ? 'Cab Full' : `${ride.availableSeats} of ${ride.totalSeats} seats open`}
                          </span>

                          <span className="text-xs font-mono text-slate-400">
                            {ride.id}
                          </span>
                        </div>

                        {/* Route */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                            <span>{ride.origin}</span>
                            <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{ride.destination}</span>
                          </div>
                          {(ride.pickupLocation || ride.dropLocation) && (
                            <p className="text-xs text-slate-500">
                              Pickup: {ride.pickupLocation || `${ride.origin} Spot`}
                            </p>
                          )}
                        </div>

                        {/* Ride Meta Grid */}
                        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 text-xs border border-slate-100">
                          <div>
                            <span className="text-slate-400 block font-medium">Date</span>
                            <span className="font-bold text-slate-800">
                              {formatDate(ride.travelDate)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Departure</span>
                            <span className="font-bold text-slate-800">
                              {ride.departureTime}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Total Cost</span>
                            <span className="font-bold text-slate-800">
                              ₹{ride.totalFare}
                            </span>
                          </div>
                        </div>

                        {/* Fare breakdown */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-slate-500 font-medium">
                            Vehicle: {ride.vehicleModel || 'Standard AC Cab'}
                          </span>
                          <div className="text-right">
                            <span className="text-slate-400 block text-[11px]">Each Seat Splits</span>
                            <span className="text-lg font-black text-emerald-700">
                              ₹{ride.farePerPassenger}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs text-slate-500">
                          Offered by you ({ride.driverName})
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setTrackingTarget({
                                ride,
                                isDriver: true,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                          >
                            <Radio className="w-3.5 h-3.5 animate-pulse" />
                            <span>Start Trip</span>
                          </button>

                          <Link
                            to={`/rides/${ride.id}`}
                            className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1 transition px-2 py-1"
                          >
                            <span>View</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200/90 shadow-sm max-w-xl mx-auto space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                  <PlusCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No Rides Created</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Planning an upcoming cab journey? Create your ride and start splitting the fare with co-passengers.
                </p>
                <Link
                  to="/create-ride"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Offer a Ride</span>
                </Link>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Live Tracking Modal */}
      {trackingTarget && (
        <LiveTrackingModal
          ride={trackingTarget.ride}
          currentUser={demoUser}
          isDriver={trackingTarget.isDriver}
          onClose={() => setTrackingTarget(null)}
        />
      )}
    </div>
  );
}
