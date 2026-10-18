import { GoogleGenAI, Type } from '@google/genai';

// URL Google Apps Script Web App untuk penyimpanan hasil asesmen
const GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbxn_OPjx8nB9_YqSzOIAwOabf4wbJxvMVns5rFFbclvXq8S2k3gnxxzbNcTsaRS89l1qQ/exec';

// Helper penentuan kategori resiliensi jika tidak dikirim dari frontend
function deriveCategory(score) {
  if (score >= 85) return 'Resiliensi Sangat Tinggi';
  if (score >= 70) return 'Resiliensi Tinggi';
  if (score >= 55) return 'Resiliensi Sedang';
  if (score >= 40) return 'Resiliensi Rendah';
  return 'Resiliensi Sangat Rendah';
}

// Fallback narasi profesional Guru BK jika model tidak tersedia
function generateFallbackNarration(nama, kelas, persentaseSkor, kategori, dimensiTerendah, catatan) {
  const dimensionTips = {
    'Regulasi Emosi': [
      'Terapkan teknik pernapasan 4-7-8 atau "grounding 5-4-3-2-1" saat mulai merasa cemas atau kesal sebelum merespons sesuatu.',
      'Sediakan jurnal emosi kecil di ponselmu untuk menuliskan perasaan tanpa perlu langsung melampiaskannya.',
    ],
    'Kontrol Impuls': [
      'Beri jeda "aturan 5 detik" sebelum mengambil keputusan mendadak atau membalas omongan yang memancing emosi.',
      'Bagi tugas sekolah yang menumpuk menjadi sesi fokus 20 menit (Teknik Pomodoro) agar tidak cepat gelisah.',
    ],
    'Optimisme': [
      'Latih kebiasaan menulis 3 hal baik yang terjadi setiap malam sebelum tidur, sekecil apapun itu.',
      'Ubah kalimat batinmu dari "Aku tidak bisa" menjadi "Aku belum terbiasa, tapi aku bisa mencobanya perlahan".',
    ],
    'Analisis Kausalitas': [
      'Gunakan teknik "5 Mengapa" untuk melihat akar masalah tugas secara objektif tanpa terburu-buru menyalahkan diri sendiri.',
      'Bedakan antara hal yang bisa kamu kendalikan (usaha dan waktu belajarmu) dengan hal di luar kendalimu.',
    ],
    'Empati': [
      'Luangkan waktu untuk mendengarkan cerita teman sekelas tanpa langsung memotong atau membanding-bandingkannya.',
      'Tanyakan pada dirimu: "Kira-kira apa yang sedang dia rasakan?" saat terjadi salah paham.',
    ],
    'Efikasi Diri': [
      'Pecah materi tugas yang sulit menjadi langkah-langkah mini yang realistis dan rayakan setiap progres kecilmu.',
      'Buat daftar keberhasilan kecil yang pernah berhasil kamu lalui sebagai bukti bahwa kamu mampu.',
    ],
    'Reaching Out': [
      'Mulai dengan menyapa atau mengajak ngobrol ringan teman sekelas tentang hobi bersama atau tugas sekolah.',
      'Ingatlah bahwa meminta pertolongan saat kesulitan belajar bukanlah tanda kelemahan, melainkan bukti keberanian untuk berkembang.',
    ],
  };

  const selectedTips = dimensionTips[dimensiTerendah] || [
    'Ambil jeda sejenak untuk menenangkan pikiran saat menghadapi situasi yang menekan.',
    'Diskusikan hambatan yang kamu rasakan dengan orang yang kamu percayai.',
  ];

  const p1 = `Halo ${nama}! Pertama-tama, Ibu/Bapak guru BK ingin mengapresiasi kejujuran dan keterbukaanmu dalam mengisi asesmen resiliensi ini. Dari hasil skormu (${persentaseSkor}%), kamu sudah memiliki pondasi diri yang berharga dan kemauan kuat untuk terus melangkah di jenjang ${kelas}. Sikap jujur pada diri sendiri ini adalah bukti bahwa kamu adalah pribadi yang tangguh dan punya potensi besar untuk berkembang lebih jauh lagi.`;
  const p2 = `Berdasarkan profil asesmenmu, ada satu ruang pertumbuhan yang bisa kita asah bersama, yaitu pada aspek ${dimensiTerendah}. Supaya kamu makin nyaman dan percaya diri saat menghadapi tantangan sekolah, yuk coba 2 kebiasaan sederhana ini: pertama, ${selectedTips[0].toLowerCase()}; kedua, ${selectedTips[1].toLowerCase()}. Ingat ya, melatih keterampilan ini butuh proses bertahap, jadi nikmati setiap langkah kecilnya!`;
  const p3 = `Kamu tidak pernah sendirian dalam menjalani masa-masa di ${kelas} ini. Tetap semangat, hargai proses belajarmu, dan ketahuilah bahwa pintu ruang BK selalu terbuka lebar dan hangat untukmu. Kapan pun kamu butuh teman ngobrol santai, bertukar pikiran, atau sekadar melepas lelah, jangan ragu untuk mampir ya!`;

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
    narasiBK: `${p1}\n\n${p2}\n\n${p3}`,
    rekomendasiLayanan,
    detailParagraf: {
      apresiasiDanKekuatan: p1,
      tipsPraktis: selectedTips,
      ajakanDanPenguat: p3,
    },
  };
}

