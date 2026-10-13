// resources/js/lib/voiceParser.js

/* ========================================================================
 * 1. ANGKA
 * ====================================================================== */

const SATUAN = {
    kosong: 0,
    nol: 0,
    satu: 1,
    dua: 2,
    tiga: 3,
    empat: 4,
    lima: 5,
    enam: 6,
    tujuh: 7,
    delapan: 8,
    sembilan: 9,
};

// Chrome bisa menulis "ribu" sebagai: 200k, 200 K, 200 ka, 200 kay, 200 rb, 200 ribu
const UNIT_RIBU = ["k", "ka", "kay", "rb", "ribu"];
const UNIT_JUTA = ["jt", "juta"];
const SATUAN_RE = "ribu|rb|kay|ka|k|juta|jt";

const KATA_ANGKA = new Set([
    ...Object.keys(SATUAN),
    "sepuluh",
    "sebelas",
    "belas",
    "puluh",
    "seratus",
    "ratus",
    "seribu",
    "ribu",
    "sejuta",
    "juta",
    "setengah",
    "seceng",
    "goceng",
    "ceban",
    "gocap",
    "cepek",
    ...UNIT_RIBU,
    ...UNIT_JUTA,
]);

// Kata yang tidak memutus urutan angka, mis. "dua ratus dan lima puluh ribu"
const PENYAMBUNG = new Set(["dan", "rupiah", "perak", "rp"]);

/** Slang uang dan "setengah juta" diubah dulu ke bentuk baku. */
function normalisasiAngka(teks) {
    return teks
        .replace(/\bseceng\b/g, "seribu")
        .replace(/\bgoceng\b/g, "lima ribu")
        .replace(/\bceban\b/g, "sepuluh ribu")
        .replace(/\bgocap\b/g, "lima puluh ribu")
        .replace(/\bcepek\b/g, "seratus ribu")
        .replace(/\b(\d+)\s+setengah\s+juta\b/g, "$1,5 juta")
        .replace(
            /\b(satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh)\s+setengah\s+juta\b/g,
            "$1 juta lima ratus ribu",
        )
        .replace(/\bsetengah\s+juta\b/g, "lima ratus ribu");
}

/** "lima puluh ribu" -> 50000, "dua ratus ka" -> 200000 */
function kataKeAngka(teks) {
    const mentah = teks
        .toLowerCase()
        .replace(/[.,]/g, "")
        .split(/\s+/)
        .filter(Boolean);
    const tokens = [];

    for (const t of mentah) {
        if (t === "seribu") tokens.push("satu", "ribu");
        else if (t === "seratus") tokens.push("satu", "ratus");
        else if (t === "sepuluh") tokens.push("satu", "puluh");
        else if (t === "sebelas") tokens.push("satu", "belas");
        else if (t === "sejuta") tokens.push("satu", "juta");
        else if (UNIT_RIBU.includes(t)) tokens.push("ribu");
        else if (UNIT_JUTA.includes(t)) tokens.push("juta");
        else tokens.push(t);
    }

    let total = 0;
    let current = 0;
    let ada = false;
    let i = 0;

    while (i < tokens.length) {
        const w = tokens[i];

        if (Object.hasOwn(SATUAN, w)) {
            ada = true;
            const nilai = SATUAN[w];
            const next = tokens[i + 1];

            if (next === "belas") {
                current += 10 + nilai;
                i += 2;
                continue;
            }
            if (next === "puluh") {
                current += nilai * 10;
                i += 2;
                continue;
            }
            if (next === "ratus") {
                current += nilai * 100;
                i += 2;
                continue;
            }
            if (next === "ribu") {
                total += (current + nilai) * 1_000;
                current = 0;
                i += 2;
                continue;
            }
            if (next === "juta") {
                total += (current + nilai) * 1_000_000;
                current = 0;
                i += 2;
                continue;
            }

            current += nilai;
            i += 1;
            continue;
        }

        if (w === "ribu") {
            total += current * 1_000;
            current = 0;
            ada = true;
            i += 1;
            continue;
        }
        if (w === "juta") {
            total += current * 1_000_000;
            current = 0;
            ada = true;
            i += 1;
            continue;
        }

        // kata biasa (mis. "bakso") memutus angka, supaya "dua bakso lima belas ribu" = 15.000
        if (!PENYAMBUNG.has(w)) current = 0;
        i += 1;
    }

    total += current;
    return ada && total > 0 ? total : null;
}

