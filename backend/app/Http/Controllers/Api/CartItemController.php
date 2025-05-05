<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use Illuminate\Http\Request;

class CartItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cart_id' => 'required|exists:carts,id',
            'product_id' => 'required|exists:products,id',
            'qty' => 'nullable|integer|min:1', // Tambahkan validasi qty
        ]);

        $qty = $validated['qty'] ?? 1; // Default qty = 1 jika tidak dikirim

        // Cek apakah produk sudah ada dalam cart
        $existingItem = CartItem::where('cart_id', $validated['cart_id'])
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($existingItem) {
            $existingItem->qty += $qty;
            $existingItem->save();

            return response()->json([
                'message' => 'Jumlah produk dalam keranjang ditambah.',
                'data' => $existingItem,
            ], 201);
        }

        $cartItem = CartItem::create([
            'cart_id' => $validated['cart_id'],
            'product_id' => $validated['product_id'],
            'qty' => $qty,
        ]);

        return response()->json([
            'message' => 'Produk berhasil ditambahkan ke keranjang.',
            'data' => $cartItem,
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'cart_id' => 'sometimes|exists:carts,id',
            'product_id' => 'sometimes|exists:products,id',
            'qty' => 'sometimes|integer|min:1',
        ]);

        $cartItem = CartItem::find($id);

        if (!$cartItem) {
            return response()->json([
                'message' => 'Item tidak ditemukan.',
            ], 404);
        }

        $cartItem->update($validated);

        return response()->json([
            'message' => 'Item berhasil diperbarui.',
            'data' => $cartItem,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $cartItem = CartItem::find($id);

        if (!$cartItem) {
            return response()->json([
                'message' => 'Item tidak ditemukan.',
            ], 404);
        }

        $cartItem->delete();

        return response()->json([
            'message' => 'Item berhasil dihapus dari keranjang.',
        ], 200);
    }
}
