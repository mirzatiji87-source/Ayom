<?php

namespace Tests\Feature;

use App\Models\ApprovalRequest;
use App\Models\Bill;
use App\Models\Family;
use App\Models\MemberStatusReport;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Services\LifeEventService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LifeEventTest extends TestCase
{
    use RefreshDatabase;

    private function makeScenario(): array
    {
        $family = Family::create([
            'name' => 'Keluarga Uji Life Event',
            'balance' => 0,
        ]);

        $parent = User::create([
            'name' => 'Orang Tua Uji',
            'email' => 'parent-life-event@test.id',
            'password' => 'password',
            'role' => 'orang_tua',
            'family_id' => $family->id,
            'is_active' => true,
            'life_status' => 'alive',
        ]);

        $member = User::create([
            'name' => 'Anggota Uji',
            'email' => 'member-life-event@test.id',
            'password' => 'password',
            'role' => 'lansia',
            'family_id' => $family->id,
            'created_by' => $parent->id,
            'is_active' => true,
            'life_status' => 'alive',
        ]);

        $admin = User::create([
            'name' => 'Admin Uji',
            'email' => 'admin-life-event@test.id',
            'password' => 'password',
            'role' => 'admin',
            'family_id' => null,
            'is_active' => true,
            'life_status' => 'alive',
        ]);

        foreach ([$parent, $member] as $user) {
            Wallet::create([
                'user_id' => $user->id,
                'balance' => 500_000,
                'daily_limit' => 500_000,
                'monthly_limit' => 1_000_000,
                'approval_threshold' => 100_000,
            ]);
        }

        $bill = Bill::create([
            'user_id' => $member->id,
            'created_by' => $parent->id,
            'name' => 'BPJS Kesehatan Uji',
            'category' => 'bpjs',
            'amount' => 90_000,
            'frequency' => 'monthly',
            'next_due_date' => now()->addDays(5)->toDateString(),
            'auto_pay' => true,
            'is_active' => true,
        ]);

        return compact(
            'family',
            'parent',
            'member',
            'admin',
            'bill'
        );
    }

    private function createPendingTransaction(
        array $scenario,
        float $amount = 150_000
    ): array {
        $transaction = Transaction::create([
            'user_id' => $scenario['member']->id,
            'family_id' => $scenario['family']->id,
            'type' => 'expense',
            'category' => 'kesehatan',
            'amount' => $amount,
            'description' => 'Transaksi uji persetujuan',
            'status' => 'pending',
        ]);

        $approval = ApprovalRequest::create([
            'transaction_id' => $transaction->id,
            'requested_by' => $scenario['member']->id,
            'status' => 'pending',
        ]);

        return compact('transaction', 'approval');
    }

    public function test_report_stays_pending_until_admin_verifies(): void
    {
        $s = $this->makeScenario();
        $service = app(LifeEventService::class);

        $report = $service->reportDeceased(
            $s['parent'],
            $s['member'],
            [
                'event_date' => now()->subDay()->toDateString(),
                'notes' => 'Laporan pengujian.',
            ]
        );

        $this->assertSame(
            MemberStatusReport::STATUS_PENDING,
            $report->fresh()->verification_status
        );

        $this->assertSame(
            'alive',
            $s['member']->fresh()->life_status
        );

        // Akun tetap aktif sebelum diverifikasi admin.
        $this->assertTrue(
            (bool) $s['member']->fresh()->is_active
        );

        $verified = $service->verify($s['admin'], $report);

        $this->assertSame(
            MemberStatusReport::STATUS_VERIFIED,
            $verified->verification_status
        );

        $member = $s['member']->fresh();

        $this->assertSame('deceased', $member->life_status);

        // Akun dinonaktifkan setelah laporan diverifikasi.
        $this->assertFalse((bool) $member->is_active);

        // Record anggota tetap ada, bukan dihapus permanen.
        $this->assertDatabaseHas('users', [
            'id' => $s['member']->id,
            'life_status' => 'deceased',
            'is_active' => false,
        ]);

        $this->assertSame(
            Bill::SCHEDULE_REVIEW,
            $s['bill']->fresh()->schedule_status
        );

        $this->assertSame(
            3,
            $verified->followUpItems()->count()
        );
    }

    public function test_non_admin_cannot_verify_report(): void
    {
        $s = $this->makeScenario();

        $otherParent = User::create([
            'name' => 'Orang Tua Kedua',
            'email' => 'parent-two-life-event@test.id',
            'password' => 'password',
            'role' => 'orang_tua',
            'family_id' => $s['family']->id,
            'is_active' => true,
            'life_status' => 'alive',
        ]);

        $service = app(LifeEventService::class);

        $report = $service->reportDeceased(
            $s['parent'],
            $s['member'],
            ['event_date' => now()->subDay()->toDateString()]
        );

        try {
            $service->verify($otherParent, $report);

            $this->fail(
                'Orang tua biasa tidak boleh memverifikasi laporan.'
            );
        } catch (AuthorizationException) {
            $this->assertSame(
                MemberStatusReport::STATUS_PENDING,
                $report->fresh()->verification_status
            );

            $this->assertTrue(
                (bool) $s['member']->fresh()->is_active
            );
        }
    }

    public function test_rejected_report_clears_its_schedule_review_flag(): void
    {
        $s = $this->makeScenario();
        $service = app(LifeEventService::class);

        $report = $service->reportDeceased(
            $s['parent'],
            $s['member'],
            ['event_date' => now()->subDay()->toDateString()]
        );

        $this->assertSame(
            Bill::SCHEDULE_REVIEW,
            $s['bill']->fresh()->schedule_status
        );

        $rejected = $service->reject(
            $s['admin'],
            $report,
            'Laporan belum dapat diverifikasi.'
        );

        $this->assertSame(
            MemberStatusReport::STATUS_REJECTED,
            $rejected->verification_status
        );

        $this->assertSame(
            'alive',
            $s['member']->fresh()->life_status
        );

        $this->assertSame(
            Bill::SCHEDULE_NORMAL,
            $s['bill']->fresh()->schedule_status
        );

        // Laporan ditolak: akun harus tetap aktif.
        $this->assertTrue(
            (bool) $s['member']->fresh()->is_active
        );

        $this->assertDatabaseHas('users', [
            'id' => $s['member']->id,
            'is_active' => true,
        ]);

        $this->assertTrue($s['bill']->fresh()->exists);
    }

    public function test_bill_payment_is_recorded_as_simulation(): void
    {
        $s = $this->makeScenario();

        $this->actingAs($s['member'])
            ->post(route('lansia.bills.pay-now', $s['bill']))
            ->assertSessionHas('success');

        $payment = Transaction::query()
            ->where('bill_id', $s['bill']->id)
            ->latest('id')
            ->firstOrFail();

        $this->assertSame('simulation', $payment->payment_mode);
        $this->assertSame('completed', $payment->status);

        $balance = Wallet::query()
            ->where('user_id', $s['member']->id)
            ->value('balance');

        $this->assertEquals(410_000, (float) $balance);
    }

    public function test_bill_needing_review_cannot_be_paid(): void
    {
        $s = $this->makeScenario();

        $s['bill']->forceFill([
            'schedule_status' => Bill::SCHEDULE_REVIEW,
            'schedule_note' => 'Jadwal perlu ditinjau.',
        ])->save();

        $this->actingAs($s['member'])
            ->post(route('lansia.bills.pay-now', $s['bill']))
            ->assertSessionHasErrors('amount');

        $this->assertSame(
            0,
            Transaction::query()
                ->where('bill_id', $s['bill']->id)
                ->count()
        );

        $balance = Wallet::query()
            ->where('user_id', $s['member']->id)
            ->value('balance');

        $this->assertEquals(500_000, (float) $balance);
    }

    public function test_deceased_member_transaction_cannot_be_approved_but_can_be_rejected(): void
    {
        $s = $this->makeScenario();
        $pending = $this->createPendingTransaction($s);

        $balanceBefore = (float) Wallet::query()
            ->where('user_id', $s['member']->id)
            ->value('balance');

        $service = app(LifeEventService::class);

        $report = $service->reportDeceased(
            $s['parent'],
            $s['member'],
            ['event_date' => now()->subDay()->toDateString()]
        );

        $service->verify($s['admin'], $report);

        $this->assertFalse(
            (bool) $s['member']->fresh()->is_active
        );

        $this->actingAs($s['parent'])
            ->put(route(
                'orang-tua.approval-center.approve',
                $pending['approval']
            ))
            ->assertSessionHas('error');

        $this->assertSame(
            'pending',
            $pending['transaction']->fresh()->status
        );

        $this->assertEquals(
            $balanceBefore,
            (float) Wallet::query()
                ->where('user_id', $s['member']->id)
                ->value('balance')
        );

        $this->actingAs($s['parent'])
            ->put(route(
                'orang-tua.approval-center.reject',
                $pending['approval']
            ))
            ->assertSessionHas('success');

        $this->assertSame(
            'rejected',
            $pending['transaction']->fresh()->status
        );
    }

    public function test_approval_cannot_deduct_balance_twice(): void
    {
        $s = $this->makeScenario();
        $pending = $this->createPendingTransaction($s, 150_000);

        $this->actingAs($s['parent'])
            ->put(route(
                'orang-tua.approval-center.approve',
                $pending['approval']
            ))
            ->assertSessionHas('success');

        $this->assertSame(
            'completed',
            $pending['transaction']->fresh()->status
        );

        $balanceAfterFirstApproval = (float) Wallet::query()
            ->where('user_id', $s['member']->id)
            ->value('balance');

        $this->assertEquals(350_000, $balanceAfterFirstApproval);

        // Persetujuan kedua tidak boleh mengurangi saldo lagi.
        $this->actingAs($s['parent'])
            ->put(route(
                'orang-tua.approval-center.approve',
                $pending['approval']
            ))
            ->assertSessionHas('error');

        $balanceAfterSecondAttempt = (float) Wallet::query()
            ->where('user_id', $s['member']->id)
            ->value('balance');

        $this->assertEquals(
            $balanceAfterFirstApproval,
            $balanceAfterSecondAttempt
        );
    }
}
