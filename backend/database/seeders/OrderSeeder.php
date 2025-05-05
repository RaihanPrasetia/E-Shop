<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil 1 user customer
        $user = User::where('role', 'customer')->first();

        if (!$user) {
            $this->command->warn('No customer found. Skipping order seeding.');
            return;
        }

        // Ambil beberapa produk
        $products = Product::take(2)->get();

        if ($products->isEmpty()) {
            $this->command->warn('No products found. Skipping order seeding.');
            return;
        }

        $totalPrice = 0;
        $totalQty = 0;

        // Buat 1 order
        $order = Order::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'total_price' => 0, // Placeholder sementara
            'status' => 'pending',
            'total_qty' => 0,
        ]);

        // Buat order items untuk setiap produk
        foreach ($products as $product) {
            $qty = rand(1, 5); // Random qty antara 1-5
            $price = $product->price; // Harga satuan produk

            $orderItem = OrderItem::create([
                'id' => (string) Str::uuid(),
                'order_id' => $order->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'price' => $price,
                'qty' => $qty,
            ]);

            $totalPrice += ($price * $qty);
            $totalQty += ($orderItem->qty);
        }

        // Update total_price di order
        $order->update([
            'total_price' => $totalPrice,
            'total_qty' => $totalQty
        ]);

        $this->command->info('Order dan OrderItems berhasil disimpan.');
    }
}
