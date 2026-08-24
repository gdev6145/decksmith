import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  Radio,
  Clock,
  Crosshair,
  Sliders,
  Sparkles,
  Download,
  Copy,
  Check,
  FileCode,
  Shield,
  Zap,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  Globe,
  Navigation,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface Satellite {
  id: string;
  constellation: "gps" | "galileo" | "glonass" | "beidou";
  prn: number;
  elevationDeg: number;
  azimuthDeg: number;
  snrDbHz: number;
  locked: boolean;
}

const INITIAL_SATELLITES: Satellite[] = [
  { id: "G03", constellation: "gps", prn: 3, elevationDeg: 68, azimuthDeg: 142, snrDbHz: 44, locked: true },
  { id: "G08", constellation: "gps", prn: 8, elevationDeg: 52, azimuthDeg: 285, snrDbHz: 42, locked: true },
  { id: "G14", constellation: "gps", prn: 14, elevationDeg: 78, azimuthDeg: 45, snrDbHz: 48, locked: true },
  { id: "G22", constellation: "gps", prn: 22, elevationDeg: 34, azimuthDeg: 198, snrDbHz: 37, locked: true },
  { id: "E05", constellation: "galileo", prn: 5, elevationDeg: 62, azimuthDeg: 310, snrDbHz: 45, locked: true },
  { id: "E19", constellation: "galileo", prn: 19, elevationDeg: 41, azimuthDeg: 95, snrDbHz: 39, locked: true },
  { id: "R07", constellation: "glonass", prn: 7, elevationDeg: 55, azimuthDeg: 15, snrDbHz: 41, locked: true },
  { id: "R12", constellation: "glonass", prn: 12, elevationDeg: 28, azimuthDeg: 235, snrDbHz: 34, locked: false },
  { id: "B02", constellation: "beidou", prn: 2, elevationDeg: 49, azimuthDeg: 170, snrDbHz: 40, locked: true },
  { id: "B11", constellation: "beidou", prn: 11, elevationDeg: 38, azimuthDeg: 340, snrDbHz: 36, locked: true },
];

interface GpsDevice {
  id: string;
  name: string;
  channels: number;
  updateRateHz: number;
  sensitivityDbm: number;
  features: string;
}

const GPS_DEVICES: GpsDevice[] = [
  { id: "neo-m9n", name: "u-blox NEO-M9N Multi-GNSS", channels: 92, updateRateHz: 25, sensitivityDbm: -167, features: "Concurrent GPS/Galileo/GLONASS/BeiDou, Active Antenna Detect" },
  { id: "zed-f9p", name: "u-blox ZED-F9P RTK High-Precision", channels: 184, updateRateHz: 20, sensitivityDbm: -167, features: "Centimeter-level RTK (0.01m), Dual-Frequency L1/L2" },
  { id: "mtk3339", name: "Adafruit Ultimate GPS (MTK3339)", channels: 66, updateRateHz: 10, sensitivityDbm: -165, features: "Ultra-low power, 1PPS precision sync, built-in datalogging" },
  { id: "lc29h", name: "Quectel LC29H Dual-Band RTK", channels: 135, updateRateHz: 10, sensitivityDbm: -166, features: "Dual-band L1+L5 with integrated Dead Reckoning IMU" },
];

