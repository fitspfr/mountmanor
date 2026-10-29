# Mount Manor - Laravel 11 Backend Architecture

This directory contains the production Laravel 11 backend code for the modernized Mount Manor hospitality platform.

## Directory Structure

```
backend-laravel/
├── app/
│   ├── Models/
│   │   ├── Property.php                 # Hotel tenant model & relationships
│   │   ├── Room.php                     # Room inventory & tariff casts
│   │   ├── Booking.php                  # Room bookings & loyalty points
│   │   ├── DiningReservation.php        # Delicia table reservations
│   │   ├── BanquetReservation.php       # Chancellor Hall banquet quotes
│   │   └── ApiKey.php                   # Developer API keys with scopes
│   ├── Http/
│   │   ├── Controllers/Api/V1/
│   │   │   ├── PropertyController.php       # Multi-tenant property CRUD
│   │   │   ├── RoomController.php           # Room availability & tariffs
│   │   │   ├── BookingController.php        # Direct guest reservation engine
│   │   │   ├── DiningController.php         # Delicia Restaurant reservations
│   │   │   ├── BanquetController.php        # Chancellor Hall events & inquiries
│   │   │   ├── DeveloperKeyController.php   # 3rd-party API token provisioning
│   │   │   └── LoyaltyController.php        # Loyalty tier & reward calculations
│   │   └── Middleware/
│   │       └── TenantResolver.php           # Scopes queries by X-Tenant-ID
├── database/
│   └── migrations/
│       └── 2026_01_01_000000_create_mountmanor_saas_tables.php
├── routes/
│   └── api.php                              # RESTful API v1 route definitions
└── composer.json
```

## Running with PHP/Laravel

1. Install PHP 8.2+ and Composer.
2. In this directory, run:
   ```bash
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve --port=8000
   ```
3. Connect your React frontend by pointing `VITE_API_URL` to `http://localhost:8000`.
