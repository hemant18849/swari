import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { addStoredRide, formatDate } from '../utils/storage';
import {
  PlusCircle,
  MapPin,
  Calendar,
  IndianRupee,
  User,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
} from 'lucide-react';

const getInitialTodayDate = () => new Date().toISOString().split('T')[0];

function formatTimeDisplay(timeStr) {
  if (!timeStr) return '';
  // If already formatted like "08:30 AM"
  if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
  
  // Format HH:mm (24-hour) to 12-hour AM/PM
  const [hoursRaw, minutes] = timeStr.split(':');
  if (!hoursRaw || !minutes) return timeStr;
  let hours = parseInt(hoursRaw, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
  return `${formattedHours}:${minutes} ${ampm}`;
}

export default function CreateRidePage() {
  const today = getInitialTodayDate();

  const [formData, setFormData] = useState({
    driverName: '',
    driverRole: '',
    origin: '',
    pickupLocation: '',
    destination: '',
    dropLocation: '',
    travelDate: today,
    departureTime: '09:00',
    totalSeats: 3,
    totalFare: '',
    vehicleModel: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [createdRide, setCreatedRide] = useState(null);

  const bhopalLocations = [
    'Rani Kamlapati',
    'Lalghati',
    'Bhopal Junction',
    'RGPV College',
    'MANIT Bhopal',
    'MP Nagar',
    'AIIMS Bhopal',
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear field error on change
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSwap = () => {
    setFormData((prev) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
      pickupLocation: prev.dropLocation,
      dropLocation: prev.pickupLocation,
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.driverName.trim()) {
      newErrors.driverName = 'Driver Name is required.';
    }

    if (!formData.origin.trim()) {
      newErrors.origin = 'Origin location is required.';
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination location is required.';
    }

    if (
      formData.origin.trim() &&
      formData.destination.trim() &&
      formData.origin.trim().toLowerCase() === formData.destination.trim().toLowerCase()
    ) {
      newErrors.destination = 'Origin and destination cannot be identical.';
    }

    if (!formData.travelDate) {
      newErrors.travelDate = 'Travel date is required.';
    } else if (formData.travelDate < today) {
      newErrors.travelDate = 'Travel date cannot be in the past.';
    }

    if (!formData.departureTime) {
      newErrors.departureTime = 'Departure time is required.';
    }

    const seatsNum = Number(formData.totalSeats);
    if (!seatsNum || seatsNum < 1 || seatsNum > 8) {
      newErrors.totalSeats = 'Please enter valid total seats (1 to 8).';
    }

    const fareNum = Number(formData.totalFare);
    if (!fareNum || fareNum <= 0) {
      newErrors.totalFare = 'Please enter a valid estimated total cab fare.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const totalSeatsNum = Number(formData.totalSeats);
    const totalFareNum = Number(formData.totalFare);
    const perPassengerFare = Math.round(totalFareNum / totalSeatsNum);

    const newRide = {
      id: `swr-${Date.now()}`,
      driverName: formData.driverName.trim(),
      driverRole: formData.driverRole.trim() || 'Verified Student Commuter',
      driverRating: 5.0,
      origin: formData.origin.trim(),
      pickupLocation:
        formData.pickupLocation.trim() || `${formData.origin.trim()} Main Pickup Point`,
      destination: formData.destination.trim(),
      dropLocation:
        formData.dropLocation.trim() || `${formData.destination.trim()} Drop Point`,
      travelDate: formData.travelDate,
      departureTime: formatTimeDisplay(formData.departureTime),
      totalSeats: totalSeatsNum,
      availableSeats: totalSeatsNum,
      totalFare: totalFareNum,
      farePerPassenger: perPassengerFare,
      vehicleModel: formData.vehicleModel.trim() || 'Standard AC Cab',
      notes:
        formData.notes.trim() ||
        'Shared cab ride. Split fare equally among passengers upon reaching.',
      createdByDemo: true,
      createdAt: new Date().toISOString(),
    };

    // Save ride to localStorage
    addStoredRide(newRide);

    // Set created ride for confirmation view
    setCreatedRide(newRide);
  };

  const handleReset = () => {
    setFormData({
      driverName: '',
      driverRole: '',
      origin: '',
      pickupLocation: '',
      destination: '',
      dropLocation: '',
      travelDate: today,
      departureTime: '09:00',
      totalSeats: 3,
      totalFare: '',
      vehicleModel: '',
      notes: '',
    });
    setErrors({});
    setCreatedRide(null);
  };

  const calculatedPerSeat =
    formData.totalFare && Number(formData.totalSeats) > 0
      ? Math.round(Number(formData.totalFare) / Number(formData.totalSeats))
      : 0;

  return (
    <div className="flex-1 bg-slate-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* If successfully created, show confirmation view */}
        {createdRide ? (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 border border-emerald-200 shadow-sm">
                <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                Confirmed & Saved
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Your Shared Ride is Live!
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your ride has been saved and is now discoverable by students and co-passengers in Find Rides.
              </p>
            </div>

            {/* Created Ride Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/70">
                <div className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                  <span className="text-emerald-950">{createdRide.origin}</span>
                  <span className="text-emerald-600">→</span>
                  <span className="text-emerald-950">{createdRide.destination}</span>
                </div>
                <span className="text-xs font-mono font-medium text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-md self-start sm:self-auto">
                  ID: {createdRide.id}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Travel Date</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {formatDate(createdRide.travelDate)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Departure Time</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {createdRide.departureTime}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total / Available Seats</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {createdRide.availableSeats} Seats
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Split Fare / Seat</span>
                  <span className="font-extrabold text-emerald-700 text-base">
                    ₹{createdRide.farePerPassenger}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-600 border-t border-slate-200/60 flex items-center justify-between">
                <span>Driver: <strong className="text-slate-800">{createdRide.driverName}</strong></span>
                <span>Total Cab Cost: <strong className="text-slate-800">₹{createdRide.totalFare}</strong></span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to={`/rides?origin=${encodeURIComponent(createdRide.origin)}&destination=${encodeURIComponent(createdRide.destination)}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>View in Find Rides</span>
              </Link>
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Offer Another Ride</span>
              </button>
            </div>
          </div>
        ) : (
          /* Create Ride Form */
          <div className="space-y-6">
            
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full mb-2 border border-emerald-200">
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                Offer a Shared Ride
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Create a Ride
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-1">
                Post your upcoming cab journey and invite co-passengers to share the fare.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-xl space-y-6"
            >
              
              {/* General Form Error Alert */}
              {Object.keys(errors).length > 0 && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Please correct the following errors:</span>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      {Object.values(errors).map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 1. Driver Profile Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  1. Driver Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Driver Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aman Sharma"
                      value={formData.driverName}
                      onChange={(e) => handleInputChange('driverName', e.target.value)}
                      className={`w-full px-3.5 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border text-sm font-medium transition outline-none ${
                        errors.driverName
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      }`}
                    />
                    {errors.driverName && (
                      <p className="text-rose-600 text-xs font-medium mt-1">
                        {errors.driverName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Role / Campus Tag <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MANIT Student, LNCT 3rd Year"
                      value={formData.driverRole}
                      onChange={(e) => handleInputChange('driverRole', e.target.value)}
                      className="w-full px-3.5 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition outline-none"
                    />
                  </div>
                </div>
              </div>


              {/* 2. Route Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    2. Route Locations
                  </h3>
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Swap From / To</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Origin (From) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rani Kamlapati"
                      value={formData.origin}
                      onChange={(e) => handleInputChange('origin', e.target.value)}
                      className={`w-full px-3.5 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border text-sm font-medium transition outline-none ${
                        errors.origin
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      }`}
                    />
                    {errors.origin && (
                      <p className="text-rose-600 text-xs font-medium mt-1">{errors.origin}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Destination (To) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lalghati"
                      value={formData.destination}
                      onChange={(e) => handleInputChange('destination', e.target.value)}
                      className={`w-full px-3.5 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border text-sm font-medium transition outline-none ${
                        errors.destination
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      }`}
                    />
                    {errors.destination && (
                      <p className="text-rose-600 text-xs font-medium mt-1">
                        {errors.destination}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Bhopal Chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 pt-1">
                  <span className="font-semibold text-slate-600">Quick select:</span>
                  {bhopalLocations.map((loc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (!formData.origin) {
                          handleInputChange('origin', loc);
                        } else if (!formData.destination && loc !== formData.origin) {
                          handleInputChange('destination', loc);
                        } else {
                          handleInputChange('origin', loc);
                        }
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition font-medium cursor-pointer"
                    >
                      {loc}
                    </button>
                  ))}
                </div>

                {/* Optional Pickup & Drop Landmarks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Pickup Spot Landmark <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Platform 1 Gate / Hostel 10"
                      value={formData.pickupLocation}
                      onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 text-xs sm:text-sm font-medium transition outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Drop Spot Landmark <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Main Admin Gate / Circle"
                      value={formData.dropLocation}
                      onChange={(e) => handleInputChange('dropLocation', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 text-xs sm:text-sm font-medium transition outline-none"
                    />
                  </div>
                </div>
              </div>


              {/* 3. Schedule & Seats */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  3. Travel Schedule & Seats
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Travel Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Travel Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={formData.travelDate}
                      onChange={(e) => handleInputChange('travelDate', e.target.value)}
                      className={`w-full px-3.5 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border text-sm font-medium transition outline-none ${
                        errors.travelDate
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      }`}
                    />
                    {errors.travelDate && (
                      <p className="text-rose-600 text-xs font-medium mt-1">
                        {errors.travelDate}
                      </p>
                    )}
                  </div>

                  {/* Departure Time */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Departure Time <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.departureTime}
                      onChange={(e) => handleInputChange('departureTime', e.target.value)}
                      className={`w-full px-3.5 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border text-sm font-medium transition outline-none ${
                        errors.departureTime
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      }`}
                    />
                    {errors.departureTime && (
                      <p className="text-rose-600 text-xs font-medium mt-1">
                        {errors.departureTime}
                      </p>
                    )}
                  </div>

                  {/* Total Seats */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Total Seats Offered <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.totalSeats}
                      onChange={(e) => handleInputChange('totalSeats', e.target.value)}
                      className="w-full px-3.5 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition outline-none cursor-pointer"
                    >
                      <option value="1">1 Seat</option>
                      <option value="2">2 Seats</option>
                      <option value="3">3 Seats</option>
                      <option value="4">4 Seats</option>
                      <option value="5">5 Seats</option>
                      <option value="6">6 Seats</option>
                    </select>
                  </div>
                </div>
              </div>


              {/* 4. Fare & Vehicle Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                  4. Fare Estimation & Vehicle
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Total Cab Fare */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Estimated Total Cab Fare (₹) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="10"
                        placeholder="e.g. 280"
                        value={formData.totalFare}
                        onChange={(e) => handleInputChange('totalFare', e.target.value)}
                        className={`w-full pl-8 pr-3.5 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border text-sm font-medium transition outline-none ${
                          errors.totalFare
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                            : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                        }`}
                      />
                    </div>
                    {errors.totalFare && (
                      <p className="text-rose-600 text-xs font-medium mt-1">
                        {errors.totalFare}
                      </p>
                    )}
                  </div>

                  {/* Vehicle Model */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Vehicle Model <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Swift Dzire, WagonR, Uber Premier"
                      value={formData.vehicleModel}
                      onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                      className="w-full px-3.5 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition outline-none"
                    />
                  </div>
                </div>

                {/* Live Split Calculation Box */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 block">
                        Transparent Equal Split
                      </span>
                      <span className="text-xs text-emerald-800">
                        Total ₹{formData.totalFare || '0'} ÷ {formData.totalSeats} seats
                      </span>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-xs text-slate-600 block">Each Passenger Pays</span>
                    <span className="text-xl font-black text-emerald-700">
                      ₹{calculatedPerSeat} <span className="text-xs font-normal text-slate-500">/ seat</span>
                    </span>
                  </div>
                </div>
              </div>


              {/* 5. Additional Notes */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Ride Notes / Preferences <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Non-smoking cab, punctual departure, plenty of boot space for bags."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 text-xs sm:text-sm font-medium transition outline-none resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Link
                  to="/rides"
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                >
                  Cancel and Return
                </Link>

                <div className="w-full sm:w-auto flex items-center gap-3">
                  <button
                    type="submit"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/25 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                    <span>Create & Publish Ride</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
