import type { Doa } from "@/lib/types/doa";

export type AudioTrack = {
  label: string;
  url: string;
  duration?: number;
};

type QuranAudioFile = {
  verse_key: string;
  url: string;
  duration?: number;
};

type QuranAudioResponse = {
  audio_files: QuranAudioFile[];
};

const QURAN_API_BASE = "https://api.quran.com/api/v4";
const QURAN_AUDIO_BASE = "https://verses.quran.foundation/";

function normalizeAudioUrl(url: string) {
  if (url.startsWith("https://") || url.startsWith("http://")) {
    return url;
  }

  return `${QURAN_AUDIO_BASE}${url.replace(/^\/+/, "")}`;
}

async function resolveQuranVerseAudio(recitationId: number, verseKey: string) {
  const url = `${QURAN_API_BASE}/recitations/${recitationId}/by_ayah/${encodeURIComponent(
    verseKey
  )}?fields=url,verse_key,duration&per_page=1`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Unable to fetch Quran audio for ${verseKey}.`);
  }

  const data = (await response.json()) as QuranAudioResponse;
  const audioFile = data.audio_files[0];

  if (!audioFile) {
    throw new Error(`Quran audio not found for ${verseKey}.`);
  }

  return {
    label: audioFile.verse_key,
    url: normalizeAudioUrl(audioFile.url),
    duration: audioFile.duration
  };
}

export async function resolveDoaAudio(doa: Doa): Promise<AudioTrack[]> {
  if (doa.audio?.provider === "static") {
    return [
      {
        label: doa.judul,
        url: doa.audio.url
      }
    ];
  }

  if (doa.audio?.provider === "quran.com") {
    const audio = doa.audio;
    return Promise.all(
      audio.verseKeys.map((verseKey) => resolveQuranVerseAudio(audio.recitationId, verseKey))
    );
  }

  if (doa.audioUrl) {
    return [
      {
        label: doa.judul,
        url: doa.audioUrl
      }
    ];
  }

  return [];
}

export async function areAudioTracksCached(urls: string[]) {
  if (typeof caches === "undefined") {
    return false;
  }

  const cache = await caches.open("munajat-audio-v1");
  const matches = await Promise.all(urls.map((url) => cache.match(url)));
  return matches.every(Boolean);
}

export async function cacheAudioTracks(urls: string[]) {
  if (typeof caches === "undefined") {
    throw new Error("Cache API is not supported in this browser.");
  }

  const cache = await caches.open("munajat-audio-v1");
  await Promise.all(
    urls.map(async (url) => {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Unable to cache audio: ${url}`);
      }

      await cache.put(url, response);
    })
  );
}
