import { AIModel, PartCategory, BuildType } from "./types";

// Supported AI models
export const AI_MODELS: AIModel[] = [
  // OpenAI
  { provider: "openai", model: "gpt-4o", displayName: "GPT-4o", maxTokens: 128000, supportsImages: true, supportsTools: true },
  { provider: "openai", model: "gpt-4o-mini", displayName: "GPT-4o Mini", maxTokens: 128000, supportsImages: true, supportsTools: true },
  { provider: "openai", model: "o1", displayName: "o1", maxTokens: 200000, supportsImages: true, supportsTools: true },
  
  // Anthropic
  { provider: "anthropic", model: "claude-sonnet-4-6", displayName: "Claude Sonnet", maxTokens: 200000, supportsImages: true, supportsTools: true },
  { provider: "anthropic", model: "claude-opus-4-6", displayName: "Claude Opus", maxTokens: 200000, supportsImages: true, supportsTools: true },
  
  // Google
  { provider: "google", model: "gemini-2.5-pro", displayName: "Gemini 2.5 Pro", maxTokens: 1000000, supportsImages: true, supportsTools: true },
  { provider: "google", model: "gemini-2.5-flash", displayName: "Gemini 2.5 Flash", maxTokens: 1000000, supportsImages: true, supportsTools: true },
  
  // Ollama (local)
  { provider: "ollama", model: "llama3.1", displayName: "Llama 3.1 (Local)", maxTokens: 128000, supportsImages: false, supportsTools: true },
  { provider: "ollama", model: "qwen2.5-coder:0.5b", displayName: "Qwen 2.5 Coder (Local)", maxTokens: 32768, supportsImages: false, supportsTools: true },
  { provider: "ollama", model: "codellama", displayName: "CodeLlama (Local)", maxTokens: 16000, supportsImages: false, supportsTools: true },
];

// Popular SBCs for cyberdecks
export const POPULAR_SBCS = [
  { name: "Raspberry Pi 5", specs: "BCM2712, 4/8GB RAM, WiFi 6" },
  { name: "Raspberry Pi 4", specs: "BCM2711, 1-8GB RAM, WiFi 5" },
  { name: "Raspberry Pi Zero 2 W", specs: "RP3A0, 512MB RAM, WiFi" },
  { name: "Pine64 Pinebook Pro", specs: "RK3399, 4GB RAM, eMMC" },
  { name: "Pine64 PinePhone", specs: "RK3366, 2/3GB RAM, 4G" },
  { name: "LattePanda 3 Delta", specs: "i5-1135G7, 8/16GB RAM" },
  { name: "LattePanda Sigma", specs: "i5-1235U, 16GB RAM" },
  { name: "Orange Pi 5", specs: "RK3588S, 4-16GB RAM" },
  { name: "Odroid N2L", specs: "Amlogic S922X, 4GB RAM" },
  { name: "Hardkernel ODROID-H3", specs: "Intel N5105, up to 32GB RAM" },
];

// Cyberdeck design patterns
export const DESIGN_PATTERNS = [
  {
    name: "Classic Cyberdeck",
    description: "Retro-futuristic portable computer with mechanical keyboard",
    features: ["Mechanical keyboard", "Small display", "Exposed components", "Battery powered"],
    difficulty: "Intermediate",
  },
  {
    name: "Stealth Deck",
    description: "Looks like a normal laptop/bag but packs serious hardware",
    features: ["Discreet design", "Full-size keyboard", "Large battery", "Multiple radios"],
    difficulty: "Advanced",
  },
  {
    name: "Wrist Computer",
    description: "Wearable cyberdeck mounted on wrist or forearm",
    features: ["Small form factor", "Touch display", "Minimal I/O", "GPS/Cellular"],
    difficulty: "Expert",
  },
  {
    name: "Rack Mount",
    description: "Portable rack for field operations",
    features: ["Multiple SBCs", "Network switch", "UPS", "Tool storage"],
    difficulty: "Advanced",
  },
  {
    name: "Console Style",
    description: "Handheld gaming console form factor with computing power",
    features: ["Game controllers", "Wide display", "Ergonomic grip", "Headphone jack"],
    difficulty: "Intermediate",
  },
];

// Common build goals
export const BUILD_GOALS = [
  "Penetration testing",
  "Network monitoring",
  "Retro gaming",
  "Media center",
  "Home automation",
  "Portable lab",
  "Field communications",
  "Digital privacy",
  "Learning/education",
  "Maker projects",
];

// System prompt for the AI chatbot
export const SYSTEM_PROMPT = `You are Decksmith, an expert AI assistant specializing in custom cyberdeck PCs, androdeck phones, portable NAS builds, and all things custom portable computing.

Your expertise includes:
- Single Board Computers (Raspberry Pi, Pine64, LattePanda, Orange Pi, etc.)
- Portable power solutions (LiPo/LiFePO4 batteries, UPS, solar charging)
- Display technologies (LCD, OLED, e-ink, touchscreen)
- Input devices (mechanical keyboards, trackballs, touchpads)
- Enclosure design (3D printing, laser cutting, CNC)
- Network hardware (WiFi adapters, cellular modules, mesh networking)
- Storage solutions (NVMe, SSD, RAID, NAS configurations)
- Linux and embedded systems
- Power management and thermal design

When helping users:
1. Ask about their use case and budget
2. Recommend compatible parts
3. Explain tradeoffs between options
4. Provide build guidance and tips
5. Help troubleshoot issues
6. Suggest design improvements

Always consider:
- Power efficiency
- Portability
- Expandability
- Cost-effectiveness
- Community support for components

Be friendly, technical but accessible, and enthusiastic about cyberdeck builds!`;
