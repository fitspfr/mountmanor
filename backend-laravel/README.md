# Mount Manor - Full Production Laravel 11 Backend

This directory contains the complete, standalone Laravel 11 backend project for the modernized Hotel Mount Manor Chennai hospitality platform. It includes the standard Laravel executable (`artisan`), HTTP front controller (`public/index.php`), application bootstrap (`bootstrap/app.php`), configuration files, database migrations & seeders, Eloquent models, and multi-tenant RESTful API controllers.

## Complete Directory Structure

```
backend-laravel/
├── artisan                                # Laravel CLI executable entrypoint
├── bootstrap/
│   ├── app.php                            # Laravel 11 app configuration (routing, middleware)
│   └── providers.php                      # Application service provider registration
├── public/
│   ├── index.php                          # HTTP front controller
│   ├── .htaccess                          # Apache URL rewrite rules
│   └── robots.txt
├── config/
│   ├── app.php                            # Application name, timezone, locale, cipher
│   ├── auth.php                           # Authentication guards, providers & Sanctum
│   ├── cors.php                           # Cross-Origin Resource Sharing policy for React SPA
│   ├── database.php                       # PostgreSQL, MySQL, SQLite connection profiles
│   ├── logging.php                        # Monolog channel configuration
│   └── services.php                       # Third-party integrations
├── app/
│   ├── Models/
│   │   ├── Property.php                   # Hotel tenant model & relationships
│   │   ├── Room.php                       # Room inventory & tariff casts
│   │   ├── Booking.php                    # Room bookings & loyalty points
│   │   ├── DiningReservation.php          # Delicia table reservations
│   │   ├── BanquetReservation.php         # Chancellor Hall banquet quotes
│   │   ├── ApiKey.php                     # Developer API keys with scopes
│   │   └── User.php                       # Authenticatable user model
│   ├── Http/
│   │   ├── Controllers/Api/V1/
│   │   │   ├── PropertyController.php     # Multi-tenant property CRUD
│   │   │   ├── RoomController.php         # Room availability & tariffs
│   │   │   ├── BookingController.php      # Direct guest reservation engine
│   │   │   ├── DiningController.php       # Delicia Restaurant reservations
│   │   │   ├── BanquetController.php      # Chancellor Hall events & inquiries
│   │   │   ├── DeveloperKeyController.php # 3rd-party API token provisioning
│   │   │   └── LoyaltyController.php      # Loyalty tier & reward calculations
│   │   └── Middleware/
│   │       └── TenantResolver.php         # Scopes queries by X-Tenant-ID
│   └── Providers/
│       └── AppServiceProvider.php         # Application service bootstrapping
├── database/
│   ├── migrations/
│   │   └── 2026_01_01_000000_create_mountmanor_saas_tables.php
│   └── seeders/
│       └── DatabaseSeeder.php             # Seeds Mount Manor property, rooms, user & keys
├── routes/
│   ├── api.php                            # RESTful API v1 route definitions
│   ├── web.php                            # Web endpoints & system status
│   └── console.php                        # Artisan console command definitions
├── storage/
│   ├── app/
│   ├── framework/
│   │   ├── cache/
│   │   ├── sessions/
│   │   └── views/
│   └── logs/
├── .env.example                           # Pre-configured PostgreSQL connection template
├── .gitignore                             # Ignores vendor, .env, and local storage keys
├── composer.json                          # Laravel 11 dependencies and autoloaders
└── phpunit.xml                            # PHPUnit automated test runner config
```

## Running the Backend

1. Ensure **PHP 8.2+** and **Composer** are installed on your machine.
2. In this directory (`backend-laravel/`), run:
   ```bash
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve --port=8000
   ```
3. Your Laravel API is now live at `http://127.0.0.1:8000`.
4. Connect the React frontend by entering `http://localhost:8000` in the **Developer Portal** or setting `VITE_API_BASE_URL=http://localhost:8000` in your root `.env`.
