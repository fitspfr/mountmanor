import {
  Property,
  Room,
  Booking,
  DiningReservation,
  BanquetReservation,
  ApiKey,
  ApiResponse,
  LoyaltyProfile
} from '../types/index.ts';

class ApiClient {
  private currentTenantId: string = 'mount-manor';
  private bearerToken: string | null = null;

  setTenant(tenantId: string) {
    this.currentTenantId = tenantId;
  }

  getTenant(): string {
    return this.currentTenantId;
  }

  setBearerToken(token: string | null) {
    this.bearerToken = token;
  }

  getBearerToken(): string | null {
    return this.bearerToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': this.currentTenantId,
      ...(options.headers as Record<string, string>)
    };

    if (this.bearerToken) {
      headers['Authorization'] = `Bearer ${this.bearerToken}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data as ApiResponse<T>;
  }

  // Properties / Tenants
  async getProperties(): Promise<Property[]> {
    const res = await this.request<Property[]>('/api/v1/properties');
    return res.data;
  }

  async getProperty(id: string): Promise<Property> {
    const res = await this.request<Property>(`/api/v1/properties/${id}`);
    return res.data;
  }

  async createProperty(propertyData: Partial<Property>): Promise<Property> {
    const res = await this.request<Property>('/api/v1/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData)
    });
    return res.data;
  }

  // Rooms
  async getRooms(params?: { category?: string; adults?: number }): Promise<Room[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.adults) query.set('adults', params.adults.toString());

    const endpoint = `/api/v1/rooms${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await this.request<Room[]>(endpoint);
    return res.data;
  }

  async getRoom(id: string): Promise<Room> {
    const res = await this.request<Room>(`/api/v1/rooms/${id}`);
    return res.data;
  }

  async createRoom(roomData: Partial<Room>): Promise<Room> {
    const res = await this.request<Room>('/api/v1/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData)
    });
    return res.data;
  }

  // Bookings
  async getBookings(email?: string): Promise<Booking[]> {
    const endpoint = email ? `/api/v1/bookings?email=${encodeURIComponent(email)}` : '/api/v1/bookings';
    const res = await this.request<Booking[]>(endpoint);
    return res.data;
  }

  async createBooking(bookingData: {
    roomId: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    checkIn: string;
    checkOut: string;
    adults?: number;
    children?: number;
    addonAirportShuttle?: boolean;
    addonBreakfast?: boolean;
  }): Promise<Booking> {
    const res = await this.request<Booking>('/api/v1/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
    return res.data;
  }

  // Dining
  async getDiningReservations(): Promise<DiningReservation[]> {
    const res = await this.request<DiningReservation[]>('/api/v1/dining/reservations');
    return res.data;
  }

  async createDiningReservation(data: {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    date: string;
    timeSlot: string;
    guestCount: number;
    seatingPreference: string;
    specialRequests?: string;
  }): Promise<DiningReservation> {
    const res = await this.request<DiningReservation>('/api/v1/dining/reserve', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  }

  // Banquet & Events
  async getBanquets(): Promise<BanquetReservation[]> {
    const res = await this.request<BanquetReservation[]>('/api/v1/banquets/reservations');
    return res.data;
  }

  async createBanquet(data: {
    hallName: string;
    eventType: string;
    guestName: string;
    companyName?: string;
    guestEmail: string;
    guestPhone: string;
    eventDate: string;
    expectedGuests: number;
    cateringPlan: string;
    audioVisualRequired: boolean;
  }): Promise<BanquetReservation> {
    const res = await this.request<BanquetReservation>('/api/v1/banquets/reserve', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  }

  // Developer Keys
  async getApiKeys(): Promise<ApiKey[]> {
    const res = await this.request<ApiKey[]>('/api/v1/developer/keys');
    return res.data;
  }

  async createApiKey(name: string, scopes: string[]): Promise<ApiKey> {
    const res = await this.request<ApiKey>('/api/v1/developer/keys', {
      method: 'POST',
      body: JSON.stringify({ name, scopes })
    });
    return res.data;
  }

  async deleteApiKey(id: string): Promise<void> {
    await this.request<{ id: string }>(`/api/v1/developer/keys/${id}`, {
      method: 'DELETE'
    });
  }

  // OpenAPI Specification
  async getOpenApiSpec(): Promise<Record<string, unknown>> {
    const res = await fetch('/api/v1/docs/openapi.json');
    return res.json();
  }

  // Laravel Blueprint
  async getLaravelBlueprint(): Promise<{ framework: string; routesPhp: string; composerPackages: string[] }> {
    const res = await fetch('/api/v1/laravel/routes');
    const json = await res.json();
    return json.data;
  }

  // Loyalty System
  async getLoyaltyStatus(email?: string): Promise<LoyaltyProfile> {
    const endpoint = email ? `/api/v1/loyalty?email=${encodeURIComponent(email)}` : '/api/v1/loyalty';
    const res = await this.request<LoyaltyProfile>(endpoint);
    return res.data;
  }

  async redeemLoyaltyPoints(points: number, perkType: string): Promise<{
    redeemedPoints: number;
    voucherCode: string;
    description: string;
    validUntil: string;
  }> {
    const res = await this.request<{
      redeemedPoints: number;
      voucherCode: string;
      description: string;
      validUntil: string;
    }>('/api/v1/loyalty/redeem', {
      method: 'POST',
      body: JSON.stringify({ points, perkType })
    });
    return res.data;
  }
}

export const api = new ApiClient();
