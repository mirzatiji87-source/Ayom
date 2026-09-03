<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * File ini MENGGANTIKAN migration default Breeze
     * "0001_01_01_000000_create_users_table.php".
     * Hapus/ganti file bawaan Breeze dengan file ini agar tidak
     * ada 2 migration yang membuat tabel users.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');

            // --- Kolom tambahan Ayom ---
            // Catatan: ->after() TIDAK dipakai di sini karena hanya valid untuk
            // Schema::table() (ALTER TABLE). Di Schema::create(), urutan kolom
            // otomatis mengikuti urutan penulisan di bawah ini.
            $table->enum('role', ['admin', 'orang_tua', 'lansia', 'remaja'])
                  ->default('orang_tua');

            $table->foreignId('family_id')
                  ->nullable()
                  ->constrained('families')
                  ->nullOnDelete();

            $table->foreignId('created_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->string('phone', 20)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->boolean('is_active')->default(true);
            // --- akhir kolom tambahan ---

            $table->rememberToken();
            $table->timestamps();

            $table->index(['family_id', 'role']);
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
