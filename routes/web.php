<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\BillController;
use App\Http\Controllers\ExpenseChartController;
use App\Http\Controllers\GuardianViewController;
use App\Http\Controllers\LansiaDashboardController;
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

    // Redirect generik "/dashboard" -> dashboard sesuai role (dipakai default Breeze)
    Route::get('/dashboard', function () {
        return redirect(match (Auth::user()->role) {
            'admin' => route('admin.dashboard'),
            'orang_tua' => route('orang-tua.dashboard'),
            'lansia' => route('lansia.dashboard'),
            'remaja' => route('remaja.dashboard'),
        });
    })->name('dashboard');

    // ---------- ADMIN ----------
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('/families', [UserManagementController::class, 'families'])->name('families.index');
        Route::get('/families/{family}', [UserManagementController::class, 'showFamily'])->name('families.show');
    });

    // ---------- ADMIN + ORANG TUA (kelola dependent) ----------
    Route::middleware('role:admin,orang_tua')->group(function () {
        Route::post('/members/{user}/wallet/allocate', [WalletController::class, 'allocate'])
            ->name('wallet.allocate');
        Route::get('/users/create-dependent', [UserManagementController::class, 'create'])
            ->name('dependents.create');
        Route::post('/users', [UserManagementController::class, 'store'])
            ->name('dependents.store');
        Route::put('/users/{user}', [UserManagementController::class, 'update'])
            ->name('dependents.update');
        Route::delete('/users/{user}', [UserManagementController::class, 'destroy'])
            ->name('dependents.destroy');

        Route::get('/wallets/{user}/limit', [WalletController::class, 'edit'])->name('wallet.limit.edit');
        Route::put('/wallets/{user}/limit', [WalletController::class, 'setLimit'])->name('wallet.limit.update');

        Route::post('/bills', [BillController::class, 'store'])->name('bills.store');
        Route::put('/bills/{bill}', [BillController::class, 'update'])->name('bills.update');
        Route::delete('/bills/{bill}', [BillController::class, 'destroy'])->name('bills.destroy');

        Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
        Route::put('/tasks/{task}/approve', [TaskController::class, 'approve'])->name('tasks.approve');
        Route::put('/tasks/{task}/reject', [TaskController::class, 'reject'])->name('tasks.reject');
    });

    // ---------- ORANG TUA ----------
    Route::middleware('role:orang_tua')->prefix('orang-tua')->name('orang-tua.')->group(function () {
        Route::post('/top-up/verify', [WalletController::class, 'verifyTopUpStatus'])
            ->name('top-up.verify');
        Route::get('/dashboard', [OrangTuaDashboardController::class, 'index'])->name('dashboard');
        Route::get('/guardian-view', [GuardianViewController::class, 'index'])->name('guardian-view');
        Route::get('/guardian-view/{user}', [GuardianViewController::class, 'show'])->name('guardian-view.show');

        Route::get('/top-up', [WalletController::class, 'topUpForm'])->name('top-up.form');
        Route::post('/top-up', [WalletController::class, 'topUp'])->name('top-up.store');

        Route::get('/approval-center', [ApprovalController::class, 'index'])->name('approval-center');
        Route::get('/approval-center/pending-count', [ApprovalController::class, 'pendingCount'])
            ->name('approval-center.pending-count');
        Route::put('/approval-center/{approvalRequest}/approve', [ApprovalController::class, 'approve'])
            ->name('approval-center.approve');
        Route::put('/approval-center/{approvalRequest}/reject', [ApprovalController::class, 'reject'])
            ->name('approval-center.reject');
    });

    // ---------- LANSIA ----------
    Route::middleware('role:lansia')->prefix('lansia')->name('lansia.')->group(function () {
        Route::get('/dashboard', [LansiaDashboardController::class, 'index'])->name('dashboard');
        Route::get('/bills', [BillController::class, 'myBills'])->name('bills.index');
        Route::post('/bills/{bill}/pay-now', [BillController::class, 'payNow'])->name('bills.pay-now');
    });

    // ---------- REMAJA ----------
    Route::middleware('role:remaja')->prefix('remaja')->name('remaja.')->group(function () {
        Route::get('/dashboard', [RemajaDashboardController::class, 'index'])->name('dashboard');
        Route::get('/tasks', [TaskController::class, 'myTasks'])->name('tasks.index');
        Route::put('/tasks/{task}/submit', [TaskController::class, 'submit'])->name('tasks.submit');
        Route::get('/expense-summary', [ExpenseChartController::class, 'summary'])->name('expense-summary');
    });

    // ---------- SEMUA ROLE (lansia & remaja pakai wallet sendiri) ----------
    Route::middleware('role:lansia,remaja')->group(function () {
        Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
        Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    });
});

// Midtrans Notification Webhook (di luar middleware auth)
Route::post('/midtrans/notification', [WalletController::class, 'midtransNotification'])
    ->name('midtrans.notification');

require __DIR__ . '/auth.php';