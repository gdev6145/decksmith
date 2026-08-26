import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Tag,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Trash2,
  ExternalLink,
  Plus,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Shield,
  Eye,
  Sliders,
  DollarSign,
  Cpu,
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { useNotification } from "../NotificationContext";
import { API_URL } from "../lib/config";
import { soundFx } from "../lib/soundFx";

interface WatchedItem {
  id: string;
  partId: string;
  partName: string;
  partSlug: string;
  partCategory: string;
  vendor: string;
  initialPrice: number;
  currentPrice: number;
  minPriceTarget: number | null;
  deltaAmount: number;
  deltaPercent: number;
  alertOnDrop: boolean;
  alertOnIncrease: boolean;
  active: boolean;
  lastCheckedAt: string;
  history?: Array<{ id: string; price: number; source: string; scrapedAt: string }>;
}

const POPULAR_WATCH_TARGETS = [
  { slug: "raspberry-pi-5", name: "Raspberry Pi 5 (8GB)", defaultPrice: 80.0, category: "sbc" },
  { slug: "waveshare-11-9-inch-lcd", name: "11.9\" Ultrawide Touch LCD (320x1480)", defaultPrice: 84.99, category: "display" },
  { slug: "starfive-visionfive-2", name: "StarFive VisionFive 2 RISC-V SBC", defaultPrice: 85.0, category: "sbc" },
  { slug: "hackrf-one-sdr", name: "HackRF One 1MHz-6GHz SDR", defaultPrice: 175.0, category: "rf" },
  { slug: "sofle-v2-split-keyboard", name: "Sofle v2 Split Ergonomic Keyboard Kit", defaultPrice: 65.0, category: "keyboard" },
  { slug: "scd41-co2-sensor", name: "Sensirion SCD41 True CO2 NDIR Sensor", defaultPrice: 38.5, category: "sensor" },
];

