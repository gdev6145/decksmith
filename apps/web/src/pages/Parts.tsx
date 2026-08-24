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
} from "lucide-react";
import { PART_CATEGORIES, type PartCategory } from "@decksmith/shared";
import { API_URL } from "../lib/config";

function getCategoryIcon(category: string) {
  switch (category) {
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
      return <Wifi className="w-10 h-10 text-indigo-400 opacity-80" />;
    case "SENSOR":
      return <Eye className="w-10 h-10 text-amber-400 opacity-80" />;
    case "AUDIO":
      return <Mic className="w-10 h-10 text-rose-400 opacity-80" />;
    case "CASE":
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
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [parts, setParts] = useState<PartData[]>(FALLBACK_PARTS);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [compareParts, setCompareParts] = useState<PartData[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);

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

  const countFor = (cat: string) =>
    cat === "All"
      ? parts.length
      : categoryCounts.find((c) => c.category === cat)?.count ?? 0;

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
    if (!part.prices?.length) return { label: "No prices", color: "text-gray-500" };
    const inStock = part.prices.filter((p) => p.inStock !== false);
    if (inStock.length === 0) return { label: "Out of stock", color: "text-red-400" };
    if (inStock.length < part.prices.length) return { label: "Limited", color: "text-yellow-400" };
    return { label: "In stock", color: "text-green-400" };
  };

  const filteredParts = parts.filter((part) => {
    const matchesSearch = part.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || part.category === selectedCategory;
    const price = getBestPrice(part);
    const matchesMinPrice = !minPrice || price >= parseFloat(minPrice);
    const matchesMaxPrice = !maxPrice || price <= parseFloat(maxPrice);
    const matchesRating = part.rating >= minRating;
    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesRating;
  });

  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const openCompare = async () => {
    if (compareIds.length < 2) return;
    try {
      const all = await Promise.all(
        compareIds.map(async (id) => {
          const part = parts.find((p) => p.id === id);
          if (part?.specs) return part;
          const res = await fetch(`${API_URL}/api/parts/${part?.slug || id}`);
          return res.ok ? res.json() : part;
        })
      );
      setCompareParts(all);
      setShowCompare(true);
    } catch {
      // ignore
    }
  };

  const removeCompare = (id: string) => {
    setCompareIds((prev) => prev.filter((x) => x !== id));
    setCompareParts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Parts Database</h1>
        <p className="text-gray-400 mt-1">Find the perfect components for your build</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="relative flex-1 mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search parts..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-neon-green transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                  active
                    ? "bg-neon-green text-gray-900 font-semibold"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-neon-green"
                }`}
              >
                <span>{cat === "All" ? "All" : PART_CATEGORIES[cat as PartCategory] || cat}</span>
                <span
                  className={`text-xs px-1.5 rounded-full ${
                    active ? "bg-gray-900/20 text-gray-900" : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {countFor(cat)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price & Rating Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Price:</span>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-neon-green"
          />
          <span className="text-gray-600">—</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-neon-green"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Rating:</span>
          <div className="flex gap-1">
            {[0, 3, 4, 4.5].map((r) => (
              <button
                key={r}
                onClick={() => setMinRating(r)}
                className={`px-2 py-1 text-xs rounded transition-all ${
                  minRating === r
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-gray-800 text-gray-500 hover:text-gray-300"
                }`}
              >
                {r === 0 ? "Any" : `${r}+`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
        </div>
      )}

      {/* Parts Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredParts.map((part) => (
          <Link
            to={`/parts/${part.slug}`}
            key={part.id}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all group cursor-pointer block"
          >
            {/* Image / Category Icon Placeholder */}
            <div className="h-32 bg-gray-800/80 rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-gray-700/40 group-hover:border-gray-600 transition-colors">
              {part.images && part.images.length > 0 && part.images[0] ? (
                <img
                  src={part.images[0]}
                  alt={part.name}
                  loading="lazy"
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = "none";
                    const parent = img.parentElement;
                    const placeholder = parent?.querySelector(".cat-icon-placeholder") as HTMLElement | null;
                    if (placeholder) placeholder.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="cat-icon-placeholder flex flex-col items-center justify-center gap-1.5 p-3 text-center"
                style={{ display: part.images && part.images.length > 0 && part.images[0] ? "none" : "flex" }}
              >
                {getCategoryIcon(part.category)}
              </div>
            </div>
            
            {/* Category badge */}
            <span className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded mb-2 inline-block">
              {PART_CATEGORIES[part.category as PartCategory] || part.category}
            </span>
            
            {/* Name */}
            <h3 className="font-medium text-gray-100 group-hover:text-neon-green transition-colors mb-2">
              {part.name}
            </h3>
            
            {/* Rating and Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-gray-300">{part.rating}</span>
              </div>
              <span className="text-neon-green font-semibold">${getBestPrice(part)}</span>
            </div>

            {/* Stock Status */}
            <div className={`mt-2 text-xs font-medium ${getStockStatus(part).color}`}>
              {getStockStatus(part).label}
            </div>
            
            {/* Source */}
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                {getSource(part)}
              </div>
              <button
                onClick={(e) => toggleCompare(part.id, e)}
                className={`p-1 rounded transition-all ${
                  compareIds.includes(part.id)
                    ? "text-neon-green bg-neon-green/10"
                    : "text-gray-600 hover:text-gray-400"
                }`}
                title="Compare"
              >
                <GitCompareArrows className="w-3.5 h-3.5" />
              </button>
            </div>
          </Link>
        ))}
      </div>

      {filteredParts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No parts found matching your search.</p>
        </div>
      )}

      {/* Compare Bar */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 px-6 py-3 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitCompareArrows className="w-5 h-5 text-neon-green" />
              <span className="text-sm text-gray-300">
                {compareIds.length}/3 selected
              </span>
              <div className="flex items-center gap-2">
                {compareIds.map((id) => {
                  const p = parts.find((x) => x.id === id);
                  return p ? (
                    <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
                      {p.name.length > 20 ? p.name.slice(0, 18) + "…" : p.name}
                      <button onClick={() => removeCompare(id)} className="text-gray-500 hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
            <button
              onClick={openCompare}
              disabled={compareIds.length < 2}
              className="px-4 py-2 bg-neon-green text-gray-900 font-semibold rounded-lg hover:bg-neon-green/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              Compare ({compareIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompare && compareParts.length >= 2 && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowCompare(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-gray-100">Compare Parts</h2>
              <button onClick={() => setShowCompare(false)} className="text-gray-500 hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className={`grid gap-6`} style={{ gridTemplateColumns: `repeat(${compareParts.length}, 1fr)` }}>
                {compareParts.map((part) => {
                  const specs: Record<string, unknown> = part.specs || {};
                  const specEntries = Object.entries(specs).filter(([, v]) => v !== null && v !== "");
                  const bestPrice = part.prices?.length
                    ? Math.min(...part.prices.map((p) => p.price))
                    : null;
                  return (
                    <div key={part.id} className="bg-gray-800/50 rounded-xl p-4">
                      <div className="h-24 bg-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        {part.images[0] ? (
                          <img src={part.images[0]} alt="" className="h-full object-contain mix-blend-screen" />
                        ) : (
                          <span className="text-3xl opacity-30">📦</span>
                        )}
                      </div>
                      <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded">
                        {PART_CATEGORIES[part.category as PartCategory] || part.category}
                      </span>
                      <h3 className="font-medium text-gray-100 mt-2 mb-1">{part.name}</h3>
                      <div className="flex items-center gap-1 text-sm mb-3">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-gray-300">{part.rating}</span>
                      </div>
                      {bestPrice != null && (
                        <p className="text-neon-green font-semibold text-lg mb-3">${bestPrice.toFixed(2)}</p>
                      )}
                      <div className="space-y-2">
                        {specEntries.map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                            <span className="text-gray-300 text-right">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                      <Link
                        to={`/parts/${part.slug}`}
                        className="block mt-3 text-center text-xs text-neon-green hover:underline"
                      >
                        View details →
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
