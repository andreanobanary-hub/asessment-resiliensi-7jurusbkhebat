// URL Google Apps Script yang sudah aktif
const GAS_URL = "https://script.google.com/macros/s/AKfycbxn_OPjx8nB9_YqSzOIAwOabf4wbJxvMVns5rFFbclvXq8S2k3gnxxzbNcTsaRS89l1qQ/exec";

export interface StudentPayload {
  name?: string;
  nama?: string;
  grade?: string;
  kelas?: string;
  nisn?: string;
  score?: number;
  persentase?: number;
  category?: string;
  kategori?: string;
  lowestDimension?: string;
  dimensiTerendah?: string;
  notes?: string;
  catatan?: string;
}

export async function analyzeResilienceProfile(data: StudentPayload, userApiKey?: string) {
  // Ambil API Key dari modal pengaturan atau environment variable
  const apiKey = userApiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any).__GEMINI_KEY__ || "";

  if (!apiKey) {
    throw new Error("API Key belum terpasang. Silakan masukkan Google AI Studio API Key Anda terlebih dahulu.");
  }

  const namaSiswa = data.name || data.nama || "Siswa";
  const kelasSiswa = data.grade || data.kelas || "-";
  const skorSiswa = data.score ?? data.persentase ?? 0;
  const kategoriSiswa = data.category || data.kategori || "Sedang";
  const dimensiRendah = data.lowestDimension || data.dimensiTerendah || "Regulasi Emosi";
  const catatanSiswa = data.notes || data.catatan || "-";

  // Prompt BK ramah remaja
  const systemPrompt = `
Peran Anda adalah Guru Bimbingan dan Konseling (BK) jenjang SMP/SMA yang ramah, hangat, dan suportif.
Analisis data asesmen resiliensi peserta didik berikut:
- Nama: ${namaSiswa}
- Kelas: ${kelasSiswa}
- Persentase Resiliensi: ${skorSiswa}% (${kategoriSiswa})
- Dimensi Terendah: ${dimensiRendah}
- Catatan Situasi: ${catatanSiswa}

Instruksi Umpan Balik:
1. Paragraf 1: Apresiasi kejujuran siswa dan validasi potensi positif dirinya.
2. Paragraf 2: Berikan 2 saran praktis yang dapat diterapkan sehari-hari untuk melatih dimensi "${dimensiRendah}" dengan bahasa santai khas remaja.
3. Paragraf 3: Kalimat motivasi penutup serta ajakan ramah berkunjung ke ruang BK jika membutuhkan teman bercerita.
  `.trim();

  // 1. Panggil Gemini 3.8 Flash langsung dari browser
  const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

  const response = await fetch(geminiEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600
      }
    })
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error?.message || `Gemini API Status: ${response.status}`);
  }

  const responseData = await response.json();
  const narasiUmpanBalik = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "Terus semangat mengembangkan potensi diri!";

  // 2. Kirim otomatis ke Google Sheets
  try {
    await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        nama: namaSiswa,
        kelas: kelasSiswa,
        nisn: data.nisn || "-",
        skorTotal: skorSiswa,
        persentase: skorSiswa,
        kategori: kategoriSiswa,
        dimensiTerendah: dimensiRendah,
        analisisAI: narasiUmpanBalik
      })
    });
  } catch (sheetError) {
    console.warn("Gagal sinkronisasi ke Sheets:", sheetError);
  }

  return {
    counselorFeedback: narasiUmpanBalik,
    feedback: narasiUmpanBalik,
    analysis: narasiUmpanBalik,
    category: kategoriSiswa,
    lowestDimension: dimensiRendah
  };
}
