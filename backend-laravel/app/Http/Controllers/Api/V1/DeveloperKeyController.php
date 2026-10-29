<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use App\Models\ApiKey;

class DeveloperKeyController extends Controller
{
    /**
     * List issued API tokens for the active tenant.
     * GET /api/v1/developer/keys
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID', 'mount-manor');
        $keys = ApiKey::where('property_id', $tenantId)->get();

        return response()->json([
            'success' => true,
            'status'  => 200,
            'data'    => $keys,
        ]);
    }

    /**
     * Generate a new 3rd party API token with granular scopes.
     * POST /api/v1/developer/keys
     */
    public function store(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID', 'mount-manor');

        $validated = $request->validate([
            'name'   => 'required|string|max:255',
            'scopes' => 'nullable|array',
        ]);

        $rawToken = 'sk_live_mm_' . Str::random(24);
        $maskedToken = 'sk_live_mm_••••••••' . substr($rawToken, -6);

        $apiKey = ApiKey::create([
            'id'             => 'key-' . Str::ulid(),
            'property_id'    => $tenantId,
            'name'           => $validated['name'],
            'token'          => hash('sha256', $rawToken), // Encrypted hash in DB
            'masked_token'   => $maskedToken,
            'scopes'         => $validated['scopes'] ?? ['read:rooms', 'write:bookings'],
            'requests_count' => 0,
            'status'         => 'active',
        ]);

        // Return plain rawToken ONLY on creation
        $responsePayload = $apiKey->toArray();
        $responsePayload['key'] = $rawToken;

        return response()->json([
            'success' => true,
            'status'  => 201,
            'message' => 'API Key generated. Copy this secret key now; it will not be displayed again.',
            'data'    => $responsePayload,
        ], 201);
    }

    /**
     * Revoke an API token.
     * DELETE /api/v1/developer/keys/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $key = ApiKey::findOrFail($id);
        $key->delete();

        return response()->json([
            'success' => true,
            'status'  => 200,
            'message' => 'API Key revoked successfully',
            'data'    => ['id' => $id]
        ]);
    }
}
