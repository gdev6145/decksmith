---
name: decksmith-sdr-dsp-audio-studio
description: >-
  Develop or enhance Software Defined Radio (SDR) spectrum visualizers, FFT waterfalls, WebAudio chiptune synths, and DSP tools.
  Use when modifying SdrRadioStudio, AudioSynthStudio, WebAudio API contexts, or audio frequency visualizers.
---

# Decksmith SDR Radio & WebAudio DSP Studio Guide

This skill provides patterns for building WebAudio DSP and SDR spectrum visualizers in `SdrRadioStudio.tsx` and `AudioSynthStudio.tsx`.

---

## 1. WebAudio API Synthesis & FFT Visualizer

```tsx
import React, { useEffect, useRef } from "react";

export function FFTWaterfallCanvas({ isStreaming }: { isStreaming: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isStreaming) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create WebAudio Context & Analyser
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let animId: number;
    const draw = () => {
      animId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgba(2, 6, 23, 0.2)"; // Soft tail fade
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        ctx.fillStyle = `rgb(6, ${barHeight + 100}, 212)`;
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      audioCtx.close();
    };
  }, [isStreaming]);

  return <canvas ref={canvasRef} width={800} height={200} className="w-full h-48 rounded-lg border border-cyan-500/30" />;
}
```
