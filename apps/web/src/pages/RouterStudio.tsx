import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Router as RouterIcon,
  Shield,
  Zap,
  Globe,
  Sliders,
  Sparkles,
  Download,
  Copy,
  Check,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  Activity,
  Compass,
  Crosshair,
  Lock,
  ArrowRightLeft,
  Wifi,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface RouterHardware {
  id: string;
  name: string;
  soc: string;
  ramGb: number;
  ports: string;
  maxThroughputGbps: number;
  wireguardSpeedMbps: number;
  powerDrawW: number;
  formFactor: string;
  osOptions: string[];
  description: string;
}

const ROUTER_PLATFORMS: RouterHardware[] = [
  {
    id: "bpi-r4",
    name: "Banana Pi BPI-R4 (10G SFP+ & Wi-Fi 7)",
    soc: "MediaTek MT7988A Quad A73 @ 1.8GHz",
    ramGb: 4,
    ports: "2x 10G SFP+ · 4x 1GbE RJ45 · 1x USB 3.0",
    maxThroughputGbps: 10.0,
    wireguardSpeedMbps: 2400,
    powerDrawW: 14.5,
    formFactor: "Custom Cyber-Chassis / 3D Printed",
    osOptions: ["OpenWrt 24.x", "Alpine Linux", "Debian Router"],
    description: "Flagship 10-Gigabit dual SFP+ fiber router board supporting Wi-Fi 7 BE19000 tri-band NICs.",
  },
  {
    id: "nanopi-r6s",
    name: "FriendlyElec NanoPi R6S (Dual 2.5GbE)",
    soc: "Rockchip RK3588S Octa-Core (4x A76 + 4x A55)",
    ramGb: 8,
    ports: "2x 2.5GbE · 1x 1GbE · 1x USB 3.0 · HDMI 8K",
    maxThroughputGbps: 2.5,
    wireguardSpeedMbps: 1850,
    powerDrawW: 8.5,
    formFactor: "CNC Anodized Metal Armor Case",
    osOptions: ["FriendlyWrt (OpenWrt)", "Armbian", "Ubuntu Core"],
    description: "High-performance edge firewall and VPN gateway powered by 8nm RK3588S with NPU acceleration.",
  },
  {
    id: "intel-n100",
    name: "Intel N100 Quad 2.5GbE Firewall Appliance",
    soc: "Intel N100 Quad-Core (Alder Lake-N @ 3.4GHz)",
    ramGb: 16,
    ports: "4x Intel i226-V 2.5GbE · 2x USB 3.2 · NVMe M.2",
    maxThroughputGbps: 2.5,
    wireguardSpeedMbps: 2200,
    powerDrawW: 12.0,
    formFactor: "Passive Fanless Fin Chassis",
    osOptions: ["pfSense CE / Plus", "OPNsense 24.x", "Proxmox VE + OpenWrt", "VyOS"],
    description: "x86 enterprise security powerhouse with hardware AES-NI encryption, Suricata IDS/IPS, and ZFS root.",
  },
  {
    id: "cm4-dual-eth",
    name: "Raspberry Pi CM4 Dual Gigabit Gateway",
    soc: "Broadcom BCM2711 Quad A72 @ 1.5GHz",
    ramGb: 4,
    ports: "2x 1GbE RJ45 · Dual SMA RP-SMA · 1x USB 2.0",
    maxThroughputGbps: 1.0,
    wireguardSpeedMbps: 420,
    powerDrawW: 6.0,
    formFactor: "Rugged Aluminum Modular Carrier",
    osOptions: ["OpenWrt for CM4", "DietPi", "Raspberry Pi OS Router"],
    description: "Compact, ultra-low power travel router with native PCIe gigabit ethernet and dual internal Wi-Fi antennas.",
  },
  {
    id: "gl-mt3000",
    name: "GL.iNet GL-MT3000 Beryl AX Travel Gateway",
    soc: "MediaTek MT7981B Dual A53 @ 1.3GHz",
    ramGb: 0.5,
    ports: "1x 2.5GbE WAN · 1x 1GbE LAN · Wi-Fi 6 AX3000",
    maxThroughputGbps: 2.5,
    wireguardSpeedMbps: 300,
    powerDrawW: 4.5,
    formFactor: "Pocket Folding Travel Enclosure",
    osOptions: ["OpenWrt GL.iNet Edition", "Vanilla OpenWrt"],
    description: "Pocket-sized hotel and field gateway with captive portal bypass, Tor routing, and physical privacy toggle.",
  },
];

