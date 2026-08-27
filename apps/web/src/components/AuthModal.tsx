import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Zap,
  Sparkles,
  X,
  Check,
  LogIn,
  UserPlus,
  Radio,
  Cpu,
  Layers,
  ArrowRight,
  Fingerprint,
  Lock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth, UserProfile } from "../AuthContext";
import { API_URL } from "../lib/config";
import { soundFx } from "../lib/soundFx";

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, login, register, quickSwitchBuilder, user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register" | "operatives">("login");
  const [emailOrName, setEmailOrName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("Hardware Hacker");
  const [builders, setBuilders] = useState<UserProfile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (showAuthModal) {
      const fetchBuilders = async () => {
        try {
          const res = await fetch(`${API_URL}/api/auth/builders`);
          if (res.ok) {
            setBuilders(await res.json());
          }
        } catch {
          // ignore
        }
      };
      fetchBuilders();
    }
  }, [showAuthModal]);

  if (!showAuthModal) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrName.trim()) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const result = await login(emailOrName, password);
      if (result.success) {
        setShowAuthModal(false);
        setEmailOrName("");
        setPassword("");
      } else {
        setErrorMessage(result.error || "Authentication signature rejected.");
      }
    } catch {
      setErrorMessage("Could not connect to authentication gateway.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const result = await register(regName, regEmail, regPassword, regRole);
      if (result.success) {
        setShowAuthModal(false);
        setRegName("");
        setRegEmail("");
        setRegPassword("");
      } else {
        setErrorMessage(result.error || "Registration rejected.");
      }
    } catch {
      setErrorMessage("Could not connect to registration gateway.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const PRESET_PASSWORDS: Record<string, string> = {
    Echo_Zero: "EchoRecon2026!",
    NeoHacker99: "RiscVPower99!",
    ByteForge: "CadWedge2026!",
    CyberValkyrie: "SolarAirgap2026!",
  };

  const handleQuickSwitchWithPass = async (b: UserProfile) => {
    const defaultPass = PRESET_PASSWORDS[b.name] || "EchoRecon2026!";
    setEmailOrName(b.name);
    setPassword(defaultPass);
    setActiveTab("login");
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center text-neon-green">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase font-mono tracking-wider flex items-center gap-2">
                Cyberdeck Security Auth
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-neon-green border border-neon-green/30 font-bold">
                  PBKDF2-SHA512
                </span>
              </h2>
              <p className="text-xs text-gray-400 font-mono">Constant-time HMAC-SHA256 authenticated sessions</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              setShowAuthModal(false);
            }}
            className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-800 bg-gray-950/60 p-2 gap-1.5">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab("login");
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "login"
                ? "bg-neon-green text-black shadow-md shadow-neon-green/20"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab("register");
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "register"
                ? "bg-neon-green text-black shadow-md shadow-neon-green/20"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab("operatives");
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "operatives"
                ? "bg-neon-green text-black shadow-md shadow-neon-green/20"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Verified Operatives
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 font-mono">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase font-bold">
                  Operative Callsign or Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. Echo_Zero or builder@decksmith.local"
                  value={emailOrName}
                  onChange={(e) => setEmailOrName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-xs text-white font-mono placeholder-gray-500 focus:border-neon-green focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase font-bold flex items-center justify-between">
                  <span>Cryptographic Password / PIN</span>
                  <span className="text-[10px] text-cyan-400 font-normal">PBKDF2 100k rounds</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter security passphrase"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 pr-10 text-xs text-white font-mono placeholder-gray-500 focus:border-neon-green focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-gray-950/80 border border-gray-800 rounded-xl text-[10px] text-gray-400 font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-neon-green shrink-0" />
                <span>Protected against timing attacks via constant-time buffer comparisons.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-neon-green text-black font-bold font-mono text-xs hover:bg-neon-green/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-neon-green/10"
              >
                <span>{isSubmitting ? "Verifying Signature..." : "Access Decksmith Terminal"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase font-bold">
                  Operative Callsign (Handle)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ShadowRunner (3-32 chars)"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-xs text-white font-mono placeholder-gray-500 focus:border-neon-green focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase font-bold">
                  Email (Optional for Recovery)
                </label>
                <input
                  type="email"
                  placeholder="builder@decksmith.local"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-xs text-white font-mono placeholder-gray-500 focus:border-neon-green focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase font-bold">
                  Passphrase (Salted PBKDF2 Encrypted)
                </label>
                <input
                  type="password"
                  placeholder="Choose strong master passphrase"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-xs text-white font-mono placeholder-gray-500 focus:border-neon-green focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase font-bold">
                  Specialization Role
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-xs text-cyan-300 font-mono font-bold focus:border-neon-green focus:outline-none"
                >
                  <option value="Hardware Hacker">Hardware Hacker (Custom SBCs & Pinouts)</option>
                  <option value="RF Recon Specialist">RF Recon Specialist (SDR & LoRa Mesh)</option>
                  <option value="Solar & Off-Grid Architect">Solar & Off-Grid Architect (Airgap)</option>
                  <option value="Chiptune Sound Designer">Chiptune Sound Designer (Tracker Synthesizers)</option>
                  <option value="3D Fabrication Engineer">3D Fabrication Engineer (CAD & Slicers)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-neon-green text-black font-bold font-mono text-xs hover:bg-neon-green/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-neon-green/10"
              >
                <span>{isSubmitting ? "Generating Cryptographic Salt..." : "Create Protected Builder Profile"}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Verified Operatives */}
          {activeTab === "operatives" && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 font-mono">
                Select a verified community operative to load their credentials into sign in:
              </p>

              <div className="grid grid-cols-1 gap-2.5 max-h-64 overflow-y-auto">
                {builders.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleQuickSwitchWithPass(b)}
                    className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${
                      user?.name === b.name
                        ? "bg-emerald-950/40 border-neon-green shadow-md shadow-neon-green/10"
                        : "bg-gray-950 border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    <img
                      src={b.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${b.name}`}
                      alt={b.name}
                      className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono">{b.name}</span>
                        <span className="text-[10px] text-yellow-400 font-mono">Verified Credential</span>
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono truncate">{b.role}</div>
                      <div className="text-[9px] text-gray-500 font-mono mt-0.5">
                        Pass: {PRESET_PASSWORDS[b.name] || "••••••••"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
