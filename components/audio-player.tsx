"use client";

import { Download, Loader2, Pause, Play, Repeat, RotateCcw, SkipForward, Volume2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { areAudioTracksCached, cacheAudioTracks, resolveDoaAudio, type AudioTrack } from "@/lib/audio";
import type { Doa } from "@/lib/types/doa";
import { cn } from "@/lib/utils";

type AudioState = "idle" | "loading" | "ready" | "error";
type CacheState = "idle" | "cached" | "caching" | "error" | "unsupported";

function formatTime(value: number) {
  if (!Number.isFinite(value)) {
    return "0:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function AudioPlayer({ doa }: { doa: Doa }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [trackIndex, setTrackIndex] = useState(0);
  const [audioState, setAudioState] = useState<AudioState>("idle");
  const [cacheState, setCacheState] = useState<CacheState>("idle");
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const currentTrack = tracks[trackIndex];
  const trackUrls = useMemo(() => tracks.map((track) => track.url), [tracks]);
  const canUseAudio = Boolean(doa.audio || doa.audioUrl);

  useEffect(() => {
    if (!canUseAudio) {
      return;
    }

    let cancelled = false;
    setAudioState("loading");
    setCacheState(typeof caches === "undefined" ? "unsupported" : "idle");

    resolveDoaAudio(doa)
      .then((resolvedTracks) => {
        if (cancelled) {
          return;
        }

        setTracks(resolvedTracks);
        setTrackIndex(0);
        setAudioState(resolvedTracks.length > 0 ? "ready" : "error");
      })
      .catch(() => {
        if (!cancelled) {
          setAudioState("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [canUseAudio, doa]);

  useEffect(() => {
    if (!trackUrls.length || typeof caches === "undefined") {
      return;
    }

    areAudioTracksCached(trackUrls)
      .then((cached) => setCacheState(cached ? "cached" : "idle"))
      .catch(() => setCacheState("idle"));
  }, [trackUrls]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed, currentTrack]);

  if (!canUseAudio) {
    return null;
  }

  const togglePlayback = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
      return;
    }

    audio.pause();
    setIsPlaying(false);
  };

  const replay = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.currentTime = 0;
    void audio.play();
    setIsPlaying(true);
  };

  const skip = () => {
    if (tracks.length <= 1) {
      replay();
      return;
    }

    setTrackIndex((current) => (current + 1) % tracks.length);
    setCurrentTime(0);
  };

  const handleEnded = () => {
    if (trackIndex < tracks.length - 1) {
      setTrackIndex((current) => current + 1);
      setCurrentTime(0);
      window.setTimeout(() => {
        void audioRef.current?.play();
      }, 0);
      return;
    }

    if (repeat) {
      setTrackIndex(0);
      setCurrentTime(0);
      window.setTimeout(() => {
        void audioRef.current?.play();
      }, 0);
      return;
    }

    setIsPlaying(false);
  };

  const cacheTracks = () => {
    setCacheState("caching");
    void cacheAudioTracks(trackUrls)
      .then(() => setCacheState("cached"))
      .catch(() => setCacheState("error"));
  };

  const seek = (value: string) => {
    const audio = audioRef.current;
    const nextTime = Number(value);

    if (!audio || Number.isNaN(nextTime)) {
      return;
    }

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return (
    <div className="rounded-lg border bg-background/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <Volume2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Audio bacaan</p>
            <p className="text-xs text-muted-foreground">
              {doa.audio?.provider === "quran.com" ? doa.audio.reciter : "Rekaman lokal"}
            </p>
          </div>
        </div>
        {audioState === "loading" ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
      </div>

      {audioState === "error" ? (
        <p className="mt-3 text-sm text-muted-foreground">Audio belum bisa dimuat. Coba saat koneksi tersedia.</p>
      ) : null}

      {currentTrack && audioState === "ready" ? (
        <div className="mt-4 space-y-4">
          <audio
            ref={audioRef}
            src={currentTrack.url}
            preload="metadata"
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
            onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={handleEnded}
          />

          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {currentTrack.label}
                {tracks.length > 1 ? ` (${trackIndex + 1}/${tracks.length})` : ""}
              </span>
              <span>
                {formatTime(currentTime)} / {formatTime(duration || currentTrack.duration || 0)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={duration || currentTrack.duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || currentTrack.duration || 0)}
              onChange={(event) => seek(event.target.value)}
              className="w-full accent-primary"
              aria-label="Posisi audio"
            />
            <Progress value={duration ? (currentTime / duration) * 100 : 0} className="mt-2 h-1" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="icon" aria-label={isPlaying ? "Jeda audio" : "Putar audio"} onClick={togglePlayback}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" aria-label="Ulang dari awal" onClick={replay}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Ayat berikutnya" onClick={skip}>
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button
              variant={repeat ? "secondary" : "outline"}
              size="icon"
              aria-label="Ulangi paket audio"
              onClick={() => setRepeat((current) => !current)}
            >
              <Repeat className="h-4 w-4" />
            </Button>
            {[0.75, 1, 1.25].map((speedOption) => (
              <Button
                key={speedOption}
                variant={speed === speedOption ? "secondary" : "outline"}
                size="sm"
                onClick={() => setSpeed(speedOption)}
              >
                {speedOption}x
              </Button>
            ))}
            <Button
              variant={cacheState === "cached" ? "secondary" : "outline"}
              size="sm"
              onClick={cacheTracks}
              disabled={cacheState === "cached" || cacheState === "caching" || cacheState === "unsupported"}
              className="ml-auto"
            >
              {cacheState === "caching" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span className={cn(cacheState === "cached" ? "inline" : "hidden sm:inline")}>
                {cacheState === "cached" ? "Offline siap" : "Simpan offline"}
              </span>
            </Button>
          </div>

          {cacheState === "error" ? (
            <p className="text-xs text-muted-foreground">Audio belum berhasil disimpan offline.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
