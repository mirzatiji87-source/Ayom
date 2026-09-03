<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // biasanya lansia
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('name'); // "Listrik PLN", "BPJS Kesehatan", "Obat Harian"
            $table->enum('category', ['listrik', 'air', 'bpjs', 'obat', 'internet', 'lainnya'])
                  ->default('lainnya');

            $table->decimal('amount', 15, 2);
            $table->enum('frequency', ['daily', 'weekly', 'monthly'])->default('monthly');

            $table->date('next_due_date');
            $table->boolean('auto_pay')->default(true);
            $table->boolean('is_active')->default(true);

            $table->timestamp('last_paid_at')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'is_active', 'next_due_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
