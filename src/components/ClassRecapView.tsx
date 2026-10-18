import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Sparkles, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle, 
  Table as TableIcon,
  CheckCircle2,
  Inbox,
  Clock
} from 'lucide-react';
import { StudentProfile } from '../data/resilienceData';
import { GAS_WEBAPP_URL } from '../services/counselorClientService';

interface ClassRecapViewProps {
  onSelectStudent: (student: StudentProfile) => void;
  onNavigateToForm?: () => void;
}

export const ClassRecapView: React.FC<ClassRecapViewProps> = ({
  onSelectStudent,
  onNavigateToForm
}) => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterKelas, setFilterKelas] = useState<string>('all');

  // Fetch real data from Google Spreadsheet via GAS Web App GET
  const fetchSpreadsheetData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(GAS_WEBAPP_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Gagal mengambil data dari Google Sheets (HTTP ${response.status})`);
      }

      const rawData = await response.json();
      
      // Standarisasi array data dari respons GAS
      let records: any[] = [];
      if (Array.isArray(rawData)) {
        records = rawData;
      } else if (rawData && typeof rawData === 'object') {
        if (Array.isArray(rawData.data)) {
          records = rawData.data;
        } else if (Array.isArray(rawData.records)) {
          records = rawData.records;
        } else if (Array.isArray(rawData.students)) {
          records = rawData.students;
        }
      }

      // Map ke interface StudentProfile
      const mappedStudents: StudentProfile[] = records.map((item: any, index: number) => {
        // Parsing persentase skor
        const rawScore = item.persentase ?? item.skorTotal ?? item.score ?? item.persentaseSkor ?? 0;
        const numScore = typeof rawScore === 'number' ? rawScore : parseFloat(String(rawScore)) || 0;
        
        // Penentuan kategori jika kosong
        let kat = item.kategori || item.category || '';
        if (!kat) {
          if (numScore >= 81) kat = 'Resiliensi Sangat Tinggi';
          else if (numScore >= 66) kat = 'Resiliensi Tinggi';
          else if (numScore >= 51) kat = 'Resiliensi Sedang';
          else if (numScore >= 36) kat = 'Resiliensi Rendah';
          else kat = 'Resiliensi Sangat Rendah';
        }

        // Penentuan jenjang kelas
        const kelasStr = String(item.kelas || '-').trim();
        let jenjang: 'SMP' | 'SMA' | 'SMK' = 'SMP';
        if (/SMA/i.test(kelasStr) || /X|XI|XII/i.test(kelasStr)) {
          jenjang = 'SMA';
        } else if (/SMK/i.test(kelasStr)) {
          jenjang = 'SMK';
        }

        return {
          id: item.id || `gas-${index}-${Date.now()}`,
          nama: item.nama || item.name || `Siswa #${index + 1}`,
          kelas: kelasStr,
          jenjang: jenjang,
          nisn: item.nisn ? String(item.nisn) : undefined,
          persentaseSkor: Math.round(numScore),
          kategori: kat,
          dimensiTerendah: item.dimensiTerendah || item.lowestDimension || 'Regulasi Emosi',
          catatanKhusus: item.analisisAI || item.catatan || item.notes || '',
          timestamp: item.timestamp || item.waktu || undefined,
        };
      });

      setStudents(mappedStudents);
      setLastUpdated(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      console.error('Error fetching data from Google Sheets:', err);
      setErrorMessage(
        err?.message || 'Terjadi kendala saat memuat data dari Google Sheets. Pastikan URL Web App dapat diakses publik.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Panggil fetch saat komponen dimount
  useEffect(() => {
    fetchSpreadsheetData();
  }, [fetchSpreadsheetData]);

  // Ekstrak daftar kelas unik untuk filter
  const uniqueClasses = Array.from(new Set(students.map(s => s.kelas).filter(Boolean)));

  // Filter siswa berdasarkan pencarian, kelas, dan kategori
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.nisn && student.nisn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      student.kelas.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesKelas = filterKelas === 'all' || student.kelas === filterKelas;

    let matchesCategory = true;
    if (filterCategory !== 'all') {
      const lowerKat = student.kategori.toLowerCase();
      if (filterCategory === 'sangat-rendah') matchesCategory = lowerKat.includes('sangat rendah');
      else if (filterCategory === 'rendah') matchesCategory = lowerKat.includes('rendah') && !lowerKat.includes('sangat');
      else if (filterCategory === 'sedang') matchesCategory = lowerKat.includes('sedang');
      else if (filterCategory === 'tinggi') matchesCategory = lowerKat.includes('tinggi') && !lowerKat.includes('sangat');
      else if (filterCategory === 'sangat-tinggi') matchesCategory = lowerKat.includes('sangat tinggi');
    }

    return matchesSearch && matchesKelas && matchesCategory;
  });

  // Hitung distribusi kategori secara dinamis dari data riil spreadsheet
  const countSangatRendah = students.filter(s => s.kategori.toLowerCase().includes('sangat rendah')).length;
  const countRendah = students.filter(s => s.kategori.toLowerCase().includes('rendah') && !s.kategori.toLowerCase().includes('sangat')).length;
  const countSedang = students.filter(s => s.kategori.toLowerCase().includes('sedang')).length;
  const countTinggi = students.filter(s => s.kategori.toLowerCase().includes('tinggi') && !s.kategori.toLowerCase().includes('sangat')).length;
  const countSangatTinggi = students.filter(s => s.kategori.toLowerCase().includes('sangat tinggi')).length;

  const getCategoryBadgeClass = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('sangat tinggi')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    if (cat.includes('tinggi')) {
      return 'bg-teal-100 text-teal-800 border-teal-300';
    }
    if (cat.includes('sedang')) {
      return 'bg-amber-100 text-amber-800 border-amber-300';
    }
    if (cat.includes('sangat rendah')) {
      return 'bg-rose-100 text-rose-800 border-rose-300';
    }
    return 'bg-orange-100 text-orange-800 border-orange-300';
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm mb-1">
            <Users className="w-4 h-4" />
            <span>Database Peserta Didik</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Rekapitulasi Hasil Asesmen Kelas
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Data tersinkronisasi otomatis dengan Google Spreadsheet Ruang BK via Google Apps Script.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSpreadsheetData}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition shadow-sm ${
              isLoading
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95'
            }`}
            title="Muat ulang data terbaru dari Google Sheets"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span>{isLoading ? 'Memuat Data...' : 'Segarkan Data'}</span>
          </button>

          <button
            onClick={onNavigateToForm}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Input Asesmen Baru</span>
          </button>
        </div>
      </div>

      {/* Pesan Kesalahan / Error */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Kendala Koneksi Spreadsheet</p>
            <p className="text-rose-700 text-xs mt-0.5">{errorMessage}</p>
          </div>
          <button
            onClick={fetchSpreadsheetData}
            className="text-xs font-semibold bg-rose-100 hover:bg-rose-200 text-rose-900 px-3 py-1.5 rounded-lg transition"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Kartu Ringkasan Dinamis Berdasarkan Data Spreadsheet */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Sangat Rendah */}
        <div 
          onClick={() => setFilterCategory(filterCategory === 'sangat-rendah' ? 'all' : 'sangat-rendah')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            filterCategory === 'sangat-rendah' 
              ? 'bg-rose-50 border-rose-400 shadow-sm ring-2 ring-rose-300' 
              : 'bg-white border-slate-200 hover:border-rose-200'
          }`}
        >
          <div className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Sangat Rendah</div>
          <div className="mt-1 text-2xl font-bold text-rose-900">
            {isLoading ? '...' : countSangatRendah}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Prioritas Utama BK</div>
        </div>

        {/* Rendah */}
        <div 
          onClick={() => setFilterCategory(filterCategory === 'rendah' ? 'all' : 'rendah')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            filterCategory === 'rendah' 
              ? 'bg-orange-50 border-orange-400 shadow-sm ring-2 ring-orange-300' 
              : 'bg-white border-slate-200 hover:border-orange-200'
          }`}
        >
          <div className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Rendah</div>
          <div className="mt-1 text-2xl font-bold text-orange-900">
            {isLoading ? '...' : countRendah}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Perlu Pendampingan</div>
        </div>

        {/* Sedang */}
        <div 
          onClick={() => setFilterCategory(filterCategory === 'sedang' ? 'all' : 'sedang')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            filterCategory === 'sedang' 
              ? 'bg-amber-50 border-amber-400 shadow-sm ring-2 ring-amber-300' 
              : 'bg-white border-slate-200 hover:border-amber-200'
          }`}
        >
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Sedang</div>
          <div className="mt-1 text-2xl font-bold text-amber-900">
            {isLoading ? '...' : countSedang}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Kondisi Adaptif Cukup</div>
        </div>

        {/* Tinggi */}
        <div 
          onClick={() => setFilterCategory(filterCategory === 'tinggi' ? 'all' : 'tinggi')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            filterCategory === 'tinggi' 
              ? 'bg-teal-50 border-teal-400 shadow-sm ring-2 ring-teal-300' 
              : 'bg-white border-slate-200 hover:border-teal-200'
          }`}
        >
          <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Tinggi</div>
          <div className="mt-1 text-2xl font-bold text-teal-900">
            {isLoading ? '...' : countTinggi}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Ketahanan Baik</div>
        </div>

        {/* Sangat Tinggi */}
        <div 
          onClick={() => setFilterCategory(filterCategory === 'sangat-tinggi' ? 'all' : 'sangat-tinggi')}
          className={`cursor-pointer p-4 rounded-xl border transition-all col-span-2 sm:col-span-1 ${
            filterCategory === 'sangat-tinggi' 
              ? 'bg-emerald-50 border-emerald-400 shadow-sm ring-2 ring-emerald-300' 
              : 'bg-white border-slate-200 hover:border-emerald-200'
          }`}
        >
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Sangat Tinggi</div>
          <div className="mt-1 text-2xl font-bold text-emerald-900">
            {isLoading ? '...' : countSangatTinggi}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Sangat Tangguh</div>
        </div>
      </div>

      {/* Tabel Data Siswa */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Toolbar Pencarian & Filter */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama siswa, NISN, atau kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Kelas */}
            {uniqueClasses.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={filterKelas}
                  onChange={(e) => setFilterKelas(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Semua Kelas ({uniqueClasses.length})</option>
                  {uniqueClasses.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Filter Kategori */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Kategori</option>
              <option value="sangat-rendah">Sangat Rendah</option>
              <option value="rendah">Rendah</option>
              <option value="sedang">Sedang</option>
              <option value="tinggi">Tinggi</option>
              <option value="sangat-tinggi">Sangat Tinggi</option>
            </select>
          </div>
        </div>

        {/* Status Indikator Terakhir Diperbarui */}
        <div className="px-4 py-2 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <TableIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Menampilkan <strong>{filteredStudents.length}</strong> dari <strong>{students.length}</strong> rekaman siswa</span>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Diperbarui: {lastUpdated}</span>
            </div>
          )}
        </div>

        {/* Isi Tabel atau Loading / Empty States */}
        {isLoading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Mengambil Data Siswa dari Google Sheets...</p>
            <p className="text-xs text-slate-400 mt-1">Menghubungkan ke Google Apps Script Web App</p>
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              Belum ada rekaman data siswa di Google Sheets.
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
              Isi data asesmen melalui formulir input siswa. Setiap hasil asesmen yang dianalisis akan tersimpan otomatis ke lembar spreadsheet.
            </p>
            <button
              onClick={onNavigateToForm}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Mulai Input Asesmen Siswa</span>
            </button>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center px-4">
            <p className="text-sm font-medium text-slate-600">Tidak ada data siswa yang cocok dengan filter atau kata kunci pencarian.</p>
            <button
              onClick={() => { setSearchTerm(''); setFilterCategory('all'); setFilterKelas('all'); }}
              className="text-xs text-indigo-600 hover:underline font-semibold mt-2"
            >
              Reset Filter & Pencarian
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4 text-center">Skor Resiliensi</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Dimensi Terendah</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors">
                    {/* Nama Siswa & NISN */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{student.nama}</div>
                      {student.nisn && (
                        <div className="text-[11px] text-slate-400 font-mono">NISN: {student.nisn}</div>
                      )}
                    </td>

                    {/* Kelas */}
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {student.kelas}
                    </td>

                    {/* Skor Resiliensi */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <span>{student.persentaseSkor}%</span>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getCategoryBadgeClass(student.kategori)}`}>
                        {student.kategori}
                      </span>
                    </td>

                    {/* Dimensi Terendah */}
                    <td className="py-3 px-4 text-slate-600">
                      <span className="font-medium text-slate-800">{student.dimensiTerendah}</span>
                    </td>

                    {/* Tombol Aksi */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectStudent(student)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg font-medium text-xs transition duration-150 shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Analisis & Susun BK</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default ClassRecapView;
