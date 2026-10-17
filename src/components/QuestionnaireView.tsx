import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  Sparkles,
  Award,
  ChevronRight
} from 'lucide-react';
import { 
  QUESTIONNAIRE_QUESTIONS, 
  RESILIENCE_DIMENSIONS,
  getCategoryFromScore 
} from '../data/resilienceData';

interface QuestionnaireViewProps {
  onComplete: (result: {
    nama: string;
    kelas: string;
    persentaseSkor: number;
    kategori: string;
    dimensiTerendah: string;
    skorDimensi: Record<string, number>;
  }) => void;
  onCancel: () => void;
  initialNama?: string;
  initialKelas?: string;
}

export const QuestionnaireView: React.FC<QuestionnaireViewProps> = ({
  onComplete,
  onCancel,
  initialNama = '',
  initialKelas = 'Kelas IX SMP',
}) => {
  const [nama, setNama] = useState(initialNama);
  const [kelas, setKelas] = useState(initialKelas);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const scaleOptions = [
    { value: 1, label: 'Sangat Tidak Sesuai', short: 'STS', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { value: 2, label: 'Tidak Sesuai', short: 'TS', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { value: 3, label: 'Ragu-ragu / Kadang-kadang', short: 'RR', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { value: 4, label: 'Sesuai', short: 'S', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    { value: 5, label: 'Sangat Sesuai', short: 'SS', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ];

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / QUESTIONNAIRE_QUESTIONS.length) * 100);

  const handleSelect = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleFillDemoAnswers = () => {
    // Fill realistic answers with one low dimension (Regulasi Emosi / Kontrol Impuls)
    const demo: Record<number, number> = {};
    QUESTIONNAIRE_QUESTIONS.forEach((q) => {
      if (q.dimensi === 'Regulasi Emosi') {
        demo[q.id] = Math.random() > 0.5 ? 2 : 1;
      } else if (q.dimensi === 'Kontrol Impuls') {
        demo[q.id] = Math.random() > 0.5 ? 2 : 3;
      } else {
        demo[q.id] = Math.floor(Math.random() * 2) + 4; // 4 or 5
      }
    });
    setAnswers(demo);
    if (!nama) setNama('Revalina Putri');
  };

  const handleCalculate = () => {
    if (!nama.trim()) {
      alert('Mohon masukkan nama siswa terlebih dahulu.');
      return;
    }

    if (answeredCount < QUESTIONNAIRE_QUESTIONS.length) {
      alert(`Mohon lengkapi seluruh butir kuesioner (${answeredCount}/${QUESTIONNAIRE_QUESTIONS.length} terisi).`);
      return;
    }

    // Calculate score per dimension (each has 2 questions, max raw score = 10, percentage = (sum/10)*100)
    const dimensionRawScores: Record<string, number> = {};
    const dimensionCounts: Record<string, number> = {};

    QUESTIONNAIRE_QUESTIONS.forEach((q) => {
      const val = answers[q.id] || 3;
      dimensionRawScores[q.dimensi] = (dimensionRawScores[q.dimensi] || 0) + val;
      dimensionCounts[q.dimensi] = (dimensionCounts[q.dimensi] || 0) + 1;
    });

    const skorDimensi: Record<string, number> = {};
    let lowestDimension = 'Regulasi Emosi';
    let minScore = 999;

    let totalRaw = 0;
    Object.keys(dimensionRawScores).forEach((dim) => {
      const maxPossible = dimensionCounts[dim] * 5;
      const pct = Math.round((dimensionRawScores[dim] / maxPossible) * 100);
      skorDimensi[dim] = pct;
      totalRaw += dimensionRawScores[dim];

      if (pct < minScore) {
        minScore = pct;
        lowestDimension = dim;
      }
    });

    // Total percentage
    const maxTotalRaw = QUESTIONNAIRE_QUESTIONS.length * 5;
    const totalPercentage = Math.round((totalRaw / maxTotalRaw) * 100);
    const category = getCategoryFromScore(totalPercentage);

    onComplete({
      nama,
      kelas,
      persentaseSkor: totalPercentage,
      kategori: category,
      dimensiTerendah: lowestDimension,
      skorDimensi,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-white/10 text-emerald-100">
                <BookOpen className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-200">
                Instrumen Asesmen Singkat BK
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Kuesioner 14 Butir Resiliensi Siswa SMP/SMA
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
              Mengukur 7 dimensi resiliensi (Reivich & Shatté). Diisi secara jujur tanpa penilaian benar atau salah.
            </p>
          </div>

          <button
            type="button"
            onClick={handleFillDemoAnswers}
            className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            <span>Isi Simulasi Cepat</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-3 border-t border-teal-600/40">
          <div className="flex items-center justify-between text-xs text-teal-100 font-medium mb-1.5">
            <span>Kemajuan Pengisian: {answeredCount} dari {QUESTIONNAIRE_QUESTIONS.length} Butir</span>
            <span className="font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-300 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Student Meta Inputs */}
      <div className="p-5 bg-slate-50/80 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Nama Siswa
          </label>
          <input
            type="text"
            placeholder="Contoh: Revalina Putri"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 focus:border-emerald-500 outline-hidden"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Jenjang & Kelas
          </label>
          <input
            type="text"
            placeholder="Contoh: Kelas IX-A SMP / Kelas XI SMA"
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 focus:border-emerald-500 outline-hidden"
          />
        </div>
      </div>

      {/* Questions list */}
      <div className="p-5 sm:p-6 space-y-6">
        {QUESTIONNAIRE_QUESTIONS.map((item, index) => {
          const selectedVal = answers[item.id];
          const dimInfo = RESILIENCE_DIMENSIONS[item.dimensi];

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                selectedVal
                  ? 'bg-white border-slate-200 shadow-2xs'
                  : 'bg-slate-50/60 border-slate-200/70'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                      Dimensi: {item.dimensi}
                    </span>
                    <p className="text-sm font-medium text-slate-800 mt-0.5">
                      {item.pertanyaan}
                    </p>
                  </div>
                </div>
              </div>

              {/* Likert Scale 1-5 buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                {scaleOptions.map((opt) => {
                  const isChecked = selectedVal === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(item.id, opt.value)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-600 text-white font-bold shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-sm font-bold">{opt.value}</span>
                      <span className="block text-[10px] mt-0.5 line-clamp-1 opacity-90">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
        >
          Batal & Kembali ke Formulir Manual
        </button>

        <button
          type="button"
          onClick={handleCalculate}
          disabled={answeredCount < QUESTIONNAIRE_QUESTIONS.length || !nama.trim()}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Award className="w-4 h-4 text-emerald-200" />
          <span>Selesai & Analisis Umpan Balik Konselor</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
