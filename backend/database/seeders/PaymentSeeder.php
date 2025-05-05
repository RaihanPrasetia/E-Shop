<?php

namespace Database\Seeders;

use App\Models\Bank;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Buat Payment Methods
        $paymentMethods = [
            [
                'name' => 'Bank Transfer',
                'description' => 'Transfer melalui bank lokal',
            ],
            [
                'name' => 'Credit Card',
                'description' => 'Pembayaran menggunakan kartu kredit',
            ],
            [
                'name' => 'E-Wallet',
                'description' => 'Dompet digital seperti OVO, GoPay',
            ],
        ];

        foreach ($paymentMethods as $method) {
            PaymentMethod::create([
                'id' => (string) Str::uuid(),
                'name' => $method['name'],
                'description' => $method['description'],
            ]);
        }

        $this->command->info('Payment Methods berhasil dibuat.');

        // 2. Buat Bank untuk Payment Method "Bank Transfer"
        $paymentMethod = PaymentMethod::where('name', 'Bank Transfer')->first();
        $user = User::where('role', 'admin')->first(); // Anggap Bank dikelola admin

        if ($paymentMethod && $user) {
            $banks = [
                [
                    'name' => 'BCA',
                    'no_rek' => '67834256654',
                ],
                [
                    'name' => 'Mandiri',
                    'no_rek' => '7379373266',
                ],
                [
                    'name' => 'BNI',
                    'no_rek' => '732293849',
                ],
                [
                    'name' => 'BRI',
                    'no_rek' => '4508048783',
                ]
            ];

            foreach ($banks as $bankName) {
                Bank::create([
                    'id' => (string) Str::uuid(),
                    'name' => $bankName['name'],
                    'no_rek' => $bankName['no_rek'],
                    'payment_method_id' => $paymentMethod->id,
                    'isActive' => rand(0, 1),
                    'an' => 'Pifacia',
                    'user_id' => $user->id,
                ]);
            }

            $this->command->info('Banks berhasil dibuat.');
        }

        // 3. Buat Payment untuk beberapa Order dengan bank_id
        $orders = Order::take(5)->get();
        $availableBanks = Bank::all();

        if ($orders->isEmpty() || $availableBanks->isEmpty()) {
            $this->command->warn('Tidak ada Order atau Bank ditemukan. Payment tidak dibuat.');
            return;
        }

        foreach ($orders as $order) {
            $bank = $availableBanks->random(); // pilih bank secara acak

            Payment::create([
                'id' => (string) Str::uuid(),
                'order_id' => $order->id,
                'bank_id' => $bank->id,
                'bank_name' => $bank->name,
                'bank_no_rek' => $bank->no_rek,
                'bank_an' => $bank->an,
                'amount' => $order->total_price,
                'status' => 'paid',
                'proof' => 'bukti.pdf',
                'payment_date' => now(),
            ]);
        }

        $this->command->info('Payments berhasil dibuat untuk orders.');
    }
}
