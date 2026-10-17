import React, { useState } from 'react';
import { 
  Users, 
  BarChart3, 
  PieChart, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  Plus, 
  Search,
  Filter,
  CheckCircle,
  Clock
} from 'lucide-react';
import { PRESET_STUDENTS, StudentProfile, getCategoryBadge } from '../data/resilienceData';

interface ClassRecapViewProps {
  onSelectStudent: (student: StudentProfile) => void;
}

export const ClassRecapView: React.FC<ClassRecapViewProps> = ({ onSelectStudent }) => {
  const [students, setStudents] = useState<StudentProfile[]>(PRESET_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.dimensiTerendah.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && s.kategori === selectedFilter;
  });

  // Calculate statistics
  const countVeryLow = students.filter((s) => s.kategori === 'Resiliensi Sangat Rendah').length;
  const countLow = students.filter((s) => s.kategori === 'Resiliensi Rendah').length;
  const countMed = students.filter((s) => s.kategori === 'Resiliensi Sedang').length;
  const countHigh = students.filter((s) => s.kategori === 'Resiliensi Tinggi').length;
  const countVeryHigh = students.filter((s) => s.kategori === 'Resiliensi Sangat Tinggi').length;
  const avgScore = Math.round(
    students.reduce((acc, curr) => acc + curr.persentaseSkor, 0) / (students.length || 1)
  );

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
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Rekapitulasi Profil Resiliensi Siswa
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pemetaan ketangguhan mental siswa untuk penentuan intervensi layanan Bimbingan dan Konseling.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-center">
              <span className="text-[11px] font-bold uppercase text-emerald-800 block">
                Rata-rata Kelas
              </span>
              <span className="text-xl font-black text-emerald-700 font-mono">
                {avgScore}%
              </span>
            </div>

            <div className="bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl text-center">
              <span className="text-[11px] font-bold uppercase text-slate-700 block">
                Total Siswa
              </span>
              <span className="text-xl font-black text-slate-800 font-mono">
                {students.length}
              </span>
            </div>
          </div>
        </div>

        {/* Category distribution pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-5">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
            <span className="text-[11px] font-bold text-rose-800 block">Sangat Rendah (&lt;40%)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-black text-rose-700 font-mono">{countVeryLow}</span>
              <span className="text-[10px] text-rose-800">Perlu Konseling 1-on-1</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
            <span className="text-[11px] font-bold text-orange-800 block">Rendah (40-54%)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-black text-orange-700 font-mono">{countLow}</span>
              <span className="text-[10px] text-orange-800">Bimbingan Kelompok</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-[11px] font-bold text-amber-800 block">Sedang (55-69%)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-black text-amber-700 font-mono">{countMed}</span>
              <span className="text-[10px] text-amber-800">Penguatan Bertahap</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
            <span className="text-[11px] font-bold text-teal-800 block">Tinggi (70-84%)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-black text-teal-700 font-mono">{countHigh}</span>
              <span className="text-[10px] text-teal-800">Peer Support</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-800 block">Sangat Tinggi (&ge;85%)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-black text-emerald-700 font-mono">{countVeryHigh}</span>
              <span className="text-[10px] text-emerald-800">Kader Resiliensi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table & Filtering Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, kelas, atau dimensi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-emerald-500 outline-hidden bg-slate-50/70"
              />
            </div>
          </div>

          {/* Filter by Category */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              aria-label="Filter berdasarkan kategori resiliensi"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-medium text-slate-700 outline-hidden"
            >
              <option value="all">Semua Kategori</option>
              <option value="Resiliensi Sangat Rendah">Sangat Rendah</option>
              <option value="Resiliensi Rendah">Rendah</option>
              <option value="Resiliensi Sedang">Sedang</option>
              <option value="Resiliensi Tinggi">Tinggi</option>
              <option value="Resiliensi Sangat Tinggi">Sangat Tinggi</option>
            </select>
          </div>
        </div>

        {/* Student Records Table */}
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
                      <div>{student.nama}</div>
                      {student.catatanKhusus && (
                        <div className="text-[11px] text-slate-400 font-normal line-clamp-1 mt-0.5">
                          {student.catatanKhusus}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-600 font-medium whitespace-nowrap">
                      {student.kelas}
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-slate-800">
                      {student.persentaseSkor}%
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer"
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
      </div>
    </div>
  );
};
