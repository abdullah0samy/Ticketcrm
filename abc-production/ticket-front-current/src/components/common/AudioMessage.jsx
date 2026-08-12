import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@nextui-org/react";
import { HiOutlinePlay, HiOutlinePause } from "react-icons/hi2";
import { cn } from "../../utils/helper";

const formatClock = (value) => {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const total = Math.floor(value);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

/**
 * Voice-note player.
 *
 * The bars are a deterministic pseudo-waveform derived from the message id,
 * not real amplitude data: drawing a true waveform means decoding the whole
 * clip in the browser, which is far too much work for a chat list that may
 * hold dozens of them. They still give the progress bar something to fill.
 */
const barsFor = (seed) => {
  const bars = [];
  let x = (Number(seed) || 1) * 9301 + 49297;
  for (let i = 0; i < 32; i += 1) {
    x = (x * 9301 + 49297) % 233280;
    bars.push(0.25 + (x / 233280) * 0.75);
  }
  return bars;
};

export default function AudioMessage({ src, duration, seed, isMine = false }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(duration || 0);

  const bars = useMemo(() => barsFor(seed), [seed]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const onTime = () => setCurrent(audio.currentTime);
    const onEnd = () => {
      setIsPlaying(false);
      setCurrent(0);
    };
    const onMeta = () => {
      // Chrome reports Infinity for MediaRecorder blobs until it has seeked,
      // so the server-side duration stays authoritative when that happens.
      if (Number.isFinite(audio.duration)) setTotal(audio.duration);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("loadedmetadata", onMeta);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const seekTo = (ratio) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = audio.duration * ratio;
    setCurrent(audio.currentTime);
  };

  const progress = total > 0 ? Math.min(1, current / total) : 0;

  return (
    <div className="flex min-w-[13rem] items-center gap-2 sm:min-w-[15rem]">
      <audio ref={audioRef} src={src} preload="metadata" />
      <Button
        isIconOnly
        size="sm"
        radius="full"
        onPress={toggle}
        className={cn(
          "shrink-0",
          isMine ? "bg-white/25 text-white" : "bg-primary text-white"
        )}
        aria-label={isPlaying ? "pause" : "play"}
      >
        {isPlaying ? (
          <HiOutlinePause className="text-lg" />
        ) : (
          <HiOutlinePlay className="text-lg" />
        )}
      </Button>

      <div className="flex flex-1 flex-col gap-1">
        <div
          className="flex h-7 cursor-pointer items-center gap-[2px]"
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const ratio = (event.clientX - rect.left) / rect.width;
            seekTo(Math.max(0, Math.min(1, ratio)));
          }}
        >
          {bars.map((height, index) => (
            <span
              key={index}
              style={{ height: `${height * 100}%` }}
              className={cn(
                "w-full rounded-full transition-colors",
                index / bars.length <= progress
                  ? isMine
                    ? "bg-white"
                    : "bg-primary"
                  : isMine
                  ? "bg-white/40"
                  : "bg-default-300"
              )}
            />
          ))}
        </div>
        <span
          className={cn(
            "text-tiny tabular-nums",
            isMine ? "text-white/80" : "text-default-500"
          )}
        >
          {formatClock(isPlaying || current > 0 ? current : total)}
        </span>
      </div>
    </div>
  );
}
