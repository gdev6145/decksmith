import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Radio,
  Activity,
  Sliders,
  Sparkles,
  Download,
  Copy,
  Check,
  Compass,
  Crosshair,
  FileCode,
  Shield,
  Zap,
  Cpu,
  Layers,
  Flame,
  CheckCircle2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Usb,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface FrequencyBand {
  id: string;
  name: string;
  category: string;
  freqMhz: number;
  bandwidthKhz: number;
  modulation: string;
  description: string;
}

const FREQ_BANDS: FrequencyBand[] = [
  {
    id: "meshtastic-us",
    name: "Meshtastic US LongFast",
    category: "Mesh Network",
    freqMhz: 915.0,
    bandwidthKhz: 250,
    modulation: "LoRa (SF11 / CR 4/5)",
    description: "Decentralized tactical off-grid mesh text and telemetry network across 902-928MHz ISM.",
  },
  {
    id: "adsb-radar",
    name: "ADS-B Aircraft Transponders",
    category: "Aviation",
    freqMhz: 1090.0,
    bandwidthKhz: 2000,
    modulation: "PPM Mode-S",
    description: "Real-time aircraft flight tracking, altitude, squawk codes, and GPS coordinates.",
  },
  {
    id: "noaa-weather",
    name: "NOAA-19 Weather Satellite",
    category: "Satellite",
    freqMhz: 137.1,
    bandwidthKhz: 40,
    modulation: "FM / APT Analogue Image",
    description: "Direct polar-orbiting satellite weather cloud cover facsimile image downlinks.",
  },
  {
    id: "aprs-packet",
    name: "APRS 2m Packet Radio / ISS",
    category: "Amateur Radio",
    freqMhz: 144.39,
    bandwidthKhz: 12.5,
    modulation: "1200 Baud AFSK",
    description: "Automatic Packet Reporting System for position beacons, weather, and ISS relay.",
  },
];

