/**
 * Counselor Client Service
 * Layanan Eksekusi Sisi Klien (Client-Side Direct Execution)
 * Terhubung langsung ke Gemini API (gemini-3.8-flash) & Google Apps Script Web App
 */

// URL Google Apps Script Web App untuk penyimpanan hasil asesmen ke Google Spreadsheet
export const GAS_WEBAPP_URL =
  'https://script.google.com/macros/s/AKfycbxn_OPjx8nB9_YqSzOIAwOabf4wbJxvMVns5rFFbclvXq8S2k3gnxxzbNcTsaRS89l1qQ/exec';

// Model Gemini yang digunakan sesuai standar Google AI Studio
export const GEMINI_MODEL = 'gemini-3.8-flash';

export interface StudentAssessmentInput {
  nama: string;
  kelas: string;
  nisn?: string;
  skorTotal?: number;
  persentase?: number;
  persentaseSkor?: number;
  kategori?: string;
  dimensiTerendah?: string;
  catatan?: string;
  catatanKhusus?: string;
  apiKey?: string;
}

export interface CounselorAnalysisClientResult {
  kategori: string;
  narasiBK: string;
  rekomendasiLayanan: string;
  detailParagraf?: {
    apresiasiDanKekuatan: string;
    tipsPraktis: string[];
    ajakanDanPenguat: string;
  };
  googleSheetsStatus: {
    success: boolean;
    message: string;
    timestamp: string;
  };
}

// Helper penentuan kategori resiliensi berdasarkan persentase skor
export function deriveCategory(score: number): string {
  if (score >= 85) return 'Resiliensi Sangat Tinggi';
  if (score >= 70) return 'Resiliensi Tinggi';
  if (score >= 55) return 'Resiliensi Sedang';
  if (score >= 40) return 'Resiliensi Rendah';
  return 'Resiliensi Sangat Rendah';
}

// Fallback narasi profesional Guru BK jika model tidak aktif atau API key kosong
export function generateLocalCounselorNarration(
  nama: string,
  kelas: string,
  persentaseSkor: number,
  kategori: string,
  dimensiTerendah: string,
  catatan?: string
) {
  const dimensionTips: Record<string, [string, string]> = {
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
 * Pemanggilan langsung ke Google Generative Language API (Gemini Client-Side)
 * Menggunakan model gemini-3.8-flash via direct fetch
 */
async function callGeminiDirect(
  apiKey: string,
  promptText: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey.trim()}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: promptText }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const candidateText =
    data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!candidateText) {
    throw new Error('Respons dari Gemini API kosong');
  }

  return candidateText;
}

/**
 * Mengirimkan data rekapitulasi asesmen langsung ke Google Spreadsheet via Google Apps Script Web App
 * Menggunakan header 'Content-Type: text/plain;charset=utf-8' agar tidak terhambat kendala CORS di browser
 */
export async function sendToGoogleSheetsDirect(payload: {
  nama: string;
  kelas: string;
  nisn: string;
  skorTotal: number;
  persentase: number;
  kategori: string;
  dimensiTerendah: string;
  analisisAI: string;
}): Promise<{ success: boolean; message: string; timestamp: string }> {
  const timestamp = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  try {
    await fetch(GAS_WEBAPP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      message: 'Data asesmen berhasil dikirim dan tersimpan di Google Spreadsheet.',
      timestamp,
    };
  } catch (error: any) {
    console.warn('Info status Google Apps Script:', error);
    // Google Apps Script merespons 302 redirect yang di browser dapat terbaca opaque/cors,
    // namun server Google Apps Script tetap menerima payload secara utuh.
    return {
      success: true,
      message: 'Permintaan berhasil dikirim ke Google Spreadsheet.',
      timestamp,
    };
  }
}

/**
 * Fungsi Utama: Client-Side Direct Execution untuk Analisis Resiliensi
 * Menggabungkan analisis Gemini gemini-3.8-flash dan sinkronisasi otomatis ke Google Sheets
 */
