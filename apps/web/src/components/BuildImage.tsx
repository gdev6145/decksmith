import { useState, useRef, useCallback } from "react";
import { Sparkles, Layers, Image as ImageIcon } from "lucide-react";

interface BuildImageProps {
  title: string;
  type?: string;
  slug?: string;
  image?: string;
  parts?: Array<{ id?: string; part: { name: string; category: string } }>;
  tags?: string[];
  budget?: number | null;
  width?: number;
  height?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  SBC: "#00ff88",
  DISPLAY: "#00bfff",
  BATTERY: "#ffaa00",
  POWER: "#ff6b6b",
  STORAGE: "#c084fc",
  NETWORK: "#38bdf8",
  INPUT: "#f472b6",
  AUDIO: "#fbbf24",
  MCU: "#a78bfa",
  SENSOR: "#34d399",
  COOLING: "#67e8f9",
};

const TYPE_GRADIENTS: Record<string, [string, string]> = {
  Cyberdeck: ["#0a0a1a", "#0f1a2e"],
  Androdeck: ["#0a1a0a", "#1a0f2e"],
  NAS: ["#1a0a0a", "#2e1a0f"],
  "Portable NAS": ["#1a0a0a", "#2e1a0f"],
  "Streaming Platform": ["#1a0f2e", "#2e0a2e"],
  Streaming: ["#1a0f2e", "#2e0a2e"],
  "Custom Tablet": ["#0f1a1a", "#0a2e2e"],
  Wearable: ["#1a1a0a", "#2e2e0a"],
};

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function hslStr(h: number, s: number, l: number): string {
  return `hsl(${h % 360}, ${s}%, ${l}%)`;
}

