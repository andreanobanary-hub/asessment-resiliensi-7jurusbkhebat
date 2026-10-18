import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Sparkles, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle, 
  Inbox,
  Clock
} from 'lucide-react';
import { StudentProfile, getCategoryBadge, getCategoryFromScore } from '../data/resilienceData';
import { GAS_WEBAPP_URL } from '../services/counselorClientService';

interface ClassRecapViewProps {
  onSelectStudent: (student: StudentProfile) => void;
}

export const ClassRecapView: React.FC<ClassRecapViewProps> = ({ onSelectStudent }) => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      // Gunakan timestamp untuk mencegah cache browser
      const response = await fetch(`${GAS_WEBAPP_URL}?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Google Apps Script merespons dengan status ${response.status}`);
      }

      const rawData = await response.json();

      if (Array.isArray(rawData)) {
        const parsedList: StudentProfile[] = rawData.map((item: any, idx: number) => {
          // Normalisasi skor (bisa desimal 0.66 atau integer 66)
          let score = 50;
          if (typeof item.skorTotal === 'number') {
            score = Math.round(item.skorTotal);
          } else if (typeof item.persentase === 'number') {
            score = item.persentase <= 1 ? Math.round(item.persentase * 100) : Math.round(item.persentase);
          } else if (item.persentaseSkor !== undefined) {
            const num = Number(item.persentaseSkor);
            if (!isNaN(num)) {
              score = num <= 1 ? Math.round(num * 100) : Math.round(num);
            }
          }

          // Normalisasi kategori
          let kategori = (item.kategori || item.category || '').trim();
          if (!kategori) {
            kategori = getCategoryFromScore(score);
          } else if (!kategori.toLowerCase().startsWith('resiliensi')) {
            kategori = `Resiliensi ${kategori}`;
          }

          const kelasStr = (item.kelas || item.grade || '-').trim();
          let jenjang: 'SMP' | 'SMA' | 'SMK' = 'SMP';
          const upperKelas = kelasStr.toUpperCase();
          if (upperKelas.includes('SMK')) jenjang = 'SMK';
          else if (upperKelas.includes('SMA')) jenjang = 'SMA';

          const dimensiTerendah = item.dimensiTerendah || item.lowestDimension || 'Regulasi Emosi';

          return {
            id: item.id ? String(item.id) : (item.timestamp ? String(item.timestamp) : `sheet-${idx}-${Date.now()}`),
            nama: item.nama || item.name || 'Peserta Didik',
            nisn: item.nisn ? String(item.nisn) : '',
            kelas: kelasStr,
            jenjang,
            persentaseSkor: Math.max(0, Math.min(100, score)),
            kategori,
            dimensiTerendah,
            catatanKhusus: item.catatanKhusus || item.catatan || (item.analisisAI ? 'Analisis konselor tersimpan di Google Spreadsheet' : ''),
          };
        });

        // Urutkan siswa dari data terbaru ke terlama jika ada timestamp
        setStudents(parsedList.reverse());
      } else {
        setStudents([]);
      }

      setLastUpdated(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      console.error('Gagal mengambil data siswa dari Google Spreadsheet:', err);
      setFetchError('Tidak dapat terhubung ke Google Spreadsheet. Silakan periksa koneksi atau klik "Segarkan Data".');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Muat data riil saat tab Rekapitulasi Kelas pertama kali dibuka
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Filter pencarian dan kategori
  const filtered = students.filter((s) => {
    const matchesSearch =
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.dimensiTerendah.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nisn && s.nisn.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && s.kategori.toLowerCase().includes(selectedFilter.toLowerCase());
  });

  // Perhitungan statistik dinamis berdasarkan data riil spreadsheet
  const countVeryLow = students.filter((s) => s.kategori.includes('Sangat Rendah') || s.persentaseSkor < 40).length;
  const countLow = students.filter((s) => 
    (s.kategori.includes('Rendah') && !s.kategori.includes('Sangat Rendah')) || 
    (s.persentaseSkor >= 40 && s.persentaseSkor < 55)
  ).length;
  const countMed = students.filter((s) => 
    s.kategori.includes('Sedang') || 
    (s.persentaseSkor >= 55 && s.persentaseSkor < 70)
  ).length;
  const countHigh = students.filter((s) => 
    (s.kategori.includes('Tinggi') && !s.kategori.includes('Sangat Tinggi')) || 
    (s.persentaseSkor >= 70 && s.persentaseSkor < 85)
  ).length;
  const countVeryHigh = students.filter((s) => s.kategori.includes('Sangat Tinggi') || s.persentaseSkor >= 85).length;
  
  const avgScore = students.length > 0
    ? Math.round(students.reduce((acc, curr) => acc + curr.persentaseSkor, 0) / students.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-emerald-100 text-emerald-800">
                <Users className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Laporan & Rekapitulasi BK
              </span>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Google Sheets
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Rekapitulasi Profil Resiliensi Siswa
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Data terhubung langsung dengan Google Spreadsheet asesmen Bimbingan dan Konseling.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-center min-w-[100px]">
              <span className="text-[11px] font-bold uppercase text-emerald-800 block">
                Rata-rata Kelas
              </span>
              <span className="text-xl font-black text-emerald-700 font-mono">
                {isLoading ? '...' : `${avgScore}%`}
              </span>
            </div>

            <div className="bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl text-center min-w-[90px]">
              <span className="text-[11px] font-bold uppercase text-slate-700 block">
                Total Siswa
              </span>
              <span className="text-xl font-black text-slate-800 font-mono">
                {isLoading ? '...' : students.length}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Category distribution cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-5">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
            <span className="text-[11px] font-bold text-rose-800 block">Sangat Rendah (&lt;40%)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-black text-rose-700 font-mono">
                {isLoading ? '-' : countVeryLow}
              </span>
              <span className="text-[10px] text-rose-800">Konseling 1-on-1</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
            <span className="text-[11px] font-bold text-orange-800 block">Rendah (40-54%)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-black text-orange-700 font-mono">
                {isLoading ? '-' : countLow}
              </span>
              <span className="text-[10px] text-orange-800">Bimbingan Kelompok</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-[11px] font-bold text-amber-800 block">Sedang (55-69%)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-black text-amber-700 font-mono">
                {isLoading ? '-' : countMed}
              </span>
              <span className="text-[10px] text-amber-800">Penguatan Bertahap</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
            <span className="text-[11px] font-bold text-teal-800 block">Tinggi (70-84%)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-black text-teal-700 font-mono">
                {isLoading ? '-' : countHigh}
              </span>
              <span className="text-[10px] text-teal-800">Peer Support</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-800 block">Sangat Tinggi (&ge;85%)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-black text-emerald-700 font-mono">
                {isLoading ? '-' : countVeryHigh}
              </span>
              <span className="text-[10px] text-emerald-800">Kader Resiliensi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table & Filtering Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, NISN, kelas, atau dimensi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-emerald-500 outline-hidden bg-slate-50/70"
              />
            </div>
          </div>

          {/* Action controls: Filter, Refresh, and Timestamp */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Filter by Category */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                aria-label="Filter berdasarkan kategori resiliensi"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-medium text-slate-700 outline-hidden"
              >
                <option value="all">Semua Kategori</option>
                <option value="Sangat Rendah">Sangat Rendah</option>
                <option value="Rendah">Rendah</option>
                <option value="Sedang">Sedang</option>
                <option value="Tinggi">Tinggi</option>
                <option value="Sangat Tinggi">Sangat Tinggi</option>
              </select>
            </div>

            {/* Tombol Segarkan Data */}
            <button
              type="button"
              onClick={fetchStudents}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
              title="Segarkan data terbaru dari Google Spreadsheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Memuat...' : 'Segarkan Data'}</span>
            </button>

            {/* Last updated badge */}
            {lastUpdated && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <Clock className="w-3 h-3" />
                {lastUpdated}
              </span>
            )}
          </div>
        </div>

        {/* Error notification if fetch failed */}
        {fetchError && (
          <div className="p-4 mx-4 my-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{fetchError}</span>
            </div>
            <button
              type="button"
              onClick={fetchStudents}
              className="px-2.5 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading ? (
          <div className="py-16 px-4 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center animate-spin mb-3">
              <RefreshCw className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-800">Menghubungkan ke Google Spreadsheet...</p>
            <p className="text-xs text-slate-400 mt-1">Mengambil rekaman profil asesmen resiliensi siswa</p>
          </div>
        ) : students.length === 0 ? (
          /* Empty State: Belum ada rekaman data siswa di Google Sheets */
          <div className="py-16 px-4 text-center max-w-md mx-auto">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Belum ada rekaman data siswa di Google Sheets.
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Data asesmen siswa yang diinput dan dianalisis melalui tab <strong>"Analisis Konselor"</strong> akan secara otomatis terekam dan muncul di tabel ini.
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={fetchStudents}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Periksa Kembali Data Spreadsheet</span>
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          /* Filter results empty state */
          <div className="py-12 px-4 text-center">
            <p className="text-sm font-semibold text-slate-600">
              Tidak ada data siswa yang cocok dengan kriteria pencarian "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              className="mt-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          /* Student Records Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Nama Siswa</th>
                  <th className="px-4 py-3.5">Kelas</th>
                  <th className="px-4 py-3.5">Skor Resiliensi</th>
                  <th className="px-4 py-3.5">Kategori</th>
                  <th className="px-4 py-3.5">Dimensi Terendah</th>
                  <th className="px-5 py-3.5 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filtered.map((student) => {
                  const badge = getCategoryBadge(student.kategori);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{student.nama}</span>
                          {student.nisn && (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              NISN: {student.nisn}
                            </span>
                          )}
                        </div>
                        {student.catatanKhusus && (
                          <div className="text-[11px] text-slate-400 font-normal line-clamp-1 mt-0.5">
                            {student.catatanKhusus}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-600 font-medium whitespace-nowrap">
                        {student.kelas}
                      </td>
                      <td className="px-4 py-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">
                          {student.persentaseSkor}%
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${badge.bg} ${badge.text} ${badge.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {student.kategori}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                          {student.dimensiTerendah}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSelectStudent(student)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Analisis & Susun BK</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
