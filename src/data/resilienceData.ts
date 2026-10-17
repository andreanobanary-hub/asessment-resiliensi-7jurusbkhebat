export interface DimensionInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  symptomsLow: string;
  color: string;
  badgeBg: string;
  textColor: string;
  iconName: string;
  defaultTips: [string, string];
}

export const RESILIENCE_DIMENSIONS: Record<string, DimensionInfo> = {
  'Regulasi Emosi': {
    id: 'regulasi_emosi',
    name: 'Regulasi Emosi',
    tagline: 'Ketenangan & Pengelolaan Stres',
    description: 'Kemampuan untuk tetap tenang di bawah tekanan, mengenali perasaan yang muncul, dan meredakan emosi negatif secara sehat.',
    symptomsLow: 'Mudah panik saat ujian mendadak, cepat frustrasi bila menghadapi kegagalan, atau sulit menenangkan diri saat marah.',
    color: 'emerald',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    textColor: 'text-emerald-700',
    iconName: 'HeartHandshake',
    defaultTips: [
      'Gunakan teknik pernapasan ritmis "Kotak 4-4-4" (tarik napas 4 detik, tahan 4 detik, hembuskan 4 detik) saat mulai merasa cemas.',
      'Tuliskan emosi yang kamu rasakan di "buku catatan rahasia" sebelum merespons hal yang membuatmu kesal.'
    ]
  },
  'Kontrol Impuls': {
    id: 'kontrol_impuls',
    name: 'Kontrol Impuls',
    tagline: 'Pengendalian Diri & Ketelitian',
    description: 'Kemampuan mengendalikan dorongan sesaat, menunda kepuasan instan, dan berpikir matang sebelum bertindak.',
    symptomsLow: 'Sering terburu-buru mengerjakan soal, mudah terdistraksi gawai, atau mengeluarkan kata-kata tajam saat tersulut tanpa berpikir panjang.',
    color: 'amber',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    textColor: 'text-amber-700',
    iconName: 'Flame',
    defaultTips: [
      'Terapkan "aturan jeda 5 detik" sebelum mengirim pesan, bersuara saat rapat, atau membuat keputusan di kala emosi.',
      'Gunakan pengingat alarm 25 menit fokus belajar tanpa membuka media sosial (Teknik Pomodoro).'
    ]
  },
  'Optimisme': {
    id: 'optimisme',
    name: 'Optimisme',
    tagline: 'Harapan Positif & Sikap Maju',
    description: 'Keyakinan realistis bahwa masa depan dapat diraih dengan usaha, dan bahwa kegagalan bersifat sementara.',
    symptomsLow: 'Merasa masa depan suram, cepat menyerah bila nilai turun, atau berasumsi nasib buruk akan selalu menimpa dirinya.',
    color: 'yellow',
    badgeBg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    textColor: 'text-yellow-700',
    iconName: 'Sun',
    defaultTips: [
      'Latih kebiasaan mencatat 3 hal baik yang kamu syukuri setiap malam sebelum tidur, meskipun hal kecil.',
      'Ubah kata "Aku pasti gagal" menjadi "Ini tantangan baru yang belum sepenuhnya aku kuasai, tapi aku bisa mencobanya perlahan".'
    ]
  },
  'Analisis Kausalitas': {
    id: 'analisis_kausalitas',
    name: 'Analisis Kausalitas',
    tagline: 'Kecermatan Berpikir & Penemuan Solusi',
    description: 'Kemampuan mengidentifikasi akar penyebab masalah secara akurat tanpa terburu-buru menyalahkan diri sendiri atau orang lain.',
    symptomsLow: 'Sering merasa "semuanya salahku" (over-blaming) atau sebaliknya menyalahkan orang lain atas setiap ketidakberhasilan.',
    color: 'sky',
    badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
    textColor: 'text-sky-700',
    iconName: 'BrainCircuit',
    defaultTips: [
      'Gunakan teknik "5 Mengapa" untuk menelusuri apa penyebab utama dari hambatan tugas atau nilaimu secara obyektif.',
      'Gambarkan dua lingkaran: "Hal yang bisa aku kendalikan" (usaha, waktu belajar) vs "Hal di luar kendaliku" (tingkat kesulitan soal).'
    ]
  },
  'Empati': {
    id: 'empati',
    name: 'Empati',
    tagline: 'Kepedulian & Kepekaan Sosial',
    description: 'Kemampuan membaca isyarat emosional orang lain, mendengarkan secara aktif, dan membangun hubungan saling memahami.',
    symptomsLow: 'Sulit memahami sudut pandang teman satu kelompok, sering terjadi gesekan sosial, atau merasa acuh pada sekitar.',
    color: 'rose',
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
    textColor: 'text-rose-700',
    iconName: 'Users',
    defaultTips: [
      'Latih diri untuk mendengarkan curhat teman sampai selesai tanpa langsung memotong atau membanding-bandingkannya.',
      'Tanyakan "Apa kabarmu hari ini?" secara tulus kepada salah seorang teman sekelasmu.'
    ]
  },
  'Efikasi Diri': {
    id: 'efikasi_diri',
    name: 'Efikasi Diri',
    tagline: 'Keyakinan Diri & Kemandirian',
    description: 'Kepercayaan mendalam pada kapasitas dan potensi diri untuk menyelesaikan tugas dan mengatasi rintangan belajar.',
    symptomsLow: 'Ragu pada kemampuan sendiri saat ditunjuk presentasi, minder dibanding teman sebaya, atau takut mencoba hal baru.',
    color: 'indigo',
    badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    textColor: 'text-indigo-700',
    iconName: 'Sparkles',
    defaultTips: [
      'Pecah materi tugas yang sulit menjadi potongan mini 10 halaman atau 3 soal sehari, lalu berikan apresiasi untuk tiap capaian.',
      'Simpan portofolio atau foto karya/tugas yang pernah kamu selesaikan dengan baik sebagai pengingat kemampuan dirimu.'
    ]
  },
  'Reaching Out': {
    id: 'reaching_out',
    name: 'Reaching Out',
    tagline: 'Keberanian Eksplorasi & Mencari Dukungan',
    description: 'Keberanian menjangkau peluang baru, membangun jaringan pertemanan positif, dan meminta bantuan saat menghadapi kesulitan.',
    symptomsLow: 'Memendam masalah sendirian hingga stres menumpuk, enggan bertanya pada guru, atau menarik diri dari pergaulan.',
    color: 'teal',
    badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
    textColor: 'text-teal-700',
    iconName: 'Compass',
    defaultTips: [
      'Ingatlah bahwa meminta tolong atau bertanya saat bingung adalah tanda kecerdasan dan keberanian, bukan kelemahan.',
      'Cobalah bergabung dengan satu kegiatan ekstrakurikuler atau kelompok belajar yang sesuai dengan minatmu.'
    ]
  }
};