export default function PriceWatchStudio() {
  const { token, isAuthenticated } = useAuth();
  const { dispatchToast } = useNotification();
  const [watchedList, setWatchedList] = useState<WatchedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [filter, setFilter] = useState<"all" | "drops" | "increases">("all");

  const fetchWatched = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/alerts`, { headers });
      if (res.ok) {
        const data = await res.json();
        setWatchedList(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatched();
  }, [token]);

  const handleUnwatch = async (id: string, name: string) => {
    soundFx.playClick();
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/alerts/${id}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        setWatchedList((prev) => prev.filter((item) => item.id !== id));
        dispatchToast({
          type: "info",
          title: "Removed Watch",
          message: `Unwatched ${name}.`,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickWatch = async (target: typeof POPULAR_WATCH_TARGETS[0]) => {
    soundFx.playConfirm();
    try {
      // Find part by slug
      const partRes = await fetch(`${API_URL}/api/parts/${target.slug}`);
      if (!partRes.ok) return;
      const part = await partRes.json();

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
        fetchWatched();
        dispatchToast({
          type: "studio",
          title: "👁️ Price Watch Active",
          message: `Now tracking live market prices for ${target.name}.`,
          url: `/parts/${target.slug}`,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunLivePriceCheck = async () => {
    soundFx.playConfirm();
    setChecking(true);
    try {
      const res = await fetch(`${API_URL}/api/alerts/check-now`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        await fetchWatched();

        if (data.alertsTriggered > 0) {
          dispatchToast({
            type: "price_drop",
            title: `🔔 ${data.alertsTriggered} Price Alert(s) Triggered!`,
            message: `Scanned ${data.checkedCount} components. New price notifications have been posted to your inbox.`,
          });
        } else {
          dispatchToast({
            type: "info",
            title: "Live Price Check Complete",
            message: `Scanned ${data.checkedCount} items across Adafruit, AliExpress & Mouser. All prices current.`,
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  const filteredItems = watchedList.filter((item) => {
    if (filter === "drops") return item.deltaPercent < 0;
    if (filter === "increases") return item.deltaPercent > 0;
    return true;
  });

  const totalSaved = watchedList.reduce((acc, item) => {
    return item.deltaAmount < 0 ? acc + Math.abs(item.deltaAmount) : acc;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-2">
            <Tag className="w-3.5 h-3.5" />
            Live Hardware Price & Restock Watcher
          </div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            Watched Hardware & Price Drops
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time component price scraping, automated drop/increase detection, and instant notification alerts
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunLivePriceCheck}
            disabled={checking}
            className="px-4 py-2.5 bg-neon-green text-black font-bold rounded-xl text-xs hover:bg-neon-green/90 transition-all flex items-center gap-2 shadow-lg shadow-neon-green/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
            <span>{checking ? "Scanning Vendors..." : "Check Prices Now"}</span>
          </button>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="text-[10px] text-gray-500 font-bold uppercase">Watched Components</div>
          <div className="text-2xl font-black text-white mt-1">{watchedList.length} Items</div>
        </div>

        <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="text-[10px] text-gray-500 font-bold uppercase">Detected Price Drops</div>
          <div className="text-2xl font-black text-neon-green mt-1">
            {watchedList.filter((i) => i.deltaPercent < 0).length} on Sale
          </div>
        </div>

        <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="text-[10px] text-gray-500 font-bold uppercase">Total Potential Savings</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">${totalSaved.toFixed(2)} USD</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          {(
            [
              { id: "all", label: `All Watched (${watchedList.length})` },
              { id: "drops", label: `Price Drops (${watchedList.filter((i) => i.deltaPercent < 0).length})` },
              { id: "increases", label: `Increases (${watchedList.filter((i) => i.deltaPercent > 0).length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setFilter(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tab.id
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-gray-900 text-gray-400 border border-gray-800 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Watched Components Table / Cards */}
      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading watched items...</div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isDrop = item.deltaPercent < 0;
            const isIncrease = item.deltaPercent > 0;

            return (
              <div
                key={item.id}
                className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-4 hover:border-amber-500/50 transition-all shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-gray-800 text-cyan-300 border border-gray-700">
                      {item.partCategory}
                    </span>

                    <button
                      onClick={() => handleUnwatch(item.id, item.partName)}
                      className="text-gray-500 hover:text-rose-400 transition-colors p-1"
                      title="Unwatch Component"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Link
                    to={`/parts/${item.partSlug}`}
                    className="text-sm font-bold text-white hover:text-neon-green transition-colors block line-clamp-2"
                  >
                    {item.partName}
                  </Link>

                  <div className="text-[11px] text-gray-500 mt-1">Vendor: {item.vendor}</div>
                </div>

                <div className="pt-3 border-t border-gray-800 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase">Live Price</div>
                      <div className="text-xl font-black text-white">${item.currentPrice.toFixed(2)}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-gray-500 uppercase">Initial Price</div>
                      <div className="text-xs text-gray-400 line-through">${item.initialPrice.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Delta Badge */}
                  <div className="flex items-center justify-between">
                    {isDrop ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-950/80 text-neon-green border border-neon-green/40 flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>
                          -${Math.abs(item.deltaAmount).toFixed(2)} ({item.deltaPercent.toFixed(1)}%)
                        </span>
                      </span>
                    ) : isIncrease ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-950/80 text-rose-400 border border-rose-500/40 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>
                          +${item.deltaAmount.toFixed(2)} (+{item.deltaPercent.toFixed(1)}%)
                        </span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-800 text-gray-400 border border-gray-700">
                        Price Unchanged
                      </span>
                    )}

                    <Link
                      to={`/parts/${item.partSlug}`}
                      className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 bg-gray-900/40 border border-gray-800 border-dashed rounded-3xl text-center space-y-3">
          <Tag className="w-8 h-8 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold text-gray-300">No components currently watched in this filter</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Click "Quick Watch" below or tap the "Watch Price" button on any part in the catalog to track real-time price drops!
          </p>
        </div>
      )}

      {/* Quick Watch Top Cyberdeck Hardware */}
      <div className="p-6 bg-gray-900/80 border border-gray-800 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Quick Watch Top Cyberdeck Components
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              1-click track high-demand parts across Adafruit, AliExpress, Mouser & DigiKey
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {POPULAR_WATCH_TARGETS.map((target) => (
            <div
              key={target.slug}
              className="p-3.5 bg-gray-950 border border-gray-800 rounded-2xl flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{target.name}</div>
                <div className="text-[10px] text-gray-500">MSRP ~${target.defaultPrice.toFixed(2)} USD</div>
              </div>

              <button
                onClick={() => handleQuickWatch(target)}
                className="px-3 py-1.5 bg-gray-900 border border-gray-700 hover:border-neon-green text-neon-green font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Watch</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
