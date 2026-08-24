import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "@/lib/config";
import { ExternalLink } from "@/components/ExternalLink";
import { SpecItem } from "@/components/SpecItem";
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
} from "lucide-react";

function getPartCategoryIcon(category: string) {
  switch (category) {
    case "SBC":
    case "MCU":
      return <Cpu className="w-16 h-16 text-emerald-400 opacity-70" />;
    case "DISPLAY":
      return <Monitor className="w-16 h-16 text-cyan-400 opacity-70" />;
    case "BATTERY":
    case "POWER":
      return <BatteryCharging className="w-16 h-16 text-yellow-400 opacity-70" />;
    case "KEYBOARD":
      return <Keyboard className="w-16 h-16 text-pink-400 opacity-70" />;
    case "STORAGE":
      return <HardDrive className="w-16 h-16 text-purple-400 opacity-70" />;
    case "COOLING":
      return <Fan className="w-16 h-16 text-blue-400 opacity-70" />;
    case "NETWORK":
      return <Wifi className="w-16 h-16 text-indigo-400 opacity-70" />;
    case "SENSOR":
      return <Eye className="w-16 h-16 text-amber-400 opacity-70" />;
    case "AUDIO":
      return <Mic className="w-16 h-16 text-rose-400 opacity-70" />;
    case "CASE":
      return <Box className="w-16 h-16 text-orange-400 opacity-70" />;
    default:
      return <Layers className="w-16 h-16 text-gray-400 opacity-70" />;
  }
}

interface PriceHistory {
  source: string;
  price: number;
  currency: string;
  url: string;
  scrapedAt: string;
  image?: string;
}

interface Part {
  id: string;
  name: string;
  slug: string;
  description: string;
  specifications?: Record<string, any>;
  image?: string;
  images?: string[];
  category: string;
  manufacturer: string;
  details?: string;
}

