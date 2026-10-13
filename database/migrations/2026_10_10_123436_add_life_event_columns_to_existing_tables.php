
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Status kehidupan anggota keluarga.
            $table->string('life_status')
                ->default('alive');

            $table->timestamp('status_changed_at')
                ->nullable();
        });

        Schema::table('bills', function (Blueprint $table) {
            // Penanda agar tagihan dapat ditinjau sebelum diproses.
            $table->string('schedule_status')
                ->default('normal');

            $table->text('schedule_note')
                ->nullable();

            $table->timestamp('schedule_flagged_at')
                ->nullable();
        });

        Schema::table('transactions', function (Blueprint $table) {
            // Menandai mode pemrosesan transaksi.
            $table->string('payment_mode')
                ->default('unknown');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('payment_mode');
        });

        Schema::table('bills', function (Blueprint $table) {
            $table->dropColumn([
                'schedule_status',
                'schedule_note',
                'schedule_flagged_at',
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'life_status',
                'status_changed_at',
            ]);
        });
    }
};
