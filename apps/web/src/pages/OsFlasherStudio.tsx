import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  HardDrive,
  Download,
  Terminal,
  Cpu,
  Monitor,
  Wifi,
  Key,
  Layers,
  Sparkles,
  Check,
  Radio,
  FileCode,
  Shield,
  Zap,
  RotateCw,
  RefreshCw,
  Compass,
  Crosshair,
} from "lucide-react";

interface OsProfile {
  id: string;
  name: string;
  category: "General" | "Security" | "Lightweight" | "AirGap";
  baseImage: string;
  recommendedSbc: string;
  description: string;
  kernelVersion: string;
}

const OS_PROFILES: OsProfile[] = [
  {
    id: "raspios-64-lite",
    name: "Raspberry Pi OS (64-bit Lite)",
    category: "General",
    baseImage: "Debian 12 Bookworm",
    recommendedSbc: "Raspberry Pi 5 / 4",
    description: "Official Raspberry Pi OS. Maximum hardware compatibility and lowest background RAM usage.",
    kernelVersion: "Linux 6.6+ kernel with v3d acceleration",
  },
  {
    id: "kali-arm",
    name: "Kali Linux ARM 2026",
    category: "Security",
    baseImage: "Kali Rolling ARM64",
    recommendedSbc: "Raspberry Pi 5 / 4 / Orange Pi 5",
    description: "Cybersecurity & penetration testing platform with pre-packaged SDR, Wi-Fi auditing, and packet analysis tools.",
    kernelVersion: "Custom kernel with Wi-Fi monitor mode & packet injection",
  },
  {
    id: "dietpi",
    name: "DietPi Minimalist (30MB RAM)",
    category: "Lightweight",
    baseImage: "DietPi OS",
    recommendedSbc: "Raspberry Pi Zero 2 W / 4 / 5",
    description: "Ultra-lean OS optimized for CPU performance, low thermals, and extended battery runtimes.",
    kernelVersion: "Stripped kernel with ramlog optimization",
  },
  {
    id: "alpine-linux",
    name: "Alpine Linux (Air-Gapped)",
    category: "AirGap",
    baseImage: "Alpine Linux 3.20 (musl)",
    recommendedSbc: "Raspberry Pi Zero 2 W / Pi 4",
    description: "Diskless in-memory execution mode. Zero flash wear and total data destruction on power cut.",
    kernelVersion: "Hardened musl kernel",
  },
  {
    id: "armbian-bookworm",
    name: "Armbian Linux (Rockchip / RK3588)",
    category: "General",
    baseImage: "Armbian 24 Bookworm",
    recommendedSbc: "Orange Pi 5 / Radxa Rock 5B",
    description: "Optimized for high-performance Rockchip NPU hardware, multi-core encoding, and PCIe NVMe boot.",
    kernelVersion: "Rockchip BSP 6.1 kernel with Panfrost GPU",
  },
];

interface DisplayPreset {
  id: string;
  name: string;
  resolution: string;
  interfaceType: "HDMI" | "DSI" | "SPI" | "DPI";
  width: number;
  height: number;
  hdmiGroup: number;
  hdmiMode: number;
  hdmiTimings: string;
}

