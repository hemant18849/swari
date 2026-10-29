import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchForm from '../components/SearchForm';
import { POPULAR_ROUTES } from '../data/mockRides';
import {
  Car,
  Search,
  PlusCircle,
  Users,
  ShieldCheck,
  PiggyBank,
  Leaf,
  Clock,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Sparkles,
  Compass,
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  const handleRouteClick = (from, to) => {
    navigate(`/rides?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`);
  };

  return (
    <div className="flex-1 bg-slate-50">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 border-b border-emerald-100/60 pt-10 pb-16 sm:pt-16 sm:pb-24">
        {/* Subtle background ambient ring */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-emerald-200/20 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Your Destination. Your People. Shared Ride.</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
              Your Journey, <span className="text-emerald-600">Shared.</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              Find people travelling your way and share the cost of your cab journey. Connect with college peers and budget travelers to save up to 75% on intercity cabs.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link
                to="/rides"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm sm:text-base shadow-md shadow-emerald-600/25 transition-all hover:-translate-y-0.5"
              >
                <Search className="w-4 h-4" />
                <span>Find Shared Rides</span>
              </Link>
              <Link
                to="/create-ride"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm sm:text-base shadow-xs transition-all hover:-translate-y-0.5"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Offer a Ride</span>
              </Link>
            </div>

            {/* Key trust bullets */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Split Fare Equally
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified Student Network
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Zero Platform Commission
              </span>
            </div>

          </div>

          {/* Integrated Search Form Box */}
          <div className="mt-10 sm:mt-12 max-w-4xl mx-auto">
            <SearchForm />
          </div>

        </div>
      </section>


      {/* 2. HOW SAWARI WORKS */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-3">
              <Compass className="w-3.5 h-3.5" />
              Simple 4-Step Process
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              How SAWARI Works
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Say goodbye to expensive solo cab fares and packed buses. Splitting rides with fellow students is effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            
            {/* Step 1 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 font-black text-lg flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Search Route</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Enter your departure location, destination city, and preferred travel date to find cabs already leaving your campus or city hub.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 font-black text-lg flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Pick a Cab</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Check verified rider profiles, departure timings, drop points, vehicle comfort, and per-passenger split fares.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 font-black text-lg flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Join or Offer</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Reserve an open seat instantly, or list your own planned cab journey to invite verified travelers to fill remaining spots.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 font-black text-lg flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                4
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Split & Travel</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Meet at the agreed pickup point, travel safely with peers in comfort, and split the final cab fare directly with the group.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* 3. WHY SHARE YOUR RIDE? */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why Share Your Ride?
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Smart travel choices engineered for student wallets, environmental sustainability, and peer safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Value 1 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 border border-emerald-100">
                <PiggyBank className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Save Up to 75%</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                A solo cab across Bhopal (e.g. Rani Kamlapati to Lalghati or Bhopal Jn to RGPV) costs ~₹250 - ₹350. Sharing with 3 co-passengers cuts your personal spend to just ₹60 - ₹80!
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 border border-emerald-100">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Travel with Fellow Students</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Connect with verified students from MANIT, RGPV, AIIMS Bhopal, and nearby campuses. Travel in a safe, friendly, and respectful environment.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 border border-emerald-100">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Lower Carbon Footprint</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Fewer vehicles on busy city roads mean reduced fuel consumption, fewer emissions, and faster transit during rush hours.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* 4. POPULAR ROUTES */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-2">
                <MapPin className="w-3.5 h-3.5" />
                Bhopal Key Corridors
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Popular Student Routes
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Frequent shared cabs moving daily between railway stations, university campuses, and city transit hubs.
              </p>
            </div>
            <Link
              to="/rides"
              className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition group"
            >
              <span>Explore all routes</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {POPULAR_ROUTES.map((route, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 hover:border-emerald-300 hover:shadow-md hover:bg-white transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                      {route.badge}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {route.ridesCount} active rides
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-base font-bold text-slate-900">
                      <span>{route.from}</span>
                      <ArrowRight className="w-4 h-4 text-emerald-600" />
                      <span>{route.to}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                      <span>{route.distance}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {route.duration}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Est. Split Fare</span>
                    <span className="text-base font-extrabold text-emerald-700">{route.avgFare}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRouteClick(route.from, route.to)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    View Rides
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* 5. BENEFITS */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Designed for Everyday Commuters
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Whether you are heading home for Diwali, coming back for exam week, or visiting family on weekends.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Verified Co-Riders</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Connect with verified college and workplace profiles with visible community ratings and feedback.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200/80 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Campus Pickup Points</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Convenient pickup spots right outside student hostels, transit junctions, and popular city metro gates.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200/80 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Comfort & Luggage Space</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Enjoy air-conditioned sedans and spacious cabs with dedicated boot space for campus luggage bags.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200/80 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Flexible Timings</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Coordinate exact departure times with your group rather than waiting for rigid intercity bus timetables.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* 6. CALL TO ACTION BANNER */}
      <section className="py-12 sm:py-16 bg-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-800/60 rounded-3xl p-8 sm:p-12 border border-emerald-600/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-500/30">
                Ready to travel?
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Never Pay Solo Cab Rates Again.
              </h2>
              <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
                Find co-passengers travelling your way or create your own ride in less than 2 minutes.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/rides"
                className="px-6 py-3.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-sm shadow-md transition-all hover:scale-105"
              >
                Find Shared Rides
              </Link>
              <Link
                to="/create-ride"
                className="px-6 py-3.5 rounded-xl bg-emerald-900/80 text-white hover:bg-emerald-900 border border-emerald-500/50 font-bold text-sm transition-all hover:scale-105"
              >
                Post Your Cab
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
