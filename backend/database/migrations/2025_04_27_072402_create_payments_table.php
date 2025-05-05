<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('order_id');
            $table->uuid('bank_id');
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'paid', 'failed']);
            $table->string('proof');
            $table->date('payment_date');
            $table->string('bank_name');
            $table->string('bank_no_rek');
            $table->string('bank_an');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->foreign('bank_id')->references('id')->on('banks')->onDelete('cascade');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