function keAngka(mentah, adaUnit) {
    // "1,5 juta" -> 1.5 ; "50.000" -> 50000
    if (adaUnit && /^\d+[.,]\d{1,2}$/.test(mentah)) {
        return parseFloat(mentah.replace(",", "."));
    }
    return parseInt(mentah.replace(/[.,]/g, ""), 10);
}

/**
 * Ambil nominal dari ucapan. Contoh yang dikenali:
 * "200k", "200 K", "200 ka", "200 rb", "200 ribu", "200.000", "Rp200.000",
 * "1,5 juta", "satu setengah juta", "setengah juta", "dua ratus ribu",
 * "dua ratus ka", "baju dua ratus" (dianggap 200 ribu),
 * slang: seceng (1rb), goceng (5rb), ceban (10rb), gocap (50rb), cepek (100rb).
 */
export function deteksiNominal(teks) {
    const lower = normalisasiAngka(teks.toLowerCase()).replace(
        /\brp\.?\s*/g,
        " ",
    );

    const pola = new RegExp(
        `(\\d+(?:[.,]\\d+)*)\\s*(${SATUAN_RE})?(?![a-z])`,
        "g",
    );
    const tanpaUnit = [];

    for (const m of lower.matchAll(pola)) {
        const nilai = keAngka(m[1], !!m[2]);
        if (Number.isNaN(nilai)) continue;

        if (m[2]) {
            const kali = UNIT_JUTA.includes(m[2]) ? 1_000_000 : 1_000;
            return Math.round(nilai * kali);
        }

        tanpaUnit.push(nilai);
    }

    // angka penuh tanpa satuan: "50.000"
    const besar = tanpaUnit.filter((n) => n >= 1000);
    if (besar.length) return Math.max(...besar);

    // kata angka: "lima puluh ribu"
    const adaPenanda = /\b(ribu|rb|k|ka|kay|juta|jt|rupiah|perak)\b/.test(
        lower,
    );
    const dariKata = kataKeAngka(lower);

    if (dariKata) {
        if (adaPenanda || dariKata >= 1000) return dariKata;
        // "baju dua ratus": tidak ada belanja Rp 200, jadi dianggap 200 ribu
        if (dariKata >= 100) return dariKata * 1000;
    }

    // "baju 200" tanpa satuan, hanya jika tepat satu angka 100-999
    const sedang = tanpaUnit.filter((n) => n >= 100 && n < 1000);
    if (sedang.length === 1) return sedang[0] * 1000;

    return null;
}

/* ========================================================================
 * 2. KAMUS KATEGORI
 *    frasa = bobot 3 (dicocokkan dulu, lalu "memakan" kata di dalamnya)
 *    kata  = bobot 2
 *    lemah = bobot 1 (petunjuk tambahan, kalah dari kata biasa)
 *    Kategori sesuai pilihan di Spend.jsx.
 * ====================================================================== */

