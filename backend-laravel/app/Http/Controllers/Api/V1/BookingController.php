<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\Room;
use App\Models\Booking;

class BookingController extends Controller
{
    /**
     * List bookings for the current tenant.
     * GET /api/v1/bookings
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID', 'mount-manor');

        $query = Booking::where('property_id', $tenantId);

        if ($request->has('email')) {
            $query->where('guest_email', $request->email);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $bookings = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'status'  => 200,
            'data'    => $bookings,
            'meta'    => [
                'total' => $bookings->count(),
            ]
        ]);
    }

    /**
     * Create a room reservation voucher.
     * POST /api/v1/bookings
     */
    public function store(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID', 'mount-manor');

        $validated = $request->validate([
            'room_id'               => 'required|string',
            'guest_name'            => 'required|string|min:2|max:255',
            'guest_email'           => 'required|email|max:255',
            'guest_phone'           => 'required|string|max:50',
            'check_in'              => 'required|date|after_or_equal:today',
            'check_out'             => 'required|date|after:check_in',
            'adults'                => 'nullable|integer|min:1|max:10',
            'children'              => 'nullable|integer|min:0|max:10',
            'addon_airport_shuttle' => 'nullable|boolean',
            'addon_breakfast'       => 'nullable|boolean',
        ]);

        $room = Room::where('id', $validated['room_id'])
            ->where('property_id', $tenantId)
            ->firstOrFail();

        $checkIn = Carbon::parse($validated['check_in']);
        $checkOut = Carbon::parse($validated['check_out']);
        $nights = max(1, $checkIn->diffInDays($checkOut));

        $totalAmount = $room->price_per_night * $nights;
        if (!empty($validated['addon_airport_shuttle'])) {
            $totalAmount += 600; // Airport Transit Flat Rate
        }
        if (!empty($validated['addon_breakfast'])) {
            $adultCount = (int) ($validated['adults'] ?? 1);
            $totalAmount += 350 * $nights * $adultCount; // ₹350/person/day
        }

        $referenceCode = 'MM-RES-' . random_int(10000, 99999);

        $booking = Booking::create([
            'id'                     => 'bkg-' . Str::ulid(),
            'property_id'            => $tenantId,
            'room_id'                => $room->id,
            'room_name'              => $room->name,
            'guest_name'             => $validated['guest_name'],
            'guest_email'            => $validated['guest_email'],
            'guest_phone'            => $validated['guest_phone'],
            'check_in'               => $validated['check_in'],
            'check_out'              => $validated['check_out'],
            'nights'                 => $nights,
            'adults'                 => $validated['adults'] ?? 2,
            'children'               => $validated['children'] ?? 0,
            'room_rate'              => $room->price_per_night,
            'addon_airport_shuttle'  => (bool) ($validated['addon_airport_shuttle'] ?? false),
            'addon_breakfast'        => (bool) ($validated['addon_breakfast'] ?? false),
            'total_amount'           => $totalAmount,
            'status'                 => 'confirmed',
            'reference_code'         => $referenceCode,
        ]);

        return response()->json([
            'success' => true,
            'status'  => 201,
            'message' => 'Reservation confirmed. Confirmation voucher generated.',
            'data'    => $booking,
        ], 201);
    }
}
