import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trophy, Eye, Heart, Wrench, Calendar, Medal, Crown, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
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
  const [builds, setBuilds] = useState<LeaderboardBuild[]>([]);
  const [sort, setSort] = useState("upvotes");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/builds/leaderboard?sort=${sort}&limit=20`);
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

      {/* Leaderboard Table / Cards */}
      {loading ? (
        <div className="py-16 text-center text-gray-400 font-mono">
          <div className="w-10 h-10 border-2 border-neon-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Ranking operative telemetry...
        </div>
      ) : builds.length > 0 ? (
        <div className="space-y-3">
          {builds.map((b, idx) => {
            const medal = idx < 3 ? medals[idx] : null;
            const MedalIcon = medal ? medal.icon : null;
            return (
              <Link
                key={b.id}
                to={`/builds/${b.slug}`}
                onClick={() => soundFx.playClick()}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ${
                  idx === 0
                    ? "bg-gray-900/90 border-yellow-500/40 shadow-xl shadow-yellow-500/5 hover:border-yellow-400"
                    : "bg-gray-900/60 border-gray-800 hover:border-neon-green"
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

                {/* Score Stats */}
                <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-950 border border-gray-800 text-xs font-bold text-red-400">
                    <Heart className="w-4 h-4 fill-red-400" />
                    <span>{b.upvotes}</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-950 border border-gray-800 text-xs font-bold text-cyan-300">
                    <Eye className="w-4 h-4" />
                    <span>{b.views}</span>
                  </div>

                  <ChevronRightIcon />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-gray-900/40 border border-gray-800 rounded-3xl space-y-3">
          <p className="text-sm text-gray-400">No builds on the leaderboard yet. Be the first to publish a build!</p>
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

function ChevronRightIcon() {
  return (
    <div className="w-8 h-8 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-center text-gray-500 group-hover:text-neon-green group-hover:border-neon-green transition-all">
      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
    </div>
  );
}
