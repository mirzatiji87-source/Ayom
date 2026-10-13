<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LansiaSpendController extends Controller
{
    private const CATEGORIES = [
        'makanan',
        'pakaian',
        'belanja',
        'kesehatan',
        'transportasi',
        'lainnya',
    ];

    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = Auth::user();

        $wallet = $user->wallet;
        $wallet?->resetCountersIfNeeded();

        // Isi awal form dari perintah suara (opsional).
        $amount = (int) $request->query('amount', 0);
        $category = $request->query('category');

        $amount = (int) $request->query('amount', 0);
        $category = $request->query('category');
        $description = mb_substr((string) $request->query('description', ''), 0, 255);

        // Kategori valid dipakai apa adanya. Kalau datang dari suara tapi kategorinya
        // tidak dikenali, pakai "lainnya". Kalau halaman dibuka manual, default "makanan".
        if (in_array($category, self::CATEGORIES, true)) {
            $kategoriAwal = $category;
        } elseif ($amount > 0 || $description !== '') {
            $kategoriAwal = 'lainnya';
        } else {
            $kategoriAwal = 'makanan';
        }

        $prefill = [
            'amount' => $amount > 0 ? (string) $amount : '',
            'category' => $kategoriAwal,
            'description' => $description,
            'qris' => $request->boolean('qris'),
        ];

        return Inertia::render('Lansia/Spend', [
            'wallet' => $wallet,
            'prefill' => $prefill,
            'pendingExpenses' => $user->transactions()
                ->where('type', 'expense')
                ->where('status', 'pending')
                ->latest()
                ->limit(5)
                ->get(['id', 'category', 'amount', 'description', 'created_at']),
        ]);
    }
}
