import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_URL } from "@/lib/config";
import { ExternalLink } from "@/components/ExternalLink";
import {
  Zap,
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
  Star,
  Plus,
  ArrowRight,
  ShieldCheck,
  Check,
  Share2,
  Sparkles,
  ChevronRight,
  MessageSquare,
  Activity,
  DollarSign,
  Send,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

function getPartCategoryIcon(category: string) {
  switch (category) {
    case "SBC":
    case "MCU":
      return <Cpu className="w-10 h-10 text-emerald-400" />;
    case "DISPLAY":
      return <Monitor className="w-10 h-10 text-cyan-400" />;
    case "BATTERY":
    case "POWER":
      return <BatteryCharging className="w-10 h-10 text-yellow-400" />;
    case "KEYBOARD":
      return <Keyboard className="w-10 h-10 text-pink-400" />;
    case "STORAGE":
      return <HardDrive className="w-10 h-10 text-purple-400" />;
    case "COOLING":
      return <Fan className="w-10 h-10 text-blue-400" />;
    case "NETWORK":
      return <Wifi className="w-10 h-10 text-indigo-400" />;
    case "SENSOR":
      return <Eye className="w-10 h-10 text-amber-400" />;
    case "AUDIO":
      return <Mic className="w-10 h-10 text-rose-400" />;
    case "CASE":
      return <Box className="w-10 h-10 text-orange-400" />;
    default:
      return <Layers className="w-10 h-10 text-gray-400" />;
  }
}

interface PriceItem {
  source: string;
  price: number;
  currency: string;
  url: string;
  scrapedAt: string;
  image?: string;
}

interface AlternativePart {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  rating: number;
  description: string;
  specs?: Record<string, any>;
}

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  content: string;
  date: string;
}

interface Part {
  id: string;
  name: string;
  slug: string;
  description: string;
  specifications?: Record<string, any>;
  specs?: string;
  image?: string;
  images?: string[];
  category: string;
  rating?: number;
  prices?: PriceItem[];
  compatibility?: string;
}

