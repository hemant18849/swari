import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationAutocompleteInput from './LocationAutocompleteInput';
import { MapPin, Navigation, Calendar, Users, ArrowRightLeft, Search, RotateCcw } from 'lucide-react';

const getInitialTodayDate = () => new Date().toISOString().split('T')[0];

export default function SearchForm({
  initialOrigin = '',
  initialDestination = '',
  initialDate = '',
  initialPassengers = '1',
  onSearch,
  onReset,
  compact = false,
  showPassengerSelect = true,
}) {
  const navigate = useNavigate();

  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [date, setDate] = useState(initialDate);
  const [passengers, setPassengers] = useState(initialPassengers);
  const [error, setError] = useState('');

  const todayMin = getInitialTodayDate();

  const handleSwap = () => {
    const tempOrigin = origin;
    setOrigin(destination);
    setDestination(tempOrigin);
  };

  const handleReset = () => {
    setOrigin('');
    setDestination('');
    setDate('');
    setPassengers('1');
    setError('');
    if (onReset) {
      onReset();
    } else {
      navigate('/rides');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (
      origin.trim() &&
      destination.trim() &&
      origin.trim().toLowerCase() === destination.trim().toLowerCase()
    ) {
      setError('Origin and destination cannot be the same location.');
      return;
    }

    if (onSearch) {
      onSearch({
        origin: origin.trim(),
        destination: destination.trim(),
        date: date.trim(),
        passengers: Number(passengers),
      });
    } else {
      const params = new URLSearchParams();
      if (origin.trim()) params.append('origin', origin.trim());
      if (destination.trim()) params.append('destination', destination.trim());
      if (date) params.append('date', date);
      if (passengers && passengers !== '1') params.append('passengers', passengers);

      navigate(`/rides?${params.toString()}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-200/80 transition-all ${
        compact ? 'p-4' : 'p-4 sm:p-6 lg:p-8'
      }`}
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            className="text-rose-500 hover:text-rose-700 font-bold ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
        
        {/* Origin Field */}
        <div className={showPassengerSelect ? 'lg:col-span-3 space-y-1.5' : 'lg:col-span-4 space-y-1.5'}>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            Origin
          </label>
          <LocationAutocompleteInput
            placeholder="e.g. Rani Kamlapati"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            onPlaceSelect={(place) => setOrigin(place.address || place.name)}
            icon={null}
          />
        </div>

        {/* Swap button on desktop */}
        <div className="hidden lg:flex lg:col-span-1 justify-center items-center pb-2">
          <button
            type="button"
            onClick={handleSwap}
            title="Swap Origin and Destination"
            className="p-2 rounded-full border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition shadow-xs group cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 transition-transform group-hover:rotate-180" />
          </button>
        </div>

        {/* Destination Field */}
        <div className={showPassengerSelect ? 'lg:col-span-3 space-y-1.5' : 'lg:col-span-4 space-y-1.5'}>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            Destination
          </label>
          <LocationAutocompleteInput
            placeholder="e.g. Lalghati"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onPlaceSelect={(place) => setDestination(place.address || place.name)}
            icon={null}
          />
        </div>

        {/* Travel Date */}
        <div className={showPassengerSelect ? 'lg:col-span-2 space-y-1.5' : 'lg:col-span-3 space-y-1.5'}>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            Travel Date
          </label>
          <div className="relative">
            <input
              type="date"
              min={todayMin}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-3.5 pr-3 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition outline-none"
            />
          </div>
        </div>

        {/* Passengers / Seats (Optional based on prop) */}
        {showPassengerSelect && (
          <div className="lg:col-span-1 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              Seats
            </label>
            <div className="relative">
              <select
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                className="w-full pl-3 pr-2 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition outline-none"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
          </div>
        )}

        {/* Search Submit Button */}
        <div className={showPassengerSelect ? 'lg:col-span-2 pt-1 sm:pt-0' : 'lg:col-span-2 pt-1 sm:pt-0'}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            <span>Search</span>
          </button>
        </div>

      </div>

      {/* Quick City Chips & Reset (Bhopal Key Hubs) */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-600">Bhopal Hubs:</span>
          {[
            { from: 'Rani Kamlapati', to: 'Lalghati' },
            { from: 'Bhopal Junction', to: 'RGPV College' },
            { from: 'MANIT Bhopal', to: 'MP Nagar' },
            { from: 'AIIMS Bhopal', to: 'Rani Kamlapati' },
          ].map((route, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setOrigin(route.from);
                setDestination(route.to);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-transparent transition font-medium cursor-pointer"
            >
              {route.from} → {route.to}
            </button>
          ))}
        </div>

        {(origin || destination || date) && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 transition font-medium cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear Filter</span>
          </button>
        )}
      </div>
    </form>
  );
}