const KAMUS = {
    kesehatan: {
        frasa: [
            "kayu putih",
            "masuk angin",
            "tolak angin",
            "rumah sakit",
            "gula darah",
            "dokter gigi",
            "cek kesehatan",
            "obat batuk",
            "obat flu",
            "kursi roda",
            "tekanan darah",
            "cek darah",
            "periksa mata",
            "kacamata baca",
            "alat bantu dengar",
            "bantu dengar",
            "check up",
            "resep dokter",
            "tetes mata",
            "asam urat",
            "minyak urut",
        ],
        kata: [
            "obat",
            "obatan",
            "apotek",
            "apotik",
            "apoteker",
            "dokter",
            "vitamin",
            "suplemen",
            "klinik",
            "puskesmas",
            "posyandu",
            "bidan",
            "perawat",
            "kesehatan",
            "demam",
            "batuk",
            "pilek",
            "flu",
            "pusing",
            "paracetamol",
            "parasetamol",
            "panadol",
            "bodrex",
            "paramex",
            "promag",
            "antangin",
            "oskadon",
            "redoxon",
            "enervon",
            "neurobion",
            "salep",
            "balsem",
            "koyo",
            "plester",
            "hansaplast",
            "perban",
            "betadine",
            "antiseptik",
            "masker",
            "termometer",
            "tensi",
            "tensimeter",
            "laboratorium",
            "lab",
            "rontgen",
            "ronsen",
            "usg",
            "operasi",
            "opname",
            "bpjs",
            "kacamata",
            "optik",
            "behel",
            "walker",
            "fisioterapi",
            "akupunktur",
            "imunisasi",
            "vaksin",
            "suntik",
            "infus",
            "oksigen",
            "nebulizer",
            "insulin",
            "hipertensi",
            "diabetes",
            "kolesterol",
        ],
        lemah: [
            "sakit",
            "kontrol",
            "periksa",
            "pemeriksaan",
            "terapi",
            "pijat",
            "urut",
            "jamu",
            "gigi",
            "tongkat",
            "rawat",
        ],
    },

    pakaian: {
        frasa: [
            "kaus kaki",
            "kaos kaki",
            "sarung tangan",
            "celana dalam",
            "baju tidur",
            "ikat pinggang",
            "jam tangan",
            "baju koko",
            "baju muslim",
            "baju renang",
            "tas tangan",
            "kain batik",
            "kain kebaya",
            "kain panjang",
        ],
        kata: [
            "baju",
            "pakaian",
            "batik",
            "kain",
            "celana",
            "sandal",
            "sendal",
            "sepatu",
            "selop",
            "jilbab",
            "kerudung",
            "hijab",
            "kemeja",
            "daster",
            "kaos",
            "kaus",
            "jaket",
            "sweater",
            "sweter",
            "kardigan",
            "cardigan",
            "rok",
            "gamis",
            "mukena",
            "sarung",
            "peci",
            "kopiah",
            "songkok",
            "topi",
            "kebaya",
            "jarik",
            "selendang",
            "syal",
            "singlet",
            "kutang",
            "bra",
            "piyama",
            "seragam",
            "jas",
            "blazer",
            "dasi",
            "sabuk",
            "stoking",
            "legging",
            "tas",
            "dompet",
            "koko",
            "cincin",
            "kalung",
            "gelang",
            "anting",
            "perhiasan",
            "aksesoris",
            "jahit",
            "penjahit",
            "konveksi",
            "sulam",
            "bordir",
        ],
        lemah: [],
    },

    transportasi: {
        frasa: [
            "isi bensin",
            "tiket kereta",
            "tiket pesawat",
            "tiket bus",
            "tambal ban",
            "ganti oli",
            "sewa mobil",
            "sewa motor",
            "ojek online",
            "naik ojek",
            "naik angkot",
            "naik bus",
            "naik kereta",
            "naik taksi",
            "naik becak",
            "servis motor",
            "servis mobil",
            "service motor",
            "service mobil",
            "e toll",
            "saldo e toll",
            "kartu tol",
            "uang parkir",
            "biaya parkir",
            "ongkos angkot",
            "ongkos ojek",
        ],
        kata: [
            "ojek",
            "ojeg",
            "ojol",
            "angkot",
            "angkutan",
            "bensin",
            "pertamax",
            "pertalite",
            "solar",
            "bbm",
            "spbu",
            "grab",
            "gojek",
            "maxim",
            "indrive",
            "taksi",
            "taxi",
            "bus",
            "bis",
            "kereta",
            "krl",
            "mrt",
            "lrt",
            "transjakarta",
            "damri",
            "becak",
            "andong",
            "delman",
            "bajaj",
            "elf",
            "travel",
            "ongkos",
            "parkir",
            "tol",
            "etoll",
            "pesawat",
            "kapal",
            "feri",
            "ferry",
            "bandara",
            "stasiun",
            "terminal",
            "transportasi",
            "transport",
            "perjalanan",
            "bengkel",
            "ban",
            "oli",
            "rental",
        ],
        lemah: ["tiket", "servis", "service"],
    },

    makanan: {
        frasa: [
            "nasi goreng",
            "nasi padang",
            "nasi uduk",
            "nasi kuning",
            "nasi rames",
            "nasi campur",
            "nasi kucing",
            "mi ayam",
            "mie ayam",
            "mie goreng",
            "mi goreng",
            "mie rebus",
            "mi rebus",
            "mie kuah",
            "mie ongklok",
            "mi ongklok",
            "tempe kemul",
            "kupat tahu",
            "tahu kupat",
            "ayam goreng",
            "ayam bakar",
            "ayam geprek",
            "ikan bakar",
            "ikan goreng",
            "sate ayam",
            "sate sapi",
            "soto ayam",
            "es teh",
            "es jeruk",
            "es krim",
            "es campur",
            "es dawet",
            "teh manis",
            "teh botol",
            "kopi susu",
            "kopi hitam",
            "air mineral",
            "makan siang",
            "makan malam",
            "makan pagi",
            "makan bareng",
            "rumah makan",
            "warung makan",
            "warung nasi",
            "gado gado",
            "tahu isi",
            "tahu bulat",
            "tahu goreng",
            "tempe goreng",
            "tempe mendoan",
            "pisang goreng",
            "wedang ronde",
            "wedang jahe",
            "susu kedelai",
            "jus buah",
            "jus jeruk",
            "jus alpukat",
        ],
        kata: [
            "makan",
            "makanan",
            "minum",
            "minuman",
            "jajan",
            "jajanan",
            "sarapan",
            "bakso",
            "baso",
            "mie",
            "mi",
            "indomie",
            "soto",
            "nasi",
            "bubur",
            "ayam",
            "sate",
            "gorengan",
            "bakwan",
            "roti",
            "kue",
            "kopi",
            "teh",
            "es",
            "jus",
            "susu",
            "aqua",
            "warung",
            "warteg",
            "restoran",
            "resto",
            "kafe",
            "cafe",
            "kantin",
            "burger",
            "pizza",
            "kebab",
            "martabak",
            "siomay",
            "batagor",
            "pempek",
            "lontong",
            "ketupat",
            "kupat",
            "opor",
            "rawon",
            "rujak",
            "pecel",
            "lotek",
            "gudeg",
            "sop",
            "sup",
            "semur",
            "kari",
            "gulai",
            "tongseng",
            "bebek",
            "iga",
            "seblak",
            "cilok",
            "cireng",
            "donat",
            "bolu",
            "brownies",
            "cokelat",
            "coklat",
            "permen",
            "biskuit",
            "keripik",
            "kerupuk",
            "snack",
            "camilan",
            "cemilan",
            "sirup",
            "boba",
            "carica",
        ],
        lemah: [
            "bakar",
            "goreng",
            "rebus",
            "kuah",
            "pedas",
            "manis",
            "porsi",
            "bungkus",
            "enak",
        ],
    },

    belanja: {
        frasa: [
            "belanja harian",
            "belanja bulanan",
            "belanja dapur",
            "belanja pasar",
            "minyak goreng",
            "gula pasir",
            "gula jawa",
            "gula merah",
            "telur ayam",
            "telur bebek",
            "ayam potong",
            "ayam kampung",
            "daging ayam",
            "daging sapi",
            "daging kambing",
            "air galon",
            "gas elpiji",
            "tabung gas",
            "isi gas",
            "sabun mandi",
            "sabun cuci",
            "sabun cuci piring",
            "pasta gigi",
            "sikat gigi",
            "obat nyamuk",
            "tisu basah",
            "kertas tisu",
            "ongkos kirim",
            "beras ketan",
            "beras merah",
            "susu formula",
            "popok bayi",
            "popok dewasa",
            "minyak tanah",
            "cabai rawit",
            "cabe rawit",
            "bawang merah",
            "bawang putih",
            "bumbu dapur",
            "bumbu masak",
            "perlengkapan mandi",
            "alat mandi",
            "peralatan dapur",
            "peralatan rumah",
            "kebutuhan rumah",
            "kebutuhan dapur",
            "kebutuhan harian",
            "kebutuhan pokok",
            "bahan pokok",
            "bahan makanan",
            "bahan masakan",
        ],
        kata: [
            "sayur",
            "sayuran",
            "pasar",
            "sembako",
            "beras",
            "gula",
            "garam",
            "telur",
            "tepung",
            "bumbu",
            "cabai",
            "cabe",
            "bawang",
            "tomat",
            "kentang",
            "wortel",
            "kol",
            "kubis",
            "bayam",
            "kangkung",
            "sawi",
            "terong",
            "timun",
            "mentimun",
            "labu",
            "jagung",
            "singkong",
            "ubi",
            "buncis",
            "jahe",
            "kunyit",
            "lengkuas",
            "serai",
            "santan",
            "kelapa",
            "tempe",
            "tahu",
            "ikan",
            "daging",
            "udang",
            "cumi",
            "kerang",
            "sapi",
            "kambing",
            "buah",
            "jeruk",
            "apel",
            "pisang",
            "mangga",
            "semangka",
            "melon",
            "salak",
            "pepaya",
            "anggur",
            "nanas",
            "alpukat",
            "durian",
            "rambutan",
            "manggis",
            "sabun",
            "sampo",
            "shampo",
            "deterjen",
            "detergen",
            "rinso",
            "sunlight",
            "molto",
            "pewangi",
            "pelembut",
            "pembersih",
            "pel",
            "sapu",
            "sikat",
            "tisu",
            "tissue",
            "handuk",
            "korek",
            "lilin",
            "plastik",
            "kresek",
            "kantong",
            "popok",
            "pampers",
            "pembalut",
            "baygon",
            "galon",
            "elpiji",
            "lpg",
            "gas",
            "margarin",
            "mentega",
            "kecap",
            "saus",
            "sambal",
            "terasi",
            "msg",
            "penyedap",
            "royco",
            "masako",
            "ongkir",
        ],
        lemah: ["minyak", "daun", "kacang"],
    },

    lainnya: {
        frasa: [
            "oleh oleh",
            "potong rambut",
            "cukur rambut",
            "pangkas rambut",
            "alat tulis",
            "paket data",
            "token listrik",
            "air pdam",
            "ikan hias",
            "servis hp",
            "servis tv",
            "servis ac",
            "servis kulkas",
            "service hp",
            "tiket bioskop",
            "tiket konser",
            "tiket wisata",
            "tiket masuk",
            "sewa kos",
            "uang kos",
            "uang sewa",
            "uang arisan",
            "uang kas",
            "kotak amal",
            "hari raya",
            "kado ulang tahun",
            "angpao lebaran",
            "jam dinding",
        ],
        kata: [
            "bioskop",
            "nonton",
            "film",
            "konser",
            "wisata",
            "rekreasi",
            "tamasya",
            "liburan",
            "hotel",
            "penginapan",
            "homestay",
            "villa",
            "sewa",
            "kos",
            "kost",
            "kontrakan",
            "listrik",
            "pln",
            "token",
            "pdam",
            "internet",
            "wifi",
            "indihome",
            "pulsa",
            "kuota",
            "cicilan",
            "kredit",
            "angsuran",
            "arisan",
            "iuran",
            "sumbangan",
            "infaq",
            "infak",
            "sedekah",
            "sodaqoh",
            "zakat",
            "donasi",
            "amal",
            "hadiah",
            "kado",
            "angpao",
            "ampau",
            "salon",
            "pangkas",
            "cukur",
            "laundry",
            "binatu",
            "reparasi",
            "buku",
            "kitab",
            "sekolah",
            "spp",
            "kursus",
            "les",
            "pendidikan",
            "mainan",
            "game",
            "koper",
            "payung",
            "perabot",
            "furnitur",
            "kursi",
            "meja",
            "lemari",
            "kasur",
            "bantal",
            "kipas",
            "televisi",
            "tv",
            "kulkas",
            "hp",
            "handphone",
            "charger",
            "kabel",
            "baterai",
            "lampu",
            "bohlam",
            "rokok",
            "tanaman",
            "bunga",
            "pot",
            "pupuk",
            "bibit",
            "cat",
            "semen",
            "paku",
            "genteng",
            "kayu",
            "bangunan",
            "tukang",
            "foto",
            "fotokopi",
            "cetak",
            "print",
            "stiker",
            "materai",
            "meterai",
            "pajak",
            "pbb",
            "denda",
            "lainnya",
        ],
        lemah: [],
    },
};

