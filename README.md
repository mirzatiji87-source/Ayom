# Ayom

**Lansia dilindungi, orang tua mengawasi, remaja diedukasi.**

Ayom adalah ekosistem finansial keluarga lintas generasi yang menyatukan Lansia, Orang Tua, dan Remaja dalam satu wallet keluarga — dengan pengalaman yang dirancang khusus untuk kebutuhan masing-masing peran.

## Latar Belakang

Lansia rentan jadi korban penipuan finansial dan kesulitan mengoperasikan aplikasi keuangan konvensional. Orang tua butuh cara untuk mengawasi arus kas keluarga tanpa terkesan mengontrol berlebihan. Remaja butuh ruang belajar mengelola uang tanpa risiko finansial nyata. Ayom menjembatani ketiga kebutuhan ini dalam satu platform.

## Fitur Utama

### 👵 Lansia (Senior First)
- **Voice-First Navigation** — navigasi & transaksi berbasis perintah suara Bahasa Indonesia
- **Two-Factor Family Approval** — transaksi di atas ambang tertentu wajib disetujui orang tua (anti-scam)
- **Auto-Pilot Bills & Routine Reminder** — pengingat & pembayaran tagihan rutin (listrik, air, BPJS, obat)
- **Simple Voice Checkout** — belanja harian cukup dengan suara

### 👨‍👩‍👧 Orang Tua (Guardian & Cashflow Control)
- **Guardian View** — pantau transparan arus kas lansia & remaja
- **Top-Up & Limit Setting** — atur batas pengeluaran harian/bulanan, isi saldo keluarga terpusat
- **Approval Center** — setujui/tolak transaksi mencurigakan dari HP kapan saja

### 🧑‍🎓 Remaja (Smart Pocket & Task-Based Allowance)
- **Uang Saku Berbasis Misi** — dapat tambahan uang saku dengan menyelesaikan tugas rumah tangga
- **Pencatatan Otomatis** — grafik pengeluaran per kategori untuk belajar budgeting

## Tech Stack

- **Backend:** Laravel 11 (Breeze)
- **Frontend:** React + Inertia.js
- **UI:** shadcn/ui, Tailwind CSS
- **Database:** MySQL
- **Payment Gateway:** Midtrans Snap (sandbox)

## Role & Akses

| Role | Dibuat oleh | Akses |
|---|---|---|
| Admin | — | Kelola semua keluarga |
| Orang Tua | Pendaftaran umum | Guardian View, Approval Center, Top-up, kelola dependent |
| Lansia | Admin / Orang Tua | Dashboard voice-first, bayar tagihan, riwayat |
| Remaja | Admin / Orang Tua | Misi, uang saku, grafik pengeluaran |

## Latar Kompetisi

Dikembangkan untuk *innovation competition* yang didukung Kemkomdigi & Garuda Spark, oleh tim **Kesayangan Budhe** — SMK Negeri 1 Wonosobo.

## Instalasi

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm run dev
php artisan serve
```