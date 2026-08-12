import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Microphone recording for the ticket chat.
 *
 * Wraps MediaRecorder with the bits every caller would otherwise repeat: a
 * ticking duration, a live level meter, and — importantly — releasing the
 * microphone track when recording stops. Leaving the track open keeps the
 * browser's "recording" indicator lit for the rest of the session, which looks
 * like the app is listening in on a hospital floor.
 */

const pickMimeType = () => {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
};

export const isRecordingSupported = () =>
  typeof navigator !== "undefined" &&
  !!navigator.mediaDevices?.getUserMedia &&
  typeof MediaRecorder !== "undefined";

export default function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState(null);

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const rafRef = useRef(null);
  // Set when the user cancels so the `stop` handler knows to discard instead
  // of resolving with a clip nobody asked to keep.
  const discardRef = useRef(false);
  const resolveRef = useRef(null);

  const teardown = useCallback(() => {
    clearInterval(timerRef.current);
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
    }
    audioCtxRef.current = null;
    setLevel(0);
  }, []);

  useEffect(() => teardown, [teardown]);

  const start = useCallback(async () => {
    setError(null);
    if (!isRecordingSupported()) {
      setError("unsupported");
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      discardRef.current = false;

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = discardRef.current
          ? null
          : new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        chunksRef.current = [];
        teardown();
        setIsRecording(false);
        resolveRef.current?.(blob);
        resolveRef.current = null;
      };

      recorder.start(250);
      recorderRef.current = recorder;
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

      // Level meter. Purely cosmetic, so any failure here is swallowed rather
      // than aborting a recording that is otherwise fine.
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        const buffer = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteTimeDomainData(buffer);
          let peak = 0;
          for (let i = 0; i < buffer.length; i += 1) {
            peak = Math.max(peak, Math.abs(buffer[i] - 128));
          }
          setLevel(Math.min(1, peak / 64));
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        // no meter, recording continues
      }
      return true;
    } catch (err) {
      teardown();
      setIsRecording(false);
      setError(err?.name === "NotAllowedError" ? "denied" : "failed");
      return false;
    }
  }, [teardown]);

  /** Stops and resolves with the recorded Blob (or null if cancelled). */
  const stop = useCallback(
    (discard = false) =>
      new Promise((resolve) => {
        const recorder = recorderRef.current;
        if (!recorder || recorder.state === "inactive") {
          teardown();
          setIsRecording(false);
          resolve(null);
          return;
        }
        discardRef.current = discard;
        resolveRef.current = resolve;
        recorder.stop();
      }),
    [teardown]
  );

  const cancel = useCallback(() => stop(true), [stop]);

  return { isRecording, seconds, level, error, start, stop, cancel };
}
