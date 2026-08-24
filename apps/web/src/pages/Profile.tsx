import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { User, Calendar, Wrench, MessageSquare, Star } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

interface UserProfile {
  id: string;
  name: string | null;
  avatar: string | null;
  createdAt: string;
}

interface UserBuild {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string | null;
  budget: number | null;
  partsCount: number;
  createdAt: string;
}

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [builds, setBuilds] = useState<UserBuild[]>([]);
  const [stats, setStats] = useState({ totalBuilds: 0, totalReviews: 0, totalComments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          setBuilds(data.builds);
          setStats(data.stats);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-green" /></div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center text-gray-500">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="w-16 h-16 rounded-full" />
            ) : (
              <User className="w-8 h-8 text-gray-600" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">{profile.name || "Anonymous"}</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Joined {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <Wrench className="w-4 h-4 text-neon-green mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-100">{stats.totalBuilds}</p>
            <p className="text-xs text-gray-500">Builds</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <Star className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-100">{stats.totalReviews}</p>
            <p className="text-xs text-gray-500">Reviews</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <MessageSquare className="w-4 h-4 text-neon-blue mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-100">{stats.totalComments}</p>
            <p className="text-xs text-gray-500">Comments</p>
          </div>
        </div>
      </div>

      {/* Builds */}
      <h2 className="text-lg font-semibold text-gray-100 mb-4">Builds</h2>
      {builds.length > 0 ? (
        <div className="space-y-3">
          {builds.map((b) => (
            <Link
              key={b.id}
              to={`/builds/${b.slug}`}
              className="block bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-gray-700 hover:bg-gray-900 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-200 hover:text-neon-green transition-colors">{b.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{b.type} · {b.partsCount} parts</p>
                </div>
                <div className="text-right">
                  {b.budget != null && <p className="text-xs text-gray-400">${b.budget.toFixed(0)} budget</p>}
                  <p className="text-xs text-gray-600">{new Date(b.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {b.description && <p className="text-xs text-gray-500 mt-2 line-clamp-1">{b.description}</p>}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No builds yet.</p>
      )}
    </div>
  );
}
