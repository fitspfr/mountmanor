<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BanquetReservation extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'banquet_reservations';

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
        'hall_name',
        'event_type',
        'guest_name',
        'company_name',
        'guest_email',
        'guest_phone',
        'event_date',
        'expected_guests',
        'catering_plan',
        'audio_visual_required',
        'estimated_cost',
        'status',
        'reference_code',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'event_date'            => 'date:Y-m-d',
        'expected_guests'       => 'integer',
        'audio_visual_required' => 'boolean',
        'estimated_cost'        => 'integer',
    ];

    /**
     * Tenant hotel property.
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id', 'id');
    }
}