export default function GpsTrackerStudio() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("neo-m9n");
  const [satellites, setSatellites] = useState<Satellite[]>(INITIAL_SATELLITES);
  const [fixType, setFixType] = useState<"3D_DGPS" | "RTK_FIXED" | "STANDALONE">("3D_DGPS");
  const [copiedChrony, setCopiedChrony] = useState<boolean>(false);

  const selectedDevice = GPS_DEVICES.find((d) => d.id === selectedDeviceId) || GPS_DEVICES[0];

  const lockedCount = satellites.filter((s) => s.locked).length;

  // Real-Time Radar Skyplot Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let sweepAngle = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(cx, cy) - 15;

      ctx.clearRect(0, 0, w, h);

      // Radar Background Rings
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 1.5;

      // 0°, 30°, 60° Elevation rings
      [1.0, 0.66, 0.33].forEach((scale) => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius * scale, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Crosshairs (N-S, E-W)
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.stroke();

      // Cardinal Labels
      ctx.fillStyle = "#00ff66";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText("N (0°)", cx, cy - radius + 12);
      ctx.fillText("S (180°)", cx, cy + radius - 4);
      ctx.fillText("E (90°)", cx + radius - 18, cy + 3);
      ctx.fillText("W (270°)", cx - radius + 18, cy + 3);

      // Radar Sweep Line
      sweepAngle += 0.02;
      ctx.strokeStyle = "rgba(0, 255, 102, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * radius, cy + Math.sin(sweepAngle) * radius);
      ctx.stroke();

      // Plot Satellites
      satellites.forEach((sat) => {
        // Polar to Cartesian
        const distFromCenter = ((90 - sat.elevationDeg) / 90) * radius;
        const rad = (sat.azimuthDeg - 90) * (Math.PI / 180);
        const sx = cx + Math.cos(rad) * distFromCenter;
        const sy = cy + Math.sin(rad) * distFromCenter;

        // Color by Constellation
        let col = "#06b6d4"; // GPS (Cyan)
        if (sat.constellation === "galileo") col = "#00ff66"; // Galileo (Green)
        if (sat.constellation === "glonass") col = "#eab308"; // GLONASS (Yellow)
        if (sat.constellation === "beidou") col = "#a855f7"; // BeiDou (Purple)

        // Circle node
        ctx.fillStyle = sat.locked ? col : "#4b5563";
        ctx.beginPath();
        ctx.arc(sx, sy, sat.locked ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px monospace";
        ctx.fillText(sat.id, sx + 9, sy + 3);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [satellites]);

  // NMEA-0183 Raw Sentence Output
  const nmeaSentences = useMemo(() => {
    return `$GPGGA,123519.00,3746.2941,N,12225.1022,W,${fixType === "RTK_FIXED" ? "4" : "2"},${lockedCount},0.85,34.2,M,-28.4,M,,*47
$GPRMC,123519.00,A,3746.2941,N,12225.1022,W,0.024,184.2,230826,,,D*76
$GPGSV,3,1,${satellites.length},${satellites.slice(0, 4).map((s) => `${s.prn},${s.elevationDeg},${s.azimuthDeg},${s.snrDbHz}`).join(",")}*79
`;
  }, [satellites, fixType, lockedCount]);

  // Chrony Stratum-1 NTP Config
  const chronyConfig = useMemo(() => {
    return `# /etc/chrony/chrony.conf
# Decksmith Stratum-1 Precision GPS + PPS Timekeeping
refclock PPS /dev/pps0 refid PPS precision 1e-7 poll 0 lock NMEA prefer
refclock SHM 0 refid NMEA precision 1e-1 offset 0.125 delay 0.2 poll 0

# Hardware Clock Sync
rtconutc
makestep 1.0 3
maxupdateskew 100.0
`;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-neon-green border border-neon-green/30">
              Tactical GNSS & Precision Timekeeping
            </span>
            <span className="text-xs font-mono text-cyan-400">NMEA-0183 · Polar Skyplot · Stratum-1 PPS NTP</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Compass className="w-7 h-7 text-neon-green" />
            Tactical GPS NMEA & Satellite Constellation HUD
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Track multi-constellation satellite skyplots (GPS, Galileo, GLONASS, BeiDou), decode live NMEA-0183 telemetry, and configure Stratum-1 NTP atomic clocks.
          </p>
        </div>

        {/* Cross-Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/sdr"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
            SDR Spectrum Studio
          </Link>
          <Link
            to="/companion"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Field HUD
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">GNSS Fix Quality</span>
          <div className="text-2xl font-black text-neon-green font-mono">
            {fixType === "RTK_FIXED" ? "RTK Fixed (1cm)" : "3D DGPS (1.2m)"}
          </div>
          <span className="text-xs text-gray-400 font-mono">HDOP: 0.85 · VDOP: 1.10</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Satellites Locked / In View</span>
          <div className="text-2xl font-black text-cyan-400 font-mono">{lockedCount} / {satellites.length} SVs</div>
          <span className="text-xs text-gray-400 font-mono">GPS · Galileo · GLONASS · BeiDou</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Altitude (ASL)</span>
          <div className="text-2xl font-black text-yellow-400 font-mono">34.2 Meters</div>
          <span className="text-xs text-gray-400 font-mono">Geoid Sep: -28.4m</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">1PPS Stratum-1 Sync</span>
          <div className="text-2xl font-black text-purple-400 font-mono">±15 ns Jitter</div>
          <span className="text-xs text-gray-400 font-mono">Hardware PPS Pin Active</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Polar Skyplot Radar */}
        <div className="lg:col-span-7 bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-green animate-pulse" />
              Polar Skyplot Constellation Radar
            </h3>

            {/* Constellation Legend */}
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-cyan-400"><span className="w-2 h-2 rounded-full bg-cyan-400" /> GPS</span>
              <span className="flex items-center gap-1 text-neon-green"><span className="w-2 h-2 rounded-full bg-neon-green" /> GAL</span>
              <span className="flex items-center gap-1 text-yellow-400"><span className="w-2 h-2 rounded-full bg-yellow-400" /> GLO</span>
              <span className="flex items-center gap-1 text-purple-400"><span className="w-2 h-2 rounded-full bg-purple-400" /> BDS</span>
            </div>
          </div>

          {/* Canvas Radar */}
          <div className="flex justify-center p-2 bg-gray-950 rounded-xl border border-gray-800">
            <canvas ref={canvasRef} width={340} height={340} className="w-80 h-80 block" />
          </div>

          {/* NMEA-0183 Live Feed */}
          <div className="space-y-2 pt-2 border-t border-gray-800">
            <h4 className="text-xs font-mono font-bold text-gray-300 uppercase">NMEA-0183 Raw Telemetry Feed</h4>
            <pre className="p-3 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed select-all">
              {nmeaSentences}
            </pre>
          </div>
        </div>

        {/* Right: GPS Hardware & Chrony NTP Config */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target GPS Receiver Module */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-3 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase">
              <Compass className="w-4 h-4 text-neon-green" />
              1. GNSS Receiver Hardware
            </h3>
            <select
              value={selectedDeviceId}
              onChange={(e) => {
                soundFx.playClick();
                setSelectedDeviceId(e.target.value);
              }}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 font-mono text-cyan-300 font-bold text-xs"
            >
              {GPS_DEVICES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-400 font-mono pt-1">{selectedDevice.features}</p>
          </div>

          {/* Fix Simulation Switch */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-3 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              2. Positioning Accuracy Mode
            </h3>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              {[
                { id: "3D_DGPS", label: "3D DGPS" },
                { id: "RTK_FIXED", label: "RTK Fixed" },
                { id: "STANDALONE", label: "Standalone" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    soundFx.playClick();
                    setFixType(f.id as any);
                  }}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    fixType === f.id
                      ? "border-neon-green bg-emerald-950/50 text-white font-bold"
                      : "border-gray-800 bg-gray-950 text-gray-400 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stratum-1 Chrony Config */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Stratum-1 chrony.conf
              </h3>
              <button
                onClick={() => {
                  soundFx.playConfirm();
                  navigator.clipboard.writeText(chronyConfig);
                  setCopiedChrony(true);
                  setTimeout(() => setCopiedChrony(false), 2000);
                }}
                className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-mono flex items-center gap-1"
              >
                {copiedChrony ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
                {copiedChrony ? "Copied" : "Copy"}
              </button>
            </div>

            <pre className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono text-neon-green overflow-x-auto leading-relaxed select-all max-h-52">
              {chronyConfig}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