// Kalau skor seri, kategori yang lebih awal di daftar ini yang menang.
const PRIORITAS = [
    "kesehatan",
    "pakaian",
    "transportasi",
    "makanan",
    "belanja",
    "lainnya",
];

// Frasa dicocokkan dari yang terpanjang supaya "sabun cuci piring" menang atas "sabun cuci".
const FRASA_URUT = Object.entries(KAMUS)
    .flatMap(([category, { frasa = [] }]) =>
        frasa.map((f) => ({ frasa: f, category })),
    )
    .sort((a, b) => b.frasa.length - a.frasa.length);

const KATA = new Map();

function daftarkan(kata, category, bobot) {
    if (!KATA.has(kata)) KATA.set(kata, []);
    KATA.get(kata).push([category, bobot]);
}

for (const [category, { kata = [], lemah = [] }] of Object.entries(KAMUS)) {
    kata.forEach((w) => daftarkan(w, category, 2));
    lemah.forEach((w) => daftarkan(w, category, 1));
}

function cariKata(kata) {
    // "bajunya" -> "baju"
    return (
        KATA.get(kata) ??
        (kata.endsWith("nya") ? KATA.get(kata.slice(0, -3)) : undefined)
    );
}

const bersihkan = (teks) =>
    teks
        .toLowerCase()
        .replace(/[^a-z]+/g, " ")
        .trim();

