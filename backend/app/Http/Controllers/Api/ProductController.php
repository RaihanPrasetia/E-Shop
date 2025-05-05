<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            // Ambil nilai filter dari query string
            $isFeatured = $request->query('is_featured');

            // Query produk dengan relasi
            $query = Product::with([
                'category' => function ($query) {
                    $query->select('id', 'name')->withTrashed();
                },
                'variants',
                'images'
            ])->orderBy('created_at', 'desc');

            // Filter is_featured jika disediakan
            if (!is_null($isFeatured)) {
                $query->where('is_featured', filter_var($isFeatured, FILTER_VALIDATE_BOOLEAN));
            }

            $products = $query->get();

            if ($products->isEmpty()) {
                return response()->json([
                    'message' => 'Produk anda masih kosong',
                    'products' => [],
                ], 200);
            }

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
        try {
            DB::beginTransaction();

            $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric',
                'stock' => 'required|integer',
                'category_id' => 'required|uuid|exists:categories,id',
                'is_featured' => 'required|boolean',
                'is_published' => 'required|boolean',
                'specifications' => 'nullable|json',
                'variants' => 'nullable|array',
                'variants.*.name' => 'required_with:variants|string|max:255',
                'variants.*.options' => 'required_with:variants|json',
                'images' => 'nullable|array',
                'images.*.file' => 'required_with:images|file|mimes:jpeg,png,jpg,gif|max:2048',
                'images.*.is_primary' => 'nullable|boolean',
            ]);

            $productData = $request->only([
                'name',
                'description',
                'price',
                'stock',
                'category_id',
                'is_featured',
                'is_published',
                'specifications'
            ]);

            if (is_array($productData['specifications'] ?? null)) {
                $productData['specifications'] = json_encode($productData['specifications']);
            }

            $productData['id'] = Str::uuid()->toString();
            $product = Product::create($productData);

            // Simpan variants
            foreach ($request->input('variants', []) as $variant) {
                ProductVariant::create([
                    'id' => Str::uuid()->toString(),
                    'product_id' => $product->id,
                    'name' => $variant['name'],
                    'options' => is_array($variant['options']) ? json_encode($variant['options']) : $variant['options'],
                ]);
            }

            // Simpan images
            $files = $request->file('images', []);
            $imageInputs = $request->input('images', []);
            $hasPrimary = false;

            foreach ($files as $index => $fileData) {
                $file = $fileData['file'] ?? null;
                $isPrimary = $imageInputs[$index]['is_primary'] ?? false;

                if ($file && $file->isValid()) {
                    $filePath = $this->uploadProductImage($product, $file);

                    if (!$hasPrimary && ($isPrimary || $index === 0)) {
                        $isPrimary = true;
                        $hasPrimary = true;
                    }

                    ProductImage::create([
                        'id' => Str::uuid()->toString(),
                        'product_id' => $product->id,
                        'file_path' => $filePath,
                        'is_primary' => $isPrimary,
                    ]);
                }
            }

            $product->load(['category', 'variants', 'images']);
            DB::commit();

            return response()->json([
                'message' => 'Produk berhasil ditambahkan',
                'product' => $product,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 422,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal menyimpan produk: ' . $e->getMessage());

            return response()->json([
                'status' => 500,
                'message' => 'Terjadi kesalahan pada server',
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
            // Mengambil produk berdasarkan ID, termasuk kategori, varian, dan gambar
            $product = Product::with([
                'category' => function ($query) {
                    $query->select('id', 'name');
                    $query->withTrashed();
                },
                'variants',
                'images' => function ($query) {
                    $query->select('product_id', 'file_path', 'is_primary');
                    $query->withTrashed();
                }
            ])->findOrFail($id); // Jika produk tidak ditemukan, akan throw ModelNotFoundException

            return response()->json([
                'product' => $product,
            ], 200);
        } catch (\Exception $e) {
            // Log error
            Log::error('Terjadi kesalahan saat mengambil produk: ' . $e->getMessage());

            return response()->json([
                'message' => 'Terjadi kesalahan pada server',
                'error' => $e->getMessage(),
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
        try {
            DB::beginTransaction();

            Log::info('REQUEST INPUT (tanpa file):', $request->except(['images']));
            Log::info('VARIANTS:', $request->input('variants', []));
            Log::info('IMAGES META:', $request->input('images', []));

            // Logging data file upload (jika ada)
            foreach ($request->file('images', []) as $index => $imageFile) {
                if ($imageFile instanceof \Illuminate\Http\UploadedFile) {
                    Log::info("IMAGE FILE #$index", [
                        'original_name' => $imageFile->getClientOriginalName(),
                        'size' => $imageFile->getSize(),
                        'mime_type' => $imageFile->getMimeType(),
                        'is_valid' => $imageFile->isValid()
                    ]);
                }
            }

            $product = Product::with(['variants', 'images'])->findOrFail($id);

            // Ubah opsi variant dari string ke array jika perlu
            foreach ($request->input('variants', []) as $variantData) {
                $product->variants()->updateOrCreate(
                    ['id' => $variantData['id'] ?? null],
                    [
                        'name' => $variantData['name'],
                        'options' => is_array($variantData['options'])
                            ? json_encode($variantData['options'])
                            : json_encode(explode(',', $variantData['options'])),
                    ]
                );
            }

            // Validasi request
            $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric',
                'stock' => 'required|integer',
                'category_id' => 'required|uuid|exists:categories,id',
                'is_featured' => 'required|boolean',
                'is_published' => 'required|boolean',
                'specifications' => 'nullable|json',

                'variants' => 'nullable|array',
                'variants.*.id' => 'nullable|uuid|exists:product_variants,id',
                'variants.*.name' => 'required_with:variants|string|max:255',
                'variants.*.options' => 'required',

                'images_to_delete' => 'nullable|array',
                'images_to_delete.*' => 'uuid|exists:product_images,id',

                // Hanya validasi gambar jika ada file yang di-upload
                'images' => 'nullable|array',
                'images.*.id' => 'nullable|uuid|exists:product_images,id',
                'images.*.file' => 'nullable|sometimes|file|mimes:jpeg,png,jpg,gif|max:2048',
                'images.*.is_primary' => 'nullable|boolean',
            ]);

            // Update produk
            $product->update([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'stock' => $request->stock,
                'category_id' => $request->category_id,
                'is_featured' => $request->boolean('is_featured'),
                'is_published' => $request->boolean('is_published'),
                'specifications' => is_array($request->specifications)
                    ? json_encode($request->specifications)
                    : $request->specifications,
            ]);

            // Hapus gambar yang dihapus
            foreach ($request->input('images_to_delete', []) as $imageId) {
                $image = ProductImage::find($imageId);
                if ($image) {
                    $image->delete(); // Soft delete
                }
            }

            // Kelola gambar baru / existing
            $images = $request->input('images', []);
            foreach ($images as $index => $imgData) {
                $file = $request->file("images.$index.file");
                $isPrimary = $imgData['is_primary'] ?? false;
                $imageId = $imgData['id'] ?? null;

                if ($imageId) {
                    // Update gambar lama
                    $image = ProductImage::find($imageId);
                    if ($image) {
                        $image->update(['is_primary' => $isPrimary]);
                    }
                } elseif ($file instanceof \Illuminate\Http\UploadedFile && $file->isValid()) {
                    // Upload gambar baru
                    $filePath = $this->uploadProductImage($product, $file);
                    ProductImage::create([
                        'id' => Str::uuid()->toString(),
                        'product_id' => $product->id,
                        'file_path' => $filePath,
                        'is_primary' => $isPrimary,
                    ]);
                }
            }

            DB::commit();

            $product->load(['category', 'variants', 'images']);

            return response()->json([
                'message' => 'Produk berhasil diperbarui',
                'product' => $product,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal update produk: ' . $e->getMessage());
            return response()->json([
                'message' => 'Terjadi kesalahan saat update produk',
                'error' => $e->getMessage(),
            ], 500);
        }
    }







    /**
     * Upload product image to storage
     *
     * @param  \App\Models\Product  $product
     * @param  \Illuminate\Http\UploadedFile  $file
     * @return string
     */
    protected function uploadProductImage(Product $product, $file): string
    {
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

        // Simpan ke disk 'public', di folder products/{product_id}
        $path = $file->storeAs("products", $filename, 'public');

        // Kembalikan path URL yang bisa diakses via public/storage
        return "storage/{$path}";
    }

    /**
     * Display the specified resource.
     *
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            // Mencari produk berdasarkan ID
            $product = Product::findOrFail($id);

            // Menghapus produk
            $product->delete();

            return response()->json([
                'message' => 'Produk berhasil dihapus',
            ], 200);
        } catch (\Exception $e) {
            // Log error
            Log::error('Terjadi kesalahan saat menghapus produk: ' . $e->getMessage());

            return response()->json([
                'message' => 'Terjadi kesalahan pada server',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
