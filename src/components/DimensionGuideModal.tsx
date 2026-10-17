import React from 'react';
import { X, BookOpen, Heart, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { RESILIENCE_DIMENSIONS } from '../data/resilienceData';

interface DimensionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DimensionGuideModal: React.FC<DimensionGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Panduan 7 Dimensi Resiliensi Siswa (Reivich & Shatté)
              </h3>
              <p className="text-xs text-emerald-200/90">
                Kerangka teoretis dan acuan intervensi Bimbingan dan Konseling (POP-BK SMP/SMA)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-950 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong>Prinsip Konseling Resiliensi Remaja:</strong> Resiliensi adalah kemampuan kapasitas psikologis yang dapat dipelajari, dilatih, dan dikembangkan (learnable). Guru BK mengapresiasi kejujuran siswa tanpa melabeli "lemah" atau "gagal", melainkan melihat dimensi terendah sebagai area bertumbuh (growth opportunity).
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(RESILIENCE_DIMENSIONS).map(([name, info]) => (
              <div
                key={name}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span>{name}</span>
                  </h4>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                    {info.tagline}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {info.description}
                </p>

                <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
                  <div className="flex items-start gap-1.5 text-xs text-rose-800 bg-rose-50/60 p-2 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                    <span><strong>Tanda Dimensi Rendah:</strong> {info.symptomsLow}</span>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1 pt-1">
                    <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider text-emerald-700">
                      Rekomendasi Tips Praktis BK:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                      <li>{info.defaultTips[0]}</li>
                      <li>{info.defaultTips[1]}</li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-all"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
