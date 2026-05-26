// Pemetaan kata/frasa bahasa sehari-hari -> tag doa yang ada di database.
// Dipakai untuk mencocokkan input bebas (mood/cerita) dan memperkaya pencarian.
// Sepenuhnya deterministik & lokal — tanpa model, tanpa server.

const TAG_KEYWORDS: Record<string, string[]> = {
  cemas: [
    "cemas", "khawatir", "kuatir", "gelisah", "galau", "panik", "waswas", "was-was",
    "gugup", "deg-degan", "takut", "anxiety", "anxious", "stress", "stres", "overthinking", "resah"
  ],
  sedih: ["sedih", "murung", "terpuruk", "hancur", "kecewa", "duka", "menangis", "nangis", "lara", "sad", "down", "hampa"],
  sendiri: ["sendiri", "sendirian", "kesepian", "sepi", "lonely", "ditinggalkan", "ditinggal"],
  tobat: ["dosa", "maksiat", "khilaf", "bersalah", "menyesal", "taubat", "tobat", "futur", "jauh dari allah", "berdosa"],
  ampunan: ["ampun", "ampunan", "maaf", "pengampunan"],
  kesulitan: ["sulit", "susah", "berat", "masalah", "terhimpit", "terjepit", "buntu", "mentok", "beban", "ujian hidup", "cobaan", "musibah", "terpuruk", "bangkrut"],
  perlindungan: ["lindung", "perlindungan", "gangguan", "sihir", "santet", "hasad", "dengki", "iri", "jahat", "bahaya", "aman", "diganggu"],
  tawakal: ["pasrah", "tawakal", "menyerahkan", "ikhtiar", "berserah", "menitipkan"],
  syukur: ["syukur", "bersyukur", "alhamdulillah", "lega", "bahagia", "senang", "nikmat", "grateful", "lega"],
  rezeki: ["rezeki", "rejeki", "uang", "duit", "nafkah", "gaji", "miskin", "kaya", "hutang", "utang", "ekonomi", "finansial", "keuangan", "modal", "dagang", "bisnis", "jualan", "berdagang", "rizki"],
  pekerjaan: ["kerja", "pekerjaan", "karir", "karier", "kerjaan", "wawancara", "interview", "melamar", "lamaran", "dipecat", "phk", "pengangguran", "promosi", "atasan", "usaha"],
  kebutuhan: ["butuh", "kebutuhan", "hajat", "keperluan", "memerlukan"],
  jodoh: ["jodoh", "nikah", "menikah", "pernikahan", "pasangan", "suami", "istri", "calon", "lamaran", "taaruf", "ta'aruf", "pacar", "single", "menjomblo", "jomblo"],
  keturunan: ["keturunan", "momongan", "hamil", "mengandung", "kehamilan", "bayi", "buah hati", "mandul", "program hamil", "punya anak", "dikaruniai anak"],
  keluarga: ["keluarga", "orang tua", "orangtua", "ibu", "ayah", "bapak", "rumah tangga", "anak"],
  kesembuhan: ["sakit", "penyakit", "sembuh", "sehat", "kesehatan", "demam", "kanker", "operasi", "rumah sakit", "dirawat", "covid", "virus", "nyeri", "pulih", "berobat"],
  sabar: ["sabar", "tabah", "bertahan", "kuat", "tahan"],
  ilmu: ["ilmu", "belajar", "ujian", "exam", "sekolah", "kuliah", "skripsi", "tesis", "wisuda", "pelajaran", "hafalan", "lulus", "nilai", "paham", "pintar"],
  "dunia-akhirat": ["dunia", "akhirat", "surga", "neraka", "kebaikan dunia"],
  berharap: ["harap", "harapan", "berharap", "menunggu", "cita-cita", "impian", "mimpi", "ingin sekali", "mendamba"],
  keteguhan: ["teguh", "istiqamah", "istiqomah", "konsisten", "goyah", "ragu", "bimbang", "iman turun"],
  hidayah: ["hidayah", "petunjuk", "sesat", "tersesat", "bingung arah"]
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z'À-ɏ]+/)
    .filter(Boolean);
}

/**
 * Cocokkan teks bebas ke daftar tag doa.
 * Frasa multi-kata dicek sebagai substring; kata tunggal dicek per-token
 * (kata >= 4 huruf juga cocok sebagai prefix, mis. "uang" -> "uangku").
 */
export function inferTagsFromText(text: string): string[] {
  if (!text.trim()) {
    return [];
  }

  const lower = text.toLowerCase();
  const tokens = tokenize(text);
  const matched = new Set<string>();

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    for (const keyword of keywords) {
      const hit = keyword.includes(" ")
        ? lower.includes(keyword)
        : tokens.some((token) => token === keyword || (keyword.length >= 4 && token.startsWith(keyword)));

      if (hit) {
        matched.add(tag);
        break;
      }
    }
  }

  return Array.from(matched);
}
