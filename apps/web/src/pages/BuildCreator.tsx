import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Cpu,
  Monitor,
  BatteryCharging,
  Keyboard,
  HardDrive,
  Wifi,
  Eye,
  Box,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Download,
  Share2,
  Trash2,
  Plus,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Sliders,
  DollarSign,
  Layers,
  FileCode,
  Check,
  Radio,
  Clock,
  Weight,
  Flame,
  ShieldCheck,
  ExternalLink,
  Terminal,
  Grid,
  Activity,
  Compass,
  Maximize2,
  Wrench,
  BookmarkPlus,
  HelpCircle,
  Thermometer,
  Crosshair,
  Tag,
} from "lucide-react";
import { API_URL } from "@/lib/config";
import { BUILD_TYPES, PART_CATEGORIES, type PartCategory } from "@decksmith/shared";
import { useAuth } from "../AuthContext";
import { useNotification } from "../NotificationContext";
import { soundFx } from "../lib/soundFx";

interface PartItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  rating: number;
  specs?: Record<string, any>;
  prices: Array<{ price: number; source: string; inStock?: boolean; url?: string }>;
}

interface SelectedSlots {
  sbc?: PartItem;
  display?: PartItem;
  keyboard?: PartItem;
  battery?: PartItem;
  storage?: PartItem;
  network?: PartItem;
  sensor?: PartItem;
  chassis?: PartItem;
  audio?: PartItem;
  cooling?: PartItem;
}

const CATEGORY_SLOTS: Array<{
  key: keyof SelectedSlots;
  category: PartCategory;
  title: string;
  required: boolean;
  icon: any;
}> = [
  { key: "sbc", category: "SBC", title: "Single Board Computer (Brain)", required: true, icon: Cpu },
  { key: "display", category: "DISPLAY", title: "Display / Screen Panel", required: true, icon: Monitor },
  { key: "keyboard", category: "KEYBOARD", title: "Input / Keyboard / Controls", required: false, icon: Keyboard },
  { key: "battery", category: "BATTERY", title: "Power Source / Battery Pack", required: true, icon: BatteryCharging },
  { key: "storage", category: "STORAGE", title: "Storage / SSD / MicroSD", required: false, icon: HardDrive },
  { key: "network", category: "NETWORK", title: "Wireless / Radio / SDR / LoRa", required: false, icon: Wifi },
  { key: "sensor", category: "SENSOR", title: "Sensors & Perception", required: false, icon: Eye },
  { key: "audio", category: "AUDIO", title: "Audio DAC / Microphone", required: false, icon: Radio },
  { key: "cooling", category: "COOLING", title: "Active Cooling & Heatsinks", required: false, icon: Flame },
  { key: "chassis", category: "CASE", title: "Chassis & Enclosure", required: true, icon: Box },
];

const PRESETS: Record<
  string,
  {
    title: string;
    type: string;
    description: string;
    tags: string[];
    slugs: Partial<Record<keyof SelectedSlots, string>>;
  }
> = {
  netrunner: {
    title: "Shadow Netrunner MK-IV",
    type: "Cyberdeck",
    description: "Portable intrusion and signal-hunting terminal with ultrawide bar display, tactile QWERTY keypad, and dual-band Wi-Fi.",
    tags: ["cyberpunk", "ultrawide", "portable", "sdr"],
    slugs: {
      sbc: "raspberry-pi-5",
      display: "waveshare-11-9-bar-touchscreen",
      keyboard: "solder-party-bbq20-keyboard",
      battery: "21700-dual-cell-10000mah-pack",
      chassis: "pelican-1150-rugged-case",
      storage: "sandisk-256gb-sd",
      network: "alfa-awus036ach",
      cooling: "ice-tower-cooler",
    },
  },
  meshtastic: {
    title: "Nomad Off-Grid LoRa Communicator",
    type: "Cyberdeck",
    description: "Ultra-low-power field relay with 915MHz LoRa HAT, 300DPI sunlight-readable E-paper display, and solar charger.",
    tags: ["meshtastic", "lora", "e-paper", "solar", "off-grid"],
    slugs: {
      sbc: "raspberry-pi-zero-2-w",
      display: "2-9-eink-hat",
      keyboard: "solder-party-bbq20-keyboard",
      battery: "bigblue-28w-solar-panel",
      network: "waveshare-sx1262-lora-hat",
      chassis: "custom-3d-printed-clamshell-case",
      sensor: "bosch-bme680-sensor",
      storage: "sandisk-256gb-sd",
    },
  },
  nas: {
    title: "Silent 4-Bay Micro ZFS Server",
    type: "NAS",
    description: "Ultra-reliable mini-ITX private cloud and backup array with 4TB NAS storage drives and PWM cooling.",
    tags: ["nas", "zfs", "truenas", "storage-pool", "raid"],
    slugs: {
      sbc: "raspberry-pi-cm4-8gb-32gb",
      storage: "wd-red-plus-4tb-nas-hdd",
      chassis: "fractal-node-304-mini-itx",
      cooling: "noctua-nf-a8-80mm-fan",
      network: "4port-sata-pcie-asm1064",
    },
  },
  gauntlet: {
    title: "Tactical Armored Wrist Gauntlet Deck",
    type: "Wearable",
    description: "Forearm-mounted tactical computer with high-contrast AMOLED touch display, LTE modem, and 9-DOF motion tracking.",
    tags: ["wearable", "gauntlet", "amoled", "tactical"],
    slugs: {
      sbc: "orange-pi-5",
      display: "waveshare-5-5-amoled-touch",
      battery: "5000mah-lipo",
      chassis: "tactical-armored-gauntlet-enclosure",
      sensor: "bno085-9dof-imu-sensor",
      network: "quectel-ec25-e-4g-gnss",
      storage: "sandisk-256gb-sd",
    },
  },
  sdr: {
    title: "SIGINT Field Spectrum Scanner",
    type: "Cyberdeck",
    description: "Wideband RF interception and SIGINT platform powered by HackRF One (1MHz–6GHz) and high-gain Yagi antenna.",
    tags: ["sdr", "sigint", "hackrf", "rf-scanner"],
    slugs: {
      sbc: "radxa-rock-5b-16gb",
      display: "waveshare-10-1-1920x1200-touch",
      keyboard: "corne-cherry-split-keyboard",
      battery: "anker-737-power-bank-24k",
      network: "hackrf-one-sdr-transceiver",
      chassis: "pelican-1200-field-enclosure",
      storage: "samsung-870-qvo-2tb-sata-ssd",
    },
  },
};

