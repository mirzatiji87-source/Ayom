<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\ApprovalRequest;
use App\Models\Bill;
use App\Models\Family;
use App\Models\Task;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Catatan: nominal saldo/wallet di bawah adalah "snapshot" akhir yang masuk
     * akal untuk demo (bukan hasil replay otomatis dari setiap transaksi).
     * Cukup untuk testing UI semua role tanpa perlu hitung manual.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->seedAdmin();
            $this->seedKeluargaAndi();
        });
    }

    // ================= ADMIN =================

    protected function seedAdmin(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@ayom.id'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );
    }

    // ================= KELUARGA DEMO =================

    protected function seedKeluargaAndi(): void
    {
        // 1. Family
        $family = Family::create([
            'name' => 'Keluarga Bapak Andi',
            'balance' => 2_000_000,
        ]);

        // 2. Orang tua (pemilik family)
        $orangTua = User::create([
            'name' => 'Andi Wijaya',
            'email' => 'andi@ayom.id',
            'password' => Hash::make('password'),
            'role' => 'orang_tua',
            'family_id' => $family->id,
            'phone' => '081234560001',
            'is_active' => true,
        ]);
        $family->update(['owner_id' => $orangTua->id]);

        Wallet::create([
            'user_id' => $orangTua->id,
            'balance' => 500_000,
        ]);

        // 3. Lansia (dibuat oleh orang_tua)
        $lansia = User::create([
            'name' => 'Siti Aminah',
            'email' => 'oma.siti@ayom.id',
            'password' => Hash::make('password'),
            'role' => 'lansia',
            'family_id' => $family->id,
            'created_by' => $orangTua->id,
            'phone' => '081234560002',
            'date_of_birth' => '1955-03-12',
            'is_active' => true,
        ]);

        Wallet::create([
            'user_id' => $lansia->id,
            'balance' => 300_000,
            'daily_limit' => 50_000,
            'monthly_limit' => 1_000_000,
            'approval_threshold' => 100_000,
        ]);

        // 4. Remaja (dibuat oleh orang_tua)
        $remaja = User::create([
            'name' => 'Budi Wijaya',
            'email' => 'budi@ayom.id',
            'password' => Hash::make('password'),
            'role' => 'remaja',
            'family_id' => $family->id,
            'created_by' => $orangTua->id,
            'phone' => '081234560003',
            'date_of_birth' => '2010-07-20',
            'is_active' => true,
        ]);

        Wallet::create([
            'user_id' => $remaja->id,
            'balance' => 75_000,
            'daily_limit' => 20_000,
            'monthly_limit' => 300_000,
            'approval_threshold' => 50_000,
        ]);

        // 5. Bills milik lansia
        $bills = collect([
            Bill::create([
                'user_id' => $lansia->id,
                'created_by' => $orangTua->id,
                'name' => 'Listrik PLN',
                'category' => 'listrik',
                'amount' => 150_000,
                'frequency' => 'monthly',
                'next_due_date' => now()->addDays(5)->toDateString(),
                'auto_pay' => true,
                'is_active' => true,
            ]),
            Bill::create([
                'user_id' => $lansia->id,
                'created_by' => $orangTua->id,
                'name' => 'BPJS Kesehatan',
                'category' => 'bpjs',
                'amount' => 90_000,
                'frequency' => 'monthly',
                'next_due_date' => now()->addDays(10)->toDateString(),
                'auto_pay' => true,
                'is_active' => true,
            ]),
            Bill::create([
                'user_id' => $lansia->id,
                'created_by' => $orangTua->id,
                'name' => 'Obat Harian',
                'category' => 'obat',
                'amount' => 45_000,
                'frequency' => 'weekly',
                'next_due_date' => now()->addDays(2)->toDateString(),
                'auto_pay' => false,
                'is_active' => true,
            ]),
        ]);

        // 6. Tasks (misi remaja) — satu sudah selesai & disetujui, satu masih open
        $taskSelesai = Task::create([
            'family_id' => $family->id,
            'assigned_to' => $remaja->id,
            'created_by' => $orangTua->id,
            'title' => 'Bantu Oma bayar tagihan listrik',
            'description' => 'Antar dan bantu Oma Siti membayar tagihan listrik bulan ini.',
            'reward_amount' => 15_000,
            'status' => 'approved',
            'submitted_at' => now()->subDays(2),
            'reviewed_at' => now()->subDay(),
            'reviewed_by' => $orangTua->id,
            'due_date' => now()->subDays(3)->toDateString(),
        ]);

        Task::create([
            'family_id' => $family->id,
            'assigned_to' => $remaja->id,
            'created_by' => $orangTua->id,
            'title' => 'Belanja bulanan keluarga',
            'description' => 'Belanja kebutuhan dapur sesuai daftar dari Ibu.',
            'reward_amount' => 20_000,
            'status' => 'open',
            'due_date' => now()->addDays(3)->toDateString(),
        ]);

        // 7. Transaksi contoh — mencakup semua type & status penting untuk demo

        // a. Top up saldo keluarga oleh orang tua
        Transaction::create([
            'user_id' => $orangTua->id,
            'family_id' => $family->id,
            'type' => 'topup',
            'category' => 'lainnya',
            'amount' => 500_000,
            'description' => 'Top up saldo keluarga bulan ini',
            'status' => 'completed',
            'approved_by' => $orangTua->id,
            'approved_at' => now()->subDays(5),
        ]);

        // b. Pembayaran tagihan otomatis (auto-pilot bill)
        Transaction::create([
            'user_id' => $lansia->id,
            'family_id' => $family->id,
            'bill_id' => $bills[0]->id,
            'type' => 'bill_payment',
            'category' => 'tagihan',
            'amount' => 150_000,
            'description' => 'Pembayaran otomatis: Listrik PLN',
            'status' => 'completed',
            'approved_at' => now()->subDays(3),
        ]);

        // c. Pengeluaran kecil lansia, di bawah approval_threshold -> langsung completed
        Transaction::create([
            'user_id' => $lansia->id,
            'family_id' => $family->id,
            'type' => 'expense',
            'category' => 'makanan',
            'amount' => 25_000,
            'description' => 'Beli sayur di warung',
            'status' => 'completed',
        ]);

        // d. Pengeluaran besar lansia, di atas approval_threshold -> pending + ApprovalRequest
        $transaksiPending = Transaction::create([
            'user_id' => $lansia->id,
            'family_id' => $family->id,
            'type' => 'expense',
            'category' => 'kesehatan',
            'amount' => 150_000,
            'description' => 'Kontrol rutin ke dokter',
            'status' => 'pending',
        ]);

        ApprovalRequest::create([
            'transaction_id' => $transaksiPending->id,
            'requested_by' => $lansia->id,
            'status' => 'pending',
        ]);

        // e. Reward misi remaja yang sudah disetujui
        Transaction::create([
            'user_id' => $remaja->id,
            'family_id' => $family->id,
            'task_id' => $taskSelesai->id,
            'type' => 'allowance',
            'category' => 'lainnya',
            'amount' => 15_000,
            'description' => 'Reward misi: ' . $taskSelesai->title,
            'status' => 'completed',
            'approved_by' => $orangTua->id,
            'approved_at' => now()->subDay(),
        ]);

        // f. Contoh transaksi yang pernah ditolak (untuk demo ApprovalCenter)
        $transaksiDitolak = Transaction::create([
            'user_id' => $lansia->id,
            'family_id' => $family->id,
            'type' => 'expense',
            'category' => 'hiburan',
            'amount' => 200_000,
            'description' => 'Beli hadiah untuk tetangga',
            'status' => 'rejected',
        ]);

        ApprovalRequest::create([
            'transaction_id' => $transaksiDitolak->id,
            'requested_by' => $lansia->id,
            'reviewed_by' => $orangTua->id,
            'status' => 'rejected',
            'reason' => 'Di luar kebutuhan pokok bulan ini',
            'reviewed_at' => now()->subDays(1),
        ]);

        // 8. Activity log contoh
        ActivityLog::record('create_dependent', $orangTua, $lansia, ['role' => 'lansia']);
        ActivityLog::record('create_dependent', $orangTua, $remaja, ['role' => 'remaja']);
        ActivityLog::record('approve_task', $orangTua, $taskSelesai, ['reward_amount' => 15_000]);
        ActivityLog::record('reject_transaction', $orangTua, $transaksiDitolak, [
            'reason' => 'Di luar kebutuhan pokok bulan ini',
        ]);
    }
}