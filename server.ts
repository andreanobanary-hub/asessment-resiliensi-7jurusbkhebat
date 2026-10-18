import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';
import analyzeResilienceHandler from './api/analyze-resilience.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to determine resilience category from percentage score if not provided
function deriveCategory(score: number): string {
  if (score >= 85) return 'Resiliensi Sangat Tinggi';
  if (score >= 70) return 'Resiliensi Tinggi';
  if (score >= 55) return 'Resiliensi Sedang';
  if (score >= 40) return 'Resiliensi Rendah';
  return 'Resiliensi Sangat Rendah';
}

// Fallback generator when Gemini API is unavailable or rate-limited
function generateFallbackCounselorResponse(params: {
  nama: string;
  kelas: string;
  persentaseSkor: number;
  kategori: string;
  dimensiTerendah: string;
  catatanKhusus?: string;
}) {
  const { nama, kelas, persentaseSkor, kategori, dimensiTerendah, catatanKhusus } = params;

  const dimensionTips: Record<string, [string, string]> = {
    'Regulasi Emosi': [
      'Terapkan teknik pernapasan 4-7-8 atau "grounding 5-4-3-2-1" saat mulai merasa kesal atau panik sebelum merespons sesuatu.',
      'Sediakan jurnal emosi kecil di ponselmu untuk menuliskan apa yang kamu rasakan tanpa perlu langsung melampiaskannya.',
    ],
    'Kontrol Impuls': [
      'Beri jeda "aturan 5 detik" sebelum mengambil keputusan mendadak atau membalas omongan yang memancing emosi.',
      'Bagi tugas yang terasa membosankan atau menumpuk menjadi sesi kecil berdurasi 20 menit (Teknik Pomodoro) agar tidak cepat gelisah.',
    ],
    'Optimisme': [
      'Latih kebiasaan menulis 3 hal baik yang terjadi setiap malam sebelum tidur, sekecil apapun momennya.',
      'Ubah kalimat batinmu dari "Aku tidak bisa" menjadi "Aku belum terbiasa, tapi aku bisa mencobanya perlahan".',
    ],
    'Analisis Kausalitas': [
      'Gunakan teknik "5 Mengapa" (5 Whys) untuk melihat akar masalah secara jernih tanpa terburu-buru menyalahkan diri sendiri.',
      'Pisahkan antara hal yang bisa kamu kendalikan (sikap dan usahamu) dengan hal yang di luar kendalimu (sikap orang lain atau hasil akhir).',
    ],
    'Empati': [
      'Coba luangkan waktu untuk mendengarkan teman tanpa memotong atau langsung membandingkan dengan ceritamu.',
      'Tanyakan pada dirimu: "Kira-kira apa yang sedang dia rasakan sampai bersikap seperti itu?" saat ada hal yang kurang mengenakkan.',
    ],
    'Efikasi Diri': [
      'Pecah target belajarmu menjadi langkah-langkah mini yang realistis dan rayakan setiap pencapaian kecil yang kamu buat.',
      'Buat "kotak bukti keberhasilan" di catatanmu yang mendokumentasikan rintangan yang pernah berhasil kamu lalui sebelumnya.',
    ],
    'Reaching Out': [
      'Mulai dengan menyapa atau mengajak ngobrol ringan teman sekelas tentang hobi bersama atau tugas sekolah.',
      'Ingatlah bahwa meminta pertolongan saat kesulitan bukanlah tanda kelemahan, melainkan bukti keberanian untuk berkembang.',
    ],
  };

  const selectedTips = dimensionTips[dimensiTerendah] || [
    'Ambil jeda sejenak untuk menenangkan pikiran saat menghadapi situasi yang menekan.',
    'Diskusikan tantangan yang kamu hadapi dengan orang yang kamu percayai agar mendapat sudut pandang baru.',
  ];

  let p1 = `Halo ${nama}! Pertama-tama, Ibu/Bapak guru BK ingin mengapresiasi kejujuran dan keterbukaanmu dalam mengisi asesmen resiliensi ini. Dari hasil skormu (${persentaseSkor}%), kamu sudah memiliki pondasi diri yang berharga dan kemauan kuat untuk terus melangkah di jenjang ${kelas}. Sikap jujur pada diri sendiri ini adalah bukti bahwa kamu adalah pribadi yang tangguh dan punya potensi besar untuk berkembang lebih jauh lagi.`;
  let p2 = `Berdasarkan profil asesmenmu, ada satu ruang pertumbuhan yang bisa kita asah bersama, yaitu pada aspek ${dimensiTerendah}. Supaya kamu makin nyaman dan percaya diri saat menghadapi tantangan, yuk coba 2 kebiasaan sederhana ini: pertama, ${selectedTips[0].toLowerCase()}; kedua, ${selectedTips[1].toLowerCase()}. Ingat ya, melatih keterampilan ini butuh proses bertahap, jadi nikmati setiap langkah kecilnya!`;
  let p3 = `Kamu tidak pernah sendirian dalam menjalani masa-masa di ${kelas} ini. Tetap semangat, hargai proses belajarmu, dan ketahuilah bahwa pintu ruang BK selalu terbuka lebar dan hangat untukmu. Kapan pun kamu butuh teman ngobrol santai, bertukar pikiran, atau sekadar melepas lelah, jangan ragu untuk mampir ya!`;

  if (catatanKhusus) {
    p2 += ` Terkait situasi yang kamu rasakan, jadikan ini sebagai tempat belajar melangkah perlahan tanpa perlu merasa terbebani.`;
  }

  const narasiBK = `${p1}\n\n${p2}\n\n${p3}`;

  let rekomendasiLayanan = 'Bimbingan Kelompok';
  if (persentaseSkor < 45 || dimensiTerendah === 'Regulasi Emosi' || dimensiTerendah === 'Kontrol Impuls') {
    rekomendasiLayanan = `Konseling Individual (Fokus: Penguatan Dimensi ${dimensiTerendah} & Coping Strategy)`;
  } else if (persentaseSkor >= 70) {
    rekomendasiLayanan = `Bimbingan Klasikal (Topik: Menjaga Ketangguhan Mental & Leadership Resiliensi)`;
  } else {
    rekomendasiLayanan = `Bimbingan Kelompok (Topik: Dynamic Resilience & Peer Support untuk ${dimensiTerendah})`;
  }

  return {
    kategori,
    narasiBK,
    rekomendasiLayanan,
    detailParagraf: {
      apresiasiDanKekuatan: p1,
      tipsPraktis: selectedTips,
      ajakanDanPenguat: p3,
    },
    rencanaTindakLanjutGuru: {
      tujuanLayanan: `Membantu siswa ${nama} meningkatkan keterampilan adaptasi pada dimensi ${dimensiTerendah} serta membangun resiliensi akademik di ${kelas}.`,
      tahapanAksi: [
        'Membangun rapport dan mengundang siswa secara persuasif ke ruang BK.',
        'Mengeksplorasi pemicu stres dan memfasilitasi latihan teknik praktis.',
        'Monitoring berkala mingguan melalui lembar jurnal refleksi diri.',
      ],
      indikatorKeberhasilan: `Siswa mampu mendemonstrasikan minimal 1 strategi koping adaptif saat menghadapi hambatan serta peningkatan skor resiliensi pada evaluasi lanjutan.`,
      referensiPOP_BK: 'Panduan Operasional Penyelenggaraan Bimbingan dan Konseling (POP BK) Bidang Pribadi & Sosial',
    },
  };
}

