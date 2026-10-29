<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use App\Models\Property;

class PropertyController extends Controller
{
    /**
     * Display a listing of hospitality tenants.
     * GET /api/v1/properties
     */
    public function index(Request $request): JsonResponse
    {
        $properties = Property::withCount(['rooms', 'bookings'])
            ->when($request->city, fn($q, $city) => $q->where('city', $city))
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'status'  => 200,
            'data'    => $properties,
            'meta'    => [
                'total'     => $properties->count(),
                'timestamp' => now()->toIso8601String(),
                'version'   => '1.0.0',
            ]
        ]);
    }

    /**
     * Display the specified hotel property tenant.
     * GET /api/v1/properties/{id}
     */
    public function show(string $id): JsonResponse
    {
        $property = Property::where('id', $id)
            ->orWhere('slug', $id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'status'  => 200,
            'data'    => $property,
        ]);
    }

    /**
     * Onboard a new hotel tenant in the SaaS ecosystem.
     * POST /api/v1/properties
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'tagline'    => 'nullable|string|max:255',
            'city'       => 'required|string|max:100',
            'state'      => 'nullable|string|max:100',
            'country'    => 'nullable|string|max:100',
            'email'      => 'required|email|max:255',
            'phone'      => 'required|string|max:50',
            'address'    => 'nullable|string',
            'currency'   => 'nullable|string|size:3',
        ]);

        $slug = Str::slug($validated['name']);

        $property = Property::create([
            'id'             => 'prop-' . Str::ulid(),
            'name'           => $validated['name'],
            'tagline'        => $validated['tagline'] ?? 'Premium Hospitality Partner',
            'slug'           => $slug,
            'city'           => $validated['city'],
            'state'          => $validated['state'] ?? 'Tamil Nadu',
            'country'        => $validated['country'] ?? 'India',
            'postal_code'    => '600001',
            'email'          => $validated['email'],
            'phone'          => $validated['phone'],
            'address'        => $validated['address'] ?? 'Main Boulevard',
            'currency'       => $validated['currency'] ?? 'INR',
            'currency_symbol'=> '₹',
            'rating'         => 4.5,
            'review_count'   => 0,
            'check_in_time'  => '12:00 PM',
            'check_out_time' => '11:00 AM',
            'features'       => [
                'hasRestaurant' => true,
                'hasBanquet'    => true,
                'hasShuttle'    => true,
            ]
        ]);

        return response()->json([
            'success' => true,
            'status'  => 201,
            'message' => 'New SaaS hotel property onboarded successfully.',
            'data'    => $property,
        ], 201);
    }
}
