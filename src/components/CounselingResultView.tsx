import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Printer, 
  Code, 
  BookOpen, 
  Share2, 
  MessageSquare,
  Compass,
  FileCheck,
  Award
} from 'lucide-react';
import { getCategoryBadge } from '../data/resilienceData';

export interface CounselingAnalysisResponse {
  kategori: string;
  narasiBK: string;
  rekomendasiLayanan: string;
  detailParagraf?: {
    apresiasiDanKekuatan: string;
    tipsPraktis: string[];
    ajakanDanPenguat: string;
  };
  rencanaTindakLanjutGuru?: {
    tujuanLayanan: string;
    tahapanAksi: string[];
    indikatorKeberhasilan: string;
    referensiPOP_BK?: string;
  };
}

interface CounselingResultViewProps {
  data: CounselingAnalysisResponse;
  studentMeta: {
    nama: string;
    kelas: string;
    persentaseSkor: number;
    dimensiTerendah: string;
  };
}

export const CounselingResultView: React.FC<CounselingResultViewProps> = ({
  data,
  studentMeta,
}) => {
  const [activeTab, setActiveTab] = useState<'surat' | 'layanan' | 'json'>('surat');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);

  // Exact JSON output conforming strictly to Task #3 requirement
  const rawStandardJson = {
    kategori: data.kategori,
    narasiBK: data.narasiBK,
    rekomendasiLayanan: data.rekomendasiLayanan,
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Web Speech API for reading the feedback aloud to the student in Indonesian
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Browser ini belum mendukung pembacaan audio otomatis.');
      return;
    }

    if (isPlayingSpeech) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(data.narasiBK);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Try to find an Indonesian voice if available
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find(
      (v) => v.lang.includes('id') || v.lang.includes('ID') || v.name.includes('Indonesian')
    );
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }

    utterance.onend = () => setIsPlayingSpeech(false);
    utterance.onerror = () => setIsPlayingSpeech(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingSpeech(true);
  };

  const badgeStyle = getCategoryBadge(data.kategori);

  // Split narrative into paragraphs if not split already
  const paragraphs = data.narasiBK.split('\n\n').filter((p) => p.trim().length > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all">
      {/* Header Result Card */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <FileCheck className="w-3.5 h-3.5 mr-1" /> Hasil Analisis Konselor BK
              </span>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-baseline gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {studentMeta.nama}
              </h2>
              <span className="text-sm font-medium text-slate-300 px-2 py-0.5 rounded-md bg-white/10">
                {studentMeta.kelas}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
                <span className="text-xs text-slate-400">Skor Resiliensi:</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {studentMeta.persentaseSkor}%
                </span>
              </div>

              <div className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                <span className={`w-2 h-2 rounded-full ${badgeStyle.dot}`}></span>
                <span>{data.kategori}</span>
              </div>

              <div className="bg-amber-950/40 text-amber-300 border border-amber-600/30 px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Dimensi Terendah: <strong>{studentMeta.dimensiTerendah}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick utility buttons */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              type="button"
              onClick={handleToggleSpeech}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
                isPlayingSpeech
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Dengarkan Suara Konselor BK (Text to Speech)"
            >
              {isPlayingSpeech ? (
                <>
                  <VolumeX className="w-4 h-4 animate-pulse" />
                  <span>Hentikan Suara</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-300" />
                  <span>Dengarkan Suara</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Cetak Dokumen Konseling"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            <button
              type="button"
              onClick={() => copyToClipboard(data.narasiBK, 'narasi')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
            >
              {copiedType === 'narasi' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Teks Narasi</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700 mt-6 -mb-5 sm:-mb-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('surat')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'surat'
                ? 'border-emerald-400 text-emerald-400 bg-white/5 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Surat Umpan Balik Siswa</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('layanan')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'layanan'
                ? 'border-emerald-400 text-emerald-400 bg-white/5 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Rencana Layanan Guru BK</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'json'
                ? 'border-emerald-400 text-emerald-400 bg-white/5 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Format JSON Terstruktur</span>
            <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
              Tugas #3
            </span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-5 sm:p-7">
        {/* TAB 1: SURAT UMPAN BALIK SISWA */}
        {activeTab === 'surat' && (
          <div className="space-y-6">
            {/* Recommendation summary card */}
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Rekomendasi Layanan BK Terpilih
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {data.rekomendasiLayanan}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const waText = encodeURIComponent(
                      `*Umpan Balik Asesmen Resiliensi BK*\nNama: ${studentMeta.nama} (${studentMeta.kelas})\nKategori: ${data.kategori}\n\n${data.narasiBK}\n\n_Salam hangat dari Guru Bimbingan dan Konseling_`
                    );
                    window.open(`https://wa.me/?text=${waText}`, '_blank');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-100/50 shadow-2xs transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Kirim ke WhatsApp</span>
                </button>
              </div>
            </div>

            {/* The 3-Paragraph Student Feedback Card */}
            <div className="bg-slate-50/60 rounded-2xl border border-slate-200/90 p-5 sm:p-8 space-y-6 shadow-2xs relative">
              {/* Decorative gentle quote watermark */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Catatan Kasih & Refleksi Konselor untuk {studentMeta.nama}
                  </span>
                </div>
                <span className="text-xs italic text-slate-500 font-medium">
                  Maksimal 3 Paragraf Reflektif
                </span>
              </div>

              {/* Render Structured Paragraphs */}
              <div className="space-y-5 text-slate-800 leading-relaxed text-sm sm:text-base">
                {/* Paragraf 1: Apresiasi & Validasi */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs relative pl-5 border-l-4 border-l-emerald-500">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Paragraf 1: Apresiasi Kejujuran & Validasi Potensi Diri</span>
                  </div>
                  <p className="text-slate-700 font-normal">
                    {data.detailParagraf?.apresiasiDanKekuatan || paragraphs[0] || data.narasiBK}
                  </p>
                </div>

                {/* Paragraf 2: 2 Tips Praktis & Realistis */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs relative pl-5 border-l-4 border-l-amber-500">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Paragraf 2: 2 Tips Praktis untuk Melatih Dimensi "{studentMeta.dimensiTerendah}"</span>
                  </div>

                  {data.detailParagraf?.tipsPraktis && data.detailParagraf.tipsPraktis.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      <p className="text-slate-700">
                        Untuk memperkuat aspek <strong>{studentMeta.dimensiTerendah}</strong>, kamu bisa mencoba dua kebiasaan sederhana berikut:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        {data.detailParagraf.tipsPraktis.map((tip, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm text-amber-950 font-medium flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-700 font-normal">
                      {paragraphs[1] || 'Latih keterampilan diri secara bertahap setiap hari.'}
                    </p>
                  )}
                </div>

                {/* Paragraf 3: Penguat Semangat & Undangan Hangat ke Ruang BK */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs relative pl-5 border-l-4 border-l-teal-500">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 mb-1.5">
                    <Heart className="w-3.5 h-3.5" />
                    <span>Paragraf 3: Penguat Semangat & Undangan Hangat ke Ruang BK</span>
                  </div>
                  <p className="text-slate-700 font-normal">
                    {data.detailParagraf?.ajakanDanPenguat || paragraphs[2] || 'Ruang BK selalu terbuka untukmu.'}
                  </p>
                </div>
              </div>

              {/* Counselor signature footer */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 gap-2">
                <span className="italic">
                  "Resiliensi bukanlah tentang tidak pernah jatuh, melainkan keberanian untuk bangkit kembali satu kali lebih banyak."
                </span>
                <span className="font-semibold text-slate-700">
                  — Konselor / Guru BK SMP/SMA
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RENCANA LAYANAN GURU BK */}
        {activeTab === 'layanan' && (
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Bentuk Layanan yang Direkomendasikan
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {data.rekomendasiLayanan}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Disusun berdasarkan kebutuhan siswa ({studentMeta.nama}), kategori {data.kategori}, serta dimensi {studentMeta.dimensiTerendah}.
                </p>
              </div>

              {data.rencanaTindakLanjutGuru ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Tujuan Layanan Konseling</span>
                    </h4>
                    <p className="text-sm text-slate-700 font-medium">
                      {data.rencanaTindakLanjutGuru.tujuanLayanan}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-teal-600" />
                      <span>Indikator Keberhasilan</span>
                    </h4>
                    <p className="text-sm text-slate-700 font-medium">
                      {data.rencanaTindakLanjutGuru.indikatorKeberhasilan}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 md:col-span-2">
                    <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>Tahapan Aksi Konselor BK</span>
                    </h4>
                    <ul className="space-y-2 mt-2">
                      {data.rencanaTindakLanjutGuru.tahapanAksi.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}

              {/* BK Reference Guidelines */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  Rujukan: Panduan Operasional Penyelenggaraan Bimbingan dan Konseling (POP BK)
                </span>
                <p className="text-emerald-800">
                  Layanan Bimbingan dan Konseling diselenggarakan dengan pendekatan perkembangan, memfasilitasi kemandirian, dan memberikan pendampingan yang ramah anak, aman, serta menjaga etika kerahasiaan konseli.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FORMAT JSON BAKU SESUAI TUGAS 3 */}
        {activeTab === 'json' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono text-slate-300">
                  Respon Akhir Format JSON Terstruktur (Tugas 3)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(JSON.stringify(rawStandardJson, null, 2), 'rawJson')
                  }
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {copiedType === 'rawJson' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>JSON Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin JSON</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(rawStandardJson, null, 2)], {
                      type: 'application/json',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `resiliensi_${studentMeta.nama.toLowerCase().replace(/\s+/g, '_')}.json`;
                    a.click();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                >
                  Unduh .json
                </button>
              </div>
            </div>

            {/* Code Block */}
            <div className="relative rounded-xl bg-slate-950 p-4 sm:p-5 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto border border-slate-800 shadow-inner">
              <pre className="leading-relaxed">
                <code>{JSON.stringify(rawStandardJson, null, 2)}</code>
              </pre>
            </div>

            {/* Field Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-mono font-bold text-emerald-700">"kategori"</span>
                <p className="text-slate-600 mt-1">
                  Kategori resiliensi siswa ({data.kategori}) berdasarkan persentase skor asesmen.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-mono font-bold text-emerald-700">"narasiBK"</span>
                <p className="text-slate-600 mt-1">
                  Teks refleksi dan umpan balik pribadi ramah remaja (2-3 paragraf).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-mono font-bold text-emerald-700">"rekomendasiLayanan"</span>
                <p className="text-slate-600 mt-1">
                  Bentuk layanan BK untuk guru ({data.rekomendasiLayanan}).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
