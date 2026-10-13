<?php

namespace Database\Seeders;

use App\Models\Bill;
use App\Models\BpjsProfile;
use App\Models\Family;
use App\Models\MemberStatusReport;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class LifeEventDemoSeeder extends Seeder
{
    /**
     * Seeder demo terpisah dari DemoDataSeeder.
     * Bisa dijalankan ulang tanpa membuat laporan dan transaksi duplikat.
     *
     * Gunakan hanya pada database pengembangan/demo Ayom.
     * Nomor peserta BPJS di sini adalah data dummy.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->seedDemoFamily();
        });
    }

    protected function seedDemoFamily(): void
    {
        $family = Family::firstOrCreate(
            ['name' => 'Keluarga Demo Status Ayom'],
            ['balance' => 1_000_000]
        );

        $parent = User::updateOrCreate(
            ['email' => 'hendra@ayom.id'],
            [
                'name' => 'Hendra Saputra',
                'password' => Hash::make('password'),
                'role' => 'orang_tua',
                'family_id' => $family->id,
                'phone' => '081234560010',
                'is_active' => true,
            ]
        );

        $family->update(['owner_id' => $parent->id]);

        Wallet::firstOrCreate(
            ['user_id' => $parent->id],
            ['balance' => 200_000]
        );

        $member = User::updateOrCreate(
            ['email' => 'kakek.slamet@ayom.id'],
            [
                'name' => 'Slamet Raharjo',
                'password' => Hash::make('password'),
                'role' => 'lansia',
                'family_id' => $family->id,
                'created_by' => $parent->id,
                'phone' => '081234560011',
                'date_of_birth' => '1950-05-17',
                'is_active' => true,
            ]
        );

        Wallet::firstOrCreate(
            ['user_id' => $member->id],
            [
                'balance' => 250_000,
                'daily_limit' => 50_000,
                'monthly_limit' => 1_000_000,
                'approval_threshold' => 100_000,
            ]
        );

        $bpjsBill = Bill::firstOrCreate(
            [
                'user_id' => $member->id,
                'category' => 'bpjs',
            ],
            [
                'created_by' => $parent->id,
                'name' => 'BPJS Kesehatan',
                'amount' => 90_000,
                'frequency' => 'monthly',
                'next_due_date' => now()->addDays(4)->toDateString(),
                'auto_pay' => true,
                'is_active' => true,
            ]
        );

        Bill::firstOrCreate(
            [
                'user_id' => $member->id,
                'category' => 'listrik',
            ],
            [
                'created_by' => $parent->id,
                'name' => 'Listrik PLN',
                'amount' => 120_000,
                'frequency' => 'monthly',
                'next_due_date' => now()->addDays(8)->toDateString(),
                'auto_pay' => true,
                'is_active' => true,
            ]
        );

        BpjsProfile::firstOrCreate(
            ['user_id' => $member->id],
            [
                'family_id' => $family->id,
                'bill_id' => $bpjsBill->id,
                'participant_name' => $member->name,
                'participant_number' => '0000000000002',
                'relationship_to_head' => 'Kakek',
                'membership_class' => '3',
                'segment' => 'DEMO',
                'membership_status' => 'unknown',
                'monthly_contribution' => 90_000,
                'notes' => 'Profil peserta dummy untuk demonstrasi Ayom.',
            ]
        );

        // Riwayat simulasi tidak dibuat berulang.
        Transaction::firstOrCreate(
            [
                'user_id' => $member->id,
                'bill_id' => $bpjsBill->id,
                'type' => 'bill_payment',
            ],
            [
                'family_id' => $family->id,
                'category' => 'tagihan',
                'amount' => 90_000,
                'description' => 'Riwayat pembayaran simulasi BPJS (demo)',
                'status' => 'completed',
                'payment_mode' => Transaction::MODE_SIMULATION,
            ]
        );

        // Laporan tetap pending sampai diproses oleh admin.
        // Pencarian berdasarkan keluarga dan anggota mencegah duplikasi
        // laporan meskipun seeder dijalankan ulang.
        MemberStatusReport::firstOrCreate(
            [
                'family_id' => $family->id,
                'member_user_id' => $member->id,
            ],
            [
                'reported_by' => $parent->id,
                'reported_life_status' => MemberStatusReport::LIFE_STATUS_DECEASED,
                'reported_death_date' => now()->subDay()->toDateString(),
                'report_note' => 'Laporan dummy untuk demonstrasi fitur Ayom.',
                'evidence_path' => null,
                'verification_status' => MemberStatusReport::STATUS_PENDING,
                'bpjs_report_status' => MemberStatusReport::BPJS_NOT_REPORTED,
            ]
        );
    }
}
