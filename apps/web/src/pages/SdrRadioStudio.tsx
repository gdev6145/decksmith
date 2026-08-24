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
    id: "meshtastic-eu",
    name: "Meshtastic EU LongFast",
    category: "Mesh Network",
    freqMhz: 868.0,
    bandwidthKhz: 250,
    modulation: "LoRa (SF11 / CR 4/5)",
    description: "European 868MHz SRD band tactical mesh communicators and solar repeater nodes.",
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
  {
    id: "ism-433",
    name: "433MHz ISM / Sub-GHz Sensors",
    category: "Telemetry",
    freqMhz: 433.92,
    bandwidthKhz: 100,
    modulation: "OOK / ASK / FSK",
    description: "Wireless weather stations, TPMS tire pressure sensors, keyfobs, and IoT remotes.",
  },
];

interface SdrHardware {
  id: string;
  name: string;
  rangeMhz: string;
  adcBits: number;
  sampleRateMsps: number;
  txCapable: boolean;
}

const SDR_DEVICES: SdrHardware[] = [
  { id: "rtl-sdr-v4", name: "RTL-SDR Blog v4", rangeMhz: "0.5 - 1766 MHz", adcBits: 8, sampleRateMsps: 2.4, txCapable: false },
  { id: "hackrf-one", name: "Great Scott Gadgets HackRF One", rangeMhz: "1 - 6000 MHz", adcBits: 8, sampleRateMsps: 20.0, txCapable: true },
  { id: "limesdr-mini", name: "LimeSDR Mini v2", rangeMhz: "10 - 3500 MHz", adcBits: 12, sampleRateMsps: 30.72, txCapable: true },
  { id: "plutosdr", name: "ADALM-PLUTO (PlutoSDR)", rangeMhz: "70 - 6000 MHz", adcBits: 12, sampleRateMsps: 61.44, txCapable: true },
];

