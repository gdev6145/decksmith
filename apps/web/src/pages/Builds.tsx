import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Heart, Eye, Tag, Trash2, Loader2, Zap, Battery, DollarSign, Weight, AlertTriangle, AlertCircle, Info, Search, Clock, GitFork, GitCompareArrows, Trophy, Sparkles } from "lucide-react";
import { BUILD_TYPES } from "@decksmith/shared";
import BuildImage from "../components/BuildImage";
import { API_URL } from "../lib/config";

interface BuildPartData {
  id: string;
  part: { name: string; category: string; images?: string[] };
  quantity: number;
}

interface BuildEstimate {
  cost: number | null;
  powerW: number;
  weightG: number;
  battery: { capacityMah: number; voltage: number; lifeHours: number | null } | null;
  difficulty: { level: string; score: number };
  buildTimeHours: number;
}

interface CompatibilityWarning {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
}

interface BuildCompatibility {
  warnings: CompatibilityWarning[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

interface BuildData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  type: string;
  tags: string[];
  budget: number | null;
  upvotes: number;
  views: number;
  parts: BuildPartData[];
  estimate?: BuildEstimate;
  compatibility?: BuildCompatibility;
  createdAt: string;
}

const buildTypes = ["All", ...Object.values(BUILD_TYPES)];

export default function Builds() {
  const [builds, setBuilds] = useState<BuildData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("All");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Cyberdeck");
  const [budget, setBudget] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [compareQueue, setCompareQueue] = useState<string[]>([]); // build IDs selected for comparison

  const fetchBuilds = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== "All") params.set("type", selectedType);
      if (search) params.set("search", search);
      const res = await fetch(`${API_URL}/api/builds?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBuilds(data);
        data.forEach((b: BuildData) => {
          fetchEstimate(b.id);
          fetchCompatibility(b.id);
        });
      }
    } catch {
      setBuilds([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstimate = async (buildId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/builds/${buildId}/estimate`);
      if (res.ok) {
        const est = await res.json();
        setBuilds((prev) =>
          prev.map((b) => (b.id === buildId ? { ...b, estimate: est } : b))
        );
      }
    } catch {
      // ignore
    }
  };

  const fetchCompatibility = async (buildId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/builds/${buildId}/compatibility`);
      if (res.ok) {
        const compat = await res.json();
        setBuilds((prev) =>
          prev.map((b) => (b.id === buildId ? { ...b, compatibility: compat } : b))
        );
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchBuilds(), 300);
    return () => clearTimeout(timer);
  }, [selectedType, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/builds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          type,
          budget: budget ? parseFloat(budget) : undefined,
          tags: tags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean),
        }),
      });
      if (res.ok) {
        setTitle("");
        setDescription("");
        setTags("");
        setBudget("");
        setShowCreate(false);
        fetchBuilds();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/builds/${id}`, { method: "DELETE" });
      fetchBuilds();
    } catch {
      // ignore
    }
  };

  const handleFork = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/builds/${id}/fork`, { method: "POST" });
      if (res.ok) {
        const forked = await res.json();
        window.location.href = `/builds/${forked.slug}`;
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Community Builds</h1>
          <p className="text-gray-400 mt-1">Browse cyberdeck builds from the community</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/leaderboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-yellow-400 transition-all"
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </a>
          <a
            href="/compare"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-neon-green transition-all"
          >
            <GitCompareArrows className="w-5 h-5" />
            Compare
          </a>
          <Link
            to="/builder"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neon-green to-cyan-400 text-gray-950 font-bold rounded-lg hover:opacity-90 transition-all shadow-md shadow-neon-green/10"
          >
            <Sparkles className="w-5 h-5" />
            Blueprint Studio
          </Link>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-200 font-semibold rounded-lg hover:bg-gray-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            Quick Build
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="mb-8 p-6 bg-gray-900/50 border border-gray-800 rounded-xl space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-100">Create a Build</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Pocket Pentester"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-neon-green transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Build Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-neon-green transition-colors"
              >
                {Object.values(BUILD_TYPES).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your build..."
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-neon-green transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Budget ($)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 300"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-neon-green transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. pentesting, portable, budget"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-neon-green transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="px-4 py-2 bg-neon-green text-gray-900 font-semibold rounded-lg hover:bg-neon-green/90 transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Create Build"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search builds by name, parts, or tags..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-gray-100 focus:outline-none focus:border-neon-green transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {buildTypes.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedType(filter)}
            className={`px-4 py-2 rounded-lg transition-all text-sm ${
              selectedType === filter
                ? "bg-neon-green text-gray-900 font-semibold"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-neon-green"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
        </div>
      )}

      {/* Build Grid */}
      {!loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {builds.map((build) => (
            <Link
              key={build.id}
              to={`/builds/${build.slug}`}
              className="block bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all group"
            >
              {/* Image */}
              <div className="aspect-[1200/630] bg-gray-900">
                <BuildImage
                  title={build.title}
                  type={build.type}
                  slug={build.slug}
                  parts={build.parts}
                  tags={build.tags}
                  budget={build.budget}
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-100 group-hover:text-neon-green transition-colors">
                    {build.title}
                  </h3>
                  <span className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded">
                    {build.type}
                  </span>
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {build.description || "No description provided."}
                </p>

                {/* Parts count */}
                {build.parts.length > 0 && (
                  <p className="text-xs text-gray-500 mb-2">
                    {build.parts.length} part{build.parts.length > 1 ? "s" : ""} ·{" "}
                    {build.parts.map((p) => p.part.name).join(", ").slice(0, 80)}
                    {build.parts.reduce((a, p) => a + p.part.name.length, 0) > 80 ? "…" : ""}
                  </p>
                )}

                {/* Tags */}
                {build.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {build.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-gray-800/50 text-gray-500 rounded flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Estimate */}
                {build.estimate && build.parts.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3 text-xs">
                    {build.estimate.cost != null && (
                      <span className="flex items-center gap-1 text-neon-green">
                        <DollarSign className="w-3 h-3" />
                        ${build.estimate.cost.toFixed(0)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Zap className="w-3 h-3" />
                      {build.estimate.powerW.toFixed(1)}W
                    </span>
                    {build.estimate.battery && (
                      <span className="flex items-center gap-1 text-blue-400">
                        <Battery className="w-3 h-3" />
                        {build.estimate.battery.lifeHours != null
                          ? `${build.estimate.battery.lifeHours}h`
                          : `${build.estimate.battery.capacityMah}mAh`}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-gray-500">
                      <Weight className="w-3 h-3" />
                      {(build.estimate.weightG / 1000).toFixed(1)}kg
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3 h-3" />
                      {build.estimate.buildTimeHours}h
                    </span>
                  </div>
                )}

                {/* Compatibility Warnings */}
                {build.compatibility && build.compatibility.warnings.length > 0 && (
                  <div className="mb-3 space-y-1">
                    {build.compatibility.warnings.slice(0, 2).map((w) => (
                      <div
                        key={w.code}
                        className={`flex items-start gap-1.5 text-xs rounded px-2 py-1 ${
                          w.severity === "error"
                            ? "bg-red-900/30 text-red-400"
                            : w.severity === "warning"
                            ? "bg-yellow-900/30 text-yellow-400"
                            : "bg-blue-900/30 text-blue-400"
                        }`}
                      >
                        {w.severity === "error" ? (
                          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                        ) : w.severity === "warning" ? (
                          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                        ) : (
                          <Info className="w-3 h-3 mt-0.5 shrink-0" />
                        )}
                        <span>{w.message}</span>
                      </div>
                    ))}
                    {build.compatibility.warnings.length > 2 && (
                      <p className="text-xs text-gray-500 pl-5">
                        +{build.compatibility.warnings.length - 2} more
                      </p>
                    )}
                  </div>
                )}

                {/* Difficulty */}
                {build.estimate?.difficulty && (
                  <div className="mb-3">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      build.estimate.difficulty.level === "Easy"
                        ? "bg-green-900/40 text-green-400"
                        : build.estimate.difficulty.level === "Medium"
                        ? "bg-yellow-900/40 text-yellow-400"
                        : build.estimate.difficulty.level === "Hard"
                        ? "bg-orange-900/40 text-orange-400"
                        : "bg-red-900/40 text-red-400"
                    }`}>
                      {build.estimate.difficulty.level}
                    </span>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {build.upvotes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {build.views}
                  </span>
                  {build.budget != null && (
                    <span className="ml-auto text-neon-green font-semibold">
                      ${build.budget}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setCompareQueue((prev) => {
                        if (prev.includes(build.id)) return prev.filter((id) => id !== build.id);
                        if (prev.length >= 2) return [prev[1], build.id];
                        return [...prev, build.id];
                      });
                    }}
                    className={`p-1 transition-colors ${
                      compareQueue.includes(build.id)
                        ? "text-neon-green"
                        : "text-gray-600 hover:text-neon-green"
                    }`}
                    title={compareQueue.includes(build.id) ? "Remove from compare" : "Add to compare"}
                  >
                    <GitCompareArrows className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleFork(build.id)}
                    className="p-1 text-gray-600 hover:text-neon-green transition-colors"
                    title="Fork build"
                  >
                    <GitFork className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(build.id)}
                    className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && builds.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500">No builds found. Create the first one!</p>
        </div>
      )}

      {/* Floating Compare Bar */}
      {compareQueue.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 border border-neon-green/50 rounded-xl px-5 py-3 shadow-2xl shadow-neon-green/10">
          <GitCompareArrows className="w-5 h-5 text-neon-green" />
          <span className="text-sm text-gray-200">
            {compareQueue.length === 1
              ? `${builds.find((b) => b.id === compareQueue[0])?.title} — Select one more`
              : `Compare ${builds.find((b) => b.id === compareQueue[0])?.title} vs ${builds.find((b) => b.id === compareQueue[1])?.title}`}
          </span>
          {compareQueue.length === 2 && (
            <a
              href={`/compare?ids=${compareQueue.join(",")}`}
              className="px-3 py-1.5 bg-neon-green text-gray-900 font-semibold rounded-lg text-sm hover:bg-neon-green/90 transition-all"
            >
              Compare Now →
            </a>
          )}
          <button
            onClick={() => setCompareQueue([])}
            className="text-gray-500 hover:text-gray-200 transition-colors text-lg leading-none ml-1"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}