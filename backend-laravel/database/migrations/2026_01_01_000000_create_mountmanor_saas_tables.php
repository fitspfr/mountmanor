<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Properties / Hotel Tenants Table
        Schema::create('properties', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. mount-manor
            $table->string('name');
            $table->string('tagline')->nullable();
            $table->string('slug')->unique();
            $table->string('city');
            $table->string('state')->default('Tamil Nadu');
            $table->string('country')->default('India');
            $table->string('postal_code')->default('600016');
            $table->text('address')->nullable();
            $table->string('landmark')->nullable();
            $table->string('phone');
            $table->string('alternate_phone')->nullable();
            $table->string('email');
            $table->decimal('rating', 2, 1)->default(4.4);
            $table->unsignedInteger('review_count')->default(0);
            $table->string('check_in_time')->default('12:00 PM');
            $table->string('check_out_time')->default('12:00 PM');
            $table->string('currency', 3)->default('INR');
            $table->string('currency_symbol', 5)->default('₹');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->json('features')->nullable();
            $table->timestamps();
        });

        // 2. Rooms Table
        Schema::create('rooms', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('property_id');
            $table->string('name');
            $table->enum('category', ['standard', 'deluxe', 'suite', 'executive']);
            $table->string('tagline')->nullable();
            $table->unsignedInteger('price_per_night');
            $table->unsignedInteger('original_price')->nullable();
            $table->unsignedTinyInteger('capacity_adults')->default(2);
            $table->unsignedTinyInteger('capacity_children')->default(1);
            $table->string('bed_type')->default('King Bed');
            $table->unsignedSmallInteger('size_sqft')->default(280);
            $table->text('description')->nullable();
            $table->json('amenities')->nullable();
            $table->unsignedSmallInteger('available_units')->default(5);
            $table->timestamps();

            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
        });

        // 3. Bookings Table
        Schema::create('bookings', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('property_id');
            $table->string('room_id');
            $table->string('room_name');
            $table->string('guest_name');
            $table->string('guest_email');
            $table->string('guest_phone');
            $table->date('check_in');
            $table->date('check_out');
            $table->unsignedSmallInteger('nights')->default(1);
            $table->unsignedTinyInteger('adults')->default(2);
            $table->unsignedTinyInteger('children')->default(0);
            $table->unsignedInteger('room_rate');
            $table->boolean('addon_airport_shuttle')->default(false);
            $table->boolean('addon_breakfast')->default(false);
            $table->unsignedInteger('total_amount');
            $table->string('status')->default('confirmed');
            $table->string('reference_code')->unique();
            $table->timestamps();

            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
        });

        // 4. Delicia Dining Reservations Table
        Schema::create('dining_reservations', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('property_id');
            $table->string('restaurant_name')->default('Delicia Multi-Cuisine');
            $table->string('guest_name');
            $table->string('guest_email');
            $table->string('guest_phone');
            $table->date('date');
            $table->string('time_slot');
            $table->unsignedTinyInteger('guest_count')->default(2);
            $table->string('seating_preference')->default('indoor-ac');
            $table->text('special_requests')->nullable();
            $table->string('status')->default('confirmed');
            $table->string('reference_code')->unique();
            $table->timestamps();

            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
        });

        // 5. Chancellor Banquet Reservations Table
        Schema::create('banquet_reservations', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('property_id');
            $table->string('hall_name');
            $table->string('event_type');
            $table->string('guest_name');
            $table->string('company_name')->nullable();
            $table->string('guest_email');
            $table->string('guest_phone');
            $table->date('event_date');
            $table->unsignedSmallInteger('expected_guests');
            $table->string('catering_plan');
            $table->boolean('audio_visual_required')->default(false);
            $table->unsignedInteger('estimated_cost');
            $table->string('status')->default('confirmed');
            $table->string('reference_code')->unique();
            $table->timestamps();

            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
        });

        // 6. Developer API Tokens Table
        Schema::create('developer_api_keys', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('property_id');
            $table->string('name');
            $table->string('token'); // Hashed SHA-256
            $table->string('masked_token');
            $table->json('scopes');
            $table->unsignedBigInteger('requests_count')->default(0);
            $table->timestamp('last_used_at')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();

            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('developer_api_keys');
        Schema::dropIfExists('banquet_reservations');
        Schema::dropIfExists('dining_reservations');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('properties');
    }
};
