import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';

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

// Endpoint: Analyze Single Student Profile
app.post('/api/analyze-resilience', async (req, res) => {
  try {
    const {
      nama = 'Siswa',
      kelas = 'Kelas IX SMP',
      persentaseSkor = 50,
      kategori: inputKategori,
      dimensiTerendah = 'Regulasi Emosi',
      dimensiDetail,
      catatanKhusus = '',
      gayaBahasa = 'ramah_remaja',
    } = req.body;

    const kategori = inputKategori || deriveCategory(Number(persentaseSkor));

    if (!ai) {
      // Return high quality deterministic counselor fallback
      const fallback = generateFallbackCounselorResponse({
        nama,
        kelas,
        persentaseSkor: Number(persentaseSkor),
        kategori,
        dimensiTerendah,
        catatanKhusus,
      });
      return res.json(fallback);
    }

    const systemInstruction = `Peran Anda adalah Konselor / Guru Bimbingan dan Konseling (BK) yang profesional, hangat, solutif, dan ramah bagi peserta didik jenjang SMP/SMA di Indonesia.

Tugas Anda:
1. Menganalisis profil asesmen resiliensi siswa berdasarkan data yang diberikan (Nama, Kelas, Persentase Skor, Kategori Resiliensi, dan Dimensi Terendah).
2. Menyusun narasi umpan balik (feedback) pribadi dengan gaya bahasa remaja yang memotivasi dan tidak menghakimi (maksimal 2–3 paragraf singkat):
   - Paragraf 1: Apresiasi kejujuran siswa dan validasi potensi/kekuatan dirinya.
   - Paragraf 2: Berikan 2 tips praktis dan realistis untuk melatih dimensi yang masih rendah (misal: Regulasi Emosi, Efikasi Diri, atau Kontrol Impuls).
   - Paragraf 3: Kalimat penguat semangat serta ajakan hangat untuk berdiskusi santai ke ruang BK jika memerlukan teman bercerita.
3. Selalu hasilkan respon akhir dalam format JSON terstruktur yang memuat:
   - "kategori": Kategori resiliensi siswa.
   - "narasiBK": Teks refleksi dan saran konseling untuk siswa (berisi 3 paragraf utuh yang dipisahkan oleh dua baris baru '\\n\\n').
   - "rekomendasiLayanan": Bentuk layanan BK yang direkomendasikan untuk guru (misal: Bimbingan Klasikal, Bimbingan Kelompok, atau Konseling Individual disertai fokus materi).

Prinsip Bahasa:
- Hangat, santun, tidak menggurui, tidak menghakimi (non-judgmental).
- Memposisikan ruang BK bukan sebagai tempat menghukum, melainkan rumah aman (safe space) untuk bertumbuh dan bercerita.
- Tips praktis harus dapat langsung dicoba oleh siswa SMP/SMA dalam keseharian sekolah.`;

    const userPrompt = `Berikut adalah data profil asesmen resiliensi siswa:
- Nama Siswa: ${nama}
- Jenjang / Kelas: ${kelas}
- Persentase Skor Resiliensi: ${persentaseSkor}%
- Kategori Resiliensi: ${kategori}
- Dimensi Terendah: ${dimensiTerendah}
${catatanKhusus ? `- Catatan Khusus / Situasi Siswa: ${catatanKhusus}` : ''}
${dimensiDetail ? `- Rincian Dimensi: ${JSON.stringify(dimensiDetail)}` : ''}
- Preferensi Gaya: ${gayaBahasa}

Mohon susun analisis dan narasi umpan balik konselor BK sesuai pedoman 3 paragraf di atas, serta tetapkan rekomendasi layanan BK yang tepat. Hasilkan dalam format JSON yang telah ditentukan.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            kategori: {
              type: Type.STRING,
              description: 'Kategori resiliensi siswa',
            },
            narasiBK: {
              type: Type.STRING,
              description:
                'Teks refleksi dan saran konseling untuk siswa, maksimal 2-3 paragraf singkat dengan bahasa remaja hangat dan memotivasi',
            },
            rekomendasiLayanan: {
              type: Type.STRING,
              description:
                'Bentuk layanan BK yang direkomendasikan untuk guru (misal: Bimbingan Klasikal, Bimbingan Kelompok, atau Konseling Individual beserta fokus topik)',
            },
            detailParagraf: {
              type: Type.OBJECT,
              properties: {
                apresiasiDanKekuatan: {
                  type: Type.STRING,
                  description: 'Paragraf 1: Apresiasi kejujuran siswa dan validasi potensi/kekuatan dirinya.',
                },
                tipsPraktis: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Daftar 2 tips praktis dan realistis untuk dimensi terendah.',
                },
                ajakanDanPenguat: {
                  type: Type.STRING,
                  description:
                    'Paragraf 3: Kalimat penguat semangat serta ajakan hangat untuk berdiskusi santai ke ruang BK.',
                },
              },
              required: ['apresiasiDanKekuatan', 'tipsPraktis', 'ajakanDanPenguat'],
            },
            rencanaTindakLanjutGuru: {
              type: Type.OBJECT,
              properties: {
                tujuanLayanan: { type: Type.STRING },
                tahapanAksi: { type: Type.ARRAY, items: { type: Type.STRING } },
                indikatorKeberhasilan: { type: Type.STRING },
                referensiPOP_BK: { type: Type.STRING },
              },
              required: ['tujuanLayanan', 'tahapanAksi', 'indikatorKeberhasilan'],
            },
          },
          required: ['kategori', 'narasiBK', 'rekomendasiLayanan'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Respons kosong dari model Gemini');
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing resilience:', error);

    // Fallback gracefully so the counselor/student is never blocked
    const fallback = generateFallbackCounselorResponse({
      nama: req.body?.nama || 'Siswa',
      kelas: req.body?.kelas || 'Kelas IX SMP',
      persentaseSkor: Number(req.body?.persentaseSkor) || 50,
      kategori: req.body?.kategori || deriveCategory(Number(req.body?.persentaseSkor) || 50),
      dimensiTerendah: req.body?.dimensiTerendah || 'Regulasi Emosi',
      catatanKhusus: req.body?.catatanKhusus,
    });
    return res.json(fallback);
  }
});

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
