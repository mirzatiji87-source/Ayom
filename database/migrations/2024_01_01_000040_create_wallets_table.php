<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();

            $table->decimal('balance', 15, 2)->default(0);

            // Limit pengeluaran
            $table->decimal('daily_limit', 15, 2)->nullable();
            $table->decimal('monthly_limit', 15, 2)->nullable();

            // Akumulasi pengeluaran berjalan (di-reset via scheduler)
            $table->decimal('daily_spent', 15, 2)->default(0);
            $table->decimal('monthly_spent', 15, 2)->default(0);
            $table->date('daily_spent_reset_at')->nullable();
            $table->date('monthly_spent_reset_at')->nullable();

            // Nominal transaksi keluar di atas ini wajib approval orang tua
            $table->decimal('approval_threshold', 15, 2)->default(100000);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};
