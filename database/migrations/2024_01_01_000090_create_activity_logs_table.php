<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // pelaku aksi
            $table->foreignId('family_id')->nullable()->constrained()->nullOnDelete();

            $table->string('action');       // "create_dependent", "approve_transaction", "set_limit", dst
            $table->string('subject_type')->nullable(); // model terkait, mis. Transaction
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('meta')->nullable(); // detail tambahan (before/after value dsb)

            $table->timestamps();

            $table->index(['family_id', 'action']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