/** Kembalikan salah satu kategori di Spend.jsx, atau null kalau tidak ada petunjuk sama sekali. */
export function deteksiKategori(teks) {
    let sisa = ` ${bersihkan(teks)} `;
    const skor = {};

    const tambah = (category, bobot) => {
        skor[category] = (skor[category] ?? 0) + bobot;
    };

    // 1) frasa dulu, lalu buang dari teks supaya kata di dalamnya tidak dihitung dua kali
    for (const { frasa, category } of FRASA_URUT) {
        const kunci = ` ${frasa} `;

        if (sisa.includes(kunci)) {
            tambah(category, 3);
            sisa = sisa.split(kunci).join(" ");
        }
    }

    // 2) kata satuan
    for (const kata of sisa.split(" ").filter(Boolean)) {
        for (const [category, bobot] of cariKata(kata) ?? []) {
            tambah(category, bobot);
        }
    }

    let terbaik = null;
    let skorTerbaik = 0;

    for (const category of PRIORITAS) {
        if ((skor[category] ?? 0) > skorTerbaik) {
            terbaik = category;
            skorTerbaik = skor[category];
        }
    }

    return terbaik;
}

/* ========================================================================
 * 3. NAMA BARANG
 * ====================================================================== */

// Kata yang dibuang dari nama barang.
const FILLER = new Set([
    "saya",
    "aku",
    "ingin",
    "mau",
    "pengen",
    "pingin",
    "tolong",
    "mohon",
    "bantu",
    "bantuin",
    "tolongin",
    "berbelanja",
    "belanja",
    "membeli",
    "beli",
    "belikan",
    "membayar",
    "bayar",
    "bayarkan",
    "pesan",
    "memesan",
    "jajan",
    "tebus",
    "menebus",
    "catat",
    "mencatat",
    "pembelian",
    "ke",
    "pada",
    "seharga",
    "harga",
    "harganya",
    "sebesar",
    "senilai",
    "sejumlah",
    "total",
    "sekitar",
    "kira",
    "kurang",
    "lebih",
    "rupiah",
    "rp",
    "perak",
    "kategori",
    "nominal",
    "yang",
    "ya",
    "dong",
    "sih",
    "nih",
    "deh",
    "lah",
    "kok",
    "aja",
    "saja",
    "lagi",
    "tadi",
    "ini",
    "itu",
    "buka",
    "halaman",
    "lihat",
    "tampilkan",
    "menu",
    "pergi",
    "masuk",
    "menuju",
    "ayom",
    "hai",
    "halo",
    "pak",
    "bu",
    "mbak",
    "mas",
]);

