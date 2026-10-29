import React, { useState, useEffect } from 'react';
import { Property, Room, Booking, DiningReservation, BanquetReservation, ApiKey } from './types/index.ts';
import { api } from './services/apiClient.ts';
import { Navbar } from './components/Navbar.tsx';
import { GuestPortal } from './components/GuestPortal.tsx';
import { SaaSConsole } from './components/SaaSConsole.tsx';
import { DeveloperPortal } from './components/DeveloperPortal.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { DiningModal } from './components/DiningModal.tsx';
import { BanquetModal } from './components/BanquetModal.tsx';
import { BookingLookupModal } from './components/BookingLookupModal.tsx';
import { BackendCodeViewer } from './components/BackendCodeViewer.tsx';
import { Footer } from './components/Footer.tsx';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'guest' | 'saas' | 'developer' | 'backend'>('guest');
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [diningReservations, setDiningReservations] = useState<DiningReservation[]>([]);
  const [banquetReservations, setBanquetReservations] = useState<BanquetReservation[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDiningModalOpen, setIsDiningModalOpen] = useState(false);
  const [isBanquetModalOpen, setIsBanquetModalOpen] = useState(false);
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);

  // Initial Data Load
  const loadData = async (tenantId?: string) => {
    try {
      if (tenantId) {
        api.setTenant(tenantId);
      }

      const [props, roomList, bookingList, diningList, banquetList, keysList] = await Promise.all([
        api.getProperties(),
        api.getRooms(),
        api.getBookings(),
        api.getDiningReservations(),
        api.getBanquets(),
        api.getApiKeys()
      ]);

      setProperties(props);
      const active = props.find((p) => p.id === (tenantId || api.getTenant())) || props[0];
      setCurrentProperty(active);
      setRooms(roomList);
      setBookings(bookingList);
      setDiningReservations(diningList);
      setBanquetReservations(banquetList);
      setApiKeys(keysList);
    } catch (err) {
      console.error('Failed to load initial hospitality data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectProperty = (propId: string) => {
    setLoading(true);
    loadData(propId);
  };

  const handleOpenBooking = (room?: Room) => {
    setSelectedRoomForBooking(room || rooms[0] || null);
    setIsBookingModalOpen(true);
  };

  const handleBookingConfirmed = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleDiningReserved = (newRes: DiningReservation) => {
    setDiningReservations((prev) => [newRes, ...prev]);
  };

  const handleBanquetReserved = (newBanquet: BanquetReservation) => {
    setBanquetReservations((prev) => [newBanquet, ...prev]);
  };

  if (loading || !currentProperty) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <span className="text-xs font-mono tracking-widest uppercase">
          Mount Manor Hospitality Engine Initializing...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-400/20 selection:text-amber-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentProperty={currentProperty}
        properties={properties}
        onSelectProperty={handleSelectProperty}
        onOpenBooking={() => handleOpenBooking()}
        onOpenLookup={() => setIsLookupModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'guest' && (
          <GuestPortal
            property={currentProperty}
            rooms={rooms}
            onOpenBooking={handleOpenBooking}
            onOpenDining={() => setIsDiningModalOpen(true)}
            onOpenBanquet={() => setIsBanquetModalOpen(true)}
            onOpenLookup={() => setIsLookupModalOpen(true)}
          />
        )}

        {activeTab === 'saas' && (
          <SaaSConsole
            currentProperty={currentProperty}
            properties={properties}
            rooms={rooms}
            bookings={bookings}
            diningReservations={diningReservations}
            banquetReservations={banquetReservations}
            onSelectProperty={handleSelectProperty}
            onRefreshData={() => loadData(currentProperty.id)}
          />
        )}

        {activeTab === 'developer' && (
          <DeveloperPortal
            currentProperty={currentProperty}
            apiKeys={apiKeys}
            onRefreshKeys={() => loadData(currentProperty.id)}
          />
        )}

        {activeTab === 'backend' && (
          <BackendCodeViewer />
        )}
      </main>

      {/* Footer */}
      <Footer
        property={currentProperty}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Interactive Modals */}
      <BookingModal
        room={selectedRoomForBooking}
        property={currentProperty}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingConfirmed={handleBookingConfirmed}
      />

      <DiningModal
        property={currentProperty}
        isOpen={isDiningModalOpen}
        onClose={() => setIsDiningModalOpen(false)}
        onReserved={handleDiningReserved}
      />

      <BanquetModal
        property={currentProperty}
        isOpen={isBanquetModalOpen}
        onClose={() => setIsBanquetModalOpen(false)}
        onReserved={handleBanquetReserved}
      />

      <BookingLookupModal
        property={currentProperty}
        isOpen={isLookupModalOpen}
        onClose={() => setIsLookupModalOpen(false)}
      />
    </div>
  );
}
