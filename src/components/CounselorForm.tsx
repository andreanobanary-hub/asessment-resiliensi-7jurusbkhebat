import React from 'react';
import { 
  Sparkles, 
  User, 
  GraduationCap, 
  Activity, 
  AlertCircle, 
  FileText, 
  RotateCcw,
  BookOpen,
  ArrowRight,
  Smile
} from 'lucide-react';
import { 
  RESILIENCE_DIMENSIONS, 
  PRESET_STUDENTS, 
  StudentProfile, 
  getCategoryFromScore,
  getCategoryBadge 
} from '../data/resilienceData';

export interface FormDataState {
  nama: string;
  kelas: string;
  persentaseSkor: number;
  kategori: string;
  dimensiTerendah: string;
  catatanKhusus: string;
  gayaBahasa: string;
}

interface CounselorFormProps {
  formData: FormDataState;
  setFormData: React.Dispatch<React.SetStateAction<FormDataState>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onOpenQuestionnaire: () => void;
  onSelectPreset: (preset: StudentProfile) => void;
}

export const CounselorForm: React.FC<CounselorFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  isLoading,
  onOpenQuestionnaire,
  onSelectPreset,
}) => {
  const handleScoreChange = (score: number) => {
    const clamped = Math.max(0, Math.min(100, score));
    const autoCategory = getCategoryFromScore(clamped);
    setFormData((prev) => ({
      ...prev,
      persentaseSkor: clamped,
      kategori: autoCategory,
    }));
  };

  const badgeStyle = getCategoryBadge(formData.kategori);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Form Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 p-5 sm:p-6 text-white relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center justify-center p-1 rounded-md bg-white/10 text-emerald-100">
                <Smile className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                Profil Asesmen Siswa
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Formulir Input Data Resiliensi
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
              Masukkan data asesmen untuk menyusun narasi umpan balik BK ramah remaja dan rekomendasi layanan.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenQuestionnaire}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-white text-emerald-800 hover:bg-emerald-50 shadow-sm transition-all"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Kuesioner 14 Butir</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Preset quick buttons */}
        <div className="mt-4 pt-3.5 border-t border-emerald-600/40">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-emerald-100 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Muat Contoh Profil Siswa:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_STUDENTS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPreset(preset)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-900/40 hover:bg-emerald-900/70 border border-emerald-400/30 text-white transition-all flex items-center gap-1"
                >
                  <span>{preset.nama}</span>
                  <span className="text-[10px] text-emerald-200/90 font-mono">
                    ({preset.persentaseSkor}%)
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Fields */}
      <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nama Siswa */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nama Lengkap Siswa <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Rafi Pratama"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm font-medium text-slate-800 transition-all outline-hidden"
            />
          </div>

          {/* Jenjang / Kelas */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Jenjang & Kelas <span className="text-rose-500">*</span></span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Contoh: Kelas IX-A SMP / Kelas XI SMA"
                value={formData.kelas}
                onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm font-medium text-slate-800 transition-all outline-hidden"
              />
              <select
                aria-label="Pilih opsi jenjang cepat"
                onChange={(e) => {
                  if (e.target.value) {
                    setFormData({ ...formData, kelas: e.target.value });
                  }
                }}
                className="px-2.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium text-slate-700 focus:border-emerald-500 outline-hidden"
                defaultValue=""
              >
                <option value="" disabled>Pilihan Cepat</option>
                <option value="Kelas VII SMP">Kelas VII SMP</option>
                <option value="Kelas VIII SMP">Kelas VIII SMP</option>
                <option value="Kelas IX SMP">Kelas IX SMP</option>
                <option value="Kelas X SMA">Kelas X SMA</option>
                <option value="Kelas XI SMA">Kelas XI SMA</option>
                <option value="Kelas XII SMA">Kelas XII SMA</option>
                <option value="Kelas X SMK">Kelas X SMK</option>
                <option value="Kelas XI SMK">Kelas XI SMK</option>
                <option value="Kelas XII SMK">Kelas XII SMK</option>
              </select>
            </div>
          </div>
        </div>

        {/* Persentase Skor & Kategori Resiliensi */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>Persentase Skor Resiliensi <span className="text-rose-500">*</span></span>
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Skala total asesmen resiliensi siswa (0% - 100%)
              </p>
            </div>

            {/* Score display & badge */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.persentaseSkor}
                  onChange={(e) => handleScoreChange(Number(e.target.value))}
                  className="w-14 text-center text-lg font-black text-slate-800 outline-hidden focus:text-emerald-700"
                />
                <span className="text-sm font-bold text-slate-500">%</span>
              </div>

              <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                <span className={`w-2 h-2 rounded-full ${badgeStyle.dot}`}></span>
                <span>{formData.kategori}</span>
              </div>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="space-y-1.5">
            <input
              type="range"
              min="0"
              max="100"
              value={formData.persentaseSkor}
              onChange={(e) => handleScoreChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            {/* Range markers */}
            <div className="flex justify-between text-[11px] font-medium text-slate-600">
              <span className="text-rose-700">0% Sangat Rendah</span>
              <span className="text-orange-700">40% Rendah</span>
              <span className="text-amber-800">55% Sedang</span>
              <span className="text-teal-700">70% Tinggi</span>
              <span className="text-emerald-700">85-100% S.Tinggi</span>
            </div>
          </div>

          {/* Category override if counselor has clinical notes */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Kategori terdeteksi otomatis: <strong className="text-slate-700">{formData.kategori}</strong></span>
            <select
              aria-label="Pilih kategori resiliensi manual"
              value={formData.kategori}
              onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
              className="text-xs border border-slate-200 rounded-lg bg-white px-2 py-1 font-medium text-slate-700"
            >
              <option value="Resiliensi Sangat Rendah">Resiliensi Sangat Rendah (&lt; 40%)</option>
              <option value="Resiliensi Rendah">Resiliensi Rendah (40% - 54%)</option>
              <option value="Resiliensi Sedang">Resiliensi Sedang (55% - 69%)</option>
              <option value="Resiliensi Tinggi">Resiliensi Tinggi (70% - 84%)</option>
              <option value="Resiliensi Sangat Tinggi">Resiliensi Sangat Tinggi (&ge; 85%)</option>
            </select>
          </div>
        </div>

        {/* Dimensi Terendah Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Dimensi Resiliensi Terendah <span className="text-rose-500">*</span></span>
            </label>
            <span className="text-xs text-slate-500">
              Aspek yang membutuhkan penguatan khusus di Paragraf 2
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {Object.entries(RESILIENCE_DIMENSIONS).map(([name, info]) => {
              const isSelected = formData.dimensiTerendah === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setFormData({ ...formData, dimensiTerendah: name })}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-bold text-xs sm:text-sm text-slate-800">
                      {name}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mb-1 font-medium">
                    {info.tagline}
                  </p>
                  <p className="text-[10px] text-slate-400 line-clamp-2">
                    {info.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Catatan Khusus & Situasi Siswa */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Catatan Khusus / Situasi Siswa (Opsional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Contoh: Siswa sering cemas saat ujian matematika, pendiam saat kerja kelompok, atau baru pindah dari luar kota..."
            value={formData.catatanKhusus}
            onChange={(e) => setFormData({ ...formData, catatanKhusus: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm text-slate-800 transition-all outline-hidden"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Informasi tambahan membantu Guru BK menyusun umpan balik yang lebih personal dan kontekstual.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setFormData({
                nama: '',
                kelas: 'Kelas IX SMP',
                persentaseSkor: 50,
                kategori: 'Resiliensi Sedang',
                dimensiTerendah: 'Regulasi Emosi',
                catatanKhusus: '',
                gayaBahasa: 'ramah_remaja',
              });
            }}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Formulir</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || !formData.nama.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Konselor BK Sedang Menganalisis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Analisis & Susun Umpan Balik Konselor</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
