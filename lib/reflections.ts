import { getDoaById } from "@/lib/data/doa";
import type { Doa } from "@/lib/types/doa";

export type ReflectionKind = "saat-merasa" | "kisah-harapan";

export type Reflection = {
  id: string;
  kind: ReflectionKind;
  title: string;
  mood: string;
  summary: string;
  story: string;
  lesson: string;
  action: string;
  source: string;
  sourceNote?: string;
  doaIds: string[];
  tags: string[];
};

export const reflections: Reflection[] = [
  {
    id: "pintu-ampunan",
    kind: "saat-merasa",
    title: "Kalau merasa jauh, pintu pulang belum tertutup",
    mood: "Bersalah / butuh tobat",
    summary: "Rasa bersalah bisa menjadi awal kembali, bukan tanda bahwa semuanya selesai.",
    story:
      "Al-Qur'an mengajarkan agar hamba yang melampaui batas tidak berputus asa dari rahmat Allah. Taubat bukan sekadar merasa buruk, tapi bergerak pulang dengan jujur.",
    lesson:
      "Saat hati berat oleh dosa, yang paling dibutuhkan bukan menyiksa diri, tapi mengakui salah, meminta ampun, dan memulai satu langkah taat yang mungkin dilakukan hari ini.",
    action: "Ambil dua menit: baca istighfar pelan, lalu tulis satu kebiasaan kecil yang ingin kamu perbaiki.",
    source: "QS. Az-Zumar: 53; HR. Muslim no. 2749",
    sourceNote: "Ringkasan makna, bukan kutipan literal panjang.",
    doaIds: ["tematik-tobat-sayyidul-istighfar", "tematik-tobat-adam", "tematik-tobat-yunus"],
    tags: ["tobat", "ampunan", "mulai-lagi"]
  },
  {
    id: "gelap-yunus",
    kind: "kisah-harapan",
    title: "Nabi Yunus: di tempat paling gelap pun doa tetap sampai",
    mood: "Terhimpit / banyak masalah",
    summary: "Tidak semua gelap berarti selesai. Kadang ia menjadi tempat paling jujur untuk memanggil Allah.",
    story:
      "Nabi Yunus berdoa dalam kegelapan, mengakui kelemahan dirinya, lalu Allah menyelamatkannya dari kesedihan. Kisah ini sering menjadi pintu harapan bagi orang yang merasa terkepung.",
    lesson:
      "Doa yang pendek bisa sangat dalam ketika keluar dari hati yang sadar bahwa tidak ada jalan kecuali kepada Allah.",
    action: "Baca doa Nabi Yunus tiga kali, lalu diam sejenak sebelum meminta hajatmu.",
    source: "QS. Al-Anbiya: 87-88",
    doaIds: ["tematik-tobat-yunus", "quran-rabbana-atina"],
    tags: ["kesulitan", "tobat", "cemas"]
  },
  {
    id: "musa-madyan",
    kind: "kisah-harapan",
    title: "Nabi Musa: lelah, asing, lalu meminta kebaikan",
    mood: "Butuh rezeki / arah hidup",
    summary: "Ada doa yang lahir bukan dari situasi rapi, tapi dari rasa lelah dan tidak punya apa-apa.",
    story:
      "Setelah meninggalkan Mesir, Nabi Musa sampai di Madyan dalam keadaan membutuhkan pertolongan. Ia menolong lebih dulu, lalu berdoa memohon kebaikan dari Allah.",
    lesson:
      "Saat hidup terasa belum jelas, jangan remehkan amal kecil yang bisa dilakukan sekarang. Sesudah itu, minta Allah menurunkan kebaikan yang tepat.",
    action: "Lakukan satu kebaikan kecil hari ini, lalu baca doa Nabi Musa dengan hajat yang jelas.",
    source: "QS. Al-Qashash: 23-24",
    doaIds: ["tematik-rezeki-nabi-musa", "quran-rabbana-atina"],
    tags: ["rezeki", "pekerjaan", "jodoh", "arah"]
  },
  {
    id: "zakaria-tetap-berharap",
    kind: "kisah-harapan",
    title: "Nabi Zakaria: harapan yang lama tidak harus padam",
    mood: "Menunggu sesuatu yang belum datang",
    summary: "Doa yang lama belum terjawab tidak otomatis berarti ditolak.",
    story:
      "Nabi Zakaria berdoa meminta keturunan dalam usia yang sudah lanjut. Al-Qur'an menggambarkan harapan itu dengan kelembutan dan kedekatan kepada Allah.",
    lesson:
      "Menunggu bisa melelahkan, tapi doa menjaga hati agar tetap punya tempat bersandar. Yang diminta boleh besar; adabnya adalah tetap rendah hati.",
    action: "Sebutkan hajatmu dengan spesifik, lalu tutup dengan ridha pada waktu terbaik dari Allah.",
    source: "QS. Maryam: 2-9; QS. Ali 'Imran: 38",
    doaIds: ["tematik-keturunan-zakaria", "tematik-keturunan-zakaria-anbiya"],
    tags: ["keturunan", "jodoh", "berharap"]
  },
  {
    id: "yaqub-mengeluh-kepada-allah",
    kind: "saat-merasa",
    title: "Saat sedih panjang, arahkan keluhan kepada Allah",
    mood: "Sedih / merasa sendiri",
    summary: "Kesedihan tidak selalu hilang cepat. Tapi ia bisa diarahkan ke tempat yang benar.",
    story:
      "Nabi Ya'qub menyampaikan kesedihan dan keluhannya kepada Allah. Ia tidak menyangkal rasa sakit, namun tetap menyambungkannya dengan pengetahuan Allah.",
    lesson:
      "Mengeluh kepada Allah berbeda dari menyerah. Ia adalah cara hati berkata: aku rapuh, tapi aku masih percaya Engkau mengetahui yang tidak aku ketahui.",
    action: "Tulis satu kalimat jujur kepada Allah di journal munajat, lalu baca doa perlindungan dari kesulitan.",
    source: "QS. Yusuf: 86",
    doaIds: ["tematik-tobat-yunus", "quran-rabbana-atina"],
    tags: ["sedih", "sendiri", "cemas"]
  },
  {
    id: "ayyub-sakit-sabar",
    kind: "kisah-harapan",
    title: "Nabi Ayyub: sakit tidak menghapus kemuliaan seorang hamba",
    mood: "Sakit / keluarga sakit",
    summary: "Dalam sakit, yang diuji bukan hanya tubuh, tapi juga cara hati tetap meminta dengan adab.",
    story:
      "Nabi Ayyub berdoa kepada Allah ketika ditimpa penyakit. Al-Qur'an menyebut Allah mengangkat kesusahannya dan menjadikan kisah itu sebagai rahmat dan pelajaran.",
    lesson:
      "Meminta kesembuhan adalah ibadah. Bersabar bukan berarti berhenti berobat atau berhenti berharap.",
    action: "Baca doa kesembuhan, lalu niatkan satu ikhtiar nyata: istirahat, berobat, atau menemani keluarga yang sakit.",
    source: "QS. Al-Anbiya: 83-84; HR. Bukhari no. 5743 dan Muslim no. 2191",
    doaIds: ["tematik-kesembuhan-rabban-nas", "tematik-kesembuhan-bismillah-arqik"],
    tags: ["kesembuhan", "sabar", "keluarga"]
  },
  {
    id: "syukur-sulaiman",
    kind: "saat-merasa",
    title: "Saat lega, jangan biarkan syukur lewat begitu saja",
    mood: "Bersyukur / lega",
    summary: "Nikmat yang disadari bisa berubah menjadi ibadah ketika disambungkan kepada Allah.",
    story:
      "Nabi Sulaiman memohon agar diberi ilham untuk mensyukuri nikmat Allah dan beramal saleh yang diridhai. Syukur bukan hanya ucapan, tapi arah hidup.",
    lesson:
      "Ketika sesuatu terasa lapang, jadikan kelapangan itu pintu amal: berterima kasih, berbagi, atau memperbaiki hubungan.",
    action: "Tulis satu nikmat hari ini, lalu pilih satu amal kecil sebagai bentuk syukur.",
    source: "QS. An-Naml: 19",
    doaIds: ["quran-rabbana-atina"],
    tags: ["syukur", "lega", "amal"]
  },
  {
    id: "cemas-titipkan",
    kind: "saat-merasa",
    title: "Cemas bukan aib; ia undangan untuk menitipkan urusan",
    mood: "Khawatir / cemas",
    summary: "Ada hal yang bisa diikhtiarkan, dan ada bagian yang hanya tenang ketika dititipkan kepada Allah.",
    story:
      "Dalam banyak doa ma'tsur, seorang hamba diajari berlindung dari kelemahan, kesedihan, rasa takut, dan beban yang menekan. Islam tidak menertawakan rapuhnya manusia.",
    lesson:
      "Tenang bukan berarti semua masalah selesai. Tenang bisa berarti tahu kepada siapa urusan dikembalikan setelah ikhtiar dilakukan.",
    action: "Sebutkan satu hal yang bisa kamu lakukan hari ini, lalu satu hal yang kamu serahkan kepada Allah.",
    source: "HR. Bukhari no. 6369; QS. At-Talaq: 3",
    doaIds: ["tematik-perlindungan-hammi-hazan", "tematik-tobat-yunus", "quran-rabbana-atina"],
    tags: ["cemas", "perlindungan", "tawakal"]
  }
];

export function getReflectionById(id: string) {
  return reflections.find((reflection) => reflection.id === id);
}

export function getReflectionDoa(reflection: Reflection): Doa[] {
  return reflection.doaIds
    .map((id) => getDoaById(id))
    .filter((doa): doa is Doa => Boolean(doa));
}

export function getDailyReflection(date = new Date()) {
  const daySeed = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / (24 * 60 * 60 * 1000)
  );

  return reflections[daySeed % reflections.length];
}

export function getReflectionsByTag(tag: string) {
  return reflections.filter((reflection) => reflection.tags.includes(tag));
}