export default function BuildCreator() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { dispatchToast } = useNotification();
  const [allParts, setAllParts] = useState<PartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlots>({});
  const [activeSlot, setActiveSlot] = useState<keyof SelectedSlots>("sbc");

  // Build Meta
  const [title, setTitle] = useState("Shadow Netrunner MK-IV");
  const [buildType, setBuildType] = useState<string>("Cyberdeck");
  const [description, setDescription] = useState(
    "Portable intrusion and signal-hunting terminal with ultrawide bar display, tactile QWERTY keypad, and dual-band Wi-Fi."
  );
  const [tagsInput, setTagsInput] = useState("cyberpunk, ultrawide, portable, sdr");

  // Simulation Sliders
  const [cpuUsagePercent, setCpuUsagePercent] = useState<number>(45); // 0 - 100%
  const [brightnessPercent, setBrightnessPercent] = useState<number>(75); // 10 - 100%
  const [activeRadios, setActiveRadios] = useState<boolean>(true);
  const [ambientTempC, setAmbientTempC] = useState<number>(22);

  // UI state
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<"builder" | "canvas" | "gpio" | "telemetry" | "config" | "script" | "bom">("builder");

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/parts`);
        if (res.ok) {
          const data: PartItem[] = await res.json();
          setAllParts(data);

          const params = new URLSearchParams(window.location.search);
          if (params.get("title")) setTitle(params.get("title")!);
          if (params.get("type")) setBuildType(params.get("type")!);

          // Check direct slot query params
          const slotKeys: (keyof SelectedSlots)[] = ["sbc", "display", "keyboard", "battery", "storage", "network", "sensor", "chassis", "audio", "cooling"];
          const urlSlots: SelectedSlots = {};
          let hasUrlSlots = false;
          for (const k of slotKeys) {
            const slug = params.get(k);
            if (slug) {
              const matched = data.find((p) => p.slug === slug);
              if (matched) {
                urlSlots[k] = matched;
                hasUrlSlots = true;
              }
            }
          }
          if (hasUrlSlots) {
            setSelectedSlots(urlSlots);
            return;
          }

          const forkSlug = params.get("fork");
          if (forkSlug) {
            try {
              const buildRes = await fetch(`${API_URL}/api/builds/${forkSlug}`);
              if (buildRes.ok) {
                const buildData = await buildRes.json();
                setTitle(`${buildData.title} (Fork)`);
                setBuildType(buildData.type || "Cyberdeck");
                setDescription(buildData.description || "");
                setTagsInput((buildData.tags || []).join(", "));
                const forkedSlots: SelectedSlots = {};
                for (const bp of buildData.parts || []) {
                  const part = bp.part;
                  if (!part) continue;
                  const cat = part.category?.toLowerCase();
                  if (cat === "sbc") forkedSlots.sbc = part;
                  else if (cat === "display") forkedSlots.display = part;
                  else if (cat === "keyboard" || cat === "input") forkedSlots.keyboard = part;
                  else if (cat === "battery" || cat === "power") forkedSlots.battery = part;
                  else if (cat === "storage") forkedSlots.storage = part;
                  else if (cat === "wireless" || cat === "network") forkedSlots.network = part;
                  else if (cat === "chassis" || cat === "case") forkedSlots.chassis = part;
                  else if (cat === "cooling") forkedSlots.cooling = part;
                  else if (cat === "sensor") forkedSlots.sensor = part;
                  else if (cat === "audio") forkedSlots.audio = part;
                }
                setSelectedSlots(forkedSlots);
                return;
              }
            } catch {
              // fallback
            }
          }

          // Apply Default Preset
          loadPreset("netrunner", data);
        }
      } catch (err) {
        console.error("Failed to load parts catalog:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchParts();
  }, []);

  const loadPreset = (presetKey: string, partsCatalog?: PartItem[]) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;
    const parts = partsCatalog || allParts;

    setTitle(preset.title);
    setBuildType(preset.type);
    setDescription(preset.description);
    setTagsInput(preset.tags.join(", "));

    const newSlots: SelectedSlots = {};
    for (const [slotKey, slug] of Object.entries(preset.slugs)) {
      const match = parts.find((p) => p.slug === slug);
      if (match) {
        newSlots[slotKey as keyof SelectedSlots] = match;
      }
    }
    setSelectedSlots(newSlots);
  };

  const selectedPartsList = useMemo(() => {
    return Object.values(selectedSlots).filter(Boolean) as PartItem[];
  }, [selectedSlots]);

  // Telemetry: Price Calculation
  const totalCost = useMemo(() => {
    return selectedPartsList.reduce((sum, part) => {
      const bestPrice =
        part.prices && part.prices.length > 0
          ? Math.min(...part.prices.map((p) => p.price))
          : 0;
      return sum + bestPrice;
    }, 0);
  }, [selectedPartsList]);

  // Telemetry: Weight Calculation (approximate grams)
  const totalWeightGrams = useMemo(() => {
    let weight = 0;
    for (const part of selectedPartsList) {
      if (part.category === "SBC") weight += 55;
      else if (part.category === "DISPLAY") {
        if (part.slug.includes("10-1") || part.slug.includes("10-inch")) weight += 320;
        else if (part.slug.includes("11-9") || part.slug.includes("8-8")) weight += 190;
        else weight += 120;
      } else if (part.category === "BATTERY") {
        if (part.slug.includes("20000") || part.slug.includes("anker")) weight += 480;
        else if (part.slug.includes("21700") || part.slug.includes("10000")) weight += 210;
        else weight += 95;
      } else if (part.category === "KEYBOARD") {
        if (part.slug.includes("corne")) weight += 280;
        else if (part.slug.includes("bbq20")) weight += 45;
        else weight += 110;
      } else if (part.category === "CASE") {
        if (part.slug.includes("pelican-1200")) weight += 1200;
        else if (part.slug.includes("pelican-1150")) weight += 850;
        else if (part.slug.includes("node-304")) weight += 4900;
        else weight += 220;
      } else if (part.category === "STORAGE") {
        if (part.slug.includes("hdd")) weight += 650;
        else if (part.slug.includes("ssd") && !part.slug.includes("sd")) weight += 85;
        else weight += 5;
      } else {
        weight += 35;
      }
    }
    return weight;
  }, [selectedPartsList]);

  // Telemetry: Power, Thermal & Battery Runtime
  const telemetry = useMemo(() => {
    let idleWatts = 0;
    let peakWatts = 0;
    let batteryWh = 0;

    // SBC power profile
    if (selectedSlots.sbc) {
      const slug = selectedSlots.sbc.slug;
      if (slug.includes("raspberry-pi-5")) {
        idleWatts += 3.5;
        peakWatts += 12.0;
      } else if (slug.includes("raspberry-pi-4")) {
        idleWatts += 3.0;
        peakWatts += 7.5;
      } else if (slug.includes("orange-pi-5") || slug.includes("radxa")) {
        idleWatts += 3.8;
        peakWatts += 14.0;
      } else if (slug.includes("jetson")) {
        idleWatts += 4.5;
        peakWatts += 15.0;
      } else if (slug.includes("lattepanda")) {
        idleWatts += 5.5;
        peakWatts += 18.0;
      } else if (slug.includes("zero-2")) {
        idleWatts += 0.8;
        peakWatts += 2.8;
      } else {
        idleWatts += 2.5;
        peakWatts += 6.0;
      }
    }

    // Display power profile
    if (selectedSlots.display) {
      const slug = selectedSlots.display.slug;
      const brightnessMult = brightnessPercent / 100;
      if (slug.includes("eink") || slug.includes("epaper")) {
        idleWatts += 0.05;
        peakWatts += 0.4;
      } else if (slug.includes("10-1") || slug.includes("10-inch")) {
        idleWatts += 1.8 * brightnessMult;
        peakWatts += 4.5 * brightnessMult;
      } else if (slug.includes("11-9") || slug.includes("8-8")) {
        idleWatts += 1.5 * brightnessMult;
        peakWatts += 3.8 * brightnessMult;
      } else if (slug.includes("amoled")) {
        idleWatts += 1.0 * brightnessMult;
        peakWatts += 2.8 * brightnessMult;
      } else {
        idleWatts += 1.2 * brightnessMult;
        peakWatts += 2.5 * brightnessMult;
      }
    }

    // Peripherals
    if (selectedSlots.network && activeRadios) {
      if (selectedSlots.network.slug.includes("hackrf")) {
        idleWatts += 1.5;
        peakWatts += 3.8;
      } else if (selectedSlots.network.slug.includes("quectel")) {
        idleWatts += 0.8;
        peakWatts += 2.5;
      } else {
        idleWatts += 0.3;
        peakWatts += 1.2;
      }
    }

    if (selectedSlots.storage) {
      if (selectedSlots.storage.slug.includes("hdd")) {
        idleWatts += 2.5;
        peakWatts += 6.8;
      } else if (selectedSlots.storage.slug.includes("ssd")) {
        idleWatts += 0.8;
        peakWatts += 2.8;
      }
    }

    if (selectedSlots.cooling) {
      idleWatts += 0.5;
      peakWatts += 1.2;
    }

    // Battery capacity
    if (selectedSlots.battery) {
      const slug = selectedSlots.battery.slug;
      if (slug.includes("anker") || slug.includes("737")) batteryWh = 86.4;
      else if (slug.includes("20000")) batteryWh = 74.0;
      else if (slug.includes("21700") || slug.includes("10000")) batteryWh = 37.0;
      else if (slug.includes("5000")) batteryWh = 18.5;
      else if (slug.includes("solar")) batteryWh = 40.0;
      else batteryWh = 30.0;
    }

    // Current Simulated Load
    const currentWatts = idleWatts + (peakWatts - idleWatts) * (cpuUsagePercent / 100);
    const regulatorEfficiency = 0.88;
    const effectiveWh = batteryWh * regulatorEfficiency;

    const runtimeHours = currentWatts > 0 && effectiveWh > 0 ? effectiveWh / currentWatts : 0;
    const idleRuntimeHours = idleWatts > 0 && effectiveWh > 0 ? effectiveWh / idleWatts : 0;
    const peakRuntimeHours = peakWatts > 0 && effectiveWh > 0 ? effectiveWh / peakWatts : 0;

    // Thermal estimation
    const hasActiveCooling = !!selectedSlots.cooling;
    const thermalResistance = hasActiveCooling ? 2.2 : 5.8; // °C/W
    const estimatedSocTempC = ambientTempC + currentWatts * thermalResistance;
    const thermalThrottlingRisk = estimatedSocTempC >= 78;

    return {
      idleWatts: Number(idleWatts.toFixed(2)),
      peakWatts: Number(peakWatts.toFixed(2)),
      currentWatts: Number(currentWatts.toFixed(2)),
      batteryWh: Number(batteryWh.toFixed(1)),
      runtimeHours: Number(runtimeHours.toFixed(1)),
      idleRuntimeHours: Number(idleRuntimeHours.toFixed(1)),
      peakRuntimeHours: Number(peakRuntimeHours.toFixed(1)),
      estimatedSocTempC: Number(estimatedSocTempC.toFixed(1)),
      thermalThrottlingRisk,
      hasActiveCooling,
    };
  }, [selectedSlots, cpuUsagePercent, brightnessPercent, activeRadios, ambientTempC]);

  // GPIO 40-Pin Interactive Wiring Map
  const gpioMap = useMemo(() => {
    // Standard RPi 40-pin header assignments
    const pins: Array<{
      pin: number;
      name: string;
      type: "power" | "ground" | "i2c" | "spi" | "uart" | "gpio";
      color: string;
      assignedTo?: string;
    }> = [
      { pin: 1, name: "3.3V PWR", type: "power", color: "#ef4444" },
      { pin: 2, name: "5V PWR", type: "power", color: "#f97316" },
      { pin: 3, name: "GPIO 2 (SDA1)", type: "i2c", color: "#10b981" },
      { pin: 4, name: "5V PWR", type: "power", color: "#f97316" },
      { pin: 5, name: "GPIO 3 (SCL1)", type: "i2c", color: "#10b981" },
      { pin: 6, name: "GND", type: "ground", color: "#64748b" },
      { pin: 7, name: "GPIO 4 (GPCLK0)", type: "gpio", color: "#eab308" },
      { pin: 8, name: "GPIO 14 (TXD0)", type: "uart", color: "#06b6d4" },
      { pin: 9, name: "GND", type: "ground", color: "#64748b" },
      { pin: 10, name: "GPIO 15 (RXD0)", type: "uart", color: "#06b6d4" },
      { pin: 11, name: "GPIO 17", type: "gpio", color: "#eab308" },
      { pin: 12, name: "GPIO 18 (PWM0)", type: "gpio", color: "#eab308" },
      { pin: 13, name: "GPIO 27", type: "gpio", color: "#eab308" },
      { pin: 14, name: "GND", type: "ground", color: "#64748b" },
      { pin: 15, name: "GPIO 22", type: "gpio", color: "#eab308" },
      { pin: 16, name: "GPIO 23", type: "gpio", color: "#eab308" },
      { pin: 17, name: "3.3V PWR", type: "power", color: "#ef4444" },
      { pin: 18, name: "GPIO 24", type: "gpio", color: "#eab308" },
      { pin: 19, name: "GPIO 10 (MOSI)", type: "spi", color: "#a855f7" },
      { pin: 20, name: "GND", type: "ground", color: "#64748b" },
      { pin: 21, name: "GPIO 9 (MISO)", type: "spi", color: "#a855f7" },
      { pin: 22, name: "GPIO 25", type: "gpio", color: "#eab308" },
      { pin: 23, name: "GPIO 11 (SCLK)", type: "spi", color: "#a855f7" },
      { pin: 24, name: "GPIO 8 (CE0)", type: "spi", color: "#a855f7" },
      { pin: 25, name: "GND", type: "ground", color: "#64748b" },
      { pin: 26, name: "GPIO 7 (CE1)", type: "spi", color: "#a855f7" },
      { pin: 27, name: "ID_SD (I2C ID)", type: "i2c", color: "#10b981" },
      { pin: 28, name: "ID_SC (I2C ID)", type: "i2c", color: "#10b981" },
      { pin: 29, name: "GPIO 5", type: "gpio", color: "#eab308" },
      { pin: 30, name: "GND", type: "ground", color: "#64748b" },
      { pin: 31, name: "GPIO 6", type: "gpio", color: "#eab308" },
      { pin: 32, name: "GPIO 12 (PWM0)", type: "gpio", color: "#eab308" },
      { pin: 33, name: "GPIO 13 (PWM1)", type: "gpio", color: "#eab308" },
      { pin: 34, name: "GND", type: "ground", color: "#64748b" },
      { pin: 35, name: "GPIO 19 (MISO)", type: "spi", color: "#a855f7" },
      { pin: 36, name: "GPIO 16", type: "gpio", color: "#eab308" },
      { pin: 37, name: "GPIO 26", type: "gpio", color: "#eab308" },
      { pin: 38, name: "GPIO 20 (MOSI)", type: "spi", color: "#a855f7" },
      { pin: 39, name: "GND", type: "ground", color: "#64748b" },
      { pin: 40, name: "GPIO 21 (SCLK)", type: "spi", color: "#a855f7" },
    ];

    // Assign active hardware to pins
    if (selectedSlots.keyboard?.slug.includes("bbq20")) {
      pins[0].assignedTo = "BBQ20 Keyboard (3.3V)";
      pins[2].assignedTo = "BBQ20 I2C SDA";
      pins[4].assignedTo = "BBQ20 I2C SCL";
      pins[5].assignedTo = "BBQ20 GND";
    }

    if (selectedSlots.sensor?.slug.includes("bme680") || selectedSlots.sensor?.slug.includes("bno085")) {
      pins[2].assignedTo = (pins[2].assignedTo ? pins[2].assignedTo + " + " : "") + "Sensor SDA";
      pins[4].assignedTo = (pins[4].assignedTo ? pins[4].assignedTo + " + " : "") + "Sensor SCL";
    }

    if (selectedSlots.display?.slug.includes("eink") || selectedSlots.display?.slug.includes("epaper")) {
      pins[18].assignedTo = "E-Paper SPI MOSI";
      pins[20].assignedTo = "E-Paper SPI MISO";
      pins[22].assignedTo = "E-Paper SPI SCLK";
      pins[23].assignedTo = "E-Paper SPI CE0";
      pins[21].assignedTo = "E-Paper DC Pin (GPIO 25)";
      pins[17].assignedTo = "E-Paper RST Pin (GPIO 24)";
      pins[15].assignedTo = "E-Paper BUSY Pin (GPIO 23)";
    }

    if (selectedSlots.cooling?.slug.includes("noctua") || selectedSlots.cooling?.slug.includes("fan")) {
      pins[3].assignedTo = "Cooling Fan 5V PWR";
      pins[5].assignedTo = "Cooling Fan GND";
      pins[11].assignedTo = "PWM Fan Speed Control (GPIO 18)";
    }

    if (selectedSlots.audio?.slug.includes("hifiberry")) {
      pins[11].assignedTo = "HiFiBerry I2S Bit Clock (GPIO 18)";
      pins[34].assignedTo = "HiFiBerry I2S LR Clock (GPIO 19)";
      pins[39].assignedTo = "HiFiBerry I2S Data Out (GPIO 21)";
    }

    return pins;
  }, [selectedSlots]);

  // Generated config.txt
  const generatedConfig = useMemo(() => {
    let disp = selectedSlots.display?.slug || "";

    let lines = [
      `# ==========================================================`,
      `# DECKSMITH AUTOGENERATED BOOT CONFIGURATION`,
      `# Build: ${title}`,
      `# Archetype: ${buildType}`,
      `# Timestamp: ${new Date().toISOString()}`,
      `# ==========================================================`,
      ``,
      `[all]`,
      `# Core System Parameters`,
      `arm_64bit=1`,
      `dtoverlay=vc4-kms-v3d`,
      `max_framebuffers=2`,
      `disable_overscan=1`,
      `hdmi_force_hotplug=1`,
      ``,
    ];

    if (disp.includes("11-9")) {
      lines.push(
        `# Waveshare 11.9" 320x1480 Ultrawide Display Modeline`,
        `hdmi_group=2`,
        `hdmi_mode=87`,
        `hdmi_timings=320 0 100 10 100 1480 0 10 2 10 0 0 0 60 0 31200000 7`,
        `display_rotate=3  # 0=normal, 1=90, 2=180, 3=270 portrait-to-landscape`,
        `dtoverlay=waveshare-touch`,
        ``
      );
    } else if (disp.includes("8-8")) {
      lines.push(
        `# Waveshare 8.8" 480x1920 Side Bar Modeline`,
        `hdmi_group=2`,
        `hdmi_mode=87`,
        `hdmi_timings=480 0 30 10 30 1920 0 10 2 10 0 0 0 60 0 58000000 7`,
        `display_rotate=3`,
        ``
      );
    } else if (disp.includes("eink") || disp.includes("epaper")) {
      lines.push(
        `# Waveshare SPI E-Paper Configuration`,
        `dtparam=spi=on`,
        `dtoverlay=waveshare-epd`,
        ``
      );
    }

    if (selectedSlots.keyboard?.slug.includes("bbq20")) {
      lines.push(
        `# Solder Party BBQ20 I2C Trackpad & Keypad Overlays`,
        `dtparam=i2c_arm=on`,
        `dtoverlay=i2c-gpio,bus=1,sda=2,scl=3,i2c_gpio_delay_us=2`,
        ``
      );
    }

    if (selectedSlots.audio?.slug.includes("hifiberry")) {
      lines.push(
        `# HiFiBerry DAC2 Pro Audio Overlay`,
        `dtoverlay=hifiberry-dacplus`,
        `dtparam=audio=off`,
        ``
      );
    }

    if (selectedSlots.sensor?.slug.includes("bme680") || selectedSlots.sensor?.slug.includes("bno085")) {
      lines.push(
        `# Sensor Bus Activation`,
        `dtparam=i2c_arm=on`,
        `dtparam=i2c_arm_baudrate=400000`,
        ``
      );
    }

    lines.push(
      `# Power & Thermal Management`,
      `dtparam=pwr_led_trigger=none`,
      `dtparam=act_led_trigger=heartbeat`,
      `# End of Decksmith Config`
    );

    return lines.join("\n");
  }, [selectedSlots, title, buildType]);

  // Generated First-Boot Setup Script
  const generatedSetupScript = useMemo(() => {
    const packages: string[] = ["git", "curl", "build-essential", "python3-pip", "i2c-tools"];

    if (selectedSlots.network?.slug.includes("sdr") || selectedSlots.network?.slug.includes("hackrf")) {
      packages.push("gqrx-sdr", "rtl-sdr", "hackrf", "gnuradio");
    }
    if (selectedSlots.network?.slug.includes("lora")) {
      packages.push("meshtastic", "python3-serial");
    }
    if (selectedSlots.display?.slug.includes("eink")) {
      packages.push("python3-pil", "python3-spidev");
    }
    if (selectedSlots.storage?.slug.includes("nas") || selectedSlots.storage?.slug.includes("hdd")) {
      packages.push("zfsutils-linux", "samba", "smartmontools", "hdparm");
    }

    return `#!/usr/bin/env bash
# ==========================================================
# DECKSMITH FIRST-BOOT HARDWARE PROVISIONING SCRIPT
# Build: ${title}
# Target OS: Debian / Raspberry Pi OS 64-bit / Armbian
# ==========================================================

set -euo pipefail

echo "⚡ Initializing Decksmith Hardware Setup..."

# 1. Update package indices
sudo apt update && sudo apt upgrade -y

# 2. Install hardware communication utilities & drivers
sudo apt install -y ${packages.join(" ")}

# 3. Configure I2C & SPI interfaces
sudo raspi-config nonint do_i2c 0
sudo raspi-config nonint do_spi 0

# 4. Add user to hardware groups
sudo usermod -aG dialout,i2c,spi,audio $USER

echo "✅ Decksmith provisioning complete. Rebooting system in 5s..."
# sudo reboot
`;
  }, [selectedSlots, title]);

  const handleSelectPart = (slotKey: keyof SelectedSlots, part: PartItem) => {
    soundFx.playClick();
    setSelectedSlots((prev) => ({
      ...prev,
      [slotKey]: prev[slotKey]?.id === part.id ? undefined : part,
    }));
  };

  const handleExportBOM = (format: "csv" | "json" | "md") => {
    soundFx.playConfirm();
    const parts = selectedPartsList;

    if (format === "csv") {
      let csv = "Category,Component Name,Slug,Best Price ($),Vendor\n";
      parts.forEach((p) => {
        const price = p.prices?.[0]?.price || 0;
        const vendor = p.prices?.[0]?.source || "N/A";
        csv += `"${p.category}","${p.name.replace(/"/g, '""')}","${p.slug}",${price},"${vendor}"\n`;
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-bom.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "json") {
      const jsonStr = JSON.stringify(
        {
          title,
          type: buildType,
          totalCost,
          components: parts.map((p) => ({
            category: p.category,
            name: p.name,
            slug: p.slug,
            price: p.prices?.[0]?.price || 0,
            vendor: p.prices?.[0]?.source || "N/A",
          })),
        },
        null,
        2
      );
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-bom.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "md") {
      let md = `# Bill of Materials: ${title}\n\n`;
      md += `**Archetype:** ${buildType} | **Estimated Total:** $${totalCost.toFixed(2)}\n\n`;
      md += `| Category | Part Name | Price | Source |\n`;
      md += `| :--- | :--- | :--- | :--- |\n`;
      parts.forEach((p) => {
        const price = p.prices?.[0]?.price ? `$${p.prices[0].price.toFixed(2)}` : "TBD";
        const vendor = p.prices?.[0]?.source || "N/A";
        md += `| ${p.category} | ${p.name} | ${price} | ${vendor} |\n`;
      });
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-bom.md`;
      a.click();
      URL.revokeObjectURL(url);
    }

    dispatchToast({
      type: "studio",
      title: "📦 Bill of Materials Exported",
      message: `Downloaded BOM for "${title}" in .${format.toUpperCase()} format.`,
    });
  };

  const handleShareLink = () => {
    soundFx.playConfirm();
    const params = new URLSearchParams();
    params.set("title", title);
    params.set("type", buildType);
    for (const [slot, part] of Object.entries(selectedSlots)) {
      if (part?.slug) params.set(slot, part.slug);
    }
    const shareUrl = `${window.location.origin}/builder?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl);
    dispatchToast({
      type: "badge",
      title: "🔗 Share Link Copied",
      message: "Direct BOM blueprint link copied to clipboard.",
    });
  };

  const handlePublishBuild = async () => {
    if (!title.trim() || !buildType) return;
    setIsPublishing(true);
    try {
      const partSlugs = Object.values(selectedSlots)
        .filter(Boolean)
        .map((p) => (p as PartItem).slug);

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch(`${API_URL}/api/builds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          type: buildType,
          budget: totalCost,
          tags,
          partSlugs,
        }),
      });

      if (res.ok) {
        soundFx.playConfirm();
        const created = await res.json();
        setPublishedSlug(created.slug);
      }
    } catch (err) {
      console.error("Failed to publish build:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const copyConfigToClipboard = () => {
    soundFx.playConfirm();
    navigator.clipboard.writeText(generatedConfig);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const copyScriptToClipboard = () => {
    soundFx.playConfirm();
    navigator.clipboard.writeText(generatedSetupScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const downloadBOM = () => {
    soundFx.playConfirm();
    const rows = [
      ["Category", "Part Name", "Best Price (USD)", "Vendor Source"],
      ...selectedPartsList.map((p) => [
        p.category,
        `"${p.name.replace(/"/g, '""')}"`,
        p.prices && p.prices.length > 0
          ? Math.min(...p.prices.map((pr) => pr.price)).toFixed(2)
          : "0.00",
        p.prices && p.prices.length > 0
          ? p.prices.sort((a, b) => a.price - b.price)[0].source
          : "N/A",
      ]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-bom.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadScript = () => {
    soundFx.playConfirm();
    const blob = new Blob([generatedSetupScript], { type: "text/x-shellscript" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "decksmith-setup.sh";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCompleteDossier = () => {
    soundFx.playConfirm();
    const dossier = {
      project: {
        title,
        type: buildType,
        description,
        tags: tagsInput.split(",").map((t) => t.trim()),
        totalCostUSD: totalCost,
        totalWeightGrams,
        telemetry,
      },
      hardwareManifest: selectedPartsList.map((p) => ({
        slot: p.category,
        name: p.name,
        slug: p.slug,
        bestPrice: p.prices && p.prices.length > 0 ? Math.min(...p.prices.map((pr) => pr.price)) : 0,
      })),
      gpioPinoutAllocation: gpioMap.filter((p) => p.assignedTo),
      firmwareConfigTxt: generatedConfig,
      firstBootScript: generatedSetupScript,
      exportTimestamp: new Date().toISOString(),
      generator: "Decksmith Cyberdeck Engineering Studio v2.0",
    };

    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-fabrication-dossier.json`;
    document.body.appendChild(link);
    link.click();
  };

  const handleWatchAllBlueprintParts = async () => {
    if (selectedPartsList.length === 0) return;
    soundFx.playConfirm();
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      for (const part of selectedPartsList) {
        await fetch(`${API_URL}/api/alerts/watch`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            partId: part.id,
            alertOnDrop: true,
            alertOnIncrease: true,
          }),
        });
      }

      dispatchToast({
        type: "price_drop",
        title: `👁️ Watching ${selectedPartsList.length} Blueprint Parts`,
        message: `Now tracking live market price drops across all components in "${title}".`,
        url: "/price-watch",
        actionLabel: "View Watched Hub",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const activeSlotConfig = CATEGORY_SLOTS.find((s) => s.key === activeSlot);
  const partsForActiveCategory = useMemo(() => {
    if (!activeSlotConfig) return [];
    return allParts.filter((p) => p.category === activeSlotConfig.category);
  }, [allParts, activeSlotConfig]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin text-neon-green mb-4">
          <Cpu className="w-10 h-10" />
        </div>
        <p className="text-gray-400 font-mono">Loading Hardware Blueprint Studio...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neon-green/10 text-neon-green border border-neon-green/30">
              Interactive Studio
            </span>
            <span className="text-xs font-mono text-gray-500">v2.5 Pro Edition</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-neon-green" />
            Custom Blueprint Studio
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Architect custom decks with visual chassis arrangement, interactive GPIO pinouts, live power curves, and one-click provisioning scripts.
          </p>
        </div>

        {/* Preset Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5">
            <Compass className="w-4 h-4 text-cyan-400" />
            <select
              onChange={(e) => loadPreset(e.target.value)}
              defaultValue="netrunner"
              className="bg-transparent text-xs font-semibold text-gray-200 focus:outline-none cursor-pointer"
            >
              <option value="netrunner" className="bg-gray-900">Preset: Shadow Netrunner</option>
              <option value="meshtastic" className="bg-gray-900">Preset: Nomad LoRa Field Unit</option>
              <option value="nas" className="bg-gray-900">Preset: Silent 4-Bay NAS</option>
              <option value="gauntlet" className="bg-gray-900">Preset: Armored Tactical Gauntlet</option>
              <option value="sdr" className="bg-gray-900">Preset: SIGINT Spectrum Scanner</option>
            </select>
          </div>

          <button
            onClick={() => setSelectedSlots({})}
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <Link
            to={`/cad?sbc=${selectedSlots.sbc?.slug || "raspberry-pi-5"}&display=${selectedSlots.display?.slug || "waveshare-11-9-bar-touchscreen"}&keyboard=${selectedSlots.keyboard?.slug || "solder-party-bbq20-keyboard"}`}
            className="px-3.5 py-2 rounded-lg border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5" />
            CAD Standoffs
          </Link>
          <button
            onClick={handleShareLink}
            disabled={selectedPartsList.length === 0}
            className="px-3.5 py-2 rounded-lg border border-neon-green/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-neon-green text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Copy shareable direct blueprint link"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Link
          </button>
          <button
            onClick={() => handleExportBOM("csv")}
            disabled={selectedPartsList.length === 0}
            className="px-3.5 py-2 rounded-lg border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-400 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            BOM CSV
          </button>
          <button
            onClick={() => handleExportBOM("md")}
            disabled={selectedPartsList.length === 0}
            className="px-3.5 py-2 rounded-lg border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-400 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <FileCode className="w-3.5 h-3.5" />
            BOM MD
          </button>
          <button
            onClick={handleWatchAllBlueprintParts}
            disabled={selectedPartsList.length === 0}
            className="px-3.5 py-2 rounded-lg border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Track price drops for all selected components"
          >
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            Watch All Parts
          </button>
          <button
            onClick={downloadCompleteDossier}
            disabled={selectedPartsList.length === 0}
            className="px-3.5 py-2 rounded-lg border border-yellow-500/40 bg-yellow-950/40 hover:bg-yellow-900/60 text-yellow-300 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Download unified BOM, Pinout Map, 3D SCAD Enclosure & First-Boot Script"
          >
            <Layers className="w-3.5 h-3.5 text-yellow-400" />
            Fabrication Dossier
          </button>
          <button
            onClick={handlePublishBuild}
            disabled={isPublishing || selectedPartsList.length === 0}
            className="px-4 py-2 rounded-lg bg-neon-green hover:bg-green-400 text-gray-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-neon-green/20 disabled:opacity-50"
          >
            {isPublishing ? "Publishing..." : <> <Share2 className="w-3.5 h-3.5" /> Publish Blueprint </>}
          </button>
        </div>
      </div>

      {/* Published Success Banner */}
      {publishedSlug && (
        <div className="my-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-white text-sm">Blueprint Published Successfully!</h4>
              <p className="text-xs text-emerald-300/80">
                Your blueprint is live in the community gallery at <code className="text-emerald-200 font-mono">/builds/{publishedSlug}</code>.
              </p>
            </div>
          </div>
          <Link
            to={`/builds/${publishedSlug}`}
            className="px-4 py-1.5 rounded-lg bg-emerald-400 text-gray-950 text-xs font-bold hover:bg-emerald-300 transition-colors"
          >
            View Live Build
          </Link>
        </div>
      )}

      {/* Studio Navigation Tabs */}
      <div className="flex border-b border-gray-800 mt-6 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("builder")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "builder" ? "border-neon-green text-neon-green" : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          Component Slots ({selectedPartsList.length}/10)
        </button>

        <button
          onClick={() => setActiveTab("canvas")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "canvas" ? "border-cyan-400 text-cyan-400" : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Grid className="w-4 h-4" />
          2D Chassis Canvas
        </button>

        <button
          onClick={() => setActiveTab("gpio")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "gpio" ? "border-emerald-400 text-emerald-400" : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Activity className="w-4 h-4" />
          GPIO & Wiring Pinout
        </button>

        <button
          onClick={() => setActiveTab("telemetry")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "telemetry" ? "border-yellow-400 text-yellow-400" : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Zap className="w-4 h-4" />
          Power & Thermal Load
        </button>

        <button
          onClick={() => setActiveTab("config")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "config" ? "border-purple-400 text-purple-400" : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <FileCode className="w-4 h-4" />
          config.txt
        </button>

        <button
          onClick={() => setActiveTab("script")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "script" ? "border-rose-400 text-rose-400" : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Terminal className="w-4 h-4" />
          Setup Script
        </button>

        <button
          onClick={() => setActiveTab("bom")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "bom" ? "border-amber-400 text-amber-400" : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Procurement BOM
        </button>
      </div>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Side Studio Canvas / Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* TAB 1: HARDWARE BUILDER SLOTS */}
          {activeTab === "builder" && (
            <>
              {/* Build Meta Info Inputs */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono text-gray-400 mb-1">Blueprint Name</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Shadow Netrunner MK-IV"
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3.5 py-2 text-sm text-gray-100 font-semibold focus:outline-none focus:border-neon-green"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Archetype Category</label>
                    <select
                      value={buildType}
                      onChange={(e) => setBuildType(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 font-medium focus:outline-none focus:border-neon-green"
                    >
                      {Object.values(BUILD_TYPES).map((bt) => (
                        <option key={bt} value={bt}>
                          {bt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Concept Summary & Mission Profile</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe mission profile, intended OS, and unique features..."
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-xs text-gray-300 focus:outline-none focus:border-neon-green resize-none"
                  />
                </div>
              </div>

              {/* Slot Selector Matrix */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-neon-green" />
                    Hardware Architecture Slots
                  </h3>
                  <span className="text-xs text-gray-400">Click a slot to browse available hardware</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {CATEGORY_SLOTS.map((slot) => {
                    const SlotIcon = slot.icon;
                    const isSelected = !!selectedSlots[slot.key];
                    const isActive = activeSlot === slot.key;
                    const chosenPart = selectedSlots[slot.key];

                    return (
                      <button
                        key={slot.key}
                        onClick={() => setActiveSlot(slot.key)}
                        className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                          isActive
                            ? "border-neon-green bg-gray-900 shadow-md shadow-neon-green/10"
                            : isSelected
                            ? "border-gray-700 bg-gray-900/40 hover:border-gray-600"
                            : "border-gray-800 bg-gray-950/40 hover:border-gray-700 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <SlotIcon
                            className={`w-4 h-4 ${isSelected ? "text-neon-green" : "text-gray-500"}`}
                          />
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 text-neon-green" />
                          ) : slot.required ? (
                            <span className="text-[10px] text-amber-400 font-mono">REQ</span>
                          ) : null}
                        </div>
                        <div className="text-xs font-bold text-gray-200 truncate">
                          {chosenPart ? chosenPart.name : slot.category}
                        </div>
                        <div className="text-[10px] text-gray-500 truncate mt-0.5">
                          {chosenPart
                            ? `$${Math.min(...chosenPart.prices.map((p) => p.price)).toFixed(2)}`
                            : "Empty Slot"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hardware Catalog Browser for Active Slot */}
              <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <span>Select {activeSlotConfig?.title}</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Choose from {partsForActiveCategory.length} verified hardware components in this category.
                    </p>
                  </div>
                  {selectedSlots[activeSlot] && (
                    <button
                      onClick={() =>
                        setSelectedSlots((prev) => ({ ...prev, [activeSlot]: undefined }))
                      }
                      className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear Slot
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {partsForActiveCategory.map((part) => {
                    const isSelected = selectedSlots[activeSlot]?.id === part.id;
                    const bestPrice =
                      part.prices && part.prices.length > 0
                        ? Math.min(...part.prices.map((p) => p.price))
                        : 0;

                    return (
                      <div
                        key={part.id}
                        onClick={() => handleSelectPart(activeSlot, part)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-neon-green bg-neon-green/5 ring-1 ring-neon-green"
                            : "border-gray-800 bg-gray-950/60 hover:border-gray-700 hover:bg-gray-900/60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                                {part.category}
                              </span>
                              {isSelected && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neon-green text-gray-950">
                                  EQUIPPED
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-gray-100 text-sm leading-snug">
                              {part.name}
                            </h4>
                          </div>
                          <span className="text-sm font-bold text-neon-green shrink-0">
                            ${bestPrice.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-800/80 text-xs text-gray-500">
                          <span>{part.prices?.length || 0} vendors available</span>
                          <span className="text-neon-green font-medium flex items-center gap-1">
                            {isSelected ? "Remove" : "Select Slot"}
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: 2D CHASSIS CANVAS */}
          {activeTab === "canvas" && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Grid className="w-5 h-5 text-cyan-400" />
                    2D Chassis Integration Canvas
                  </h3>
                  <p className="text-xs text-gray-400">
                    Visual internal arrangement of equipped modules inside the selected chassis.
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 bg-gray-800 text-gray-300 rounded-full border border-gray-700">
                  Enclosure: {selectedSlots.chassis?.name || "Generic Chassis"}
                </span>
              </div>

              {/* Visual Interactive Chassis Mockup */}
              <div className="w-full bg-gray-950 border-2 border-dashed border-gray-800 rounded-2xl p-6 relative flex flex-col items-center justify-center min-h-[380px]">
                {/* Chassis Outer Shell */}
                <div className="w-full max-w-lg border-2 border-gray-700 bg-gray-900/90 rounded-xl p-4 shadow-2xl relative">
                  {/* Top: Display Slot */}
                  <div className="w-full h-32 bg-gray-950 border-2 border-cyan-500/40 rounded-lg p-3 flex flex-col items-center justify-center text-center relative overflow-hidden mb-3">
                    <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                      <Monitor className="w-3 h-3" />
                      DISPLAY BAY
                    </div>
                    {selectedSlots.display ? (
                      <div>
                        <div className="text-xs font-bold text-cyan-300">{selectedSlots.display.name}</div>
                        <div className="text-[10px] font-mono text-gray-400 mt-1">HDMI / DSI Ribbon Interlink</div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-600 font-mono">[Empty Display Slot]</span>
                    )}
                  </div>

                  {/* Middle Row: SBC + Battery + Storage */}
                  <div className="grid grid-cols-3 gap-2.5 mb-3">
                    {/* SBC Core */}
                    <div className="h-24 bg-gray-950 border border-emerald-500/40 rounded-lg p-2 flex flex-col items-center justify-center text-center">
                      <Cpu className="w-4 h-4 text-emerald-400 mb-1" />
                      <span className="text-[10px] font-bold text-emerald-300 truncate w-full">
                        {selectedSlots.sbc?.name || "No SBC Core"}
                      </span>
                    </div>

                    {/* Battery */}
                    <div className="h-24 bg-gray-950 border border-yellow-500/40 rounded-lg p-2 flex flex-col items-center justify-center text-center">
                      <BatteryCharging className="w-4 h-4 text-yellow-400 mb-1" />
                      <span className="text-[10px] font-bold text-yellow-300 truncate w-full">
                        {selectedSlots.battery?.name || "No Battery"}
                      </span>
                    </div>

                    {/* Storage / Wireless */}
                    <div className="h-24 bg-gray-950 border border-purple-500/40 rounded-lg p-2 flex flex-col items-center justify-center text-center">
                      <HardDrive className="w-4 h-4 text-purple-400 mb-1" />
                      <span className="text-[10px] font-bold text-purple-300 truncate w-full">
                        {selectedSlots.storage?.name || selectedSlots.network?.name || "Expansion Bay"}
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Keyboard Deck */}
                  <div className="w-full h-20 bg-gray-950 border border-pink-500/40 rounded-lg p-2 flex flex-col items-center justify-center text-center">
                    <div className="text-[10px] font-mono text-pink-400 flex items-center gap-1 mb-0.5">
                      <Keyboard className="w-3 h-3" />
                      INPUT DECK
                    </div>
                    {selectedSlots.keyboard ? (
                      <span className="text-xs font-bold text-pink-300">{selectedSlots.keyboard.name}</span>
                    ) : (
                      <span className="text-xs text-gray-600 font-mono">[No Keyboard Deck]</span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 font-mono mt-4">
                  Internal Volume Fit: {totalWeightGrams}g Total System Mass · Fully Modular Architecture
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GPIO & WIRING MATRIX */}
          {activeTab === "gpio" && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    40-Pin GPIO & Bus Wiring Matrix
                  </h3>
                  <p className="text-xs text-gray-400">
                    Live pinout schematic mapping power, I2C, SPI, and UART lines for equipped modules.
                  </p>
                </div>
                <div className="flex gap-2 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">3.3V/5V Power</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">I2C Bus</span>
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">SPI Bus</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">UART Serial</span>
                </div>
              </div>

              {/* 40-Pin Interactive Visual Pinout */}
              <div className="bg-gray-950 rounded-xl border border-gray-800 p-5 overflow-x-auto">
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {/* Left Pin Column (Odd Pins) */}
                  <div className="space-y-1.5">
                    {gpioMap
                      .filter((p) => p.pin % 2 !== 0)
                      .map((p) => (
                        <div
                          key={p.pin}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs font-mono ${
                            p.assignedTo
                              ? "bg-gray-900 border-neon-green/60 text-white ring-1 ring-neon-green/30"
                              : "bg-gray-900/40 border-gray-800/80 text-gray-400"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-gray-800 text-gray-300">
                              {p.pin}
                            </span>
                            <span style={{ color: p.color }} className="font-bold">
                              {p.name}
                            </span>
                          </div>
                          {p.assignedTo && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-neon-green/10 text-neon-green rounded border border-neon-green/20 truncate max-w-[140px]">
                              {p.assignedTo}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>

                  {/* Right Pin Column (Even Pins) */}
                  <div className="space-y-1.5">
                    {gpioMap
                      .filter((p) => p.pin % 2 === 0)
                      .map((p) => (
                        <div
                          key={p.pin}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs font-mono ${
                            p.assignedTo
                              ? "bg-gray-900 border-neon-green/60 text-white ring-1 ring-neon-green/30"
                              : "bg-gray-900/40 border-gray-800/80 text-gray-400"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-gray-800 text-gray-300">
                              {p.pin}
                            </span>
                            <span style={{ color: p.color }} className="font-bold">
                              {p.name}
                            </span>
                          </div>
                          {p.assignedTo && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-neon-green/10 text-neon-green rounded border border-neon-green/20 truncate max-w-[140px]">
                              {p.assignedTo}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: POWER & THERMAL TELEMETRY */}
          {activeTab === "telemetry" && (
            <div className="space-y-6">
              {/* Power Simulation Control Panel */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      Dynamic Power & Thermal Simulator
                    </h3>
                    <p className="text-xs text-gray-400">
                      Adjust workload and screen brightness to simulate battery drain and thermal rise in the field.
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-full font-bold">
                    {telemetry.currentWatts} Watts Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-mono text-gray-300 mb-1.5">
                      <span>CPU / SoC Load</span>
                      <span className="text-neon-green font-bold">{cpuUsagePercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      value={cpuUsagePercent}
                      onChange={(e) => setCpuUsagePercent(Number(e.target.value))}
                      className="w-full accent-neon-green cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
                      <span>Idle (5%)</span>
                      <span>Stress (100%)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono text-gray-300 mb-1.5">
                      <span>Display Backlight</span>
                      <span className="text-cyan-400 font-bold">{brightnessPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={brightnessPercent}
                      onChange={(e) => setBrightnessPercent(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
                      <span>Dim (10%)</span>
                      <span>Max (100%)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono text-gray-300 mb-1.5">
                      <span>Ambient Temp</span>
                      <span className="text-purple-400 font-bold">{ambientTempC}°C</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={45}
                      value={ambientTempC}
                      onChange={(e) => setAmbientTempC(Number(e.target.value))}
                      className="w-full accent-purple-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
                      <span>Cold (10°C)</span>
                      <span>Hot (45°C)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeRadios}
                      onChange={(e) => setActiveRadios(e.target.checked)}
                      className="rounded accent-neon-green"
                    />
                    <span>Simulate Active RF Transmitters (SDR / LTE / LoRa Transmit Mode)</span>
                  </label>
                </div>
              </div>

              {/* Thermal Profiling Metric Card */}
              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${telemetry.thermalThrottlingRisk ? "bg-rose-950 text-rose-400 border border-rose-800" : "bg-emerald-950 text-emerald-400 border border-emerald-800"}`}>
                    <Thermometer className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <span>Estimated Core Temperature: {telemetry.estimatedSocTempC}°C</span>
                      {telemetry.hasActiveCooling && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                          Active Cooling Engaged
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {telemetry.thermalThrottlingRisk
                        ? "⚠️ High throttling risk detected. Active fan or copper heatpipe cooling recommended."
                        : "✅ Thermal envelope stable. System operating within optimal performance threshold."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CONFIG.TXT */}
          {activeTab === "config" && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-purple-400" />
                    Auto-Generated Bootloader Configuration
                  </h3>
                  <p className="text-xs text-gray-400">
                    Ready-to-flash parameters for <code className="text-purple-300">/boot/firmware/config.txt</code>
                  </p>
                </div>
                <button
                  onClick={copyConfigToClipboard}
                  className="px-3.5 py-1.5 rounded-lg border border-purple-500/40 bg-purple-950/40 text-purple-300 text-xs font-bold hover:bg-purple-900/60 transition-colors flex items-center gap-1.5"
                >
                  {copiedConfig ? <Check className="w-3.5 h-3.5 text-neon-green" /> : null}
                  {copiedConfig ? "Copied!" : "Copy config.txt"}
                </button>
              </div>

              <pre className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed">
                {generatedConfig}
              </pre>
            </div>
          )}

          {/* TAB 6: SETUP SCRIPT */}
          {activeTab === "script" && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-rose-400" />
                    First-Boot Linux Setup Script (decksmith-setup.sh)
                  </h3>
                  <p className="text-xs text-gray-400">
                    Automated bash installer that configures I2C, SPI, user groups, and installs drivers for equipped hardware.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyScriptToClipboard}
                    className="px-3.5 py-1.5 rounded-lg border border-rose-500/40 bg-rose-950/40 text-rose-300 text-xs font-bold hover:bg-rose-900/60 transition-colors flex items-center gap-1.5"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-neon-green" /> : null}
                    {copiedScript ? "Copied!" : "Copy Script"}
                  </button>
                  <button
                    onClick={downloadScript}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-500 text-gray-950 text-xs font-bold hover:bg-rose-400 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .sh
                  </button>
                </div>
              </div>

              <pre className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed">
                {generatedSetupScript}
              </pre>
            </div>
          )}

          {/* TAB 7: BOM */}
          {activeTab === "bom" && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-yellow-400" />
                    Bill of Materials (BOM) & Vendor Procurement
                  </h3>
                  <p className="text-xs text-gray-400">
                    Procurement breakdown across all {selectedPartsList.length} equipped parts with direct vendor store links.
                  </p>
                </div>
                <button
                  onClick={downloadBOM}
                  className="px-3.5 py-1.5 rounded-lg bg-yellow-400 text-gray-950 text-xs font-bold hover:bg-yellow-300 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download CSV
                </button>
              </div>

              <div className="border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-950 text-gray-400 uppercase font-mono border-b border-gray-800">
                    <tr>
                      <th className="p-3">Category</th>
                      <th className="p-3">Component</th>
                      <th className="p-3">Best Vendor</th>
                      <th className="p-3 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-gray-300">
                    {selectedPartsList.map((p) => {
                      const best =
                        p.prices && p.prices.length > 0
                          ? p.prices.sort((a, b) => a.price - b.price)[0]
                          : null;
                      return (
                        <tr key={p.id} className="hover:bg-gray-800/30">
                          <td className="p-3 font-mono text-neon-green">{p.category}</td>
                          <td className="p-3 font-medium text-white">{p.name}</td>
                          <td className="p-3 text-gray-400">
                            {best?.url ? (
                              <a
                                href={best.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-400 hover:underline flex items-center gap-1"
                              >
                                {best.source}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              best?.source || "Standard Retail"
                            )}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-neon-green">
                            ${best?.price.toFixed(2) || "0.00"}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-950/80 font-bold text-white">
                      <td colSpan={3} className="p-3 text-right uppercase font-mono">
                        Total Build Budget:
                      </td>
                      <td className="p-3 text-right font-mono text-neon-green text-sm">
                        ${totalCost.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Live Telemetry HUD */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-5 sticky top-24 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-neon-green" />
                Live Deck Telemetry
              </span>
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            </div>

            {/* Key Telemetry Metric Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-800">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Est. Runtime</span>
                </div>
                <div className="text-xl font-black text-cyan-400 font-mono">
                  {telemetry.runtimeHours} hrs
                </div>
                <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                  {telemetry.idleRuntimeHours}h idle / {telemetry.peakRuntimeHours}h peak
                </div>
              </div>

              <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-800">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-neon-green" />
                  <span>Total Cost</span>
                </div>
                <div className="text-xl font-black text-neon-green font-mono">
                  ${totalCost.toFixed(2)}
                </div>
                <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                  {selectedPartsList.length} parts equipped
                </div>
              </div>

              <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-800">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Power Draw</span>
                </div>
                <div className="text-xl font-black text-yellow-400 font-mono">
                  {telemetry.currentWatts} W
                </div>
                <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                  {telemetry.idleWatts}W idle / {telemetry.peakWatts}W peak
                </div>
              </div>

              <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-800">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <Weight className="w-3.5 h-3.5 text-purple-400" />
                  <span>Total Mass</span>
                </div>
                <div className="text-xl font-black text-purple-400 font-mono">
                  {totalWeightGrams >= 1000
                    ? `${(totalWeightGrams / 1000).toFixed(2)} kg`
                    : `${totalWeightGrams} g`}
                </div>
                <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                  {(totalWeightGrams * 0.00220462).toFixed(2)} lbs
                </div>
              </div>
            </div>

            {/* Battery Level Energy Bar */}
            <div>
              <div className="flex justify-between text-xs font-mono text-gray-300 mb-1.5">
                <span>Battery Energy Capacity</span>
                <span className="text-neon-green font-bold">{telemetry.batteryWh} Wh</span>
              </div>
              <div className="h-2 w-full bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                <div
                  className="h-full bg-gradient-to-r from-neon-green to-cyan-400 rounded-full"
                  style={{ width: `${Math.min(100, (telemetry.batteryWh / 100) * 100)}%` }}
                />
              </div>
            </div>

            {/* Equipped Inventory List */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">
                Equipped Inventory ({selectedPartsList.length})
              </h4>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {selectedPartsList.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-950/60 border border-gray-800/80 text-xs"
                  >
                    <div className="truncate pr-2">
                      <span className="text-[10px] font-mono text-neon-green mr-1.5">
                        [{p.category}]
                      </span>
                      <span className="text-gray-200">{p.name}</span>
                    </div>
                    <span className="font-mono font-bold text-gray-400 shrink-0">
                      ${Math.min(...(p.prices?.map((pr) => pr.price) || [0])).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
