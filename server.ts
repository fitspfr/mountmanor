import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  INITIAL_PROPERTIES,
  INITIAL_ROOMS,
  INITIAL_BOOKINGS,
  INITIAL_DINING_RESERVATIONS,
  INITIAL_BANQUETS,
  INITIAL_API_KEYS
} from './src/data/mockData.ts';
import {
  Property,
  Room,
  Booking,
  DiningReservation,
  BanquetReservation,
  ApiKey
} from './src/types/index.ts';
import { postgresDb } from './src/db/postgres.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware
app.use(express.json());

// In-Memory Database State
const properties: Property[] = [...INITIAL_PROPERTIES];
const rooms: Room[] = [...INITIAL_ROOMS];
const bookings: Booking[] = [...INITIAL_BOOKINGS];
const diningReservations: DiningReservation[] = [...INITIAL_DINING_RESERVATIONS];
const banquetReservations: BanquetReservation[] = [...INITIAL_BANQUETS];
const apiKeys: ApiKey[] = [...INITIAL_API_KEYS];

// Helper to extract Tenant ID (X-Tenant-ID header, query param, or fallback to Mount Manor)
function resolveTenantId(req: Request): string {
  const headerTenant = req.headers['x-tenant-id'] as string;
  const queryTenant = req.query.tenantId as string || req.query.propertyId as string;
  return headerTenant || queryTenant || 'mount-manor';
}

// Laravel-standard standardized JSON response helper
function sendResponse<T>(res: Response, status: number, data: T, message?: string, metaOverrides = {}) {
  return res.status(status).json({
    success: status >= 200 && status < 300,
    status,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      framework: 'Laravel API Engine Specification',
      ...metaOverrides
    }
  });
}

