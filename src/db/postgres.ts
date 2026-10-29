import { newDb, IMemoryDb } from 'pg-mem';
import pg from 'pg';
import {
  INITIAL_PROPERTIES,
  INITIAL_ROOMS,
  INITIAL_BOOKINGS,
  INITIAL_DINING_RESERVATIONS,
  INITIAL_BANQUETS,
  INITIAL_API_KEYS
} from '../data/mockData.ts';

const { Pool } = pg;

interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

class PostgresDatabase {
  private memDb: IMemoryDb | null = null;
  private activePool: any = null;
  private isExternalConnected: boolean = false;
  private engineType: 'local-in-process-postgres' | 'local-network-postgres' = 'local-in-process-postgres';
  private readyPromise: Promise<void>;

  constructor() {
    this.readyPromise = this.initDatabase().catch((err) => {
      console.error('[PostgreSQL] Initialization error:', err);
    });
  }

  public async waitUntilReady(): Promise<void> {
    await this.readyPromise;
  }

  private async initDatabase() {
    // 1. Check if external local PostgreSQL connection string is supplied
    const connectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING;

    if (connectionString) {
      try {
        const pool = new Pool({
          connectionString,
          connectionTimeoutMillis: 3000
        });

        // Test connection
        await pool.query('SELECT 1');
        this.activePool = pool;
        this.isExternalConnected = true;
        this.engineType = 'local-network-postgres';
        console.log('[PostgreSQL] Connected to local network PostgreSQL database instance');
        await this.createSchema();
        await this.seedInitialData();
        return;
      } catch (err) {
        console.warn('[PostgreSQL] Could not connect to external DATABASE_URL, using local in-process PostgreSQL engine:', (err as Error).message);
        this.isExternalConnected = false;
      }
    }

    // 2. Initialize in-process local PostgreSQL engine (pg-mem)
    await this.initLocalEngine();
  }

  private async initLocalEngine() {
    this.engineType = 'local-in-process-postgres';
    this.memDb = newDb();

    // Register standard PG functions
    this.memDb.public.registerFunction({
      name: 'version',
      implementation: () => 'PostgreSQL 16.2 (Mount Manor In-Process Local Edition)'
    });

    this.memDb.public.registerFunction({
      name: 'current_database',
      implementation: () => 'mountmanor_local_db'
    });

    // Create a pg-compatible pool from pg-mem adapter
    const pgAdapter = this.memDb.adapters.createPg();
    this.activePool = new pgAdapter.Pool();

    // Create schema and seed data through standard Pool.query interface
    await this.createSchema();
    await this.seedInitialData();

    console.log('[PostgreSQL] Local in-process PostgreSQL database engine initialized with 6 relational tables');
  }

