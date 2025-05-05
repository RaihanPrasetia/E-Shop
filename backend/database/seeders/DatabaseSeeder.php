<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            // CategorySeeder::class,
            // ProductSeeder::class,
            // CartSeeder::class,
            // CartItemSeeder::class,
            // ProductVariantSeeder::class,
            // ProductImageSeeder::class,
            // OrderSeeder::class,
            // PaymentSeeder::class,
        ]);
    }
}
