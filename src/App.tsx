import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CounselorForm, FormDataState } from './components/CounselorForm';
import { CounselingResultView, CounselingAnalysisResponse } from './components/CounselingResultView';
import { QuestionnaireView } from './components/QuestionnaireView';
import { DimensionGuideModal } from './components/DimensionGuideModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ClassRecapView } from './components/ClassRecapView';
import { StudentProfile } from './data/resilienceData';
import { analyzeResilienceDirect } from './services/counselorClientService';
import { Sparkles, AlertCircle, FileText } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'questionnaire' | 'recap'>('analyzer');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');

  // Periksa apakah API key tersimpan di localStorage atau env
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gemini_api_key') || '';
      const envKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
      setApiKey(stored || envKey);
    }
  }, []);

  // Nilai awal bersih dan netral untuk data riil siswa
  const [formData, setFormData] = useState<FormDataState>({
    nama: '',
    nisn: '',
    kelas: '',
    persentaseSkor: 50,
    kategori: 'Resiliensi Sedang',
    dimensiTerendah: 'Regulasi Emosi',
    catatanKhusus: '',
    gayaBahasa: 'ramah_remaja',
  });

  const [studentMeta, setStudentMeta] = useState({
    nama: '',
    nisn: '',
    kelas: '',
    persentaseSkor: 50,
    dimensiTerendah: 'Regulasi Emosi',
  });

  const [analysisResult, setAnalysisResult] = useState<CounselingAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Helper untuk mem-parsing umpan balik konselor 3 paragraf secara aman dan utuh:
   * 1. Mengecek properti paragraph1, paragraph2, paragraph3 langsung jika tersedia dari service.
   * 2. Jika respons berupa teks gabungan tunggal, memisahkan secara aman berdasarkan penanda
   *    [PARAGRAF_1], [PARAGRAF_2], [PARAGRAF_3] atau pemisahan baris ganda '\n\n' tanpa regex yang memotong kalimat.
   * 3. Menjaga teks tips di Paragraf 2 dan motivasi di Paragraf 3 tetap utuh dan lengkap di masing-masing kartu.
   */
  const parseCounselorFeedback = (
    rawResult: any,
    dimensiTerendah: string = 'Regulasi Emosi'
  ): {
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
    narasiBK: string;
    detailParagraf: {
      apresiasiDanKekuatan: string;
      tipsPraktis: string[];
      ajakanDanPenguat: string;
    };
  } => {
    if (!rawResult) {
      return {
        paragraph1: '',
        paragraph2: '',
        paragraph3: '',
        narasiBK: '',
        detailParagraf: {
          apresiasiDanKekuatan: '',
          tipsPraktis: [],
          ajakanDanPenguat: '',
        },
      };
    }

    // 1. Cek langsung properti paragraph1, paragraph2, paragraph3 jika sudah tersedia dari service
    let p1 = typeof rawResult.paragraph1 === 'string' ? rawResult.paragraph1.trim() : '';
    let p2 = typeof rawResult.paragraph2 === 'string' ? rawResult.paragraph2.trim() : '';
    let p3 = typeof rawResult.paragraph3 === 'string' ? rawResult.paragraph3.trim() : '';

    // 2. Jika ada paragraf yang belum terisi, lakukan ekstraksi aman dari teks gabungan
    const combinedText = (
      rawResult.narasiBK ||
      rawResult.counselorFeedback ||
      rawResult.feedback ||
      rawResult.analysis ||
      ''
    ).trim();

    if ((!p1 || !p2 || !p3) && combinedText) {
      // Regex penanda penomoran paragraf fleksibel ([PARAGRAF_X], [PARAGRAF X], **[PARAGRAF_X]**, Paragraf X:)
      const marker1 = /(?:\[\s*PARAGRAF[_\s]*1\s*\]|\*\*\[?PARAGRAF[_\s]*1\]?\*\*|Paragraf\s*1\s*:)/i;
      const marker2 = /(?:\[\s*PARAGRAF[_\s]*2\s*\]|\*\*\[?PARAGRAF[_\s]*2\]?\*\*|Paragraf\s*2\s*:)/i;
      const marker3 = /(?:\[\s*PARAGRAF[_\s]*3\s*\]|\*\*\[?PARAGRAF[_\s]*3\]?\*\*|Paragraf\s*3\s*:)/i;

      if (marker2.test(combinedText)) {
        const splitAt2 = combinedText.split(marker2);
        const segmentBefore2 = splitAt2[0] || '';
        const segmentAfter2 = splitAt2.slice(1).join('\n\n');

        if (!p1) {
          p1 = segmentBefore2.replace(marker1, '').trim();
        }

        if (marker3.test(segmentAfter2)) {
          const splitAt3 = segmentAfter2.split(marker3);
          if (!p2) {
            p2 = (splitAt3[0] || '').trim();
          }
          if (!p3) {
            p3 = splitAt3.slice(1).join('\n\n').trim();
          }
        } else {
          // Jika tidak ada penanda [PARAGRAF_3], gunakan pembagian baris ganda '\n\n' secara aman
          const blocks = segmentAfter2
            .split(/\n\s*\n+/)
            .map((b: string) => b.trim())
            .filter(Boolean);
          if (blocks.length >= 2) {
            if (!p2) p2 = blocks[0];
            if (!p3) p3 = blocks.slice(1).join('\n\n');
          } else if (blocks.length === 1) {
            if (!p2) p2 = blocks[0];
          }
        }
      }

      // Jika masih ada yang belum terurai, bagi menggunakan pemisahan baris ganda '\n\n'
      if (!p1 || !p2 || !p3) {
        const cleanText = combinedText
          .replace(/(?:\[\s*PARAGRAF[_\s]*\d\s*\]|\*\*\[?PARAGRAF[_\s]*\d\]?\*\*|Paragraf\s*\d\s*:)/gi, '')
          .trim();

        const blocks = cleanText
          .split(/\n\s*\n+/)
          .map((b: string) => b.trim())
          .filter(Boolean);

        if (blocks.length >= 3) {
          if (!p1) p1 = blocks[0];
          if (!p2) p2 = blocks[1];
          if (!p3) p3 = blocks.slice(2).join('\n\n');
        } else if (blocks.length === 2) {
          if (!p1) p1 = blocks[0];
          if (!p2) p2 = blocks[1];
        } else if (blocks.length === 1 && !p1) {
          p1 = blocks[0];
        }
      }
    }

    // 3. Fallback ke detailParagraf jika masih ada yang kosong
    if (!p1 && rawResult.detailParagraf?.apresiasiDanKekuatan) {
      p1 = String(rawResult.detailParagraf.apresiasiDanKekuatan).trim();
    }
    if (!p2 && rawResult.detailParagraf?.tipsPraktis?.length) {
      p2 = Array.isArray(rawResult.detailParagraf.tipsPraktis)
        ? rawResult.detailParagraf.tipsPraktis.join(' ').trim()
        : String(rawResult.detailParagraf.tipsPraktis).trim();
    }
    if (!p3 && rawResult.detailParagraf?.ajakanDanPenguat) {
      p3 = String(rawResult.detailParagraf.ajakanDanPenguat).trim();
    }

    // 4. Fallback kalimat jika sama sekali tidak ada respon
    if (!p1) {
      p1 = 'Terima kasih atas kejujuran dan keterbukaanmu dalam mengisi asesmen resiliensi ini. Ini adalah langkah awal yang sangat berharga untuk lebih memahami potensi dan kekuatan dalam dirimu.';
    }
    if (!p2) {
      p2 = `Untuk memperkuat aspek ${dimensiTerendah}, cobalah untuk menerapkan teknik relaksasi saat menghadapi tekanan dan diskusikan hal-hal yang memicu kecemasan dengan orang yang kamu percayai. Latihlah secara perlahan dan hargai setiap progres kecilmu!`;
    }
    if (!p3) {
      p3 = 'Tetaplah melangkah dengan penuh keyakinan dan semangat. Ingatlah bahwa kamu tidak pernah sendiri; pintu ruang BK selalu terbuka lebar dan hangat kapan pun kamu ingin bercerita atau sekadar bertukar pikiran.';
    }

    const cleanFullNarasi = [p1, p2, p3].filter(Boolean).join('\n\n');

    return {
      paragraph1: p1,
      paragraph2: p2,
      paragraph3: p3,
      narasiBK: cleanFullNarasi,
      detailParagraf: {
        apresiasiDanKekuatan: p1,
        tipsPraktis: [p2],
        ajakanDanPenguat: p3,
      },
    };
  };

  /**
   * Client-Side Direct Execution:
   * 1. Memanggil Google Generative Language API (Gemini gemini-3.8-flash) langsung dari browser
   * 2. Mengirimkan hasil asesmen ke Google Apps Script Web App (Google Spreadsheet)
   */
  const executeAnalysis = async (payload: FormDataState) => {
    if (!payload.nama.trim() || !payload.kelas.trim()) {
      setErrorMessage('Mohon lengkapi Nama Siswa dan Jenjang/Kelas terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setStudentMeta({
      nama: payload.nama.trim(),
      nisn: payload.nisn.trim(),
      kelas: payload.kelas.trim(),
      persentaseSkor: payload.persentaseSkor,
      dimensiTerendah: payload.dimensiTerendah,
    });

    try {
      // Pemanggilan langsung di sisi client (Client-Side Direct)
      const rawResult = await analyzeResilienceDirect({
        nama: payload.nama.trim(),
        kelas: payload.kelas.trim(),
        nisn: payload.nisn.trim() || '-',
        skorTotal: payload.persentaseSkor,
        persentase: payload.persentaseSkor,
        kategori: payload.kategori,
        dimensiTerendah: payload.dimensiTerendah,
        catatan: payload.catatanKhusus.trim(),
        apiKey: apiKey,
      });

      // Parsing aman 3 paragraf tanpa memotong kalimat
      const parsedParagraphs = parseCounselorFeedback(rawResult, payload.dimensiTerendah);

      const finalResult: CounselingAnalysisResponse = {
        ...rawResult,
        kategori: rawResult.kategori || payload.kategori,
        rekomendasiLayanan:
          rawResult.rekomendasiLayanan ||
          (payload.persentaseSkor < 45
            ? `Konseling Individual (Fokus: Dimensi ${payload.dimensiTerendah})`
            : `Bimbingan Kelompok (Topik: Penguatan ${payload.dimensiTerendah})`),
        narasiBK: parsedParagraphs.narasiBK,
        paragraph1: parsedParagraphs.paragraph1,
        paragraph2: parsedParagraphs.paragraph2,
        paragraph3: parsedParagraphs.paragraph3,
        detailParagraf: parsedParagraphs.detailParagraf,
      };

      setAnalysisResult(finalResult);

      // Gulir halus ke kartu hasil analisis
      setTimeout(() => {
        const resultEl = document.getElementById('counseling-result-section');
        if (resultEl) {
          resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } catch (err: any) {
      console.error('Error during client-side counselor analysis:', err);
      setErrorMessage(
        'Terjadi kendala saat menganalisis asesmen. Data tetap dapat diakses menggunakan generator cadangan.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeAnalysis(formData);
  };

  const handleSelectStudentFromRecap = (student: StudentProfile) => {
    const updated: FormDataState = {
      nama: student.nama,
      nisn: student.nisn || '',
      kelas: student.kelas,
      persentaseSkor: student.persentaseSkor,
      kategori: student.kategori,
      dimensiTerendah: student.dimensiTerendah,
      catatanKhusus: student.catatanKhusus || '',
      gayaBahasa: 'ramah_remaja',
    };
    setFormData(updated);
    setActiveTab('analyzer');
    executeAnalysis(updated);
  };

  const handleQuestionnaireComplete = (result: {
    nama: string;
    kelas: string;
    persentaseSkor: number;
    kategori: string;
    dimensiTerendah: string;
    skorDimensi: Record<string, number>;
  }) => {
    const updated: FormDataState = {
      nama: result.nama,
      nisn: formData.nisn || '',
      kelas: result.kelas,
      persentaseSkor: result.persentaseSkor,
      kategori: result.kategori,
      dimensiTerendah: result.dimensiTerendah,
      catatanKhusus: `Asesmen mandiri 14 butir resiliensi dengan skor total ${result.persentaseSkor}%.`,
      gayaBahasa: 'ramah_remaja',
    };
    setFormData(updated);
    setActiveTab('analyzer');
    executeAnalysis(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Header
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenApiKey={() => setIsApiKeyModalOpen(true)}
        hasApiKey={Boolean(apiKey)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* TAB: ANALYZER */}
        {activeTab === 'analyzer' && (
          <div className="space-y-8">
            {/* Input Form Bersih & Siap Isi Data Riil */}
            <CounselorForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              onOpenQuestionnaire={() => setActiveTab('questionnaire')}
              hasApiKey={Boolean(apiKey)}
              onOpenApiKey={() => setIsApiKeyModalOpen(true)}
            />

            {/* Error Message jika ada */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Analysis Result Section */}
            <div id="counseling-result-section">
              {isLoading ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center animate-bounce mb-4">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Menganalisis & Mengirim ke Google Spreadsheet...
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                    Menghubungi Gemini AI Studio, menyusun narasi umpan balik 3 paragraf, dan merekam data asesmen {formData.nama}.
                  </p>
                </div>
              ) : analysisResult ? (
                <CounselingResultView
                  data={analysisResult}
                  studentMeta={studentMeta}
                />
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center shadow-2xs">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    Siap Menganalisis Data Resiliensi Peserta Didik
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                    Silakan isi Nama Siswa, Jenjang/Kelas, persentase skor, dan dimensi terendah pada formulir di atas, lalu klik <strong>"Analisis & Susun Umpan Balik Konselor"</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: QUESTIONNAIRE */}
        {activeTab === 'questionnaire' && (
          <QuestionnaireView
            onComplete={handleQuestionnaireComplete}
            onCancel={() => setActiveTab('analyzer')}
            initialNama={formData.nama}
            initialKelas={formData.kelas}
          />
        )}

        {/* TAB: CLASS RECAP */}
        {activeTab === 'recap' && (
          <ClassRecapView
            onSelectStudent={(student) => {
              handleSelectStudentFromRecap(student);
            }}
            onNavigateToForm={() => setActiveTab('analyzer')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-700">Ruang BK Resiliensi Siswa SMP/SMA</span>
            <span>•</span>
            <span>Client-Side Direct & Google Spreadsheet Web App</span>
          </div>

          <p className="text-slate-400">
            Pendekatan Humanis, Non-Judgmental & Penguatan Potensi Positif Remaja
          </p>
        </div>
      </footer>

      {/* 7 Dimensions Guide Modal */}
      <DimensionGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Gemini API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={(newKey) => setApiKey(newKey)}
      />
    </div>
  );
}
