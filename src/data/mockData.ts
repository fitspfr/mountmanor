import { Property, Room, Booking, DiningReservation, BanquetReservation, ApiKey } from '../types/index.ts';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'mount-manor',
    name: 'Hotel Mount Manor',
    tagline: 'Business-Class Hospitality at GST Road, Chennai',
    slug: 'mount-manor',
    domain: 'mountmanor.com',
    address: 'No. 14, Grand Southern Trunk (GST) Road, Opp. Officers Training Academy (OTA), St. Thomas Mount',
    landmark: 'Opposite Officers Training Academy (OTA)',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    postalCode: '600016',
    phone: '+91 72999 75113',
    alternatePhone: '+91 44 2231 1625',
    email: 'reservations@mountmanor.com',
    rating: 4.4,
    reviewCount: 840,
    checkInTime: '12:00 PM',
    checkOutTime: '12:00 PM',
    currency: 'INR',
    currencySymbol: '₹',
    description: 'Strategically located on GST Road just 10 minutes from Chennai International Airport and next to Nanganallur Road Metro, Mount Manor offers business-class rooms, the acclaimed Delicia restaurant, and modern banquet halls.',
    coordinates: {
      lat: 13.0033,
      lng: 80.2018
    },
    highlights: [
      '10-Minute Drive to Chennai International Airport',
      'Opposite Officers Training Academy (OTA)',
      'Delicia Multi-Cuisine Dining & Breakfast Buffet',
      'Chancellor Banquet & Corporate Conference Facilities',
      'Complimentary High-Speed Wi-Fi & 24/7 Room Service'
    ],
    features: {
      roomsCount: 48,
      hasRestaurant: true,
      hasBanquet: true,
      hasAirportShuttle: true,
      nearMetro: true
    }
  },
  {
    id: 'grand-horizon-resort',
    name: 'Grand Horizon Resort & Spa',
    tagline: 'Coastal Luxury & Executive Retreats',
    slug: 'grand-horizon',
    domain: 'grandhorizon.hospitality-saas.com',
    address: 'East Coast Road, Mahabalipuram Corridor',
    landmark: 'Beachfront Bay',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    postalCode: '603104',
    phone: '+91 98400 12345',
    email: 'stay@grandhorizon.com',
    rating: 4.8,
    reviewCount: 420,
    checkInTime: '02:00 PM',
    checkOutTime: '11:00 AM',
    currency: 'INR',
    currencySymbol: '₹',
    description: 'An expansive coastal resort tenant running on the Mount Manor SaaS backbone, featuring private villas, beachfront pavilions, and infinity pools.',
    coordinates: {
      lat: 12.6269,
      lng: 80.1927
    },
    highlights: [
      'Private Oceanfront Villas',
      'Ayurvedic Wellness Spa',
      'Open-Air Seafood Grill'
    ],
    features: {
      roomsCount: 32,
      hasRestaurant: true,
      hasBanquet: true,
      hasAirportShuttle: true,
      nearMetro: false
    }
  }
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'mm-std-01',
    propertyId: 'mount-manor',
    name: 'Standard Business Room',
    category: 'standard',
    tagline: 'Efficient comfort designed for solo executives and transit travelers',
    pricePerNight: 2800,
    originalPricePerNight: 3500,
    capacity: { adults: 2, children: 1 },
    bedType: 'Queen Bed',
    sizeSqFt: 220,
    description: 'Comfortable sound-insulated room with premium pocket-spring queen mattress, dedicated ergonomic work desk, high-speed Wi-Fi, LED television, and tea/coffee kettle.',
    amenities: [
      'High-Speed Wi-Fi',
      'Ergonomic Work Desk',
      'Individually Controlled AC',
      'Electric Kettle & Tea Maker',
      'En-Suite Bathroom with Hot Shower',
      'Electronic Safe'
    ],
    availableUnits: 12,
    images: []
  },
  {
    id: 'mm-dlx-02',
    propertyId: 'mount-manor',
    name: 'Deluxe Executive Room',
    category: 'deluxe',
    tagline: 'Spacious sanctuary with city views, plush king bed, and lounge area',
    pricePerNight: 3950,
    originalPricePerNight: 4800,
    capacity: { adults: 2, children: 2 },
    bedType: 'King Bed',
    sizeSqFt: 310,
    badge: 'Guest Favorite',
    isPopular: true,
    description: 'Upgraded room featuring generous living space, Italian marble bathroom, soundproofed windows overlooking GST Road, mini refrigerator, and 43-inch Smart 4K TV.',
    amenities: [
      'King-Size Luxury Mattress',
      'Complimentary Buffet Breakfast',
      'Mini Bar & Refrigerator',
      'Smart 4K TV with OTT Support',
      'Luxury Toiletries & Hair Dryer',
      'Express Laundry Service'
    ],
    availableUnits: 8,
    images: []
  },
  {
    id: 'mm-ste-03',
    propertyId: 'mount-manor',
    name: 'Mount Manor Presidential Suite',
    category: 'suite',
    tagline: 'The epitome of hospitality with private living room and executive dining',
    pricePerNight: 5800,
    originalPricePerNight: 7200,
    capacity: { adults: 3, children: 2 },
    bedType: 'Emperor King Bed',
    sizeSqFt: 460,
    badge: 'Premier Suite',
    description: 'Luxurious two-bay suite offering an independent parlor living room, dining setup, deep soaking tub, walk-in closet, and VIP airport transit package.',
    amenities: [
      'Separate Living & Bedroom Areas',
      'Airport Meet & Greet Shuttle',
      'Complimentary Evening High Tea at Delicia',
      'Deep Soaking Bathtub',
      'Nespresso Coffee Machine',
      'Late 3:00 PM Check-out Privilege'
    ],
    availableUnits: 4,
    images: []
  },
  {
    id: 'gh-villa-01',
    propertyId: 'grand-horizon-resort',
    name: 'Oceanview Cabana Villa',
    category: 'suite',
    tagline: 'Private beach villa with sun deck and plunge pool',
    pricePerNight: 9500,
    originalPricePerNight: 12000,
    capacity: { adults: 2, children: 1 },
    bedType: 'California King',
    sizeSqFt: 550,
    description: 'Expansive private beach villa featuring custom hardwood finishes, private plunge pool, and panoramic ocean views.',
    amenities: ['Plunge Pool', 'Ocean View Deck', 'Butler Service'],
    availableUnits: 6,
    images: []
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bkg-101',
    propertyId: 'mount-manor',
    roomId: 'mm-dlx-02',
    roomName: 'Deluxe Executive Room',
    guestName: 'Karthik Ramanathan',
    guestEmail: 'karthik.r@techcorp.in',
    guestPhone: '+91 98410 44552',
    checkIn: '2026-11-04',
    checkOut: '2026-11-07',
    nights: 3,
    adults: 2,
    children: 0,
    roomRate: 3950,
    addonAirportShuttle: true,
    addonBreakfast: true,
    totalAmount: 12650,
    status: 'confirmed',
    referenceCode: 'MM-RES-88219',
    createdAt: '2026-10-28T10:14:00Z'
  },
  {
    id: 'bkg-102',
    propertyId: 'mount-manor',
    roomId: 'mm-std-01',
    roomName: 'Standard Business Room',
    guestName: 'Ananya Sharma',
    guestEmail: 'ananya.s@investpartners.com',
    guestPhone: '+91 99123 77884',
    checkIn: '2026-11-02',
    checkOut: '2026-11-03',
    nights: 1,
    adults: 1,
    children: 0,
    roomRate: 2800,
    addonAirportShuttle: false,
    addonBreakfast: true,
    totalAmount: 3100,
    status: 'confirmed',
    referenceCode: 'MM-RES-88220',
    createdAt: '2026-10-28T14:30:00Z'
  },
  {
    id: 'bkg-103',
    propertyId: 'mount-manor',
    roomId: 'mm-dlx-02',
    roomName: 'Deluxe Executive Room',
    guestName: 'Vikram Malhotra',
    guestEmail: 'vikram.m@corporatetravel.in',
    guestPhone: '+91 98402 11223',
    checkIn: '2026-10-10',
    checkOut: '2026-10-17',
    nights: 7,
    adults: 2,
    children: 0,
    roomRate: 3950,
    addonAirportShuttle: true,
    addonBreakfast: true,
    totalAmount: 33150,
    status: 'confirmed',
    referenceCode: 'MM-RES-88221',
    createdAt: '2026-10-09T08:00:00Z'
  },
  {
    id: 'bkg-104',
    propertyId: 'mount-manor',
    roomId: 'mm-ste-03',
    roomName: 'Mount Manor Presidential Suite',
    guestName: 'Dr. Meera Krishnan',
    guestEmail: 'dr.meera@apexhealth.in',
    guestPhone: '+91 98840 55667',
    checkIn: '2026-09-01',
    checkOut: '2026-09-19',
    nights: 18,
    adults: 2,
    children: 0,
    roomRate: 5800,
    addonAirportShuttle: true,
    addonBreakfast: true,
    totalAmount: 118000,
    status: 'confirmed',
    referenceCode: 'MM-RES-88222',
    createdAt: '2026-08-25T11:20:00Z'
  }
];

