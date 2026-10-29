<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use App\Models\BanquetReservation;

class BanquetController extends Controller
{
    /**
     * List banquet inquiries and bookings.
     * GET /api/v1/banquets/reservations
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID', 'mount-manor');
        $events = BanquetReservation::where('property_id', $tenantId)
            ->orderBy('event_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'status'  => 200,
            'data'    => $events,
        ]);
    }

    /**
     * Book Chancellor Grand Hall or meeting spaces.
     * POST /api/v1/banquets/reserve
     */
    public function store(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID', 'mount-manor');

        $validated = $request->validate([
            'hall_name'             => 'required|string',
            'event_type'            => 'required|string',
            'guest_name'            => 'required|string|max:255',
            'company_name'          => 'nullable|string|max:255',
            'guest_email'           => 'required|email|max:255',
            'guest_phone'           => 'required|string|max:50',
            'event_date'            => 'required|date',
            'expected_guests'       => 'required|integer|min:10|max:250',
            'catering_plan'         => 'required|in:standard,executive-buffet,royal-spread',
            'audio_visual_required' => 'nullable|boolean',
        ]);

        $count = (int) $validated['expected_guests'];
        $cateringRate = match ($validated['catering_plan']) {
            'royal-spread'     => 1200,
            'executive-buffet' => 850,
            default            => 650,
        };

        $baseVenueFee = 25000;
        $avFee = !empty($validated['audio_visual_required']) ? 5000 : 0;
        $estimatedCost = $baseVenueFee + ($count * $cateringRate) + $avFee;

        $referenceCode = 'BNQ-EVT-' . random_int(100, 999);

        $banquet = BanquetReservation::create([
            'id'                    => 'bnq-' . Str::ulid(),
            'property_id'           => $tenantId,
            'hall_name'             => $validated['hall_name'],
            'event_type'            => $validated['event_type'],
            'guest_name'            => $validated['guest_name'],
            'company_name'          => $validated['company_name'] ?? null,
            'guest_email'           => $validated['guest_email'],
            'guest_phone'           => $validated['guest_phone'],
            'event_date'            => $validated['event_date'],
            'expected_guests'       => $count,
            'catering_plan'         => $validated['catering_plan'],
            'audio_visual_required' => (bool) ($validated['audio_visual_required'] ?? false),
            'estimated_cost'        => $estimatedCost,
            'status'                => 'confirmed',
            'reference_code'        => $referenceCode,
        ]);

        return response()->json([
            'success' => true,
            'status'  => 201,
            'message' => 'Banquet hall event registered successfully.',
            'data'    => $banquet,
        ], 201);
    }
}
