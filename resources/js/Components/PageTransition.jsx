// resources/js/Components/PageTransition.jsx

import { usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Transisi ala native app (mirip Gojek/Tokopedia): halaman baru masuk
 * dari kanan sambil fade-in + sedikit scale up, halaman lama keluar
 * ke kiri sambil fade-out. Easing pakai kurva "ease-out" tegas biar
 * kerasa snappy, bukan lambat/mendayu.
 */
export default function PageTransition({ children }) {
    const { url } = usePage();

    return (
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
                key={url}
                initial={{ opacity: 0, x: 28, scale: 0.99 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.99 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}