import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, Loader2, Star, ExternalLink } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface WishlistItem {
  id: string;
  part: {
    id: string;
    name: string;
    slug: string;
    category: string;
    rating: number;
    images: string[];
    prices: Array<{ price: number; source: string }>;
  };
  createdAt: string;
}

export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    try {
      await fetch(`${API_URL}/api/wishlist/${partId}`, { method: "POST" });
      setItems((prev) => prev.filter((w) => w.part.id !== partId));
    } catch {
      // ignore
    }
  };

  const getBestPrice = (prices: Array<{ price: number }>) =>
    prices.length ? Math.min(...prices.map((p) => p.price)) : 0;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-400" />
          Wishlist
        </h1>
        <p className="text-gray-400 mt-1">Parts you've saved for later</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">No parts in your wishlist yet.</p>
          <Link to="/parts" className="text-neon-green hover:underline mt-2 inline-block">
            Browse parts
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-6">{items.length} part{items.length !== 1 ? "s" : ""} saved</p>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-gray-700 transition-all"
              >
                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  {item.part.images[0] ? (
                    <img src={item.part.images[0]} alt="" className="w-full h-full object-contain mix-blend-screen" />
                  ) : (
                    <span className="text-2xl opacity-30">📦</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/parts/${item.part.slug}`} className="text-sm font-medium text-gray-100 hover:text-neon-green transition-colors">
                    {item.part.name}
                  </Link>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{item.part.category}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-gray-400">{item.part.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {item.part.prices.length > 0 && (
                    <p className="text-neon-green font-semibold">${getBestPrice(item.part.prices).toFixed(2)}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => removeItem(item.part.id)}
                  className="p-2 text-gray-600 hover:text-red-400 transition-colors shrink-0"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-800">
            <p className="text-sm text-gray-500">
              Total: <span className="text-neon-green font-semibold">
                ${items.reduce((sum, w) => sum + getBestPrice(w.part.prices), 0).toFixed(2)}
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
