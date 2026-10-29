<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use App\Models\Booking;

class LoyaltyController extends Controller
{
    /**
     * Retrieve guest loyalty points and tier status based on stay duration.
     * GET /api/v1/loyalty
     */
    public function show(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID', 'mount-manor');
        $email = strtolower(trim($request->query('email', 'karthik.r@techcorp.in')));

        $bookings = Booking::where('property_id', $tenantId)
            ->whereRaw('LOWER(guest_email) = ?', [$email])
            ->where('status', '!=', 'cancelled')
            ->orderBy('created_at', 'desc')
            ->get();

        $guestName = $bookings->first()?->guest_name ?? explode('@', $email)[0];
        $totalNights = $bookings->sum('nights');
        $totalSpend = $bookings->sum('total_amount');
        $totalBookings = $bookings->count();

        // 100 points per night stayed + 1 bonus point per ₹100 spent
        $pointsEarned = ($totalNights * 100) + (int) floor($totalSpend / 100);

        // Tier status based on stay duration (nights)
        $tier = 'Silver';
        $nextTier = 'Gold';
        $nightsToNextTier = max(0, 5 - $totalNights);
        $progressPercent = min(100, (int) round(($totalNights / 5) * 100));
        $perks = [
            '5% dining discount at Delicia Restaurant',
            'High-speed premium Wi-Fi upgrade',
            'Complimentary luggage storage & transit assistance'
        ];

        if ($totalNights >= 15) {
            $tier = 'Platinum';
            $nextTier = null;
            $nightsToNextTier = 0;
            $progressPercent = 100;
            $perks = [
                '15% dining discount at Delicia Restaurant',
                'Guaranteed room category upgrade upon arrival',
                'Daily complimentary Delicia executive breakfast buffet',
                'Zero cancellation or date modification charges',
                'Dedicated 24/7 Mount Manor concierge direct line'
            ];
        } elseif ($totalNights >= 5) {
            $tier = 'Gold';
            $nextTier = 'Platinum';
            $nightsToNextTier = max(0, 15 - $totalNights);
            $progressPercent = min(100, (int) round((($totalNights - 5) / 10) * 100));
            $perks = [
                '10% dining discount at Delicia Restaurant',
                'Complimentary one-way airport transfer shuttle',
                'Late 2:00 PM check-out privilege',
                'Priority room selection & early check-in'
            ];
        }

        $history = $bookings->map(fn($b) => [
            'bookingId'     => $b->id,
            'referenceCode' => $b->reference_code,
            'roomName'      => $b->room_name,
            'checkIn'       => $b->check_in,
            'checkOut'      => $b->check_out,
            'nights'        => $b->nights,
            'pointsEarned'  => ($b->nights * 100) + (int) floor($b->total_amount / 100),
        ]);

        return response()->json([
            'success' => true,
            'status'  => 200,
            'message' => 'Loyalty profile retrieved successfully',
            'data'    => [
                'guestEmail'       => $email,
                'guestName'        => $guestName,
                'totalNights'      => $totalNights,
                'totalBookings'    => $totalBookings,
                'totalSpend'       => $totalSpend,
                'pointsBalance'    => $pointsEarned,
                'tier'             => $tier,
                'nightsToNextTier' => $nightsToNextTier,
                'nextTier'         => $nextTier,
                'progressPercent'  => $progressPercent,
                'perks'            => $perks,
                'history'          => $history,
            ]
        ]);
    }

    /**
     * Redeem points for stay credits or dining vouchers.
     * POST /api/v1/loyalty/redeem
     */
    public function redeem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'points'   => 'required|integer|min:100',
            'perkType' => 'nullable|string',
        ]);

        $voucherCode = 'MANOR-REWARD-' . random_int(1000, 9999);
        $description = ($validated['perkType'] ?? '') === 'dining'
            ? 'Delicia Complimentary Chef Dinner Pass'
            : '₹' . $validated['points'] . ' Direct Booking Credit Discount';

        return response()->json([
            'success' => true,
            'status'  => 201,
            'message' => 'Loyalty reward voucher generated',
            'data'    => [
                'redeemedPoints' => $validated['points'],
                'voucherCode'    => $voucherCode,
                'description'    => $description,
                'validUntil'     => '2027-04-30',
                'status'         => 'active',
            ]
        ], 201);
    }
}
