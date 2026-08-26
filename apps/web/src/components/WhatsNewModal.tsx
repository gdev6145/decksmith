import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  X,
  ArrowRight,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  Music,
  Activity,
  HardDrive,
  Usb,
  Calendar,
  Check,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_CHANGELOG = [
  {
    version: "v2.4.0",
    date: "August 2026",
    badge: "Major Upgrade",
    items: [
      {
        icon: Layers,
        category: "NEW STUDIO",
        color: "text-neon-green",
        badgeBg: "bg-emerald-950/60 text-neon-green border-neon-green/40",
        title: "3D Exploded Assembly & Stacking Guide (/assembly)",
        description: "Interactive 3D layer explosion slider (0-100%), step-by-step mechanical stacking guide, fastener torque limits, and printable field manual (.md).",
        link: "/assembly",
      },
      {
        icon: Usb,
        category: "NEW STUDIO",
        color: "text-cyan-400",
        badgeBg: "bg-cyan-950/60 text-cyan-300 border-cyan-500/40",
        title: "WebSerial Terminal & MCU Flasher (/serial)",
        description: "Direct in-browser USB serial connection, live ASCII/Hex debug monitor, DTR/RTS signals, and firmware flashing for RP2040, ESP32, and Arduino.",
        link: "/serial",
      },
      {
        icon: Music,
        category: "NEW STUDIO",
        color: "text-rose-400",
        badgeBg: "bg-rose-950/60 text-rose-300 border-rose-500/40",
        title: "Cyberdeck Audio DSP & Chiptune Synth (/synth)",
        description: "16-step tracker chiptune synthesizer with resonant lowpass filter, Cyberpunk musical scales, I2S DAC profiles, and ALSA config export.",
        link: "/synth",
      },
      {
        icon: Activity,
        category: "NEW STUDIO",
        color: "text-neon-green",
        badgeBg: "bg-emerald-950/60 text-neon-green border-neon-green/40",
        title: "Hardware Bus Sniffer & Logic Analyzer (/logic)",
        description: "4-channel digital waveform timing analyzer with protocol decoders for I2C (400kHz), SPI (10MHz), UART (115200), and 1-Wire.",
        link: "/logic",
      },
      {
        icon: Cpu,
        category: "NEW HARDWARE",
        color: "text-amber-400",
        badgeBg: "bg-amber-950/60 text-amber-300 border-amber-500/40",
        title: "112+ Verified Cyberdeck Parts Catalog (/parts)",
        description: "Added StarFive VisionFive 2 RISC-V SBC, Khadas VIM4, 11.9\" Ultrawide Bar Touch LCD, BlackBerry Q10 I2C Keyboard, HackRF One SDR, and SCD41 sensor.",
        link: "/parts",
      },
      {
        icon: ShieldCheck,
        category: "SECURITY",
        color: "text-yellow-400",
        badgeBg: "bg-yellow-950/60 text-yellow-300 border-yellow-500/40",
        title: "Zero-Trust Cryptographic Authentication",
        description: "Salted PBKDF2-SHA512 password hashing (100,000 rounds), constant-time verification against timing attacks, and HMAC-SHA256 session tokens.",
        link: "/settings",
      },
      {
        icon: Sparkles,
        category: "NEW FEATURE",
        color: "text-purple-400",
        badgeBg: "bg-purple-950/60 text-purple-300 border-purple-500/40",
        title: "Mission Guide & Onboarding Wizard v2.0",
        description: "Interactive cyberdeck diagnostic quiz, pocket battery & antenna calculators, and gamified builder achievement badge tracker.",
        link: "/builder",
      },
    ],
  },
];

export default function WhatsNewModal({ isOpen, onClose }: WhatsNewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center text-neon-green">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white uppercase font-mono tracking-wider">
                  What's Newly Added to Decksmith
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-neon-green/10 text-neon-green border border-neon-green/30 font-bold font-mono">
                  v2.4 Live
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">Latest studios, hardware components, and feature releases</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-6 overflow-y-auto space-y-6">
          {RECENT_CHANGELOG.map((rel) => (
            <div key={rel.version} className="space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{rel.version}</span>
                  <span className="text-xs text-gray-500">• {rel.date}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-cyan-400 border border-gray-700">
                  {rel.badge}
                </span>
              </div>

              <div className="space-y-3">
                {rel.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      to={item.link}
                      onClick={() => {
                        soundFx.playClick();
                        onClose();
                      }}
                      className="p-4 rounded-2xl bg-gray-950 border border-gray-800/90 hover:border-neon-green transition-all flex items-start gap-3.5 group block shadow-lg"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center shrink-0 group-hover:border-neon-green transition-colors">
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase ${item.badgeBg}`}>
                            {item.category}
                          </span>
                          <span className="text-[11px] text-neon-green font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Launch <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>

                        <h3 className="text-xs font-bold text-white group-hover:text-neon-green transition-colors">
                          {item.title}
                        </h3>

                        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-950 border-t border-gray-800 flex items-center justify-between">
          <span className="text-[10px] text-gray-500 font-mono">
            Decksmith Open-Source Cyberdeck Workstation
          </span>
          <button
            onClick={() => {
              soundFx.playConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-neon-green text-black font-bold text-xs font-mono hover:bg-neon-green/90"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
