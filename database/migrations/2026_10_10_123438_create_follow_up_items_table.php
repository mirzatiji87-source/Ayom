
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('follow_up_items', function (Blueprint $table) {
            $table->id();

            // Keluarga yang memiliki checklist ini.
            $table->foreignId('family_id')
                ->constrained('families')
                ->cascadeOnDelete();

            // Laporan yang memicu tindak lanjut.
            $table->foreignId('member_status_report_id')
                ->nullable()
                ->constrained('member_status_reports')
                ->nullOnDelete();

            // Pengguna yang bertanggung jawab mengerjakan checklist.
            $table->foreignId('assigned_to')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('title');
            $table->text('description')->nullable();

            $table->string('status')
                ->default('pending');

            $table->date('due_date')->nullable();

            $table->foreignId('completed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('completed_at')->nullable();
            $table->text('completion_note')->nullable();

            $table->timestamps();

            $table->index(['family_id', 'status']);
            $table->index(['assigned_to', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('follow_up_items');
    }
};
