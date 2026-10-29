import React, { useState } from 'react';
import { X, Search, Calendar, User, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { Booking, Property } from '../types/index.ts';
import { api } from '../services/apiClient.ts';

interface BookingLookupModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingLookupModal: React.FC<BookingLookupModalProps> = ({
  property,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Booking[] | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setSearched(true);
      const allBookings = await api.getBookings();
      const q = searchQuery.trim().toLowerCase();

      const matched = allBookings.filter(
        (b) =>
          b.referenceCode.toLowerCase().includes(q) ||
          b.guestEmail.toLowerCase().includes(q) ||
          b.guestPhone.includes(q)
      );

      setResults(matched);
    } catch (err) {
      console.error('Failed to lookup bookings', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-slate-800 pb-4 mb-5">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
            Guest Self-Service
          </span>
          <h2 className="text-xl font-bold font-display text-white mt-1">
            Look Up Reservation
          </h2>
          <p className="text-xs text-slate-400">
            Enter your booking reference code (e.g. MM-RES-88219) or email address
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="e.g. MM-RES-88219 or your email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-8 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching...' : 'Find'}</span>
          </button>
        </form>

        {/* Results Area */}
        {searched && (
          <div className="space-y-4">
            {results && results.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {results.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-white">{booking.roomName}</span>
                      </div>
                      <span className="font-mono text-amber-400 font-bold bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded">
                        {booking.referenceCode}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono text-[11px]">
                      <div>
                        <span className="block text-slate-500">Guest:</span>
                        <span className="text-slate-200">{booking.guestName}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500">Contact:</span>
                        <span className="text-slate-200">{booking.guestPhone}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500">Check-in:</span>
                        <span className="text-slate-200">{booking.checkIn}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500">Check-out:</span>
                        <span className="text-slate-200">{booking.checkOut} ({booking.nights} night{booking.nights > 1 ? 's' : ''})</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-slate-300">
                      <span>Total Tariff:</span>
                      <span className="font-bold text-amber-400 font-mono text-sm tabular-nums">
                        {property.currencySymbol}{booking.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-500" />
                <p className="text-xs">
                  No active reservations found matching "{searchQuery}".
                </p>
                <p className="text-[11px] text-slate-500">
                  Please verify your reference code or call reservations at {property.phone}.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
