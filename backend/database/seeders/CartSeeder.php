<?php

namespace Database\Seeders;

use App\Models\Cart;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Str;


class CartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('role', 'customer')->first();

        Cart::create([
            'id' => Str::uuid(),
            'user_id' => $user->id,
            'cart_name' => "kebutuhan sehari hari",
            'schedule' => Carbon::now()->addDays(7),  // Menambahkan 7 hari ke tanggal sekarang
        ]);

        Cart::create([
            'id' => Str::uuid(),
            'user_id' => $user->id,
            'cart_name' => "kebutuhan anak",
            'schedule' => Carbon::now()->addDays(4),  // Menambahkan 7 hari ke tanggal sekarang
        ]);
    }
}
