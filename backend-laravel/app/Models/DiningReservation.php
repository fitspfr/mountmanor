<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiningReservation extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'dining_reservations';

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
        'restaurant_name',
        'guest_name',
        'guest_email',
        'guest_phone',
        'date',
        'time_slot',
        'guest_count',
        'seating_preference',
        'special_requests',
        'status',
        'reference_code',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date'        => 'date:Y-m-d',
        'guest_count' => 'integer',
    ];

    /**
     * Tenant hotel property.
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id', 'id');
    }
}
