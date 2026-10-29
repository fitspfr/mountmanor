import React, { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  Crown,
  ShieldCheck,
  ChevronRight,
  Gift,
  ArrowRight,
  CheckCircle2,
  Lock,
  Clock,
  Coffee,
  Plane,
  Utensils,
  Search,
  Copy,
  Check
} from 'lucide-react';
import { LoyaltyProfile, Property } from '../types/index.ts';
import { api } from '../services/apiClient.ts';

interface LoyaltySystemProps {
  property: Property;
  onOpenBooking: () => void;
  onOpenDining: () => void;
}

export const LoyaltySystem: React.FC<LoyaltySystemProps> = ({
  property,
  onOpenBooking,
  onOpenDining
}) => {
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<string>('karthik.r@techcorp.in');
  const [customEmailInput, setCustomEmailInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [redeeming, setRedeeming] = useState<boolean>(false);
  const [redeemedVoucher, setRedeemedVoucher] = useState<{
    code: string;
    description: string;
    points: number;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const fetchLoyalty = async (email: string) => {
    try {
      setLoading(true);
      const data = await api.getLoyaltyStatus(email);
      setProfile(data);
    } catch (err) {
      console.error('Failed to load loyalty status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyalty(selectedEmail);
  }, [selectedEmail]);

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmailInput.trim()) return;
    setSelectedEmail(customEmailInput.trim().toLowerCase());
  };

  const handleRedeem = async (points: number, type: string) => {
    if (!profile || profile.pointsBalance < points) return;
    try {
      setRedeeming(true);
      const res = await api.redeemLoyaltyPoints(points, type);
      setRedeemedVoucher({
        code: res.voucherCode,
        description: res.description,
        points: res.redeemedPoints
      });
      // Deduct locally and refresh
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              pointsBalance: Math.max(0, prev.pointsBalance - points)
            }
          : prev
      );
    } catch (err) {
      console.error('Failed to redeem reward', err);
    } finally {
      setRedeeming(false);
    }
  };

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const tierColors = {
    Silver: {
      border: 'border-slate-700',
      badge: 'bg-slate-800 text-slate-200 border-slate-600',
      accent: 'text-slate-300',
      glow: 'from-slate-700/20 to-slate-900'
    },
    Gold: {
      border: 'border-amber-500/40',
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      accent: 'text-amber-400',
      glow: 'from-amber-600/20 to-slate-900'
    },
    Platinum: {
      border: 'border-indigo-400/40',
      badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-400/30',
      accent: 'text-indigo-400',
      glow: 'from-indigo-600/20 to-slate-900'
    }
  };

  const activeColors = profile ? tierColors[profile.tier] : tierColors.Silver;

  return (
    <section id="loyalty" className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 relative overflow-hidden shadow-2xl">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* 1. SECTION TITLE & GUEST SWITCHER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-800/80 pb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-widest">
              <Crown className="w-4 h-4" />
              <span>Manor Privileges Club</span>
            </div>
            <h2 className="text-3xl font-bold font-display text-white mt-1">
              Guest Loyalty & Stay-Duration Tiers
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Earn 100 points for every night stayed, plus 1 point per ₹100 spent. Advance through Silver, Gold, and Platinum tiers based on your accumulated stay duration.
            </p>
          </div>

          {/* Quick Demo Profile Switcher */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Sample Member Accounts:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedEmail('karthik.r@techcorp.in')}
                className={`px-2.5 py-1 text-xs rounded-lg font-mono transition-colors cursor-pointer border ${
                  selectedEmail === 'karthik.r@techcorp.in'
                    ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Karthik (3 nights · Silver)
              </button>
              <button
                onClick={() => setSelectedEmail('vikram.m@corporatetravel.in')}
                className={`px-2.5 py-1 text-xs rounded-lg font-mono transition-colors cursor-pointer border ${
                  selectedEmail === 'vikram.m@corporatetravel.in'
                    ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Vikram (7 nights · Gold)
              </button>
              <button
                onClick={() => setSelectedEmail('dr.meera@apexhealth.in')}
                className={`px-2.5 py-1 text-xs rounded-lg font-mono transition-colors cursor-pointer border ${
                  selectedEmail === 'dr.meera@apexhealth.in'
                    ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Dr. Meera (18 nights · Platinum)
              </button>
            </div>
          </div>
        </div>

        {/* Custom Email Search Bar */}
        <form onSubmit={handleCustomSearch} className="flex gap-2 max-w-md">
          <input
            type="email"
            placeholder="Search custom guest email (e.g. guest@company.com)..."
            value={customEmailInput}
            onChange={(e) => setCustomEmailInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Check My Tier</span>
          </button>
        </form>

        {loading || !profile ? (
          <div className="py-12 text-center text-slate-500 text-xs font-mono">
            Calculating stay duration and loyalty balance...
          </div>
        ) : (
          <div className="space-y-8">
            {/* 2. MEMBER STATUS HERO CARD */}
            <div className={`p-6 sm:p-8 bg-gradient-to-br ${activeColors.glow} border ${activeColors.border} rounded-2xl relative overflow-hidden`}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Member Info & Current Tier */}
                <div className="md:col-span-7 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase font-bold border ${activeColors.badge}`}>
                      {profile.tier} Member
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ID: {profile.guestEmail}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold font-display text-white">
                    {profile.guestName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <strong className="text-white font-mono tabular-nums">{profile.totalNights} Nights</strong> Stayed
                    </span>
                    <span className="text-slate-600">·</span>
                    <span>
                      <strong className="text-white font-mono tabular-nums">{profile.totalBookings} Completed Stays</strong>
                    </span>
                    <span className="text-slate-600">·</span>
                    <span>
                      Total Spend: <strong className="text-white font-mono tabular-nums">{property.currencySymbol}{profile.totalSpend.toLocaleString()}</strong>
                    </span>
                  </div>
                </div>

                {/* Points Balance Pill */}
                <div className="md:col-span-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className="font-mono uppercase text-[10px] tracking-wider">Available Points Balance</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold font-mono text-amber-400 tabular-nums">
                    {profile.pointsBalance.toLocaleString()} <span className="text-xs text-slate-400 font-normal">pts</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Worth ₹{profile.pointsBalance} in direct stay & dining credits
                  </div>
                </div>
              </div>

              {/* Stay-Duration Tier Progress Roadmap */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3">
                <div className="flex flex-wrap justify-between items-end gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Current Stay Duration: </span>
                    <strong className="text-white font-mono tabular-nums">{profile.totalNights} Nights</strong>
                    {profile.nextTier ? (
                      <span className="text-amber-400 ml-2">
                        · Need {profile.nightsToNextTier} more night{profile.nightsToNextTier > 1 ? 's' : ''} to reach <strong>{profile.nextTier} Executive</strong>
                      </span>
                    ) : (
                      <span className="text-emerald-400 ml-2 font-semibold">
                        · Top Tier Achieved (Platinum Elite)
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-slate-400 text-xs">
                    {profile.progressPercent}% to next status
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, profile.progressPercent)}%` }}
                  />
                </div>

                {/* Tier Milestone Step Markers */}
                <div className="grid grid-cols-3 text-center text-[11px] font-mono pt-1 text-slate-400">
                  <div className={profile.totalNights >= 1 ? 'text-amber-300 font-bold' : ''}>
                    Silver (1–4 Nights)
                  </div>
                  <div className={profile.totalNights >= 5 ? 'text-amber-300 font-bold' : ''}>
                    Gold (5–14 Nights)
                  </div>
                  <div className={profile.totalNights >= 15 ? 'text-indigo-300 font-bold' : ''}>
                    Platinum (15+ Nights)
                  </div>
                </div>
              </div>
            </div>

            {/* 3. TIER COMPARISON & ACTIVE PERKS */}
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block">
                Stay-Duration Tiers & Privilege Matrix
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Silver */}
                <div className={`p-5 rounded-2xl border ${profile.tier === 'Silver' ? 'bg-slate-900 border-amber-400/60 shadow-lg' : 'bg-slate-950/60 border-slate-800'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-display font-bold text-base text-slate-200">
                      Silver Member
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      1–4 Nights
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>5% dining discount at Delicia Restaurant</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Complimentary high-speed Wi-Fi boost</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Early check-in luggage storage</span>
                    </li>
                  </ul>
                  {profile.tier === 'Silver' && (
                    <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-amber-400 flex items-center gap-1 font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>Current Active Status</span>
                    </div>
                  )}
                </div>

                {/* Gold */}
                <div className={`p-5 rounded-2xl border ${profile.tier === 'Gold' ? 'bg-slate-900 border-amber-400/80 shadow-lg shadow-amber-500/5' : 'bg-slate-950/60 border-slate-800'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-display font-bold text-base text-amber-300">
                      Gold Executive
                    </span>
                    <span className="text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      5–14 Nights
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>10% dining discount at Delicia Restaurant</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Complimentary one-way airport transfer shuttle</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Late 2:00 PM check-out privilege</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Priority room upgrade waitlist</span>
                    </li>
                  </ul>
                  {profile.tier === 'Gold' ? (
                    <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-amber-400 flex items-center gap-1 font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>Current Active Status</span>
                    </div>
                  ) : profile.totalNights < 5 ? (
                    <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlocks after {5 - profile.totalNights} more night{5 - profile.totalNights > 1 ? 's' : ''}</span>
                    </div>
                  ) : null}
                </div>

                {/* Platinum */}
                <div className={`p-5 rounded-2xl border ${profile.tier === 'Platinum' ? 'bg-slate-900 border-indigo-400/80 shadow-lg shadow-indigo-500/10' : 'bg-slate-950/60 border-slate-800'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-display font-bold text-base text-indigo-300">
                      Platinum Elite
                    </span>
                    <span className="text-[11px] font-mono text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded border border-indigo-400/20">
                      15+ Nights
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>15% dining discount at Delicia Restaurant</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Guaranteed complimentary room upgrade</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Daily complimentary Delicia breakfast buffet</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Dedicated 24/7 concierge & zero cancel fees</span>
                    </li>
                  </ul>
                  {profile.tier === 'Platinum' ? (
                    <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-indigo-400 flex items-center gap-1 font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>Current Active Status</span>
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlocks after {15 - profile.totalNights} more night{15 - profile.totalNights > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. REWARD POINTS REDEMPTION ENGINE */}
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div>
                  <h4 className="text-base font-bold font-display text-white flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span>Redeem Your Points for Stays & Dining</span>
                  </h4>
                  <span className="text-xs text-slate-400">
                    Apply points directly to your next reservation or dining table
                  </span>
                </div>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  Available: {profile.pointsBalance} pts
                </span>
              </div>

              {redeemedVoucher && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                      Reward Code Issued!
                    </span>
                    <button
                      onClick={() => copyVoucherCode(redeemedVoucher.code)}
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-mono cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-white text-sm font-bold">{redeemedVoucher.code}</span>
                    <span className="text-slate-300 text-xs">{redeemedVoucher.description}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Use this voucher code at reception during check-in or present at Delicia dining table.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Reward Option 1 */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs font-mono uppercase text-amber-400 font-bold block">
                      Direct Stay Discount
                    </span>
                    <div className="text-lg font-bold font-display text-white mt-1">₹500 Room Credit</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Deduct ₹500 from your room invoice for any stay at Mount Manor.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-300">500 pts</span>
                    <button
                      onClick={() => handleRedeem(500, 'discount')}
                      disabled={redeeming || profile.pointsBalance < 500}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-30 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Redeem
                    </button>
                  </div>
                </div>

                {/* Reward Option 2 */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs font-mono uppercase text-amber-400 font-bold block">
                      Delicia Dining
                    </span>
                    <div className="text-lg font-bold font-display text-white mt-1">Chef’s Special Feast</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Complimentary multi-cuisine dinner course pass for 2 guests at Delicia.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-300">750 pts</span>
                    <button
                      onClick={() => handleRedeem(750, 'dining')}
                      disabled={redeeming || profile.pointsBalance < 750}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-30 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Redeem
                    </button>
                  </div>
                </div>

                {/* Reward Option 3 */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs font-mono uppercase text-amber-400 font-bold block">
                      Airport Transit
                    </span>
                    <div className="text-lg font-bold font-display text-white mt-1">Free Airport Shuttle</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Complimentary one-way transfer to Chennai International Airport (4.2 km).
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-300">400 pts</span>
                    <button
                      onClick={() => handleRedeem(400, 'shuttle')}
                      disabled={redeeming || profile.pointsBalance < 400}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-30 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Redeem
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. VERIFIED STAYS & POINTS LOG */}
            {profile.history.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block">
                  Eligible Stays & Points Breakdown
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Booking Ref</th>
                        <th className="py-2.5 px-3">Accommodation</th>
                        <th className="py-2.5 px-3">Stay Dates</th>
                        <th className="py-2.5 px-3 text-center">Duration</th>
                        <th className="py-2.5 px-3 text-right">Points Earned</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {profile.history.map((h, i) => (
                        <tr key={i} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-3 text-amber-400 font-bold">{h.referenceCode}</td>
                          <td className="py-2.5 px-3 text-white font-sans font-medium">{h.roomName}</td>
                          <td className="py-2.5 px-3 text-slate-300">{h.checkIn} to {h.checkOut}</td>
                          <td className="py-2.5 px-3 text-center text-white">{h.nights} Night{h.nights > 1 ? 's' : ''}</td>
                          <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">+{h.pointsEarned} pts</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