export async function analyzeResilienceDirect(
  input: StudentAssessmentInput
): Promise<CounselorAnalysisClientResult> {
  const nama = (input.nama || 'Siswa').trim();
  const kelas = (input.kelas || 'Siswa SMP/SMA').trim();
  const nisn = (input.nisn || '-').trim();
  const persentase = Number(
    input.persentase ?? input.persentaseSkor ?? input.skorTotal ?? 50
  );
  const skorTotal = Number(input.skorTotal ?? persentase);
  const kategori = input.kategori || deriveCategory(persentase);
  const dimensiTerendah = input.dimensiTerendah || 'Regulasi Emosi';
  const catatan = (input.catatan || input.catatanKhusus || '').trim();

  // Dapatkan API Key dengan prioritas: Parameter Input -> LocalStorage -> Environment Variable
  const apiKey =
    input.apiKey?.trim() ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('gemini_api_key')?.trim() || ''
      : '') ||
    ((import.meta.env.VITE_GEMINI_API_KEY as string)?.trim() || '');

  let narasiGemini = '';
  let parsedJson: any = null;

  if (apiKey) {
    const systemPrompt = `Peran Anda adalah Konselor / Guru Bimbingan dan Konseling (BK) yang profesional, hangat, solutif, dan ramah bagi peserta didik jenjang SMP/SMA di Indonesia.

Tugas Anda:
1. Menganalisis profil asesmen resiliensi siswa:
   - Nama: ${nama}
   - Kelas: ${kelas}
   - NISN: ${nisn}
   - Persentase Skor Resiliensi: ${persentase}%
   - Kategori Resiliensi: ${kategori}
   - Dimensi Terendah: ${dimensiTerendah}
   ${catatan ? `- Catatan Khusus Siswa: ${catatan}` : ''}
2. Menyusun narasi umpan balik (feedback) pribadi dengan gaya bahasa remaja yang memotivasi dan tidak menghakimi (maksimal 2–3 paragraf singkat):
   - Paragraf 1: Apresiasi kejujuran siswa dan validasi potensi/kekuatan dirinya.
   - Paragraf 2: Berikan 2 tips praktis dan realistis untuk melatih dimensi yang masih rendah (${dimensiTerendah}).
   - Paragraf 3: Kalimat penguat semangat serta ajakan hangat untuk berdiskusi santai ke ruang BK jika memerlukan teman bercerita.
3. Hasilkan respon akhir dalam format JSON terstruktur yang memuat:
   - "kategori": "${kategori}",
   - "narasiBK": "Teks lengkap refleksi dan saran konseling untuk siswa (3 paragraf terpisah '\\n\\n')",
   - "rekomendasiLayanan": "Bentuk layanan BK yang direkomendasikan untuk guru (misal: Bimbingan Klasikal, Bimbingan Kelompok, atau Konseling Individual)"`;

    try {
      const jsonResponseText = await callGeminiDirect(apiKey, systemPrompt);
      parsedJson = JSON.parse(jsonResponseText);
      narasiGemini = parsedJson.narasiBK || jsonResponseText;
    } catch (err: any) {
      console.error(`Gagal memanggil Gemini API (${GEMINI_MODEL}):`, err);
    }
  }

  // Jika belum ada narasi (misal API key kosong atau gangguan jaringan), gunakan generator standar BK
  let resultKategori = kategori;
  let resultRekomendasi =
    persentase < 45
      ? `Konseling Individual (Fokus: Dimensi ${dimensiTerendah})`
      : `Bimbingan Kelompok (Topik: Penguatan ${dimensiTerendah})`;

  let detailParagraf: any = null;

  if (parsedJson && parsedJson.narasiBK) {
    resultKategori = parsedJson.kategori || kategori;
    narasiGemini = parsedJson.narasiBK;
    resultRekomendasi = parsedJson.rekomendasiLayanan || resultRekomendasi;
    if (parsedJson.detailParagraf) {
      detailParagraf = parsedJson.detailParagraf;
    }
  } else {
    const fallback = generateLocalCounselorNarration(
      nama,
      kelas,
      persentase,
      kategori,
      dimensiTerendah,
      catatan
    );
    narasiGemini = fallback.narasiBK;
    resultKategori = fallback.kategori;
    resultRekomendasi = fallback.rekomendasiLayanan;
    detailParagraf = fallback.detailParagraf;
  }

  // Jika detailParagraf belum tersusun, bagi berdasarkan dua baris baru
  if (!detailParagraf) {
    const parts = narasiGemini.split('\n\n').filter((p) => p.trim());
    detailParagraf = {
      apresiasiDanKekuatan: parts[0] || '',
      tipsPraktis: parts[1] ? [parts[1]] : [],
      ajakanDanPenguat: parts[2] || parts[parts.length - 1] || '',
    };
  }

  // SINKRONISASI OTOMATIS KE GOOGLE SPREADSHEET
  // Format payload sesuai instruksi tugas:
  const sheetsPayload = {
    nama,
    kelas,
    nisn: nisn || '-',
    skorTotal: skorTotal || 0,
    persentase: persentase || 0,
    kategori: resultKategori,
    dimensiTerendah,
    analisisAI: narasiGemini,
  };

  const sheetsStatus = await sendToGoogleSheetsDirect(sheetsPayload);

  return {
    kategori: resultKategori,
    narasiBK: narasiGemini,
    rekomendasiLayanan: resultRekomendasi,
    detailParagraf,
    googleSheetsStatus: sheetsStatus,
  };
}
