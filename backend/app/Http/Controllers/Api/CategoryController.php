<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use OwenIt\Auditing\Models\Audit;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $withDeleted = $request->query('with_deleted');
            $onlyDeleted = $request->query('only_deleted');
            $isActive = $request->query('is_active'); // ambil nilai is_active dari query string

            $query = Category::with(['user:id,name']);

            // Handle soft delete options
            if ($onlyDeleted === 'true') {
                $query->onlyTrashed();
            } elseif ($withDeleted === 'true') {
                $query->withTrashed();
            }

            // Tambahkan filter is_active jika disediakan
            if (!is_null($isActive)) {
                $query->where('isActive', filter_var($isActive, FILTER_VALIDATE_BOOLEAN));
            }

            $categories = $query->get();

            return response()->json([
                'categories' => $categories,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Category fetch error: ' . $e->getMessage());

            return response()->json([
                'message' => 'Terjadi kesalahan pada server',
                'error' => $e->getMessage()
            ], 500);
        }
    }



    public function getCategoryAudit($categoryId)
    {
        $category = Category::findOrFail($categoryId);
        $audits = $category->audits; // Mengambil semua audit terkait Order

        return response()->json([
            'message' => 'Audits history',
            'audits' => $audits
        ], 200);
    }


    public function getCategoryAuditAll()
    {
        $audits = Audit::where('auditable_type', Category::class)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($audit) {
                // Coba ambil user berdasarkan user_id
                $user = null;
                if ($audit->user_id) {
                    $user = User::find($audit->user_id);
                }

                return [
                    'id' => $audit->id,
                    'user_id' => $audit->user_id,
                    'event' => $audit->event,
                    'auditable_id' => $audit->auditable_id,
                    'auditable_type' => $audit->auditable_type,
                    'old_values' => $audit->old_values,
                    'new_values' => $audit->new_values,
                    'url' => $audit->url,
                    'ip_address' => $audit->ip_address,
                    'user_agent' => $audit->user_agent,
                    'tags' => $audit->tags,
                    'created_at' => $audit->created_at,
                    'updated_at' => $audit->updated_at,
                    'user' => $user ? [
                        'name' => $user->name,
                        'role' => $user->role, // pastikan field "role" ada di table users
                    ] : null
                ];
            });

        return response()->json([
            'message' => 'Audits history',
            'audits' => $audits
        ], 200);
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
            // Validasi input
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'isActive' => 'nullable|boolean',
                'metadata' => 'nullable|string', // FormData akan kirim ini sebagai string biasa
            ]);


            // Cek apakah nama kategori sudah ada
            $existingCategory = Category::where('name', $validated['name'])->first();
            if ($existingCategory) {
                return response()->json([
                    'message' => 'Kategori dengan nama ini sudah ada.',
                ], 409); // Conflict
            }

            $category = Category::create([
                'name' => $validated['name'],
                'isActive' => $validated['isActive'] ?? true,
                'created_by' => Auth::id(),
                'metadata' => $validated['metadata'] ?? null,
            ]);

            $category = Category::with(['user:id,name'])->find($category->id);

            return response()->json([
                'message' => 'Kategori berhasil dibuat.',
                'categories' => [$category],
            ], 201);
        } catch (\Exception $e) {
            Log::error('Terjadi kesalahan saat membuat kategori: ' . $e->getMessage());

            return response()->json([
                'message' => 'Terjadi kesalahan saat membuat kategori.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }



    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $category = Category::findOrFail($id);

            return response()->json([
                'category' => $category,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Kategori tidak ditemukan',
            ], 404);
        } catch (\Exception $e) {
            // Log error
            Log::error('Show category error: ' . $e->getMessage());

            return response()->json([
                'message' => 'Terjadi kesalahan saat menampilkan kategori',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        // Not needed for API
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            // Find the category first
            $category = Category::findOrFail($id);

            // Validate with proper unique rule
            $validated = $request->validate([
                'name' => [
                    'sometimes',
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('categories')->ignore($id)
                ],
                'isActive' => 'sometimes|boolean',
                'metadata' => 'nullable|json',
            ]);

            // Check for duplicate name
            if (isset($validated['name']) && $validated['name'] !== $category->name) {
                $existingCategory = Category::where('name', $validated['name'])->first();
                if ($existingCategory) {
                    return response()->json([
                        'message' => 'Kategori dengan nama ini sudah ada.',
                    ], 409); // Conflict
                }
            }

            // Update only the fields that were provided
            $category->fill($validated);
            $category->save();

            // Refresh the model to get updated data
            $category->refresh();

            return response()->json([
                'message' => 'Kategori berhasil diperbarui.',
                'category' => $category,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Kategori tidak ditemukan',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Update category error: ' . $e->getMessage());

            return response()->json([
                'message' => 'Terjadi kesalahan saat memperbarui kategori',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $categoryid)
    {
        try {
            $category = Category::findOrFail($categoryid);

            $category->delete();

            return response()->json([
                'message' => 'Kategori berhasil dihapus.',
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Kategori tidak ditemukan',
            ], 404);
        } catch (\Exception $e) {
            // Log error
            Log::error('Delete category error: ' . $e->getMessage());

            return response()->json([
                'message' => 'Terjadi kesalahan saat menghapus kategori',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function restore(string $categoryid)
    {
        try {
            // Mencari kategori yang telah di-soft delete
            $category = Category::withTrashed()->findOrFail($categoryid);

            // Mengembalikan kategori (restore)
            if ($category->trashed()) {
                $category->restore();
                return response()->json([
                    'message' => 'Kategori berhasil dipulihkan.',
                ], 200);
            } else {
                return response()->json([
                    'message' => 'Kategori tidak dalam status dihapus.',
                ], 400);
            }
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Kategori tidak ditemukan.',
            ], 404);
        } catch (\Exception $e) {
            // Log error untuk debugging
            Log::error('Restore category error: ' . $e->getMessage());

            return response()->json([
                'message' => 'Terjadi kesalahan saat memulihkan kategori.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