export interface StudentProfile {
  id: string;
  nama: string;
  kelas: string;
  jenjang: 'SMP' | 'SMA' | 'SMK';
  persentaseSkor: number;
  kategori: string;
  dimensiTerendah: string;
  catatanKhusus?: string;
  skorDimensi?: Record<string, number>;
}

export const PRESET_STUDENTS: StudentProfile[] = [
  {
    id: 'preset-1',
    nama: 'Aditya Pratama',
    kelas: 'Kelas IX-B SMP',
    jenjang: 'SMP',
    persentaseSkor: 46,
    kategori: 'Resiliensi Rendah',
    dimensiTerendah: 'Regulasi Emosi',
    catatanKhusus: 'Mudah cemas dan gugup saat ujian matematika, kadang menangis di toilet sekolah saat ditegur pengawas.',
    skorDimensi: {
      'Regulasi Emosi': 35,
      'Kontrol Impuls': 50,
      'Optimisme': 45,
      'Analisis Kausalitas': 48,
      'Empati': 60,
      'Efikasi Diri': 40,
      'Reaching Out': 44
    }
  },
  {
    id: 'preset-2',
    nama: 'Sarah Almira',
    kelas: 'Kelas XI MIPA 3 SMA',
    jenjang: 'SMA',
    persentaseSkor: 62,
    kategori: 'Resiliensi Sedang',
    dimensiTerendah: 'Efikasi Diri',
    catatanKhusus: 'Aktif di OSIS namun ragu apakah mampu lolos SNBP jurusan Kedokteran, sering membandingkan diri dengan teman.',
    skorDimensi: {
      'Regulasi Emosi': 65,
      'Kontrol Impuls': 70,
      'Optimisme': 60,
      'Analisis Kausalitas': 68,
      'Empati': 75,
      'Efikasi Diri': 42,
      'Reaching Out': 54
    }
  },
  {
    id: 'preset-3',
    nama: 'Bima Ramadhan',
    kelas: 'Kelas VIII-D SMP',
    jenjang: 'SMP',
    persentaseSkor: 38,
    kategori: 'Resiliensi Sangat Rendah',
    dimensiTerendah: 'Kontrol Impuls',
    catatanKhusus: 'Sering membanting pulpen saat kalah main game atau berselisih paham saat kerja kelompok di kelas.',
    skorDimensi: {
      'Regulasi Emosi': 40,
      'Kontrol Impuls': 28,
      'Optimisme': 42,
      'Analisis Kausalitas': 35,
      'Empati': 45,
      'Efikasi Diri': 38,
      'Reaching Out': 38
    }
  },
  {
    id: 'preset-4',
    nama: 'Tiara Anggraini',
    kelas: 'Kelas XII IPS 1 SMA',
    jenjang: 'SMA',
    persentaseSkor: 78,
    kategori: 'Resiliensi Tinggi',
    dimensiTerendah: 'Reaching Out',
    catatanKhusus: 'Pekerja keras dan mandiri, namun enggan meminta pertolongan saat kelelahan menyiapkan portofolio seni.',
    skorDimensi: {
      'Regulasi Emosi': 80,
      'Kontrol Impuls': 85,
      'Optimisme': 82,
      'Analisis Kausalitas': 76,
      'Empati': 80,
      'Efikasi Diri': 85,
      'Reaching Out': 58
    }
  },
  {
    id: 'preset-5',
    nama: 'Farhan Dwi Putra',
    kelas: 'Kelas X Teknik Komputer SMK',
    jenjang: 'SMK',
    persentaseSkor: 54,
    kategori: 'Resiliensi Rendah',
    dimensiTerendah: 'Optimisme',
    catatanKhusus: 'Merasa salah jurusan dan ragu apakah bisa mengikuti mata pelajaran coding dasar.',
    skorDimensi: {
      'Regulasi Emosi': 55,
      'Kontrol Impuls': 58,
      'Optimisme': 39,
      'Analisis Kausalitas': 60,
      'Empati': 62,
      'Efikasi Diri': 50,
      'Reaching Out': 54
    }
  }
];

