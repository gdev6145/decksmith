import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Mic,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Sparkles,
  Download,
  Copy,
  Check,
  FileCode,
  Shield,
  Activity,
  Cpu,
  Layers,
  Flame,
  Radio,
  Music,
  Disc,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface DacHardware {
  id: string;
  name: string;
  resolution: string;
  interface: string;
  features: string;
  powerDrawW: number;
}

const DAC_PROFILES: DacHardware[] = [
  { id: "pcm5102a", name: "TI PCM5102A 32-Bit 384kHz HiFi DAC", resolution: "32-Bit / 384kHz (SNR 112dB)", interface: "3-Wire I2S (BCLK, LRCK, DIN)", features: "Integrated negative charge pump for true DC ground; no MCLK required", powerDrawW: 0.15 },
  { id: "wm8960", name: "Cirrus Wolfson WM8960 Audio Codec", resolution: "24-Bit / 48kHz Stereo DAC+ADC", interface: "4-Wire I2S + I2C Control", features: "Dual on-board MEMS microphones, 1W stereo speaker amp + 3.5mm headphone jack", powerDrawW: 0.35 },
  { id: "max98357a", name: "Maxim MAX98357A 3.2W Class-D Amp", resolution: "16-Bit / 32-Bit Mono I2S", interface: "3-Wire I2S (Automatic Mono Sum)", features: "Directly drives 4Ω/8Ω speaker transducers with 92% high efficiency", powerDrawW: 1.2 },
];

const SCALES: { [key: string]: { name: string; freqs: number[]; notes: string[] } } = {
  cyberpunk: { name: "Cyberpunk Phrygian", freqs: [220.0, 233.08, 277.18, 293.66, 329.63, 349.23, 392.0, 440.0], notes: ["A3", "A#3", "C#4", "D4", "E4", "F4", "G4", "A4"] },
  bladerunner: { name: "Blade Runner Dorian", freqs: [146.83, 164.81, 174.61, 196.0, 220.0, 246.94, 261.63, 293.66], notes: ["D3", "E3", "F3", "G3", "A3", "B3", "C4", "D4"] },
  chiptune: { name: "Chiptune Pentatonic", freqs: [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33], notes: ["A3", "C4", "D4", "E4", "G4", "A4", "C5", "D5"] },
};

