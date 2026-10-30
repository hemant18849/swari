import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Users,
  ArrowRight,
  ShieldCheck,
  Star,
  ChevronRight,
  CheckCircle2,
  Check,
  X,
} from 'lucide-react';
import { formatDate, bookRide, isRideBookedByUser } from '../utils/storage';

export default function RideCard({ ride, onRideUpdated }) {
  const [currentRide, setCurrentRide] = useState(ride);
  const [isBooked, setIsBooked] = useState(() => isRideBookedByUser(ride.id));
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [bookingError, setBookingError] = useState('');

  const isFull = currentRide.availableSeats <= 0;

  const handleJoinRide = () => {
    setBookingError('');
    const result = bookRide(currentRide.id);

    if (result.success) {
      setCurrentRide(result.updatedRide);
      setIsBooked(true);
      setBookingConfirmation(result.booking);
      if (onRideUpdated) {
        onRideUpdated(result.updatedRide);
      }
    } else {
      setBookingError(result.message);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group">
        <div>
          {/* Top Header: Route & Price */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-lg sm:text-xl font-extrabold text-slate-900">
                <span className="text-emerald-950">{currentRide.origin}</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
                <span className="text-emerald-950">{currentRide.destination}</span>
              </div>

              {(currentRide.pickupLocation || currentRide.dropLocation) && (
                <div className="text-xs text-slate-700 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  {currentRide.pickupLocation && <span>From: {currentRide.pickupLocation}</span>}
                  {currentRide.pickupLocation && currentRide.dropLocation && <span>•</span>}
                  {currentRide.dropLocation && <span>To: {currentRide.dropLocation}</span>}
                </div>
              )}
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-xs text-slate-700 block">Est. Fare per Seat</span>
              <div className="text-2xl font-black text-emerald-700">
                ₹{currentRide.farePerPassenger}
              </div>
            </div>
          </div>

          {/* Error Message if booking rejected */}
          {bookingError && (
            <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between">
              <span>{bookingError}</span>
              <button
                type="button"
                onClick={() => setBookingError('')}
                className="text-rose-500 hover:text-rose-700 font-bold ml-2 cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          {/* Middle Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs">
            {/* Travel Date */}
            <div className="space-y-1">
              <span className="text-slate-700 flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Departure Date
              </span>
              <span className="font-bold text-slate-800 text-sm block">
                {formatDate(currentRide.travelDate)}
              </span>
            </div>

            {/* Departure Time */}
            <div className="space-y-1">
              <span className="text-slate-700 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Departure Time
              </span>
              <span className="font-bold text-slate-800 text-sm block">
                {currentRide.departureTime}
              </span>
            </div>

            {/* Available Seats */}
            <div className="space-y-1">
              <span className="text-slate-700 flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                Available Seats
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                    isFull
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {isFull ? 'Cab Full' : `${currentRide.availableSeats} of ${currentRide.totalSeats} seats left`}
                </span>
              </div>
            </div>

            {/* Vehicle Model */}
            <div className="space-y-1">
              <span className="text-slate-700 flex items-center gap-1 font-medium">Vehicle</span>
              <span className="font-bold text-slate-800 text-sm block truncate">
                {currentRide.vehicleModel || 'Standard AC Cab'}
              </span>
            </div>
          </div>

          {/* Driver Profile or Ride Creator Profile */}
          <div className="flex items-center justify-between gap-3 pt-3 pb-2 border-t border-slate-100">
            {currentRide.driverName ? (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900">{currentRide.driverName}</span>
                    {currentRide.driverRating && (
                      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {currentRide.driverRating}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700">{currentRide.driverRole || 'Verified Driver'}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900">
                      {currentRide.creatorName || 'Student Commuter'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      ⏳ Driver Pending
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {currentRide.creatorRole || 'Ride Requested'}
                  </p>
                </div>
              </div>
            )}

            {currentRide.driverName ? (
              <div className="hidden sm:flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ID Verified</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60 font-semibold">
                <span>Open for Drivers</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Row: View Details & Join Ride */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            to={`/rides/${currentRide.id}`}
            className="text-xs font-bold text-slate-600 hover:text-emerald-700 transition flex items-center gap-1"
          >
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <div className="w-full sm:w-auto flex items-center gap-2">
            {isBooked ? (
              <span className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
                <Check className="w-3.5 h-3.5" />
                <span>Seat Booked</span>
              </span>
            ) : isFull ? (
              <button
                type="button"
                disabled
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs border border-slate-200 cursor-not-allowed"
              >
                <span>Cab Full</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleJoinRide}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer hover:shadow-md"
              >
                <span>Join Ride</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {bookingConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
              </div>
              <button
                type="button"
                onClick={() => setBookingConfirmation(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                Booking Status: Confirmed
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1.5">
                Seat Reserved Successfully!
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Your booking record has been confirmed and saved.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-slate-500">Route</span>
                <span className="font-bold text-slate-900">
                  {bookingConfirmation.origin} → {bookingConfirmation.destination}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-slate-500">Date & Departure</span>
                <span className="font-bold text-slate-900">
                  {formatDate(bookingConfirmation.travelDate)} • {bookingConfirmation.departureTime}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-slate-500">Driver</span>
                <span className="font-bold text-slate-900">{bookingConfirmation.driverName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Fare to Pay at Pickup</span>
                <span className="font-extrabold text-emerald-700 text-sm">
                  ₹{bookingConfirmation.fare}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setBookingConfirmation(null)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
