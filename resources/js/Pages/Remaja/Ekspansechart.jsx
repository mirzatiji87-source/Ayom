import { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import RemajaLayout from '@/Layouts/RemajaLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import {
    UtensilsCrossed,
    Bus,
    Gamepad2,
    Receipt,
    HeartPulse,
    GraduationCap,
    MoreHorizontal,
    Wallet,
} from 'lucide-react';

// Peta kategori -> label, warna, dan ikon (samakan dengan enum kolom `category` di tabel transactions)
const CATEGORY_META = {
    makanan: { label: 'Makanan', color: '#f97316', icon: UtensilsCrossed },
    transportasi: { label: 'Transportasi', color: '#3b82f6', icon: Bus },
    hiburan: { label: 'Hiburan', color: '#a855f7', icon: Gamepad2 },
    tagihan: { label: 'Tagihan', color: '#ef4444', icon: Receipt },
    kesehatan: { label: 'Kesehatan', color: '#22c55e', icon: HeartPulse },
    pendidikan: { label: 'Pendidikan', color: '#06b6d4', icon: GraduationCap },
    lainnya: { label: 'Lainnya', color: '#6b7280', icon: MoreHorizontal },
};

const PERIODS = [
    { value: 'this_month', label: 'Bulan Ini' },
    { value: 'last_month', label: 'Bulan Lalu' },
    { value: 'all', label: 'Semua' },
];

function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

export default function ExpenseChart({ categoryTotals = [], period = 'this_month' }) {
    const [chartView, setChartView] = useState('pie');
    const [activePeriod, setActivePeriod] = useState(period);

    // Normalisasi data dari backend + urutkan dari pengeluaran terbesar
    const data = useMemo(() => {
        return [...categoryTotals]
            .map((item) => ({
                category: item.category,
                total: Number(item.total),
                meta: CATEGORY_META[item.category] ?? CATEGORY_META.lainnya,
            }))
            .sort((a, b) => b.total - a.total);
    }, [categoryTotals]);

    const totalExpense = useMemo(
        () => data.reduce((sum, item) => sum + item.total, 0),
        [data]
    );

    const chartData = data.map((item) => ({
        name: item.meta.label,
        value: item.total,
        color: item.meta.color,
    }));

    const handlePeriodChange = (value) => {
        setActivePeriod(value);
        router.get(
            route('remaja.expense-summary'),
            { period: value },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    return (
        <RemajaLayout>
            <Head title="Ringkasan Pengeluaran" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Ringkasan Pengeluaran</h1>
                        <p className="text-sm text-muted-foreground">
                            Pengeluaranmu otomatis dikelompokkan per kategori.
                        </p>
                    </div>

                    <Tabs value={activePeriod} onValueChange={handlePeriodChange}>
                        <TabsList>
                            {PERIODS.map((p) => (
                                <TabsTrigger key={p.value} value={p.value}>
                                    {p.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>

                {/* Kartu total pengeluaran */}
                <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                        <div className="rounded-full bg-primary/10 p-3">
                            <Wallet className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
                            <p className="text-3xl font-bold">{formatRupiah(totalExpense)}</p>
                        </div>
                    </CardContent>
                </Card>

                {data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                            <MoreHorizontal className="h-10 w-10 text-muted-foreground" />
                            <p className="font-medium">Belum ada transaksi pengeluaran</p>
                            <p className="text-sm text-muted-foreground">
                                Chart akan otomatis terisi setelah kamu mulai belanja.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                        {/* Chart */}
                        <Card className="lg:col-span-3">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Grafik per Kategori</CardTitle>
                                <Tabs value={chartView} onValueChange={setChartView}>
                                    <TabsList>
                                        <TabsTrigger value="pie">Pie</TabsTrigger>
                                        <TabsTrigger value="bar">Bar</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={320}>
                                    {chartView === 'pie' ? (
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={70}
                                                outerRadius={110}
                                                paddingAngle={2}
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={index} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => formatRupiah(value)} />
                                            <Legend />
                                        </PieChart>
                                    ) : (
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                            <YAxis
                                                tickFormatter={(v) => `${Math.round(v / 1000)}rb`}
                                                tick={{ fontSize: 12 }}
                                            />
                                            <Tooltip formatter={(value) => formatRupiah(value)} />
                                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={index} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Rincian per kategori */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Rincian Kategori</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {data.map((item) => {
                                    const Icon = item.meta.icon;
                                    const percentage = totalExpense
                                        ? Math.round((item.total / totalExpense) * 100)
                                        : 0;

                                    return (
                                        <div key={item.category} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="flex h-8 w-8 items-center justify-center rounded-full"
                                                        style={{ backgroundColor: `${item.meta.color}22` }}
                                                    >
                                                        <Icon
                                                            className="h-4 w-4"
                                                            style={{ color: item.meta.color }}
                                                        />
                                                    </span>
                                                    <span className="text-sm font-medium">
                                                        {item.meta.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold">
                                                        {formatRupiah(item.total)}
                                                    </span>
                                                    <Badge variant="secondary">{percentage}%</Badge>
                                                </div>
                                            </div>
                                            <Progress
                                                value={percentage}
                                                className="h-2"
                                                style={{ '--progress-color': item.meta.color }}
                                            />
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </RemajaLayout>
    );
}