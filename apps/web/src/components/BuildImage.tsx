import { useRef, useCallback } from "react";

interface BuildImageProps {
  title: string;
  type?: string;
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
  parts = [],
  tags = [],
  budget,
  width = 1200,
  height = 630,
}: BuildImageProps) {
  const svgRef = useRef<SVGSVGElement>(null);

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

  return (
    <div className="relative group">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace" }}
      >
        <defs>
          <linearGradient id={`bg-${h}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={bg1} />
            <stop offset="100%" stopColor={bg2} />
          </linearGradient>
          <linearGradient id={`accent-${h}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
            <stop offset="100%" stopColor={accentGlow} stopOpacity="0.6" />
          </linearGradient>
          <filter id={`glow-${h}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`glow-lg-${h}`}>
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id={`grid-${h}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Background */}
        <rect width={width} height={height} fill={`url(#bg-${h})`} />
        <rect width={width} height={height} fill={`url(#grid-${h})`} />

        {/* Circuit lines */}
        <line x1="0" y1="100" x2={width} y2="100" stroke={accent} strokeWidth="1" opacity="0.1" />
        <line x1="0" y1="530" x2={width} y2="530" stroke={accent} strokeWidth="1" opacity="0.1" />
        <line x1="100" y1="0" x2="100" y2={height} stroke={accent} strokeWidth="1" opacity="0.05" />
        <line x1={width - 100} y1="0" x2={width - 100} y2={height} stroke={accent} strokeWidth="1" opacity="0.05" />

        {/* Neon border */}
        <rect
          x="2" y="2" width={width - 4} height={height - 4}
          fill="none"
          stroke={accent}
          strokeWidth="2"
          rx="8"
          opacity="0.4"
          filter={`url(#glow-${h})`}
        />

        {/* Type chip */}
        <rect x="30" y="24" width={type.length * 11 + 24} height="32" rx="16" fill={accent} opacity="0.15" />
        <text x="42" y="46" fill={accent} fontSize="14" fontWeight="600" filter={`url(#glow-${h})`}>
          {type.toUpperCase()}
        </text>

        {/* Title */}
        <text
          x={width / 2}
          y="90"
          textAnchor="middle"
          fill="white"
          fontSize={title.length > 30 ? 36 : title.length > 20 ? 44 : 54}
          fontWeight="700"
          filter={`url(#glow-lg-${h})`}
        >
          {title.length > 40 ? title.slice(0, 38) + "…" : title}
        </text>

        {/* Category badges */}
        {uniqueCategories.slice(0, 5).map((cat, i) => {
          const cx = width / 2 - (uniqueCategories.length * 70) / 2 + i * 75;
          const color = CATEGORY_COLORS[cat] || accent;
          return (
            <g key={cat}>
              <rect x={cx} y="110" width="65" height="24" rx="12" fill={color} opacity="0.15" />
              <text x={cx + 32} y="126" textAnchor="middle" fill={color} fontSize="11" fontWeight="600">
                {cat}
              </text>
            </g>
          );
        })}

        {/* Part grid */}
        {displayParts.map((bp, i) => {
          const col = i % gridCols;
          const row = Math.floor(i / gridCols);
          const x = gridX + col * (cellW + 16);
          const y = gridY + row * (cellH + 16);
          const catColor = CATEGORY_COLORS[bp.part.category] || accent;
          return (
            <g key={bp.id ?? i}>
              <rect x={x} y={y} width={cellW} height={cellH} rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <rect x={x + 8} y={y + 8} width={cellW - 16} height={cellH - 48} rx="8" fill={catColor} opacity="0.1" />
              <text
                x={x + cellW / 2}
                y={y + (cellH - 48) / 2 + 12}
                textAnchor="middle"
                fill={catColor}
                fontSize="28"
                opacity="0.6"
              >
                {bp.part.category === "SBC" ? "💻" : bp.part.category === "DISPLAY" ? "🖥" : bp.part.category === "BATTERY" ? "🔋" : bp.part.category === "POWER" ? "⚡" : bp.part.category === "STORAGE" ? "💾" : bp.part.category === "NETWORK" ? "📡" : bp.part.category === "INPUT" ? "⌨" : "📦"}
              </text>
              <text
                x={x + cellW / 2}
                y={y + cellH - 28}
                textAnchor="middle"
                fill="rgba(255,255,255,0.8)"
                fontSize="13"
                fontWeight="500"
              >
                {bp.part.name.length > 18 ? bp.part.name.slice(0, 16) + "…" : bp.part.name}
              </text>
              <text
                x={x + cellW / 2}
                y={y + cellH - 10}
                textAnchor="middle"
                fill={catColor}
                fontSize="10"
                opacity="0.7"
              >
                {bp.part.category}
              </text>
            </g>
          );
        })}

        {/* Empty state */}
        {displayParts.length === 0 && (
          <text x={width / 2} y={height / 2 + 20} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="48">
            🔧
          </text>
        )}

        {/* Budget */}
        {budget != null && (
          <g>
            <rect x={width - 160} y="24" width="130" height="32" rx="16" fill="rgba(0,255,136,0.1)" />
            <text x={width - 95} y="46" textAnchor="middle" fill="#00ff88" fontSize="15" fontWeight="700">
              ${budget.toLocaleString()}
            </text>
          </g>
        )}

        {/* Tags */}
        {safeTags.slice(0, 4).map((tag, i) => (
          <g key={tag}>
            <rect
              x={width / 2 - (safeTags.slice(0, 4).length * 80) / 2 + i * 85}
              y={gridY + gridH + 30}
              width={tag.length * 8 + 16}
              height="24"
              rx="12"
              fill="rgba(255,255,255,0.06)"
            />
            <text
              x={width / 2 - (safeTags.slice(0, 4).length * 80) / 2 + i * 85 + tag.length * 4 + 8}
              y={gridY + gridH + 46}
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="11"
            >
              #{tag}
            </text>
          </g>
        ))}

        {/* Branding */}
        <text x={width - 20} y={height - 16} textAnchor="end" fill="rgba(255,255,255,0.15)" fontSize="12" fontWeight="600">
          DECKSMITH
        </text>
      </svg>

      {/* Export button */}
      <button
        onClick={exportPng}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/80 text-gray-300 text-xs px-3 py-1.5 rounded-lg hover:text-neon-green border border-gray-700"
      >
        Save PNG
      </button>
    </div>
  );
}
