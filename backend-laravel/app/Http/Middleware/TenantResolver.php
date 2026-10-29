<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Property;

class TenantResolver
{
    /**
     * Handle an incoming request and isolate tenant scope.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Check X-Tenant-ID header
        $tenantId = $request->header('X-Tenant-ID');

        // 2. Check query parameter fallback
        if (!$tenantId) {
            $tenantId = $request->query('tenantId') ?? $request->query('propertyId');
        }

        // 3. Default to Mount Manor flagship property
        if (!$tenantId) {
            $tenantId = 'mount-manor';
        }

        // 4. Bind tenant to service container and request attributes
        $request->attributes->set('tenant_id', $tenantId);

        // Share globally across views and controllers
        app()->instance('current_tenant_id', $tenantId);

        return $next($request);
    }
}
