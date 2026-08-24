import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trophy, Eye, Heart, Wrench, Calendar } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

interface LeaderboardBuild {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string | null;
  upvotes: number;
  views: number;
  partsCount: number;
  author: { name: string | null };
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
        if (res.ok) setBuilds(await res.json());
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [sort]);

  const medals = ["text-yellow-400", "text-gray-400", "text-amber-600"];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-gray-500 mt-1">Top builds by community votes</p>
        </div>
        <div className="flex gap-2">
          {[
            { key: "upvotes", label: "Votes", icon: Heart },
            { key: "views", label: "Views", icon: Eye },
            { key: "parts", label: "Parts", icon: Wrench },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                sort === key
                  ? "bg-neon-green text-gray-900 font-semibold"
                  : "bg-gray-800 text-gray-400 hover:text-gray-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-green" />
        </div>
      ) : builds.length > 0 ? (
        <div className="space-y-3">
          {builds.map((b, i) => (
            <Link
              key={b.id}
              to={`/builds/${b.slug}`}
              className={`flex items-center gap-4 bg-gray-900/50 border rounded-xl p-4 hover:border-gray-700 hover:bg-gray-900 transition-all ${
                i < 3 ? "border-gray-700" : "border-gray-800"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
                i < 3 ? `${medals[i]} bg-gray-800` : "text-gray-600 bg-gray-800/50"
              }`}>
                {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-200 truncate">{b.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">{b.type}</span>
                  <span className="text-xs text-gray-600">by {b.author.name || "Anonymous"}</span>
                  <span className="text-xs text-gray-600 flex items-center gap-0.5">
                    <Calendar className="w-3 h-3" /> {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="font-bold text-neon-green">{b.upvotes}</p>
                  <p className="text-xs text-gray-600">votes</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-300">{b.views}</p>
                  <p className="text-xs text-gray-600">views</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-300">{b.partsCount}</p>
                  <p className="text-xs text-gray-600">parts</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-12">No builds yet.</p>
      )}
    </div>
  );
}
