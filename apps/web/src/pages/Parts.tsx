import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Star,
  ExternalLink,
  Loader2,
  GitCompareArrows,
  X,
  Plus,
  Cpu,
  Monitor,
  BatteryCharging,
  Keyboard,
  HardDrive,
  Fan,
  Wifi,
  Eye,
  Mic,
  Box,
  Layers,
  Tag,
  ArrowUpDown,
  SlidersHorizontal,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Radio,
} from "lucide-react";
import { PART_CATEGORIES } from "@decksmith/shared";
import { API_URL } from "../lib/config";
import { useAuth } from "../AuthContext";
import { useNotification } from "../NotificationContext";
import { soundFx } from "../lib/soundFx";

function getCategoryIcon(category: string) {
  switch (category.toUpperCase()) {
    case "SBC":
    case "MCU":
      return <Cpu className="w-10 h-10 text-emerald-400 opacity-80" />;
    case "DISPLAY":
      return <Monitor className="w-10 h-10 text-cyan-400 opacity-80" />;
    case "BATTERY":
    case "POWER":
      return <BatteryCharging className="w-10 h-10 text-yellow-400 opacity-80" />;
    case "KEYBOARD":
      return <Keyboard className="w-10 h-10 text-pink-400 opacity-80" />;
    case "STORAGE":
      return <HardDrive className="w-10 h-10 text-purple-400 opacity-80" />;
    case "COOLING":
      return <Fan className="w-10 h-10 text-blue-400 opacity-80" />;
    case "NETWORK":
    case "WIRELESS":
      return <Wifi className="w-10 h-10 text-indigo-400 opacity-80" />;
    case "SENSOR":
      return <Eye className="w-10 h-10 text-amber-400 opacity-80" />;
    case "AUDIO":
      return <Mic className="w-10 h-10 text-rose-400 opacity-80" />;
    case "CASE":
    case "ENCLOSURE":
      return <Box className="w-10 h-10 text-orange-400 opacity-80" />;
    default:
      return <Layers className="w-10 h-10 text-gray-400 opacity-80" />;
  }
}

interface PartData {
  id: string;
  name: string;
  slug: string;
  category: string;
  rating: number;
  images: string[];
  prices: Array<{ price: number; source: string; inStock?: boolean }>;
  specs?: Record<string, unknown> | null;
}

interface CategoryCount {
  category: string;
  count: number;
}

const FALLBACK_PARTS: PartData[] = [
  { id: "1", name: "Raspberry Pi 5 (8GB)", slug: "raspberry-pi-5", images: [], category: "SBC", rating: 4.8, prices: [{ price: 80, source: "Amazon" }] },
  { id: "2", name: "Raspberry Pi 4 (4GB)", slug: "raspberry-pi-4", images: [], category: "SBC", rating: 4.7, prices: [{ price: 55, source: "Amazon" }] },
  { id: "3", name: "Orange Pi 5 (8GB)", slug: "orange-pi-5", images: [], category: "SBC", rating: 4.4, prices: [{ price: 90, source: "AliExpress" }] },
  { id: "4", name: "7\" IPS Touchscreen", slug: "7-inch-ips-touchscreen", images: [], category: "DISPLAY", rating: 4.3, prices: [{ price: 45, source: "AliExpress" }] },
  { id: "5", name: "5\" HDMI LCD", slug: "5-inch-hdmi-lcd", images: [], category: "DISPLAY", rating: 4.2, prices: [{ price: 25, source: "AliExpress" }] },
  { id: "6", name: "10000mAh LiPo Pack", slug: "10000mah-lipo-pack", images: [], category: "BATTERY", rating: 4.6, prices: [{ price: 35, source: "Amazon" }] },
  { id: "7", name: "UPS HAT for RPi", slug: "ups-hat-rpi", images: [], category: "POWER", rating: 4.4, prices: [{ price: 30, source: "Amazon" }] },
  { id: "8", name: "Raspberry Pi Zero 2 W", slug: "raspberry-pi-zero-2-w", images: [], category: "SBC", rating: 4.5, prices: [{ price: 15, source: "Pishop" }] },
];

