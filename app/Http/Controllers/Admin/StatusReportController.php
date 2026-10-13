<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MemberStatusReport;
use App\Services\LifeEventService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StatusReportController extends Controller
{
    public function __construct(
        protected LifeEventService $service
    ) {
    }

    /**
     * Daftar laporan perubahan status anggota.
     */
    public function index(): Response
    {
        $reports = MemberStatusReport::query()
            ->with([
                'family:id,name',
                'reporter:id,name',
                'subject:id,name,role,life_status',
            ])
            ->orderByRaw(
                "CASE WHEN verification_status = 'pending' THEN 0 ELSE 1 END"
            )
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/StatusReports', [
            'reports' => $reports,
        ]);
    }

    /**
     * Detail laporan untuk admin.
     */
    public function show(
        Request $request,
        MemberStatusReport $report
    ): Response {
        $this->authorize('view', $report);

        $data = $this->service->detail($report);

        $data['canVerify'] =
            $report->verification_status
                === MemberStatusReport::STATUS_PENDING
            && (int) $report->reported_by
                !== (int) $request->user()->id;

        return Inertia::render(
            'Admin/StatusReportShow',
            $data
        );
    }

    /**
     * Verifikasi laporan.
     * Hanya admin yang boleh, dan pelapor tidak boleh memverifikasi
     * laporannya sendiri.
     */
    public function verify(
        Request $request,
        MemberStatusReport $report
    ): RedirectResponse {
        $this->authorize('verify', $report);

        $data = $request->validate([
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->service->verify(
            $request->user(),
            $report,
            $data['note'] ?? null
        );

        return redirect()
            ->route('admin.status-reports.show', $report)
            ->with(
                'success',
                'Laporan terverifikasi di Ayom. Ini belum mengubah '
                . 'status kepesertaan BPJS; keluarga perlu melapor '
                . 'melalui kanal resmi BPJS.'
            );
    }

    /**
     * Menolak laporan yang tidak dapat diverifikasi.
     */
    public function reject(
        Request $request,
        MemberStatusReport $report
    ): RedirectResponse {
        $this->authorize('verify', $report);

        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->service->reject(
            $request->user(),
            $report,
            $data['reason'] ?? null
        );

        return redirect()
            ->route('admin.status-reports.show', $report)
            ->with('success', 'Laporan ditolak.');
    }
}
