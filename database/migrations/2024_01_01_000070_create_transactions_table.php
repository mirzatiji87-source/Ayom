<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // pelaku transaksi
            $table->foreignId('family_id')->constrained()->cascadeOnDelete();

            // Referensi opsional ke sumber transaksi
            $table->foreignId('bill_id')->nullable()->constrained('bills')->nullOnDelete();
            $table->foreignId('task_id')->nullable()->constrained('tasks')->nullOnDelete();

            $table->enum('type', [
                'topup',        // isi saldo keluarga
                'expense',      // belanja/pengeluaran
                'transfer',     // transfer antar anggota keluarga
                'bill_payment', // pembayaran tagihan otomatis
                'allowance',    // reward misi remaja
            ]);

            $table->enum('category', [
                'makanan', 'transportasi', 'hiburan', 'tagihan',
                'kesehatan', 'pendidikan', 'lainnya',
            ])->default('lainnya');

            $table->decimal('amount', 15, 2);
            $table->string('description')->nullable();

            $table->enum('status', ['pending', 'approved', 'rejected', 'completed'])
                  ->default('completed');

            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();

            $table->timestamps();

            $table->index(['family_id', 'type']);
            $table->index(['user_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
