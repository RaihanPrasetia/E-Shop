<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function dashboardUser()
    {
        try {
            $user = Auth::user();

            $carts = $this->cartItemCount($user->id);
            $orders = $this->orderUser($user->id);
            $orderedProductNames = $this->orderedProducts($user->id);

            return response()->json([
                'cartCount' => $carts,
                'orderCount' => $orders,
                'orderedProducts' => $orderedProductNames,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Terjadi kesalahan data dashboard: ' . $e->getMessage());

            return response()->json([
                'message' => 'Terjadi kesalahan pada server',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    static function cartItemCount($userId)
    {
        try {
            $cart = Cart::withCount('cartItems')->where('user_id', $userId)->first();

            return $cart ? $cart->cart_items_count : 0;
        } catch (\Exception $e) {
            Log::error('Gagal mengambil jumlah cart item: ' . $e->getMessage());

            return 0;
        }
    }

    static function orderUser($userId)
    {
        try {
            return Order::where('user_id', $userId)->count();
        } catch (\Exception $e) {
            Log::error('Gagal mengambil jumlah order: ' . $e->getMessage());

            return 0;
        }
    }

    static function orderedProducts($userId)
    {
        try {
            $orders = Order::with(['orderItems'])
                ->where('user_id', $userId)
                ->get();


            return $orders;
        } catch (\Exception $e) {
            Log::error('Gagal mengambil produk dari order: ' . $e->getMessage());
            return [];
        }
    }
}
