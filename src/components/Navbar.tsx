import React from 'react';
import { Building2, Code2, CalendarCheck, ShieldCheck, Phone, MapPin, Server } from 'lucide-react';
import { Property } from '../types/index.ts';

interface NavbarProps {
  activeTab: 'guest' | 'saas' | 'developer' | 'backend';
  setActiveTab: (tab: 'guest' | 'saas' | 'developer' | 'backend') => void;
  currentProperty: Property;
  properties: Property[];
  onSelectProperty: (propertyId: string) => void;
  onOpenBooking: () => void;
  onOpenLookup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentProperty,
  properties,
  onSelectProperty,
  onOpenBooking,
  onOpenLookup
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Top micro-strip for property context & fast contacts */}
      <div className="bg-slate-900/60 border-b border-slate-800/40 text-xs text-slate-400 py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>GST Road, Opp. OTA, St. Thomas Mount, Chennai</span>
            </span>
            <span className="hidden md:inline-block text-slate-600">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-400">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentProperty.phone}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* SaaS Property Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider font-mono">Tenant:</span>
              <select
                value={currentProperty.id}
                onChange={(e) => onSelectProperty(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-0.5 focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={onOpenLookup}
              className="text-xs text-amber-400/90 hover:text-amber-300 transition-colors font-medium ml-2 cursor-pointer"
            >
              My Bookings
            </button>
          </div>
        </div>
      </div>

      {/* Main Top Bar Contract: Brand - 4-5 Navigation Links - Primary CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Brand Zone: 1-line wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-display font-bold text-lg">
            M
          </div>
          <div className="flex flex-col">
            <a
              href="#top"
              onClick={() => setActiveTab('guest')}
              className="text-lg font-bold tracking-tight text-white font-display hover:text-amber-400 transition-colors whitespace-nowrap"
            >
              {currentProperty.name}
            </a>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              Chennai Airport Hub
            </span>
          </div>
        </div>

        {/* Navigation Links Zone: 4-5 clean single-line links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('guest')}
            className={`transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'guest'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Accommodations
          </button>
          <a
            href="#loyalty"
            onClick={() => setActiveTab('guest')}
            className="hover:text-amber-400 transition-colors whitespace-nowrap text-slate-300"
          >
            Loyalty Club
          </a>
          <a
            href="#dining"
            onClick={() => setActiveTab('guest')}
            className="hover:text-amber-400 transition-colors whitespace-nowrap text-slate-300"
          >
            Delicia Dining
          </a>
          <a
            href="#banquets"
            onClick={() => setActiveTab('guest')}
            className="hover:text-amber-400 transition-colors whitespace-nowrap text-slate-300"
          >
            Banquets & Meetings
          </a>
          <a
            href="#location"
            onClick={() => setActiveTab('guest')}
            className="hover:text-amber-400 transition-colors whitespace-nowrap text-slate-300"
          >
            Location & Transit
          </a>

          {/* Mode Switchers for SaaS & API */}
          <button
            onClick={() => setActiveTab('saas')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'saas'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>SaaS Console</span>
          </button>
          <button
            onClick={() => setActiveTab('developer')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'developer'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Developer API</span>
          </button>
          <button
            onClick={() => setActiveTab('backend')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap px-2.5 py-1 rounded-lg border ${
              activeTab === 'backend'
                ? 'bg-amber-400/10 border-amber-400 text-amber-400 font-semibold'
                : 'border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 bg-slate-900/60'
            }`}
          >
            <Server className="w-4 h-4 text-amber-400" />
            <span>Backend Code</span>
          </button>
        </nav>

        {/* Primary Action Zone: 1 primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {activeTab === 'developer' || activeTab === 'backend' ? (
            <button
              onClick={() => setActiveTab('guest')}
              className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Back to Guest View
            </button>
          ) : (
            <button
              onClick={onOpenBooking}
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm shadow-amber-500/10 cursor-pointer whitespace-nowrap flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Book a Room</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="flex lg:hidden overflow-x-auto items-center gap-4 px-4 py-2 bg-slate-900 border-t border-slate-800 text-xs font-medium text-slate-300">
        <button
          onClick={() => setActiveTab('guest')}
          className={`shrink-0 py-1 ${activeTab === 'guest' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : ''}`}
        >
          Hotel Guest View
        </button>
        <button
          onClick={() => setActiveTab('saas')}
          className={`shrink-0 py-1 flex items-center gap-1 ${activeTab === 'saas' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : ''}`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>SaaS Console</span>
        </button>
        <button
          onClick={() => setActiveTab('developer')}
          className={`shrink-0 py-1 flex items-center gap-1 ${activeTab === 'developer' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : ''}`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Developer API</span>
        </button>
        <button
          onClick={() => setActiveTab('backend')}
          className={`shrink-0 py-1 flex items-center gap-1 ${activeTab === 'backend' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : ''}`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Backend Code</span>
        </button>
      </div>
    </header>
  );
};