  private async createSchema() {
    if (!this.activePool) return;

    await this.activePool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        tagline VARCHAR(255),
        slug VARCHAR(100) UNIQUE NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) DEFAULT 'Tamil Nadu',
        country VARCHAR(100) DEFAULT 'India',
        postal_code VARCHAR(20) DEFAULT '600016',
        address TEXT,
        landmark VARCHAR(255),
        phone VARCHAR(50) NOT NULL,
        alternate_phone VARCHAR(50),
        email VARCHAR(255) NOT NULL,
        rating NUMERIC(3, 1) DEFAULT 4.4,
        review_count INTEGER DEFAULT 0,
        check_in_time VARCHAR(20) DEFAULT '12:00 PM',
        check_out_time VARCHAR(20) DEFAULT '12:00 PM',
        currency VARCHAR(5) DEFAULT 'INR',
        currency_symbol VARCHAR(5) DEFAULT '₹',
        description TEXT,
        latitude NUMERIC(10, 7),
        longitude NUMERIC(10, 7),
        features JSONB,
        highlights JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS rooms (
        id VARCHAR(100) PRIMARY KEY,
        property_id VARCHAR(100) REFERENCES properties(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        tagline VARCHAR(255),
        price_per_night NUMERIC(10, 2) NOT NULL,
        original_price NUMERIC(10, 2),
        capacity_adults SMALLINT DEFAULT 2,
        capacity_children SMALLINT DEFAULT 1,
        bed_type VARCHAR(100) DEFAULT 'King Bed',
        size_sqft INTEGER DEFAULT 280,
        description TEXT,
        amenities JSONB,
        available_units INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(100) PRIMARY KEY,
        property_id VARCHAR(100) REFERENCES properties(id) ON DELETE CASCADE,
        room_id VARCHAR(100) NOT NULL,
        room_name VARCHAR(255) NOT NULL,
        guest_name VARCHAR(255) NOT NULL,
        guest_email VARCHAR(255) NOT NULL,
        guest_phone VARCHAR(50) NOT NULL,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        nights SMALLINT DEFAULT 1,
        adults SMALLINT DEFAULT 2,
        children SMALLINT DEFAULT 0,
        room_rate NUMERIC(10, 2) NOT NULL,
        addon_airport_shuttle BOOLEAN DEFAULT FALSE,
        addon_breakfast BOOLEAN DEFAULT FALSE,
        total_amount NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'confirmed',
        reference_code VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS dining_reservations (
        id VARCHAR(100) PRIMARY KEY,
        property_id VARCHAR(100) REFERENCES properties(id) ON DELETE CASCADE,
        restaurant_name VARCHAR(255) DEFAULT 'Delicia Multi-Cuisine',
        guest_name VARCHAR(255) NOT NULL,
        guest_email VARCHAR(255) NOT NULL,
        guest_phone VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        time_slot VARCHAR(50) NOT NULL,
        guest_count SMALLINT DEFAULT 2,
        seating_preference VARCHAR(50) DEFAULT 'indoor-ac',
        special_requests TEXT,
        status VARCHAR(50) DEFAULT 'confirmed',
        reference_code VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS banquet_reservations (
        id VARCHAR(100) PRIMARY KEY,
        property_id VARCHAR(100) REFERENCES properties(id) ON DELETE CASCADE,
        hall_name VARCHAR(255) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        guest_name VARCHAR(255) NOT NULL,
        company_name VARCHAR(255),
        guest_email VARCHAR(255) NOT NULL,
        guest_phone VARCHAR(50) NOT NULL,
        event_date DATE NOT NULL,
        duration_hours SMALLINT DEFAULT 6,
        expected_guests SMALLINT NOT NULL,
        catering_plan VARCHAR(100) DEFAULT 'executive-buffet',
        audio_visual_required BOOLEAN DEFAULT FALSE,
        estimated_cost NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'confirmed',
        reference_code VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS developer_api_keys (
        id VARCHAR(100) PRIMARY KEY,
        property_id VARCHAR(100) REFERENCES properties(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        raw_key VARCHAR(255) NOT NULL,
        masked_key VARCHAR(100) NOT NULL,
        scopes JSONB NOT NULL,
        requests_count BIGINT DEFAULT 0,
        last_used_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  private async seedInitialData() {
    if (!this.activePool) return;

    // Check if properties already seeded
    const existing = await this.activePool.query('SELECT COUNT(*) as count FROM properties');
    if (parseInt(existing.rows[0]?.count || '0', 10) > 0) {
      return;
    }

    // Seed Properties
    for (const p of INITIAL_PROPERTIES) {
      await this.activePool.query(
        `INSERT INTO properties (id, name, tagline, slug, city, state, country, postal_code, address, landmark, phone, alternate_phone, email, rating, review_count, check_in_time, check_out_time, currency, currency_symbol, description, latitude, longitude, features, highlights)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
        [
          p.id,
          p.name,
          p.tagline,
          p.slug,
          p.city,
          p.state,
          p.country,
          p.postalCode,
          p.address,
          p.landmark,
          p.phone,
          p.alternatePhone || null,
          p.email,
          p.rating,
          p.reviewCount,
          p.checkInTime,
          p.checkOutTime,
          p.currency,
          p.currencySymbol,
          p.description,
          p.coordinates.lat,
          p.coordinates.lng,
          JSON.stringify(p.features),
          JSON.stringify(p.highlights)
        ]
      );
    }

    // Seed Rooms
    for (const r of INITIAL_ROOMS) {
      await this.activePool.query(
        `INSERT INTO rooms (id, property_id, name, category, tagline, price_per_night, original_price, capacity_adults, capacity_children, bed_type, size_sqft, description, amenities, available_units)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          r.id,
          r.propertyId,
          r.name,
          r.category,
          r.tagline,
          r.pricePerNight,
          r.originalPricePerNight,
          r.capacity.adults,
          r.capacity.children,
          r.bedType,
          r.sizeSqFt,
          r.description,
          JSON.stringify(r.amenities),
          r.availableUnits
        ]
      );
    }

    // Seed Bookings
    for (const b of INITIAL_BOOKINGS) {
      await this.activePool.query(
        `INSERT INTO bookings (id, property_id, room_id, room_name, guest_name, guest_email, guest_phone, check_in, check_out, nights, adults, children, room_rate, addon_airport_shuttle, addon_breakfast, total_amount, status, reference_code, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          b.id,
          b.propertyId,
          b.roomId,
          b.roomName,
          b.guestName,
          b.guestEmail,
          b.guestPhone,
          b.checkIn,
          b.checkOut,
          b.nights,
          b.adults,
          b.children,
          b.roomRate,
          b.addonAirportShuttle,
          b.addonBreakfast,
          b.totalAmount,
          b.status,
          b.referenceCode,
          b.createdAt
        ]
      );
    }

    // Seed Dining
    for (const d of INITIAL_DINING_RESERVATIONS) {
      await this.activePool.query(
        `INSERT INTO dining_reservations (id, property_id, restaurant_name, guest_name, guest_email, guest_phone, date, time_slot, guest_count, seating_preference, special_requests, status, reference_code, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          d.id,
          d.propertyId,
          d.restaurantName,
          d.guestName,
          d.guestEmail,
          d.guestPhone,
          d.date,
          d.timeSlot,
          d.guestCount,
          d.seatingPreference,
          d.specialRequests || null,
          d.status,
          d.referenceCode,
          d.createdAt
        ]
      );
    }

    // Seed Banquets
    for (const bnq of INITIAL_BANQUETS) {
      await this.activePool.query(
        `INSERT INTO banquet_reservations (id, property_id, hall_name, event_type, guest_name, company_name, guest_email, guest_phone, event_date, duration_hours, expected_guests, catering_plan, audio_visual_required, estimated_cost, status, reference_code, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          bnq.id,
          bnq.propertyId,
          bnq.hallName,
          bnq.eventType,
          bnq.guestName,
          bnq.companyName || null,
          bnq.guestEmail,
          bnq.guestPhone,
          bnq.eventDate,
          bnq.durationHours,
          bnq.expectedGuests,
          bnq.cateringPlan,
          bnq.audioVisualRequired,
          bnq.estimatedCost,
          bnq.status,
          bnq.referenceCode,
          bnq.createdAt
        ]
      );
    }

    // Seed API Keys
    for (const k of INITIAL_API_KEYS) {
      await this.activePool.query(
        `INSERT INTO developer_api_keys (id, property_id, name, token_hash, raw_key, masked_key, scopes, requests_count, last_used_at, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          k.id,
          k.propertyId,
          k.name,
          'sha256_hash_' + k.id,
          k.key,
          k.maskedKey,
          JSON.stringify(k.scopes),
          k.requestsCount,
          k.lastUsedAt || null,
          k.status,
          k.createdAt
        ]
      );
    }
  }

  // Unified SQL query method
  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    await this.waitUntilReady();

    if (!this.activePool) {
      throw new Error('No PostgreSQL database connection is available.');
    }

    const res = await this.activePool.query(sql, params);
    return {
      rows: (res.rows || []) as T[],
      rowCount: res.rowCount ?? (res.rows ? res.rows.length : 0)
    };
  }

  getStatus() {
    return {
      engine: 'PostgreSQL 16.2',
      type: this.engineType,
      isExternalConnected: this.isExternalConnected,
      tables: ['properties', 'rooms', 'bookings', 'dining_reservations', 'banquet_reservations', 'developer_api_keys'],
      host: this.isExternalConnected ? process.env.PGHOST || 'localhost' : 'in-process (pg-mem)',
      port: 5432,
      database: 'mountmanor_local_db',
      user: 'postgres',
      ssl: false,
      cloudDependency: false,
      timestamp: new Date().toISOString()
    };
  }
}

export const postgresDb = new PostgresDatabase();
