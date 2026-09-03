import { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';

import RemajaLayout from '@/Layouts/RemajaLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
}

const STATUS_META = {
    open: { label: 'Terbuka', className: 'bg-blue-100 text-blue-700' },
    submitted: { label: 'Menunggu Persetujuan', className: 'bg-amber-100 text-amber-700' },
    approved: { label: 'Disetujui', className: 'bg-green-100 text-green-700' },
    rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-700' },
};

const TABS = [
    { value: 'all', label: 'Semua' },
    { value: 'open', label: 'Terbuka' },
    { value: 'submitted', label: 'Menunggu' },
    { value: 'approved', label: 'Disetujui' },
    { value: 'rejected', label: 'Ditolak' },
];

function TaskCard({ task, onSubmit, submitting }) {
    const meta = STATUS_META[task.status] ?? { label: task.status, className: 'bg-slate-100 text-slate-600' };

    return (
        <Card>
            <CardContent className="flex items-start justify-between gap-4 py-4">
                <div>
                    <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800">{task.title}</h3>
                        <Badge className={meta.className}>{meta.label}</Badge>
                    </div>
                    {task.description && (
                        <p className="mb-2 text-sm text-slate-500">{task.description}</p>
                    )}
                    <p className="text-sm font-medium text-slate-700">
                        Reward: {formatRupiah(task.reward_amount)}
                    </p>
                    {task.due_date && (
                        <p className="text-xs text-slate-400">Tenggat: {task.due_date}</p>
                    )}
                    {task.status === 'rejected' && task.rejection_reason && (
                        <p className="mt-1 text-xs text-red-500">Alasan ditolak: {task.rejection_reason}</p>
                    )}
                </div>

                {task.status === 'open' && (
                    <Button size="sm" disabled={submitting} onClick={() => onSubmit(task)}>
                        {submitting ? 'Mengirim...' : 'Tandai Selesai'}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

export default function Tasks({ tasks = [] }) {
    const [activeTab, setActiveTab] = useState('all');
    const [submittingId, setSubmittingId] = useState(null);

    const filteredTasks = useMemo(() => {
        if (activeTab === 'all') return tasks;
        return tasks.filter((task) => task.status === activeTab);
    }, [tasks, activeTab]);

    function handleSubmit(task) {
        setSubmittingId(task.id);
        router.put(
            route('remaja.tasks.submit', task.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setSubmittingId(null),
            },
        );
    }

    return (
        <RemajaLayout>
            <Head title="Misi Saya" />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Misi Saya</h1>
                <p className="text-sm text-slate-500">
                    Selesaikan misi untuk mendapatkan uang saku tambahan.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    {TABS.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {TABS.map((tab) => (
                    <TabsContent key={tab.value} value={tab.value} className="mt-4 space-y-3">
                        {filteredTasks.length ? (
                            filteredTasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onSubmit={handleSubmit}
                                    submitting={submittingId === task.id}
                                />
                            ))
                        ) : (
                            <p className="py-8 text-center text-sm text-slate-400">
                                Tidak ada misi pada kategori ini.
                            </p>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </RemajaLayout>
    );
}