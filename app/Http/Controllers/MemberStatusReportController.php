<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\FollowUpItem;
use App\Models\MemberStatusReport;
use App\Models\User;
use App\Services\LifeEventService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MemberStatusReportController extends Controller
{
    public function __construct(
        protected LifeEventService $service
    ) {}

    /**
     * Daftar laporan dan anggota yang bisa dilaporkan.
     */
    public function index(Request $request): Response
    {
        $actor = $request->user();

        $reports = MemberStatusReport::query()
            ->forFamily($actor->family_id)
            ->with([
                'reporter:id,name',
                'subject:id,name,role,life_status',
            ])
            ->latest()
            ->get();

        $members = User::query()
            ->where('family_id', $actor->family_id)
            ->where('id', '!=', $actor->id)
            ->where('life_status', '!=', 'deceased')
            ->whereIn('role', ['lansia', 'remaja', 'orang_tua'])
            ->orderBy('name')
            ->get(['id', 'name', 'role']);

        return Inertia::render('OrangTua/StatusReports', [
            'reports' => $reports,
            'members' => $members,
        ]);
    }

    /**
     * Membuat laporan perubahan status anggota.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'user_id' => [
                'required',
                'integer',
                'exists:users,id',
            ],
            'event_date' => [
                'required',
                'date',
                'before_or_equal:today',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'evidence' => [
                'nullable',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:2048',
            ],
        ]);

        $subject = User::query()->findOrFail($data['user_id']);

        $this->authorize(
            'report',
            [MemberStatusReport::class, $subject]
        );

        // Simpan bukti di disk privat, bukan direktori publik.
        $path = $request->file('evidence')
            ?->store(
                "life-events/{$subject->family_id}",
                'local'
            );

        try {
            $report = $this->service->reportDeceased(
                $request->user(),
                $subject,
                [
                    'event_date' => $data['event_date'],
                    'notes' => $data['notes'] ?? null,
                    'evidence_path' => $path,
                ]
            );
        } catch (\Throwable $exception) {
            if ($path) {
                Storage::disk('local')->delete($path);
            }

            throw $exception;
        }

        return redirect()
            ->route('orang-tua.status-reports.show', $report)
            ->with(
                'success',
                'Laporan terkirim dan menunggu verifikasi admin. '
                    . 'Laporan ini belum mengubah status kepesertaan BPJS.'
            );
    }

    /**
     * Detail laporan untuk keluarga.
     */
    public function show(
        MemberStatusReport $report
    ): Response {
        $this->authorize('view', $report);

        return Inertia::render(
            'OrangTua/StatusReportShow',
            $this->service->detail($report)
        );
    }

    /**
     * Catatan keluarga tentang progres pelaporan BPJS.
     */
    public function updateBpjs(
        Request $request,
        MemberStatusReport $report
    ): RedirectResponse {
        $this->authorize('manage', $report);

        $data = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    MemberStatusReport::BPJS_REPORTED,
                    MemberStatusReport::BPJS_CONFIRMED,
                ]),
            ],
            'bpjs_reference' => [
                'nullable',
                'string',
                'max:100',
            ],
        ]);

        $this->service->updateBpjsStatus(
            $request->user(),
            $report,
            $data['status'],
            $data['bpjs_reference'] ?? null
        );

        return back()->with(
            'success',
            'Progres pelaporan BPJS dicatat. Ini merupakan catatan '
                . 'keluarga, bukan konfirmasi dari sistem BPJS.'
        );
    }

    /**
     * Tandai item tindak lanjut sebagai selesai.
     */
    public function completeFollowUp(
        Request $request,
        FollowUpItem $item
    ): RedirectResponse {
        abort_unless($item->memberStatusReport, 404);

        $this->authorize('manage', $item->memberStatusReport);

        $data = $request->validate([
            'completion_note' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $this->service->completeFollowUp(
            $request->user(),
            $item,
            $data['completion_note'] ?? null
        );

        return back()->with(
            'success',
            'Item tindak lanjut ditandai selesai.'
        );
    }

    /**
     * Keputusan keluarga mengenai jadwal tagihan.
     */
    public function resolveBill(
        Request $request,
        Bill $bill
    ): RedirectResponse {
        $actor = $request->user();

        $bill->loadMissing('user');

        abort_unless(
            $bill->user
                && (
                    $actor->isAdmin()
                    || $actor->isGuardianOf($bill->user)
                ),
            403,
            'Anda tidak berhak mengelola tagihan ini.'
        );

        $data = $request->validate([
            'decision' => [
                'required',
                Rule::in(['dihentikan', 'lanjut']),
            ],
            'note' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $this->service->resolveBillSchedule(
            $actor,
            $bill,
            $data['decision'],
            $data['note'] ?? null
        );

        return back()->with(
            'success',
            $data['decision'] === 'dihentikan'
                ? 'Jadwal tagihan dihentikan. Riwayat pembayaran tetap tersimpan.'
                : 'Jadwal tagihan dilanjutkan.'
        );
    }

    /**
     * Unduh bukti laporan bagi admin atau orang tua keluarga terkait.
     */

    /**
     * Unduh bukti laporan bagi admin atau orang tua keluarga terkait.
     */
    public function evidence(MemberStatusReport $report)
    {
        $this->authorize('view', $report);

        $disk = Storage::disk('local');

        abort_unless(
            filled($report->evidence_path)
                && $disk->exists($report->evidence_path),
            404
        );

        $stream = $disk->readStream($report->evidence_path);

        abort_unless(is_resource($stream), 404);

        $extension = strtolower(
            pathinfo($report->evidence_path, PATHINFO_EXTENSION)
        );

        return response()->streamDownload(
            static function () use ($stream): void {
                try {
                    fpassthru($stream);
                } finally {
                    if (is_resource($stream)) {
                        fclose($stream);
                    }
                }
            },
            "bukti-laporan-{$report->id}.{$extension}"
        );
    }
}
