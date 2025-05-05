<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index()
    {
        try {
            $user = Auth::user();
            return $user->role === 'admin'
                ? $this->getAdminCarts()
                : $this->getUserCart($user->id);
        } catch (\Exception $e) {
            Log::error('Cart error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Terjadi kesalahan pada server',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all carts with their products for admin users
     *
     * @return \Illuminate\Http\JsonResponse
     */
    private function getAdminCarts()
    {
        $carts = Cart::all();
        $result = [];

        foreach ($carts as $cart) {
            $products = $this->getCartProducts($cart->id);
            $result[] = [
                'id' => $cart->id,
                'user_id' => $cart->user_id,
                'created_at' => $cart->created_at,
                'updated_at' => $cart->updated_at,
                'deleted_at' => $cart->deleted_at,
                'products' => $products
            ];
        }

        return response()->json([
            'carts' => $result
        ], 200);
    }

    /**
     * Get cart with products for a specific user
     *
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    private function getUserCart($userId)
    {
        $carts = Cart::with('cartItems')->where('user_id', $userId)->get();

        if ($carts->isEmpty()) {
            return response()->json([
                'message' => 'Cart anda masih kosong'
            ], 200);
        }

        $formattedCarts = $carts->map(function ($cart) {
            return [
                'id' => $cart->id,
                'user_id' => $cart->user_id,
                'cart_name' => $cart->cart_name,
                'schedule' => $cart->schedule,
                'created_at' => $cart->created_at,
                'updated_at' => $cart->updated_at,
                'deleted_at' => $cart->deleted_at,
                'products' => $this->getCartProducts($cart->id)
            ];
        });

        return response()->json([
            'carts' => $formattedCarts
        ], 200);
    }


    /**
     * Get products from a specific cart
     *
     * @param int $cartId
     * @return \Illuminate\Support\Collection
     */
    private function getCartProducts($cartId)
    {
        return DB::table('cart_items')
            ->leftJoin('products', 'cart_items.product_id', '=', 'products.id')
            ->leftJoin(DB::raw('(
    SELECT pi1.product_id, pi1.file_path
    FROM product_images pi1
    INNER JOIN (
        SELECT product_id, MIN(id) as min_id
        FROM product_images
        WHERE is_primary = 1 AND deleted_at IS NULL
        GROUP BY product_id
    ) pi2 ON pi1.id = pi2.min_id
) as product_images'), 'products.id', '=', 'product_images.product_id')
            ->where('cart_items.cart_id', $cartId)
            ->whereNull('cart_items.deleted_at')
            ->whereNull('products.deleted_at')
            ->groupBy(
                'cart_items.product_id',
                'products.id',
                'products.name',
                'products.description',
                'products.price',
                'products.stock',
                'products.category_id',
                'products.is_featured',
                'products.is_published',
                'products.specifications',
                'products.created_at',
                'products.updated_at',
                'product_images.file_path'
            )
            ->select(
                DB::raw('MIN(cart_items.id) as cart_item_id'),
                'cart_items.product_id',
                DB::raw('SUM(cart_items.qty) as qty'),
                'products.id as product_id',
                'products.name',
                'products.description',
                'products.price',
                'products.stock',
                'products.category_id',
                'products.is_featured',
                'products.is_published',
                'products.specifications',
                'products.created_at',
                'products.updated_at',
                'product_images.file_path as image_path'
            )
            ->get();
    }




    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Validasi input
        $validator = Validator::make($request->all(), [
            'cart_name' => 'required|string|max:30',
            'schedule' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Buat cart baru
        $cart = Cart::create([
            'user_id'   => $user->id,
            'cart_name' => $request->cart_name,
            'schedule'  => $request->schedule,
        ]);

        return response()->json([
            'message' => 'Keranjang berhasil dibuat',
            'cart' => $cart
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $user = Auth::user();
            $cart = Cart::with(['cartItems.product'])->find($id);

            if (!$cart) {
                return response()->json([
                    'message' => 'Cart tidak ditemukan'
                ], 404);
            }

            // Kalau user bukan admin, pastikan cart milik dia
            if ($user->role !== 'admin' && $cart->user_id != $user->id) {
                return response()->json([
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Ambil semua products dari cart_items
            $products = $cart->cartItems->map(function ($item) {
                return $item->product;
            });

            return response()->json([
                'cart' => [
                    'id' => $cart->id,
                    'user_id' => $cart->user_id,
                    'created_at' => $cart->created_at,
                    'updated_at' => $cart->updated_at,
                    'deleted_at' => $cart->deleted_at,
                    'products' => $products
                ]
            ], 200);
        } catch (\Exception $e) {
            Log::error('Cart show error: ' . $e->getMessage());

            return response()->json([
                'message' => 'Terjadi kesalahan pada server',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = Auth::user();
        $cart = Cart::find($id);

        if (!$cart) {
            return response()->json([
                'message' => 'Cart tidak ditemukan'
            ], 404);
        }

        // Pastikan cart milik user yang sedang login
        if ($cart->user_id != $user->id) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        // Validasi input
        $validated = $request->validate([
            'cart_name' => 'sometimes|required|string|max:255',
            'schedule' => 'sometimes|date'
        ]);

        // Update data cart
        $cart->cart_name = $validated['cart_name'];
        $cart->schedule = $validated['schedule'] ?? null;
        $cart->save();

        return response()->json([
            'message' => 'Cart berhasil diupdate',
            'cart' => $cart
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = Auth::user();
        $cart = Cart::find($id);

        if (!$cart) {
            return response()->json([
                'message' => 'Cart tidak ditemukan'
            ], 404);
        }

        // Pastikan cart milik user yang sedang login
        if ($cart->user_id != $user->id) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        // Hapus cart
        $cart->delete();

        return response()->json([
            'message' => 'Cart berhasil dihapus'
        ], 200);
    }
}
