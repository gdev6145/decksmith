import { useState, useEffect } from "react";
import { User, Save, Loader2, Volume2, VolumeX, ShieldCheck, Download, Trash2, Sparkles, Check } from "lucide-react";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";
import { API_URL } from "../lib/config";
import { soundFx } from "../lib/soundFx";

export default function Settings() {
  const { user, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(user?.role || "Hardware Hacker");
  const [isSoundOn, setIsSoundOn] = useState(soundFx.isEnabled());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      if (user.role) setRole(user.role);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    soundFx.playClick();

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/user`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ name, email, role }),
      });

      if (res.ok) {
        soundFx.playConfirm();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    soundFx.playConfirm();
    const data = {
      user,
      savedAt: new Date().toISOString(),
      theme,
      soundFxEnabled: isSoundOn,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decksmith-profile-${user?.name || "backup"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
      {/* Header */}
      <div className="border-b border-gray-800 pb-5">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <User className="w-7 h-7 text-neon-green" />
          Operative Station Settings
        </h1>
        <p className="text-xs text-gray-400 mt-1">Configure your cyberdeck workstation, identity profile, and audio preferences</p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-950/60 border border-neon-green/60 rounded-2xl text-xs text-neon-green flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          Settings successfully synchronized with Decksmith node.
        </div>
      )}

      {/* Operative Identity Form */}
      <form onSubmit={handleSave} className="p-6 bg-gray-900/80 border border-gray-800 rounded-3xl space-y-5 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h2 className="text-sm font-bold text-white uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Operative Callsign Profile
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-950 border border-gray-800 text-neon-green">
            PBKDF2 Secured
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-300 mb-1.5 font-bold uppercase">
              Operative Callsign (Handle)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:border-neon-green focus:outline-none"
              placeholder="e.g. Echo_Zero"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1.5 font-bold uppercase">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:border-neon-green focus:outline-none"
              placeholder="builder@decksmith.local"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1.5 font-bold uppercase">
              Specialization Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-cyan-300 font-bold focus:border-neon-green focus:outline-none"
            >
              <option value="Hardware Hacker">Hardware Hacker (Custom SBCs & Pinouts)</option>
              <option value="RF Recon Specialist">RF Recon Specialist (SDR & LoRa Mesh)</option>
              <option value="Solar & Off-Grid Architect">Solar & Off-Grid Architect (Airgap)</option>
              <option value="Chiptune Sound Designer">Chiptune Sound Designer (Tracker Synthesizers)</option>
              <option value="3D Fabrication Engineer">3D Fabrication Engineer (CAD & Slicers)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-neon-green text-black font-bold rounded-xl text-xs hover:bg-neon-green/90 transition-all flex items-center gap-2 shadow-lg shadow-neon-green/10"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Saving Changes..." : "Save Profile Settings"}</span>
          </button>
        </div>
      </form>

      {/* Audio & Workspace Preferences */}
      <div className="p-6 bg-gray-900/80 border border-gray-800 rounded-3xl space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase border-b border-gray-800 pb-3">
          Audio & Station Preferences
        </h2>

        <div className="flex items-center justify-between p-3 bg-gray-950 border border-gray-800 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center text-neon-green">
              {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-xs font-bold text-white">Cyberpunk Audio Sound FX</div>
              <div className="text-[10px] text-gray-400">Tactile synthetic clicks and confirm beeps</div>
            </div>
          </div>

          <button
            onClick={() => {
              const state = soundFx.toggleSound();
              setIsSoundOn(state);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isSoundOn
                ? "bg-neon-green text-black shadow-md shadow-neon-green/20"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {isSoundOn ? "ENABLED" : "MUTED"}
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-950 border border-gray-800 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Interface Visual Theme</div>
              <div className="text-[10px] text-gray-400">Active mode: {theme.toUpperCase()}</div>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-xl bg-gray-800 text-xs font-bold text-gray-200 hover:text-white border border-gray-700"
          >
            Switch to {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="p-6 bg-gray-900/80 border border-gray-800 rounded-3xl space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase border-b border-gray-800 pb-3">
          Blueprint Data & Backup
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white">Export Operative Station Archive</div>
            <div className="text-[10px] text-gray-400">Download a JSON snapshot of your active profile and preferences</div>
          </div>

          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-gray-950 border border-gray-700 hover:border-neon-green text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-neon-green" />
            Export JSON
          </button>
        </div>
      </div>
    </div>
  );
}
