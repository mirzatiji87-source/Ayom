<?php

namespace App\Http\Controllers;

use App\Models\ContactRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ContactRequestController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user && $user->isLansia(), 403);

        abort_if(
            !$user->family_id,
            422,
            'Keluarga belum terdaftar.'
        );

        $contactRequest = ContactRequest::where('family_id', $user->family_id)
            ->where('requested_by', $user->id)
            ->whereNull('seen_at')
            ->latest()
            ->first();

        if (!$contactRequest) {
            ContactRequest::create([
                'family_id' => $user->family_id,
                'requested_by' => $user->id,
            ]);
        }

        return redirect()->back();
    }

    public function seen(
        Request $request,
        ContactRequest $contactRequest
    ): RedirectResponse {
        $user = $request->user();

        abort_unless($user && $user->isOrangTua(), 403);

        abort_unless(
            $user->family_id &&
            $user->family_id === $contactRequest->family_id,
            403
        );

        $contactRequest->update([
            'seen_at' => now(),
        ]);

        return redirect()->back();
    }
}