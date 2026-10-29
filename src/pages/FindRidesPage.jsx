import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SearchForm from '../components/SearchForm';
import RideCard from '../components/RideCard';
import { getStoredRides, formatDate } from '../utils/storage';
import {
  Search,
  PlusCircle,
  MapPin,
  Calendar,
  Frown,
  Sparkles,
  ArrowRight,
  FilterX,
} from 'lucide-react';

export default function FindRidesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filterOrigin = searchParams.get('origin') || '';
  const filterDestination = searchParams.get('destination') || '';
  const filterDate = searchParams.get('date') || '';

  // Retrieve rides from localStorage / initial mock data
  const [allRides, setAllRides] = useState(() => getStoredRides());

  const handleRideUpdated = () => {
    setAllRides(getStoredRides());
  };

  // Handle in-page search updates
  const handleSearch = ({ origin, destination, date }) => {
    const params = new URLSearchParams();
    if (origin) params.append('origin', origin);
    if (destination) params.append('destination', destination);
    if (date) params.append('date', date);
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Exact city matching filter
  const filteredRides = useMemo(() => {
    return allRides.filter((ride) => {
      // If origin is specified, exact case-insensitive city match
      if (
        filterOrigin.trim() &&
        ride.origin.trim().toLowerCase() !== filterOrigin.trim().toLowerCase()
      ) {
        return false;
      }

      // If destination is specified, exact case-insensitive city match
      if (
        filterDestination.trim() &&
        ride.destination.trim().toLowerCase() !== filterDestination.trim().toLowerCase()
      ) {
        return false;
      }

      // If travelDate is specified, match date exactly
      if (filterDate.trim() && ride.travelDate !== filterDate.trim()) {
        return false;
      }

      return true;
    });
  }, [allRides, filterOrigin, filterDestination, filterDate]);

  const hasActiveFilters = Boolean(filterOrigin || filterDestination || filterDate);

  return (
    <div className="flex-1 bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Title & Search Bar Area */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full mb-2 border border-emerald-200">
                <Search className="w-3.5 h-3.5 text-emerald-600" />
                Find Shared Cabs
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Available Shared Rides
              </h1>
              <p className="text-slate-700 text-sm sm:text-base mt-1">
                Discover seats offered by fellow students and travelers along your route.
              </p>
            </div>

            <Link
              to="/create-ride"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Offer a Ride</span>
            </Link>
          </div>

          {/* Search Filter Form keyed on filter state */}
          <SearchForm
            key={`${filterOrigin}-${filterDestination}-${filterDate}`}
            initialOrigin={filterOrigin}
            initialDestination={filterDestination}
            initialDate={filterDate}
            onSearch={handleSearch}
            onReset={handleClearFilters}
            showPassengerSelect={false}
          />
        </div>

        {/* Results Metadata & Active Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-900">
              {hasActiveFilters ? 'Matching Rides' : 'All Available Rides'}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200/80 text-slate-700">
              {filteredRides.length} {filteredRides.length === 1 ? 'ride' : 'rides'} found
            </span>

            {/* Active filter badges */}
            {filterOrigin && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                <MapPin className="w-3 h-3 text-emerald-600" />
                From: {filterOrigin}
              </span>
            )}
            {filterDestination && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                <ArrowRight className="w-3 h-3 text-emerald-600" />
                To: {filterDestination}
              </span>
            )}
            {filterDate && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                <Calendar className="w-3 h-3 text-emerald-600" />
                Date: {formatDate(filterDate)}
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition self-start sm:self-auto cursor-pointer"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Show All Rides</span>
            </button>
          )}
        </div>

        {/* Results List or No-Results State */}
        {filteredRides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {filteredRides.map((ride) => (
              <RideCard key={ride.id} ride={ride} onRideUpdated={handleRideUpdated} />
            ))}
          </div>
        ) : (
          /* Requirement 8: Show a no-results message & option to create a ride */
          <div className="bg-white rounded-3xl p-8 sm:p-14 text-center border border-slate-200/90 shadow-sm max-w-2xl mx-auto my-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5 border border-amber-100">
              <Frown className="w-8 h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              No rides found for your selected route.
            </h3>

            <p className="mt-2 text-sm sm:text-base text-slate-700 max-w-md mx-auto leading-relaxed">
              We couldn't find any shared cab matches for{' '}
              <strong className="text-slate-900">
                {filterOrigin || 'your origin'} → {filterDestination || 'your destination'}
              </strong>
              {filterDate && ` on ${formatDate(filterDate)}`}.
            </p>

            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/create-ride"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create This Ride</span>
              </Link>
              
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition cursor-pointer"
              >
                <span>View All Rides</span>
              </button>
            </div>
          </div>
        )}

        {/* Informative Tip Box */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950">
                Looking to travel with college friends?
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed mt-0.5">
                Rides are organized by students and verified daily commuters. Exact fares are calculated by dividing the cab rate equally.
              </p>
            </div>
          </div>
          
          <Link
            to="/create-ride"
            className="shrink-0 text-xs font-bold text-emerald-800 hover:text-emerald-900 underline underline-offset-4"
          >
            Post a cab journey →
          </Link>
        </div>

      </div>
    </div>
  );
}
