<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\PropertyController;
use App\Http\Controllers\Api\V1\RoomController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\DiningController;
use App\Http\Controllers\Api\V1\BanquetController;
use App\Http\Controllers\Api\V1\DeveloperKeyController;
use App\Http\Controllers\Api\V1\LoyaltyController;
use App\Http\Middleware\TenantResolver;

/*
|--------------------------------------------------------------------------
| Mount Manor Hospitality API Routes (v1)
|--------------------------------------------------------------------------
|
| Decoupled RESTful API connecting React frontend & third-party developer
| platforms. All endpoints are scoped per hotel property tenant.
|
*/

Route::prefix('v1')->middleware([TenantResolver::class, 'throttle:120,1'])->group(function () {

    // System Health Check
    Route::get('/health', function () {
        return response()->json([
            'status'     => 'healthy',
            'engine'     => 'Laravel 11 Hospitality SaaS Core',
            'app'        => 'Mount Manor Hotel Chennai',
            'version'    => '1.0.0',
            'timestamp'  => now()->toIso8601String(),
        ]);
    });

    // 1. Hotel Property Tenants
    Route::get('/properties', [PropertyController::class, 'index']);
    Route::get('/properties/{id}', [PropertyController::class, 'show']);
    Route::post('/properties', [PropertyController::class, 'store']);

    // 2. Rooms & Inventory
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/rooms/{id}', [RoomController::class, 'show']);
    Route::post('/rooms', [RoomController::class, 'store']);

    // 3. Room Bookings (Direct Reservation Engine)
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);

    // 4. Delicia Dining Reservations
    Route::get('/dining/reservations', [DiningController::class, 'index']);
    Route::post('/dining/reserve', [DiningController::class, 'store']);

    // 5. Chancellor Banquet & Conference Hall Bookings
    Route::get('/banquets/reservations', [BanquetController::class, 'index']);
    Route::post('/banquets/reserve', [BanquetController::class, 'store']);

    // 6. 3rd-Party Developer API Keys
    Route::get('/developer/keys', [DeveloperKeyController::class, 'index']);
    Route::post('/developer/keys', [DeveloperKeyController::class, 'store']);
    Route::delete('/developer/keys/{id}', [DeveloperKeyController::class, 'destroy']);

    // 7. Guest Loyalty Points & Stay-Duration Tiers
    Route::get('/loyalty', [LoyaltyController::class, 'show']);
    Route::post('/loyalty/redeem', [LoyaltyController::class, 'redeem']);
});