// Endpoint: Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Endpoint: Analyze Single Student Profile (uses same handler as Vercel /api/analyze-resilience)
app.all('/api/analyze-resilience', (req, res) => analyzeResilienceHandler(req, res));

// Endpoint: Batch Analysis for Multiple Students
app.post('/api/batch-analyze', async (req, res) => {
  try {
    const { students = [] } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'Daftar siswa kosong' });
    }

    const results = [];
    for (const item of students.slice(0, 10)) {
      const cat = item.kategori || deriveCategory(Number(item.persentaseSkor));
      const resItem = generateFallbackCounselorResponse({
        nama: item.nama || 'Siswa',
        kelas: item.kelas || 'Siswa',
        persentaseSkor: Number(item.persentaseSkor) || 50,
        kategori: cat,
        dimensiTerendah: item.dimensiTerendah || 'Regulasi Emosi',
        catatanKhusus: item.catatanKhusus,
      });
      results.push({
        id: item.id || Math.random().toString(36).substring(7),
        nama: item.nama,
        kelas: item.kelas,
        persentaseSkor: item.persentaseSkor,
        dimensiTerendah: item.dimensiTerendah,
        ...resItem,
      });
    }

    res.json({ results });
  } catch (error: any) {
    console.error('Batch error:', error);
    res.status(500).json({ error: 'Gagal memproses analisis massal' });
  }
});

async function main() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server Ruang BK aktif di port ${port}`);
  });
}

main().catch((err) => {
  console.error('Gagal menjalankan server:', err);
  process.exit(1);
});
