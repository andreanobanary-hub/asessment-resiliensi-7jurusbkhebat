import React from 'react';
import { Heart, Sparkles, BookOpen, ShieldCheck, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenGuide: () => void;
  activeTab: 'analyzer' | 'questionnaire' | 'recap';
  setActiveTab: (tab: 'analyzer' | 'questionnaire' | 'recap') => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide, activeTab, setActiveTab }) => {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          {/* Logo & Brand Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-100">
              <Heart className="w-5 h-5 fill-white/90" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  Ruang BK <span className="text-emerald-600 font-extrabold">Resiliensi</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Standar POP-BK SMP/SMA
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Sistem Konselor Guru BK: Analisis Profil, Umpan Balik Ramah Remaja & Rekomendasi Layanan
              </p>
            </div>
          </div>

          {/* Navigation & Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('analyzer')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'analyzer'
                    ? 'bg-white text-emerald-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analisis Profil Siswa</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('questionnaire')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'questionnaire'
                    ? 'bg-white text-emerald-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Kuesioner 14 Butir</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('recap')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'recap'
                    ? 'bg-white text-emerald-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Rekapitulasi Kelas</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenGuide}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors"
              title="Panduan 7 Dimensi Resiliensi Guru BK"
            >
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Panduan 7 Dimensi</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
