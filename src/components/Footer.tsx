import React from 'react';
import { Property } from '../types/index.ts';
import { Phone, Mail, MapPin, Code2, Building2, Server } from 'lucide-react';

interface FooterProps {
  property: Property;
  onSelectTab: (tab: 'guest' | 'saas' | 'developer' | 'backend') => void;
}

export const Footer: React.FC<FooterProps> = ({ property, onSelectTab }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-display font-bold text-sm">
                M
              </div>
              <span className="text-base font-bold font-display text-white">
                {property.name}
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Business-class hospitality on GST Road, Chennai. Modern suites, Delicia dining, and executive conference spaces.
            </p>
            <div className="text-[11px] font-mono text-slate-500">
              Legacy PHP to Modern React + Laravel API Platform
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-white block">
              Hotel Guest Services
            </span>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button
                  onClick={() => onSelectTab('guest')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Rooms & Executive Suites
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('guest')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Delicia Multi-Cuisine Restaurant
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('guest')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Chancellor Grand Banquet Hall
                </button>
              </li>
              <li>
                <a
                  href="#location"
                  onClick={() => onSelectTab('guest')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Chennai Airport & Metro Transit
                </a>
              </li>
            </ul>
          </div>

          {/* SaaS & Developer */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-white block">
              Hospitality SaaS & API
            </span>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button
                  onClick={() => onSelectTab('saas')}
                  className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Multi-Tenant Console</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('developer')}
                  className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Developer API Sandbox</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('backend')}
                  className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5 text-amber-400 font-semibold"
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>Laravel Backend Code</span>
                </button>
              </li>
              <li>
                <a
                  href="/api/v1/docs/openapi.json"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-400 transition-colors font-mono"
                >
                  OpenAPI 3.0 Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Address */}
          <div className="space-y-2.5">
            <span className="text-xs font-mono uppercase tracking-wider text-white block">
              Hotel Desk & Reservations
            </span>
            <div className="space-y-2 text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{property.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${property.phone}`} className="hover:text-white transition-colors">
                  {property.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${property.email}`} className="hover:text-white transition-colors">
                  {property.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Hotel Mount Manor Chennai (mountmanor.com). Modernized Hospitality SaaS Engine.
          </div>
          <div className="flex items-center gap-3">
            <span>GSTIN: 33AAACM1234F1Z5</span>
            <span>·</span>
            <span>Opp. Officers Training Academy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
