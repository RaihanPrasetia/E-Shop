<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ProductUserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $search = $request->input('search');
            $categoryId = $request->input('categoryId');
            $perPage = $request->input('per_page', 5); // default 9 item per halaman

            $products = Product::with([
                'category' => function ($query) {
                    $query->select('id', 'name')->withTrashed();
                },
                'variants',
                'images' => function ($query) {
                    $query->select('product_id', 'file_path', 'is_primary')
                        ->where('is_primary', true)
                        ->withTrashed();
                }
            ])
                ->when($search, function ($query, $search) {
                    $query->where('name', 'like', '%' . $search . '%');
                })
                ->when($categoryId, function ($query, $categoryId) {
                    $query->where('category_id', $categoryId);
                })
                ->paginate($perPage);

            return response()->json([
                'products' => $products,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Terjadi kesalahan saat mengambil produk: ' . $e->getMessage());

            return response()->json([
                'message' => 'Terjadi kesalahan pada server',
                'error' => $e->getMessage(),
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
