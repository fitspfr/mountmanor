<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'bookings';

    /**
     * String ULID primary key.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Non-incrementing primary key.
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
        'property_id',
        'room_id',
        'room_name',
        'guest_name',
        'guest_email',
        'guest_phone',
        'check_in',
        'check_out',
        'nights',
        'adults',
        'children',
        'room_rate',
        'addon_airport_shuttle',
        'addon_breakfast',
        'total_amount',
        'status',
        'reference_code',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'check_in'              => 'date:Y-m-d',
        'check_out'             => 'date:Y-m-d',
        'nights'                => 'integer',
        'adults'                => 'integer',
        'children'              => 'integer',
        'room_rate'             => 'integer',
        'addon_airport_shuttle' => 'boolean',
        'addon_breakfast'       => 'boolean',
        'total_amount'          => 'integer',
    ];

    /**
     * Tenant hotel property.
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id', 'id');
    }

    /**
     * Reserved room category.
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id', 'id');
    }

    /**
     * Calculate loyalty points earned on this reservation.
     */
    public function getLoyaltyPointsAttribute(): int
    {
        return ($this->nights * 100) + (int) floor($this->total_amount / 100);
    }
}
