import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

/**
 * Bar shimmer tipis di paling atas konten, muncul selama Inertia
 * lagi proses navigasi (router.visit ke halaman lain). Ini kasih
 * sinyal visual "lagi loading" yang lebih hidup daripada blank/diem,
 * mirip top-bar loading di app native (Gojek, dsb).
 */
export default function RouteLoadingBar() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const removeStart = router.on('start', () => setLoading(true));
        const removeFinish = router.on('finish', () => setLoading(false));

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    if (!loading) return null;

    return (
        <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-emerald-100">
            <div className="ayom-shimmer h-full w-1/3 bg-gradient-to-r from-emerald-400 via-emerald-600 to-teal-500" />

            <style>{`
                @keyframes ayom-shimmer-move {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                }
                .ayom-shimmer {
                    animation: ayom-shimmer-move 0.9s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}