// Kata sambung: dipertahankan hanya kalau ada kata barang di kiri dan kanannya.
// "baju batik di pasar" -> utuh, "di baju" -> "baju".
const SAMBUNG = new Set(["di", "dari", "dengan", "dan", "untuk", "buat"]);

const LABEL_KATEGORI = new Set([
    "makanan",
    "pakaian",
    "kesehatan",
    "transportasi",
    "lainnya",
    "harian",
]);

const KATA_BELI = [
    "beli",
    "membeli",
    "belikan",
    "pesan",
    "memesan",
    "jajan",
    "tebus",
    "menebus",
];

const isAngka = (t) =>
    KATA_ANGKA.has(t) ||
    new RegExp(`^\\d[\\d.,]*(${SATUAN_RE})?$`).test(t) ||
    /^rp\.?\d/.test(t);

/**
 * "beli baju batik di pasar dua ratus ribu"
 *  -> { intent: true, amount: 200000, category: "pakaian", item: "Baju batik di pasar" }
 *
 * Kalau ada nominal atau nama barang tapi kategorinya tidak dikenal, hasilnya "lainnya"
 * (bukan null), supaya halaman belanja tidak salah mengisi "makanan".
 */
export function parseBelanja(teks) {
    const lower = teks.toLowerCase().trim();
    const amount = deteksiNominal(lower);

    const intent =
        amount !== null ||
        /\b(belanja|berbelanja|beli|membeli|belikan|jajan|checkout|pesan|memesan|bayar|membayar|bayarkan|tebus|menebus)\b/.test(
            lower,
        );

    const tokens = lower
        .replace(/[,.]+(?=\s|$)/g, "")
        .split(/\s+/)
        .filter(Boolean);

    const mulai = tokens.findIndex((t) => KATA_BELI.includes(t));
    const bagian = mulai >= 0 ? tokens.slice(mulai + 1) : tokens;

    const kandidat = bagian.map((t) => ({
        t,
        buang:
            isAngka(t) ||
            LABEL_KATEGORI.has(t) ||
            (FILLER.has(t) && !SAMBUNG.has(t)),
    }));

    const hasil = [];

    kandidat.forEach(({ t, buang }, i) => {
        if (buang) return;

        if (SAMBUNG.has(t)) {
            const adaSebelum = hasil.length > 0;
            const adaSesudah = kandidat
                .slice(i + 1)
                .some((k) => !k.buang && !SAMBUNG.has(k.t));

            if (!(adaSebelum && adaSesudah)) return;
        }

        hasil.push(t);
    });

    const item = hasil.join(" ").slice(0, 80);
    const category =
        deteksiKategori(lower) ?? (amount !== null || item ? "lainnya" : null);

    return {
        intent,
        amount,
        category,
        item: item ? item.charAt(0).toUpperCase() + item.slice(1) : "",
    };
}