export default function BuildImage({
  title,
  type = "Cyberdeck",
  slug,
  image,
  parts = [],
  tags = [],
  budget,
  width = 1200,
  height = 630,
}: BuildImageProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [imgError, setImgError] = useState(false);
  const [viewMode, setViewMode] = useState<"photo" | "schematic">("photo");

  // Determine prospective image url based on direct image or slug
  const photoUrl = image || (slug ? `/builds/${slug}.jpg` : null);

  const h = hashStr(title);
  const [bg1, bg2] = TYPE_GRADIENTS[type] ?? TYPE_GRADIENTS.Cyberdeck;
  const accentHue = h % 360;
  const accent = `hsl(${accentHue}, 100%, 60%)`;
  const accentGlow = `hsl(${accentHue}, 100%, 50%)`;

  const safeParts = Array.isArray(parts) ? parts : [];
  const safeTags = Array.isArray(tags) ? tags : [];

  const uniqueCategories = [...new Set(safeParts.map((p) => p.part?.category).filter(Boolean))];
  const displayParts = safeParts.slice(0, 6);

  const gridCols = displayParts.length <= 2 ? displayParts.length : displayParts.length <= 4 ? 2 : 3;
  const gridRows = displayParts.length <= 2 ? 1 : displayParts.length <= 4 ? 2 : 2;

  const cellW = 160;
  const cellH = 160;
  const gridW = gridCols * (cellW + 16) - 16;
  const gridH = gridRows * (cellH + 16) - 16;
  const gridX = (width - gridW) / 2;
  const gridY = 180;

  const exportPng = useCallback(async () => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(pngBlob);
        a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [title, width, height]);

  // If photo is available and no load error and user is on photo view:
  if (photoUrl && !imgError && viewMode === "photo") {
    return (
      <div className="relative w-full h-full overflow-hidden group/img bg-gray-950">
        <img
          src={photoUrl}
          alt={title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
        />

        {/* Tactical Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20 to-transparent pointer-events-none" />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-gray-950/80 backdrop-blur-md text-neon-green border border-neon-green/30 shadow-lg">
            {type}
          </span>
        </div>

        {/* View Mode Switcher Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setViewMode("schematic");
          }}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-950/80 hover:bg-gray-900 border border-gray-800 text-gray-300 hover:text-white backdrop-blur-md opacity-0 group-hover/img:opacity-100 transition-opacity z-10 text-[10px] font-mono flex items-center gap-1"
          title="Switch to Vector Schematic"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Schematic</span>
        </button>

        {/* Footer Hardware Info Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10 pointer-events-none">
          <div className="min-w-0 pr-2">
            <h4 className="text-xs font-mono font-black text-white truncate drop-shadow-md">{title}</h4>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-gray-300">
              <span className="text-cyan-300 font-bold">{safeParts.length} Verified Components</span>
              {budget && <span>• ${budget} Budget</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vector Schematic SVG View
  return (
    <div className="relative group w-full h-full bg-gray-950">
      {photoUrl && !imgError && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setViewMode("photo");
          }}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-950/80 hover:bg-gray-900 border border-gray-800 text-gray-300 hover:text-white backdrop-blur-md z-20 text-[10px] font-mono flex items-center gap-1"
          title="Switch to Hardware Photo"
        >
          <ImageIcon className="w-3.5 h-3.5 text-neon-green" />
          <span>Photo</span>
        </button>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace" }}
      >
        <defs>
          <linearGradient id={`bg-${h}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={bg1} />
            <stop offset="100%" stopColor={bg2} />
          </linearGradient>
          <pattern id={`grid-${h}`} width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>
          <filter id={`glow-${h}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width={width} height={height} fill={`url(#bg-${h})`} />
        <rect width={width} height={height} fill={`url(#grid-${h})`} />

        {/* Accent Lines */}
        <line x1="0" y1="0" x2={width} y2="0" stroke={accent} strokeWidth="3" opacity="0.8" />
        <line x1="0" y1={height} x2={width} y2={height} stroke={accent} strokeWidth="2" opacity="0.4" />

        {/* Corner Brackets */}
        <path d={`M 20 50 L 20 20 L 50 20`} fill="none" stroke={accent} strokeWidth="2" opacity="0.6" />
        <path d={`M ${width - 50} 20 L ${width - 20} 20 L ${width - 20} 50`} fill="none" stroke={accent} strokeWidth="2" opacity="0.6" />
        <path d={`M 20 ${height - 50} L 20 ${height - 20} L 50 ${height - 20}`} fill="none" stroke={accent} strokeWidth="2" opacity="0.6" />
        <path d={`M ${width - 50} ${height - 20} L ${width - 20} ${height - 20} L ${width - 20} ${height - 50}`} fill="none" stroke={accent} strokeWidth="2" opacity="0.6" />

        {/* Title */}
        <text x="60" y="80" fill="#ffffff" fontSize="32" fontWeight="bold" letterSpacing="1">
          {title.length > 32 ? title.slice(0, 32) + "..." : title}
        </text>

        {/* Type Badge */}
        <rect x="60" y="100" width={type.length * 10 + 20} height="26" rx="4" fill="rgba(255,255,255,0.06)" stroke={accent} strokeWidth="1" />
        <text x="70" y="118" fill={accent} fontSize="12" fontWeight="bold" letterSpacing="2">
          {type.toUpperCase()}
        </text>

        {/* Parts Count / Budget */}
        <text x={70 + type.length * 10 + 30} y="118" fill="#888888" fontSize="12">
          {safeParts.length} PARTS {budget ? `· $${budget} BUDGET` : ""}
        </text>

        {/* Parts Grid */}
        {displayParts.map((bp, i) => {
          const col = i % gridCols;
          const row = Math.floor(i / gridCols);
          const cx = gridX + col * (cellW + 16);
          const cy = gridY + row * (cellH + 16);
          const cat = bp.part?.category ?? "OTHER";
          const catColor = CATEGORY_COLORS[cat] ?? "#888888";
          const partName = bp.part?.name ?? "Component";

          return (
            <g key={i}>
              <rect x={cx} y={cy} width={cellW} height={cellH} rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <rect x={cx} y={cy} width={cellW} height="4" rx="2" fill={catColor} opacity="0.8" />
              <text x={cx + 12} y={cy + 26} fill={catColor} fontSize="9" fontWeight="bold" letterSpacing="1">
                {cat}
              </text>
              <text x={cx + 12} y={cy + 60} fill="#e0e0e0" fontSize="11" fontWeight="bold">
                {partName.slice(0, 16)}
              </text>
              {partName.length > 16 && (
                <text x={cx + 12} y={cy + 76} fill="#e0e0e0" fontSize="11" fontWeight="bold">
                  {partName.slice(16, 32)}
                </text>
              )}
            </g>
          );
        })}

        {/* Watermark */}
        <text x={width - 60} y={height - 30} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize="11" letterSpacing="2">
          DECKSMIITH // HARDWARE ARCHITECT
        </text>
      </svg>
    </div>
  );
}
