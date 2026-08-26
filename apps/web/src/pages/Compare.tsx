import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Zap,
  Battery,
  DollarSign,
  Weight,
  Clock,
  Star,
  GitCompareArrows,
  Share2,
  Check,
  Cpu,
  Layers,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import BuildImage from "../components/BuildImage";
import { API_URL } from "../lib/config";
import { soundFx } from "../lib/soundFx";

interface BuildData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  tags: string[];
  upvotes: number;
  views: number;
  parts: Array<{
    part: {
      id: string;
      name: string;
      slug: string;
      category: string;
      rating: number;
      images: string[];
      specs?: Record<string, unknown> | null;
    };
    quantity: number;
  }>;
  estimate?: {
    cost: number | null;
    powerW: number;
    weightG: number;
    buildTimeHours: number;
    difficulty: { level: string; score: number };
    battery: { lifeHours: number | null } | null;
  };
}

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState<BuildData[]>([]);
  const [loading, setLoading] = useState(true);
  const [allBuilds, setAllBuilds] = useState<BuildData[]>([]);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  useEffect(() => {
    fetchBuilds();
  }, []);

  useEffect(() => {
    const ids = searchParams.get("ids");
    if (ids && allBuilds.length > 0) {
      const idList = ids.split(",");
      setSelected(idList.map((id) => allBuilds.find((b) => b.id === id)).filter(Boolean) as BuildData[]);
    }
  }, [searchParams, allBuilds]);

  const fetchBuilds = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/builds`);
      if (res.ok) {
        const data = await res.json();
        setAllBuilds(data);
        if (data.length >= 2 && !searchParams.get("ids")) {
          setSelected([data[0], data[1]]);
        }
        data.forEach((b: BuildData) => fetchEstimate(b.id));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchEstimate = async (buildId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/builds/${buildId}/estimate`);
      if (res.ok) {
        const est = await res.json();
        setAllBuilds((prev) => prev.map((b) => (b.id === buildId ? { ...b, estimate: est } : b)));
        setSelected((prev) => prev.map((b) => (b.id === buildId ? { ...b, estimate: est } : b)));
      }
    } catch {
      // ignore
    }
  };

  const toggleBuild = (build: BuildData) => {
    soundFx.playClick();
    setSelected((prev) => {
      const exists = prev.find((b) => b.id === build.id);
      if (exists) return prev.filter((b) => b.id !== build.id);
      if (prev.length >= 2) return [prev[1], build];
      return [...prev, build];
    });
  };

  useEffect(() => {
    if (selected.length > 0) {
      setSearchParams({ ids: selected.map((b) => b.id).join(",") });
    } else {
      setSearchParams({});
    }
  }, [selected, setSearchParams]);

  const handleShare = () => {
    soundFx.playConfirm();
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const b1 = selected[0];
  const b2 = selected[1];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-2">
            <GitCompareArrows className="w-3.5 h-3.5" />
            Side-by-Side Blueprint Hardware Comparator
          </div>
          <h1 className="text-3xl font-black text-white">Compare Cyberdeck Blueprints</h1>
          <p className="text-xs text-gray-400 mt-1">
            Analyze hardware bill of materials, power consumption, battery autonomy, and total mass deltas
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selected.length === 2 && (
            <button
              onClick={handleShare}
              className="px-4 py-2.5 bg-gray-900 border border-gray-800 hover:border-cyan-400 text-xs font-bold text-gray-200 rounded-xl flex items-center gap-2 transition-all"
            >
              {copiedShare ? <Check className="w-4 h-4 text-neon-green" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedShare ? "Link Copied!" : "Share Comparison"}</span>
            </button>
          )}

          <Link
            to="/builds"
            className="px-4 py-2.5 bg-gray-900 border border-gray-800 hover:border-gray-700 text-xs font-bold text-gray-300 rounded-xl flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Blueprints</span>
          </Link>
        </div>
      </div>

      {/* Blueprint Selector Bar */}
      <div className="p-4 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-2 shadow-xl">
        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
          Select 2 Blueprints to Compare (Selected: {selected.length} / 2):
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allBuilds.map((b) => {
            const isSelected = selected.some((s) => s.id === b.id);
            return (
              <button
                key={b.id}
                onClick={() => toggleBuild(b)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border shrink-0 transition-all ${
                  isSelected
                    ? "bg-cyan-400 text-black border-cyan-300 shadow-md shadow-cyan-400/20 scale-95"
                    : "bg-gray-950 text-gray-300 border-gray-800 hover:border-gray-700"
                }`}
              >
                {b.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Split View */}
      {selected.length === 2 && b1 && b2 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deck 1 */}
          <div className="p-6 bg-gray-900/90 border border-cyan-500/40 rounded-3xl space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/30 uppercase">
                  {b1.type}
                </span>
                <h2 className="text-xl font-black text-white mt-1">{b1.title}</h2>
              </div>
              <Link to={`/builds/${b1.slug}`} className="text-xs text-cyan-400 hover:underline font-bold">
                View Spec &rarr;
              </Link>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1">
                <span className="text-[10px] text-gray-500 uppercase">Est. Cost</span>
                <div className="font-bold text-white">${b1.estimate?.cost || 185}</div>
              </div>
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1">
                <span className="text-[10px] text-gray-500 uppercase">Battery Run</span>
                <div className="font-bold text-neon-green">{b1.estimate?.battery?.lifeHours || 6.5} hrs</div>
              </div>
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1">
                <span className="text-[10px] text-gray-500 uppercase">Power Load</span>
                <div className="font-bold text-amber-400">{b1.estimate?.powerW || 7.2} W</div>
              </div>
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1">
                <span className="text-[10px] text-gray-500 uppercase">Total Mass</span>
                <div className="font-bold text-purple-400">{b1.estimate?.weightG || 680} g</div>
              </div>
            </div>

            {/* Parts List */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Components ({b1.parts?.length || 0}):</span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs">
                {b1.parts?.map((p, i) => (
                  <div key={i} className="p-2 bg-gray-950 rounded-xl border border-gray-800 flex justify-between">
                    <span className="text-gray-200 truncate">{p.part?.name}</span>
                    <span className="text-gray-500 font-mono text-[10px] uppercase ml-2">{p.part?.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Deck 2 */}
          <div className="p-6 bg-gray-900/90 border border-purple-500/40 rounded-3xl space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold border border-purple-500/30 uppercase">
                  {b2.type}
                </span>
                <h2 className="text-xl font-black text-white mt-1">{b2.title}</h2>
              </div>
              <Link to={`/builds/${b2.slug}`} className="text-xs text-purple-400 hover:underline font-bold">
                View Spec &rarr;
              </Link>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1">
                <span className="text-[10px] text-gray-500 uppercase">Est. Cost</span>
                <div className="font-bold text-white">${b2.estimate?.cost || 240}</div>
              </div>
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1">
                <span className="text-[10px] text-gray-500 uppercase">Battery Run</span>
                <div className="font-bold text-neon-green">{b2.estimate?.battery?.lifeHours || 12.0} hrs</div>
              </div>
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1">
                <span className="text-[10px] text-gray-500 uppercase">Power Load</span>
                <div className="font-bold text-amber-400">{b2.estimate?.powerW || 5.4} W</div>
              </div>
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1">
                <span className="text-[10px] text-gray-500 uppercase">Total Mass</span>
                <div className="font-bold text-purple-400">{b2.estimate?.weightG || 920} g</div>
              </div>
            </div>

            {/* Parts List */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Components ({b2.parts?.length || 0}):</span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs">
                {b2.parts?.map((p, i) => (
                  <div key={i} className="p-2 bg-gray-950 rounded-xl border border-gray-800 flex justify-between">
                    <span className="text-gray-200 truncate">{p.part?.name}</span>
                    <span className="text-gray-500 font-mono text-[10px] uppercase ml-2">{p.part?.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-gray-900/40 rounded-3xl border border-gray-800 text-gray-500">
          Please select 2 cyberdeck blueprints from the selector above to compare.
        </div>
      )}
    </div>
  );
}