export default function RouterStudio() {
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>("nanopi-r6s");
  const [wanSpeedMbps, setWanSpeedMbps] = useState<number>(1000); // 100M - 10000M
  const [enableCakeSqm, setEnableCakeSqm] = useState<boolean>(true);
  const [enableHardwareOffload, setEnableHardwareOffload] = useState<boolean>(true);
  const [enableWireguardVpn, setEnableWireguardVpn] = useState<boolean>(true);
  const [enableIsolatedIotVlan, setEnableIsolatedIotVlan] = useState<boolean>(true);
  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);

  const selectedPlatform = ROUTER_PLATFORMS.find((p) => p.id === selectedPlatformId) || ROUTER_PLATFORMS[0];

  // Router Benchmark Calculations
  const routerMetrics = useMemo(() => {
    // Max achievable NAT throughput capped by WAN speed and port limit
    const portCapMbps = selectedPlatform.maxThroughputGbps * 1000;
    const effectiveWanMbps = Math.min(wanSpeedMbps, portCapMbps);

    // WireGuard speed calculation
    const maxWgSpeed = Math.min(selectedPlatform.wireguardSpeedMbps, effectiveWanMbps);

    // Cake SQM CPU overhead
    const sqmCpuLoadPct = enableCakeSqm ? Math.min(65, Math.round((effectiveWanMbps / portCapMbps) * 45)) : 5;

    // Concurrent states calculation based on RAM (approx. 100k states per GB)
    const concurrentStates = selectedPlatform.ramGb >= 1 ? selectedPlatform.ramGb * 125000 : 65000;

    return {
      effectiveWanMbps,
      maxWgSpeed,
      sqmCpuLoadPct,
      concurrentStates,
      isWanThrottledByPort: wanSpeedMbps > portCapMbps,
    };
  }, [selectedPlatform, wanSpeedMbps, enableCakeSqm]);

  // OpenWrt UCI Configuration Generator
  const uciNetworkConfig = useMemo(() => {
    return `# /etc/config/network
# Generated by Decksmith Custom Router Studio
# Platform: ${selectedPlatform.name}

config interface 'loopback'
    option device 'lo'
    option proto 'static'
    option ipaddr '127.0.0.1'
    option netmask '255.0.0.0'

config device
    option name 'br-lan'
    option type 'bridge'
    list ports 'eth1'
    ${selectedPlatform.ports.includes("4x") ? "list ports 'eth2'\n    list ports 'eth3'" : ""}

config interface 'lan'
    option device 'br-lan'
    option proto 'static'
    option ipaddr '192.168.1.1'
    option netmask '255.255.255.0'

config interface 'wan'
    option device 'eth0'
    option proto 'dhcp'
    ${enableHardwareOffload ? "option flow_offloading '1'\n    option flow_offloading_hw '1'" : ""}

${
  enableIsolatedIotVlan
    ? `config interface 'iot'
    option proto 'static'
    option ipaddr '192.168.30.1'
    option netmask '255.255.255.0'
    option isolate '1'`
    : ""
}

${
  enableWireguardVpn
    ? `config interface 'wg0'
    option proto 'wireguard'
    option private_key 'AABBCCDDEEFF...'
    list addresses '10.8.0.2/24'
    option listen_port '51820'`
    : ""
}
`;
  }, [selectedPlatform, enableHardwareOffload, enableIsolatedIotVlan, enableWireguardVpn]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              OpenWrt · pfSense · 10G SFP+ Gateway Studio
            </span>
            <span className="text-xs font-mono text-neon-green">WireGuard Benchmarks · Cake SQM · UCI Config Generator</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <RouterIcon className="w-7 h-7 text-cyan-400" />
            Custom Router & Firewall Gateway Studio
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Architect custom OpenWrt and pfSense router builds, benchmark multi-gigabit throughput and WireGuard VPN tunnels, configure isolated IoT VLANs, and export UCI network scripts.
          </p>
        </div>

        {/* Cross-Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/power"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            Power Delivery Studio
          </Link>
          <Link
            to="/harness"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Wiring Loom Studio
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Max NAT Routing Throughput</span>
          <div className="text-2xl font-black text-cyan-400 font-mono">
            {routerMetrics.effectiveWanMbps >= 1000
              ? `${(routerMetrics.effectiveWanMbps / 1000).toFixed(1)} Gbps`
              : `${routerMetrics.effectiveWanMbps} Mbps`}
          </div>
          <span className="text-xs text-gray-400 font-mono">
            Ports: {selectedPlatform.ports.split("·")[0]}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">WireGuard VPN Speed</span>
          <div className="text-2xl font-black text-neon-green font-mono">{routerMetrics.maxWgSpeed} Mbps</div>
          <span className="text-xs text-gray-400 font-mono">Crypto: ChaCha20-Poly1305 HW</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Cake SQM CPU Overhead</span>
          <div className="text-2xl font-black text-yellow-400 font-mono">{routerMetrics.sqmCpuLoadPct}% Load</div>
          <span className="text-xs text-gray-400 font-mono">Bufferbloat Grade A+ Active</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Max NAT State Table</span>
          <div className="text-2xl font-black text-purple-400 font-mono">{routerMetrics.concurrentStates.toLocaleString()} States</div>
          <span className="text-xs text-gray-400 font-mono">{selectedPlatform.ramGb}GB RAM ({selectedPlatform.powerDrawW}W TDP)</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Platform Selection & Network Features */}
        <div className="lg:col-span-7 bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              1. Router Hardware Platform
            </h3>
            <span className="text-xs text-gray-400 font-mono">Selected: {selectedPlatform.name.split(" ")[0]}</span>
          </div>

          {/* Platform Cards */}
          <div className="space-y-2.5">
            {ROUTER_PLATFORMS.map((platform) => (
              <div
                key={platform.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedPlatformId(platform.id);
                }}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedPlatformId === platform.id
                    ? "border-cyan-400 bg-cyan-950/40 text-white font-bold shadow-md shadow-cyan-400/20"
                    : "border-gray-800 bg-gray-950/60 text-gray-300 hover:border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-bold text-sm">{platform.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-neon-green">
                    {platform.maxThroughputGbps} Gbps Max
                  </span>
                </div>
                <div className="text-[11px] text-cyan-300 font-mono mb-1">{platform.soc} · {platform.ramGb}GB RAM</div>
                <p className="text-[11px] text-gray-400 font-normal">{platform.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {platform.osOptions.map((os, i) => (
                    <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-gray-900 border border-gray-800 text-gray-400">
                      {os}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Network Features & WAN Speed Slider */}
          <div className="space-y-4 pt-4 border-t border-gray-800">
            <h4 className="text-xs font-mono font-bold text-gray-300 uppercase">WAN Bandwidth & Acceleration Toggles</h4>

            {/* WAN Speed Slider */}
            <div className="p-3.5 bg-gray-950 rounded-xl border border-gray-800 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-300">ISP WAN Uplink Speed</span>
                <span className="text-cyan-400 font-bold">
                  {wanSpeedMbps >= 1000 ? `${(wanSpeedMbps / 1000).toFixed(1)} Gbps` : `${wanSpeedMbps} Mbps`}
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={10000}
                step={100}
                value={wanSpeedMbps}
                onChange={(e) => setWanSpeedMbps(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Feature Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setEnableHardwareOffload((prev) => !prev);
                }}
                className={`p-3 rounded-xl border text-xs font-mono text-left flex items-center justify-between transition-all ${
                  enableHardwareOffload
                    ? "border-neon-green bg-emerald-950/40 text-white"
                    : "border-gray-800 bg-gray-950 text-gray-400"
                }`}
              >
                <div>
                  <div className="font-bold">Hardware Flow Offload (SFO)</div>
                  <div className="text-[10px] text-gray-400">Bypasses Linux netfilter stack for 0% CPU load</div>
                </div>
                {enableHardwareOffload ? <Check className="w-4 h-4 text-neon-green" /> : <div className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setEnableCakeSqm((prev) => !prev);
                }}
                className={`p-3 rounded-xl border text-xs font-mono text-left flex items-center justify-between transition-all ${
                  enableCakeSqm
                    ? "border-yellow-400 bg-yellow-950/40 text-white"
                    : "border-gray-800 bg-gray-950 text-gray-400"
                }`}
              >
                <div>
                  <div className="font-bold">Cake SQM Qdisc</div>
                  <div className="text-[10px] text-gray-400">Eliminates bufferbloat lag for low-ping gaming</div>
                </div>
                {enableCakeSqm ? <Check className="w-4 h-4 text-yellow-400" /> : <div className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setEnableWireguardVpn((prev) => !prev);
                }}
                className={`p-3 rounded-xl border text-xs font-mono text-left flex items-center justify-between transition-all ${
                  enableWireguardVpn
                    ? "border-purple-400 bg-purple-950/40 text-white"
                    : "border-gray-800 bg-gray-950 text-gray-400"
                }`}
              >
                <div>
                  <div className="font-bold">WireGuard VPN Gateway</div>
                  <div className="text-[10px] text-gray-400">Roadwarrior encrypted mesh tunnels</div>
                </div>
                {enableWireguardVpn ? <Check className="w-4 h-4 text-purple-400" /> : <div className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setEnableIsolatedIotVlan((prev) => !prev);
                }}
                className={`p-3 rounded-xl border text-xs font-mono text-left flex items-center justify-between transition-all ${
                  enableIsolatedIotVlan
                    ? "border-cyan-400 bg-cyan-950/40 text-white"
                    : "border-gray-800 bg-gray-950 text-gray-400"
                }`}
              >
                <div>
                  <div className="font-bold">Isolated IoT / Camera VLAN</div>
                  <div className="text-[10px] text-gray-400">Blocks smart home devices from accessing LAN</div>
                </div>
                {enableIsolatedIotVlan ? <Check className="w-4 h-4 text-cyan-400" /> : <div className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right: OpenWrt UCI Network & Firewall Script Exporter */}
        <div className="lg:col-span-5 space-y-6">
          {/* Topology Spec Card */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-3 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase">
              <Layers className="w-4 h-4 text-cyan-400" />
              Interface & Port Assignment
            </h3>
            <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400">WAN Interface:</span>
                <span className="text-cyan-300 font-bold">eth0 (DHCP Client / 10G SFP+)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">LAN Bridge (br-lan):</span>
                <span className="text-neon-green font-bold">192.168.1.1/24</span>
              </div>
              {enableIsolatedIotVlan && (
                <div className="flex justify-between">
                  <span className="text-gray-400">IoT Isolated VLAN 30:</span>
                  <span className="text-yellow-400 font-bold">192.168.30.1/24</span>
                </div>
              )}
              {enableWireguardVpn && (
                <div className="flex justify-between">
                  <span className="text-gray-400">WireGuard (wg0):</span>
                  <span className="text-purple-400 font-bold">10.8.0.1/24 (:51820)</span>
                </div>
              )}
            </div>
          </div>

          {/* UCI Config Exporter */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                /etc/config/network (UCI)
              </h3>
              <button
                onClick={() => {
                  soundFx.playConfirm();
                  navigator.clipboard.writeText(uciNetworkConfig);
                  setCopiedConfig(true);
                  setTimeout(() => setCopiedConfig(false), 2000);
                }}
                className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-mono flex items-center gap-1"
              >
                {copiedConfig ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
                {copiedConfig ? "Copied" : "Copy"}
              </button>
            </div>

            <pre className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed select-all max-h-72">
              {uciNetworkConfig}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
