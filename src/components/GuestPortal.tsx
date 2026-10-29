import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Search,
  Plane,
  Train,
  ShieldCheck,
  Star,
  MapPin,
  Utensils,
  Briefcase,
  Wifi,
  Clock,
  Sparkles,
  ArrowRight,
  PhoneCall
} from 'lucide-react';
import { Property, Room, Booking } from '../types/index.ts';
import { RoomCard } from './RoomCard.tsx';
import { LoyaltySystem } from './LoyaltySystem.tsx';

interface GuestPortalProps {
  property: Property;
  rooms: Room[];
  onOpenBooking: (room?: Room) => void;
  onOpenDining: () => void;
  onOpenBanquet: () => void;
  onOpenLookup: () => void;
}

export const GuestPortal: React.FC<GuestPortalProps> = ({
  property,
  rooms,
  onOpenBooking,
  onOpenDining,
  onOpenBanquet,
  onOpenLookup
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchCheckIn, setSearchCheckIn] = useState('');
  const [searchCheckOut, setSearchCheckOut] = useState('');
  const [searchGuests, setSearchGuests] = useState('2');

  const filteredRooms = selectedCategory === 'all'
    ? rooms
    : rooms.filter((r) => r.category === selectedCategory);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const firstMatch = filteredRooms[0] || rooms[0];
    onOpenBooking(firstMatch);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION & FAST AVAILABILITY SEARCH */}
      <section className="relative pt-10 sm:pt-16 pb-12 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          {/* Proximity Pill Strip (Unboxed metadata with separators) */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-400 mb-4">
            <span className="flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5" />
              <span>10 Mins to Chennai Airport (4.2 km)</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5" />
              <span>Next to Nanganallur Road Metro</span>
            </span>
            <span className="text-slate-600">·</span>
            <span>Opp. Officers Training Academy (OTA)</span>
          </div>

          {/* Main Hero Headline */}
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display text-white tracking-tight leading-[1.1] text-balance">
              Refined Business-Class Hospitality on GST Road
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl">
              Chennai’s preferred destination for corporate executives and transit travelers. Modern soundproofed suites, acclaimed multi-cuisine dining at Delicia, and executive banquet halls.
            </p>
          </div>

          {/* Quick Direct Rate & Availability Strip */}
          <form
            onSubmit={handleHeroSearch}
            className="mt-10 p-3 sm:p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl shadow-black/50 backdrop-blur-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Check-in Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={searchCheckIn}
                  onChange={(e) => setSearchCheckIn(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Check-out Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={searchCheckOut}
                  onChange={(e) => setSearchCheckOut(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Guests & Room
              </label>
              <select
                value={searchGuests}
                onChange={(e) => setSearchGuests(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="1">1 Adult · Solo Executive</option>
                <option value="2">2 Adults · Deluxe Stay</option>
                <option value="3">3 Adults · Suite Stay</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full h-[42px] bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-400/10"
              >
                <Search className="w-4 h-4" />
                <span>Check Live Rates</span>
              </button>
            </div>
          </form>

          {/* Key Value Proof Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800/80 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Direct Best Rate Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Airport Meet & Greet Shuttle</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Gigabit Wi-Fi & Work Desks</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Flexible 24-Hr Check-In Desk</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ACCOMMODATIONS & ROOMS SHOWCASE */}
      <section id="rooms" className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              Accommodations
            </span>
            <h2 className="text-3xl font-bold font-display text-white mt-1">
              Engineered for Deep Rest & Productivity
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              All rooms feature high acoustic soundproofing, orthopedic spring bedding, ergonomic work stations, and en-suite rain showers.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
            {['all', 'standard', 'deluxe', 'suite'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All Rooms' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              currencySymbol={property.currencySymbol}
              onBook={(r) => onOpenBooking(r)}
            />
          ))}
        </div>
      </section>

      {/* 3. MANOR PRIVILEGES & LOYALTY POINTS ENGINE */}
      <LoyaltySystem
        property={property}
        onOpenBooking={() => onOpenBooking()}
        onOpenDining={onOpenDining}
      />

      {/* 4. DELICIA RESTAURANT & DINING SPOTLIGHT */}
      <section id="dining" className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/20 border border-slate-800 rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-widest">
                <Utensils className="w-4 h-4" />
                <span>On-Site Restaurant & Room Service</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-white">
                Delicia Multi-Cuisine Restaurant
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                From authentic traditional South Indian breakfasts with freshly ground filter coffee to fragrant North Indian tandoor grills and continental executive lunches, Delicia caters to international and regional culinary tastes.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono text-slate-300">
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="block text-slate-500 uppercase text-[10px]">Morning Buffet</span>
                  <span className="font-bold text-white">07:00 AM - 10:30 AM</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="block text-slate-500 uppercase text-[10px]">Executive Lunch</span>
                  <span className="font-bold text-white">12:30 PM - 03:30 PM</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="block text-slate-500 uppercase text-[10px]">Dinner & Tandoor</span>
                  <span className="font-bold text-white">07:00 PM - 11:00 PM</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <button
                  onClick={onOpenDining}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-amber-400/10"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reserve a Table</span>
                </button>
                <a
                  href={`tel:${property.alternatePhone || property.phone}`}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                  <span>Call Dining Desk</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-6 space-y-4">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block">
                Delicia Specialties
              </span>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex justify-between items-baseline border-b border-slate-800/80 pb-2">
                  <div>
                    <span className="font-bold text-white block">Chettinad Pepper Chicken</span>
                    <span className="text-[11px] text-slate-400">Authentic roasted spices, shallots, curry leaves</span>
                  </div>
                  <span className="font-mono text-amber-400 tabular-nums">₹420</span>
                </li>
                <li className="flex justify-between items-baseline border-b border-slate-800/80 pb-2">
                  <div>
                    <span className="font-bold text-white block">Paneer Butter Masala</span>
                    <span className="text-[11px] text-slate-400">Cottage cheese simmered in rich makhani gravy</span>
                  </div>
                  <span className="font-mono text-amber-400 tabular-nums">₹360</span>
                </li>
                <li className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-white block">Mount Manor Special Biryani</span>
                    <span className="text-[11px] text-slate-400">Dum-cooked seeraga samba with raita and mirchi ka salan</span>
                  </div>
                  <span className="font-mono text-amber-400 tabular-nums">₹480</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CHANCELLOR BANQUET & CONFERENCE SPACES */}
      <section id="banquets" className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              Corporate & Celebrations
            </span>
            <h2 className="text-3xl font-bold font-display text-white">
              Chancellor Grand Hall & St. Thomas Boardroom
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Host high-impact corporate board meetings, training seminars, dealer meets, or family gatherings with dedicated audio-visual rigs, flexible seating arrangements, and customized Delicia catering packages.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white font-display">Chancellor Grand Hall</h4>
                  <span className="text-xs text-slate-400">Capacity: Up to 150 Attendees · Banquet / Theater style</span>
                </div>
                <span className="text-xs font-mono text-amber-400 font-bold bg-amber-400/10 px-2.5 py-1 rounded">
                  From ₹25,000
                </span>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white font-display">St. Thomas Boardroom</h4>
                  <span className="text-xs text-slate-400">Capacity: 20–25 Delegates · Executive U-Shape setup</span>
                </div>
                <span className="text-xs font-mono text-amber-400 font-bold bg-amber-400/10 px-2.5 py-1 rounded">
                  From ₹12,000
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenBanquet}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-amber-400/10"
              >
                <Briefcase className="w-4 h-4" />
                <span>Inquire Hall Reservation & Catering</span>
              </button>
            </div>
          </div>

          {/* Specs & Layout diagram */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Facility Specifications
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl">
                <span className="block text-slate-500 font-mono text-[10px]">Dimensions</span>
                <span className="font-bold text-white font-mono">1,850 sq.ft Floor Area</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl">
                <span className="block text-slate-500 font-mono text-[10px]">Acoustics</span>
                <span className="font-bold text-white">Full Sound Dampening</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl">
                <span className="block text-slate-500 font-mono text-[10px]">Projection</span>
                <span className="font-bold text-white">Laser 4K Projector + Dual Displays</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl">
                <span className="block text-slate-500 font-mono text-[10px]">Power Backup</span>
                <span className="font-bold text-white font-mono">100% DG Generator Backed</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Valet parking available for conference attendees along GST Road service lane.
            </p>
          </div>
        </div>
      </section>

      {/* 5. LOCATION, CONNECTIVITY & TRANSIT */}
      <section id="location" className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              Strategic GST Road Connectivity
            </span>
            <h2 className="text-3xl font-bold font-display text-white mt-1">
              Minutes From Airport, Metro & Industrial Corridors
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Located directly opposite the Officers Training Academy (OTA) on Grand Southern Trunk Road, Mount Manor offers unmatched speed for business travelers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <Plane className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-white font-display text-sm">Chennai International Airport</h4>
              <p className="text-xs text-slate-400 font-mono">4.2 km · 10 Mins via GST Flyover</p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <Train className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-white font-display text-sm">Nanganallur Road Metro</h4>
              <p className="text-xs text-slate-400 font-mono">400 meters · 4 Mins Walk</p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <Briefcase className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-white font-display text-sm">Guindy Industrial Hub</h4>
              <p className="text-xs text-slate-400 font-mono">4.5 km · 12 Mins Direct Drive</p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-white font-display text-sm">Chennai Trade Centre (CTC)</h4>
              <p className="text-xs text-slate-400 font-mono">5.0 km · 15 Mins Drive</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 gap-4">
            <div>
              <span className="font-bold text-white block">GPS Location:</span>
              <span>13.0033° N, 80.2018° E · No. 14 GST Road, St. Thomas Mount, Chennai 600016</span>
            </div>
            <a
              href="https://maps.google.com/?q=Hotel+Mount+Manor+GST+Road+Chennai"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-medium rounded-lg transition-colors shrink-0"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
