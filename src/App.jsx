 import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import FindRidesPage from './pages/FindRidesPage';
import RideDetailsPage from './pages/RideDetailsPage';
import CreateRidePage from './pages/CreateRidePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import { AlertCircle, ArrowLeft } from 'lucide-react';

// Friendly placeholder component for 404
function NotFoundPage() {
  return (
    <div className="flex-1 max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mb-6 border border-amber-100">
        <AlertCircle className="w-8 h-8" />
      </div>
      <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">
        404 Not Found
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
        Page Not Found
      </h1>
      <p className="text-slate-600 text-base max-w-lg mx-auto mb-8 leading-relaxed">
        The route you are trying to access does not exist on SAWARI.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Homepage
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-800">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/rides" element={<FindRidesPage />} />
            <Route path="/rides/:id" element={<RideDetailsPage />} />
            <Route path="/create-ride" element={<CreateRidePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            {/* Catch-all 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
