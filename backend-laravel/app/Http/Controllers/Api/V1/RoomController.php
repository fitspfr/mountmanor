<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use App\Models\Room;

class RoomController extends Controller
{
    /**
     * List rooms and suites for the active hotel tenant.
     * GET /api/v1/rooms
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID', $request->query('tenantId', 'mount-manor'));

        $query = Room::where('property_id', $tenantId);

        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->has('adults')) {
            $query->where('capacity_adults', '>=', (int) $request->adults);
        }

        $rooms = $query->orderBy('price_per_night', 'asc')->get();

        return response()->json([
            'success' => true,
            'status'  => 200,
            'message' => 'Rooms retrieved successfully',
            'data'    => $rooms,
            'meta'    => [
                'property_id' => $tenantId,
                'total'       => $rooms->count(),
                'timestamp'   => now()->toIso8601String(),
            ]
        ]);
    }

    /**
     * Show a specific room category.
     * GET /api/v1/rooms/{id}
     */
    public function show(string $id): JsonResponse
    {
        $room = Room::findOrFail($id);

        return response()->json([
            'success' => true,
            'status'  => 200,
            'data'    => $room,
        ]);
    }

    /**
     * Add a room category to the tenant's inventory.
     * POST /api/v1/rooms
     */
    public function store(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID', $request->query('tenantId', 'mount-manor'));

        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'category'        => 'required|in:standard,deluxe,suite,executive',
            'price_per_night' => 'required|numeric|min:500',
            'capacity_adults' => 'nullable|integer|min:1|max:10',
            'bed_type'        => 'nullable|string|max:100',
            'size_sqft'       => 'nullable|integer',
            'description'     => 'nullable|string',
            'amenities'       => 'nullable|array',
            'available_units' => 'nullable|integer|min:1',
        ]);

        $room = Room::create([
            'id'              => 'rm-' . Str::ulid(),
            'property_id'     => $tenantId,
            'name'            => $validated['name'],
            'category'        => $validated['category'],
            'tagline'         => $request->input('tagline', 'Modern comfortable guest room'),
            'price_per_night' => $validated['price_per_night'],
            'original_price'  => round($validated['price_per_night'] * 1.2),
            'capacity_adults' => $validated['capacity_adults'] ?? 2,
            'capacity_children'=> 1,
            'bed_type'        => $validated['bed_type'] ?? 'King Bed',
            'size_sqft'       => $validated['size_sqft'] ?? 280,
            'description'     => $validated['description'] ?? 'Luxurious soundproofed room with climate control and high-speed Wi-Fi.',
            'amenities'       => $validated['amenities'] ?? ['High-Speed Wi-Fi', 'Air Conditioning', 'LED TV'],
            'available_units' => $validated['available_units'] ?? 5,
        ]);

        return response()->json([
            'success' => true,
            'status'  => 201,
            'message' => 'Room inventory added successfully',
            'data'    => $room,
        ], 201);
    }
}
