import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, Zap, Battery, DollarSign, Weight, Clock, Star, GitCompareArrows } from "lucide-react";
import BuildImage from "../components/BuildImage";
import { API_URL } from "../lib/config";

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
  const [builds, setBuilds] = useState<BuildData[]>([]);
  const [selected, setSelected] = useState<BuildData[]>([]);
  const [loading, setLoading] = useState(true);
  const [allBuilds, setAllBuilds] = useState<BuildData[]>([]);

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
        setAllBuilds((prev) => prev.map((b) => b.id === buildId ? { ...b, estimate: est } : b));
        setSelected((prev) => prev.map((b) => b.id === buildId ? { ...b, estimate: est } : b));
      }
    } catch {
      // ignore
    }
  };

  const toggleBuild = (build: BuildData) => {
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

  const winner = (a: number | null, b: number | null, lower = true) => {
    if (a == null && b == null) return "tie";
    if (a == null) return "b";
    if (b == null) return "a";
    if (a === b) return "tie";
    return lower ? (a < b ? "a" : "b") : (a > b ? "a" : "b");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/builds" className="inline-flex items-center gap-2 text-gray-400 hover:text-neon-green mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Builds
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
          <GitCompareArrows className="w-8 h-8 text-neon-green" />
          Compare Builds
        </h1>
        <p className="text-gray-400 mt-1">Select up to 2 builds to compare side by side</p>
      </div>

      {/* Build Selector */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Select Builds ({selected.length}/2)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {allBuilds.map((build) => {
            const isSelected = selected.some((b) => b.id === build.id);
            return (
              <button
                key={build.id}
                onClick={() => toggleBuild(build)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? "border-neon-green bg-neon-green/10 text-neon-green"
                    : "border-gray-800 bg-gray-900/50 text-gray-400 hover:border-gray-700"
                }`}
              >
                <p className="text-sm font-medium truncate">{build.title}</p>
                <p className="text-xs text-gray-500 mt-1">{build.type}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      {selected.length === 2 && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          {/* Headers */}
          <div className="grid grid-cols-3 border-b border-gray-800">
            <div className="p-4 text-sm text-gray-500 font-medium">Spec</div>
            {selected.map((build, i) => (
              <div key={build.id} className="p-4 border-l border-gray-800">
                <Link to={`/builds/${build.slug}`} className="text-sm font-semibold text-gray-100 hover:text-neon-green transition-colors">
                  {build.title}
                </Link>
                <p className="text-xs text-gray-500 mt-1">{build.type}</p>
              </div>
            ))}
          </div>

          {/* Build Image */}
          <div className="grid grid-cols-3 border-b border-gray-800">
            <div className="p-4 text-sm text-gray-500">Image</div>
            {selected.map((build) => (
              <div key={build.id} className="p-4 border-l border-gray-800 flex justify-center">
                <div className="w-48 h-24">
                  <BuildImage parts={build.parts.map((bp) => ({ part: { name: bp.part.name, category: bp.part.category } }))} tags={build.tags} title={build.title} />
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="grid grid-cols-3 border-b border-gray-800">
            <div className="p-4 text-sm text-gray-500">Description</div>
            {selected.map((build) => (
              <div key={build.id} className="p-4 border-l border-gray-800 text-sm text-gray-300">
                {build.description || "—"}
              </div>
            ))}
          </div>

          {/* Cost */}
          <div className="grid grid-cols-3 border-b border-gray-800">
            <div className="p-4 text-sm text-gray-500 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Cost</div>
            {selected.map((build, i) => {
              const other = i === 0 ? selected[1] : selected[0];
              const w = winner(build.estimate?.cost ?? null, other.estimate?.cost ?? null);
              return (
                <div key={build.id} className={`p-4 border-l border-gray-800 text-lg font-bold ${w === (i === 0 ? "a" : "b") ? "text-neon-green" : "text-gray-400"}`}>
                  {build.estimate?.cost != null ? `$${build.estimate.cost.toFixed(2)}` : "—"}
                </div>
              );
            })}
          </div>

          {/* Power */}
          <div className="grid grid-cols-3 border-b border-gray-800">
            <div className="p-4 text-sm text-gray-500 flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Power</div>
            {selected.map((build, i) => {
              const other = i === 0 ? selected[1] : selected[0];
              const w = winner(build.estimate?.powerW ?? null, other.estimate?.powerW ?? null, true);
              return (
                <div key={build.id} className={`p-4 border-l border-gray-800 text-lg font-bold ${w === (i === 0 ? "a" : "b") ? "text-neon-green" : "text-gray-400"}`}>
                  {build.estimate?.powerW != null ? `${build.estimate.powerW.toFixed(1)}W` : "—"}
                </div>
              );
            })}
          </div>

          {/* Battery Life */}
          <div className="grid grid-cols-3 border-b border-gray-800">
            <div className="p-4 text-sm text-gray-500 flex items-center gap-1"><Battery className="w-3.5 h-3.5" /> Battery Life</div>
            {selected.map((build, i) => {
              const other = i === 0 ? selected[1] : selected[0];
              const a = build.estimate?.battery?.lifeHours ?? null;
              const b = other.estimate?.battery?.lifeHours ?? null;
              const w = winner(a, b, false);
              return (
                <div key={build.id} className={`p-4 border-l border-gray-800 text-lg font-bold ${w === (i === 0 ? "a" : "b") ? "text-neon-green" : "text-gray-400"}`}>
                  {a != null ? `${a}h` : "—"}
                </div>
              );
            })}
          </div>

          {/* Weight */}
          <div className="grid grid-cols-3 border-b border-gray-800">
            <div className="p-4 text-sm text-gray-500 flex items-center gap-1"><Weight className="w-3.5 h-3.5" /> Weight</div>
            {selected.map((build, i) => {
              const other = i === 0 ? selected[1] : selected[0];
              const w = winner(build.estimate?.weightG ?? null, other.estimate?.weightG ?? null, true);
              return (
                <div key={build.id} className={`p-4 border-l border-gray-800 text-lg font-bold ${w === (i === 0 ? "a" : "b") ? "text-neon-green" : "text-gray-400"}`}>
                  {build.estimate?.weightG != null ? `${(build.estimate.weightG / 1000).toFixed(1)}kg` : "—"}
                </div>
              );
            })}
          </div>

          {/* Build Time */}
          <div className="grid grid-cols-3 border-b border-gray-800">
            <div className="p-4 text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Build Time</div>
            {selected.map((build, i) => {
              const other = i === 0 ? selected[1] : selected[0];
              const w = winner(build.estimate?.buildTimeHours ?? null, other.estimate?.buildTimeHours ?? null, true);
              return (
                <div key={build.id} className={`p-4 border-l border-gray-800 text-lg font-bold ${w === (i === 0 ? "a" : "b") ? "text-neon-green" : "text-gray-400"}`}>
                  {build.estimate?.buildTimeHours != null ? `${build.estimate.buildTimeHours}h` : "—"}
                </div>
              );
            })}
          </div>

          {/* Difficulty */}
          <div className="grid grid-cols-3 border-b border-gray-800">
            <div className="p-4 text-sm text-gray-500">Difficulty</div>
            {selected.map((build) => (
              <div key={build.id} className={`p-4 border-l border-gray-800 text-lg font-bold ${
                build.estimate?.difficulty.level === "Easy" ? "text-green-400"
                : build.estimate?.difficulty.level === "Medium" ? "text-yellow-400"
                : build.estimate?.difficulty.level === "Hard" ? "text-orange-400"
                : "text-red-400"
              }`}>
                {build.estimate?.difficulty.level || "—"}
              </div>
            ))}
          </div>

          {/* Parts */}
          <div className="grid grid-cols-3">
            <div className="p-4 text-sm text-gray-500">Parts</div>
            {selected.map((build) => (
              <div key={build.id} className="p-4 border-l border-gray-800">
                <p className="text-sm text-gray-300 mb-2">{build.parts.length} parts</p>
                <div className="space-y-1">
                  {build.parts.map((bp) => (
                    <div key={bp.part.id} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400">{bp.part.name}</span>
                      <span className="text-gray-600">×{bp.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected.length < 2 && (
        <div className="text-center py-12 text-gray-500">
          Select 2 builds above to compare them
        </div>
      )}
    </div>
  );
}
