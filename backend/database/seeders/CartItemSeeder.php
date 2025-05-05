<?php

namespace Database\Seeders;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CartItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get user with role customer
        $user = User::where('role', 'customer')->first();

        if (!$user) {
            $this->command->error('No customer user found.');
            return;
        }

        // Get products
        $tshirt = Product::where('name', 'Casual T-Shirt')->first();
        $jeans = Product::where('name', 'Slim Fit Jeans')->first();

        if (!$tshirt || !$jeans) {
            $this->command->error('Required products not found.');
            return;
        }

        // Get cart for user
        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart) {
            $this->command->error('No cart found for the user.');
            return;
        }

        $cartItems = [
            [
                'cart_id' => $cart->id,
                'product_id' => $tshirt->id,
                'qty' => 2,
            ],
            [
                'cart_id' => $cart->id,
                'product_id' => $jeans->id,
                'qty' => 2,
            ],
        ];

        foreach ($cartItems as $item) {
            CartItem::create([
                'id' => Str::uuid(),
                'cart_id' => $item['cart_id'],
                'product_id' => $item['product_id'],
                'qty' => $item['qty'],
            ]);
        }

        $this->command->info('Cart items seeded successfully.');
    }
}
