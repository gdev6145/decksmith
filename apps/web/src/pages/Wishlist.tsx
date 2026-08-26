import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Trash2,
  Loader2,
  Star,
  ExternalLink,
  Tag,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Check,
  Zap,
} from "lucide-react";
import { API_URL } from "../lib/config";
import { soundFx } from "../lib/soundFx";

interface WishlistItem {
  id: string;
  part: {
    id: string;
    name: string;
    slug: string;
    category: string;
    rating: number;
    images: string[];
    prices: Array<{ price: number; source: string; url?: string }>;
  };
  createdAt: string;
}

export default function Wishlist() {
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchingAll, setWatchingAll] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/wishlist`);
      if (res.ok) setItems(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (partId: string) => {
    soundFx.playClick();
    try {
      await fetch(`${API_URL}/api/wishlist/${partId}`, { method: "POST" });
      setItems((prev) => prev.filter((w) => w.part.id !== partId));
    } catch {
      // ignore
    }
  };

  const getBestPrice = (prices: Array<{ price: number }>) =>
    prices.length ? Math.min(...prices.map((p) => p.price)) : 0;

  const totalCost = useMemo(() => {
    return items.reduce((acc, item) => acc + getBestPrice(item.part.prices || []), 0);
  }, [items]);

  const handleWatchAll = async () => {
    soundFx.playConfirm();
    setWatchingAll(true);
    try {
      for (const item of items) {
        await fetch(`${API_URL}/api/alerts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partId: item.part.id, targetPrice: getBestPrice(item.part.prices) }),
        });
      }
      setTimeout(() => setWatchingAll(false), 2000);
    } catch {
      setWatchingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30 mb-2">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            Hardware Wishlist & Saved Components
          </div>
          <h1 className="text-3xl font-black text-white">Hardware Wishlist</h1>
          <p className="text-xs text-gray-400 mt-1">Track components you plan to buy or integrate into upcoming cyberdecks</p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleWatchAll}
              className="px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{watchingAll ? "All Watched ✓" : "Watch All Prices"}</span>
            </button>

            <button
              onClick={() => {
                soundFx.playConfirm();
                navigate("/builder");
              }}
              className="px-4 py-2.5 bg-neon-green text-black font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-neon-green/20 hover:bg-emerald-400 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open in Builder</span>
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 p-8 bg-gray-900/40 rounded-3xl border border-gray-800 space-y-4">
          <Heart className="w-12 h-12 text-gray-700 mx-auto" />
          <p className="text-gray-400 text-sm">No hardware saved to your wishlist yet.</p>
          <Link
            to="/parts"
            onClick={() => soundFx.playClick()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neon-green text-black font-bold rounded-xl text-xs shadow-lg shadow-neon-green/20 hover:bg-emerald-400 transition-all"
          >
            <span>Explore Hardware Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* Summary Banner */}
          <div className="p-4 bg-gray-900/90 border border-gray-800 rounded-2xl flex items-center justify-between shadow-xl">
            <span className="text-xs text-gray-400">
              <strong className="text-white">{items.length}</strong> Saved Components
            </span>
            <div className="text-xs">
              <span className="text-gray-400 mr-2">Total Estimated Cost:</span>
              <span className="text-lg font-black text-neon-green font-mono">${totalCost.toFixed(2)} USD</span>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {items.map((item) => {
              const bestPrice = getBestPrice(item.part.prices || []);

              return (
                <div
                  key={item.id}
                  className="bg-gray-900/80 border border-gray-800 hover:border-gray-700 rounded-2xl p-4 flex items-center gap-4 transition-all shadow-lg"
                >
                  <div className="w-16 h-16 bg-gray-950 rounded-xl flex items-center justify-center shrink-0 border border-gray-800 overflow-hidden">
                    {item.part.images && item.part.images[0] ? (
                      <img src={item.part.images[0]} alt="" className="w-full h-full object-contain p-1" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-gray-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/parts/${item.part.slug}`}
                      onClick={() => soundFx.playClick()}
                      className="text-xs font-bold text-gray-100 hover:text-neon-green transition-colors truncate block"
                    >
                      {item.part.name}
                    </Link>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                      <span className="px-2 py-0.5 rounded bg-gray-950 border border-gray-800 text-cyan-300 font-bold uppercase">
                        {item.part.category}
                      </span>
                      <div className="flex items-center gap-1 text-yellow-400 font-bold">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        <span>{item.part.rating ? item.part.rating.toFixed(1) : "4.9"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-neon-green font-mono">
                      {bestPrice > 0 ? `$${bestPrice.toFixed(2)}` : "Check Vendor"}
                    </div>
                    <span className="text-[10px] text-gray-500">USD</span>
                  </div>

                  <button
                    onClick={() => removeItem(item.part.id)}
                    className="p-2 rounded-xl text-gray-500 hover:text-rose-400 hover:bg-gray-800 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
