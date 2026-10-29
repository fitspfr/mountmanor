<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'application' => 'Mount Manor Hotel Hospitality Core API',
        'framework'   => 'Laravel 11.x',
        'status'      => 'operational',
        'endpoints'   => [
            'api_v1'       => '/api/v1',
            'health_check' => '/api/v1/health',
            'openapi_spec' => '/api/v1/docs/openapi.json',
            'routes_list'  => '/api/v1/laravel/routes',
        ],
        'documentation' => 'https://github.com/fitspfr/mountmanor',
    ]);
});
