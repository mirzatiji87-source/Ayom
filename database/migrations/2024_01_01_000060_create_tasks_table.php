<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('family_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assigned_to')->constrained('users')->cascadeOnDelete(); // remaja
            $table->foreignId('created_by')->constrained('users'); // orang_tua/lansia yang buat misi

            $table->string('title');       // "Bantu Oma bayar tagihan"
            $table->text('description')->nullable();
            $table->decimal('reward_amount', 15, 2);

            $table->enum('status', ['open', 'submitted', 'approved', 'rejected'])
                  ->default('open');

            $table->text('rejection_reason')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();

            $table->date('due_date')->nullable();

            $table->timestamps();

            $table->index(['family_id', 'status']);
            $table->index(['assigned_to', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