export default function Parts() {
  const { token } = useAuth();
  const { dispatchToast } = useNotification();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating" | "name">("featured");
  const [parts, setParts] = useState<PartData[]>(FALLBACK_PARTS);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [compareParts, setCompareParts] = useState<PartData[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [watchedPartIds, setWatchedPartIds] = useState<Set<string>>(new Set());

  const categories = ["All", ...Object.keys(PART_CATEGORIES)];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/parts/categories`);
        if (res.ok) setCategoryCounts(await res.json());
      } catch {
        // counts optional
      }
    };
    fetchCategories();
  }, []);

  const fetchWatchedIds = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/api/alerts`, { headers });
      if (res.ok) {
        const alerts = await res.json();
        setWatchedPartIds(new Set(alerts.map((a: any) => a.partId)));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchWatchedIds();
  }, [token]);

  useEffect(() => {
    const fetchParts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== "All") params.set("category", selectedCategory);
        if (search) params.set("search", search);

        const res = await fetch(`${API_URL}/api/parts?${params}`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) setParts(data);
        }
      } catch {
        // Use fallback data
      } finally {
        setLoading(false);
      }
    };

    fetchParts();
  }, [selectedCategory, search]);

  const getBestPrice = (part: PartData) =>
    part.prices?.length ? part.prices.reduce((min, p) => (p.price < min.price ? p : min)).price : 0;
  
  const getSource = (part: PartData) =>
    part.prices?.length ? part.prices.reduce((min, p) => (p.price < min.price ? p : min)).source : "Unknown";
  
  const getStockStatus = (part: PartData) => {
    if (!part.prices?.length) return { label: "No prices", color: "text-gray-500", inStock: false };
    const inStock = part.prices.filter((p) => p.inStock !== false);
    if (inStock.length === 0) return { label: "Out of stock", color: "text-red-400", inStock: false };
    if (inStock.length < part.prices.length) return { label: "Limited", color: "text-yellow-400", inStock: true };
    return { label: "In stock", color: "text-green-400", inStock: true };
  };

  const handleToggleWatch = async (part: PartData, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    soundFx.playConfirm();

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/alerts/watch`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          partId: part.id,
          alertOnDrop: true,
          alertOnIncrease: true,
        }),
      });

      if (res.ok) {
        setWatchedPartIds((prev) => new Set([...prev, part.id]));
        dispatchToast({
          type: "price_drop",
          title: "👁️ Price Watch Active",
          message: `Now tracking live market prices for ${part.name}.`,
          url: "/price-watch",
          actionLabel: "View Watched Hub",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredParts = parts
    .filter((part) => {
      const matchesSearch = part.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || part.category.toLowerCase() === selectedCategory.toLowerCase();
      const price = getBestPrice(part);
      const matchesMinPrice = !minPrice || price >= parseFloat(minPrice);
      const matchesMaxPrice = !maxPrice || price <= parseFloat(maxPrice);
      const matchesRating = part.rating >= minRating;
      const stock = getStockStatus(part);
      const matchesStock = !inStockOnly || stock.inStock;
      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesRating && matchesStock;
    })
    .sort((a, b) => {
      const priceA = getBestPrice(a);
      const priceB = getBestPrice(b);
      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    soundFx.playClick();
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const removeCompare = (id: string) => {
    soundFx.playClick();
    setCompareIds((prev) => prev.filter((x) => x !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-mono space-y-6">
      {/* Header & Watched Hub Quick Link */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-2">
            <Cpu className="w-3.5 h-3.5" />
            Verified Cyberdeck Hardware Library
          </div>
          <h1 className="text-3xl font-black text-white">Parts Catalog</h1>
          <p className="text-xs text-gray-400 mt-1">
            Browse 112+ verified SBCs, displays, batteries, LoRa modules, audio DACs, and split keyboards
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/price-watch"
            onClick={() => soundFx.playClick()}
            className="px-4 py-2.5 bg-gray-900 border border-gray-700 hover:border-amber-400 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
          >
            <Tag className="w-4 h-4 text-amber-400" />
            <span>Watched Hardware Hub ({watchedPartIds.size})</span>
          </Link>
        </div>
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="p-4 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search components by name, controller SoC, pinout, or vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-neon-green"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => {
                  soundFx.playClick();
                  setSortBy(e.target.value as any);
                }}
                className="appearance-none pl-8 pr-8 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs font-bold text-gray-200 focus:outline-none focus:border-neon-green cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="name">Name (A-Z)</option>
              </select>
              <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>

            {/* In-Stock Toggle */}
            <button
              onClick={() => {
                soundFx.playClick();
                setInStockOnly(!inStockOnly);
              }}
              className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                inStockOnly
                  ? "bg-emerald-950 text-neon-green border-neon-green/40 shadow-sm"
                  : "bg-gray-950 text-gray-400 border-gray-800 hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>In Stock Only</span>
            </button>
          </div>
        </div>

        {/* Category Pills with Live Counts */}
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => {
            const count = cat === "All" ? parts.length : parts.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-neon-green text-black border-neon-green shadow-md shadow-neon-green/10"
                    : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-black/20 text-black font-black" : "bg-gray-800 text-gray-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Parts Grid */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-neon-green mx-auto mb-2" />
          <p className="text-gray-400 text-xs">Loading hardware components...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredParts.map((part) => {
            const isWatched = watchedPartIds.has(part.id);
            const stock = getStockStatus(part);

            return (
              <Link
                key={part.id}
                to={`/parts/${part.slug}`}
                className="p-4 bg-gray-900/90 border border-gray-800 rounded-3xl hover:border-neon-green transition-all group flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Category & Icons */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-800 text-cyan-300 border border-gray-700">
                      {part.category}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Watch Price Icon Button */}
                      <button
                        onClick={(e) => handleToggleWatch(part, e)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isWatched
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                            : "bg-gray-950 text-gray-500 border-gray-800 hover:text-white hover:border-gray-700"
                        }`}
                        title={isWatched ? "Watching Price Drops" : "Watch for Price Drops"}
                      >
                        <Tag className="w-3.5 h-3.5" />
                      </button>

                      {/* Compare Icon Button */}
                      <button
                        onClick={(e) => toggleCompare(part.id, e)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          compareIds.includes(part.id)
                            ? "bg-neon-green/20 text-neon-green border-neon-green/40 shadow-sm"
                            : "bg-gray-950 text-gray-500 border-gray-800 hover:text-white hover:border-gray-700"
                        }`}
                        title="Compare Part"
                      >
                        <GitCompareArrows className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Part Visual Preview Placeholder */}
                  <div className="h-28 bg-gray-950 rounded-2xl border border-gray-800/80 flex items-center justify-center mb-3 group-hover:border-neon-green/30 transition-colors">
                    {getCategoryIcon(part.category)}
                  </div>

                  {/* Part Title */}
                  <h3 className="text-xs font-bold text-white group-hover:text-neon-green transition-colors line-clamp-2">
                    {part.name}
                  </h3>
                </div>

                {/* Footer: Rating, Stock, Price */}
                <div className="pt-3 mt-3 border-t border-gray-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-3.5 h-3.5 fill-yellow-400" />
                      <span className="font-bold">{part.rating ? part.rating.toFixed(1) : "4.8"}</span>
                    </div>

                    <div className="text-base font-black text-neon-green">
                      ${getBestPrice(part).toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className={stock.color}>{stock.label}</span>
                    <span className="text-gray-500">Source: {getSource(part)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {filteredParts.length === 0 && !loading && (
        <div className="text-center py-16 bg-gray-900/40 border border-gray-800 border-dashed rounded-3xl">
          <p className="text-gray-400 text-xs">No components match your search and filter criteria.</p>
        </div>
      )}

      {/* Compare Bar */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 px-6 py-3.5 z-50 backdrop-blur-xl shadow-2xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitCompareArrows className="w-5 h-5 text-neon-green" />
              <span className="text-xs text-gray-300 font-bold">
                {compareIds.length}/3 selected for comparison
              </span>
              <div className="flex items-center gap-2">
                {compareIds.map((id) => {
                  const p = parts.find((x) => x.id === id);
                  return p ? (
                    <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-200">
                      {p.name.length > 20 ? p.name.slice(0, 18) + "…" : p.name}
                      <button onClick={() => removeCompare(id)} className="text-gray-500 hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            </div>

            <Link
              to={`/compare?parts=${compareIds.join(",")}`}
              className="px-4 py-2 bg-neon-green text-black font-bold text-xs rounded-xl hover:bg-neon-green/90"
            >
              Compare Specs
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
