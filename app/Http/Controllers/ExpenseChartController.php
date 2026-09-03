<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ExpenseChartController extends Controller
{
    public function summary(): JsonResponse
    {
        $summary = Transaction::where('user_id', Auth::id())
            ->expenses()
            ->selectRaw('category, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get();

        return response()->json($summary);
    }
}