export default function AudioSynthStudio() {
  const [selectedDacId, setSelectedDacId] = useState<string>("pcm5102a");
  const [scaleKey, setScaleKey] = useState<string>("cyberpunk");
  const [waveform, setWaveform] = useState<OscillatorType>("square");
  const [bpm, setBpm] = useState<number>(124);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [activePlayingNote, setActivePlayingNote] = useState<string | null>(null);

  const [sequence, setSequence] = useState<number[]>([
    0, 2, 4, 3, 5, 4, 2, 0,
    7, 5, 4, 3, 2, 1, 0, -1,
  ]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const activeScale = SCALES[scaleKey] || SCALES.cyberpunk;

  // Web MIDI Hardware Controller Support
  const [midiDeviceName, setMidiDeviceName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "requestMIDIAccess" in navigator) {
      (navigator as any).requestMIDIAccess().then((midiAccess: any) => {
        const updateMidiInputs = () => {
          const inputs = Array.from(midiAccess.inputs.values()) as any[];
          if (inputs.length > 0) {
            setMidiDeviceName(inputs[0].name || "Physical MIDI Controller");
            inputs[0].onmidimessage = (msg: any) => {
              const [status, noteNumber, velocity] = msg.data;
              // Note On (status 144) with velocity > 0
              if ((status & 0xf0) === 0x90 && velocity > 0) {
                const freq = 440 * Math.pow(2, (noteNumber - 69) / 12);
                playFrequency(freq);
              }
            };
          } else {
            setMidiDeviceName(null);
          }
        };

        updateMidiInputs();
        midiAccess.onstatechange = updateMidiInputs;
      }).catch(() => {});
    }
  }, [waveform]);

  const initAudio = () => {
    if (!audioCtxRef.current && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const playFrequency = (freq: number) => {
    initAudio();
    if (!audioCtxRef.current) return;

    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = waveform;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const stepDurationMs = (60 / bpm / 4) * 1000;

    timerRef.current = window.setInterval(() => {
      setActiveStep((prev) => {
        const nextStep = (prev + 1) % 16;
        const noteIdx = sequence[nextStep];
        if (noteIdx !== -1 && noteIdx !== undefined) {
          playFrequency(activeScale.freqs[noteIdx % activeScale.freqs.length]);
        }
        return nextStep;
      });
    }, stepDurationMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, bpm, sequence, waveform, activeScale]);

  const handleExportCHeader = () => {
    soundFx.playConfirm();
    let code = `// DECKSMITH AUTOGENERATED CHIPTUNE SOUND HEADER\n`;
    code += `// Scale: ${activeScale.name} | Waveform: ${waveform} | BPM: ${bpm}\n\n`;
    code += `#ifndef CHIPTUNE_SONG_H\n#define CHIPTUNE_SONG_H\n\n`;
    code += `const float SONG_FREQUENCIES[] = {\n  `;
    code += sequence.map((s) => (s >= 0 ? activeScale.freqs[s % activeScale.freqs.length].toFixed(2) : "0.0")).join(", ");
    code += `\n};\n\n`;
    code += `const int SONG_LENGTH = 16;\n`;
    code += `const int NOTE_DURATION_MS = ${Math.round((60 / bpm / 4) * 1000)};\n\n`;
    code += `#endif\n`;

    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chiptune_melody.h`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-mono space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-pink-500/10 text-pink-300 border border-pink-500/30">
              <Music className="w-3.5 h-3.5" />
              I2S Audio DAC & Chiptune Polyphonic Synthesizer
            </div>
            {midiDeviceName ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-neon-green border border-neon-green/30">
                <Activity className="w-3 h-3 animate-pulse" />
                MIDI Hardware: {midiDeviceName} (Active)
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-950 text-gray-500 border border-gray-800">
                <Disc className="w-3 h-3" />
                Web MIDI Ready (Plug in USB Controller)
              </div>
            )}
          </div>
          <h1 className="text-3xl font-black text-white">Chiptune Audio Synth & Tracker Studio</h1>
          <p className="text-xs text-gray-400 mt-1">
            Program 16-step chiptune melodies with live WebAudio square/triangle synthesis and export C audio headers
          </p>
        </div>

        <button
          onClick={handleExportCHeader}
          className="px-4 py-2.5 bg-neon-green text-black font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-neon-green/20"
        >
          <Download className="w-4 h-4" />
          Export C Melody (.h)
        </button>
      </div>

      {/* Main Grid: Interactive Synthesizer Piano Roll & Step Sequencer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step Sequencer */}
        <div className="lg:col-span-8 bg-gray-900/90 border border-gray-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  soundFx.playConfirm();
                  setIsPlaying(!isPlaying);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  isPlaying ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-neon-green text-black shadow-lg shadow-neon-green/20"
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? "Stop Loop" : "Play Sequence"}</span>
              </button>

              <span className="text-xs font-bold text-gray-300">{bpm} BPM</span>
            </div>

            {/* Scale Selector */}
            <div className="flex gap-1.5">
              {Object.keys(SCALES).map((sk) => (
                <button
                  key={sk}
                  onClick={() => {
                    soundFx.playClick();
                    setScaleKey(sk);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase transition-all ${
                    scaleKey === sk ? "bg-purple-500 text-white shadow-md" : "bg-gray-950 text-gray-400 border border-gray-800"
                  }`}
                >
                  {sk}
                </button>
              ))}
            </div>
          </div>

          {/* 16-Step Grid */}
          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
            {sequence.map((noteIdx, stepIdx) => {
              const isCurrent = isPlaying && activeStep === stepIdx;
              const noteName = noteIdx >= 0 ? activeScale.notes[noteIdx % activeScale.notes.length] : "-";

              return (
                <button
                  key={stepIdx}
                  onClick={() => {
                    soundFx.playClick();
                    setSequence((prev) => {
                      const next = [...prev];
                      next[stepIdx] = (next[stepIdx] + 2) % (activeScale.notes.length + 1) - 1;
                      return next;
                    });
                  }}
                  className={`h-16 rounded-xl border text-xs font-bold flex flex-col items-center justify-between p-1 transition-all ${
                    isCurrent
                      ? "border-neon-green bg-neon-green/20 shadow-md shadow-neon-green/40 scale-105"
                      : noteIdx >= 0
                      ? "bg-gray-950 border-purple-500/60 text-purple-300"
                      : "bg-gray-950/40 border-gray-800 text-gray-600"
                  }`}
                >
                  <span className="text-[8px] text-gray-500">{stepIdx + 1}</span>
                  <span className="font-bold">{noteName}</span>
                </button>
              );
            })}
          </div>

          {/* Live Interactive Piano Keys */}
          <div className="pt-4 border-t border-gray-800">
            <span className="text-[10px] text-gray-400 font-bold uppercase block mb-2">Live Piano Keyboard Sandbox:</span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {activeScale.notes.map((note, idx) => (
                <button
                  key={note}
                  onClick={() => {
                    playFrequency(activeScale.freqs[idx]);
                    setActivePlayingNote(note);
                    setTimeout(() => setActivePlayingNote(null), 150);
                  }}
                  className={`py-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center ${
                    activePlayingNote === note
                      ? "bg-pink-500 text-white shadow-lg shadow-pink-500/40 scale-95"
                      : "bg-gray-950 border-gray-800 text-gray-200 hover:border-pink-500/60 hover:text-white"
                  }`}
                >
                  <span>{note}</span>
                  <span className="text-[9px] text-gray-500">{Math.round(activeScale.freqs[idx])}Hz</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Waveform & DAC Settings */}
        <div className="lg:col-span-4 bg-gray-900/90 border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-xs font-bold text-white uppercase flex items-center gap-2 border-b border-gray-800 pb-2.5">
            <Disc className="w-4 h-4 text-purple-400" />
            Synthesizer Waveform
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-400 mb-1 font-bold">Oscillator Type:</label>
              <div className="grid grid-cols-2 gap-2">
                {(["square", "sawtooth", "triangle", "sine"] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => {
                      soundFx.playClick();
                      setWaveform(w);
                    }}
                    className={`p-2 rounded-xl border font-bold uppercase text-[11px] transition-all ${
                      waveform === w ? "bg-purple-500 text-white border-purple-400 shadow-md" : "bg-gray-950 border-gray-800 text-gray-400"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-gray-400 mb-1">
                <span>Tempo BPM:</span>
                <span className="text-neon-green font-bold">{bpm} BPM</span>
              </div>
              <input
                type="range"
                min="60"
                max="200"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-neon-green"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
