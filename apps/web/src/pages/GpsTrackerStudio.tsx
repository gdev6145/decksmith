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
  MapPin,
  RefreshCw,
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
  { id: "B02", constellation: "beidou", prn: 2, elevationDeg: 49, azimuthDeg: 170, snrDbHz: 40, locked: true },
];

export default function GpsTrackerStudio() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [satellites, setSatellites] = useState<Satellite[]>(INITIAL_SATELLITES);
  const [lat, setLat] = useState<number>(37.7749);
  const [lon, setLon] = useState<number>(-122.4194);
  const [altitudeM, setAltitudeM] = useState<number>(18.5);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [hdop, setHdop] = useState<number>(0.85);

  const lockedCount = satellites.filter((s) => s.locked).length;

  // Maidenhead Grid Square calculation
  const maidenheadGrid = useMemo(() => {
    let adjLon = lon + 180;
    let adjLat = lat + 90;

    const f1 = String.fromCharCode(65 + Math.floor(adjLon / 20));
    const f2 = String.fromCharCode(65 + Math.floor(adjLat / 10));

    adjLon %= 20;
    adjLat %= 10;

    const s1 = Math.floor(adjLon / 2);
    const s2 = Math.floor(adjLat / 1);

    adjLon = (adjLon % 2) * 12;
    adjLat = (adjLat % 1) * 24;

    const ss1 = String.fromCharCode(97 + Math.floor(adjLon));
    const ss2 = String.fromCharCode(97 + Math.floor(adjLat));

    return `${f1}${f2}${s1}${s2}${ss1}${ss2}`;
  }, [lat, lon]);

  // Sync real hardware browser GPS
  const handleSyncBrowserGps = () => {
    soundFx.playConfirm();
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your workstation browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setLat(Number(pos.coords.latitude.toFixed(5)));
        setLon(Number(pos.coords.longitude.toFixed(5)));
        if (pos.coords.altitude) setAltitudeM(Number(pos.coords.altitude.toFixed(1)));
        soundFx.playConfirm();
      },
      (err) => {
        setIsLocating(false);
        alert(`Geolocation error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Skyplot Radar Canvas
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
      const radius = Math.min(cx, cy) - 20;

      ctx.clearRect(0, 0, w, h);

      // Radar rings
      ctx.strokeStyle = "#1e2638";
      ctx.lineWidth = 1.5;
      [1.0, 0.66, 0.33].forEach((scale) => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius * scale, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // Radar Sweep
      sweepAngle += 0.03;
      const grad = ctx.createConicGradient(sweepAngle, cx, cy);
      grad.addColorStop(0, "rgba(0, 255, 102, 0.15)");
      grad.addColorStop(0.1, "rgba(0, 255, 102, 0.0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw Satellites
      satellites.forEach((sat) => {
        const r = radius * (1 - sat.elevationDeg / 90);
        const rad = ((sat.azimuthDeg - 90) * Math.PI) / 180;
        const x = cx + r * Math.cos(rad);
        const y = cy + r * Math.sin(rad);

        ctx.fillStyle = sat.locked ? "#00ff66" : "#64748b";
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px monospace";
        ctx.fillText(sat.id, x + 6, y + 3);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [satellites]);

  const handleExportNmea = () => {
    soundFx.playConfirm();
    let nmea = `$GNGGA,123519,${Math.abs(lat).toFixed(4)},${lat >= 0 ? "N" : "S"},${Math.abs(lon).toFixed(4)},${lon >= 0 ? "E" : "W"},1,${lockedCount},${hdop},${altitudeM},M,0.0,M,,*47\n`;
    nmea += `$GNRMC,123519,A,${Math.abs(lat).toFixed(4)},${lat >= 0 ? "N" : "S"},${Math.abs(lon).toFixed(4)},${lon >= 0 ? "E" : "W"},0.05,309.62,120524,,,A*75\n`;

    const blob = new Blob([nmea], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decksmith-gnss-capture.nmea`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-mono space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 mb-2">
            <Globe className="w-3.5 h-3.5" />
            GNSS Multi-Constellation & Precision Clock Studio
          </div>
          <h1 className="text-3xl font-black text-white">GPS & Satellite Tracking Studio</h1>
          <p className="text-xs text-gray-400 mt-1">
            Track multi-constellation skyplots, sync real station geolocation, and export NMEA 0183 telemetry streams
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSyncBrowserGps}
            disabled={isLocating}
            className="px-4 py-2.5 bg-cyan-400 text-black font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-400/20 hover:bg-cyan-300 transition-all"
          >
            <MapPin className={`w-4 h-4 ${isLocating ? "animate-spin" : ""}`} />
            <span>{isLocating ? "Locating..." : "Sync Station GPS"}</span>
          </button>

          <button
            onClick={handleExportNmea}
            className="px-4 py-2.5 bg-neon-green text-black font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-neon-green/20"
          >
            <Download className="w-4 h-4" />
            Export NMEA (.nmea)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Station Coordinates</span>
          <div className="text-xl font-black text-white">{lat}° N, {lon}° W</div>
          <span className="text-[11px] text-gray-500">Alt: {altitudeM}m MSL</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Maidenhead Grid</span>
          <div className="text-2xl font-black text-cyan-400">{maidenheadGrid}</div>
          <span className="text-[11px] text-gray-500">Ham Radio QTH Locator</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Satellites Locked</span>
          <div className="text-2xl font-black text-neon-green">{lockedCount} / {satellites.length}</div>
          <span className="text-[11px] text-gray-500">GPS, Galileo, GLONASS, BeiDou</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Precision HDOP</span>
          <div className="text-2xl font-black text-purple-400">{hdop}</div>
          <span className="text-[11px] text-gray-500">Ideal Geometry (3D Fix)</span>
        </div>
      </div>

      {/* Main Grid: Skyplot Radar (6 Cols) + Satellites Table (6 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Skyplot */}
        <div className="lg:col-span-6 bg-gray-900/90 border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col items-center">
          <h2 className="text-xs font-bold text-white uppercase flex items-center gap-2 self-start border-b border-gray-800 pb-2.5 w-full">
            <Crosshair className="w-4 h-4 text-neon-green" />
            Polar Constellation Skyplot Radar
          </h2>

          <div className="w-[300px] h-[300px] bg-gray-950 rounded-full border border-gray-800 relative overflow-hidden flex items-center justify-center">
            <canvas ref={canvasRef} width={300} height={300} className="w-full h-full" />
          </div>
        </div>

        {/* Satellites Table */}
        <div className="lg:col-span-6 bg-gray-900/90 border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-xs font-bold text-white uppercase flex items-center gap-2 border-b border-gray-800 pb-2.5">
            <Radio className="w-4 h-4 text-cyan-400" />
            Active Satellite Signals ({satellites.length})
          </h2>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {satellites.map((sat) => (
              <div key={sat.id} className="p-2.5 bg-gray-950 rounded-2xl border border-gray-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${sat.locked ? "bg-neon-green shadow-sm shadow-neon-green" : "bg-gray-600"}`} />
                  <span className="font-bold text-white">{sat.id}</span>
                  <span className="text-[10px] text-gray-500 uppercase">({sat.constellation})</span>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <span className="text-gray-400">El: {sat.elevationDeg}°</span>
                  <span className="text-gray-400">Az: {sat.azimuthDeg}°</span>
                  <span className="text-cyan-400 font-bold">{sat.snrDbHz} dB-Hz</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
