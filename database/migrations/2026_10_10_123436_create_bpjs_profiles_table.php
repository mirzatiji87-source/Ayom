
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bpjs_profiles', function (Blueprint $table) {
            $table->id();

            // Keluarga pemilik profil BPJS.
            $table->foreignId('family_id')
                ->constrained('families')
                ->cascadeOnDelete();

            // Anggota keluarga yang terdaftar.
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Tagihan BPJS terkait, jika ada.
            $table->foreignId('bill_id')
                ->nullable()
                ->constrained('bills')
                ->nullOnDelete();

            $table->string('participant_name');

            // Akan menggunakan encrypted cast di model
            // agar nomor peserta disimpan dalam bentuk terenkripsi.
            $table->text('participant_number')->nullable();

            $table->string('relationship_to_head')->nullable();
            $table->string('membership_class')->nullable();
            $table->string('segment')->nullable();

            $table->string('membership_status')
                ->default('unknown');

            $table->decimal('monthly_contribution', 12, 2)
                ->nullable();

            $table->timestamp('last_verified_at')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['family_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bpjs_profiles');
    }
};
