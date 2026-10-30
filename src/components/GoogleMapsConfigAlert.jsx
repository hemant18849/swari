import React, { useState } from 'react';
import { MapPin, Key, AlertTriangle, Check, Copy, ExternalLink, HelpCircle } from 'lucide-react';

export default function GoogleMapsConfigAlert({
  title = 'Google Maps Integration Required',
  message = 'To display interactive maps, live route calculations, and location autocompletion, configure your Google Maps API key.',
  compact = false,
}) {
  const [copied, setCopied] = useState(false);
  const snippet = 'VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here';

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (compact) {
    return (
      <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          <div className="font-bold flex items-center justify-between">
            <span>Google Maps API Key Missing</span>
            <code className="text-[10px] bg-amber-100/90 px-1.5 py-0.5 rounded text-amber-800 font-mono">
              VITE_GOOGLE_MAPS_API_KEY
            </code>
          </div>
          <p className="text-amber-800/90 text-[11px] leading-relaxed">
            Add your key to <span className="font-mono font-bold">.env</span> to enable autocomplete and map preview.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-slate-50 border border-amber-200 p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 shadow-xs">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200">
              Configuration Notice
            </span>
            <span className="text-xs text-slate-500 font-mono">
              VITE_GOOGLE_MAPS_API_KEY
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-1">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {/* Setup Steps Card */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 space-y-3 text-xs text-slate-700">
        <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
          <Key className="w-3.5 h-3.5 text-emerald-600" />
          Quick Setup Instructions:
        </div>

        <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 leading-relaxed pl-1">
          <li>
            Create a <span className="font-mono font-bold text-slate-800">.env</span> file in the project root directory.
          </li>
          <li>
            Add your Google Maps API key using the variable name below:
          </li>
        </ol>

        {/* Code snippet with copy button */}
        <div className="relative flex items-center justify-between bg-slate-900 text-slate-100 rounded-lg p-2.5 sm:p-3 font-mono text-xs overflow-x-auto shadow-inner">
          <code className="text-emerald-400 select-all pr-8">
            {snippet}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-[11px] font-sans font-bold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition shrink-0 cursor-pointer"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Enabled APIs Required */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Required Google Cloud APIs: <strong>Maps JavaScript API</strong>, <strong>Places API</strong>, <strong>Directions API</strong></span>
          </div>
          <a
            href="https://developers.google.com/maps/documentation/javascript/get-api-key"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            <span>Google Maps Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