export default function SdrRadioStudio() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedBandId, setSelectedBandId] = useState<string>("meshtastic-us");
  const [gainDb, setGainDb] = useState<number>(38.0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [webUsbStatus, setWebUsbStatus] = useState<string>("No SDR Connected");

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  const selectedBand = FREQ_BANDS.find((b) => b.id === selectedBandId) || FREQ_BANDS[0];

  const toggleAudioDemod = () => {
    soundFx.playConfirm();
    if (isPlayingAudio) {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      setIsPlayingAudio(false);
      return;
    }

    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }

    if (audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (selectedBand.id === "noaa-weather") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(1050, ctx.currentTime);
      } else if (selectedBand.id === "aprs-packet") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
      } else {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
      }

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
      setIsPlayingAudio(true);
    }
  };

  const handleConnectWebUsb = async () => {
    soundFx.playConfirm();
    if (!("usb" in navigator)) {
      alert("WebUSB API is not supported in this browser.");
      return;
    }
    try {
      const device = await (navigator as any).usb.requestDevice({
        filters: [{ vendorId: 0x0bda }, { vendorId: 0x1d50 }], // RTL2832U, HackRF
      });
      setWebUsbStatus(`Connected: ${device.productName || "SDR Device"}`);
      soundFx.playConfirm();
    } catch (err: any) {
      setWebUsbStatus(`WebUSB: ${err.message}`);
    }
  };

  // Waterfall Spectrum Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Draw top FFT Spectrum
      ctx.fillStyle = "#07090e";
      ctx.fillRect(0, 0, w, 120);

      ctx.strokeStyle = "#1e2638";
      ctx.beginPath();
      for (let y = 20; y < 120; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // FFT Curve
      ctx.strokeStyle = "#00ff66";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 110);

      offset += 0.05;
      for (let x = 0; x < w; x += 4) {
        const centerDist = Math.abs(x - w / 2);
        const peak = Math.exp(-Math.pow(centerDist / 30, 2)) * (gainDb * 1.8);
        const noise = Math.sin(x * 0.1 + offset) * 8 + Math.random() * 6;
        const y = 110 - (peak + noise);
        ctx.lineTo(x, Math.max(10, y));
      }
      ctx.stroke();

      // Draw Waterfall area
      ctx.fillStyle = "rgba(0, 243, 255, 0.03)";
      ctx.fillRect(0, 125, w, h - 125);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [selectedBand, gainDb]);

  const handleExportGqrx = () => {
    soundFx.playConfirm();
    let conf = `[General]\n`;
    conf += `c_freq=${Math.round(selectedBand.freqMhz * 1e6)}\n`;
    conf += `bandwidth=${selectedBand.bandwidthKhz * 1000}\n`;
    conf += `gain=${gainDb}\n`;
    conf += `demod=${selectedBand.modulation}\n`;

    const blob = new Blob([conf], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decksmith-gqrx-${selectedBand.id}.conf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-mono space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 mb-2">
            <Radio className="w-3.5 h-3.5" />
            Software Defined Radio & Waterfall Analyzer
          </div>
          <h1 className="text-3xl font-black text-white">SDR & Spectrum Studio</h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time FFT spectrum, live WebAudio demodulation simulator, and RTL-SDR / HackRF WebUSB bridge
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={toggleAudioDemod}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              isPlayingAudio ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
            }`}
          >
            {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isPlayingAudio ? "Mute Demod" : "Listen Demod"}</span>
          </button>

          <button
            onClick={handleExportGqrx}
            className="px-4 py-2.5 bg-neon-green text-black font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-neon-green/20"
          >
            <Download className="w-4 h-4" />
            Export GQRX Conf
          </button>
        </div>
      </div>

      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Tuned Frequency</span>
          <div className="text-2xl font-black text-neon-green">{selectedBand.freqMhz} MHz</div>
          <span className="text-[11px] text-gray-500">{selectedBand.name}</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Bandwidth</span>
          <div className="text-2xl font-black text-cyan-400">{selectedBand.bandwidthKhz} kHz</div>
          <span className="text-[11px] text-gray-500">Filter Width</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">LNA / VGA Gain</span>
          <div className="text-2xl font-black text-amber-400">{gainDb} dB</div>
          <span className="text-[11px] text-gray-500">RF Front-End Gain</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Modulation Mode</span>
          <div className="text-2xl font-black text-purple-400">{selectedBand.modulation.split(" ")[0]}</div>
          <span className="text-[11px] text-gray-500">{selectedBand.category}</span>
        </div>
      </div>

      {/* Waterfall Canvas & Preset Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Waterfall Canvas */}
        <div className="lg:col-span-8 bg-gray-900/90 border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h2 className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 text-neon-green" />
              Real-Time FFT Spectrum & Waterfall Display
            </h2>
            <span className="text-[10px] text-neon-green font-bold">Center: {selectedBand.freqMhz} MHz</span>
          </div>

          <div className="bg-gray-950 rounded-2xl border border-gray-800 p-2 overflow-hidden">
            <canvas ref={canvasRef} width={640} height={280} className="w-full h-[280px]" />
          </div>

          {/* Gain Slider */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Tuner RF Gain:</span>
              <span className="text-amber-400 font-bold">{gainDb} dB</span>
            </div>
            <input
              type="range"
              min="0"
              max="49.6"
              step="0.5"
              value={gainDb}
              onChange={(e) => setGainDb(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        </div>

        {/* Bands & WebUSB */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-xl space-y-3">
            <h2 className="text-xs font-bold text-white uppercase flex items-center gap-2 border-b border-gray-800 pb-2.5">
              <Radio className="w-4 h-4 text-cyan-400" />
              Tuning Presets
            </h2>

            <div className="space-y-2">
              {FREQ_BANDS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedBandId(b.id);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left transition-all ${
                    selectedBandId === b.id
                      ? "bg-gray-950 border-neon-green text-white shadow-md"
                      : "bg-gray-950/60 border-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  <div className="flex justify-between text-xs font-bold">
                    <span>{b.name}</span>
                    <span className="text-cyan-400">{b.freqMhz} MHz</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1 line-clamp-1">{b.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-xl space-y-3">
            <h2 className="text-xs font-bold text-white uppercase flex items-center gap-2 border-b border-gray-800 pb-2.5">
              <Usb className="w-4 h-4 text-purple-400" />
              Hardware WebUSB Bridge
            </h2>

            <p className="text-xs text-gray-400">Connect RTL-SDR v4, HackRF One, or Airspy directly from browser.</p>

            <button
              onClick={handleConnectWebUsb}
              className="w-full py-2.5 bg-gray-950 border border-purple-500/40 hover:border-purple-500 text-purple-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <Usb className="w-4 h-4" />
              <span>Connect Physical SDR</span>
            </button>

            <div className="text-[10px] text-gray-500 text-center">{webUsbStatus}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
