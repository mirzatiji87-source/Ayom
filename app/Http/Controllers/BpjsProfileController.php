<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Bill;
use App\Models\BpjsProfile;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BpjsProfileController extends Controller
{
    /**
     * Ringkasan BPJS keluarga.
     * Nomor peserta lengkap tidak dikirim ke frontend.
     */
    public function index(Request $request): Response
    {
        $actor = $request->user();

        $members = User::query()
            ->where('family_id', $actor->family_id)
            ->whereIn('role', ['lansia', 'remaja', 'orang_tua'])
            ->orderBy('name')
            ->get(['id', 'name', 'role', 'life_status']);

        $memberIds = $members->pluck('id');

        $bills = Bill::query()
            ->with(['user:id,name,life_status', 'latestPayment'])
            ->where('category', 'bpjs')
            ->where('is_active', true)
            ->whereIn('user_id', $memberIds)
            ->orderBy('next_due_date')
            ->get()
            ->each(function (Bill $bill) {
                $bill->setAttribute(
                    'blocked_reason',
                    $bill->processBlockedReason()
                );
            });

        $history = Transaction::query()
            ->whereIn('bill_id', $bills->pluck('id'))
            ->where('type', 'bill_payment')
            ->latest()
            ->limit(30)
            ->get([
                'id',
                'bill_id',
                'user_id',
                'amount',
                'status',
                'payment_mode',
                'description',
                'created_at',
            ]);

        $profiles = BpjsProfile::query()
            ->whereIn('user_id', $memberIds)
            ->get()
            ->map(function (BpjsProfile $profile) {
                return [
                    'user_id' => $profile->user_id,
                    'bill_id' => $profile->bill_id,
                    'participant_name' => $profile->participant_name,
                    'masked_number' => $profile->maskedNumber(),
                    'relationship_to_head' => $profile->relationship_to_head,
                    'membership_class' => $profile->membership_class,
                    'segment' => $profile->segment,
                    'membership_status' => $profile->membership_status,
                    'monthly_contribution' => $profile->monthly_contribution,
                    'notes' => $profile->notes,
                    'last_verified_at' => $profile->last_verified_at,
                ];
            })
            ->values();

        return Inertia::render('OrangTua/BpjsOverview', [
            'members' => $members,
            'bills' => $bills,
            'history' => $history,
            'profiles' => $profiles,
            'paymentMode' => 'simulation',
            'notice' =>
            'Ayom bukan penyelenggara BPJS. Pembayaran di Ayom saat ini '
                . 'merupakan simulasi dompet internal dan belum membayar '
                . 'tagihan BPJS yang sebenarnya.',
            'official' => [
                'url' => config('ayom.bpjs.official_url'),
                'care_center' => config('ayom.bpjs.care_center'),
            ],
        ]);
    }

    /**
     * Membuat atau memperbarui profil BPJS anggota.
     */
    public function upsert(
        Request $request,
        User $user
    ): RedirectResponse {
        $actor = $request->user();

        abort_unless(
            $actor->isAdmin() || $actor->isGuardianOf($user),
            403,
            'Anda tidak berhak mengelola data anggota ini.'
        );

        if ($user->isDeceased()) {
            return back()->withErrors([
                'participant_number' =>
                'Anggota ini sudah ditandai meninggal di Ayom; '
                    . 'data BPJS tidak dapat diubah.',
            ]);
        }

        if ($user->family_id === null) {
            return back()->withErrors([
                'participant_name' =>
                'Anggota harus terhubung dengan keluarga.',
            ]);
        }

        $data = $request->validate([
            'participant_name' => [
                'nullable',
                'string',
                'max:255',
            ],
            'participant_number' => [
                'sometimes',
                'nullable',
                'regex:/^[0-9]{8,20}$/',
            ],
            'relationship_to_head' => [
                'nullable',
                'string',
                'max:50',
            ],
            'membership_class' => [
                'nullable',
                'string',
                'max:20',
            ],
            'segment' => [
                'nullable',
                'string',
                'max:50',
            ],
            'membership_status' => [
                'nullable',
                'string',
                'max:30',
            ],
            'monthly_contribution' => [
                'nullable',
                'numeric',
                'min:0',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:2000',
            ],
            'bill_id' => [
                'sometimes',
                'nullable',
                'integer',
            ],
        ], [
            'participant_number.regex' =>
            'Nomor peserta harus berupa angka sepanjang 8–20 digit.',
        ]);

        // Pastikan tagihan yang ditautkan milik anggota tersebut.
        if (
            array_key_exists('bill_id', $data)
            && $data['bill_id'] !== null
        ) {
            $validBill = Bill::query()
                ->whereKey($data['bill_id'])
                ->where('user_id', $user->id)
                ->where('category', 'bpjs')
                ->exists();

            if (! $validBill) {
                return back()->withErrors([
                    'bill_id' =>
                    'Tagihan BPJS tidak valid untuk anggota ini.',
                ]);
            }
        }

        DB::transaction(function () use ($data, $actor, $user) {
            $profile = BpjsProfile::query()->firstOrNew([
                'user_id' => $user->id,
            ]);

            $profile->family_id = $user->family_id;
            $profile->user_id = $user->id;

            // Kolom participant_name wajib diisi.
            $profile->participant_name =
                $data['participant_name']
                ?? $profile->participant_name
                ?? $user->name;

            $fields = [
                'participant_number',
                'relationship_to_head',
                'membership_class',
                'segment',
                'membership_status',
                'monthly_contribution',
                'notes',
            ];

            foreach ($fields as $field) {
                if (array_key_exists($field, $data)) {
                    $profile->{$field} = $data[$field];
                }
            }

            if (array_key_exists('bill_id', $data)) {
                $profile->bill_id = $data['bill_id'];
            }

            $profile->save();

            // Nomor peserta tidak dicatat dalam activity log.
            ActivityLog::create([
                'user_id' => $actor->id,
                'family_id' => $user->family_id,
                'action' => 'save_bpjs_profile',
                'subject_type' => User::class,
                'subject_id' => $user->id,
                'meta' => [],
            ]);
        });

        return back()->with(
            'success',
            'Data profil BPJS berhasil disimpan di Ayom.'
        );
    }
}
