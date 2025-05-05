<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductImage;
use App\Models\Product;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class ProductImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $imagePath = ["wireless-mouse.png", "gaming-keyboard.png", "led-desk-lamp.png"];
        // Get all products
        $products = Product::all();

        foreach ($products as $product) {
            $primaryImage = Arr::random($imagePath);
            // Create primary image for each product
            ProductImage::create([
                'id' => Str::uuid(),
                'product_id' => $product->id,
                'file_path' => 'storage/products/' . $primaryImage,
                'is_primary' => true
            ]);

            // Create 2-3 additional images for each product
            $imageCount = rand(2, 3);
            for ($i = 1; $i <= $imageCount; $i++) {
                $randomImage = $imagePath[array_rand($imagePath)];

                ProductImage::create([
                    'id' => Str::uuid(),
                    'product_id' => $product->id,
                    'file_path' => 'storage/products/' . $randomImage,
                    'is_primary' => false,
                ]);
            }
        }
    }
}