export default function PartDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [alternatives, setAlternatives] = useState<AlternativePart[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewContent, setNewReviewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchPart = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/parts/${slug}`);
        if (res.ok) {
          const data = (await res.json()) as Part;
          setPart(data);
          const firstImg = data.images && data.images.length > 0 ? data.images[0] : data.image || "";
          setSelectedImage(firstImg);

          // Fetch reviews and alternatives
          fetchReviews(data.slug);
          fetchAlternatives(data.slug);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchPart();
  }, [slug]);

  const fetchReviews = async (partSlug: string) => {
    try {
      const res = await fetch(`${API_URL}/api/reviews?partSlug=${partSlug}`);
      if (res.ok) setReviews(await res.json());
    } catch {
      // ignore
    }
  };

  const fetchAlternatives = async (partSlug: string) => {
    try {
      const res = await fetch(`${API_URL}/api/alternatives?partSlug=${partSlug}`);
      if (res.ok) setAlternatives(await res.json());
    } catch {
      // ignore
    }
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!part || !newReviewContent.trim()) return;

    setSubmittingReview(true);
    soundFx.playConfirm();
    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partSlug: part.slug,
          rating: newRating,
          content: newReviewContent,
        }),
      });

      if (res.ok) {
        const addedReview = await res.json();
        setReviews((prev) => [addedReview, ...prev]);
        setNewReviewContent("");
        setShowReviewModal(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <span className="w-8 h-8 rounded-full border-2 border-neon-green border-t-transparent animate-spin inline-block mr-3" />
        <span className="text-gray-300 font-mono">Loading hardware component dossier...</span>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Part Not Found</h2>
        <p className="text-gray-400 font-mono">The requested hardware slug could not be resolved.</p>
        <Link to="/parts" className="inline-block px-4 py-2 bg-neon-green text-black font-bold rounded-xl">
          Back to Parts Catalog
        </Link>
      </div>
    );
  }

  const primaryPrice = part.prices && part.prices.length > 0 ? part.prices[0] : null;
  const parsedSpecs = part.specifications || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
        <Link to="/parts" className="hover:text-neon-green transition-colors">
          Parts Catalog
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-300">{part.category}</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neon-green font-bold">{part.name}</span>
      </div>

      {/* Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Component Visual & Category */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-8 rounded-2xl bg-gray-900/80 border border-gray-800 flex flex-col items-center justify-center min-h-[300px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gray-950/80 border border-gray-800 text-[10px] font-mono text-cyan-300 font-bold uppercase">
              {part.category}
            </div>

            {selectedImage ? (
              <img
                src={selectedImage}
                alt={part.name}
                className="max-h-56 max-w-full object-contain rounded-xl transition-all duration-300 hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="p-6 rounded-2xl bg-gray-950 border border-gray-800/80 flex flex-col items-center gap-3">
                {getPartCategoryIcon(part.category)}
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">{part.category} MODULE</span>
              </div>
            )}
          </div>

          {/* Quick Action Button: Add to Blueprint */}
          <button
            onClick={() => {
              soundFx.playConfirm();
              navigate(`/builder`);
            }}
            className="w-full py-3.5 rounded-xl bg-neon-green text-black font-bold font-mono text-sm hover:bg-neon-green/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-neon-green/10"
          >
            <Sparkles className="w-4 h-4" />
            Open in 10-Slot Blueprint Studio
          </button>
        </div>

        {/* Right: Component Dossier & Pricing */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-neon-green border border-neon-green/30">
                Verified Hardware Spec
              </span>
              <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold font-mono">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                {part.rating ? part.rating.toFixed(1) : "4.9"} (Community Score)
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">{part.name}</h1>
            <p className="text-sm text-gray-300 leading-relaxed">{part.description}</p>
          </div>

          {/* Pricing Card */}
          {primaryPrice && (
            <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 flex items-center justify-between shadow-xl">
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase block font-bold">Estimated Retail Price</span>
                <div className="text-2xl font-black text-neon-green font-mono">
                  ${primaryPrice.price.toFixed(2)} <span className="text-xs text-gray-400 font-normal">USD</span>
                </div>
                <span className="text-xs text-cyan-300 font-mono">Verified Source: {primaryPrice.source}</span>
              </div>

              <a
                href={primaryPrice.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-mono text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Vendor Lookup</span>
                <ExternalLink className="w-3.5 h-3.5 text-neon-green" />
              </a>
            </div>
          )}

          {/* Technical Specifications Grid */}
          {Object.keys(parsedSpecs).length > 0 && (
            <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                Technical Specifications & Pinout Metrics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {Object.entries(parsedSpecs).map(([k, v]) => (
                  <div key={k} className="p-2.5 rounded-lg bg-gray-950 border border-gray-800/80">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">{k}</span>
                    <span className="text-cyan-300 font-bold break-words">{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side-by-Side Alternatives & Review Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* Left: Community Reviews & Field Reports */}
        <div className="lg:col-span-7 bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-neon-green" />
              Builder Reviews & Field Reports ({reviews.length})
            </h3>
            <button
              onClick={() => {
                soundFx.playClick();
                setShowReviewModal(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/30 text-neon-green font-mono text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Write Review
            </button>
          </div>

          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl bg-gray-950 border border-gray-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-500/30 text-indigo-300 font-mono text-xs flex items-center justify-center font-bold">
                      {rev.author.charAt(0)}
                    </span>
                    <span className="text-xs font-bold text-white font-mono">{rev.author}</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400 text-xs">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400" />
                    ))}
                    <span className="text-gray-500 text-[10px] ml-1">{rev.date}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">{rev.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Smart Alternatives & Competitor Comparison */}
        <div className="lg:col-span-5 bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Smart Alternatives & Comparison ({alternatives.length})
            </h3>
            <span className="text-xs text-gray-400 font-mono">{part.category}</span>
          </div>

          {alternatives.length === 0 ? (
            <p className="text-xs text-gray-400 font-mono">No direct alternatives found in catalog.</p>
          ) : (
            <div className="space-y-3">
              {alternatives.map((alt) => (
                <Link
                  key={alt.slug}
                  to={`/parts/${alt.slug}`}
                  onClick={() => soundFx.playClick()}
                  className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 hover:border-cyan-400/50 block transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {alt.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-neon-green">${alt.price.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{alt.description}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase">Submit Builder Review</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handlePostReview} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 text-yellow-400"
                    >
                      <Star className={`w-5 h-5 ${star <= newRating ? "fill-yellow-400" : "text-gray-600"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Field Experience & Review</label>
                <textarea
                  rows={4}
                  value={newReviewContent}
                  onChange={(e) => setNewReviewContent(e.target.value)}
                  placeholder="Share details regarding thermal performance, pinout quirks, or power consumption..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 font-mono resize-none focus:border-neon-green"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-800 bg-gray-950 text-xs font-mono text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-2.5 rounded-xl bg-neon-green text-black font-bold font-mono text-xs hover:bg-neon-green/90 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingReview ? "Posting..." : "Post Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
