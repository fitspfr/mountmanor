import React, { useState } from 'react';
import { X, Calendar, User, Mail, Phone, Plane, Coffee, ShieldCheck, CheckCircle2, Award } from 'lucide-react';
import { Room, Booking, Property } from '../types/index.ts';
import { api } from '../services/apiClient.ts';

interface BookingModalProps {
  room: Room | null;
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onBookingConfirmed: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  room,
  property,
  isOpen,
  onClose,
  onBookingConfirmed
}) => {
  if (!isOpen || !room) return null;

  // Tomorrow as default check-in, +2 days as check-out
  const today = new Date();
  const defaultCheckIn = new Date(today.getTime() + 86400000).toISOString().split('T')[0];
  const defaultCheckOut = new Date(today.getTime() + 86400000 * 3).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [addonAirportShuttle, setAddonAirportShuttle] = useState(true);
  const [addonBreakfast, setAddonBreakfast] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Nights calculation
  const cIn = new Date(checkIn);
  const cOut = new Date(checkOut);
  const nights = Math.max(1, Math.round((cOut.getTime() - cIn.getTime()) / (1000 * 60 * 60 * 24)));

  // Pricing calculations
  const baseRate = room.pricePerNight * nights;
  const shuttleCost = addonAirportShuttle ? 600 : 0;
  const breakfastCost = addonBreakfast ? 350 * nights * adults : 0;
  const totalAmount = baseRate + shuttleCost + breakfastCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!guestName.trim()) {
      setErrorMessage('Please provide your full guest name.');
      return;
    }
    if (!guestEmail.trim() || !guestEmail.includes('@')) {
      setErrorMessage('Please provide a valid email address for confirmation voucher.');
      return;
    }
    if (!guestPhone.trim()) {
      setErrorMessage('Please enter your mobile phone number.');
      return;
    }

    try {
      setLoading(true);
      const booking = await api.createBooking({
        roomId: room.id,
        guestName,
        guestEmail,
        guestPhone,
        checkIn,
        checkOut,
        adults,
        children,
        addonAirportShuttle,
        addonBreakfast
      });

      setConfirmedBooking(booking);
      onBookingConfirmed(booking);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Unable to confirm reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedBooking ? (
          /* Confirmation State */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                Reservation Confirmed
              </span>
              <h3 className="text-2xl font-bold font-display text-white mt-1">
                We Look Forward to Welcoming You
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                A confirmation voucher and check-in briefing have been logged in the system.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 text-left text-xs space-y-3 font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Reference Code:</span>
                <span className="text-amber-400 font-bold tracking-wider">{confirmedBooking.referenceCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Property:</span>
                <span className="text-slate-200">{property.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Accommodation:</span>
                <span className="text-slate-200">{confirmedBooking.roomName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Guest Name:</span>
                <span className="text-slate-200">{confirmedBooking.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dates ({confirmedBooking.nights} Night{confirmedBooking.nights > 1 ? 's' : ''}):</span>
                <span className="text-slate-200">{confirmedBooking.checkIn} to {confirmedBooking.checkOut}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-sm">
                <span className="text-slate-300">Total Payable at Check-in:</span>
                <span className="text-amber-400 tabular-nums">
                  {property.currencySymbol}{confirmedBooking.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-emerald-400 font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Loyalty Points Credited:</span>
                </span>
                <span className="font-mono">
                  +{(confirmedBooking.nights * 100) + Math.floor(confirmedBooking.totalAmount / 100)} pts
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Close & Return to Portal
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <div>
            <div className="border-b border-slate-800 pb-4 mb-6">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                Direct Booking Engine
              </span>
              <h2 className="text-xl font-bold font-display text-white mt-1">
                {room.name}
              </h2>
              <p className="text-xs text-slate-400">
                {property.name} · GST Road, St. Thomas Mount, Chennai
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Check-in Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Check-out Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Guest Counts */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Adults
                  </label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value={1}>1 Adult</option>
                    <option value={2}>2 Adults</option>
                    <option value={3}>3 Adults</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Children
                  </label>
                  <select
                    value={children}
                    onChange={(e) => setChildren(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value={0}>0 Children</option>
                    <option value={1}>1 Child</option>
                    <option value={2}>2 Children</option>
                  </select>
                </div>
              </div>

              {/* Guest Contact Details */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Primary Guest Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Anand Venkatesh"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98400 12345"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Hospitality Add-ons */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                  Enhance Your Stay:
                </span>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer">
                  <div className="flex items-center gap-2 text-xs text-slate-200">
                    <Plane className="w-4 h-4 text-amber-400" />
                    <span>Airport Transit Shuttle (Chennai International Airport)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-300">+₹600</span>
                    <input
                      type="checkbox"
                      checked={addonAirportShuttle}
                      onChange={(e) => setAddonAirportShuttle(e.target.checked)}
                      className="accent-amber-400"
                    />
                  </div>
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer">
                  <div className="flex items-center gap-2 text-xs text-slate-200">
                    <Coffee className="w-4 h-4 text-amber-400" />
                    <span>Daily Delicia Breakfast Buffet ({nights} night{nights > 1 ? 's' : ''})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-300">+₹{350 * nights * adults}</span>
                    <input
                      type="checkbox"
                      checked={addonBreakfast}
                      onChange={(e) => setAddonBreakfast(e.target.checked)}
                      className="accent-amber-400"
                    />
                  </div>
                </label>
              </div>

              {/* Live Price Summary Box */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Room Tariff ({nights} night{nights > 1 ? 's' : ''} × ₹{room.pricePerNight.toLocaleString()}):</span>
                  <span className="tabular-nums">₹{baseRate.toLocaleString()}</span>
                </div>
                {addonAirportShuttle && (
                  <div className="flex justify-between text-slate-400">
                    <span>Airport Transfer:</span>
                    <span className="tabular-nums">₹600</span>
                  </div>
                )}
                {addonBreakfast && (
                  <div className="flex justify-between text-slate-400">
                    <span>Buffet Breakfast:</span>
                    <span className="tabular-nums">₹{breakfastCost.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold text-white">
                  <span>Total Amount (Taxes included):</span>
                  <span className="text-amber-400 tabular-nums">
                    {property.currencySymbol}{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  {loading ? 'Confirming...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
