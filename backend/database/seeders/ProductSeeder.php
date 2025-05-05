<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $electronicsCategory = Category::where('name', 'Electronics')->first();
        $clothingCategory = Category::where('name', 'Clothing')->first();
        $homeCategory = Category::where('name', 'Home & Kitchen')->first();

        // Electronics products
        $products = [
            [
                'name' => 'Smartphone X',
                'description' => 'The latest smartphone with advanced features.',
                'price' => 799.99,
                'stock' => 100,
                'category_id' => $electronicsCategory->id,
                'is_featured' => true,
                'is_published' => true,
                'specifications' => json_encode([
                    'screen' => '6.5 inch OLED',
                    'processor' => 'Octa-core 2.5GHz',
                    'camera' => '48MP + 12MP + 8MP',
                    'battery' => '4500mAh',
                    'os' => 'Android 13'
                ])
            ],
            [
                'name' => 'Laptop Pro',
                'description' => 'High-performance laptop for professionals.',
                'price' => 1299.99,
                'stock' => 50,
                'category_id' => $electronicsCategory->id,
                'is_featured' => true,
                'is_published' => true,
                'specifications' => json_encode([
                    'screen' => '15.6 inch 4K',
                    'processor' => 'Intel Core i7-13700H',
                    'ram' => '16GB DDR5',
                    'storage' => '1TB SSD',
                    'gpu' => 'NVIDIA RTX 4060'
                ])
            ],
            [
                'name' => 'Wireless Earbuds',
                'description' => 'Premium quality wireless earbuds with noise cancellation.',
                'price' => 149.99,
                'stock' => 200,
                'category_id' => $electronicsCategory->id,
                'is_featured' => false,
                'is_published' => true,
                'specifications' => json_encode([
                    'type' => 'In-ear',
                    'battery' => '8 hours + 24 hours with case',
                    'connectivity' => 'Bluetooth 5.2',
                    'noise_cancellation' => 'Active',
                    'water_resistant' => 'IPX4'
                ])
            ],

            // Clothing products
            [
                'name' => 'Casual T-Shirt',
                'description' => 'Comfortable cotton t-shirt for everyday wear.',
                'price' => 19.99,
                'stock' => 300,
                'category_id' => $clothingCategory->id,
                'is_featured' => false,
                'is_published' => true,
                'specifications' => json_encode([
                    'material' => '100% Cotton',
                    'fit' => 'Regular',
                    'care' => 'Machine wash cold',
                    'origin' => 'Made in USA'
                ])
            ],
            [
                'name' => 'Slim Fit Jeans',
                'description' => 'Classic slim fit jeans with stretchy fabric.',
                'price' => 49.99,
                'stock' => 150,
                'category_id' => $clothingCategory->id,
                'is_featured' => true,
                'is_published' => true,
                'specifications' => json_encode([
                    'material' => '98% Cotton, 2% Elastane',
                    'fit' => 'Slim',
                    'rise' => 'Mid',
                    'care' => 'Machine wash cold'
                ])
            ],

            // Home & Kitchen products
            [
                'name' => 'Smart Coffee Maker',
                'description' => 'WiFi-enabled coffee maker that can be controlled remotely.',
                'price' => 129.99,
                'stock' => 75,
                'category_id' => $homeCategory->id,
                'is_featured' => true,
                'is_published' => true,
                'specifications' => json_encode([
                    'capacity' => '12 cups',
                    'features' => 'Programmable, WiFi, App control',
                    'material' => 'Stainless steel',
                    'dimensions' => '10 x 8 x 14 inches'
                ])
            ],
            [
                'name' => 'Non-stick Cookware Set',
                'description' => 'Complete set of non-stick cookware for your kitchen.',
                'price' => 89.99,
                'stock' => 60,
                'category_id' => $homeCategory->id,
                'is_featured' => false,
                'is_published' => true,
                'specifications' => json_encode([
                    'pieces' => '10',
                    'material' => 'Aluminum with non-stick coating',
                    'dishwasher_safe' => 'Yes',
                    'induction_compatible' => 'Yes'
                ])
            ]
        ];

        foreach ($products as $productData) {
            Product::create([
                'id' => Str::uuid(),
                'name' => $productData['name'],
                'description' => $productData['description'],
                'price' => $productData['price'],
                'stock' => $productData['stock'],
                'category_id' => $productData['category_id'],
                'is_featured' => $productData['is_featured'],
                'is_published' => $productData['is_published'],
                'specifications' => $productData['specifications']
            ]);
        }
    }
}
