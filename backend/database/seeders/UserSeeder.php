<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'id' => Str::uuid(),
            'name' => 'Admin User',
            'username' => 'admin',
            'email' => 'admin@example.com',
            'avatar' => null,
            'role' => 'admin',
            'email_verified_at' => now(),
            'password' => Hash::make('12345678'),
            'remember_token' => Str::random(10),
        ]);

        // Create customer user
        User::create([
            'id' => Str::uuid(),
            'name' => 'Customer User',
            'username' => 'customer',
            'email' => 'customer@example.com',
            'avatar' => null,
            'role' => 'customer',
            'email_verified_at' => now(),
            'password' => Hash::make('12345678'),
            'remember_token' => Str::random(10),
        ]);

        // Create management user
        User::create([
            'id' => Str::uuid(),
            'name' => 'Management User',
            'username' => 'manager',
            'email' => 'manager@example.com',
            'avatar' => null,
            'role' => 'management',
            'email_verified_at' => now(),
            'password' => Hash::make('12345678'),
            'remember_token' => Str::random(10),
        ]);
    }
}
