import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  QrCode,
  Camera,
  RefreshCw,
  Zap,
  Check,
  Compass,
  Crosshair,
  Sparkles,
  ExternalLink,
  Shield,
  Search,
  Sliders,
  Activity,
  History,
  Trash2,
  HardDrive,
  Cpu,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface ScannedEntry {
  code: string;
  timestamp: string;
  resolvedSlug?: string;
}

export default function QrScannerStudio() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [manualCode, setManualCode] = useState<string>("");
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<ScannedEntry[]>(() => {
    try {
      const saved = localStorage.getItem("decksmith_scan_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const startCamera = async () => {
    soundFx.playClick();
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera hardware access is not supported in this browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      setCameraActive(false);
      setErrorMessage(err.message || "Failed to access camera. Please allow camera permissions or use manual entry below.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleResolveCode = (rawCode: string) => {
    if (!rawCode.trim()) return;
    soundFx.playConfirm();

    let slug = rawCode.trim();
    // If full URL, extract last path segment
    if (slug.includes("/builds/")) {
      const parts = slug.split("/builds/");
      slug = parts[parts.length - 1].split("?")[0].replace(/\/$/, "");
    } else if (slug.startsWith("http")) {
      const url = new URL(slug);
      const pathname = url.pathname.replace(/\/$/, "");
      const segments = pathname.split("/");
      slug = segments[segments.length - 1];
    }

    setScannedResult(slug);

    const newEntry: ScannedEntry = {
      code: rawCode,
      timestamp: new Date().toLocaleTimeString(),
      resolvedSlug: slug,
    };

    setRecentScans((prev) => {
      const updated = [newEntry, ...prev.filter((p) => p.code !== rawCode)].slice(0, 10);
      try {
        localStorage.setItem("decksmith_scan_history", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearHistory = () => {
    soundFx.playClick();
    setRecentScans([]);
    try {
      localStorage.removeItem("decksmith_scan_history");
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-neon-green border border-neon-green/30">
              Field Scanner & Badge Reader
            </span>
            <span className="text-xs font-mono text-cyan-400">WebRTC · Physical QR Badges · Dossier Loader</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <QrCode className="w-7 h-7 text-neon-green" />
            Field QR Badge & Cyberdeck Scanner
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Scan physical cyberdeck QR badges or field spec cards with your camera to instantly load full 10-slot BOM manifests and 3D CAD models.
          </p>
        </div>

        {/* Cross-Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/builds"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-neon-green" />
            Explore Builds
          </Link>
          <Link
            to="/builder"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Blueprint Studio
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Live Camera Viewport / Scanning HUD */}
        <div className="lg:col-span-7 bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${cameraActive ? "bg-neon-green animate-ping" : "bg-gray-600"}`} />
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                {cameraActive ? "Live Optical Sensor Feed" : "Optical Scanner Standby"}
              </h3>
            </div>
            {cameraActive && (
              <button
                onClick={() => {
                  stopCamera();
                  setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
                  setTimeout(startCamera, 200);
                }}
                className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-mono flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3 text-cyan-400" />
                Flip Camera
              </button>
            )}
          </div>

          {/* Camera Frame / Reticle */}
          <div className="relative aspect-video max-h-80 w-full bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden flex items-center justify-center">
            {cameraActive ? (
              <>
                <video ref={videoRef} className="w-full h-full object-cover" />
                {/* Cyberpunk Overlay Reticle */}
                <div className="absolute inset-8 border-2 border-neon-green/40 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-neon-green" />
                    <span className="w-4 h-4 border-t-2 border-r-2 border-neon-green" />
                  </div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-neon-green to-transparent animate-pulse" />
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-neon-green" />
                    <span className="w-4 h-4 border-b-2 border-r-2 border-neon-green" />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center">
                  <Camera className="w-7 h-7 text-gray-500" />
                </div>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Activate camera scanner to scan physical QR badges printed from Decksmith.
                </p>
                <button
                  onClick={startCamera}
                  className="px-5 py-2.5 rounded-xl bg-neon-green hover:bg-emerald-400 text-gray-950 text-xs font-black transition-all shadow-lg shadow-neon-green/20 inline-flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Activate Optical Scanner
                </button>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl text-xs text-rose-300 font-mono">
              {errorMessage}
            </div>
          )}

          {/* Manual Entry Form */}
          <div className="space-y-2 pt-2 border-t border-gray-800">
            <label className="block text-xs font-mono text-gray-400">Manual Badge Slug or QR Payload Entry</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. shadow-netrunner-mk-iv or paste URL..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResolveCode(manualCode)}
                className="flex-1 px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-neon-green font-mono"
              />
              <button
                onClick={() => handleResolveCode(manualCode)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 text-xs font-bold font-mono transition-colors"
              >
                Resolve
              </button>
            </div>
          </div>
        </div>

        {/* Right: Resolved Target Preview & History */}
        <div className="lg:col-span-5 space-y-6">
          {/* Resolved Target Card */}
          {scannedResult && (
            <div className="bg-emerald-950/40 border border-neon-green rounded-2xl p-6 space-y-4 shadow-2xl animate-fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-neon-green" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  Target Cyberdeck Identified
                </h3>
              </div>

              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1">
                <span className="text-[10px] text-gray-400 font-mono block uppercase">Blueprint Identifier</span>
                <span className="text-sm font-bold text-cyan-300 font-mono break-all">{scannedResult}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to={`/builds/${scannedResult}`}
                  className="px-3 py-2 rounded-xl bg-neon-green hover:bg-emerald-400 text-gray-950 text-xs font-black text-center transition-all shadow-md"
                >
                  View Spec Badge
                </Link>
                <Link
                  to={`/builder?fork=${scannedResult}`}
                  className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold text-center border border-gray-700 transition-colors"
                >
                  Fork in Studio
                </Link>
              </div>
            </div>
          )}

          {/* Scan History */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                Recent Field Scans ({recentScans.length})
              </h3>
              {recentScans.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-400 hover:text-rose-400 font-mono flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {recentScans.length === 0 ? (
              <p className="text-xs text-gray-500 font-mono py-4 text-center">
                No recent badges scanned yet.
              </p>
            ) : (
              <div className="space-y-2">
                {recentScans.map((scan, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-950 rounded-xl border border-gray-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="text-white font-bold truncate">{scan.resolvedSlug || scan.code}</div>
                      <div className="text-[10px] text-gray-500">{scan.timestamp}</div>
                    </div>
                    {scan.resolvedSlug && (
                      <Link
                        to={`/builds/${scan.resolvedSlug}`}
                        className="px-2 py-1 rounded bg-gray-900 border border-gray-700 text-neon-green text-[10px] font-bold hover:border-neon-green"
                      >
                        Open
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
