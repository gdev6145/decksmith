// Part categories for cyberdeck builds
export const PART_CATEGORIES = {
  SBC: "Single Board Computer",
  MCU: "Microcontroller",
  DISPLAY: "Display",
  BATTERY: "Battery",
  POWER: "Power Management",
  STORAGE: "Storage",
  CASE: "Case/Enclosure",
  KEYBOARD: "Input/Keyboard",
  NETWORK: "Network",
  AUDIO: "Audio",
  SENSOR: "Sensor",
  COOLING: "Cooling",
  CABLE: "Cables/Adapters",
  MISC: "Miscellaneous",
} as const;

export type PartCategory = keyof typeof PART_CATEGORIES;

// Build types
export const BUILD_TYPES = {
  CYBERDECK: "Cyberdeck",
  ANDRODECK: "Androdeck",
  NAS: "NAS",
  STREAMING: "Streaming Platform",
  TABLET: "Custom Tablet",
  WEARABLE: "Wearable",
  OTHER: "Other",
} as const;

export type BuildType = keyof typeof BUILD_TYPES;

// Price sources
export const PRICE_SOURCES = {
  ALIEXPRESS: "AliExpress",
  AMAZON: "Amazon",
  NEWEGG: "Newegg",
  Adafruit: "Adafruit",
  SPARKFUN: "SparkFun",
  PICONTROL: "Pishop",
} as const;

export type PriceSource = keyof typeof PRICE_SOURCES;

// Part interface
export interface Part {
  id: string;
  name: string;
  slug: string;
  category: PartCategory;
  description: string;
  specs: PartSpecs;
  prices: Price[];
  images: string[];
  compatibility: string[];
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Part specifications vary by category
export interface PartSpecs {
  // Common specs
  voltage?: number;
  dimensions?: { width: number; height: number; depth: number; unit: string };
  weight?: { value: number; unit: string };
  operatingTemp?: { min: number; max: number; unit: string };
  
  // SBC specs
  processor?: string;
  cores?: number;
  clockSpeed?: string;
  ram?: string;
  storage?: string;
  gpu?: string;
  wifi?: string;
  bluetooth?: string;
  gpio?: number;
  usbPorts?: number;
  hdmiPorts?: number;
  
  // Display specs
  screenSize?: string;
  resolution?: string;
  panelType?: string;
  touchScreen?: boolean;
  
  // Battery specs
  capacity?: string;
  chemistry?: string;
  maxDischarge?: string;
  
  // Storage specs
  storageSize?: string;
  interface?: string;
  readSpeed?: string;
  writeSpeed?: string;
  
  // Network specs
  ethernet?: string;
  ports?: number;
  
  // Custom specs
  [key: string]: unknown;
}

// Price interface
export interface Price {
  id: string;
  partId: string;
  source: PriceSource;
  price: number;
  currency: string;
  url: string;
  inStock: boolean;
  scrapedAt: Date;
}

// Build interface
export interface Build {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: BuildType;
  parts: BuildPart[];
  guides: Guide[];
  author: User;
  tags: string[];
  upvotes: number;
  views: number;
  images: string[];
  budget?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Build part with quantity and notes
export interface BuildPart {
  partId: string;
  part?: Part;
  quantity: number;
  notes?: string;
  role?: string; // e.g., "main computer", "display driver"
}

// Guide interface
export interface Guide {
  id: string;
  buildId: string;
  title: string;
  steps: GuideStep[];
  createdAt: Date;
  updatedAt: Date;
}

// Guide step
export interface GuideStep {
  order: number;
  title: string;
  description: string;
  images?: string[];
  tips?: string[];
  warnings?: string[];
}

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  builds: Build[];
  createdAt: Date;
}

// Chat message
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    buildId?: string;
    partId?: string;
    action?: string;
  };
}

// Chat session
export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  context?: {
    buildId?: string;
    parts?: string[];
    buildType?: BuildType;
  };
  createdAt: Date;
  updatedAt: Date;
}

// AI provider
export type AIProvider = "openai" | "anthropic" | "google" | "ollama";

// AI model
export interface AIModel {
  provider: AIProvider;
  model: string;
  displayName: string;
  maxTokens: number;
  supportsImages: boolean;
  supportsTools: boolean;
}
