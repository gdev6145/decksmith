import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trophy,
  Eye,
  Heart,
  Wrench,
  Calendar,
  Medal,
  Crown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Scale,
  Check,
} from "lucide-react";
import { API_URL } from "../lib/config";
import { soundFx } from "../lib/soundFx";

interface LeaderboardBuild {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string | null;
  upvotes: number;
  views: number;
  partsCount: number;
  author: { id?: string; name: string | null };
  createdAt: string;
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const [builds, setBuilds] = useState<LeaderboardBuild[]>([]);
  const [sort, setSort] = useState<"upvotes" | "views">("upvotes");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/builds/leaderboard?sort=${sort}&limit=30`);
        if (res.ok) {
          setBuilds(await res.json());
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [sort]);

  const categories = useMemo(() => {
    const types = new Set(builds.map((b) => b.type).filter(Boolean));
    return ["ALL", ...Array.from(types)];
  }, [builds]);

  const filteredBuilds = useMemo(() => {
    if (selectedType === "ALL") return builds;
    return builds.filter((b) => b.type.toLowerCase() === selectedType.toLowerCase());
  }, [builds, selectedType]);

  const toggleCompare = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    soundFx.playClick();
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleLaunchCompare = () => {
    if (compareIds.length === 2) {
      soundFx.playConfirm();
      navigate(`/compare?ids=${compareIds.join(",")}`);
    }
  };

  const medals = [
    { bg: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40", icon: Crown },
    { bg: "bg-slate-400/20 text-slate-300 border-slate-400/40", icon: Medal },
    { bg: "bg-amber-600/20 text-amber-500 border-amber-600/40", icon: Medal },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 mb-2">
            <Trophy className="w-3.5 h-3.5" />
            Global Builder Standings
          </div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            Decksmith Community Leaderboard
          </h1>
          <p className="text-xs text-gray-400 mt-1">Top rated cyberdeck blueprints ranked by verified builder consensus</p>
        </div>

        {/* Sort Filter */}
        <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => {
              soundFx.playClick();
              setSort("upvotes");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              sort === "upvotes" ? "bg-neon-green text-black shadow-md shadow-neon-green/20" : "text-gray-400 hover:text-white"
            }`}
          >
            🔥 Most Upvoted
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setSort("views");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              sort === "views" ? "bg-neon-green text-black shadow-md shadow-neon-green/20" : "text-gray-400 hover:text-white"
            }`}
          >
            👁️ Most Viewed
          </button>
        </div>
      </div>

      {/* Category Pills & Compare Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundFx.playClick();
                setSelectedType(cat);
              }}
              className={`px-3 py-1.5 rounded-xl uppercase font-bold transition-all whitespace-nowrap ${
                selectedType === cat
                  ? "bg-gray-800 text-white border border-gray-700 shadow-sm"
                  : "bg-gray-950/80 text-gray-500 border border-gray-900 hover:text-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {compareIds.length > 0 && (
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 p-1.5 rounded-2xl">
            <span className="text-[11px] text-gray-400 px-2 font-bold">
              {compareIds.length}/2 Selected
            </span>
            <button
              onClick={handleLaunchCompare}
              disabled={compareIds.length !== 2}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                compareIds.length === 2
                  ? "bg-neon-green text-black shadow-md shadow-neon-green/20"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare Blueprints</span>
            </button>
          </div>
        )}
      </div>

      {/* Leaderboard Table / Cards */}
      {loading ? (
        <div className="py-16 text-center text-gray-400 font-mono">
          <div className="w-10 h-10 border-2 border-neon-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Ranking operative telemetry...
        </div>
      ) : filteredBuilds.length > 0 ? (
        <div className="space-y-3">
          {filteredBuilds.map((b, idx) => {
            const medal = idx < 3 && selectedType === "ALL" ? medals[idx] : null;
            const MedalIcon = medal ? medal.icon : null;
            const isSelectedForCompare = compareIds.includes(b.id);

            return (
              <Link
                key={b.id}
                to={`/builds/${b.slug}`}
                onClick={() => soundFx.playClick()}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ${
                  idx === 0 && selectedType === "ALL"
                    ? "bg-gray-900/90 border-yellow-500/40 shadow-xl shadow-yellow-500/5 hover:border-yellow-400"
                    : isSelectedForCompare
                    ? "bg-gray-900 border-neon-green shadow-md shadow-neon-green/10"
                    : "bg-gray-900/60 border-gray-800 hover:border-gray-700"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Rank Badge */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border shrink-0 ${
                      medal ? medal.bg : "bg-gray-950 text-gray-400 border-gray-800"
                    }`}
                  >
                    {MedalIcon ? <MedalIcon className="w-5 h-5" /> : `#${idx + 1}`}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-neon-green transition-colors truncate">
                        {b.title}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-cyan-300 border border-gray-700 shrink-0">
                        {b.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span>By <strong className="text-gray-200">{b.author?.name || "Operative"}</strong></span>
                      <span>•</span>
                      <span>{b.partsCount} parts</span>
                    </div>
                  </div>
                </div>

                {/* Score Stats & Compare Action */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <button
                    onClick={(e) => toggleCompare(e, b.id)}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                      isSelectedForCompare
                        ? "bg-neon-green text-black border-neon-green"
                        : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white"
                    }`}
                    title="Select to compare"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span className="text-[10px]">{isSelectedForCompare ? "Selected" : "Compare"}</span>
                  </button>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-950 border border-gray-800 text-xs font-bold text-red-400">
                    <Heart className="w-4 h-4 fill-red-400" />
                    <span>{b.upvotes}</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-950 border border-gray-800 text-xs font-bold text-cyan-300">
                    <Eye className="w-4 h-4" />
                    <span>{b.views}</span>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-center text-gray-500 group-hover:text-neon-green group-hover:border-neon-green transition-all">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-gray-900/40 border border-gray-800 rounded-3xl space-y-3">
          <p className="text-sm text-gray-400">No builds found in this category.</p>
          <Link
            to="/builder"
            className="inline-flex items-center gap-2 px-4 py-2 bg-neon-green text-black font-bold rounded-xl text-xs"
          >
            Launch Blueprint Studio
          </Link>
        </div>
      )}
    </div>
  );
}
