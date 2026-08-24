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
  { id: "cs42448", name: "Cirrus Logic CS42448 8-Channel Array", resolution: "24-Bit / 192kHz 6-In 8-Out", interface: "TDM / Multi-I2S", features: "8-channel ambisonic 3D spatial acoustic arrays and multichannel hydrophone capture", powerDrawW: 0.6 },
];

const SCALES: { [key: string]: { name: string; freqs: number[] } } = {
  cyberpunk: { name: "Cyberpunk Phrygian", freqs: [220.0, 233.08, 277.18, 293.66, 329.63, 349.23, 392.0, 440.0] },
  bladerunner: { name: "Blade Runner Dorian", freqs: [146.83, 164.81, 174.61, 196.0, 220.0, 246.94, 261.63, 293.66] },
  chiptune: { name: "Chiptune Pentatonic", freqs: [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33] },
  industrial: { name: "Industrial Glitch Hex", freqs: [130.81, 155.56, 164.81, 185.0, 196.0, 246.94, 261.63, 311.13] },
};

export default function AudioSynthStudio() {
  const [selectedDacId, setSelectedDacId] = useState<string>("pcm5102a");
  const [scaleKey, setScaleKey] = useState<string>("cyberpunk");
  const [waveform, setWaveform] = useState<OscillatorType>("square");
  const [bpm, setBpm] = useState<number>(124);
  const [filterCutoff, setFilterCutoff] = useState<number>(2400); // 200Hz - 8000Hz
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [copiedAsound, setCopiedAsound] = useState<boolean>(false);

  // 16-Step Pattern (note index 0-7 or -1 for rest)
  const [sequence, setSequence] = useState<number[]>([
    0, 2, 4, 3, 5, 4, 2, 0,
    7, 5, 4, 3, 2, 1, 0, -1,
  ]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const selectedDac = DAC_PROFILES.find((d) => d.id === selectedDacId) || DAC_PROFILES[0];
  const activeScale = SCALES[scaleKey] || SCALES.cyberpunk;

  // Step Sequencer Playback Loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const stepDurationMs = (60 / bpm / 4) * 1000; // 16th notes

    timerRef.current = window.setInterval(() => {
      setActiveStep((prev) => {
        const nextStep = (prev + 1) % 16;
        playStepTone(nextStep);
        return nextStep;
      });
    }, stepDurationMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, bpm, sequence, waveform, filterCutoff, activeScale]);

  const playStepTone = (stepIdx: number) => {
    const noteIdx = sequence[stepIdx];
    if (noteIdx === -1 || noteIdx === undefined) return;

    const freq = activeScale.freqs[noteIdx % activeScale.freqs.length];

    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = waveform;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(filterCutoff, ctx.currentTime);
      filter.Q.setValueAtTime(4.0, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (60 / bpm / 4) * 0.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + (60 / bpm / 4) * 0.9);
    } catch {
      // ignore
    }
  };

  const toggleStep = (stepIdx: number) => {
    soundFx.playClick();
    setSequence((prev) => {
      const next = [...prev];
      // Rotate through notes or rest
      if (next[stepIdx] === -1) next[stepIdx] = 0;
      else if (next[stepIdx] >= activeScale.freqs.length - 1) next[stepIdx] = -1;
      else next[stepIdx] = next[stepIdx] + 1;
      return next;
    });
  };

  // Linux ALSA & PipeWire Config Export
  const asoundConfExport = useMemo(() => {
    return `# /etc/asound.conf
# Decksmith HiFi I2S DAC Configuration
# Target Hardware: ${selectedDac.name}
# Resolution: ${selectedDac.resolution}

pcm.!default {
    type plug
    slave.pcm "softvol"
}

pcm.softvol {
    type softvol
    slave {
        pcm "dmix_i2s"
    }
    control {
        name "Master"
        card 0
    }
}

pcm.dmix_i2s {
    type dmix
    ipc_key 1024
    slave {
        pcm "hw:0,0"
        format S32_LE
        rate 48000
        channels 2
        period_size 256
        buffer_size 1024
    }
}

ctl.!default {
    type hw
    card 0
}
`;
  }, [selectedDac]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
              Cyberdeck Audio DSP & Chiptune Synth Studio
            </span>
            <span className="text-xs font-mono text-neon-green">16-Step Tracker · I2S DACs · ALSA asound.conf</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Music className="w-7 h-7 text-rose-400" />
            Cyberdeck Audio DSP & Chiptune Synth Studio
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Compose 16-step cyberpunk tracker sequences in real time, customize audio filter DSP parameters, and configure hardware I2S DACs with Linux ALSA scripts.
          </p>
        </div>

        {/* Cross-Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/pinout"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            40-Pin GPIO (I2S Bus)
          </Link>
          <Link
            to="/harness"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Wiring Loom Studio
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">DAC Sample Rate & SNR</span>
          <div className="text-2xl font-black text-rose-400 font-mono">384 kHz</div>
          <span className="text-xs text-gray-400 font-mono">{selectedDac.resolution.split(" ")[0]} · 112dB SNR</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Tempo & Step Rate</span>
          <div className="text-2xl font-black text-neon-green font-mono">{bpm} BPM</div>
          <span className="text-xs text-gray-400 font-mono">16th-Note Grid: {((60 / bpm / 4) * 1000).toFixed(0)} ms/step</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">DSP Lowpass Cutoff</span>
          <div className="text-2xl font-black text-cyan-400 font-mono">{filterCutoff} Hz</div>
          <span className="text-xs text-gray-400 font-mono">Resonance Q: 4.0 (Moog Style)</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Active Scale</span>
          <div className="text-2xl font-black text-yellow-400 font-mono">{activeScale.name.split(" ")[0]}</div>
          <span className="text-xs text-gray-400 font-mono">Root: A (220 Hz) · 8 Notes</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: 16-Step Tracker Sequencer & Synthesizer Controls */}
        <div className="lg:col-span-7 bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
              16-Step Chiptune Tracker Grid
            </h3>

            {/* Play/Pause Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                setIsPlaying((prev) => !prev);
              }}
              className="px-3 py-1.5 rounded-xl bg-neon-green text-black font-mono text-xs font-bold flex items-center gap-1.5 shadow-md shadow-neon-green/20"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "Stop Loop" : "Play Loop"}
            </button>
          </div>

          {/* 16-Step Buttons */}
          <div className="grid grid-cols-8 sm:grid-cols-8 gap-2">
            {sequence.map((noteIdx, idx) => {
              const isCurrent = activeStep === idx && isPlaying;
              const hasNote = noteIdx !== -1;

              return (
                <button
                  key={idx}
                  onClick={() => toggleStep(idx)}
                  className={`h-16 rounded-xl border flex flex-col items-center justify-center font-mono text-xs transition-all relative ${
                    isCurrent
                      ? "border-rose-400 bg-rose-950/80 shadow-lg shadow-rose-400/30 scale-105"
                      : hasNote
                      ? "border-gray-700 bg-gray-950 text-neon-green font-bold"
                      : "border-gray-800 bg-gray-950/40 text-gray-600"
                  }`}
                >
                  <span className="text-[9px] text-gray-500 absolute top-1 left-1.5">{idx + 1}</span>
                  <span className="font-bold text-sm">
                    {hasNote ? `N${noteIdx + 1}` : "—"}
                  </span>
                  {hasNote && (
                    <span className="text-[9px] text-gray-400">
                      {Math.round(activeScale.freqs[noteIdx % activeScale.freqs.length])}Hz
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Synth DSP Parameters */}
          <div className="space-y-4 pt-2 border-t border-gray-800">
            <h4 className="text-xs font-mono font-bold text-gray-300 uppercase">Audio DSP & Oscillator Engine</h4>

            {/* Waveform Select */}
            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
              {(["square", "sawtooth", "triangle", "sine"] as OscillatorType[]).map((wf) => (
                <button
                  key={wf}
                  onClick={() => {
                    soundFx.playClick();
                    setWaveform(wf);
                  }}
                  className={`p-2.5 rounded-xl border text-center uppercase transition-all ${
                    waveform === wf
                      ? "border-rose-400 bg-rose-950/40 text-white font-bold"
                      : "border-gray-800 bg-gray-950 text-gray-400"
                  }`}
                >
                  {wf}
                </button>
              ))}
            </div>

            {/* Scale Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              {Object.entries(SCALES).map(([k, s]) => (
                <button
                  key={k}
                  onClick={() => {
                    soundFx.playClick();
                    setScaleKey(k);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    scaleKey === k
                      ? "border-cyan-400 bg-cyan-950/40 text-white font-bold"
                      : "border-gray-800 bg-gray-950 text-gray-400"
                  }`}
                >
                  <div className="font-bold text-white text-[11px] truncate">{s.name}</div>
                </button>
              ))}
            </div>

            {/* BPM & Filter Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-300">Tempo (BPM)</span>
                  <span className="text-neon-green font-bold">{bpm} BPM</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={180}
                  step={2}
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full accent-neon-green cursor-pointer"
                />
              </div>

              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-300">Lowpass Cutoff (Hz)</span>
                  <span className="text-cyan-400 font-bold">{filterCutoff} Hz</span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={8000}
                  step={100}
                  value={filterCutoff}
                  onChange={(e) => setFilterCutoff(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: I2S Hardware Profiles & ALSA Exporter */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target DAC Hardware */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-3 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase">
              <Cpu className="w-4 h-4 text-rose-400" />
              1. Hardware I2S DAC / Codec
            </h3>
            <select
              value={selectedDacId}
              onChange={(e) => {
                soundFx.playClick();
                setSelectedDacId(e.target.value);
              }}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 font-mono text-cyan-300 font-bold text-xs"
            >
              {DAC_PROFILES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-400 font-mono pt-1 leading-relaxed">{selectedDac.features}</p>
          </div>

          {/* ALSA asound.conf Exporter */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                /etc/asound.conf (ALSA)
              </h3>
              <button
                onClick={() => {
                  soundFx.playConfirm();
                  navigator.clipboard.writeText(asoundConfExport);
                  setCopiedAsound(true);
                  setTimeout(() => setCopiedAsound(false), 2000);
                }}
                className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-mono flex items-center gap-1"
              >
                {copiedAsound ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
                {copiedAsound ? "Copied" : "Copy"}
              </button>
            </div>

            <pre className="p-3.5 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono text-rose-300 overflow-x-auto leading-relaxed select-all max-h-56">
              {asoundConfExport}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
