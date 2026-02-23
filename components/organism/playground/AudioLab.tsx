"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import "@/lib/i18n";
import { useTranslation } from "react-i18next";

type Status = "idle" | "recording" | "recorded";

export default function AudioLab() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const lan = pathname.split("/")[1];

  useEffect(() => {
    if (["en", "ja", "ko"].includes(lan)) {
      i18n.changeLanguage(lan);
    }
  }, [lan, i18n]);

  // State
  const [status, setStatus] = useState<Status>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafIdRef = useRef<number>(0);

  // Playback refs
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const playbackSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const stopAnimation = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const cleanupPlayback = useCallback(() => {
    playbackSourceRef.current?.disconnect();
    playbackSourceRef.current = null;
    if (playbackCtxRef.current && playbackCtxRef.current.state !== "closed") {
      playbackCtxRef.current.close();
    }
    playbackCtxRef.current = null;
  }, []);

  const cleanup = useCallback(() => {
    stopAnimation();

    // Stop MediaRecorder
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;

    // Disconnect source
    sourceRef.current?.disconnect();
    sourceRef.current = null;

    // Stop all tracks
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    // Close AudioContext
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close();
    }
    audioCtxRef.current = null;
    analyserRef.current = null;
  }, [stopAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      cleanupPlayback();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Visualization loop ───────────────────────────────────
  const draw = useCallback(() => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      rafIdRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const gap = 1;
      const barWidth = (width - gap * (bufferLength - 1)) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;

        // Gradient from cyan to violet
        const ratio = i / bufferLength;
        const r = Math.round(60 + ratio * 180);
        const g = Math.round(200 - ratio * 140);
        const b = Math.round(255 - ratio * 40);
        ctx.fillStyle = `rgb(${r},${g},${b})`;

        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + gap;
      }
    };

    render();
  }, []);

  // ── Start recording ──────────────────────────────────────
  const startRecording = async () => {
    setError(null);

    // Revoke previous blob URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      // Request mic
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // AudioContext + Analyser
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      await audioCtx.resume();

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      // MediaRecorder for blob capture
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setStatus("recorded");
      };

      recorder.start();
      recorderRef.current = recorder;

      setStatus("recording");
      draw();
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? t("audio_lab_error_mic_denied")
          : t("audio_lab_error_start_failed");
      setError(message);
      cleanup();
      setStatus("idle");
    }
  };

  // ── Stop recording ───────────────────────────────────────
  const stopRecording = () => {
    // Stop animation
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
    }

    // Stop MediaRecorder (triggers onstop → sets audioUrl)
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }

    // Stop mic tracks
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    // Disconnect nodes
    sourceRef.current?.disconnect();
    sourceRef.current = null;

    // Close AudioContext
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close();
    }
    audioCtxRef.current = null;
    analyserRef.current = null;
  };

  // ── Playback visualization ──────────────────────────────
  const startPlaybackViz = useCallback(() => {
    const audioEl = audioElRef.current;
    if (!audioEl) return;

    if (!playbackCtxRef.current) {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;

      const source = ctx.createMediaElementSource(audioEl);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      playbackCtxRef.current = ctx;
      playbackSourceRef.current = source;
      analyserRef.current = analyser;
    }

    playbackCtxRef.current.resume();
    draw();
  }, [draw]);

  const stopPlaybackViz = useCallback(() => {
    stopAnimation();
  }, [stopAnimation]);

  // ── Reset ────────────────────────────────────────────────
  const reset = () => {
    cleanup();
    cleanupPlayback();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setStatus("idle");
    setError(null);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 mt-16">
      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t("audio_lab_title")}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {t("audio_lab_description")}
        <br />
        {t("audio_lab_privacy")}
      </p>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className="w-full max-w-150 rounded-lg bg-gray-900 dark:bg-gray-950 border border-gray-700 dark:border-gray-600"
      />

      {/* Controls */}
      <div className="flex gap-3">
        {status === "idle" && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
          >
            <span className="inline-block w-3 h-3 rounded-full bg-white animate-pulse" />
            {t("audio_lab_record")}
          </button>
        )}

        {status === "recording" && (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white bg-gray-600 hover:bg-gray-700 transition-colors"
          >
            <span className="inline-block w-3 h-3 rounded-sm bg-white" />
            {t("audio_lab_stop")}
          </button>
        )}

        {status === "recorded" && (
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors"
          >
            {t("audio_lab_new_recording")}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      {/* Playback */}
      {audioUrl && (
        <div className="w-full max-w-150 flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("audio_lab_playback")}
          </p>
          <audio
            ref={audioElRef}
            controls
            src={audioUrl}
            className="w-full"
            onPlay={startPlaybackViz}
            onPause={stopPlaybackViz}
            onEnded={stopPlaybackViz}
          />
        </div>
      )}
    </div>
  );
}
