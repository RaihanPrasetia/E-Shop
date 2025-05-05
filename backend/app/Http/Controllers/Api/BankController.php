<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class BankController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $isAdmin = Auth::user();
            $banks = Bank::with(['paymentMethod', 'user'])->get();

            if ($isAdmin->role !== 'admin') {
                return response()->json([
                    'message' => 'Unauthorized'
                ], 401);
            }

            return response()->json([
                'banks' => $banks,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Bank error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Terjadi kesalahan pada server',
                'error' => $e->getMessage()
            ], 500);
        }
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
        try {
            $user = Auth::user();
            if ($user->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'payment_method_id' => 'required|exists:payment_methods,id',
                'no_rek' => 'required|string|max:255',
                'isActive' => 'required|boolean',
                'an' => 'required|string|max:255',
            ]);

            $bank = Bank::create([
                'name' => $validated['name'],
                'no_rek' => $validated['no_rek'],
                'isActive' => $validated['isActive'] ?? true,
                'user_id' => Auth::id(),
                'an' => $validated['an'],
                'payment_method_id' => $validated['payment_method_id'] ?? null,
            ]);

            return response()->json([
                'message' => 'Bank created successfully',
                'bank' => $bank
            ], 201);
        } catch (\Exception $e) {
            Log::error('Bank Store error: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan pada server'], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $user = Auth::user();
            if ($user->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $bank = Bank::with(['paymentMethod', 'user'])->findOrFail($id);

            return response()->json(['bank' => $bank], 200);
        } catch (\Exception $e) {
            Log::error('Bank Show error: ' . $e->getMessage());
            return response()->json(['message' => 'Bank not found'], 404);
        }
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
        try {
            $user = Auth::user();
            if ($user->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'payment_method_id' => 'sometimes|required|exists:payment_methods,id',
                'no_rek' => 'sometimes|required|string|max:255',
                'an' => 'sometimes|required|string|max:255',
                'isActive' => 'sometimes|required|boolean',
            ]);

            $bank = Bank::findOrFail($id);
            $bank->update($validated);

            return response()->json(['message' => 'Bank updated successfully', 'bank' => $bank], 200);
        } catch (\Exception $e) {
            Log::error('Bank Update error: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan saat memperbarui bank'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $user = Auth::user();
            if ($user->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $bank = Bank::findOrFail($id);
            $bank->delete();

            return response()->json(['message' => 'Bank deleted successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Bank Destroy error: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan saat menghapus bank'], 500);
        }
    }
}
