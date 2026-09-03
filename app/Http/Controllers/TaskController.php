<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Models\ActivityLog;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function store(StoreTaskRequest $request): RedirectResponse
    {
        /** @var User $actor */
        $actor = $request->user();

        $task = Task::create($request->validated() + [
            'family_id' => $actor->family_id,
            'created_by' => $actor->id,
        ]);

        ActivityLog::record('create_task', $actor, $task);

        return redirect()->back()->with('success', 'Misi berhasil dibuat.');
    }

    public function myTasks(): Response
    {
        /** @var User $actor */
        $actor = Auth::user();

        return Inertia::render('Remaja/Tasks', [
            'tasks' => $actor->tasksAssigned()
                ->latest()
                ->get(),
        ]);
    }

    public function submit(Task $task): RedirectResponse
    {
        abort_unless($task->assigned_to === Auth::id(), 403);

        abort_unless(
            $task->status === 'open',
            422,
            'Misi ini sudah tidak berstatus open.'
        );

        $task->submit();

        return redirect()->back()->with(
            'success',
            'Misi ditandai selesai, menunggu persetujuan.'
        );
    }

    public function approve(Task $task): RedirectResponse
    {
        /** @var User $actor */
        $actor = Auth::user();

        $this->authorizeOverTask($task);

        abort_unless(
            $task->status === 'submitted',
            422,
            'Misi belum disubmit.'
        );

        $task->approve($actor);

        ActivityLog::record(
            'approve_task',
            $actor,
            $task
        );

        return redirect()->back()->with(
            'success',
            'Misi disetujui, reward dikirim.'
        );
    }

    public function reject(Task $task): RedirectResponse
    {
        /** @var User $actor */
        $actor = Auth::user();

        $this->authorizeOverTask($task);

        $task->reject(
            $actor,
            request('reason')
        );

        return redirect()->back()->with(
            'success',
            'Misi ditolak.'
        );
    }

    protected function authorizeOverTask(Task $task): void
    {
        /** @var User $actor */
        $actor = Auth::user();

        abort_unless(
            $actor->isAdmin() ||
            $actor->isGuardianOf($task->assignee),
            403,
            'Anda tidak berhak meninjau misi ini.'
        );
    }
}