/**
 * Vercel Serverless Function Handler
 * Endpoint: /api/analyze-resilience
 */
export default async function handler(req, res) {
  // Hanya menerima metode POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(455 || 405).json({ error: `Metode ${req.method} tidak diizinkan. Gunakan POST.` });
  }

  try {
    const body = req.body || {};
    const nama = (body.nama || 'Siswa').trim();
    const kelas = (body.kelas || 'Siswa SMP/SMA').trim();
    const persentaseSkor = Number(body.persentaseSkor ?? body.skorTotal ?? body.persentase ?? 50);
    const kategori = body.kategori || deriveCategory(persentaseSkor);
    const dimensiTerendah = body.dimensiTerendah || 'Regulasi Emosi';
    const catatan = (body.catatan || body.catatanKhusus || '').trim();

    let outputResult = null;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const systemInstruction = `Peran Anda adalah Konselor / Guru Bimbingan dan Konseling (BK) yang profesional, hangat, solutif, dan ramah bagi peserta didik jenjang SMP/SMA di Indonesia.

Tugas Anda:
1. Menganalisis profil asesmen resiliensi siswa berdasarkan data yang diberikan (Nama, Kelas, Persentase Skor, Kategori Resiliensi, dan Dimensi Terendah).
2. Menyusun narasi umpan balik (feedback) pribadi dengan gaya bahasa remaja yang memotivasi dan tidak menghakimi (maksimal 2–3 paragraf singkat):
   - Paragraf 1: Apresiasi kejujuran siswa dan validasi potensi/kekuatan dirinya.
   - Paragraf 2: Berikan 2 tips praktis dan realistis untuk melatih dimensi yang masih rendah (misal: Regulasi Emosi, Efikasi Diri, atau Kontrol Impuls).
   - Paragraf 3: Kalimat penguat semangat serta ajakan hangat untuk berdiskusi santai ke ruang BK jika memerlukan teman bercerita.
3. Selalu hasilkan respon akhir dalam format JSON terstruktur yang memuat:
   - "kategori": Kategori resiliensi siswa.
   - "narasiBK": Teks refleksi dan saran konseling untuk siswa (3 paragraf terpisah '\\n\\n').
   - "rekomendasiLayanan": Bentuk layanan BK yang direkomendasikan untuk guru (misal: Bimbingan Klasikal, Bimbingan Kelompok, atau Konseling Individual).`;

        const userPrompt = `Data profil asesmen resiliensi siswa:
- Nama Siswa: ${nama}
- Jenjang & Kelas: ${kelas}
- Persentase Skor: ${persentaseSkor}%
- Kategori Resiliensi: ${kategori}
- Dimensi Terendah: ${dimensiTerendah}
${catatan ? `- Catatan Khusus Siswa: ${catatan}` : ''}

Susunlah narasi umpan balik konseling BK ramah remaja dan rekomendasi layanan sesuai instruksi.`;

        // Gunakan model gemini-2.5-flash sesuai instruksi user, dengan fallback ke gemini-3.8-flash jika perlu
        let response;
        try {
          response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
              systemInstruction,
              temperature: 0.7,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  kategori: { type: Type.STRING },
                  narasiBK: { type: Type.STRING },
                  rekomendasiLayanan: { type: Type.STRING },
                  detailParagraf: {
                    type: Type.OBJECT,
                    properties: {
                      apresiasiDanKekuatan: { type: Type.STRING },
                      tipsPraktis: { type: Type.ARRAY, items: { type: Type.STRING } },
                      ajakanDanPenguat: { type: Type.STRING },
                    },
                    required: ['apresiasiDanKekuatan', 'tipsPraktis', 'ajakanDanPenguat'],
                  },
                },
                required: ['kategori', 'narasiBK', 'rekomendasiLayanan'],
              },
            },
          });
        } catch (modelErr) {
          // Fallback model jika gemini-2.5-flash belum tersedia di region/endpoint
          console.warn('Gagal dengan gemini-2.5-flash, mencoba gemini-3.8-flash:', modelErr);
          response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: userPrompt,
            config: {
              systemInstruction,
              temperature: 0.7,
              responseMimeType: 'application/json',
            },
          });
        }

        const textOutput = response.text;
        if (textOutput) {
          outputResult = JSON.parse(textOutput);
        }
      } catch (geminiError) {
        console.error('Gemini API Error, beralih ke fallback cerdas:', geminiError);
      }
    }

    // Jika Gemini tidak aktif atau mengembalikan kosong, gunakan generator narasi berbasis prinsip BK
    if (!outputResult || !outputResult.narasiBK) {
      outputResult = generateFallbackNarration(nama, kelas, persentaseSkor, kategori, dimensiTerendah, catatan);
    }

    // Pastikan field kategori dan rekomendasiLayanan selalu terisi
    if (!outputResult.kategori) outputResult.kategori = kategori;
    if (!outputResult.rekomendasiLayanan) {
      outputResult.rekomendasiLayanan = persentaseSkor < 45
        ? `Konseling Individual (Fokus: Dimensi ${dimensiTerendah})`
        : `Bimbingan Kelompok (Topik: Penguatan ${dimensiTerendah})`;
    }

    if (!outputResult.detailParagraf && outputResult.narasiBK) {
      const parts = outputResult.narasiBK.split('\n\n').filter((p) => p.trim());
      outputResult.detailParagraf = {
        apresiasiDanKekuatan: parts[0] || '',
        tipsPraktis: parts[1] ? [parts[1]] : [],
        ajakanDanPenguat: parts[2] || parts[parts.length - 1] || '',
      };
    }

    // KIRIMKAN HASIL ASESMEN SECARA OTOMATIS KE GOOGLE APPS SCRIPT WEB APP
    // Menggunakan body JSON dengan Content-Type text/plain agar tidak terkena kendala CORS
    const gasPayload = {
      timestamp: new Date().toISOString(),
      nama,
      kelas,
      persentaseSkor,
      skorTotal: persentaseSkor,
      kategori: outputResult.kategori,
      dimensiTerendah,
      catatan,
      narasiBK: outputResult.narasiBK,
      rekomendasiLayanan: outputResult.rekomendasiLayanan,
    };

    try {
      await fetch(GAS_WEBAPP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(gasPayload),
      });
      console.log('Berhasil mengirim data asesmen ke Google Apps Script Web App');
    } catch (gasError) {
      // Catat error pengiriman ke GAS tanpa menggagalkan respon ke frontend siswa
      console.warn('Peringatan: Gagal mengirim ke Google Apps Script Web App:', gasError);
    }

    // Kembalikan response JSON status 200 ke antarmuka web
    return res.status(200).json({
      status: 'success',
      kategori: outputResult.kategori,
      narasiBK: outputResult.narasiBK,
      rekomendasiLayanan: outputResult.rekomendasiLayanan,
      detailParagraf: outputResult.detailParagraf || null,
      metadata: {
        nama,
        kelas,
        persentaseSkor,
        dimensiTerendah,
      },
    });
  } catch (err) {
    console.error('Server error in /api/analyze-resilience:', err);
    return res.status(500).json({
      error: 'Terjadi kesalahan internal pada server.',
      detail: err.message,
    });
  }
}
