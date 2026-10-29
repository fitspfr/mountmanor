import React, { useState } from 'react';
import { X, Utensils, CheckCircle2, Clock, Users, Calendar } from 'lucide-react';
import { DiningReservation, Property } from '../types/index.ts';
import { api } from '../services/apiClient.ts';

interface DiningModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onReserved: (res: DiningReservation) => void;
}

export const DiningModal: React.FC<DiningModalProps> = ({
  property,
  isOpen,
  onClose,
  onReserved
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [timeSlot, setTimeSlot] = useState('07:30 PM');
  const [guestCount, setGuestCount] = useState(2);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [seatingPreference, setSeatingPreference] = useState('indoor-ac');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<DiningReservation | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail) return;

    try {
      setLoading(true);
      const res = await api.createDiningReservation({
        guestName,
        guestEmail,
        guestPhone,
        date,
        timeSlot,
        guestCount,
        seatingPreference,
        specialRequests
      });

      setConfirmedReservation(res);
      onReserved(res);
    } catch (err) {
      console.error('Failed to reserve table', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedReservation ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                Delicia Table Reserved
              </span>
              <h3 className="text-2xl font-bold font-display text-white mt-1">
                Your Table is Awaiting You
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                We have notified our head chef and hostess at Delicia Restaurant.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 text-left text-xs space-y-2.5 font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Pass Code:</span>
                <span className="text-amber-400 font-bold">{confirmedReservation.referenceCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Guest:</span>
                <span className="text-slate-200">{confirmedReservation.guestName} ({confirmedReservation.guestCount} Guests)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date & Slot:</span>
                <span className="text-slate-200">{confirmedReservation.date} · {confirmedReservation.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Seating:</span>
                <span className="text-slate-200 capitalize">{confirmedReservation.seatingPreference.replace('-', ' ')}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-wider">
                <Utensils className="w-4 h-4" />
                <span>Delicia Fine Dining & Buffet</span>
              </div>
              <h2 className="text-xl font-bold font-display text-white mt-1">
                Reserve a Dining Table
              </h2>
              <p className="text-xs text-slate-400">
                Opposite Officers Training Academy, Mount Manor, Chennai
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Seating Time
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="12:30 PM">12:30 PM (Lunch)</option>
                    <option value="01:30 PM">01:30 PM (Lunch)</option>
                    <option value="07:00 PM">07:00 PM (Dinner)</option>
                    <option value="07:30 PM">07:30 PM (Dinner)</option>
                    <option value="08:30 PM">08:30 PM (Dinner)</option>
                    <option value="09:30 PM">09:30 PM (Late Dinner)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Seating Zone
                  </label>
                  <select
                    value={seatingPreference}
                    onChange={(e) => setSeatingPreference(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="indoor-ac">Main Air-Conditioned Hall</option>
                    <option value="executive-booth">Executive Private Booth</option>
                    <option value="family-lounge">Family Corner Lounge</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Krishnan"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="ramesh@gmail.com"
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
                      placeholder="+91 72999 75115"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Dietary Notes / Special Occasion (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pure vegetarian setup / Anniversary cake requested"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

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
                  {loading ? 'Reserving...' : 'Book Delicia Table'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
