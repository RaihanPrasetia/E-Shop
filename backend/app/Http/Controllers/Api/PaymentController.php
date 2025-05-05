<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\PaymentsExport;
use App\Models\Payment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('per_page', 5);

        try {
            $isAdmin = Auth::user();

            if ($isAdmin->role !== 'admin') {
                return response()->json([
                    'message' => 'Unauthorized'
                ], 401);
            }

            $payments = Payment::with(['order.orderItems.product:id,name', 'bank'])
                ->when($search, function ($query, $search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('bank_name', 'like', '%' . $search . '%')
                            ->orWhere('bank_no_rek', 'like', '%' . $search . '%')
                            ->orWhere('bank_an', 'like', '%' . $search . '%')
                            ->orWhereHas('bank', function ($bankQuery) use ($search) {
                                $bankQuery->where('name', 'like', '%' . $search . '%')
                                    ->orWhere('no_rek', 'like', '%' . $search . '%')
                                    ->orWhere('an', 'like', '%' . $search . '%');
                            });
                    });
                })
                ->paginate($perPage);

            return response()->json([
                'payments' => $payments,
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'admin') {
                return response()->json([
                    'message' => 'Unauthorized'
                ], 401);
            }

            $payment = Payment::with([
                'order.orderItems.product:id,name',
                'bank'
            ])->find($id);

            if (!$payment) {
                return response()->json([
                    'message' => 'Payment not found'
                ], 404);
            }

            return response()->json([
                'payment' => $payment
            ], 200);
        } catch (\Exception $e) {
            Log::error('Payment detail error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Terjadi kesalahan pada server',
                'error' => $e->getMessage()
            ], 500);
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
