<?php

namespace App\Http\Middleware;

use App\Models\MemberStatusReport;
use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Task;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),

            'auth' => [
                'user' => $user,
            ],

            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],

            'pendingTasks' => fn() => $user
                && $user->role === 'orang_tua'
                && $user->family_id
                ? Task::inFamily($user->family_id)
                ->submitted()
                ->count()
                : 0,
            'pendingStatusReportsCount' => fn() =>
            $request->user()?->role === 'admin'
                ? MemberStatusReport::query()
                ->where(
                    'verification_status',
                    MemberStatusReport::STATUS_PENDING
                )
                ->count()
                : 0,
        ];
    }
}
