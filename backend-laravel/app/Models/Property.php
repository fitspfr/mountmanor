<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'properties';

    /**
     * Primary key type is string (slug or ULID).
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'name',
        'tagline',
        'slug',
        'city',
        'state',
        'country',
        'postal_code',
        'address',
        'landmark',
        'phone',
        'alternate_phone',
        'email',
        'rating',
        'review_count',
        'check_in_time',
        'check_out_time',
        'currency',
        'currency_symbol',
        'latitude',
        'longitude',
        'features',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'features'     => 'array',
        'rating'       => 'float',
        'review_count' => 'integer',
        'latitude'     => 'float',
        'longitude'    => 'float',
    ];

    /**
     * Get rooms available under this hotel tenant.
     */
    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class, 'property_id', 'id');
    }

    /**
     * Get bookings made for this hotel tenant.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'property_id', 'id');
    }

    /**
     * Get dining table reservations at this property.
     */
    public function diningReservations(): HasMany
    {
        return $this->hasMany(DiningReservation::class, 'property_id', 'id');
    }

    /**
     * Get banquet hall event bookings for this property.
     */
    public function banquetReservations(): HasMany
    {
        return $this->hasMany(BanquetReservation::class, 'property_id', 'id');
    }

    /**
     * Get 3rd-party developer API keys scoped to this tenant.
     */
    public function apiKeys(): HasMany
    {
        return $this->hasMany(ApiKey::class, 'property_id', 'id');
    }
}
