import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CounselorForm, FormDataState } from './components/CounselorForm';
import { CounselingResultView, CounselingAnalysisResponse } from './components/CounselingResultView';
import { QuestionnaireView } from './components/QuestionnaireView';
import { DimensionGuideModal } from './components/DimensionGuideModal';
import { ClassRecapView } from './components/ClassRecapView';
import { PRESET_STUDENTS, StudentProfile } from './data/resilienceData';
import { Heart, Sparkles, Shield, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'questionnaire' | 'recap'>('analyzer');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Default active profile: Aditya Pratama
  const [formData, setFormData] = useState<FormDataState>({
    nama: 'Aditya Pratama',
    kelas: 'Kelas IX-B SMP',
    persentaseSkor: 46,
    kategori: 'Resiliensi Rendah',
    dimensiTerendah: 'Regulasi Emosi',
    catatanKhusus: 'Mudah cemas dan gugup saat ujian matematika, kadang menangis di toilet sekolah saat ditegur pengawas.',
    gayaBahasa: 'ramah_remaja',
  });

  const [studentMeta, setStudentMeta] = useState({
    nama: 'Aditya Pratama',
    kelas: 'Kelas IX-B SMP',
    persentaseSkor: 46,
    dimensiTerendah: 'Regulasi Emosi',
  });

  const [analysisResult, setAnalysisResult] = useState<CounselingAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Perform initial analysis on mount
  useEffect(() => {
    executeAnalysis({
      nama: 'Aditya Pratama',
      kelas: 'Kelas IX-B SMP',
      persentaseSkor: 46,
      kategori: 'Resiliensi Rendah',
      dimensiTerendah: 'Regulasi Emosi',
      catatanKhusus: 'Mudah cemas dan gugup saat ujian matematika, kadang menangis di toilet sekolah saat ditegur pengawas.',
      gayaBahasa: 'ramah_remaja',
    });
  }, []);

  const executeAnalysis = async (payload: FormDataState) => {
    setIsLoading(true);
    setErrorMessage(null);

    setStudentMeta({
      nama: payload.nama,
      kelas: payload.kelas,
      persentaseSkor: payload.persentaseSkor,
      dimensiTerendah: payload.dimensiTerendah,
    });

    try {
      const res = await fetch('/api/analyze-resilience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`);
      }

      const data: CounselingAnalysisResponse = await res.json();
      setAnalysisResult(data);

      // Smooth scroll to result
      setTimeout(() => {
        const resultEl = document.getElementById('counseling-result-section');
        if (resultEl) {
          resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } catch (err: any) {
      console.error('Error during counselor analysis:', err);
      setErrorMessage(
        'Terjadi kendala saat menghubungi layanan konselor. Silakan coba kembali sesaat lagi.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeAnalysis(formData);
  };

  const handleSelectPreset = (preset: StudentProfile) => {
    const updated: FormDataState = {
      nama: preset.nama,
      kelas: preset.kelas,
      persentaseSkor: preset.persentaseSkor,
      kategori: preset.kategori,
      dimensiTerendah: preset.dimensiTerendah,
      catatanKhusus: preset.catatanKhusus || '',
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
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* TAB: ANALYZER */}
        {activeTab === 'analyzer' && (
          <div className="space-y-8">
            {/* Input Form */}
            <CounselorForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              onOpenQuestionnaire={() => setActiveTab('questionnaire')}
              onSelectPreset={handleSelectPreset}
            />

            {/* Error Message */}
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
                    Konselor BK Sedang Merumuskan Refleksi Pribadi...
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                    Menyusun narasi umpan balik 3 paragraf ramah remaja, validasi potensi diri, tips praktis {formData.dimensiTerendah}, dan rekomendasi layanan.
                  </p>
                </div>
              ) : analysisResult ? (
                <CounselingResultView
                  data={analysisResult}
                  studentMeta={studentMeta}
                />
              ) : null}
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
              handleSelectPreset(student);
            }}
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
            <span>Berdasarkan Panduan Operasional Penyelenggaraan BK (POP BK Kemendikbudristek)</span>
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
    </div>
  );
}