export default function SdrRadioStudio() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedBandId, setSelectedBandId] = useState<string>("meshtastic-us");
  const [selectedSdrId, setSelectedSdrId] = useState<string>("rtl-sdr-v4");
  const [gainDb, setGainDb] = useState<number>(32);
  const [coaxLengthM, setCoaxLengthM] = useState<number>(1.5);
  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);

  const selectedBand = FREQ_BANDS.find((b) => b.id === selectedBandId) || FREQ_BANDS[0];
  const selectedSdr = SDR_DEVICES.find((s) => s.id === selectedSdrId) || SDR_DEVICES[0];

  // Antenna Tuning Calculations
  const antennaMetrics = useMemo(() => {
    const f = selectedBand.freqMhz;
    // Quarter wave in mm: (300 / 4f) * 0.95 * 1000
    const quarterWaveMm = Math.round((71.25 / f) * 1000);
    // Half wave dipole in mm: (300 / 2f) * 0.95 * 1000
    const halfWaveMm = Math.round((142.5 / f) * 1000);

    // RG-316 Coax loss (~0.8dB/m @ 1GHz)
    const coaxLossDb = Number((coaxLengthM * (f > 500 ? 0.85 : 0.45)).toFixed(2));

    return {
      quarterWaveMm,
      halfWaveMm,
      coaxLossDb,
      wavelengthM: Number((300 / f).toFixed(3)),
    };
  }, [selectedBand, coaxLengthM]);

  // Waterfall Spectrogram Animation
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

      // Shift existing image down 2px
      ctx.drawImage(canvas, 0, 0, w, h - 2, 0, 2, w, h - 2);

      // Generate new spectrum top line
      const lineData = ctx.createImageData(w, 2);
      offset += 0.05;

      for (let x = 0; x < w; x++) {
        // Noise floor + signal peak in center
        const distFromCenter = Math.abs(x - w / 2) / (w / 2);
        const signalPeak = Math.exp(-distFromCenter * distFromCenter * 35) * (gainDb / 40);
        const noise = Math.random() * 0.25;
        const intensity = Math.min(1, Math.max(0, signalPeak + noise));

        // Neon Cyberpunk Color Palette (Black -> Indigo -> Cyan -> Neon Green -> Yellow)
        let r = 0, g = 0, b = 0;
        if (intensity < 0.3) {
          b = Math.floor(intensity * 3 * 255);
        } else if (intensity < 0.7) {
          g = Math.floor((intensity - 0.3) * 2.5 * 255);
          b = 255;
        } else {
          r = Math.floor((intensity - 0.7) * 3.3 * 255);
          g = 255;
          b = Math.floor((1 - intensity) * 3.3 * 255);
        }

        const idx = x * 4;
        lineData.data[idx] = r;
        lineData.data[idx + 1] = g;
        lineData.data[idx + 2] = b;
        lineData.data[idx + 3] = 255;

        // Second row
        const idx2 = (w + x) * 4;
        lineData.data[idx2] = r;
        lineData.data[idx2 + 1] = g;
        lineData.data[idx2 + 2] = b;
        lineData.data[idx2 + 3] = 255;
      }

      ctx.putImageData(lineData, 0, 0);
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [selectedBand, gainDb]);

  const sdrConfigExport = useMemo(() => {
    return `# Decksmith SDR Bookmark & Radio Config
# Target Device: ${selectedSdr.name}
# Frequency: ${selectedBand.freqMhz} MHz (${selectedBand.name})
# Modulation: ${selectedBand.modulation}

[SDR_RECEIVER]
center_frequency = ${selectedBand.freqMhz * 1000000}
sample_rate = ${selectedSdr.sampleRateMsps * 1000000}
lna_gain_db = ${gainDb}
bandwidth_hz = ${selectedBand.bandwidthKhz * 1000}
dc_offset_correction = true
iq_balance_correction = true

[ANTENNA_TUNING]
quarter_wave_whip_mm = ${antennaMetrics.quarterWaveMm}
half_wave_dipole_mm = ${antennaMetrics.halfWaveMm}
cable_attenuation_db = -${antennaMetrics.coaxLossDb}dB (${coaxLengthM}m RG-316)
`;
  }, [selectedSdr, selectedBand, gainDb, antennaMetrics, coaxLengthM]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              SDR Spectrum & Tactical Radio Studio
            </span>
            <span className="text-xs font-mono text-neon-green">Meshtastic · ADS-B · NOAA APT · Antenna Tuner</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Radio className="w-7 h-7 text-indigo-400" />
            Tactical SDR Spectrum & Mesh Radio Studio
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Analyze RF spectrum waterfalls, tune resonant quarter-wave ($\lambda/4$) antennas, calculate coaxial feedline losses, and export SDR receiver configs.
          </p>
        </div>

        {/* Cross-Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/rf"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            RF Link Budget Studio
          </Link>
          <Link
            to="/pinout"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            40-Pin GPIO Studio
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Resonant λ/4 Whip Length</span>
          <div className="text-2xl font-black text-neon-green font-mono">{antennaMetrics.quarterWaveMm} mm</div>
          <span className="text-xs text-gray-400 font-mono">Dipole: {antennaMetrics.halfWaveMm}mm (λ: {antennaMetrics.wavelengthM}m)</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Coaxial Cable Loss</span>
          <div className="text-2xl font-black text-cyan-400 font-mono">-{antennaMetrics.coaxLossDb} dB</div>
          <span className="text-xs text-gray-400 font-mono">RG-316 50Ω ({coaxLengthM} meters)</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Receiver Sample Rate</span>
          <div className="text-2xl font-black text-yellow-400 font-mono">{selectedSdr.sampleRateMsps} MSPS</div>
          <span className="text-xs text-gray-400 font-mono">{selectedSdr.adcBits}-bit ADC ({selectedSdr.txCapable ? "TX/RX" : "RX Only"})</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Modulation Scheme</span>
          <div className="text-2xl font-black text-purple-400 font-mono">{selectedBand.modulation.split(" ")[0]}</div>
          <span className="text-xs text-gray-400 font-mono">BW: {selectedBand.bandwidthKhz} kHz</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Animated Waterfall Spectrogram & RF Controls */}
        <div className="lg:col-span-7 bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
              Real-Time SDR Spectrogram Waterfall
            </h3>
            <span className="text-xs font-mono font-bold text-neon-green">{selectedBand.freqMhz.toFixed(3)} MHz</span>
          </div>

          {/* Canvas Waterfall */}
          <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-gray-950">
            <canvas ref={canvasRef} width={480} height={200} className="w-full h-52 block" />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 border border-gray-800 text-[10px] font-mono text-cyan-300">
              CENTER: {selectedBand.freqMhz} MHz · GAIN: {gainDb} dB
            </div>
          </div>

          {/* SDR Controls */}
          <div className="space-y-4 pt-2 border-t border-gray-800">
            {/* LNA Gain */}
            <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-300">LNA RF Gain</span>
                <span className="text-neon-green font-bold">{gainDb} dB</span>
              </div>
              <input
                type="range"
                min={0}
                max={49}
                step={1}
                value={gainDb}
                onChange={(e) => setGainDb(Number(e.target.value))}
                className="w-full accent-neon-green cursor-pointer"
              />
            </div>

            {/* Coax Feedline Length */}
            <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-300">Coaxial Feedline Cable Length</span>
                <span className="text-cyan-400 font-bold">{coaxLengthM} meters</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={10.0}
                step={0.1}
                value={coaxLengthM}
                onChange={(e) => setCoaxLengthM(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right: Frequency Presets & Config Generator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target SDR Device */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-3 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase">
              <Radio className="w-4 h-4 text-indigo-400" />
              1. SDR Hardware Receiver
            </h3>
            <select
              value={selectedSdrId}
              onChange={(e) => {
                soundFx.playClick();
                setSelectedSdrId(e.target.value);
              }}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 font-mono text-cyan-300 font-bold text-xs"
            >
              {SDR_DEVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.rangeMhz})
                </option>
              ))}
            </select>
          </div>

          {/* Frequency Bands List */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-3 shadow-2xl max-h-72 overflow-y-auto">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase">
              <Activity className="w-4 h-4 text-neon-green" />
              2. Tactical Frequency Presets ({FREQ_BANDS.length})
            </h3>
            <div className="space-y-2">
              {FREQ_BANDS.map((band) => (
                <div
                  key={band.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedBandId(band.id);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedBandId === band.id
                      ? "border-indigo-400 bg-indigo-950/40 text-white font-bold"
                      : "border-gray-800 bg-gray-950/60 text-gray-300 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-bold">{band.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-neon-green">
                      {band.freqMhz} MHz
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-normal">{band.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Config Exporter */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                SDR Receiver Config
              </h3>
              <button
                onClick={() => {
                  soundFx.playConfirm();
                  navigator.clipboard.writeText(sdrConfigExport);
                  setCopiedConfig(true);
                  setTimeout(() => setCopiedConfig(false), 2000);
                }}
                className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-mono flex items-center gap-1"
              >
                {copiedConfig ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
                {copiedConfig ? "Copied" : "Copy"}
              </button>
            </div>

            <pre className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono text-indigo-300 overflow-x-auto leading-relaxed select-all max-h-52">
              {sdrConfigExport}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
