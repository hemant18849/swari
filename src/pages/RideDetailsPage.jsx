import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getStoredRides,
  formatDate,
  bookRide,
  isRideBookedByUser,
  getDemoUser,
  getCurrentUser,
  acceptRideAsDriver,
} from '../utils/storage';
import LiveTrackingModal from '../components/LiveTrackingModal';
import RideRouteMap from '../components/RideRouteMap';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  User,
  Users,
  MapPin,
  ShieldCheck,
  Star,
  Car,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Check,
  X,
  Radio,
} from 'lucide-react';

export default function RideDetailsPage() {
  const { id } = useParams();

  // Retrieve current ride
  const [allRides, setAllRides] = useState(() => getStoredRides());
  const ride = useMemo(() => allRides.find((r) => r.id === id), [allRides, id]);

  const [isBooked, setIsBooked] = useState(() => (id ? isRideBookedByUser(id) : false));
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  const currentUser = getCurrentUser() || getDemoUser();
  const isPendingDriver = !ride?.driverId || ride?.status === 'Pending Driver';
  const isDriver = Boolean(ride && ride.driverId && ride.driverId === currentUser.id);

  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [driverForm, setDriverForm] = useState({
    driverName: currentUser?.name || '',
    driverRole: currentUser?.role || 'Campus Student Driver',
    vehicleModel: ride?.vehicleModel && !ride.vehicleModel.includes('assigned') ? ride.vehicleModel : 'Swift Dzire (AC)',
  });
  const [acceptError, setAcceptError] = useState('');
  const [acceptSuccess, setAcceptSuccess] = useState('');

  if (!ride) {
    return (
      <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Ride Not Found
        </h2>
        <p className="text-slate-600 text-sm mb-6">
          The requested shared cab journey could not be located or may have been removed.
        </p>
        <Link
          to="/rides"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Find Rides</span>
        </Link>
      </div>
    );
  }

  const isFull = ride.availableSeats <= 0;

  const handleJoinRide = () => {
    setBookingError('');
    const result = bookRide(ride.id);

    if (result.success) {
      // Refresh local ride list
      const updated = getStoredRides();
      setAllRides(updated);
      setIsBooked(true);
      setBookingConfirmation(result.booking);
    } else {
      setBookingError(result.message);
    }
  };

  const handleAcceptRide = (e) => {
    e.preventDefault();
    setAcceptError('');
    if (!driverForm.driverName.trim()) {
      setAcceptError('Driver Name is required.');
      return;
    }

    const result = acceptRideAsDriver(
      ride.id,
      {
        id: currentUser.id,
        name: driverForm.driverName.trim(),
        role: driverForm.driverRole.trim() || 'Verified Commuter Driver',
      },
      driverForm.vehicleModel.trim() || 'Standard AC Cab'
    );

    if (result.success) {
      const updated = getStoredRides();
      setAllRides(updated);
      setShowAcceptModal(false);
      setAcceptSuccess(result.message);
    } else {
      setAcceptError(result.message);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back Link */}
        <div>
          <Link
            to="/rides"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Rides</span>
          </Link>
        </div>

        {/* Main Ride Card Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl space-y-8">
          
          {/* Header Banner: Route, Price, & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                <span>{ride.origin}</span>
                <ArrowRight className="w-6 h-6 text-emerald-600 shrink-0" />
                <span>{ride.destination}</span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Ride ID: {ride.id}
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-slate-500 block">Est. Split Fare</span>
              <div className="text-3xl font-black text-emerald-700">
                ₹{ride.farePerPassenger}
                <span className="text-xs font-normal text-slate-500 ml-1">/ passenger</span>
              </div>
            </div>
          </div>

          {/* Alert: If Full */}
          {isFull && !isBooked && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <strong className="block font-bold">This ride is full.</strong>
                All {ride.totalSeats} seats have been reserved by fellow passengers.
              </div>
            </div>
          )}

          {/* Alert: If Already Booked */}
          {isBooked && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="block font-bold">Booking Confirmed!</strong>
                You have reserved 1 seat on this ride. Meet at the pickup point at departure time.
              </div>
            </div>
          )}

          {/* Error Message */}
          {bookingError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center justify-between">
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

          {/* Success Message for Driver Acceptance */}
          {acceptSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{acceptSuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => setAcceptSuccess('')}
                className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            
            <div className="space-y-1">
              <span className="text-slate-500 flex items-center gap-1 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Travel Date
              </span>
              <span className="font-extrabold text-slate-900 text-sm sm:text-base block">
                {formatDate(ride.travelDate)}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 flex items-center gap-1 font-semibold">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Departure Time
              </span>
              <span className="font-extrabold text-slate-900 text-sm sm:text-base block">
                {ride.departureTime}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 flex items-center gap-1 font-semibold">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                Seat Status
              </span>
              <span
                className={`inline-block font-extrabold text-sm sm:text-base ${
                  isFull ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {ride.availableSeats} of {ride.totalSeats} seats open
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 flex items-center gap-1 font-semibold">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                Total Cab Fare
              </span>
              <span className="font-extrabold text-slate-900 text-sm sm:text-base block">
                ₹{ride.totalFare}
              </span>
            </div>

          </div>


          {/* Google Maps Route Display */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Route & Directions Map
            </h4>
            <RideRouteMap
              origin={ride.origin}
              destination={ride.destination}
              title={`${ride.origin} → ${ride.destination}`}
              heightClass="h-72 sm:h-80 md:h-96"
            />
          </div>

          {/* Pickup & Drop Points */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pickup & Drop Landmarks
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Boarding Point</span>
                  <span className="font-bold text-slate-900">{ride.pickupLocation || `${ride.origin} Main Spot`}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Drop Destination</span>
                  <span className="font-bold text-slate-900">{ride.dropLocation || `${ride.destination} Main Spot`}</span>
                </div>
              </div>
            </div>
          </div>


          {/* Driver & Vehicle Info */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Driver & Vehicle
            </h4>

            {isPendingDriver ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">Driver Acceptance Pending</span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-300">
                        Open Request
                      </span>
                    </div>
                    <span className="text-xs text-slate-600 block">
                      Posted by <strong className="text-slate-800">{ride.creatorName || 'Student Commuter'}</strong> ({ride.creatorRole || 'Commuter'})
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAcceptModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer self-start sm:self-auto"
                >
                  <Car className="w-4 h-4" />
                  <span>Accept Ride as Driver</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{ride.driverName}</span>
                      {ride.driverRating && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {ride.driverRating}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-600 block">{ride.driverRole || 'Verified Driver'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">
                    <Car className="w-4 h-4 text-emerald-600" />
                    {ride.vehicleModel || 'Standard AC Cab'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100/70 border border-emerald-200 text-emerald-800 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    Verified Driver
                  </span>
                </div>
              </div>
            )}
          </div>


          {/* Ride Notes */}
          {ride.notes && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ride Notes from Driver
              </h4>
              <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200/80 leading-relaxed">
                "{ride.notes}"
              </p>
            </div>
          )}


          {/* Action Row */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500 block">Total payable to driver</span>
              <span className="text-2xl font-black text-slate-900">
                ₹{ride.farePerPassenger}
              </span>
            </div>

            <div className="w-full sm:w-auto flex flex-wrap items-center gap-3">
              {/* Accept Ride as Driver button if ride has no driver yet */}
              {isPendingDriver && !isDriver && (
                <button
                  type="button"
                  onClick={() => setShowAcceptModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition cursor-pointer"
                >
                  <Car className="w-4 h-4" />
                  <span>Accept Ride as Driver</span>
                </button>
              )}

              {/* Driver live trip sharing trigger */}
              {isDriver && (
                <button
                  type="button"
                  onClick={() => setShowTrackingModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition cursor-pointer"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>Start Trip & Share GPS</span>
                </button>
              )}

              {/* Passenger live tracking trigger */}
              {isBooked && !isDriver && (
                <button
                  type="button"
                  onClick={() => setShowTrackingModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition cursor-pointer"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>Track Driver Live</span>
                </button>
              )}

              {isBooked && !isDriver ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                  <Check className="w-4 h-4" />
                  <span>Seat Reserved</span>
                </span>
              ) : isFull && !isDriver ? (
                <button
                  type="button"
                  disabled
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-sm border border-slate-200 cursor-not-allowed"
                >
                  <span>Ride is Full (0 Seats Left)</span>
                </button>
              ) : !isDriver ? (
                <button
                  type="button"
                  onClick={handleJoinRide}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition cursor-pointer"
                >
                  <span>Join Ride • ₹{ride.farePerPassenger}</span>
                </button>
              ) : null}
            </div>
          </div>

        </div>

      </div>

      {/* Accept Ride as Driver Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Accept Ride as Driver</h3>
                  <p className="text-xs text-slate-500">Confirm your details to take this journey</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAcceptModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {acceptError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {acceptError}
              </div>
            )}

            <form onSubmit={handleAcceptRide} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Driver Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aman Sharma"
                  value={driverForm.driverName}
                  onChange={(e) => setDriverForm({ ...driverForm, driverName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm font-medium transition outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Role / Campus Tag <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. MANIT Student, LNCT Commuter Driver"
                  value={driverForm.driverRole}
                  onChange={(e) => setDriverForm({ ...driverForm, driverRole: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm font-medium transition outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Vehicle Model
                </label>
                <input
                  type="text"
                  placeholder="e.g. Swift Dzire (AC), Ertiga"
                  value={driverForm.vehicleModel}
                  onChange={(e) => setDriverForm({ ...driverForm, vehicleModel: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm font-medium transition outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900">
                <span className="font-bold">Trip Route: </span>
                {ride.origin} → {ride.destination} ({ride.departureTime}, {formatDate(ride.travelDate)})
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAcceptModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Confirm & Accept Ride
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Tracking Modal */}
      {showTrackingModal && (
        <LiveTrackingModal
          ride={ride}
          currentUser={currentUser}
          isDriver={isDriver}
          onClose={() => setShowTrackingModal(false)}
        />
      )}

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
                Status: Confirmed
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1.5">
                Seat Confirmed!
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Your seat on this cab has been reserved.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-slate-500">Booking Reference</span>
                <span className="font-mono font-bold text-slate-900">{bookingConfirmation.id}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-slate-500">Route</span>
                <span className="font-bold text-slate-900">
                  {bookingConfirmation.origin} → {bookingConfirmation.destination}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-slate-500">Travel Date</span>
                <span className="font-bold text-slate-900">
                  {formatDate(bookingConfirmation.travelDate)} • {bookingConfirmation.departureTime}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-slate-500">Driver</span>
                <span className="font-bold text-slate-900">{bookingConfirmation.driverName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Payable Amount</span>
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
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
