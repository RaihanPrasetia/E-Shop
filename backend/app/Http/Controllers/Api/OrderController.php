<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
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
        $user = Auth::user();

        if ($request->has('items') && is_string($request->items)) {
            $request->merge([
                'items' => json_decode($request->items, true),
            ]);
        }

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|string|exists:products,id',
            'items.*.product_name' => 'required|string',
            'items.*.variant_name' => 'nullable|string',
            'items.*.variant_option' => 'nullable|string',
            'items.*.price' => 'required|integer',
            'items.*.qty' => 'required|integer|min:1',

            'total_qty' => 'required|integer|min:1',
            'total_price' => 'required|integer|min:1',

            'bank_id' => 'required|string|exists:banks,id',
            'payment_date' => 'required|date',
            'proof' => 'nullable|mimes:pdf|mimetypes:application/pdf|min:100|max:500',
            'cart_id' => 'string|exists:carts,id',
        ]);

        DB::beginTransaction();

        try {
            // Simpan Order
            $order = Order::create([
                'user_id' => $user->id,
                'total_price' => $validated['total_price'],
                'total_qty' => $validated['total_qty'],
                'status' => 'paid',
            ]);

            // Simpan OrderItems
            foreach ($validated['items'] as $item) {
                $order->orderItems()->create([
                    'product_id' => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'variant_name' => $item['variant_name'] ?? null,
                    'variant_option' => $item['variant_option'] ?? null,
                    'price' => $item['price'],
                    'qty' => $item['qty'],
                ]);
            }

            // Upload bukti pembayaran jika ada
            $proofPath = null;
            if ($request->hasFile('proof')) {
                $proofPath = $request->file('proof')->store('proofs', 'public');
            }

            // Ambil data bank untuk disalin ke Payment
            $bank = \App\Models\Bank::findOrFail($validated['bank_id']);

            // Simpan Payment
            $order->payment()->create([
                'bank_id' => $bank->id,
                'bank_name' => $bank->name,
                'bank_no_rek' => $bank->no_rek,
                'bank_an' => $bank->an,
                'amount' => $validated['total_price'],
                'status' => 'pending',
                'payment_date' => $validated['payment_date'],
                'proof' => $proofPath,
            ]);

            if (!empty($validated['cart_id'])) {
                \App\Models\Cart::where('id', $validated['cart_id'])->delete();
            }

            DB::commit();

            return response()->json([
                'message' => 'Order berhasil dibuat',
                'order_id' => $order->id,
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Terjadi kesalahan saat menyimpan data',
                'error' => $e->getMessage(),
            ], 500);
        }
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
