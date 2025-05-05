<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        $categories = [
            [
                'name' => 'Electronics',
                'isActive' => true,
                'created_by' => $admin->id,
                'metadata' => json_encode([
                    'icon' => 'fa-laptop',
                ])
            ],
            [
                'name' => 'Clothing',
                'isActive' => true,
                'created_by' => $admin->id,
                'metadata' => json_encode([
                    'icon' => 'fa-tshirt',
                ])
            ],
            [
                'name' => 'Home & Kitchen',
                'isActive' => true,
                'created_by' => $admin->id,
                'metadata' => json_encode([
                    'icon' => 'fa-home',
                ])
            ],
            [
                'name' => 'Books',
                'isActive' => true,
                'created_by' => $admin->id,
                'metadata' => json_encode([
                    'icon' => 'fa-book',
                ])
            ],
            [
                'name' => 'Sports & Outdoors',
                'isActive' => false,
                'created_by' => $admin->id,
                'metadata' => json_encode([
                    'icon' => 'fa-running',
                ])
            ]
        ];

        foreach ($categories as $category) {
            Category::create([
                'id' => Str::uuid(),
                'name' => $category['name'],
                'isActive' => $category['isActive'],
                'created_by' => $category['created_by'],
                'metadata' => $category['metadata']
            ]);
        }
    }
}
