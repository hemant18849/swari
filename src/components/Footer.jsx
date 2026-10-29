import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ShieldCheck, Heart, MapPin, Users } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <Car className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">SAWARI</span>
            </div>
            <p className="text-emerald-400 font-medium text-sm">
              Your Destination. Your People. Shared Ride.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              SAWARI connects students and budget-conscious travelers heading from similar pickup spots to identical destinations. Cut intercity cab fares by up to 75% while making travel safer and social.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5" /> Hackathon MVP Edition
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                <Users className="w-3.5 h-3.5" /> Peer-to-Peer
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/rides" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Find Shared Rides
                </Link>
              </li>
              <li>
                <Link to="/create-ride" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Offer a Ride
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Demo Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Hubs */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Top Bhopal Hubs</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>Rani Kamlapati ⇄ Lalghati</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>Bhopal Junction ⇄ RGPV College</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>MANIT Bhopal ⇄ MP Nagar</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>AIIMS Bhopal ⇄ Rani Kamlapati</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {CURRENT_YEAR} SAWARI. All rights reserved. Built for student intercity cab sharing.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for seamless student mobility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
