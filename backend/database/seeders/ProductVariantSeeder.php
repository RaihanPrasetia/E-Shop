<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductVariant;
use App\Models\Product;
use Illuminate\Support\Str;

class ProductVariantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tshirt = Product::where('name', 'Casual T-Shirt')->first();
        $jeans = Product::where('name', 'Slim Fit Jeans')->first();
        $smartphone = Product::where('name', 'Smartphone X')->first();

        // T-shirt variants
        ProductVariant::create([
            'id' => Str::uuid(),
            'product_id' => $tshirt->id,
            'name' => 'Size',
            'options' => json_encode(['S', 'M', 'L', 'XL', 'XXL'])
        ]);

        ProductVariant::create([
            'id' => Str::uuid(),
            'product_id' => $tshirt->id,
            'name' => 'Color',
            'options' => json_encode(['Black', 'White', 'Blue', 'Red', 'Green'])
        ]);

        // Jeans variants
        ProductVariant::create([
            'id' => Str::uuid(),
            'product_id' => $jeans->id,
            'name' => 'Size',
            'options' => json_encode(['28', '30', '32', '34', '36'])
        ]);

        ProductVariant::create([
            'id' => Str::uuid(),
            'product_id' => $jeans->id,
            'name' => 'Color',
            'options' => json_encode(['Blue', 'Black', 'Grey'])
        ]);

        // Smartphone variants
        ProductVariant::create([
            'id' => Str::uuid(),
            'product_id' => $smartphone->id,
            'name' => 'Storage',
            'options' => json_encode(['128GB', '256GB', '512GB'])
        ]);

        ProductVariant::create([
            'id' => Str::uuid(),
            'product_id' => $smartphone->id,
            'name' => 'Color',
            'options' => json_encode(['Black', 'Silver', 'Gold', 'Blue'])
        ]);
    }
}
