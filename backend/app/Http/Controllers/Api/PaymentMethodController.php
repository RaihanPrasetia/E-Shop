<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PaymentMethodController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $user = Auth::user(); // Ambil user yang sedang login

            $query = PaymentMethod::query();

            if ($user && $user->role === 'admin') {
                // Admin: ambil semua bank
                $query->with(['banks.user']);
            } else {
                // Selain admin: hanya ambil bank yang aktif
                $query->with(['banks' => function ($q) {
                    $q->where('isActive', true)->with('user');
                }]);
            }

            $paymentMethods = $query->get();

            return response()->json([
                'payment_methods' => $paymentMethods,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Payment Method error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Terjadi kesalahan pada server',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $paymentMethod = PaymentMethod::create($validator->validated());

            return response()->json([
                'message' => 'Payment method created successfully.',
                'payment_method' => $paymentMethod
            ], 201);
        } catch (\Exception $e) {
            Log::error('Store Payment Method error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create payment method.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $paymentMethod = PaymentMethod::find($id);

        if (!$paymentMethod) {
            return response()->json(['message' => 'Payment method not found'], 404);
        }

        return response()->json(['payment_method' => $paymentMethod], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $paymentMethod = PaymentMethod::find($id);

        if (!$paymentMethod) {
            return response()->json(['message' => 'Payment method not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $paymentMethod->update($validator->validated());
            return response()->json([
                'message' => 'Payment method updated successfully.',
                'payment_method' => $paymentMethod
            ], 200);
        } catch (\Exception $e) {
            Log::error('Update Payment Method error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update payment method.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $paymentMethod = PaymentMethod::find($id);

        if (!$paymentMethod) {
            return response()->json(['message' => 'Payment method not found'], 404);
        }

        try {
            $paymentMethod->delete();
            return response()->json(['message' => 'Payment method deleted successfully.'], 200);
        } catch (\Exception $e) {
            Log::error('Delete Payment Method error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete payment method.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