export default function PartDetail() {
  const { slug } = useParams();
  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [reviews, setReviews] = useState<Array<{ id: string; author: string; rating: number; content: string; date: string }>>();
  const [questions, setQuestions] = useState<Array<{ id: string; title: string; content: string; createdAt: string }>>();
  const [altErs, setAltErs] = useState<Array<{ id: string; name: string; slug: string }>>();
  const [priceHistory, setPriceHistory] = useState<Array<PriceHistory>>();
  const [benchmarks, setBenchmarks] = useState<Record<string, Array<{ value: number; unit: string; config: string | null; user: string; createdAt: string }>>>({});
  const [compatMatrix, setCompatMatrix] = useState<Array<{ name: string; slug: string; category: string; count: number }>>();
  const [showAskQuestion, setShowAskQuestion] = useState(false);
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionContent, setQuestionContent] = useState("");

  useEffect(() => {
    const fetchPart = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/parts/${slug}`);
        if (res.ok) {
          const data = await res.json() as Part;
          setPart(data);
          const firstImg = (data.images && data.images.length > 0) ? data.images[0] : (data.image || "");
          setSelectedImage(firstImg);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchPart();
  }, [slug]);

  const fetchProjects = async (partId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/builds`);
      if (res.ok) {
        const builds = await res.json();
        const matching = builds.filter((b: { parts: Array<{ part: { id: string } }> }) =>
          b.parts.some((bp) => bp.part.id === partId)
        );
        setProjects(matching.slice(0, 4));
      }
    } catch {
      // ignore
    }
  };

  const fetchReviews = async (slug: string) => {
    try {
      const res = await fetch(`${API_URL}/api/reviews?partSlug=${slug}`);
      if (res.ok) setReviews(await res.json());
    } catch {
      // ignore
    }
  };

  const fetchAlternatives = async (slug: string) => {
    try {
      const res = await fetch(`${API_URL}/api/alternatives?partSlug=${slug}`);
      if (res.ok) setAltErs(await res.json());
    } catch {
      // ignore
    }
  };

  const fetchQuestions = async (slug: string) => {
    try {
      const res = await fetch(`${API_URL}/api/questions?partSlug=${slug}`);
      if (res.ok) setQuestions(await res.json());
    } catch {
      // ignore
    }
  };

  const fetchPriceHistory = async (partSlug: string) => {
    try {
      const res = await fetch(`${API_URL}/api/parts/${partSlug}/price-history`);
      if (res.ok) setPriceHistory(await res.json());
    } catch {
      // ignore
    }
  };

  const fetchBenchmarks = async (partSlug: string) => {
    try {
      const res = await fetch(`${API_URL}/api/benchmarks?partSlug=${partSlug}`);
      if (res.ok) setBenchmarks(await res.json());
    } catch {
      // ignore
    }
  };

  const fetchCompatMatrix = async (partId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/compatibility-matrix?partId=${partId}`);
      if (res.ok) setCompatMatrix(await res.json());
    } catch {
      // ignore
    }
  };

  const submitQuestion = async () => {
    if (!part || !questionTitle.trim() || !questionContent.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/parts/${part.slug}/questions`, {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: questionTitle, content: questionContent }),
      });
      if (res.ok) {
        const q = await res.json();
        setQuestions((prev) => [q, ...(prev ?? [])]);
        setQuestionTitle("");
        setQuestionContent("");
        setShowAskQuestion(false);
      }
    } catch {
      // ignore
    }
  };

  if (!part) {
    return <div>Loading part...</div>;
  }

  const sortedPrices = [...(priceHistory ?? [])].sort((a, b) => b.price - a.price);

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">{part.name}</h1>
          <button onClick={() => setShowAskQuestion(true)} className="bg-neon-green text-black px-4 py-2 rounded hover:bg-green-400 transition-colors">
            Ask Question
          </button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {loading ? (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <span className="animate-spin h-8 w-8 inline-block mr-2 opacity-60" />
            <span className="text-gray-300">Loading part details...</span>
          </div>
        ) : part.slug !== slug ? (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <h2 className="text-xl text-gray-300">Part not found</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Hero Image / Gallery */}
              <div className="bg-gray-800/60 border border-gray-700/70 rounded-xl overflow-hidden mb-4">
                <div className="h-64 sm:h-72 w-full flex items-center justify-center p-6 bg-gray-900/40 relative">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={part.name}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain transition-all duration-300 hover:scale-105"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3">
                      {getPartCategoryIcon(part.category)}
                      <span className="text-xs uppercase tracking-widest text-gray-500 font-mono font-semibold">
                        {part.category} COMPONENT
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {part.images && part.images.length > 1 && (
                  <div className="flex gap-2 p-3 bg-gray-950/60 border-t border-gray-800 overflow-x-auto">
                    {part.images.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(imgUrl)}
                        className={`w-16 h-16 rounded-lg border overflow-hidden shrink-0 transition-all p-1 bg-gray-900 ${
                          selectedImage === imgUrl
                            ? "border-neon-green ring-2 ring-neon-green/30"
                            : "border-gray-700/60 hover:border-gray-500 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={imgUrl} alt={`${part.name} ${idx + 1}`} className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="px-2 py-0.5 bg-gray-800 text-neon-green font-medium rounded text-xs">
                  {part.category}
                </span>
                {part.manufacturer && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span>{part.manufacturer}</span>
                  </>
                )}
              </div>
              <p className="text-gray-300 mt-3 text-sm sm:text-base leading-relaxed">{part.description}</p>

              {/* Specifications */}
              {part.specifications && Object.keys(part.specifications).length > 0 && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-4 mt-6">
                  <h3 className="text-sm font-semibold text-gray-100 mb-3">Specifications</h3>
                  <div className="space-y-1.5">
                    {Object.entries(part.specifications).map(([key, value]) => (
                      <SpecItem
                        key={key}
                        label={key.replace(/([A-Z])/g, " $1")}
                        value={typeof value === "object" ? JSON.stringify(value) : String(value)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Benchmarks */}
              {Object.keys(benchmarks).length > 0 && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mt-6">
                  <h3 className="text-sm font-semibold text-gray-100 mb-3">Benchmarks</h3>
                  <div className="space-y-2">
                    {Object.entries(benchmarks).map(([unit, values]) => (
                      <div key={unit} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{unit}</span>
                        <span className="font-medium text-gray-200">{JSON.stringify(values)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compatibility Matrix */}
              {compatMatrix && compatMatrix.length > 0 && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mt-6">
                  <h3 className="text-sm font-semibold text-gray-100 mb-3">Compatibility</h3>
                  <div className="space-y-1.5">
                    {compatMatrix.map((m) => (
                      <div key={m.slug} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{m.name}</span>
                        <span className="font-medium text-gray-200">{m.count} units</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              {priceHistory && priceHistory.length > 0 && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mt-6">
                  <h3 className="text-sm font-semibold text-gray-100 mb-3">Prices</h3>
                  <div className="space-y-2">
                    {sortedPrices.map((price, i) => (
                      <a
                        key={i}
                        href={price.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 hover:border-gray-700 hover:bg-gray-900 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {price.image && (
                            <img
                              src={price.image}
                              alt=""
                              loading="lazy"
                              className="w-8 h-8 rounded object-contain bg-gray-800 mix-blend-screen"
                            />
                          )}
                          <span className="text-sm text-gray-300">{price.source}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-100">
                            {price.currency === "USD" ? "$" : price.currency} {price.price.toFixed(2)}
                          </span>
                          <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-neon-green transition-colors" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-100 mb-4">Details</h2>
                <p className="text-gray-400 text-sm">{part.details || "No details available"}</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-100 mb-4">Reviews</h2>
                {reviews?.length === 0 ? (
                  <p className="text-gray-500">No reviews yet</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {reviews?.slice(0, 3).map((review) => (
                      <div key={review.id} className="flex items-start gap-3 p-3 bg-gray-900/50 rounded">
                        <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center flex-shrink-0">
                          {review.author?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-300 text-sm">{review.content}</p>
                          <p className="text-xs text-gray-500">{review.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-100 mb-4">Alternatives</h2>
                {altErs?.length === 0 ? (
                  <p className="text-gray-500">No alternatives found</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {altErs?.map((alt) => (
                      <div
                        key={alt.slug}
                        className="border border-gray-800 rounded-lg p-3 hover:bg-gray-900 transition-colors"
                      >
                        <h3 className="text-sm font-medium text-gray-100">{alt.name}</h3>
                        <p className="text-xs text-gray-400">{alt.slug}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ask Question Form */}
        {showAskQuestion && (
          <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">Ask a Question</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitQuestion();
                }}
              >
                <div className="mb-4">
                  <label className="block text-sm text-gray-300 mb-2">Title</label>
                  <input
                    value={questionTitle}
                    onChange={(e) => setQuestionTitle(e.target.value)}
                    placeholder="Question title"
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-green"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm text-gray-300 mb-2">Content</label>
                  <textarea
                    value={questionContent}
                    onChange={(e) => setQuestionContent(e.target.value)}
                    placeholder="Question content"
                    rows={3}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-green resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAskQuestion(false)} className="flex-1 bg-gray-700 rounded px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-neon-green text-black rounded px-4 py-2 text-sm font-medium hover:bg-green-400 transition-colors">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
