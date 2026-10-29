export interface Property {
  id: string;
  name: string;
  tagline: string;
  slug: string;
  domain?: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  rating: number;
  reviewCount: number;
  checkInTime: string;
  checkOutTime: string;
  currency: string;
  currencySymbol: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  highlights: string[];
  features: {
    roomsCount: number;
    hasRestaurant: boolean;
    hasBanquet: boolean;
    hasAirportShuttle: boolean;
    nearMetro: boolean;
  };
}

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  category: 'standard' | 'deluxe' | 'suite' | 'executive';
  tagline: string;
  pricePerNight: number;
  originalPricePerNight: number;
  capacity: {
    adults: number;
    children: number;
  };
  bedType: string;
  sizeSqFt: number;
  description: string;
  amenities: string[];
  badge?: string;
  isPopular?: boolean;
  availableUnits: number;
  images: string[];
}

export interface Booking {
  id: string;
  propertyId: string;
  roomId: string;
  roomName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  roomRate: number;
  addonAirportShuttle: boolean;
  addonBreakfast: boolean;
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  referenceCode: string;
  createdAt: string;
}

export interface DiningReservation {
  id: string;
  propertyId: string;
  restaurantName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  date: string;
  timeSlot: string;
  guestCount: number;
  seatingPreference: 'indoor-ac' | 'executive-booth' | 'family-lounge';
  specialRequests?: string;
  status: 'confirmed' | 'pending';
  referenceCode: string;
  createdAt: string;
}

export interface BanquetReservation {
  id: string;
  propertyId: string;
  hallName: string;
  eventType: 'corporate-conference' | 'wedding-reception' | 'birthday-banquet' | 'seminar';
  guestName: string;
  companyName?: string;
  guestEmail: string;
  guestPhone: string;
  eventDate: string;
  durationHours: number;
  expectedGuests: number;
  cateringPlan: 'standard' | 'executive-buffet' | 'royal-spread';
  audioVisualRequired: boolean;
  estimatedCost: number;
  status: 'inquiry' | 'confirmed';
  referenceCode: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  propertyId: string;
  name: string;
  key: string;
  maskedKey: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt?: string;
  requestsCount: number;
  status: 'active' | 'revoked';
}

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message?: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    perPage?: number;
    propertyId?: string;
    timestamp: string;
    version: string;
  };
  errors?: Record<string, string[]>;
}

export type LoyaltyTier = 'Silver' | 'Gold' | 'Platinum';

export interface LoyaltyProfile {
  guestEmail: string;
  guestName: string;
  totalNights: number;
  totalBookings: number;
  totalSpend: number;
  pointsBalance: number;
  tier: LoyaltyTier;
  nightsToNextTier: number;
  nextTier: LoyaltyTier | null;
  progressPercent: number;
  perks: string[];
  history: {
    bookingId: string;
    referenceCode: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    pointsEarned: number;
  }[];
}
