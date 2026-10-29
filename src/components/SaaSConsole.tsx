import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Bed,
  CalendarCheck,
  TrendingUp,
  DollarSign,
  Users,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers
} from 'lucide-react';
import { Property, Room, Booking, DiningReservation, BanquetReservation } from '../types/index.ts';
import { api } from '../services/apiClient.ts';

interface SaaSConsoleProps {
  currentProperty: Property;
  properties: Property[];
  rooms: Room[];
  bookings: Booking[];
  diningReservations: DiningReservation[];
  banquetReservations: BanquetReservation[];
  onSelectProperty: (propertyId: string) => void;
  onRefreshData: () => void;
}

export const SaaSConsole: React.FC<SaaSConsoleProps> = ({
  currentProperty,
  properties,
  rooms,
  bookings,
  diningReservations,
  banquetReservations,
  onSelectProperty,
  onRefreshData
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'bookings' | 'rooms' | 'dining' | 'banquets' | 'new-tenant'>('bookings');
  const [bookingFilter, setBookingFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add Room form state
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCategory, setNewRoomCategory] = useState<'standard' | 'deluxe' | 'suite' | 'executive'>('deluxe');
  const [newRoomPrice, setNewRoomPrice] = useState(3800);
  const [newRoomBed, setNewRoomBed] = useState('King Bed');
  const [newRoomUnits, setNewRoomUnits] = useState(6);

  // New Tenant form state
  const [tenantName, setTenantName] = useState('');
  const [tenantCity, setTenantCity] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantMessage, setTenantMessage] = useState<string | null>(null);

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = bookingFilter === 'all' || b.status === bookingFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery = !q || b.guestName.toLowerCase().includes(q) || b.referenceCode.toLowerCase().includes(q) || b.roomName.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });

  // Calculate SaaS KPIs
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.status === 'confirmed' ? b.totalAmount : 0), 0);
  const totalRoomsCount = rooms.reduce((sum, r) => sum + r.availableUnits, 0);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName) return;

    try {
      await api.createRoom({
        name: newRoomName,
        category: newRoomCategory,
        pricePerNight: Number(newRoomPrice),
        bedType: newRoomBed,
        availableUnits: Number(newRoomUnits),
        amenities: ['Wi-Fi', 'Air Conditioning', 'LED TV', 'Breakfast Buffet']
      });

      setIsAddingRoom(false);
      setNewRoomName('');
      onRefreshData();
    } catch (err) {
      console.error('Failed to create room', err);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName || !tenantCity || !tenantEmail) return;

    try {
      const created = await api.createProperty({
        name: tenantName,
        city: tenantCity,
        email: tenantEmail,
        phone: tenantPhone
      });

      setTenantMessage(`Tenant '${created.name}' successfully onboarded!`);
      setTenantName('');
      setTenantCity('');
      setTenantEmail('');
      setTenantPhone('');
      onRefreshData();
      onSelectProperty(created.id);
    } catch (err) {
      console.error('Failed to create tenant', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header with Tenant Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
            <Building2 className="w-4 h-4" />
            <span>Hospitality SaaS Management Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
            {currentProperty.name} Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tenant ID: <code className="text-amber-300 font-mono">{currentProperty.id}</code> · {currentProperty.city}, {currentProperty.state}
          </p>
        </div>

        {/* Tenant Switcher & Add Tenant CTA */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-mono uppercase text-slate-400">Switch Hotel Tenant:</label>
            <select
              value={currentProperty.id}
              onChange={(e) => onSelectProperty(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setActiveSubTab('new-tenant')}
            className="mt-4 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Onboard Hotel</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Confirmed Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {currentProperty.currencySymbol}{totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">
            Direct & Partner API Bookings
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Total Reservations</span>
            <CalendarCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {bookings.length}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {bookings.filter((b) => b.status === 'confirmed').length} Active Confirmations
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Room Inventory</span>
            <Bed className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalRoomsCount} <span className="text-xs text-slate-400 font-normal">units</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Across {rooms.length} room categories
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Delicia Dining Tables</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {diningReservations.length}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {banquetReservations.length} Banquet Inquiries
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveSubTab('bookings')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'bookings'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Room Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveSubTab('rooms')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'rooms'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Room Categories & Pricing ({rooms.length})
        </button>
        <button
          onClick={() => setActiveSubTab('dining')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'dining'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Delicia Dining ({diningReservations.length})
        </button>
        <button
          onClick={() => setActiveSubTab('banquets')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'banquets'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Banquets ({banquetReservations.length})
        </button>
        <button
          onClick={() => setActiveSubTab('new-tenant')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'new-tenant'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Register New Tenant
        </button>
      </div>

      {/* 1. BOOKINGS SUB-TAB */}
      {activeSubTab === 'bookings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search guest name or ref code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Status:</span>
              <select
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-2 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ref Code</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Check-in / Out</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-amber-400 font-bold">
                        {b.referenceCode}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{b.guestName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{b.guestEmail} · {b.guestPhone}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {b.roomName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {b.checkIn} to {b.checkOut} ({b.nights}n)
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                        {currentProperty.currencySymbol}{b.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{b.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No bookings found for the current search filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ROOM INVENTORY SUB-TAB */}
      {activeSubTab === 'rooms' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold font-display text-white">
              Inventory & Tariff Management
            </h3>
            <button
              onClick={() => setIsAddingRoom(!isAddingRoom)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingRoom ? 'Close Form' : 'Add Room Category'}</span>
            </button>
          </div>

          {isAddingRoom && (
            <form onSubmit={handleCreateRoom} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <span className="text-xs font-mono uppercase text-amber-400 tracking-wider block">
                Define New Room Category
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Room Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Club Luxury Studio"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Class / Category</label>
                  <select
                    value={newRoomCategory}
                    onChange={(e) => setNewRoomCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="suite">Suite</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nightly Tariff (₹)</label>
                  <input
                    type="number"
                    value={newRoomPrice}
                    onChange={(e) => setNewRoomPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Bed Configuration</label>
                  <input
                    type="text"
                    placeholder="e.g. King Bed or Twin Beds"
                    value={newRoomBed}
                    onChange={(e) => setNewRoomBed(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Available Units</label>
                  <input
                    type="number"
                    value={newRoomUnits}
                    onChange={(e) => setNewRoomUnits(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingRoom(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer hover:bg-amber-300"
                >
                  Save to Inventory
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold tracking-wider">
                      {room.category}
                    </span>
                    <h4 className="font-bold text-white font-display text-base">{room.name}</h4>
                  </div>
                  <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                    {room.availableUnits} units
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">Nightly Rate:</span>
                  <span className="font-bold text-amber-400 font-mono text-sm tabular-nums">
                    {currentProperty.currencySymbol}{room.pricePerNight.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DINING SUB-TAB */}
      {activeSubTab === 'dining' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold font-display text-white">
            Delicia Restaurant Table Bookings
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ref</th>
                  <th className="py-3 px-4">Guest Name</th>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Covers</th>
                  <th className="py-3 px-4">Seating</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {diningReservations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono text-amber-400 font-bold">{d.referenceCode}</td>
                    <td className="py-3 px-4 text-white font-medium">{d.guestName}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{d.date} · {d.timeSlot}</td>
                    <td className="py-3 px-4 font-mono">{d.guestCount} Guests</td>
                    <td className="py-3 px-4 capitalize text-slate-300">{d.seatingPreference.replace('-', ' ')}</td>
                    <td className="py-3 px-4 text-slate-400 italic text-[11px]">{d.specialRequests || 'Standard setup'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. BANQUETS SUB-TAB */}
      {activeSubTab === 'banquets' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold font-display text-white">
            Banquet & Corporate Conference Inquiries
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ref</th>
                  <th className="py-3 px-4">Organizer</th>
                  <th className="py-3 px-4">Hall</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Attendees</th>
                  <th className="py-3 px-4 text-right">Estimate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {banquetReservations.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono text-amber-400 font-bold">{b.referenceCode}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{b.guestName}</div>
                      <div className="text-[11px] text-slate-400">{b.companyName || 'Private Event'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{b.hallName}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{b.eventDate}</td>
                    <td className="py-3 px-4 font-mono">{b.expectedGuests} Guests</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400 tabular-nums">
                      ₹{b.estimatedCost.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. REGISTER NEW TENANT SUB-TAB */}
      {activeSubTab === 'new-tenant' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              Multi-Tenant Architecture
            </span>
            <h3 className="text-xl font-bold font-display text-white mt-1">
              Onboard a New Hotel Property
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Creates an isolated tenant account with its own room inventory, independent pricing, and dedicated third-party API scopes.
            </p>
          </div>

          {tenantMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{tenantMessage}</span>
            </div>
          )}

          <form onSubmit={handleCreateTenant} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Hotel / Resort Property Name
              </label>
              <input
                type="text"
                placeholder="e.g. Palm Grove Business Suites"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  City Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Coimbatore or Bengaluru"
                  value={tenantCity}
                  onChange={(e) => setTenantCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+91 98888 12345"
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Operations Email
              </label>
              <input
                type="email"
                placeholder="admin@palmgrove.com"
                value={tenantEmail}
                onChange={(e) => setTenantEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Deploy New Hotel Tenant
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
