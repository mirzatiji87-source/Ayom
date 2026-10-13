
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_status_reports', function (Blueprint $table) {
            $table->id();

            $table->foreignId('family_id')
                ->constrained('families')
                ->cascadeOnDelete();

            // Anggota keluarga yang dilaporkan.
            $table->foreignId('member_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Pengguna yang mengirimkan laporan.
            $table->foreignId('reported_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('reported_life_status')
                ->default('deceased');

            $table->date('reported_death_date')->nullable();
            $table->text('report_note')->nullable();
            $table->string('evidence_path')->nullable();

            // Status pemeriksaan laporan.
            $table->string('verification_status')
                ->default('pending');

            $table->foreignId('verified_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('verified_at')->nullable();
            $table->text('verification_note')->nullable();

            // Status tindak lanjut BPJS yang dilaporkan keluarga.
            // Bukan bukti bahwa BPJS sudah memverifikasi laporan.
            $table->string('bpjs_report_status')
                ->default('not_reported');

            $table->timestamp('bpjs_reported_at')->nullable();
            $table->string('bpjs_reference')->nullable();

            $table->timestamps();

            $table->index(['family_id', 'verification_status']);
            $table->index(['member_user_id', 'verification_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_status_reports');
    }
};