const DISPLAY_PRESETS: DisplayPreset[] = [
  {
    id: "waveshare-11-9",
    name: "Waveshare 11.9\" Ultrawide Bar (320x1480)",
    resolution: "320 × 1480 @ 60Hz",
    interfaceType: "HDMI",
    width: 320,
    height: 1480,
    hdmiGroup: 2,
    hdmiMode: 87,
    hdmiTimings: "320 0 100 32 48 1480 0 10 2 20 0 0 0 60 0 38000000 3",
  },
  {
    id: "waveshare-8-8",
    name: "Waveshare 8.8\" Ultrawide Bar (480x1920)",
    resolution: "480 × 1920 @ 60Hz",
    interfaceType: "HDMI",
    width: 480,
    height: 1920,
    hdmiGroup: 2,
    hdmiMode: 87,
    hdmiTimings: "480 0 30 30 30 1920 0 10 10 10 0 0 0 60 0 65000000 3",
  },
  {
    id: "waveshare-10-1-fhd",
    name: "Waveshare 10.1\" IPS (1920x1200)",
    resolution: "1920 × 1200 @ 60Hz",
    interfaceType: "HDMI",
    width: 1920,
    height: 1200,
    hdmiGroup: 2,
    hdmiMode: 68,
    hdmiTimings: "",
  },
  {
    id: "waveshare-5-5-amoled",
    name: "Waveshare 5.5\" AMOLED (1080x1920)",
    resolution: "1080 × 1920 @ 60Hz",
    interfaceType: "HDMI",
    width: 1080,
    height: 1920,
    hdmiGroup: 2,
    hdmiMode: 87,
    hdmiTimings: "1080 0 40 10 40 1920 0 10 4 10 0 0 0 60 0 148000000 3",
  },
  {
    id: "waveshare-4-0-square",
    name: "Waveshare 4.0\" 720x720 Square Touch",
    resolution: "720 × 720 @ 60Hz",
    interfaceType: "DSI",
    width: 720,
    height: 720,
    hdmiGroup: 2,
    hdmiMode: 87,
    hdmiTimings: "720 0 50 20 40 720 0 10 5 10 0 0 0 60 0 36000000 3",
  },
  {
    id: "generic-1080p",
    name: "Standard Full HD (1920x1080)",
    resolution: "1920 × 1080 @ 60Hz",
    interfaceType: "HDMI",
    width: 1920,
    height: 1080,
    hdmiGroup: 1,
    hdmiMode: 16,
    hdmiTimings: "",
  },
];

