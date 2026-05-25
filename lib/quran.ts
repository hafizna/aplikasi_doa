const QURAN_API_BASE = "https://api.quran.com/api/v4";

// Terjemah Bahasa Indonesia (Kementerian Agama RI) di Quran.com.
const DEFAULT_TRANSLATION_ID = 33;

export type QuranVerse = {
  verseKey: string;
  ayah: number;
  arab: string;
  terjemah: string;
};

type UthmaniResponse = {
  verses: Array<{ verse_key: string; text_uthmani: string }>;
};

type TranslationResponse = {
  translations: Array<{ text: string }>;
};

function stripFootnotes(text: string) {
  // Terjemah Quran.com kadang menyertakan markup catatan kaki <sup>..</sup>.
  return text.replace(/<sup[^>]*>.*?<\/sup>/gi, "").replace(/<[^>]+>/g, "").trim();
}

/**
 * Ambil teks Arab + terjemah Indonesia satu surah dari Quran.com.
 * Online; respons di-cache oleh service worker untuk akses offline berikutnya.
 */
export async function getChapterVerses(
  surah: number,
  translationId: number = DEFAULT_TRANSLATION_ID
): Promise<QuranVerse[]> {
  const [uthmaniRes, translationRes] = await Promise.all([
    fetch(`${QURAN_API_BASE}/quran/verses/uthmani?chapter_number=${surah}`),
    fetch(`${QURAN_API_BASE}/quran/translations/${translationId}?chapter_number=${surah}`)
  ]);

  if (!uthmaniRes.ok) {
    throw new Error("Gagal memuat teks Al-Qur'an.");
  }

  const uthmani = (await uthmaniRes.json()) as UthmaniResponse;
  const translation = translationRes.ok ? ((await translationRes.json()) as TranslationResponse) : { translations: [] };

  return uthmani.verses.map((verse, index) => ({
    verseKey: verse.verse_key,
    ayah: index + 1,
    arab: verse.text_uthmani,
    terjemah: translation.translations[index] ? stripFootnotes(translation.translations[index].text) : ""
  }));
}
