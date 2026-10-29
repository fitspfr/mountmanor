<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'rooms';

    /**
     * Primary key type is string.
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
        'name',
        'category',
        'tagline',
        'price_per_night',
        'original_price',
        'capacity_adults',
        'capacity_children',
        'bed_type',
        'size_sqft',
        'description',
        'amenities',
        'available_units',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amenities'         => 'array',
        'price_per_night'   => 'integer',
        'original_price'    => 'integer',
        'capacity_adults'   => 'integer',
        'capacity_children' => 'integer',
        'size_sqft'         => 'integer',
        'available_units'   => 'integer',
    ];

    /**
     * Parent hotel property.
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id', 'id');
    }

    /**
     * Guest bookings for this room category.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'room_id', 'id');
    }
}