function sendError(res: Response, status: number, message: string, errors?: Record<string, string[]>) {
  return res.status(status).json({
    success: false,
    status,
    message,
    errors,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
}

// -------------------------------------------------------------
// REST API v1 Routes (Laravel-Pattern RESTful Endpoints)
// -------------------------------------------------------------

// Health check
app.get('/api/v1/health', (_req: Request, res: Response) => {
  sendResponse(res, 200, {
    status: 'healthy',
    system: 'Mount Manor Multi-Tenant Hospitality SaaS API',
    uptime: process.uptime(),
    tenantsCount: properties.length,
    database: postgresDb.getStatus()
  });
});

// POSTGRESQL DATABASE (NON-CLOUD LOCAL POSTGRES ENGINE)
app.get('/api/v1/database/status', async (_req: Request, res: Response) => {
  try {
    const status = postgresDb.getStatus();
    const countResults = await Promise.all([
      postgresDb.query('SELECT COUNT(*) as count FROM properties'),
      postgresDb.query('SELECT COUNT(*) as count FROM rooms'),
      postgresDb.query('SELECT COUNT(*) as count FROM bookings'),
      postgresDb.query('SELECT COUNT(*) as count FROM dining_reservations'),
      postgresDb.query('SELECT COUNT(*) as count FROM banquet_reservations'),
      postgresDb.query('SELECT COUNT(*) as count FROM developer_api_keys')
    ]);

    const counts = {
      properties: parseInt(countResults[0].rows[0]?.count || 0, 10),
      rooms: parseInt(countResults[1].rows[0]?.count || 0, 10),
      bookings: parseInt(countResults[2].rows[0]?.count || 0, 10),
      diningReservations: parseInt(countResults[3].rows[0]?.count || 0, 10),
      banquetReservations: parseInt(countResults[4].rows[0]?.count || 0, 10),
      developerApiKeys: parseInt(countResults[5].rows[0]?.count || 0, 10)
    };

    sendResponse(res, 200, {
      ...status,
      rowCounts: counts
    }, 'PostgreSQL database status verified');
  } catch (err: any) {
    sendError(res, 500, 'Database error: ' + err.message);
  }
});

app.post('/api/v1/database/query', async (req: Request, res: Response) => {
  const { sql, params = [] } = req.body;
  if (!sql) {
    return sendError(res, 400, 'SQL statement is required');
  }

  const start = performance.now();
  try {
    const result = await postgresDb.query(sql, params);
    const durationMs = Math.round(performance.now() - start);

    sendResponse(res, 200, {
      sql,
      rows: result.rows,
      rowCount: result.rowCount,
      durationMs
    }, `PostgreSQL query executed successfully in ${durationMs}ms`);
  } catch (err: any) {
    sendError(res, 422, 'PostgreSQL query error: ' + err.message);
  }
});

// PROPERTIES / TENANTS
app.get('/api/v1/properties', (req: Request, res: Response) => {
  sendResponse(res, 200, properties, 'Properties retrieved successfully', {
    total: properties.length
  });
});

app.get('/api/v1/properties/:id', (req: Request, res: Response) => {
  const property = properties.find((p) => p.id === req.params.id || p.slug === req.params.id);
  if (!property) {
    return sendError(res, 404, `Property '${req.params.id}' not found`);
  }
  sendResponse(res, 200, property);
});

app.post('/api/v1/properties', (req: Request, res: Response) => {
  const { name, tagline, city, phone, email, address } = req.body;
  if (!name || !city || !email) {
    return sendError(res, 422, 'Validation failed', {
      name: !name ? ['The property name is required'] : [],
      city: !city ? ['City is required'] : [],
      email: !email ? ['Valid business email is required'] : []
    });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = `prop-${Date.now()}`;
  const newProperty: Property = {
    id,
    name,
    tagline: tagline || 'Premium Hospitality Tenant',
    slug,
    address: address || 'Main City Road',
    landmark: 'Central District',
    city,
    state: 'Tamil Nadu',
    country: 'India',
    postalCode: '600001',
    phone: phone || '+91 99999 00000',
    email,
    rating: 4.5,
    reviewCount: 1,
    checkInTime: '12:00 PM',
    checkOutTime: '11:00 AM',
    currency: 'INR',
    currencySymbol: '₹',
    description: `Brand new multi-tenant property registered on the Mount Manor SaaS platform.`,
    coordinates: { lat: 13.0827, lng: 80.2707 },
    highlights: ['24/7 Front Desk', 'High-Speed Wi-Fi', 'Executive Concierge'],
    features: {
      roomsCount: 10,
      hasRestaurant: true,
      hasBanquet: false,
      hasAirportShuttle: true,
      nearMetro: true
    }
  };

  properties.push(newProperty);
  sendResponse(res, 201, newProperty, 'New SaaS property tenant registered successfully');
});

// ROOMS & AVAILABILITY
app.get('/api/v1/rooms', (req: Request, res: Response) => {
  const tenantId = resolveTenantId(req);
  let filtered = rooms.filter((r) => r.propertyId === tenantId);

  const category = req.query.category as string;
  if (category && category !== 'all') {
    filtered = filtered.filter((r) => r.category === category);
  }

  const minCapacity = req.query.adults ? parseInt(req.query.adults as string, 10) : undefined;
  if (minCapacity) {
    filtered = filtered.filter((r) => r.capacity.adults >= minCapacity);
  }

  sendResponse(res, 200, filtered, 'Rooms fetched successfully', {
    propertyId: tenantId,
    total: filtered.length
  });
});

app.get('/api/v1/rooms/:id', (req: Request, res: Response) => {
  const room = rooms.find((r) => r.id === req.params.id);
  if (!room) {
    return sendError(res, 404, `Room '${req.params.id}' not found`);
  }
  sendResponse(res, 200, room);
});

app.post('/api/v1/rooms', (req: Request, res: Response) => {
  const tenantId = resolveTenantId(req);
  const { name, category, pricePerNight, capacityAdults, bedType, description, amenities } = req.body;

  if (!name || !pricePerNight) {
    return sendError(res, 422, 'Missing required room fields', {
      name: !name ? ['Room title is required'] : [],
      pricePerNight: !pricePerNight ? ['Nightly rate is required'] : []
    });
  }

  const newRoom: Room = {
    id: `room-${Date.now()}`,
    propertyId: tenantId,
    name,
    category: category || 'standard',
    tagline: 'Modern comfortable space',
    pricePerNight: Number(pricePerNight),
    originalPricePerNight: Math.round(Number(pricePerNight) * 1.2),
    capacity: {
      adults: Number(capacityAdults) || 2,
      children: 1
    },
    bedType: bedType || 'King Bed',
    sizeSqFt: 280,
    description: description || 'Spacious, well-appointed guest room.',
    amenities: Array.isArray(amenities) && amenities.length > 0 ? amenities : ['High-Speed Wi-Fi', 'Air Conditioning', 'LED TV'],
    availableUnits: 5,
    images: []
  };

  rooms.push(newRoom);
  sendResponse(res, 201, newRoom, 'Room type created successfully');
});

// BOOKINGS (ROOM RESERVATION ENGINE)
app.get('/api/v1/bookings', (req: Request, res: Response) => {
  const tenantId = resolveTenantId(req);
  let tenantBookings = bookings.filter((b) => b.propertyId === tenantId);

  if (req.query.email) {
    tenantBookings = tenantBookings.filter((b) => b.guestEmail.toLowerCase() === (req.query.email as string).toLowerCase());
  }

  sendResponse(res, 200, tenantBookings, 'Bookings retrieved successfully', {
    propertyId: tenantId,
    total: tenantBookings.length
  });
});

app.post('/api/v1/bookings', (req: Request, res: Response) => {
  const tenantId = resolveTenantId(req);
  const {
    roomId,
    guestName,
    guestEmail,
    guestPhone,
    checkIn,
    checkOut,
    adults = 2,
    children = 0,
    addonAirportShuttle = false,
    addonBreakfast = false
  } = req.body;

  // Validation
  const errors: Record<string, string[]> = {};
  if (!roomId) errors.roomId = ['Room ID is required'];
  if (!guestName || guestName.trim().length < 2) errors.guestName = ['Valid guest full name is required'];
  if (!guestEmail || !guestEmail.includes('@')) errors.guestEmail = ['Valid email address is required'];
  if (!guestPhone) errors.guestPhone = ['Contact phone number is required'];
  if (!checkIn) errors.checkIn = ['Check-in date is required'];
  if (!checkOut) errors.checkOut = ['Check-out date is required'];

  if (Object.keys(errors).length > 0) {
    return sendError(res, 422, 'The given booking data was invalid.', errors);
  }

  const room = rooms.find((r) => r.id === roomId && r.propertyId === tenantId);
  if (!room) {
    return sendError(res, 404, `Selected room was not found for property '${tenantId}'.`);
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = checkOutDate.getTime() - checkInDate.getTime();
  const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  let totalAmount = room.pricePerNight * nights;
  if (addonAirportShuttle) totalAmount += 600; // Airport transfer add-on
  if (addonBreakfast) totalAmount += 350 * nights * (Number(adults) || 1);

  const referenceCode = `MM-RES-${Math.floor(10000 + Math.random() * 90000)}`;

  const newBooking: Booking = {
    id: `bkg-${Date.now()}`,
    propertyId: tenantId,
    roomId,
    roomName: room.name,
    guestName,
    guestEmail,
    guestPhone,
    checkIn,
    checkOut,
    nights,
    adults: Number(adults) || 1,
    children: Number(children) || 0,
    roomRate: room.pricePerNight,
    addonAirportShuttle: Boolean(addonAirportShuttle),
    addonBreakfast: Boolean(addonBreakfast),
    totalAmount,
    status: 'confirmed',
    referenceCode,
    createdAt: new Date().toISOString()
  };

  bookings.unshift(newBooking);
  sendResponse(res, 201, newBooking, 'Reservation confirmed successfully. Confirmation voucher generated.');
});

// DINING (DELICIA RESTAURANT RESERVATIONS)
app.get('/api/v1/dining/reservations', (req: Request, res: Response) => {
  const tenantId = resolveTenantId(req);
  const propertyDining = diningReservations.filter((d) => d.propertyId === tenantId);
  sendResponse(res, 200, propertyDining, 'Dining reservations fetched', {
    propertyId: tenantId,
    total: propertyDining.length
  });
});

app.post('/api/v1/dining/reserve', (req: Request, res: Response) => {
  const tenantId = resolveTenantId(req);
  const { guestName, guestEmail, guestPhone, date, timeSlot, guestCount = 2, seatingPreference = 'indoor-ac', specialRequests } = req.body;

  if (!guestName || !guestEmail || !date || !timeSlot) {
    return sendError(res, 422, 'Missing required dining reservation fields', {
      guestName: !guestName ? ['Name is required'] : [],
      date: !date ? ['Date is required'] : [],
      timeSlot: !timeSlot ? ['Time slot is required'] : []
    });
  }

  const reservation: DiningReservation = {
    id: `din-${Date.now()}`,
    propertyId: tenantId,
    restaurantName: 'Delicia Multi-Cuisine',
    guestName,
    guestEmail,
    guestPhone: guestPhone || '+91 72999 75115',
    date,
    timeSlot,
    guestCount: Number(guestCount) || 2,
    seatingPreference,
    specialRequests,
    status: 'confirmed',
    referenceCode: `DEL-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString()
  };

  diningReservations.unshift(reservation);
  sendResponse(res, 201, reservation, 'Delicia table reserved successfully');
});

// BANQUET & EVENTS
app.get('/api/v1/banquets/reservations', (req: Request, res: Response) => {
  const tenantId = resolveTenantId(req);
  const propertyBanquets = banquetReservations.filter((b) => b.propertyId === tenantId);
  sendResponse(res, 200, propertyBanquets, 'Banquet inquiries retrieved', {
    propertyId: tenantId,
    total: propertyBanquets.length
  });
});

app.post('/api/v1/banquets/reserve', (req: Request, res: Response) => {
  const tenantId = resolveTenantId(req);
  const { hallName, eventType, guestName, companyName, guestEmail, guestPhone, eventDate, expectedGuests, cateringPlan, audioVisualRequired } = req.body;

  if (!guestName || !guestEmail || !eventDate || !expectedGuests) {
    return sendError(res, 422, 'Missing required banquet event details');
  }

  const count = Number(expectedGuests) || 50;
  const perGuestRate = cateringPlan === 'royal-spread' ? 1200 : cateringPlan === 'executive-buffet' ? 850 : 650;
  const estimatedCost = 25000 + (count * perGuestRate);

  const banquet: BanquetReservation = {
    id: `bnq-${Date.now()}`,
    propertyId: tenantId,
    hallName: hallName || 'Chancellor Grand Hall',
    eventType: eventType || 'corporate-conference',
    guestName,
    companyName,
    guestEmail,
    guestPhone: guestPhone || '+91 72999 75113',
    eventDate,
    durationHours: 6,
    expectedGuests: count,
    cateringPlan: cateringPlan || 'executive-buffet',
    audioVisualRequired: Boolean(audioVisualRequired),
    estimatedCost,
    status: 'confirmed',
    referenceCode: `BNQ-${Math.floor(100 + Math.random() * 900)}`,
    createdAt: new Date().toISOString()
  };

  banquetReservations.unshift(banquet);
  sendResponse(res, 201, banquet, 'Banquet hall reservation registered successfully');
});

// DEVELOPER API KEYS & 3RD-PARTY CREDENTIALS
app.get('/api/v1/developer/keys', (req: Request, res: Response) => {
  const tenantId = resolveTenantId(req);
  const keys = apiKeys.filter((k) => k.propertyId === tenantId);
  sendResponse(res, 200, keys, 'API keys retrieved', { total: keys.length });
});

app.post('/api/v1/developer/keys', (req: Request, res: Response) => {
  const tenantId = resolveTenantId(req);
  const { name, scopes } = req.body;

  if (!name) {
    return sendError(res, 422, 'Key description name is required');
  }

  const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 8);
  const rawKey = `sk_live_mm_${randomHex}`;
  const maskedKey = `sk_live_mm_••••••••${randomHex.slice(-6)}`;

  const newKey: ApiKey = {
    id: `key-${Date.now()}`,
    propertyId: tenantId,
    name,
    key: rawKey,
    maskedKey,
    scopes: Array.isArray(scopes) && scopes.length > 0 ? scopes : ['read:rooms', 'write:bookings'],
    createdAt: new Date().toISOString(),
    requestsCount: 0,
    status: 'active'
  };

  apiKeys.unshift(newKey);
  sendResponse(res, 201, newKey, 'API Key generated successfully for 3rd party integration');
});

app.delete('/api/v1/developer/keys/:id', (req: Request, res: Response) => {
  const index = apiKeys.findIndex((k) => k.id === req.params.id);
  if (index === -1) {
    return sendError(res, 404, 'API Key not found');
  }
  apiKeys.splice(index, 1);
  sendResponse(res, 200, { id: req.params.id }, 'API Key revoked successfully');
});

// GUEST LOYALTY & TIER STATUS ENGINE (Stay Duration & Points Tracking)
app.get('/api/v1/loyalty', (req: Request, res: Response) => {
  const tenantId = resolveTenantId(req);
  const email = (req.query.email as string || '').toLowerCase().trim();

  // If no email provided, default to Karthik Ramanathan or first guest
  const targetEmail = email || (bookings[0]?.guestEmail || 'karthik.r@techcorp.in');
  const guestBookings = bookings.filter(
    (b) => b.propertyId === tenantId && b.guestEmail.toLowerCase() === targetEmail.toLowerCase()
  );

  const guestName = guestBookings[0]?.guestName || (email ? email.split('@')[0] : 'Karthik Ramanathan');
  const totalNights = guestBookings.reduce((sum, b) => sum + (b.status !== 'cancelled' ? b.nights : 0), 0);
  const totalSpend = guestBookings.reduce((sum, b) => sum + (b.status !== 'cancelled' ? b.totalAmount : 0), 0);
  const totalBookings = guestBookings.length;

  // Points calculation: 100 points per night + 1 bonus point per ₹100 spent
  const pointsEarned = (totalNights * 100) + Math.floor(totalSpend / 100);

  // Tier status based on stay duration (nights)
  let tier: 'Silver' | 'Gold' | 'Platinum' = 'Silver';
  let nextTier: 'Silver' | 'Gold' | 'Platinum' | null = 'Gold';
  let nightsToNextTier = Math.max(0, 5 - totalNights);
  let progressPercent = Math.min(100, Math.round((totalNights / 5) * 100));
  let perks: string[] = [
    '5% dining discount at Delicia Restaurant',
    'High-speed premium Wi-Fi upgrade',
    'Complimentary luggage storage & transit assistance'
  ];

  if (totalNights >= 15) {
    tier = 'Platinum';
    nextTier = null;
    nightsToNextTier = 0;
    progressPercent = 100;
    perks = [
      '15% dining discount at Delicia Restaurant',
      'Guaranteed room category upgrade upon arrival',
      'Daily complimentary Delicia executive breakfast buffet',
      'Zero cancellation or date modification charges',
      'Dedicated 24/7 Mount Manor concierge direct line'
    ];
  } else if (totalNights >= 5) {
    tier = 'Gold';
    nextTier = 'Platinum';
    nightsToNextTier = Math.max(0, 15 - totalNights);
    progressPercent = Math.min(100, Math.round(((totalNights - 5) / 10) * 100));
    perks = [
      '10% dining discount at Delicia Restaurant',
      'Complimentary one-way airport transfer shuttle',
      'Late 2:00 PM check-out privilege',
      'Priority room selection & early check-in'
    ];
  }

  const history = guestBookings.map((b) => ({
    bookingId: b.id,
    referenceCode: b.referenceCode,
    roomName: b.roomName,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    nights: b.nights,
    pointsEarned: (b.nights * 100) + Math.floor(b.totalAmount / 100)
  }));

  sendResponse(res, 200, {
    guestEmail: targetEmail,
    guestName,
    totalNights,
    totalBookings,
    totalSpend,
    pointsBalance: pointsEarned,
    tier,
    nightsToNextTier,
    nextTier,
    progressPercent,
    perks,
    history
  }, 'Loyalty profile retrieved successfully');
});

app.post('/api/v1/loyalty/redeem', (req: Request, res: Response) => {
  const { points = 500, perkType = 'discount' } = req.body;
  const voucherCode = `MANOR-REWARD-${Math.floor(1000 + Math.random() * 9000)}`;

  sendResponse(res, 201, {
    redeemedPoints: points,
    voucherCode,
    description: perkType === 'dining' 
      ? 'Delicia Complimentary Chef Dinner Pass' 
      : `₹${points} Direct Booking Credit Discount`,
    validUntil: '2027-04-30',
    status: 'active'
  }, 'Loyalty reward voucher generated');
});

// OPENAPI 3.0 SPECIFICATION
app.get('/api/v1/docs/openapi.json', (req: Request, res: Response) => {
  res.json({
    openapi: '3.0.3',
    info: {
      title: 'Mount Manor Hotel & Hospitality SaaS REST API',
      version: '1.0.0',
      description: 'API-first headless hospitality backend for Hotel Mount Manor Chennai and multi-tenant hotel partners. Designed for third-party frontends, mobile apps, and travel portal integrations.',
      contact: {
        name: 'Mount Manor Engineering Desk',
        email: 'api@mountmanor.com',
        url: 'https://mountmanor.com'
      }
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Mount Manor Primary SaaS Gateway'
      }
    ],
    paths: {
      '/properties': {
        get: {
          summary: 'List hospitality properties / tenants',
          responses: { '200': { description: 'Successful response' } }
        },
        post: {
          summary: 'Create new SaaS hotel tenant',
          responses: { '201': { description: 'Tenant created' } }
        }
      },
      '/rooms': {
        get: {
          summary: 'Retrieve available rooms and suites with real-time tariffs',
          parameters: [
            { name: 'X-Tenant-ID', in: 'header', required: false, schema: { type: 'string', default: 'mount-manor' } },
            { name: 'category', in: 'query', required: false, schema: { type: 'string' } },
            { name: 'adults', in: 'query', required: false, schema: { type: 'integer' } }
          ],
          responses: { '200': { description: 'Array of room objects' } }
        }
      },
      '/bookings': {
        post: {
          summary: 'Create guest room reservation voucher',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['roomId', 'guestName', 'guestEmail', 'checkIn', 'checkOut'],
                  properties: {
                    roomId: { type: 'string' },
                    guestName: { type: 'string' },
                    guestEmail: { type: 'string' },
                    guestPhone: { type: 'string' },
                    checkIn: { type: 'string', format: 'date' },
                    checkOut: { type: 'string', format: 'date' },
                    addonAirportShuttle: { type: 'boolean' },
                    addonBreakfast: { type: 'boolean' }
                  }
                }
              }
            }
          },
          responses: { '201': { description: 'Booking confirmed with reference code' } }
        }
      },
      '/dining/reserve': {
        post: {
          summary: 'Reserve table at Delicia restaurant',
          responses: { '201': { description: 'Table confirmed' } }
        }
      },
      '/banquets/reserve': {
        post: {
          summary: 'Book or inquire Chancellor Banquet Hall',
          responses: { '201': { description: 'Banquet event registered' } }
        }
      }
    }
  });
});

// LARAVEL IMPLEMENTATION BLUEPRINT (FOR USER'S LARAVEL BACKEND TEAM)
app.get('/api/v1/laravel/routes', (_req: Request, res: Response) => {
  const routesPhp = `<?php
// routes/api.php - Laravel 11 / 10 API Blueprint for Mount Manor

use Illuminate\\Support\\Facades\\Route;
use App\\Http\\Controllers\\Api\\V1\\PropertyController;
use App\\Http\\Controllers\\Api\\V1\\RoomController;
use App\\Http\\Controllers\\Api\\V1\\BookingController;
use App\\Http\\Controllers\\Api\\V1\\DiningController;
use App\\Http\\Controllers\\Api\\V1\\BanquetController;
use App\\Http\\Controllers\\Api\\V1\\DeveloperKeyController;

Route::prefix('v1')->middleware(['api', 'throttle:60,1'])->group(function () {
    // Multi-tenant resolution middleware
    Route::middleware(['tenancy.resolve'])->group(function () {
        // Properties
        Route::get('/properties', [PropertyController::class, 'index']);
        Route::get('/properties/{id}', [PropertyController::class, 'show']);
        Route::post('/properties', [PropertyController::class, 'store']);

        // Rooms & Availability
        Route::get('/rooms', [RoomController::class, 'index']);
        Route::get('/rooms/{id}', [RoomController::class, 'show']);
        Route::post('/rooms', [RoomController::class, 'store']);

        // Bookings
        Route::get('/bookings', [BookingController::class, 'index']);
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::get('/bookings/{id}', [BookingController::class, 'show']);

        // Delicia Dining
        Route::get('/dining/reservations', [DiningController::class, 'index']);
        Route::post('/dining/reserve', [DiningController::class, 'store']);

        // Banquet Halls
        Route::get('/banquets/reservations', [BanquetController::class, 'index']);
        Route::post('/banquets/reserve', [BanquetController::class, 'store']);

        // 3rd-Party Developer API Keys
        Route::get('/developer/keys', [DeveloperKeyController::class, 'index']);
        Route::post('/developer/keys', [DeveloperKeyController::class, 'store']);
        Route::delete('/developer/keys/{id}', [DeveloperKeyController::class, 'destroy']);
    });
});
`;

  sendResponse(res, 200, {
    framework: 'Laravel 11+ / PHP 8.3',
    routesPhp,
    composerPackages: [
      'stancl/tenancy (Multi-tenancy for Laravel)',
      'dedoc/scramble (OpenAPI / Swagger auto-generation)',
      'laravel/sanctum (API Token & 3rd Party auth)'
    ]
  });
});

// BACKEND CODE EXPLORER API
app.get('/api/v1/backend-files', (_req: Request, res: Response) => {
  const fileManifest = [
    {
      id: 'laravel-routes',
      name: 'routes/api.php',
      category: 'Laravel Routing',
      type: 'php',
      path: 'backend-laravel/routes/api.php',
      description: 'RESTful API v1 routes with throttle and multi-tenancy middleware'
    },
    {
      id: 'booking-controller',
      name: 'BookingController.php',
      category: 'Laravel Controllers',
      type: 'php',
      path: 'backend-laravel/app/Http/Controllers/Api/V1/BookingController.php',
      description: 'Direct room reservation engine, night tariff computation, vouchers'
    },
    {
      id: 'room-controller',
      name: 'RoomController.php',
      category: 'Laravel Controllers',
      type: 'php',
      path: 'backend-laravel/app/Http/Controllers/Api/V1/RoomController.php',
      description: 'Room inventory, tariff tier filtering, and amenity catalogue'
    },
    {
      id: 'property-controller',
      name: 'PropertyController.php',
      category: 'Laravel Controllers',
      type: 'php',
      path: 'backend-laravel/app/Http/Controllers/Api/V1/PropertyController.php',
      description: 'Multi-tenant hotel registration, slug resolution, and branch settings'
    },
    {
      id: 'dining-controller',
      name: 'DiningController.php',
      category: 'Laravel Controllers',
      type: 'php',
      path: 'backend-laravel/app/Http/Controllers/Api/V1/DiningController.php',
      description: 'Delicia Multi-Cuisine Restaurant table bookings and guest requests'
    },
    {
      id: 'banquet-controller',
      name: 'BanquetController.php',
      category: 'Laravel Controllers',
      type: 'php',
      path: 'backend-laravel/app/Http/Controllers/Api/V1/BanquetController.php',
      description: 'Chancellor Grand Hall & corporate conference quotes and bookings'
    },
    {
      id: 'developer-controller',
      name: 'DeveloperKeyController.php',
      category: 'Laravel Controllers',
      type: 'php',
      path: 'backend-laravel/app/Http/Controllers/Api/V1/DeveloperKeyController.php',
      description: '3rd-party developer credentials, token hashing, and granular scopes'
    },
    {
      id: 'loyalty-controller',
      name: 'LoyaltyController.php',
      category: 'Laravel Controllers',
      type: 'php',
      path: 'backend-laravel/app/Http/Controllers/Api/V1/LoyaltyController.php',
      description: 'Points calculation, stay-duration tier progression (Silver, Gold, Platinum)'
    },
    {
      id: 'tenant-middleware',
      name: 'TenantResolver.php',
      category: 'Laravel Middleware',
      type: 'php',
      path: 'backend-laravel/app/Http/Middleware/TenantResolver.php',
      description: 'Resolves hotel tenant via X-Tenant-ID header and isolates DB queries'
    },
    {
      id: 'model-property',
      name: 'Property.php',
      category: 'Eloquent Models',
      type: 'php',
      path: 'backend-laravel/app/Models/Property.php',
      description: 'Multi-tenant hotel property model with room & booking relationships'
    },
    {
      id: 'model-room',
      name: 'Room.php',
      category: 'Eloquent Models',
      type: 'php',
      path: 'backend-laravel/app/Models/Room.php',
      description: 'Room inventory model with amenities casting and price tariffs'
    },
    {
      id: 'model-booking',
      name: 'Booking.php',
      category: 'Eloquent Models',
      type: 'php',
      path: 'backend-laravel/app/Models/Booking.php',
      description: 'Room reservation model with loyalty calculation and date casting'
    },
    {
      id: 'model-dining',
      name: 'DiningReservation.php',
      category: 'Eloquent Models',
      type: 'php',
      path: 'backend-laravel/app/Models/DiningReservation.php',
      description: 'Delicia Multi-Cuisine table reservation model'
    },
    {
      id: 'model-banquet',
      name: 'BanquetReservation.php',
      category: 'Eloquent Models',
      type: 'php',
      path: 'backend-laravel/app/Models/BanquetReservation.php',
      description: 'Chancellor Grand Hall event booking and quote model'
    },
    {
      id: 'model-apikey',
      name: 'ApiKey.php',
      category: 'Eloquent Models',
      type: 'php',
      path: 'backend-laravel/app/Models/ApiKey.php',
      description: 'Developer token model with hidden secret hash and scope casting'
    },
    {
      id: 'db-migration',
      name: 'create_mountmanor_saas_tables.php',
      category: 'Database Schema',
      type: 'php',
      path: 'backend-laravel/database/migrations/2026_01_01_000000_create_mountmanor_saas_tables.php',
      description: 'PostgreSQL/MySQL relational schema with foreign keys and tenant indexing'
    },
    {
      id: 'express-server',
      name: 'server.ts (Live Gateway)',
      category: 'Runtime Gateway',
      type: 'typescript',
      path: 'server.ts',
      description: 'Full-stack Express API gateway matching Laravel REST specifications'
    },
    {
      id: 'composer-json',
      name: 'composer.json',
      category: 'Dependencies',
      type: 'json',
      path: 'backend-laravel/composer.json',
      description: 'Laravel 11, Sanctum, Tenancy, and Scramble OpenAPI dependencies'
    }
  ];

  sendResponse(res, 200, fileManifest, 'Backend file manifest retrieved');
});

app.get('/api/v1/backend-files/content', (req: Request, res: Response) => {
  const filePath = req.query.path as string;
  if (!filePath) {
    return sendError(res, 400, 'Query param ?path= is required');
  }

  // Sanitize path to prevent directory traversal
  const normalized = path.normalize(filePath);
  if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
    return sendError(res, 403, 'Unauthorized path traversal attempt');
  }

  const fullPath = path.resolve(__dirname, normalized);
  if (!fs.existsSync(fullPath)) {
    return sendError(res, 404, `File '${filePath}' not found`);
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  sendResponse(res, 200, {
    path: filePath,
    content,
    linesCount: content.split('\n').length,
    sizeBytes: Buffer.byteLength(content, 'utf8')
  });
});


// -------------------------------------------------------------
// Vite Dev Server / Static Hosting Integration
// -------------------------------------------------------------
async function setupViteOrStatic() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Mount Manor Server] Running on http://localhost:${PORT}`);
  });
}

setupViteOrStatic().catch((err) => {
  console.error('[Mount Manor Server] Failed to start:', err);
});
