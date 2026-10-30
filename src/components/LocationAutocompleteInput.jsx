import React, { useState, useEffect, useRef } from 'react';
import { searchLocations } from '../utils/mapService';
import { MapPin, Check } from 'lucide-react';

export default function LocationAutocompleteInput({
  value,
  onChange,
  onPlaceSelect,
  placeholder = 'Search location or landmark...',
  className = '',
  icon: Icon = MapPin,
  iconColor = 'text-emerald-600',
  id,
  name,
  required = false,
  autoComplete = 'off',
  disabled = false,
}) {
  const containerRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch suggestions when value changes and input is focused
  useEffect(() => {
    if (!isOpen) return;

    let isCurrent = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchLocations(value || '');
        if (isCurrent) {
          setSuggestions(results);
        }
      } catch (err) {
        console.warn('Error fetching location suggestions:', err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    }, 150);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [value, isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (place) => {
    const displayVal = place.name;
    if (onChange) {
      onChange({ target: { value: displayVal, name } });
    }
    if (onPlaceSelect) {
      onPlaceSelect({
        address: place.address || displayVal,
        name: displayVal,
        lat: place.lat,
        lng: place.lng,
      });
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-10">
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      )}

      <input
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={(e) => {
          if (onChange) onChange(e);
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={async () => {
          setIsOpen(true);
          const initial = await searchLocations(value || '');
          setSuggestions(initial);
        }}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`${
          Icon ? 'pl-10' : 'pl-3.5'
        } pr-8 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition placeholder:text-slate-400 outline-none w-full ${className}`}
      />

      {/* Suggestion Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 overflow-hidden max-h-64 overflow-y-auto animate-in fade-in duration-150">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
            <span>Suggested Locations</span>
            {loading && <span className="text-emerald-600 animate-pulse">Searching...</span>}
          </div>

          {suggestions.map((place, idx) => {
            const isSelected = value && value.trim().toLowerCase() === place.name.toLowerCase();
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(place)}
                className={`w-full text-left px-3.5 py-2.5 text-xs flex items-start gap-2.5 transition hover:bg-emerald-50/80 cursor-pointer ${
                  isSelected ? 'bg-emerald-50 text-emerald-950 font-bold' : 'text-slate-800'
                }`}
              >
                <div className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                    <span>{place.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {place.address}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
