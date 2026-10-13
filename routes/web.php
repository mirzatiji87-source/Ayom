<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\StatusReportController as AdminStatusReportController;
use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\BillController;
use App\Http\Controllers\BpjsProfileController;
use App\Http\Controllers\ContactRequestController;
use App\Http\Controllers\ExpenseChartController;
use App\Http\Controllers\GuardianViewController;
use App\Http\Controllers\LansiaDashboardController;
use App\Http\Controllers\LansiaSpendController;
use App\Http\Controllers\MemberStatusReportController;
use App\Http\Controllers\OrangTuaDashboardController;
use App\Http\Controllers\RemajaDashboardController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => Inertia::render('Welcome'))->name('home');

Route::middleware('auth')->group(function () {

    // ---------- DASHBOARD SESUAI ROLE ----------
    Route::get('/dashboard', function () {
        return redirect(match (Auth::user()->role) {
            'admin' => route('admin.dashboard'),
            'orang_tua' => route('orang-tua.dashboard'),
            'lansia' => route('lansia.dashboard'),
            'remaja' => route('remaja.dashboard'),
        });
    })->name('dashboard');

    // ---------- ADMIN ----------
    Route::middleware('role:admin')
        ->prefix('admin')
        ->name('admin.')
        ->group(function () {
            Route::get(
                '/dashboard',
                [AdminDashboardController::class, 'index']
            )->name('dashboard');

            Route::get(
                '/families',
                [UserManagementController::class, 'families']
            )->name('families.index');

            Route::get(
                '/families/{family}',
                [UserManagementController::class, 'showFamily']
            )->name('families.show');
            Route::put(
                '/members/{user}/reactivate',
                [UserManagementController::class, 'reactivate']
            )->name('members.reactivate');

            Route::delete(
                '/members/{user}/permanent',
                [UserManagementController::class, 'forceDestroy']
            )->name('members.force-destroy');

            Route::get(
                '/laporan-status',
                [AdminStatusReportController::class, 'index']
            )->name('status-reports.index');

            Route::get(
                '/laporan-status/{report}',
                [AdminStatusReportController::class, 'show']
            )->name('status-reports.show');

            Route::put(
                '/laporan-status/{report}/verifikasi',
                [AdminStatusReportController::class, 'verify']
            )->name('status-reports.verify');

            Route::put(
                '/laporan-status/{report}/tolak',
                [AdminStatusReportController::class, 'reject']
            )->name('status-reports.reject');
        });

    // ---------- ADMIN + ORANG TUA ----------
    Route::middleware('role:admin,orang_tua')->group(function () {
        Route::post(
            '/members/{user}/wallet/allocate',
            [WalletController::class, 'allocate']
        )->name('wallet.allocate');

        Route::get(
            '/users/create-dependent',
            [UserManagementController::class, 'create']
        )->name('dependents.create');

        Route::post(
            '/users',
            [UserManagementController::class, 'store']
        )->name('dependents.store');

        Route::put(
            '/users/{user}',
            [UserManagementController::class, 'update']
        )->name('dependents.update');

        Route::delete(
            '/users/{user}',
            [UserManagementController::class, 'destroy']
        )->name('dependents.destroy');

        Route::get(
            '/wallets/{user}/limit',
            [WalletController::class, 'edit']
        )->name('wallet.limit.edit');

        Route::put(
            '/wallets/{user}/limit',
            [WalletController::class, 'setLimit']
        )->name('wallet.limit.update');

        Route::post(
            '/bills',
            [BillController::class, 'store']
        )->name('bills.store');

        Route::put(
            '/bills/{bill}',
            [BillController::class, 'update']
        )->name('bills.update');

        Route::delete(
            '/bills/{bill}',
            [BillController::class, 'destroy']
        )->name('bills.destroy');

        // Profil BPJS anggota dan dokumen laporan.
        Route::put(
            '/members/{user}/bpjs',
            [BpjsProfileController::class, 'upsert']
        )->name('bpjs.upsert');

        Route::get(
            '/laporan-status/{report}/bukti',
            [MemberStatusReportController::class, 'evidence']
        )->name('status-reports.evidence');

        // Pengelolaan misi.
        Route::post(
            '/tasks',
            [TaskController::class, 'store']
        )->name('tasks.store');

        Route::put(
            '/tasks/{task}/approve',
            [TaskController::class, 'approve']
        )->name('tasks.approve');

        Route::put(
            '/tasks/{task}/reject',
            [TaskController::class, 'reject']
        )->name('tasks.reject');
    });

    // ---------- ORANG TUA ----------
    Route::middleware('role:orang_tua')
        ->prefix('orang-tua')
        ->name('orang-tua.')
        ->group(function () {
            Route::get(
                '/tagihan-saya',
                [BillController::class, 'myBillsOrangTua']
            )->name('bills.mine');

            Route::post(
                '/tagihan-saya/{bill}/bayar',
                [BillController::class, 'payNow']
            )->name('bills.pay-now');

            Route::post(
                '/top-up/verify',
                [WalletController::class, 'verifyTopUpStatus']
            )->name('top-up.verify');

            Route::get(
                '/dashboard',
                [OrangTuaDashboardController::class, 'index']
            )->name('dashboard');

            Route::put(
                '/contact-requests/{contactRequest}/seen',
                [ContactRequestController::class, 'seen']
            )->name('contact-requests.seen');

            Route::get(
                '/guardian-view',
                [GuardianViewController::class, 'index']
            )->name('guardian-view');

            Route::get(
                '/guardian-view/{user}',
                [GuardianViewController::class, 'show']
            )->name('guardian-view.show');

            Route::get(
                '/top-up',
                [WalletController::class, 'topUpForm']
            )->name('top-up.form');

            Route::post(
                '/top-up',
                [WalletController::class, 'topUp']
            )->name('top-up.store');

            Route::get(
                '/misi',
                [TaskController::class, 'familyIndex']
            )->name('tasks.index');

            // Approval Center.
            Route::get(
                '/approval-center',
                [ApprovalController::class, 'index']
            )->name('approval-center');

            Route::get(
                '/approval-center/pending-count',
                [ApprovalController::class, 'pendingCount']
            )->name('approval-center.pending-count');

            Route::put(
                '/approval-center/{approvalRequest}/approve',
                [ApprovalController::class, 'approve']
            )->name('approval-center.approve');

            Route::put(
                '/approval-center/{approvalRequest}/reject',
                [ApprovalController::class, 'reject']
            )->name('approval-center.reject');

            // Ringkasan BPJS keluarga.
            Route::get(
                '/bpjs',
                [BpjsProfileController::class, 'index']
            )->name('bpjs.index');

            // Laporan perubahan status anggota keluarga.
            Route::get(
                '/laporan-status',
                [MemberStatusReportController::class, 'index']
            )->name('status-reports.index');

            Route::post(
                '/laporan-status',
                [MemberStatusReportController::class, 'store']
            )
                ->middleware('throttle:10,1')
                ->name('status-reports.store');

            Route::get(
                '/laporan-status/{report}',
                [MemberStatusReportController::class, 'show']
            )->name('status-reports.show');

            Route::put(
                '/laporan-status/{report}/bpjs',
                [MemberStatusReportController::class, 'updateBpjs']
            )->name('status-reports.bpjs');

            Route::put(
                '/tindak-lanjut/{item}/selesai',
                [MemberStatusReportController::class, 'completeFollowUp']
            )->name('follow-ups.complete');

            Route::put(
                '/tagihan/{bill}/jadwal',
                [MemberStatusReportController::class, 'resolveBill']
            )->name('bills.schedule');
        });

    // ---------- LANSIA ----------
    Route::middleware('role:lansia')
        ->prefix('lansia')
        ->name('lansia.')
        ->group(function () {
            Route::get(
                '/dashboard',
                [LansiaDashboardController::class, 'index']
            )->name('dashboard');

            Route::post(
                '/contact-requests',
                [ContactRequestController::class, 'store']
            )
                ->middleware('throttle:6,1')
                ->name('contact-requests.store');

            Route::get(
                '/bills',
                [BillController::class, 'myBills']
            )->name('bills.index');

            Route::post(
                '/bills/{bill}/pay-now',
                [BillController::class, 'payNow']
            )->name('bills.pay-now');

            // Halaman belanja lansia.
            Route::get(
                '/belanja',
                [LansiaSpendController::class, 'index']
            )->name('spend');
        });

    // ---------- REMAJA ----------
    Route::middleware('role:remaja')
        ->prefix('remaja')
        ->name('remaja.')
        ->group(function () {
            Route::get(
                '/dashboard',
                [RemajaDashboardController::class, 'index']
            )->name('dashboard');

            Route::get(
                '/tasks',
                [TaskController::class, 'myTasks']
            )->name('tasks.index');

            Route::put(
                '/tasks/{task}/submit',
                [TaskController::class, 'submit']
            )->name('tasks.submit');

            Route::get(
                '/expense-summary',
                [ExpenseChartController::class, 'summary']
            )->name('expense-summary');

            Route::get(
                '/jajan',
                [RemajaDashboardController::class, 'spend']
            )->name('spend');
        });

    // ---------- TRANSAKSI LANSIA + REMAJA ----------
    Route::middleware('role:lansia,remaja')->group(function () {
        Route::post(
            '/transactions',
            [TransactionController::class, 'store']
        )->name('transactions.store');

        Route::get(
            '/transactions',
            [TransactionController::class, 'index']
        )->name('transactions.index');
    });
});

// ---------- MIDTRANS WEBHOOK ----------
Route::post(
    '/midtrans/notification',
    [WalletController::class, 'midtransNotification']
)->name('midtrans.notification');

require __DIR__ . '/auth.php';
