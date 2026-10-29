<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Property;
use App\Models\Room;
use App\Models\ApiKey;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Default Admin User
        User::firstOrCreate(
            ['email' => 'admin@mountmanor.com'],
            [
                'name' => 'Mount Manor General Manager',
                'password' => bcrypt('MountManor2026!'),
            ]
        );

        // 2. Seed Primary Hotel Property Tenant
        $mountManor = Property::firstOrCreate(
            ['id' => 'mount-manor'],
            [
                'name' => 'Hotel Mount Manor Chennai',
                'tagline' => 'Luxury Hospitality Near Chennai International Airport',
                'description' => 'A premier 4-star boutique hotel situated at St. Thomas Mount, offering luxury accommodation, Delicia multi-cuisine restaurant, and Chancellor banquet halls.',
                'city' => 'Chennai',
                'country' => 'India',
                'address' => 'No. 5/384, Mount Poonamallee High Road, St. Thomas Mount',
                'postal_code' => '600016',
                'latitude' => 13.0033,
                'longitude' => 80.1983,
                'phone' => '+91 44 2232 5555',
                'email' => 'reservations@mountmanor.com',
                'website' => 'https://mountmanor.com',
                'currency' => 'INR',
                'currency_symbol' => '₹',
                'status' => 'active',
                'amenities' => [
                    'Airport Shuttle (10 Mins)',
                    'Delicia Multi-Cuisine Dining',
                    'High-Speed Wi-Fi',
                    '24x7 In-Room Dining',
                    'Chancellor Banquet Hall',
                    'Valet Parking',
                    'Fitness Center'
                ]
            ]
        );

        // 3. Seed Rooms Inventory
        $rooms = [
            [
                'id' => 'mm-std-01',
                'property_id' => 'mount-manor',
                'name' => 'Standard Executive Room',
                'category' => 'standard',
                'description' => 'Modern, soundproof executive room designed for business travelers with plush bedding, work desk, and express airport connectivity.',
                'price_per_night' => 3200,
                'max_adults' => 2,
                'max_children' => 1,
                'bed_type' => 'Queen Bed',
                'room_size_sqft' => 240,
                'amenities' => ['Complimentary Wi-Fi', 'Coffee Maker', 'Smart LED TV', 'Work Desk', 'Rain Shower'],
                'images' => ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80'],
                'total_inventory' => 20,
                'available_count' => 18,
                'status' => 'available'
            ],
            [
                'id' => 'mm-dlx-02',
                'property_id' => 'mount-manor',
                'name' => 'Deluxe King Suite',
                'category' => 'deluxe',
                'description' => 'Spacious room featuring a California King bed, city views of St. Thomas Mount, and premium bath amenities.',
                'price_per_night' => 4500,
                'max_adults' => 3,
                'max_children' => 1,
                'bed_type' => 'King Bed',
                'room_size_sqft' => 340,
                'amenities' => ['City View', 'Complimentary Buffet Breakfast', 'Express Check-in', 'Mini Bar', 'Bathrobe & Slippers'],
                'images' => ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'],
                'total_inventory' => 15,
                'available_count' => 12,
                'status' => 'available'
            ],
            [
                'id' => 'mm-ste-03',
                'property_id' => 'mount-manor',
                'name' => 'Presidential Royal Suite',
                'category' => 'suite',
                'description' => 'Unparalleled luxury with a separate living lounge, dining area, jacuzzi bathroom, and complimentary two-way luxury airport transfers.',
                'price_per_night' => 7800,
                'max_adults' => 4,
                'max_children' => 2,
                'bed_type' => 'Master King Bed + Daybed',
                'room_size_sqft' => 560,
                'amenities' => ['Private Jacuzzi', 'Living & Dining Lounge', 'Chauffeur Airport Drop', 'Butler on Demand', 'Wine Selection'],
                'images' => ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'],
                'total_inventory' => 6,
                'available_count' => 5,
                'status' => 'available'
            ]
        ];

        foreach ($rooms as $room) {
            Room::firstOrCreate(['id' => $room['id']], $room);
        }

        // 4. Seed Live Developer API Key
        ApiKey::firstOrCreate(
            ['id' => 'key_mm_dev_production_01'],
            [
                'property_id' => 'mount-manor',
                'name' => 'Mount Manor Master Production Key',
                'key' => 'sk_live_mm_mountmanor2026prod',
                'secret_hash' => hash('sha256', 'sk_live_mm_mountmanor2026prod'),
                'scopes' => ['read:rooms', 'write:bookings', 'read:properties', 'write:dining', 'read:analytics'],
                'status' => 'active',
                'expires_at' => now()->addYear()
            ]
        );
    }
}
