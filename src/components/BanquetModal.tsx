import React, { useState } from 'react';
import { X, Award, CheckCircle2, Users, Calendar, Volume2, Briefcase } from 'lucide-react';
import { BanquetReservation, Property } from '../types/index.ts';
import { api } from '../services/apiClient.ts';

interface BanquetModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onReserved: (res: BanquetReservation) => void;
}

export const BanquetModal: React.FC<BanquetModalProps> = ({
  property,
  isOpen,
  onClose,
  onReserved
}) => {
  if (!isOpen) return null;

  const nextWeekStr = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];
  const [hallName, setHallName] = useState('Chancellor Grand Hall');
  const [eventType, setEventType] = useState('corporate-conference');
  const [eventDate, setEventDate] = useState(nextWeekStr);
  const [expectedGuests, setExpectedGuests] = useState(60);
  const [cateringPlan, setCateringPlan] = useState('executive-buffet');
  const [audioVisualRequired, setAudioVisualRequired] = useState(true);
  const [guestName, setGuestName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedBanquet, setConfirmedBanquet] = useState<BanquetReservation | null>(null);

  // Cost calculation
  const perGuestRate = cateringPlan === 'royal-spread' ? 1200 : cateringPlan === 'executive-buffet' ? 850 : 650;
  const hallBaseFee = 25000;
  const totalCost = hallBaseFee + (expectedGuests * perGuestRate) + (audioVisualRequired ? 5000 : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail) return;

    try {
      setLoading(true);
      const res = await api.createBanquet({
        hallName,
        eventType,
        guestName,
        companyName,
        guestEmail,
        guestPhone,
        eventDate,
        expectedGuests,
        cateringPlan,
        audioVisualRequired
      });

      setConfirmedBanquet(res);
      onReserved(res);
    } catch (err) {
      console.error('Failed to book banquet', err);
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

        {confirmedBanquet ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                Banquet Reservation Logged
              </span>
              <h3 className="text-2xl font-bold font-display text-white mt-1">
                Hall Reserved for Your Event
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Our Banquet and Corporate Conference coordinator has reserved your slot and will reach out with floorplan specs.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 text-left text-xs space-y-2.5 font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Booking Ref:</span>
                <span className="text-amber-400 font-bold">{confirmedBanquet.referenceCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Venue:</span>
                <span className="text-slate-200">{confirmedBanquet.hallName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Event Date:</span>
                <span className="text-slate-200">{confirmedBanquet.eventDate} ({confirmedBanquet.expectedGuests} Guests)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Catering:</span>
                <span className="text-slate-200 capitalize">{confirmedBanquet.cateringPlan.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-sm">
                <span className="text-slate-300">Estimated Total:</span>
                <span className="text-amber-400 tabular-nums">₹{confirmedBanquet.estimatedCost.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <div>
            <div className="border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-wider">
                <Briefcase className="w-4 h-4" />
                <span>Chancellor Banquet & Boardroom</span>
              </div>
              <h2 className="text-xl font-bold font-display text-white mt-1">
                Book Conference or Banquet Hall
              </h2>
              <p className="text-xs text-slate-400">
                Opposite Officers Training Academy (OTA), GST Road, St. Thomas Mount
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Select Hall
                  </label>
                  <select
                    value={hallName}
                    onChange={(e) => setHallName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Chancellor Grand Hall">Chancellor Grand Hall (Up to 150 pax)</option>
                    <option value="St. Thomas Boardroom">St. Thomas Boardroom (Up to 25 pax)</option>
                    <option value="Rooftop Terrace Pavilion">Rooftop Terrace Pavilion (Up to 80 pax)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="corporate-conference">Corporate Conference / Annual Meeting</option>
                    <option value="seminar">Training Seminar / Workshop</option>
                    <option value="wedding-reception">Family Reception / Engagement</option>
                    <option value="birthday-banquet">Private Banquet Celebration</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Expected Attendees
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={expectedGuests}
                    onChange={(e) => setExpectedGuests(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              {/* Catering & AV */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Delicia Catering Package
                  </label>
                  <select
                    value={cateringPlan}
                    onChange={(e) => setCateringPlan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="standard">Standard Hi-Tea & Snacks (₹650/head)</option>
                    <option value="executive-buffet">Executive Multi-Cuisine Buffet (₹850/head)</option>
                    <option value="royal-spread">Royal Gourmet Feast (₹1,200/head)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 w-full cursor-pointer h-[38px]">
                    <input
                      type="checkbox"
                      checked={audioVisualRequired}
                      onChange={(e) => setAudioVisualRequired(e.target.checked)}
                      className="accent-amber-400"
                    />
                    <span className="text-xs text-slate-300 truncate">
                      Projector & Sound Setup (+₹5,000)
                    </span>
                  </label>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Organizer Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. S. Narayanan"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Organization / Company (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TechCorp India"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="narayanan@techcorp.in"
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
                      placeholder="+91 72999 75113"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Estimate strip */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Estimated Cost Quote:</span>
                <span className="text-amber-400 font-bold text-base tabular-nums">
                  ₹{totalCost.toLocaleString()}
                </span>
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
                  {loading ? 'Reserving...' : 'Submit Banquet Booking'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
