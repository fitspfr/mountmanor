import React from 'react';
import { Users, Bed, Maximize2, Check, ArrowRight } from 'lucide-react';
import { Room } from '../types/index.ts';

interface RoomCardProps {
  room: Room;
  currencySymbol: string;
  onBook: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, currencySymbol, onBook }) => {
  // Sophisticated visual backdrop tailored to room category
  const gradientStyles: Record<string, string> = {
    standard: 'from-slate-900 via-slate-800 to-indigo-950/40',
    deluxe: 'from-slate-900 via-amber-950/30 to-slate-800',
    suite: 'from-amber-950/50 via-slate-900 to-slate-850',
    executive: 'from-slate-900 via-sky-950/40 to-slate-800'
  };

  return (
    <div className="group relative bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg shadow-black/40">
      {/* Visual media banner container with zero-broken-image resilience */}
      <div className={`relative h-56 w-full bg-gradient-to-br ${gradientStyles[room.category] || gradientStyles.standard} flex flex-col justify-between p-5 border-b border-slate-800/80`}>
        {/* Subtle geometric luxury backdrop pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400/90 font-medium bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded">
            {room.category} Class
          </span>
          {room.badge && (
            <span className="text-xs font-semibold text-slate-950 bg-amber-400 px-2.5 py-0.5 rounded shadow-sm">
              {room.badge}
            </span>
          )}
        </div>

        {/* Room Title on Media Canvas */}
        <div className="relative z-10">
          <h3 className="text-xl font-bold font-display text-white tracking-tight group-hover:text-amber-300 transition-colors">
            {room.name}
          </h3>
          <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
            {room.tagline}
          </p>
        </div>
      </div>

      {/* Details & Specs */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Key Metric Specs strip */}
          <div className="grid grid-cols-3 gap-2 py-3 border-b border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>{room.capacity.adults} Guests</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate">{room.bedType}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono tabular-nums">
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{room.sizeSqFt} sq.ft</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
            {room.description}
          </p>

          {/* Amenities List */}
          <div className="mt-4 space-y-1.5">
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
              Included Amenities:
            </span>
            <div className="grid grid-cols-2 gap-1 text-xs text-slate-300 pt-1">
              {room.amenities.slice(0, 4).map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-1.5 truncate">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Price & Booking Button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tabular-nums text-white">
                {currencySymbol}{room.pricePerNight.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">/ night</span>
            </div>
            {room.originalPricePerNight > room.pricePerNight && (
              <span className="text-xs text-slate-400 line-through font-mono">
                {currencySymbol}{room.originalPricePerNight.toLocaleString()}
              </span>
            )}
          </div>

          <button
            onClick={() => onBook(room)}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm group-hover:translate-x-0.5"
          >
            <span>Reserve</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