export default function OsFlasherStudio() {
  const [selectedOsId, setSelectedOsId] = useState<string>("raspios-64-lite");
  const [selectedDisplayId, setSelectedDisplayId] = useState<string>("waveshare-11-9");
  const [displayRotation, setDisplayRotation] = useState<0 | 90 | 180 | 270>(270);
  const [hostname, setHostname] = useState<string>("deck-shadow-01");
  const [username, setUsername] = useState<string>("deck");
  const [password, setPassword] = useState<string>("cyberdeck");
  const [wifiSsid, setWifiSsid] = useState<string>("CYBERDECK-FIELD-NET");
  const [wifiPassword, setWifiPassword] = useState<string>("hacktheplanet");
  const [sshPublicKey, setSshPublicKey] = useState<string>("");

  // Hardware Overlays
  const [enableI2C, setEnableI2C] = useState<boolean>(true);
  const [enableSPI, setEnableSPI] = useState<boolean>(true);
  const [enableUART, setEnableUART] = useState<boolean>(true);
  const [enablePwmFan, setEnablePwmFan] = useState<boolean>(true);

  // Kiosk Auto-Start Preset
  const [kioskPreset, setKioskPreset] = useState<"BTOP_DASH" | "EPY_READER" | "GQRX_SDR" | "MESHTASTIC" | "WEB_KIOSK">("BTOP_DASH");
  const [kioskWebUrl, setKioskWebUrl] = useState<string>("http://localhost:3000");

  // Active Code Tab
  const [activeCodeTab, setActiveCodeTab] = useState<"config" | "cmdline" | "cloudinit" | "script">("config");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const selectedOs = OS_PROFILES.find((o) => o.id === selectedOsId) || OS_PROFILES[0];
  const selectedDisplay = DISPLAY_PRESETS.find((d) => d.id === selectedDisplayId) || DISPLAY_PRESETS[0];

  // Generated config.txt
  const generatedConfigTxt = useMemo(() => {
    const lines = [
      "# ================================================================",
      "# DECKSMITH AUTOGENERATED /boot/firmware/config.txt",
      `# OS: ${selectedOs.name}`,
      `# Display: ${selectedDisplay.name}`,
      `# Generated: ${new Date().toISOString()}`,
      "# ================================================================",
      "",
      "# --- SYSTEM & MEMORY ---",
      "arm_64bit=1",
      "disable_overscan=1",
      "gpu_mem=128",
      "dtoverlay=vc4-kms-v3d",
      "max_framebuffers=2",
      "",
      "# --- HARDWARE BUS OVERLAYS ---",
      enableI2C ? "dtparam=i2c_arm=on" : "# dtparam=i2c_arm=off",
      enableSPI ? "dtparam=spi=on" : "# dtparam=spi=off",
      enableUART ? "enable_uart=1" : "# enable_uart=0",
      enablePwmFan ? "dtoverlay=pwm-fan,gpiopin=18,temp=55000" : "",
      "",
      "# --- CYBERDECK DISPLAY MODELINE ---",
      "hdmi_force_hotplug=1",
      `hdmi_group=${selectedDisplay.hdmiGroup}`,
      `hdmi_mode=${selectedDisplay.hdmiMode}`,
      "hdmi_drive=2",
    ];

    if (selectedDisplay.hdmiTimings) {
      lines.push(`hdmi_timings=${selectedDisplay.hdmiTimings}`);
      lines.push("hdmi_pixel_encoding=2");
    }

    if (displayRotation !== 0) {
      lines.push(`display_rotate=${displayRotation === 90 ? 1 : displayRotation === 180 ? 2 : displayRotation === 270 ? 3 : 0}`);
    }

    return lines.filter(Boolean).join("\n");
  }, [selectedOs, selectedDisplay, displayRotation, enableI2C, enableSPI, enableUART, enablePwmFan]);

  // Generated cmdline.txt
  const generatedCmdlineTxt = useMemo(() => {
    const rotVal = displayRotation === 90 ? 1 : displayRotation === 180 ? 2 : displayRotation === 270 ? 3 : 0;
    return `console=serial0,115200 console=tty1 root=PARTUUID=auto rootfstype=ext4 fsck.repair=yes rootwait fbcon=rotate:${rotVal} quiet splash plymouth.ignore-serial-consoles`;
  }, [displayRotation]);

  // Generated cloud-init user-data
  const generatedCloudInit = useMemo(() => {
    return `#cloud-config
# Decksmith Zero-Touch Cloud-Init Provisioning
hostname: ${hostname}
manage_etc_hosts: true

users:
  - name: ${username}
    gecos: Cyberdeck Field Operator
    sudo: ALL=(ALL) NOPASSWD:ALL
    groups: sudo, dialout, audio, video, input, gpio, i2c, spi
    shell: /bin/bash
    plain_text_passwd: ${password}
    lock_passwd: false
    ${
      sshPublicKey
        ? `ssh_authorized_keys:
      - ${sshPublicKey}`
        : ""
    }

${
  wifiSsid
    ? `wifis:
  wlan0:
    access-points:
      "${wifiSsid}":
        password: "${wifiPassword}"
    dhcp4: true
`
    : ""
}

package_update: true
packages:
  - btop
  - git
  - curl
  - htop
  - tmux
  - python3-pip
  - i2c-tools
  - rtl-sdr
  - wireguard

runcmd:
  - [ bash, -c, "echo 'Decksmith provision complete' > /var/log/decksmith.log" ]
`;
  }, [hostname, username, password, sshPublicKey, wifiSsid, wifiPassword]);

  // Generated First-Boot Bash Script
  const generatedFirstBootScript = useMemo(() => {
    return `#!/usr/bin/env bash
# ================================================================
# DECKSMITH FIRST-BOOT CYBERDECK PROVISIONING SCRIPT
# Hostname: ${hostname}
# Target OS: ${selectedOs.name}
# ================================================================
set -euo pipefail

echo "⚡ [DECKSMITH] Starting Cyberdeck Hardware Initialization..."

# 1. Expand Root Filesystem
raspi-config --expand-rootfs || true

# 2. Configure Hostname
hostnamectl set-hostname "${hostname}"
echo "127.0.1.1 ${hostname}" >> /etc/hosts

# 3. Enable Hardware Interfaces
raspi-config nonint do_i2c 0
raspi-config nonint do_spi 0
raspi-config nonint do_serial_hw 0
raspi-config nonint do_ssh 0

# 4. Configure Kiosk Mode: ${kioskPreset}
mkdir -p /home/${username}/.config/autostart

echo "✅ [DECKSMITH] Cyberdeck Provisioning Completed."
`;
  }, [hostname, selectedOs, username, kioskPreset]);

  const activeCodeContent = useMemo(() => {
    switch (activeCodeTab) {
      case "config":
        return generatedConfigTxt;
      case "cmdline":
        return generatedCmdlineTxt;
      case "cloudinit":
        return generatedCloudInit;
      case "script":
        return generatedFirstBootScript;
    }
  }, [activeCodeTab, generatedConfigTxt, generatedCmdlineTxt, generatedCloudInit, generatedFirstBootScript]);

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCodeContent);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neon-green/10 text-neon-green border border-neon-green/30">
              Phase 2: OS Provisioning Studio
            </span>
            <span className="text-xs font-mono text-gray-500">Zero-Config Field Boot</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <HardDrive className="w-7 h-7 text-neon-green" />
            OS Image Customizer & Flasher Companion
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Auto-generate custom display modelines, headless Wi-Fi/SSH credentials, hardware bus overlays, and kiosk mode dashboards for instant first-boot.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/builder"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-neon-green" />
            Blueprint Studio
          </Link>
          <Link
            to="/cad"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            CAD / CNC Studio
          </Link>
          <button
            onClick={() => downloadFile("decksmith-setup.sh", generatedFirstBootScript, "text/x-shellscript")}
            className="px-3.5 py-2 rounded-lg bg-neon-green hover:bg-emerald-400 text-gray-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-neon-green/20"
          >
            <Download className="w-3.5 h-3.5" />
            Download Provisioning Package
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Setup */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. Target OS Selection */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-neon-green" />
              1. Choose Target OS & Distribution
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {OS_PROFILES.map((os) => (
                <div
                  key={os.id}
                  onClick={() => setSelectedOsId(os.id)}
                  className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedOsId === os.id
                      ? "border-neon-green bg-emerald-950/30 text-white font-bold"
                      : "border-gray-800 bg-gray-950/60 text-gray-300 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-bold">{os.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-neon-green">
                      {os.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-normal">{os.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Display Modelines & Timing */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Monitor className="w-4 h-4 text-cyan-400" />
              2. Display Hardware & Modeline Auto-Timing
            </h3>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5">Cyberdeck Display Model</label>
              <select
                value={selectedDisplayId}
                onChange={(e) => setSelectedDisplayId(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-xs text-cyan-300 font-bold focus:outline-none"
              >
                {DISPLAY_PRESETS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.resolution})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5">Screen Rotation / Orientation</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { rot: 0, label: "0° (Default)" },
                  { rot: 90, label: "90° (Portrait)" },
                  { rot: 180, label: "180° (Inverted)" },
                  { rot: 270, label: "270° (Landscape)" },
                ].map((r) => (
                  <button
                    key={r.rot}
                    onClick={() => setDisplayRotation(r.rot as any)}
                    className={`py-2 px-2 rounded-lg text-center font-mono text-xs transition-colors ${
                      displayRotation === r.rot
                        ? "bg-cyan-500 text-gray-950 font-bold shadow-md shadow-cyan-500/20"
                        : "bg-gray-950 border border-gray-800 text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hardware Bus Toggles */}
            <div className="pt-2 border-t border-gray-800/80">
              <span className="block text-xs font-mono text-gray-400 mb-2">Enable Hardware Bus Drivers</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded bg-gray-950 border border-gray-800 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableI2C}
                    onChange={(e) => setEnableI2C(e.target.checked)}
                    className="accent-cyan-400"
                  />
                  I2C (Trackpads/Sensors)
                </label>
                <label className="flex items-center gap-2 p-2 rounded bg-gray-950 border border-gray-800 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableSPI}
                    onChange={(e) => setEnableSPI(e.target.checked)}
                    className="accent-cyan-400"
                  />
                  SPI (LoRa/Displays)
                </label>
                <label className="flex items-center gap-2 p-2 rounded bg-gray-950 border border-gray-800 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableUART}
                    onChange={(e) => setEnableUART(e.target.checked)}
                    className="accent-cyan-400"
                  />
                  UART Serial Console
                </label>
                <label className="flex items-center gap-2 p-2 rounded bg-gray-950 border border-gray-800 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enablePwmFan}
                    onChange={(e) => setEnablePwmFan(e.target.checked)}
                    className="accent-cyan-400"
                  />
                  PWM Active Cooling Fan
                </label>
              </div>
            </div>
          </div>

          {/* 3. Field Network & Credentials */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wifi className="w-4 h-4 text-yellow-400" />
              3. Field Wi-Fi, SSH & System Credentials
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-mono text-gray-400 mb-1">Hostname</label>
                <input
                  type="text"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-1.5 font-mono text-white"
                />
              </div>
              <div>
                <label className="block font-mono text-gray-400 mb-1">User Account</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-1.5 font-mono text-white"
                />
              </div>
              <div>
                <label className="block font-mono text-gray-400 mb-1">Field Wi-Fi SSID</label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-1.5 font-mono text-white"
                />
              </div>
              <div>
                <label className="block font-mono text-gray-400 mb-1">Wi-Fi Password</label>
                <input
                  type="password"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-1.5 font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-gray-400 mb-1">SSH Public Key (for Key-Only Auth)</label>
              <input
                type="text"
                value={sshPublicKey}
                onChange={(e) => setSshPublicKey(e.target.value)}
                placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5..."
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-1.5 font-mono text-xs text-cyan-300"
              />
            </div>
          </div>

          {/* 4. Cyberdeck Kiosk Auto-Start */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              4. Cyberdeck Kiosk & HUD Boot Mode
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: "BTOP_DASH", name: "btop System Telemetry HUD" },
                { id: "EPY_READER", name: "epy Cyberpunk E-Reader" },
                { id: "GQRX_SDR", name: "GQRX Signal Scope" },
                { id: "MESHTASTIC", name: "Meshtastic LoRa Terminal" },
                { id: "WEB_KIOSK", name: "Fullscreen Web App Kiosk" },
              ].map((k) => (
                <button
                  key={k.id}
                  onClick={() => setKioskPreset(k.id as any)}
                  className={`p-2.5 rounded-lg border text-left font-mono transition-all ${
                    kioskPreset === k.id
                      ? "border-purple-400 bg-purple-950/40 text-purple-200 font-bold"
                      : "border-gray-800 bg-gray-950 text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {k.name}
                </button>
              ))}
            </div>

            {kioskPreset === "WEB_KIOSK" && (
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Kiosk Target URL</label>
                <input
                  type="text"
                  value={kioskWebUrl}
                  onChange={(e) => setKioskWebUrl(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-1.5 font-mono text-xs text-purple-300"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Generator Preview */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4 shadow-2xl">
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setActiveCodeTab("config")}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors ${
                    activeCodeTab === "config" ? "bg-cyan-500 text-gray-950" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  config.txt
                </button>
                <button
                  onClick={() => setActiveCodeTab("cmdline")}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors ${
                    activeCodeTab === "cmdline" ? "bg-cyan-500 text-gray-950" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  cmdline.txt
                </button>
                <button
                  onClick={() => setActiveCodeTab("cloudinit")}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors ${
                    activeCodeTab === "cloudinit" ? "bg-cyan-500 text-gray-950" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  user-data
                </button>
                <button
                  onClick={() => setActiveCodeTab("script")}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors ${
                    activeCodeTab === "script" ? "bg-neon-green text-gray-950" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  setup.sh
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-mono flex items-center gap-1"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-neon-green" /> : null}
                  {copiedCode ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={() =>
                    downloadFile(
                      activeCodeTab === "config"
                        ? "config.txt"
                        : activeCodeTab === "cmdline"
                        ? "cmdline.txt"
                        : activeCodeTab === "cloudinit"
                        ? "user-data"
                        : "decksmith-setup.sh",
                      activeCodeContent,
                      "text/plain"
                    )
                  }
                  className="px-2.5 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-xs text-gray-950 font-bold flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Save
                </button>
              </div>
            </div>

            {/* Code Display */}
            <pre className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed max-h-[600px] select-all">
              {activeCodeContent}
            </pre>
          </div>

          {/* Flash Instructions Card */}
          <div className="p-5 rounded-xl bg-gray-900/60 border border-gray-800 space-y-3 text-xs text-gray-300">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-neon-green" />
              How to Flash Your Cyberdeck MicroSD / NVMe SSD
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-gray-400 leading-relaxed">
              <li>Flash <strong>{selectedOs.name}</strong> onto your storage drive using Raspberry Pi Imager or BalenaEtcher.</li>
              <li>Mount the drive's <code>bootfs</code> (or <code>/boot/firmware</code>) partition on your computer.</li>
              <li>Replace <code>config.txt</code> and <code>cmdline.txt</code> with the generated files above.</li>
              <li>Insert the drive into your SBC and power on — your cyberdeck display and field network will start automatically!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