export const INITIAL_DINING_RESERVATIONS: DiningReservation[] = [
  {
    id: 'din-201',
    propertyId: 'mount-manor',
    restaurantName: 'Delicia Multi-Cuisine',
    guestName: 'Suresh Kumar',
    guestEmail: 'suresh.kumar@chennaiair.in',
    guestPhone: '+91 94441 33221',
    date: '2026-10-30',
    timeSlot: '07:30 PM',
    guestCount: 4,
    seatingPreference: 'family-lounge',
    specialRequests: 'Celebrating wedding anniversary. Table near center fountain preferred.',
    status: 'confirmed',
    referenceCode: 'DEL-RES-4102',
    createdAt: '2026-10-28T09:00:00Z'
  }
];

export const INITIAL_BANQUETS: BanquetReservation[] = [
  {
    id: 'bnq-301',
    propertyId: 'mount-manor',
    hallName: 'Chancellor Grand Hall',
    eventType: 'corporate-conference',
    guestName: 'Vikram Menon',
    companyName: 'Apex Logistics South Asia',
    guestEmail: 'v.menon@apexlogistics.com',
    guestPhone: '+91 97909 55443',
    eventDate: '2026-11-12',
    durationHours: 8,
    expectedGuests: 75,
    cateringPlan: 'executive-buffet',
    audioVisualRequired: true,
    estimatedCost: 65000,
    status: 'confirmed',
    referenceCode: 'BNQ-EVT-904',
    createdAt: '2026-10-27T16:20:00Z'
  }
];

export const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: 'key-01',
    propertyId: 'mount-manor',
    name: 'Chennai Airport Travel Desk Widget',
    key: 'sk_live_mm_7f39a02d84c19ef',
    maskedKey: 'sk_live_mm_••••••••84c19ef',
    scopes: ['read:rooms', 'read:availability', 'write:bookings'],
    createdAt: '2026-10-15T08:00:00Z',
    lastUsedAt: '2026-10-29T02:15:00Z',
    requestsCount: 1420,
    status: 'active'
  },
  {
    id: 'key-02',
    propertyId: 'mount-manor',
    name: 'Delicia Mobile Order Partner',
    key: 'sk_live_mm_b499120e334ac7a',
    maskedKey: 'sk_live_mm_••••••••334ac7a',
    scopes: ['read:dining', 'write:dining'],
    createdAt: '2026-10-20T11:45:00Z',
    lastUsedAt: '2026-10-28T21:05:00Z',
    requestsCount: 680,
    status: 'active'
  }
];