// Mini Resilience Questionnaire (14 questions, 2 for each dimension)
export interface QuestionnaireQuestion {
  id: number;
  dimensi: string;
  pertanyaan: string;
}

export const QUESTIONNAIRE_QUESTIONS: QuestionnaireQuestion[] = [
  {
    id: 1,
    dimensi: 'Regulasi Emosi',
    pertanyaan: 'Ketika ada situasi yang tiba-tiba membuatku panik atau kesal di sekolah, aku bisa menenangkan diri sebelum bertindak.'
  },
  {
    id: 2,
    dimensi: 'Regulasi Emosi',
    pertanyaan: 'Aku tahu cara yang sehat untuk meredakan stres (seperti beristirahat, mendengarkan musik, atau menarik napas panjang).'
  },
  {
    id: 3,
    dimensi: 'Kontrol Impuls',
    pertanyaan: 'Aku tidak mudah tergesa-gesa mengambil keputusan ketika sedang emosi atau buru-buru ingin selesai.'
  },
  {
    id: 4,
    dimensi: 'Kontrol Impuls',
    pertanyaan: 'Aku dapat menunda bermain gawai atau game demi menyelesaikan tugas penting sekolah terlebih dahulu.'
  },
  {
    id: 5,
    dimensi: 'Optimisme',
    pertanyaan: 'Meskipun nilaiku sempat kurang memuaskan, aku yakin dengan latihan yang tepat kemampuanku bisa meningkat.'
  },
  {
    id: 6,
    dimensi: 'Optimisme',
    pertanyaan: 'Aku memandang hari esok di sekolah dengan perasaan bersemangat dan percaya ada hal baik yang menanti.'
  },
  {
    id: 7,
    dimensi: 'Analisis Kausalitas',
    pertanyaan: 'Saat menghadapi kegagalan tugas, aku mencari tahu secara jernih penyebab utamanya tanpa menyalahkan nasib semata.'
  },
  {
    id: 8,
    dimensi: 'Analisis Kausalitas',
    pertanyaan: 'Aku bisa membedakan mana hal yang berada di bawah kendaliku (usahaku) dan mana yang di luar kendaliku.'
  },
  {
    id: 9,
    dimensi: 'Empati',
    pertanyaan: 'Aku peka ketika seorang teman sekelasku sedang bersedih atau mengalami hari yang berat.'
  },
  {
    id: 10,
    dimensi: 'Empati',
    pertanyaan: 'Aku berusaha mendengarkan cerita teman dengan sungguh-sungguh tanpa langsung memotong atau menghakimi.'
  },
  {
    id: 11,
    dimensi: 'Efikasi Diri',
    pertanyaan: 'Aku yakin memiliki kemampuan untuk menyelesaikan masalah dan tugas-tugas yang diberikan oleh guru.'
  },
  {
    id: 12,
    dimensi: 'Efikasi Diri',
    pertanyaan: 'Ketika menghadapi pelajaran baru yang sulit, aku percaya diri untuk terus mencoba hingga mengerti.'
  },
  {
    id: 13,
    dimensi: 'Reaching Out',
    pertanyaan: 'Aku tidak merasa malu atau takut untuk bertanya kepada guru atau teman ketika merasa kesulitan.'
  },
  {
    id: 14,
    dimensi: 'Reaching Out',
    pertanyaan: 'Aku berani mencoba tantangan baru atau berkenalan dengan teman-teman di lingkungan yang baru.'
  }
];

export function getCategoryFromScore(score: number): string {
  if (score >= 85) return 'Resiliensi Sangat Tinggi';
  if (score >= 70) return 'Resiliensi Tinggi';
  if (score >= 55) return 'Resiliensi Sedang';
  if (score >= 40) return 'Resiliensi Rendah';
  return 'Resiliensi Sangat Rendah';
}

export function getCategoryBadge(category: string): { bg: string; text: string; border: string; dot: string } {
  switch (category) {
    case 'Resiliensi Sangat Tinggi':
      return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500' };
    case 'Resiliensi Tinggi':
      return { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200', dot: 'bg-teal-500' };
    case 'Resiliensi Sedang':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' };
    case 'Resiliensi Rendah':
      return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', dot: 'bg-orange-500' };
    case 'Resiliensi Sangat Rendah':
    default:
      return { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', dot: 'bg-rose-500' };
  }
}
