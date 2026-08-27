import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  User,
  Calendar,
  Wrench,
  MessageSquare,
  Star,
  ShieldCheck,
  Sparkles,
  Trophy,
  Cpu,
  Zap,
  ArrowRight,
  ExternalLink,
  Edit3,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import { API_URL } from "../lib/config";
import { useAuth } from "../AuthContext";
import { soundFx } from "../lib/soundFx";

interface UserProfile {
  id: string;
  name: string | null;
  email?: string;
  avatar: string | null;
  role?: string;
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

const SPECIALIZATIONS = [
  "Hardware Hacker & Cyberdeck Architect",
  "Field Recon & LoRa Mesh Specialist",
  "RISC-V Kernel & Firmware Engineer",
  "3D CAD & CNC Wedge Fabricator",
  "Solar & Off-Grid Energy Engineer",
  "SDR & Tactical SIGINT Netrunner",
];

export default function Profile() {
  const { id, userId } = useParams<{ id?: string; userId?: string }>();
  const { user: currentUser, updateUserProfile } = useAuth();
  const targetId = userId || id || (currentUser ? currentUser.id : "operative-1");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [builds, setBuilds] = useState<UserBuild[]>([]);
  const [stats, setStats] = useState({ totalBuilds: 0, totalReviews: 0, totalComments: 0 });
  const [loading, setLoading] = useState(true);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editAvatarSeed, setEditAvatarSeed] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isOwner = currentUser && profile && (currentUser.id === profile.id || currentUser.name === profile.name);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/users/${targetId}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          setBuilds(data.builds || []);
          setStats(data.stats || { totalBuilds: data.builds?.length || 0, totalReviews: 0, totalComments: 0 });
          setEditName(data.user.name || "");
          setEditRole(data.user.role || SPECIALIZATIONS[0]);
          setEditAvatarSeed(data.user.name || "operative");
        } else {
          // Fallback demo operative profile
          const fallbackUser = {
            id: targetId,
            name: "Operative " + targetId.slice(0, 6),
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${targetId}`,
            role: "Hardware Hacker & Cyberdeck Architect",
            createdAt: new Date().toISOString(),
          };
          setProfile(fallbackUser);
          setEditName(fallbackUser.name);
          setEditRole(fallbackUser.role);
          setEditAvatarSeed(fallbackUser.name);
        }
      } catch {
        const fallbackUser = {
          id: targetId,
          name: "Operative " + targetId.slice(0, 6),
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${targetId}`,
          role: "Hardware Hacker & Cyberdeck Architect",
          createdAt: new Date().toISOString(),
        };
        setProfile(fallbackUser);
        setEditName(fallbackUser.name);
        setEditRole(fallbackUser.role);
        setEditAvatarSeed(fallbackUser.name);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [targetId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    soundFx.playScanBeep();

    const newAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(editAvatarSeed || editName)}`;
    const updates = {
      name: editName.trim() || profile.name || "Operative",
      role: editRole,
      avatar: newAvatar,
    };

    try {
      const ok = await updateUserProfile(updates);
      if (ok || isOwner) {
        setProfile((prev) => (prev ? { ...prev, ...updates } : null));
        setSaveSuccess(true);
        soundFx.playConfirm();
        setTimeout(() => {
          setSaveSuccess(false);
          setIsEditing(false);
        }, 1200);
      }
    } catch {
      // fallback local update
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400 font-mono">
        <div className="w-12 h-12 border-2 border-neon-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Decrypting Operative Dossier...
      </div>
    );
  }

  const name = profile?.name || "Anonymous Operative";
  const avatar = profile?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
      {/* Dossier Header Card */}
      <div className="p-6 sm:p-8 bg-gray-900/80 border border-gray-800 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <ShieldCheck className="w-48 h-48 text-neon-green" />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative group">
            <img
              src={avatar}
              alt={name}
              className="w-24 h-24 rounded-2xl bg-gray-950 border-2 border-neon-green/40 shadow-lg shadow-neon-green/20"
            />
            {isOwner && !isEditing && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsEditing(true);
                }}
                className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-neon-green text-black font-bold shadow-md hover:scale-105 transition-transform"
                title="Edit Dossier"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-950/60 text-neon-green border border-neon-green/40 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                VERIFIED OPERATIVE
              </span>
              {isOwner && !isEditing && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsEditing(true);
                  }}
                  className="px-3 py-1 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 border border-gray-700 flex items-center gap-1.5 transition-all"
                >
                  <Edit3 className="w-3 h-3 text-neon-green" />
                  <span>Edit Callsign</span>
                </button>
              )}
            </div>

            <p className="text-xs text-cyan-400 font-bold">
              {profile?.role || "Hardware Hacker & Cyberdeck Architect"}
            </p>

            <div className="flex flex-wrap gap-4 text-xs text-gray-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-500" />
                Enlisted: {new Date(profile?.createdAt || Date.now()).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-gray-500" />
                {builds.length} Custom Blueprints
              </span>
            </div>
          </div>
        </div>

        {/* In-Place Dossier Editor */}
        {isEditing && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-6 pt-6 border-t border-gray-800/90 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in"
          >
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Operative Callsign</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-700 text-white text-xs font-mono focus:border-neon-green outline-none"
                placeholder="Enter Callsign"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Specialization Role</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-700 text-white text-xs font-mono focus:border-neon-green outline-none"
              >
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec} className="bg-gray-900 text-white">
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Bottts Avatar Custom Seed</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editAvatarSeed}
                  onChange={(e) => setEditAvatarSeed(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-700 text-white text-xs font-mono focus:border-neon-green outline-none"
                  placeholder="Avatar Seed Keyword"
                />
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setEditAvatarSeed("seed-" + Math.random().toString(36).substring(2, 7));
                  }}
                  className="px-3 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs hover:bg-gray-700 shrink-0"
                  title="Randomize Avatar Seed"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-neon-green text-black font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-neon-green/20"
              >
                {saveSuccess ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{isSaving ? "Updating..." : saveSuccess ? "Saved!" : "Save Changes"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsEditing(false);
                }}
                className="px-3 py-2 bg-gray-800 text-gray-300 hover:text-white rounded-xl text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Operative Stats & Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Created Blueprints", value: builds.length, icon: Wrench, color: "text-neon-green" },
          { label: "Field Reviews", value: stats.totalReviews || 12, icon: Star, color: "text-yellow-400" },
          { label: "Community Rep", value: "98.4%", icon: Trophy, color: "text-cyan-400" },
          { label: "Operative Tier", value: "Level 4 Builder", icon: Sparkles, color: "text-purple-400" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-4 bg-gray-900/60 border border-gray-800 rounded-2xl text-center">
              <Icon className={`w-5 h-5 mx-auto mb-1.5 ${s.color}`} />
              <div className="text-xl font-black text-white">{s.value}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Operative Builds Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-neon-green" />
            Fabricated Cyberdeck Builds
          </h2>
          <Link
            to="/builder"
            onClick={() => soundFx.playConfirm()}
            className="text-xs text-neon-green hover:underline flex items-center gap-1 font-bold"
          >
            <span>+ Create New Build</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {builds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {builds.map((b) => (
              <Link
                key={b.id}
                to={`/builds/${b.slug}`}
                onClick={() => soundFx.playClick()}
                className="p-5 bg-gray-900/70 border border-gray-800 rounded-2xl hover:border-neon-green transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-cyan-300 border border-gray-700">
                      {b.type}
                    </span>
                    {b.budget && (
                      <span className="text-xs font-bold text-neon-green">
                        ${b.budget.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-neon-green transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{b.description || "No description provided."}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-500">
                  <span>{b.partsCount} Components</span>
                  <span className="text-neon-green flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform">
                    Inspect <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-gray-900/40 border border-gray-800/80 rounded-2xl text-center space-y-3">
            <p className="text-xs text-gray-400">No public cyberdeck blueprints published yet by this operative.</p>
            <Link
              to="/builder"
              onClick={() => soundFx.playConfirm()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neon-green text-black font-bold rounded-xl text-xs"
            >
              Start Building in Blueprint Studio
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
