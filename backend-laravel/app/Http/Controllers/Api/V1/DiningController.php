<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use App\Models\DiningReservation;

class DiningController extends Controller
{
    /**
     * List dining reservations for Delicia Restaurant.
     * GET /api/v1/dining/reservations
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID', 'mount-manor');
        $reservations = DiningReservation::where('property_id', $tenantId)
            ->orderBy('date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'status'  => 200,
            'data'    => $reservations,
        ]);
    }

    /**
     * Reserve a table at Delicia Multi-Cuisine.
     * POST /api/v1/dining/reserve
     */
    public function store(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID', 'mount-manor');

        $validated = $request->validate([
            'guest_name'         => 'required|string|max:255',
            'guest_email'        => 'required|email|max:255',
            'guest_phone'        => 'required|string|max:50',
            'date'               => 'required|date',
            'time_slot'          => 'required|string',
            'guest_count'        => 'required|integer|min:1|max:30',
            'seating_preference' => 'required|in:indoor-ac,executive-booth,family-lounge',
            'special_requests'   => 'nullable|string|max:500',
        ]);

        $referenceCode = 'DEL-RES-' . random_int(1000, 9999);

        $reservation = DiningReservation::create([
            'id'                 => 'din-' . Str::ulid(),
            'property_id'        => $tenantId,
            'restaurant_name'    => 'Delicia Multi-Cuisine',
            'guest_name'         => $validated['guest_name'],
            'guest_email'        => $validated['guest_email'],
            'guest_phone'        => $validated['guest_phone'],
            'date'               => $validated['date'],
            'time_slot'          => $validated['time_slot'],
            'guest_count'        => $validated['guest_count'],
            'seating_preference' => $validated['seating_preference'],
            'special_requests'   => $validated['special_requests'] ?? null,
            'status'             => 'confirmed',
            'reference_code'     => $referenceCode,
        ]);

        return response()->json([
            'success' => true,
            'status'  => 201,
            'message' => 'Delicia dining table reserved successfully.',
            'data'    => $reservation,
        ], 201);
    }
}
