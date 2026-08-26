import React, { useState, useEffect } from "react";
import {
  User,
  Save,
  Loader2,
  Volume2,
  VolumeX,
  ShieldCheck,
  Download,
  Trash2,
  Sparkles,
  Check,
  Bell,
  Radio,
  Sliders,
  DollarSign,
  Cpu,
  RefreshCw,
  Key,
  Database,
  Lock,
  Compass,
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";
import { useNotification } from "../NotificationContext";
import { API_URL } from "../lib/config";
import { soundFx } from "../lib/soundFx";

export default function Settings() {
  const { user, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { hasDesktopPermission, requestDesktopPermission, dispatchToast } = useNotification();

  // Operative Profile
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(user?.role || "Hardware Hacker");

  // Station Preferences
  const [isSoundOn, setIsSoundOn] = useState(soundFx.isEnabled());
  const [preferredCurrency, setPreferredCurrency] = useState<string>(() => localStorage.getItem("decksmith_currency") || "USD");
  const [preferredUnits, setPreferredUnits] = useState<string>(() => localStorage.getItem("decksmith_units") || "metric");
  const [defaultTemplate, setDefaultTemplate] = useState<string>(() => localStorage.getItem("decksmith_default_preset") || "netrunner");
  const [minDropPercent, setMinDropPercent] = useState<number>(() => Number(localStorage.getItem("decksmith_min_drop_pct")) || 5);

  // UI state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      if (user.role) setRole(user.role);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    soundFx.playClick();

    // Save local preferences
    localStorage.setItem("decksmith_currency", preferredCurrency);
    localStorage.setItem("decksmith_units", preferredUnits);
    localStorage.setItem("decksmith_default_preset", defaultTemplate);
    localStorage.setItem("decksmith_min_drop_pct", minDropPercent.toString());

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
        dispatchToast({
          type: "info",
          title: "⚙️ Station Preferences Saved",
          message: "Profile callsign, currency, and unit preferences synchronized.",
        });
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
      preferences: {
        currency: preferredCurrency,
        units: preferredUnits,
        defaultTemplate,
        minDropPercent,
        soundFx: isSoundOn,
        theme,
      },
      savedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decksmith-station-backup-${user?.name || "operative"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetLocalDefaults = () => {
    soundFx.playAlert();
    if (confirm("Reset all local hardware cache and preferences to factory defaults?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-neon-green/10 text-neon-green border border-neon-green/30 mb-2">
            <Cpu className="w-3.5 h-3.5" />
            Station Control Panel
          </div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            Operative Station Settings
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure operative callsigns, hardware units, push notifications, and sound effects
          </p>
        </div>

        <button
          onClick={handleExportData}
          className="px-4 py-2.5 bg-gray-900 border border-gray-700 hover:border-neon-green text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shrink-0"
        >
          <Download className="w-4 h-4 text-neon-green" />
          Export Station JSON
        </button>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-950/80 border border-neon-green rounded-2xl text-xs text-neon-green flex items-center gap-2 animate-in fade-in shadow-lg shadow-neon-green/10">
          <Check className="w-4 h-4" />
          Station settings and operative preferences successfully updated.
        </div>
      )}

      {/* Operative Identity Profile */}
      <form onSubmit={handleSaveProfile} className="p-6 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h2 className="text-sm font-bold text-white uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Operative Identity Profile
          </h2>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gray-950 border border-gray-800 text-neon-green font-bold">
            PBKDF2 Secured
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Encrypted Comms Email
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

          <div className="md:col-span-2">
            <label className="block text-xs text-gray-300 mb-1.5 font-bold uppercase">
              Specialization Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-cyan-300 font-bold focus:border-neon-green focus:outline-none cursor-pointer"
            >
              <option value="Hardware Hacker">Hardware Hacker (Custom SBCs, Carriers & Pinouts)</option>
              <option value="RF Recon Specialist">RF Recon Specialist (SDR, HackRF & LoRa Meshtastic)</option>
              <option value="Solar & Off-Grid Architect">Solar & Off-Grid Architect (LiFePO4 & MPPT Airgap)</option>
              <option value="Chiptune Sound Designer">Chiptune Sound Designer (I2S DAC & Synthesizers)</option>
              <option value="3D Fabrication Engineer">3D Fabrication Engineer (CAD, CNC & Slicers)</option>
            </select>
          </div>
        </div>

        {/* Station Defaults Section */}
        <div className="pt-4 border-t border-gray-800 space-y-4">
          <h3 className="text-xs font-bold text-gray-300 uppercase">Station Units & Currency Defaults</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1 uppercase font-bold">Currency</label>
              <select
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white font-bold focus:border-neon-green focus:outline-none cursor-pointer"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 mb-1 uppercase font-bold">Dimension Units</label>
              <select
                value={preferredUnits}
                onChange={(e) => setPreferredUnits(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white font-bold focus:border-neon-green focus:outline-none cursor-pointer"
              >
                <option value="metric">Metric (mm / grams)</option>
                <option value="imperial">Imperial (inches / oz)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 mb-1 uppercase font-bold">Default Blueprint</label>
              <select
                value={defaultTemplate}
                onChange={(e) => setDefaultTemplate(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white font-bold focus:border-neon-green focus:outline-none cursor-pointer"
              >
                <option value="netrunner">Shadow Netrunner MK-IV</option>
                <option value="meshtastic">Nomad LoRa Field Unit</option>
                <option value="nas">Silent 4-Bay NAS</option>
                <option value="sdr">SIGINT Spectrum Scanner</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-neon-green text-black font-bold rounded-xl text-xs hover:bg-neon-green/90 transition-all flex items-center gap-2 shadow-lg shadow-neon-green/10"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Saving Preferences..." : "Save Station Settings"}</span>
          </button>
        </div>
      </form>

      {/* Cyberpunk Audio FX Suite */}
      <div className="p-6 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h2 className="text-sm font-bold text-white uppercase flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-neon-green" />
            Tactile Audio Sound FX Suite
          </h2>
          <button
            onClick={() => {
              const state = soundFx.toggleSound();
              setIsSoundOn(state);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              isSoundOn
                ? "bg-neon-green text-black shadow-md shadow-neon-green/20"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {isSoundOn ? "AUDIO: ENABLED" : "AUDIO: MUTED"}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => soundFx.playClick()}
            className="p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-300 hover:text-white hover:border-cyan-400 transition-all flex items-center justify-center gap-1.5"
          >
            <span>🔘 Switch Click</span>
          </button>
          <button
            type="button"
            onClick={() => soundFx.playConfirm()}
            className="p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-300 hover:text-white hover:border-neon-green transition-all flex items-center justify-center gap-1.5"
          >
            <span>✨ Confirm Chime</span>
          </button>
          <button
            type="button"
            onClick={() => soundFx.playPaletteOpen()}
            className="p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-300 hover:text-white hover:border-purple-400 transition-all flex items-center justify-center gap-1.5"
          >
            <span>📡 Palette Tone</span>
          </button>
          <button
            type="button"
            onClick={() => soundFx.playAlert()}
            className="p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-300 hover:text-white hover:border-rose-400 transition-all flex items-center justify-center gap-1.5"
          >
            <span>🚨 Warning Siren</span>
          </button>
        </div>
      </div>

      {/* Push Notifications & Desktop Dispatch */}
      <div className="p-6 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h2 className="text-sm font-bold text-white uppercase flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            Tactile Alert & Desktop Push Dispatch
          </h2>
          <span className="text-[10px] text-gray-500 uppercase font-bold">
            Status: {hasDesktopPermission ? "ACTIVE" : "DISABLED"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-950 border border-gray-800 rounded-2xl">
          <div>
            <div className="text-xs font-bold text-white">Browser Desktop Notifications</div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Receive instant desktop notifications for hardware price drops and new studio releases
            </p>
          </div>

          <button
            onClick={() => requestDesktopPermission()}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              hasDesktopPermission
                ? "bg-emerald-950 text-neon-green border border-neon-green/40"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
            }`}
          >
            {hasDesktopPermission ? "Push Active ✓" : "Enable Desktop Push"}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 bg-rose-950/20 border border-rose-900/40 rounded-3xl space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-rose-300 uppercase border-b border-rose-900/30 pb-3 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-400" />
          Station Memory & Reset
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white">Reset Local Station Defaults</div>
            <div className="text-[10px] text-gray-400">Clear cached blueprint drafts, local storage, and history</div>
          </div>

          <button
            onClick={handleResetLocalDefaults}
            className="px-4 py-2 bg-rose-950 border border-rose-800/80 hover:border-rose-500 text-rose-300 font-bold rounded-xl text-xs flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
