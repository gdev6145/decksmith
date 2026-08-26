import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Loader2, Trash2, Plus, Minus, Edit2, Zap, Battery, DollarSign, Weight,
  AlertTriangle, AlertCircle, Info, ExternalLink, Tag, Heart, Eye, Download,
  Share2, MessageSquare, Copy, Check, Clock, History, Send, BookOpen, Star, GitFork,
  Calendar, FileText, ShoppingCart, Sliders, Sparkles, Crosshair, HardDrive, Printer, QrCode, ShieldCheck, Layers,
} from "lucide-react";
import BuildImage from "../components/BuildImage";
import CostBreakdown from "../components/CostBreakdown";
import RaidCalculator, { RaidLevel } from "../components/RaidCalculator";
import { API_URL } from "../lib/config";

interface PartData {
  id: string;
  name: string;
  slug: string;
  category: string;
  images: string[];
  prices: Array<{ price: number; source: string; url: string }>;
  specs: Record<string, unknown> | null;
}

interface BuildPartData {
  id: string;
  part: PartData;
  quantity: number;
  notes: string | null;
  role: string | null;
}

interface BuildEstimate {
  cost: number | null;
  actualSpend: number | null;
  powerW: number;
  weightG: number;
  battery: { capacityMah: number; voltage: number; lifeHours: number | null } | null;
  difficulty: { level: string; score: number };
  buildTimeHours: number;
  parts: Array<{
    name: string;
    category: string;
    quantity: number;
    powerW: number;
    cost: number | null;
    actualPrice: number | null;
    purchased: boolean;
  }>;
}

interface CompatibilityWarning {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
}

interface BuildDetailData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  tags: string[];
  budget: number | null;
  upvotes: number;
  views: number;
  parts: BuildPartData[];
  estimate?: BuildEstimate;
  compatibility?: { warnings: CompatibilityWarning[] };
  createdAt: string;
}

interface WiringPin {
  name: string;
  gpio: number;
  type: string;
  color: string;
}

interface WiringGuide {
  sbc: string;
  sbcModel: string;
  display: string;
  displayModel: string;
  connectionType: string;
  pins: WiringPin[];
  notes: string[];
}
export default function BuildDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [build, setBuild] = useState<BuildDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [allParts, setAllParts] = useState<PartData[]>([]);
  const [allBuilds, setAllBuilds] = useState<Array<{ id: string; slug: string; title: string; type: string; description: string | null; tags: string[]; parts: Array<{ id: string }> }>>([]);
  const [showAddPart, setShowAddPart] = useState(false);
  const [partSearch, setPartSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [wiringGuides, setWiringGuides] = useState<WiringGuide[]>([]);
  const [showWiring, setShowWiring] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [versions, setVersions] = useState<Array<{ id: string; version: number; snapshot: Record<string, unknown>; label: string | null; createdAt: string }>>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [comments, setComments] = useState<Array<{ id: string; content: string; createdAt: string; user: { name: string; avatar: string | null } }>>([]);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [guideSteps, setGuideSteps] = useState<Array<{ order: number; title: string; description: string; parts: string[]; tips: string[]; difficulty: string }>>([]);
  const [showGuide, setShowGuide] = useState(false);
  const [optimizeSuggestions, setOptimizeSuggestions] = useState<Array<{ currentPart: string; currentPrice: number; alternative: { name: string; slug: string; price: number; rating: number }; savings: number }>>([]);
  const [optimizeMessage, setOptimizeMessage] = useState("");
  const [showOptimize, setShowOptimize] = useState(false);
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [timeLogs, setTimeLogs] = useState<Array<{ id: string; hours: number; description: string | null; loggedAt: string }>>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [showTimeLog, setShowTimeLog] = useState(false);
  const [logHours, setLogHours] = useState("");
  const [logDescription, setLogDescription] = useState("");
  const [activityFeed, setActivityFeed] = useState<Array<{ id: string; action: string; details: Record<string, unknown> | null; user: { name: string | null }; createdAt: string }>>([]);
  const [progress, setProgress] = useState<{ total: number; acquired: number; installed: number; tested: number; percentComplete: number } | null>(null);
  const [calendarData, setCalendarData] = useState<Array<{ date: string; activity: number }>>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportTab, setExportTab] = useState<"csv" | "markdown" | "json" | "cart" | "html">("csv");
  const [copiedMd, setCopiedMd] = useState(false);
  const [showPowerCalc, setShowPowerCalc] = useState(false);
  const [calcMah, setCalcMah] = useState(5000);
  const [calcWorkload, setCalcWorkload] = useState<"idle" | "moderate" | "heavy">("moderate");
  const [isEditingBuild, setIsEditingBuild] = useState(false);
  const [editDraft, setEditDraft] = useState({ title: "", type: "", budget: "", tags: "" });
  const [showSpecBadgeModal, setShowSpecBadgeModal] = useState(false);

  const saveBuildEdits = async () => {
    if (!build) return;
    try {
      const res = await fetch(`${API_URL}/api/builds/${build.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editDraft.title,
          type: editDraft.type,
          budget: editDraft.budget ? parseFloat(editDraft.budget) : null,
          tags: editDraft.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        setIsEditingBuild(false);
        fetchBuild();
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchBuild();
    fetchParts();
    fetchAllBuilds();
  }, [slug]);

  const fetchBuild = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/builds/${slug}`);
      let found: BuildDetailData | null = null;
      if (res.ok) {
        found = await res.json();
      } else {
        const allRes = await fetch(`${API_URL}/api/builds`);
        if (allRes.ok) {
          const builds = await allRes.json();
          found = builds.find((b: BuildDetailData) => b.slug === slug || b.id === slug) || null;
        }
      }
      if (found) {
        setBuild(found);
        fetchEstimate(found.id);
        fetchCompatibility(found.id);
        fetchWiringGuide(found.id);
        fetchVersions(found.id);
        fetchComments(found.id);
        fetchGuide(found.id);
        fetchTimeLogs(found.id);
        fetchActivity(found.id);
        fetchProgress(found.id);
        fetchCalendar(found.id);
        if (found.budget) fetchOptimize(found.id);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchParts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/parts`);
      if (res.ok) setAllParts(await res.json());
    } catch {
      // ignore
    }
  };

  const fetchAllBuilds = async () => {
    try {
      const res = await fetch(`${API_URL}/api/builds`);
      if (res.ok) setAllBuilds(await res.json());
    } catch {
      // ignore
    }
  };

  const fetchEstimate = async (buildId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/builds/${buildId}/estimate`);
      if (res.ok) {
        const est = await res.json();
        setBuild((prev) => (prev ? { ...prev, estimate: est } : prev));
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
        setBuild((prev) => (prev ? { ...prev, compatibility: compat } : prev));
      }
    } catch {
      // ignore
    }
  };

  const fetchWiringGuide = async (buildId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/builds/${buildId}/wiring`);
      if (res.ok) {
        const data = await res.json();
        setWiringGuides(data.guides || []);
      }
    } catch {
      // ignore
    }
  };

  const fetchVersions = async (buildId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/builds/${buildId}/versions`);
      if (res.ok) setVersions(await res.json());
    } catch {
      // ignore
    }
  };

  const fetchComments = async (buildId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/builds/${buildId}/comments`);
      if (res.ok) setComments(await res.json());
    } catch {
      // ignore
    }
  };

  const fetchGuide = async (buildId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/builds/${buildId}/guide`);
      if (res.ok) {
        const data = await res.json();
        setGuideSteps(data.steps || []);
      }
    } catch {
      // ignore
    }
  };

  const fetchOptimize = async (buildId: string) => {
    setOptimizeLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/builds/${buildId}/optimize`);
      if (res.ok) {
        const data = await res.json();
        setOptimizeSuggestions(data.suggestions || []);
        setOptimizeMessage(data.message || "");
      }
    } catch {
      // ignore
    } finally {
      setOptimizeLoading(false);
    }
  };

  const fetchTimeLogs = async (buildId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/builds/${buildId}/timelogs`);
      if (res.ok) {
        const data = await res.json();
        setTimeLogs(data.timeLogs || []);
        setTotalHours(data.totalHours || 0);
      }
    } catch {
      // ignore
    }
  };

  const fetchActivity = async (buildId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/builds/${buildId}/activity?limit=15`);
      if (res.ok) setActivityFeed(await res.json());
    } catch {
      // ignore
    }
  };

  const fetchProgress = async (buildId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/builds/${buildId}/progress`);
      if (res.ok) setProgress(await res.json());
    } catch {
      // ignore
    }
  };

  const fetchCalendar = async (buildId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/builds/${buildId}/calendar`);
      if (res.ok) setCalendarData(await res.json());
    } catch {
      // ignore
    }
  };

  const updatePartStatus = async (buildId: string, partId: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/api/builds/${buildId}/parts/${partId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setBuild((prev) => prev ? {
          ...prev,
          parts: prev.parts.map((p) => p.part.id === partId ? { ...p, status } : p),
        } : prev);
        fetchProgress(buildId);
      }
    } catch {
      // ignore
    }
  };

  const addTimeLog = async (buildId: string) => {
    if (!logHours) return;
    try {
      const res = await fetch(`${API_URL}/api/builds/${buildId}/timelogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours: parseFloat(logHours), description: logDescription || undefined }),
      });
      if (res.ok) {
        const log = await res.json();
        setTimeLogs((prev) => [log, ...prev]);
        setTotalHours((prev) => prev + log.hours);
        setLogHours("");
        setLogDescription("");
        setShowTimeLog(false);
      }
    } catch {
      // ignore
    }
  };

  const deleteTimeLog = async (buildId: string, logId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/builds/${buildId}/timelogs/${logId}`, { method: "DELETE" });
      if (res.ok) {
        const log = timeLogs.find((l) => l.id === logId);
        setTimeLogs((prev) => prev.filter((l) => l.id !== logId));
        if (log) setTotalHours((prev) => prev - log.hours);
      }
    } catch {
      // ignore
    }
  };

  const submitComment = async () => {
    if (!build || !newComment.trim()) return;
    setSendingComment(true);
    try {
      const res = await fetch(`${API_URL}/api/builds/${build.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...prev, comment]);
        setNewComment("");
      }
    } catch {
      // ignore
    } finally {
      setSendingComment(false);
    }
  };

  const addPart = async (partId: string) => {
    if (!build) return;
    try {
      const res = await fetch(`${API_URL}/api/builds/${build.id}/parts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partId, quantity: 1 }),
      });
      if (res.ok) {
        setShowAddPart(false);
        setPartSearch("");
        fetchBuild();
      }
    } catch {
      // ignore
    }
  };

  const removePart = async (partId: string) => {
    if (!build) return;
    try {
      await fetch(`${API_URL}/api/builds/${build.id}/parts/${partId}`, {
        method: "DELETE",
      });
      fetchBuild();
    } catch {
      // ignore
    }
  };

  const saveNotes = async () => {
    if (!build) return;
    try {
      const res = await fetch(`${API_URL}/api/builds/${build.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: notesDraft }),
      });
      if (res.ok) {
        setBuild((prev) => prev ? { ...prev, description: notesDraft } : prev);
        setEditingNotes(false);
      }
    } catch {
      // ignore
    }
  };

  const updatePartPrice = async (partId: string, actualPrice: number | null, purchased: boolean) => {
    if (!build) return;
    try {
      await fetch(`${API_URL}/api/builds/${build.id}/parts/${partId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actualPrice, purchased }),
      });
      fetchEstimate(build.id);
    } catch {
      // ignore
    }
  };

  const updatePartQuantity = async (partId: string, quantity: number) => {
    if (!build || quantity < 1) return;
    try {
      await fetch(`${API_URL}/api/builds/${build.id}/parts/${partId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      fetchBuild(); // Refetch to get updated estimates etc.
    } catch {
      // ignore
    }
  };

  const deleteBuild = async () => {
    if (!build) return;
    try {
      await fetch(`${API_URL}/api/builds/${build.id}`, { method: "DELETE" });
      window.location.href = "/builds";
    } catch {
      // ignore
    }
  };

  const getMarkdownBom = () => {
    if (!build) return "";
    let md = `### 🛠️ ${build.title} — Bill of Materials\n\n`;
    md += `| Part | Category | Qty | Price | Direct Link |\n`;
    md += `| :--- | :--- | :---: | :---: | :--- |\n`;
    build.parts.forEach((bp) => {
      const cheapest = bp.part.prices?.length
        ? Math.min(...bp.part.prices.map((p) => p.price))
        : null;
      const priceStr = cheapest != null ? `$${cheapest.toFixed(2)}` : "N/A";
      const link = bp.part.prices?.[0]?.url || `${window.location.origin}/parts/${bp.part.slug}`;
      md += `| **${bp.part.name}** | \`${bp.part.category}\` | ${bp.quantity || 1} | ${priceStr} | [Buy / Specs](${link}) |\n`;
    });
    if (build.estimate?.cost != null) {
      md += `| **TOTAL ESTIMATE** | — | — | **$${build.estimate.cost.toFixed(2)}** | — |\n`;
    }
    return md;
  };

  const getJsonBom = () => {
    if (!build) return "";
    return JSON.stringify(
      {
        title: build.title,
        type: build.type,
        totalCost: build.estimate?.cost,
        powerW: build.estimate?.powerW,
        parts: build.parts.map((bp) => ({
          name: bp.part.name,
          category: bp.part.category,
          quantity: bp.quantity || 1,
          slug: bp.part.slug,
          prices: bp.part.prices,
        })),
      },
      null,
      2
    );
  };

  const copyMarkdownBom = async () => {
    const md = getMarkdownBom();
    await navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const downloadMarkdownFile = () => {
    if (!build) return;
    const md = getMarkdownBom();
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${build.slug}-bom.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadJsonFile = () => {
    if (!build) return;
    const json = getJsonBom();
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${build.slug}-bom.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const openAllVendorLinks = () => {
    if (!build) return;
    build.parts.forEach((bp) => {
      const url = bp.part.prices?.[0]?.url;
      if (url && url.startsWith("http")) {
        window.open(url, "_blank");
      }
    });
  };

  const shareBuild = async () => {
    setShowShareModal(true);
  };

  const copyShareUrl = async () => {
    const url = `${window.location.origin}/builds/${build?.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const discussInChat = () => {
    if (!build) return;
    const partsList = build.parts.map((bp) => bp.part.name).join(", ");
    const prompt = `I'm building a ${build.title} (${build.type}). It currently has: ${partsList}. Budget: $${build.budget || "unknown"}. Can you help me improve this build or suggest alternatives?`;
    window.location.href = `/chat?prompt=${encodeURIComponent(prompt)}`;
  };

  const exportHtml = () => {
    if (!build) return;
    const partsList = build.parts.map((bp) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #333">${bp.part.name}</td>
        <td style="padding:8px;border-bottom:1px solid #333;color:#888">${bp.part.category}</td>
        <td style="padding:8px;border-bottom:1px solid #333;text-align:center">${bp.quantity}</td>
      </tr>`).join("");
    const est = build.estimate;
    const costStr = est?.cost != null ? `$${est.cost.toFixed(2)}` : "—";
    const batteryStr = est?.battery?.lifeHours != null ? `${est.battery.lifeHours}h` : est?.battery?.capacityMah != null ? `${est.battery.capacityMah}mAh` : "—";
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${build.title} - Decksmith Build</title>
<style>
body{font-family:system-ui;background:#0a0a0f;color:#e5e7eb;margin:0;padding:40px}
h1{color:#00ff88;margin-bottom:4px}
.badge{display:inline-block;padding:2px 10px;border-radius:9999px;font-size:12px;font-weight:600;background:#1a1a2e;color:#00ff88;border:1px solid #00ff8833}
table{width:100%;border-collapse:collapse;margin:20px 0}
.stat{display:inline-block;margin-right:24px;margin-bottom:12px}
.stat-label{font-size:12px;color:#888}
.stat-value{font-size:20px;font-weight:bold}
.tags{margin:12px 0}
.tag{display:inline-block;padding:2px 8px;margin:2px;border-radius:4px;font-size:12px;background:#1a1a2e;color:#888}
a{color:#00ff88}
</style></head><body>
<h1>${build.title}</h1>
<span class="badge">${build.type}</span>
<p style="color:#888;margin-top:12px">${build.description || ""}</p>
${build.tags.length ? `<div class="tags">${build.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>` : ""}
<div style="margin:20px 0">
<div class="stat"><div class="stat-label">Cost</div><div class="stat-value" style="color:#00ff88">${costStr}</div></div>
<div class="stat"><div class="stat-label">Power</div><div class="stat-value" style="color:#facc15">${est ? est.powerW.toFixed(1) + "W" : "—"}</div></div>
<div class="stat"><div class="stat-label">Weight</div><div class="stat-value">${est ? (est.weightG / 1000).toFixed(1) + "kg" : "—"}</div></div>
<div class="stat"><div class="stat-label">Build Time</div><div class="stat-value">${est ? est.buildTimeHours + "h" : "—"}</div></div>
<div class="stat"><div class="stat-label">Difficulty</div><div class="stat-value">${est ? est.difficulty.level : "—"}</div></div>
<div class="stat"><div class="stat-label">Battery</div><div class="stat-value" style="color:#60a5fa">${batteryStr}</div></div>
</div>
<h2 style="font-size:18px;color:#ccc">Parts (${build.parts.length})</h2>
<table><thead><tr style="text-align:left;border-bottom:1px solid #333">
<th style="padding:8px;color:#888">Part</th><th style="padding:8px;color:#888">Category</th><th style="padding:8px;color:#888;text-align:center">Qty</th>
</tr></thead><tbody>${partsList}</tbody></table>
<p style="color:#555;font-size:12px;margin-top:40px">Generated by Decksmith - AI-Powered Cyberdeck Builder</p>
</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${build.slug}-export.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredParts = allParts.filter(
    (p) =>
      p.name.toLowerCase().includes(partSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(partSearch.toLowerCase())
  );

  const CATEGORY_COLORS: Record<string, string> = {
    SBC: "text-green-400 bg-green-400/10",
    DISPLAY: "text-blue-400 bg-blue-400/10",
    BATTERY: "text-yellow-400 bg-yellow-400/10",
    POWER: "text-red-400 bg-red-400/10",
    STORAGE: "text-purple-400 bg-purple-400/10",
    INPUT: "text-pink-400 bg-pink-400/10",
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
      </div>
    );
  }

  if (!build) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-400">Build not found.</p>
        <Link to="/builds" className="text-neon-green hover:underline mt-2 inline-block">
          Back to builds
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <Link
        to="/builds"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-neon-green transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to builds
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        <div className="w-full lg:w-[600px] flex-shrink-0">
          <BuildImage
            title={build.title}
            type={build.type}
            parts={(build.parts || []).map((bp) => ({
              id: bp.part?.id,
              part: { name: bp.part?.name || "Unknown", category: bp.part?.category || "OTHER" },
            }))}
            tags={build.tags || []}
            budget={build.budget}
          />
        </div>
        <div className="flex-1">
          {isEditingBuild ? (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-4">
              <input
                type="text"
                value={editDraft.title}
                onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 mb-2 focus:outline-none focus:border-neon-green"
                placeholder="Build Title"
              />
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={editDraft.type}
                  onChange={(e) => setEditDraft({ ...editDraft, type: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-neon-green text-sm"
                  placeholder="Type (e.g. Cyberdeck)"
                />
                <input
                  type="number"
                  value={editDraft.budget}
                  onChange={(e) => setEditDraft({ ...editDraft, budget: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-neon-green text-sm"
                  placeholder="Budget ($)"
                />
              </div>
              <input
                type="text"
                value={editDraft.tags}
                onChange={(e) => setEditDraft({ ...editDraft, tags: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 mb-3 focus:outline-none focus:border-neon-green text-sm"
                placeholder="Tags (comma separated)"
              />
              <div className="flex gap-2">
                <button onClick={saveBuildEdits} className="px-3 py-1.5 bg-neon-green text-gray-900 font-semibold rounded hover:bg-neon-green/90 text-sm">Save Changes</button>
                <button onClick={() => setIsEditingBuild(false)} className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded">
                  {build.type}
                </span>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" /> {build.upvotes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" /> {build.views}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3 group/title">
                <h1 className="text-3xl font-bold text-gray-100">{build.title}</h1>
                <button
                  onClick={() => {
                    setEditDraft({ title: build.title, type: build.type, budget: build.budget?.toString() || "", tags: build.tags.join(", ") });
                    setIsEditingBuild(true);
                  }}
                  className="p-1.5 text-gray-600 hover:text-neon-green hover:bg-gray-800 rounded opacity-0 group-hover/title:opacity-100 transition-all"
                  title="Edit Build Details"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              
              {editingNotes ? (
                <div className="mb-4">
                  <textarea
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-neon-green transition-colors"
                    placeholder="Add notes about this build..."
                    autoFocus
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={saveNotes} className="px-3 py-1 bg-neon-green text-gray-900 rounded text-sm font-semibold hover:bg-neon-green/90">Save</button>
                    <button onClick={() => setEditingNotes(false)} className="px-3 py-1 bg-gray-800 text-gray-400 rounded text-sm hover:bg-gray-700">Cancel</button>
                  </div>
                </div>
              ) : (
                <p
                  className="text-gray-400 mb-4 cursor-pointer hover:text-gray-300 transition-colors"
                  onClick={() => { setNotesDraft(build.description || ""); setEditingNotes(true); }}
                >
                  {build.description || "Click to add notes..."}
                </p>
              )}

              {build.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {build.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-gray-800/50 text-gray-500 rounded flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={shareBuild}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-neon-green transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Share"}
            </button>
            <button
              onClick={discussInChat}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-neon-green transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Discuss in Chat
            </button>
            <button
              onClick={deleteBuild}
              className="text-sm text-red-500 hover:text-red-400 transition-colors ml-auto"
            >
              Delete build
            </button>
          </div>
        </div>
      </div>

      {/* Maker Studio Launchpad Bar */}
      {(() => {
        const chassisPart = build.parts.find(
          (p) =>
            p.part.category?.toUpperCase() === "CASE" ||
            p.part.category?.toUpperCase() === "CHASSIS" ||
            p.part.name.toLowerCase().includes("pelican") ||
            p.part.name.toLowerCase().includes("enclosure")
        );
        const chassisSlug = chassisPart?.part.slug || "pelican-1150-faceplate";

        return (
          <div className="mb-8 p-4 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-950 border border-gray-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-neon-green" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Decksmith Fabrication & Studio Suite
                </h4>
                <p className="text-[11px] text-gray-400">
                  Fork to blueprint configurator, generate 1:1 CAD laser vectors, or create bootable OS image.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/builder?fork=${build.slug}`}
                className="px-3 py-1.5 rounded-lg bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border border-neon-green/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <GitFork className="w-3.5 h-3.5" />
                Fork into Studio
              </Link>
              <Link
                to="/assembly"
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-neon-green border border-neon-green/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                3D Assembly Guide
              </Link>
              <Link
                to="/pcb"
                className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                PCB Studio
              </Link>
              <Link
                to={`/cad?chassis=${chassisSlug}`}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Crosshair className="w-3.5 h-3.5" />
                CAD / CNC Standoffs
              </Link>
              <Link
                to="/flasher"
                className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <HardDrive className="w-3.5 h-3.5" />
                Flash OS Image
              </Link>
              <button
                onClick={() => setShowSpecBadgeModal(true)}
                className="px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                Field Spec Badge
              </button>
            </div>
          </div>
        );
      })()}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Parts */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-100">
              Parts ({build.parts.length})
            </h2>
            <div className="flex items-center gap-2">
              {build.parts.length > 0 && (
                <>
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 bg-gray-800 text-gray-200 border border-gray-700 rounded-lg hover:border-neon-green hover:text-neon-green transition-all"
                  >
                    <Download className="w-4 h-4 text-neon-green" />
                    Export BOM & Cart
                  </button>
                  <button
                    onClick={() => setShowPowerCalc(true)}
                    className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 bg-gray-800 text-gray-200 border border-gray-700 rounded-lg hover:border-yellow-400 hover:text-yellow-400 transition-all"
                  >
                    <Sliders className="w-4 h-4 text-yellow-400" />
                    Power Calc
                  </button>
                </>
              )}
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_URL}/api/builds/${build.id}/fork`, { method: "POST" });
                    if (res.ok) {
                      const data = await res.json();
                      window.location.href = `/builds/${data.slug}`;
                    }
                  } catch {
                    // ignore
                  }
                }}
                className="inline-flex items-center gap-1 text-sm px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-neon-green transition-all"
              >
                <GitFork className="w-4 h-4" />
                Clone
              </button>
              <button
                onClick={() => setShowAddPart(!showAddPart)}
                className="inline-flex items-center gap-1 text-sm px-3 py-1.5 bg-neon-green text-gray-900 rounded-lg hover:bg-neon-green/90 transition-all font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add Part
              </button>
            </div>
          </div>

          {/* Add Part Panel */}
          {showAddPart && (
            <div className="mb-4 bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <input
                type="text"
                value={partSearch}
                onChange={(e) => setPartSearch(e.target.value)}
                placeholder="Search parts..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 mb-3 focus:outline-none focus:border-neon-green transition-colors"
                autoFocus
              />
              <div className="max-h-60 overflow-y-auto space-y-1">
                {filteredParts.map((part) => (
                  <button
                    key={part.id}
                    onClick={() => addPart(part.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center overflow-hidden">
                        {part.images[0] ? (
                          <img
                            src={part.images[0]}
                            alt=""
                            className="w-full h-full object-contain mix-blend-screen"
                          />
                        ) : (
                          <span className="text-sm opacity-30">📦</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-200">{part.name}</p>
                        <p className="text-xs text-gray-500">{part.category}</p>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                ))}
                {filteredParts.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No parts found.</p>
                )}
              </div>
            </div>
          )}

          {/* Parts List */}
          <div className="space-y-2">
            {build.parts.map((bp) => {
              const cheapest = bp.part.prices.length > 0
                ? Math.min(...bp.part.prices.map((p) => p.price))
                : null;
              return (
                <div
                  key={bp.id}
                  className="flex items-center gap-4 bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 group"
                >
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {bp.part.images[0] ? (
                      <img
                        src={bp.part.images[0]}
                        alt=""
                        className="w-full h-full object-contain mix-blend-screen"
                      />
                    ) : (
                      <span className="text-2xl opacity-30">📦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/parts/${bp.part.slug}`}
                      className="text-sm font-medium text-gray-200 hover:text-neon-green transition-colors"
                    >
                      {bp.part.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          CATEGORY_COLORS[bp.part.category] || "text-gray-400 bg-gray-400/10"
                        }`}
                      >
                        {bp.part.category}
                      </span>
                      <div className="flex items-center ml-2 bg-gray-800 rounded">
                        <button
                          onClick={() => updatePartQuantity(bp.part.id, (bp.quantity || 1) - 1)}
                          disabled={(bp.quantity || 1) <= 1}
                          className="px-1.5 py-0.5 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs text-gray-300 w-4 text-center font-medium">
                          {bp.quantity || 1}
                        </span>
                        <button
                          onClick={() => updatePartQuantity(bp.part.id, (bp.quantity || 1) + 1)}
                          className="px-1.5 py-0.5 text-gray-400 hover:text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {cheapest != null && (
                    <div className="text-right">
                      <span className="text-sm font-semibold text-neon-green">
                        ${cheapest.toFixed(2)}
                      </span>
                      {build.estimate?.parts.find((ep) => ep.name === bp.part.name)?.actualPrice != null && (
                        <p className="text-xs text-gray-500">
                          Paid: ${build.estimate.parts.find((ep) => ep.name === bp.part.name)?.actualPrice?.toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const ep = build.estimate?.parts.find((p) => p.name === bp.part.name);
                        const newPrice = prompt("Actual price paid:", ep?.actualPrice?.toString() || cheapest?.toString() || "");
                        if (newPrice !== null) {
                          updatePartPrice(bp.part.id, parseFloat(newPrice) || null, true);
                        }
                      }}
                      className={`p-1 rounded text-xs transition-all ${
                        build.estimate?.parts.find((ep) => ep.name === bp.part.name)?.purchased
                          ? "text-green-400 bg-green-400/10"
                          : "text-gray-600 hover:text-gray-400"
                      }`}
                      title="Mark as purchased"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <div className="flex rounded overflow-hidden border border-gray-700">
                      {["pending", "acquired", "installed", "tested"].map((s) => {
                        const colors: Record<string, string> = {
                          pending: "text-gray-600",
                          acquired: "text-yellow-400",
                          installed: "text-blue-400",
                          tested: "text-green-400",
                        };
                        const labels: Record<string, string> = { pending: "—", acquired: "A", installed: "I", tested: "T" };
                        return (
                          <button
                            key={s}
                            onClick={() => updatePartStatus(build.id, bp.part.id, s)}
                            className={`px-1.5 py-0.5 text-xs transition-all ${
                              (bp as { status?: string }).status === s
                                ? `${colors[s]} bg-gray-800`
                                : `text-gray-700 hover:text-gray-500`
                            }`}
                            title={s.charAt(0).toUpperCase() + s.slice(1)}
                          >
                            {labels[s]}
                          </button>
                        );
                      })}
                    </div>
                    <a
                      href={bp.part.prices[0]?.url || `/parts/${bp.part.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-600 hover:text-neon-green transition-colors"
                    title="View part"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => removePart(bp.part.id)}
                    className="p-1 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove part"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  </div>
                </div>
              );
            })}
            {build.parts.length === 0 && (
              <div className="text-center py-12 bg-gray-900/50 border border-gray-800 rounded-xl">
                <p className="text-gray-500 mb-2">No parts yet.</p>
                <button
                  onClick={() => setShowAddPart(true)}
                  className="text-sm text-neon-green hover:underline"
                >
                  Add your first part
                </button>
              </div>
            )}
          </div>

          {/* RAID / Storage Pool Calculator for NAS Builds */}
          {(build.type === "NAS" || build.tags.includes("nas") || build.parts.some((bp) => bp.part.category === "STORAGE")) && (
            <div className="mb-6">
              <RaidCalculator
                isEmbedded={true}
                initialDriveCount={
                  build.parts
                    .filter((bp) => bp.part.category === "STORAGE" && !bp.part.name.toLowerCase().includes("microsd"))
                    .reduce((acc, bp) => acc + (bp.quantity || 1), 0) || 2
                }
                initialDriveCapacityTB={
                  (() => {
                    const storagePart = build.parts.find(
                      (bp) => bp.part.category === "STORAGE" && !bp.part.name.toLowerCase().includes("microsd")
                    );
                    if (storagePart) {
                      const name = storagePart.part.name.toUpperCase();
                      if (name.includes("8TB") || name.includes("8 TB")) return 8;
                      if (name.includes("4TB") || name.includes("4 TB")) return 4;
                      if (name.includes("2TB") || name.includes("2 TB")) return 2;
                      if (name.includes("1TB") || name.includes("1 TB")) return 1;
                      if (name.includes("16TB") || name.includes("16 TB")) return 16;
                    }
                    return 4;
                  })()
                }
                initialRaidLevel={
                  build.tags.includes("raidz2")
                    ? "RAIDZ2"
                    : build.tags.includes("raidz1")
                    ? "RAIDZ1"
                    : build.tags.includes("raid1")
                    ? "RAID1"
                    : "RAID5"
                }
                driveCostUSD={
                  (() => {
                    const storagePart = build.parts.find((bp) => bp.part.category === "STORAGE");
                    if (storagePart && storagePart.part.prices.length > 0) {
                      return Math.min(...storagePart.part.prices.map((p) => p.price));
                    }
                    return 99.99;
                  })()
                }
              />
            </div>
          )}

          {/* Time Tracking */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-neon-green" />
                Time Tracking
                {totalHours > 0 && <span className="text-gray-500">({totalHours.toFixed(1)}h logged)</span>}
              </h3>
              <button
                onClick={() => setShowTimeLog(!showTimeLog)}
                className="text-xs text-neon-green hover:underline"
              >
                {showTimeLog ? "Cancel" : "Log Time"}
              </button>
            </div>

            {showTimeLog && (
              <div className="bg-gray-800/50 rounded-lg p-3 mb-3 flex gap-2">
                <input
                  type="number"
                  value={logHours}
                  onChange={(e) => setLogHours(e.target.value)}
                  placeholder="Hours"
                  min="0.25"
                  step="0.25"
                  className="w-20 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-neon-green"
                />
                <input
                  type="text"
                  value={logDescription}
                  onChange={(e) => setLogDescription(e.target.value)}
                  placeholder="What did you do?"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-neon-green"
                />
                <button
                  onClick={() => addTimeLog(build.id)}
                  className="px-3 py-1.5 bg-neon-green text-gray-900 rounded-lg text-sm font-medium hover:bg-neon-green/90"
                >
                  Add
                </button>
              </div>
            )}

            {timeLogs.length > 0 ? (
              <div className="space-y-1.5">
                {timeLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-sm bg-gray-800/50 rounded-lg px-3 py-2 group">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-neon-green">{log.hours}h</span>
                      {log.description && <span className="text-gray-400 ml-2">{log.description}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">{new Date(log.loggedAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => deleteTimeLog(build.id, log.id)}
                        className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !showTimeLog && <p className="text-xs text-gray-600">No time logged yet.</p>
            )}
          </div>
        </div>

        {/* Right: Progress + Estimate + Compatibility */}
        <div className="space-y-6">
          {/* Progress Tracker */}
          {progress && progress.total > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-100 mb-3">Build Progress</h3>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">{progress.percentComplete}% complete</span>
                  <span className="text-xs text-gray-500">{progress.tested}/{progress.total} tested</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-neon-green to-neon-blue h-2 rounded-full transition-all"
                    style={{ width: `${progress.percentComplete}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-800/50 rounded-lg p-2">
                  <p className="text-lg font-bold text-yellow-400">{progress.acquired}</p>
                  <p className="text-xs text-gray-500">Acquired</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-2">
                  <p className="text-lg font-bold text-blue-400">{progress.installed}</p>
                  <p className="text-xs text-gray-500">Installed</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-2">
                  <p className="text-lg font-bold text-green-400">{progress.tested}</p>
                  <p className="text-xs text-gray-500">Tested</p>
                </div>
              </div>
            </div>
          )}

          {/* Estimate */}
          {build.estimate && build.parts.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-100 mb-3">Build Estimate</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {build.estimate.cost != null && (
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <DollarSign className="w-3 h-3" /> Est. Cost
                    </div>
                    <p className="text-lg font-bold text-neon-green">
                      ${build.estimate.cost.toFixed(2)}
                    </p>
                  </div>
                )}
                {build.estimate.actualSpend != null && (
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <DollarSign className="w-3 h-3" /> Actual
                    </div>
                    <p className={`text-lg font-bold ${build.estimate.actualSpend <= (build.estimate.cost || 0) ? "text-green-400" : "text-red-400"}`}>
                      ${build.estimate.actualSpend.toFixed(2)}
                    </p>
                    {build.estimate.cost != null && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {build.estimate.actualSpend <= build.estimate.cost ? "Under" : "Over"} budget by ${Math.abs(build.estimate.actualSpend - build.estimate.cost).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                    <Zap className="w-3 h-3" /> Power
                  </div>
                  <p className="text-lg font-bold text-yellow-400">
                    {build.estimate.powerW.toFixed(1)}W
                  </p>
                </div>
                {build.estimate.battery && (
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <Battery className="w-3 h-3" /> Battery
                    </div>
                    <p className="text-lg font-bold text-blue-400">
                      {build.estimate.battery.lifeHours != null
                        ? `${build.estimate.battery.lifeHours}h`
                        : `${build.estimate.battery.capacityMah}mAh`}
                    </p>
                  </div>
                )}
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                    <Weight className="w-3 h-3" /> Weight
                  </div>
                  <p className="text-lg font-bold text-gray-300">
                    {(build.estimate.weightG / 1000).toFixed(1)}kg
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Difficulty</div>
                  <p className={`text-lg font-bold ${
                    build.estimate.difficulty.level === "Easy" ? "text-green-400"
                    : build.estimate.difficulty.level === "Medium" ? "text-yellow-400"
                    : build.estimate.difficulty.level === "Hard" ? "text-orange-400"
                    : "text-red-400"
                  }`}>
                    {build.estimate.difficulty.level}
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                    <Clock className="w-3 h-3" /> Build Time
                  </div>
                  <p className="text-lg font-bold text-gray-300">
                    {build.estimate.buildTimeHours}h
                  </p>
                </div>
              </div>

              {/* Per-part breakdown */}
              <div className="space-y-1">
                {build.estimate.parts.map((ep, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 truncate mr-2">{ep.name}</span>
                    <span className="text-gray-500 shrink-0">
                      {ep.powerW.toFixed(1)}W
                      {ep.cost != null && ` · $${ep.cost.toFixed(0)}`}
                    </span>
                  </div>
                ))}
              </div>

              {build.budget != null && build.estimate.cost != null && (
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Budget</span>
                    <span className="text-gray-500">${build.budget}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-400">Remaining</span>
                    <span
                      className={
                        build.budget - build.estimate.cost >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      ${(build.budget - build.estimate.cost).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <CostBreakdown
                parts={build.parts.map((bp) => ({
                  category: bp.part.category,
                  price: bp.part.prices.length > 0 ? Math.min(...bp.part.prices.map((p) => p.price)) : undefined,
                  quantity: bp.quantity || 1,
                }))}
                totalCost={build.estimate.cost ?? 0}
              />
            </div>
          )}

          {/* Compatibility */}
          {build.compatibility && build.compatibility.warnings.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-100 mb-3">Compatibility</h3>
              <div className="space-y-2">
                {build.compatibility.warnings.map((w, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 ${
                      w.severity === "error"
                        ? "bg-red-900/30 text-red-400"
                        : w.severity === "warning"
                        ? "bg-yellow-900/30 text-yellow-400"
                        : "bg-blue-900/30 text-blue-400"
                    }`}
                  >
                    {w.severity === "error" ? (
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    ) : w.severity === "warning" ? (
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    ) : (
                      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    )}
                    <span>{w.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wiring Guide */}
          {wiringGuides.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <button
                onClick={() => setShowWiring(!showWiring)}
                className="flex items-center justify-between w-full"
              >
                <h3 className="text-sm font-semibold text-gray-100">Wiring Guide</h3>
                <span className="text-xs text-gray-500">{showWiring ? "▼" : "▶"}</span>
              </button>
              {showWiring && (
                <div className="mt-4 space-y-4">
                  {wiringGuides.map((guide, i) => (
                    <div key={i} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs px-2 py-1 bg-neon-green/20 text-neon-green rounded font-medium">
                          {guide.connectionType}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                        <div>
                          <span className="text-gray-500">SBC:</span>
                          <span className="text-gray-300 ml-1">{guide.sbc}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Display:</span>
                          <span className="text-gray-300 ml-1">{guide.display}</span>
                        </div>
                      </div>
                      {guide.pins.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-2">Pin Connections:</p>
                          <div className="grid grid-cols-2 gap-1">
                            {guide.pins.map((pin) => (
                              <div
                                key={pin.gpio}
                                className="flex items-center gap-2 text-xs px-2 py-1 rounded"
                                style={{ backgroundColor: `${pin.color}15` }}
                              >
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: pin.color }}
                                />
                                <span className="text-gray-400">GPIO{pin.gpio}</span>
                                <span className="text-gray-300">{pin.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="space-y-1.5">
                        {guide.notes.map((note, j) => (
                          <div key={j} className="flex items-start gap-2 text-xs text-gray-400">
                            <span className="text-neon-green mt-0.5">•</span>
                            {note}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Calendar */}
          {calendarData.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-100 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neon-green" />
                Build Timeline
              </h3>
              <div className="space-y-1">
                {calendarData.slice(0, 30).map((c) => (
                  <div key={c.date} className="flex items-center justify-between text-xs text-gray-500">
                    <span>{c.date}</span>
                    <span>{c.activity > 0 ? `+${c.activity}` : "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Feed */}
          {activityFeed.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-100 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-neon-green" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {activityFeed.map((a) => {
                  const icons: Record<string, string> = {
                    part_added: "+", part_removed: "−", comment: "💬", review: "★", edit: "✎", fork: "⑂", version: "↩",
                  };
                  const labels: Record<string, string> = {
                    part_added: "added a part", part_removed: "removed a part", comment: "commented",
                    review: "reviewed", edit: "edited", fork: "forked", version: "reverted",
                  };
                  return (
                    <div key={a.id} className="flex items-start gap-2 text-sm">
                      <span className="text-neon-green mt-0.5">{icons[a.action] || "•"}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-300">{a.user.name || "Someone"}</span>
                        <span className="text-gray-500"> {labels[a.action] || a.action}</span>
                        {a.details && "partName" in a.details && <span className="text-gray-400"> — {String(a.details.partName)}</span>}
                        {a.details && "preview" in a.details && <span className="text-gray-500 italic"> "{String(a.details.preview)}…"</span>}
                      </div>
                      <span className="text-xs text-gray-600 shrink-0">{new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Version History */}
          {versions.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="flex items-center justify-between w-full"
              >
                <h3 className="text-sm font-semibold text-gray-100">Version History</h3>
                <span className="text-xs text-gray-500">{showVersions ? "▼" : "▶"}</span>
              </button>
              {showVersions && (
                <div className="mt-4 space-y-2">
                  {versions.map((v) => {
                    const snap = v.snapshot as { parts?: Array<{ name: string }> };
                    return (
                      <div key={v.id} className="flex items-center justify-between text-xs bg-gray-800/50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-3">
                          <span className="text-neon-green font-mono">v{v.version}</span>
                          <span className="text-gray-400">{v.label || "Snapshot"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {Array.isArray(snap.parts) && (
                            <span className="text-gray-500">{snap.parts.length} parts</span>
                          )}
                          <span className="text-gray-600">{new Date(v.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Budget Optimizer */}
          {build.budget && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <button
                onClick={() => {
                  setShowOptimize(!showOptimize);
                  if (!showOptimize && optimizeSuggestions.length === 0 && !optimizeLoading) {
                    fetchOptimize(build.id);
                  }
                }}
                className="flex items-center justify-between w-full"
              >
                <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Budget Optimizer
                </h3>
                <span className="text-xs text-gray-500">{showOptimize ? "▼" : "▶"}</span>
              </button>
              {showOptimize && (
                <div className="mt-4">
                  {optimizeLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-neon-green" />
                  ) : (
                    <>
                      <p className="text-sm text-gray-400 mb-3">{optimizeMessage}</p>
                      {optimizeSuggestions.length > 0 && (
                        <div className="space-y-2">
                          {optimizeSuggestions.map((s, i) => (
                            <div key={i} className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500">Replace {s.currentPart}</p>
                                <Link
                                  to={`/parts/${s.alternative.slug}`}
                                  className="text-sm text-gray-200 hover:text-neon-green transition-colors"
                                >
                                  {s.alternative.name}
                                </Link>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                  <span className="text-xs text-gray-400">{s.alternative.rating}</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0 ml-3">
                                <p className="text-sm text-gray-500">${s.currentPrice.toFixed(2)} → <span className="text-green-400">${s.alternative.price.toFixed(2)}</span></p>
                                <p className="text-xs text-green-400 font-medium">Save ${s.savings.toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Build Guide */}
          {guideSteps.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="flex items-center justify-between w-full"
              >
                <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-neon-green" />
                  Assembly Guide ({guideSteps.length} steps)
                </h3>
                <span className="text-xs text-gray-500">{showGuide ? "▼" : "▶"}</span>
              </button>
              {showGuide && (
                <div className="mt-4 space-y-4">
                  {guideSteps.map((step) => (
                    <div key={step.order} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-7 h-7 rounded-full bg-neon-green/20 text-neon-green flex items-center justify-center text-sm font-bold">
                          {step.order}
                        </span>
                        <h4 className="font-medium text-gray-100">{step.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          step.difficulty === "easy" ? "bg-green-900/40 text-green-400"
                          : step.difficulty === "medium" ? "bg-yellow-900/40 text-yellow-400"
                          : "bg-red-900/40 text-red-400"
                        }`}>
                          {step.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3 ml-10">{step.description}</p>
                      {step.parts.length > 0 && (
                        <div className="ml-10 mb-2">
                          <span className="text-xs text-gray-500">Parts needed: </span>
                          <span className="text-xs text-gray-300">{step.parts.join(", ")}</span>
                        </div>
                      )}
                      {step.tips.length > 0 && (
                        <div className="ml-10 space-y-1">
                          {step.tips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
                              <span className="text-neon-green mt-0.5">•</span>
                              {tip}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Comments */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-neon-green" />
              Discussion ({comments.length})
            </h3>

            {comments.length > 0 && (
              <div className="space-y-3 mb-4">
                {comments.map((c) => (
                  <div key={c.id} className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-neon-green">{c.user.name || "Anonymous"}</span>
                      <span className="text-xs text-gray-600">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-300">{c.content}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitComment()}
                placeholder="Add a comment..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-neon-green transition-colors"
                disabled={sendingComment}
              />
              <button
                onClick={submitComment}
                disabled={!newComment.trim() || sendingComment}
                className="p-2 bg-neon-green text-gray-900 rounded-lg hover:bg-neon-green/90 transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Builds */}
      {allBuilds.filter((b) => b.slug !== slug && (b.type === build.type || b.tags?.some((t) => build.tags.includes(t)))).length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-neon-green" />
            Similar Builds
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allBuilds
              .filter((b) => b.slug !== slug && (b.type === build.type || b.tags?.some((t) => build.tags.includes(t))))
              .slice(0, 3)
              .map((b) => (
                <a
                  key={b.id}
                  href={`/builds/${b.slug}`}
                  className="block bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-neon-green/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded">{b.type}</span>
                    <span className="text-xs text-gray-600">{b.parts?.length || 0} parts</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-200 group-hover:text-neon-green transition-colors mb-1 line-clamp-1">
                    {b.title}
                  </h3>
                  {b.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{b.description}</p>
                  )}
                  {b.tags && b.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {b.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-xs px-1.5 py-0.5 bg-gray-800/70 text-gray-500 rounded">{t}</span>
                      ))}
                    </div>
                  )}
                </a>
              ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && build && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Share Build</h3>

            {/* Preview Card */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 bg-neon-green/20 text-neon-green rounded">{build.type}</span>
                {build.estimate?.difficulty && (
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    build.estimate.difficulty.level === "Easy" ? "bg-green-900/40 text-green-400"
                    : build.estimate.difficulty.level === "Medium" ? "bg-yellow-900/40 text-yellow-400"
                    : "bg-orange-900/40 text-orange-400"
                  }`}>{build.estimate.difficulty.level}</span>
                )}
              </div>
              <h4 className="text-gray-100 font-medium mb-1">{build.title}</h4>
              {build.description && <p className="text-sm text-gray-400 mb-2 line-clamp-2">{build.description}</p>}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{build.parts.length} parts</span>
                {build.estimate?.cost != null && <span className="text-neon-green">${build.estimate.cost.toFixed(2)}</span>}
                {build.estimate?.buildTimeHours != null && <span>{build.estimate.buildTimeHours}h build</span>}
              </div>
              {build.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {build.tags.slice(0, 4).map((t) => (
                    <span key={t} className="text-xs px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded">{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* URL */}
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/builds/${build.slug}`}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300"
              />
              <button
                onClick={copyShareUrl}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  copied ? "bg-green-500/20 text-green-400" : "bg-neon-green text-gray-900 hover:bg-neon-green/90"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-all text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Export BOM & Vendor Cart Modal */}
      {showExportModal && build && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowExportModal(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                <Download className="w-5 h-5 text-neon-green" />
                Export Bill of Materials & Cart
              </h3>
              <button onClick={() => setShowExportModal(false)} className="text-gray-500 hover:text-gray-300 text-sm">✕</button>
            </div>

            {/* Export Tabs */}
            <div className="flex gap-2 border-b border-gray-800 mb-4 pb-2">
              <button
                onClick={() => setExportTab("csv")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  exportTab === "csv" ? "bg-neon-green text-gray-900" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                CSV File
              </button>
              <button
                onClick={() => setExportTab("markdown")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  exportTab === "markdown" ? "bg-neon-green text-gray-900" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Markdown README
              </button>
              <button
                onClick={() => setExportTab("json")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  exportTab === "json" ? "bg-neon-green text-gray-900" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                JSON Specs
              </button>
              <button
                onClick={() => setExportTab("html")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  exportTab === "html" ? "bg-neon-green text-gray-900" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                HTML Page
              </button>
              <button
                onClick={() => setExportTab("cart")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  exportTab === "cart" ? "bg-neon-green text-gray-900" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                Buy Links
              </button>
            </div>

            {/* Tab Contents */}
            {exportTab === "csv" && (
              <div>
                <p className="text-sm text-gray-400 mb-4">
                  Download a structured CSV spreadsheet containing all part names, categories, quantities, unit prices, total cost, and buy URLs.
                </p>
                <button
                  onClick={() => {
                    const header = ["Part", "Category", "Quantity", "Unit Price", "Total Price", "URL"];
                    const rows = build.parts.map((bp) => {
                      const cheapest = bp.part.prices?.length ? Math.min(...bp.part.prices.map((p) => p.price)) : null;
                      const url = bp.part.prices?.[0]?.url || `${window.location.origin}/parts/${bp.part.slug}`;
                      return [bp.part.name, bp.part.category, String(bp.quantity || 1), cheapest != null ? cheapest.toFixed(2) : "N/A", cheapest != null ? (cheapest * (bp.quantity || 1)).toFixed(2) : "N/A", url];
                    });
                    const csv = [header, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
                    const blob = new Blob([csv], { type: "text/csv" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = `${build.slug}-bom.csv`;
                    a.click();
                    URL.revokeObjectURL(a.href);
                  }}
                  className="w-full py-2.5 bg-neon-green text-gray-900 font-semibold rounded-lg hover:bg-neon-green/90 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download BOM CSV
                </button>
              </div>
            )}

            {exportTab === "markdown" && (
              <div>
                <p className="text-sm text-gray-400 mb-3">
                  Formatted GitHub Markdown table. Copy into your project's <code className="text-neon-green bg-gray-800 px-1 py-0.5 rounded">README.md</code> file.
                </p>
                <textarea
                  readOnly
                  value={getMarkdownBom()}
                  rows={8}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs font-mono text-gray-300 mb-4 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={copyMarkdownBom}
                    className="flex-1 py-2 bg-neon-green text-gray-900 font-semibold rounded-lg hover:bg-neon-green/90 transition-all flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedMd ? "Copied to Clipboard!" : "Copy Markdown"}
                  </button>
                  <button
                    onClick={downloadMarkdownFile}
                    className="px-4 py-2 bg-gray-800 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    .md File
                  </button>
                </div>
              </div>
            )}

            {exportTab === "json" && (
              <div>
                <p className="text-sm text-gray-400 mb-3">
                  Full machine-readable specification export in JSON format.
                </p>
                <textarea
                  readOnly
                  value={getJsonBom()}
                  rows={8}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs font-mono text-gray-300 mb-4 focus:outline-none"
                />
                <button
                  onClick={downloadJsonFile}
                  className="w-full py-2.5 bg-neon-green text-gray-900 font-semibold rounded-lg hover:bg-neon-green/90 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download JSON Specification
                </button>
              </div>
            )}

            {exportTab === "html" && (
              <div>
                <p className="text-sm text-gray-400 mb-3">
                  A self-contained HTML file containing your build's specifications, components, and cost breakdown.
                </p>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4 text-center">
                  <p className="text-sm text-gray-300 mb-2">Ready to export?</p>
                  <button
                    onClick={exportHtml}
                    className="w-full py-2.5 bg-neon-green text-gray-900 font-semibold rounded-lg hover:bg-neon-green/90 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download HTML Document
                  </button>
                </div>
              </div>
            )}

            {exportTab === "cart" && (
              <div>
                <p className="text-sm text-gray-400 mb-4">
                  Direct vendor store links for all components in this cyberdeck build.
                </p>
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-1">
                  {build.parts.map((bp) => {
                    const priceObj = bp.part.prices?.[0];
                    return (
                      <div key={bp.part.id} className="flex items-center justify-between bg-gray-800/50 p-2.5 rounded-lg border border-gray-700/50">
                        <div>
                          <p className="text-sm font-medium text-gray-200">{bp.part.name}</p>
                          <p className="text-xs text-gray-500">{bp.part.category} · Source: {priceObj?.source || "Search"}</p>
                        </div>
                        {priceObj?.url ? (
                          <a
                            href={priceObj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs px-3 py-1 bg-neon-green/20 text-neon-green rounded hover:bg-neon-green/30 transition-all"
                          >
                            Buy ({priceObj.price ? `$${priceObj.price.toFixed(2)}` : "Store"})
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-500">No link</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={openAllVendorLinks}
                  className="w-full py-2.5 bg-neon-green text-gray-900 font-semibold rounded-lg hover:bg-neon-green/90 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Open All Buy Links in New Tabs
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Power & Battery Calculator Modal */}
      {showPowerCalc && build && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowPowerCalc(true)}>
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                <Battery className="w-5 h-5 text-yellow-400" />
                Cyberdeck Power & Battery Estimator
              </h3>
              <button onClick={() => setShowPowerCalc(false)} className="text-gray-500 hover:text-gray-300 text-sm">✕</button>
            </div>

            {/* Workload Profile Selector */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Workload Profile</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "idle", label: "Idle / Light", desc: "Terminal, text edit" },
                  { id: "moderate", label: "Normal", desc: "Browsing, coding" },
                  { id: "heavy", label: "Stress / Gaming", desc: "Emulation, pentesting" },
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setCalcWorkload(w.id as "idle" | "moderate" | "heavy")}
                    className={`p-3 rounded-lg text-left border transition-all ${
                      calcWorkload === w.id
                        ? "bg-yellow-400/10 border-yellow-400 text-yellow-400"
                        : "bg-gray-800/50 border-gray-700 text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <div className="text-xs font-bold">{w.label}</div>
                    <div className="text-[10px] opacity-75">{w.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Battery Capacity Slider */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Battery Capacity</label>
                <span className="text-sm font-mono font-bold text-neon-green">{calcMah.toLocaleString()} mAh</span>
              </div>
              <input
                type="range"
                min="2000"
                max="30000"
                step="500"
                value={calcMah}
                onChange={(e) => setCalcMah(Number(e.target.value))}
                className="w-full accent-neon-green cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>2,000 mAh (Slim)</span>
                <span>10,000 mAh (Standard)</span>
                <span>30,000 mAh (Powerbank)</span>
              </div>
            </div>

            {/* Calculation Output Card */}
            {(() => {
              const baseW = build.estimate?.powerW || 7.5;
              const mult = calcWorkload === "idle" ? 0.6 : calcWorkload === "heavy" ? 1.5 : 1.0;
              const drawW = Math.max(1, baseW * mult);
              const runtimeHours = (calcMah * 3.7 * 0.85) / (drawW * 1000);
              const hours = Math.floor(runtimeHours);
              const mins = Math.round((runtimeHours - hours) * 60);

              return (
                <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-center divide-x divide-gray-700">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Estimated Power Draw</p>
                      <p className="text-2xl font-bold text-yellow-400">{drawW.toFixed(1)} W</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">@ 5V / {(drawW / 5).toFixed(1)}A</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Estimated Runtime</p>
                      <p className="text-2xl font-bold text-neon-green">
                        {hours}h {mins}m
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">85% DC-DC efficiency</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-700/50 flex items-center justify-between text-xs">
                    <span className="text-gray-400">Thermal & Cooling Status:</span>
                    <span className={`font-semibold px-2 py-0.5 rounded ${
                      drawW > 12 ? "bg-red-500/20 text-red-400" : drawW > 7 ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"
                    }`}>
                      {drawW > 12 ? "🔥 Active Cooling Required (Fan / Heatsink)" : drawW > 7 ? "⚠️ Passive Heatsink Recommended" : "✅ Low Power / Cool"}
                    </span>
                  </div>
                </div>
              );
            })()}

            <button
              onClick={() => setShowPowerCalc(false)}
              className="w-full py-2.5 bg-gray-800 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-all text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Cyberpunk Field Spec Badge Modal */}
      {showSpecBadgeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-gray-950 border-2 border-neon-green/40 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-neon-green" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Cyberdeck Field Spec Badge
                </h3>
              </div>
              <button
                onClick={() => setShowSpecBadgeModal(false)}
                className="text-gray-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            {/* Tactical Military Badge Plate */}
            <div className="bg-gray-900 border-2 border-neon-green/60 rounded-xl p-5 relative overflow-hidden font-mono text-xs space-y-4 shadow-inner">
              {/* Corner crosshair decorations */}
              <div className="absolute top-2 left-2 text-neon-green/40 text-[10px]">+</div>
              <div className="absolute top-2 right-2 text-neon-green/40 text-[10px]">+</div>
              <div className="absolute bottom-2 left-2 text-neon-green/40 text-[10px]">+</div>
              <div className="absolute bottom-2 right-2 text-neon-green/40 text-[10px]">+</div>

              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <div>
                  <span className="text-[10px] text-neon-green font-bold tracking-widest block uppercase">DECKSMITH SPEC-CARD</span>
                  <span className="text-base font-black text-white">{build.title}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-neon-green/20 text-neon-green border border-neon-green/40 font-bold">
                  {build.type}
                </span>
              </div>

              {/* Telemetry Matrix */}
              <div className="grid grid-cols-3 gap-2 text-center bg-gray-950/70 p-3 rounded-lg border border-gray-800">
                <div>
                  <span className="text-[10px] text-gray-500 block">EST. POWER</span>
                  <span className="font-bold text-yellow-400">{build.estimate?.powerW?.toFixed(1) || 7.5} W</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">MASS / WT</span>
                  <span className="font-bold text-cyan-400">{build.estimate?.weightG || 450} g</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">BATTERY</span>
                  <span className="font-bold text-neon-green">{build.estimate?.battery?.lifeHours ? `${build.estimate.battery.lifeHours}h` : "24h run"}</span>
                </div>
              </div>

              {/* Installed Modules Summary */}
              <div className="space-y-1 text-[11px] text-gray-300">
                <span className="text-[10px] text-gray-500 block font-bold">HARDWARE MANIFEST:</span>
                <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto">
                  {build.parts.map((bp) => (
                    <div key={bp.id} className="truncate text-gray-400">
                      • <strong className="text-white">{bp.part.name}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Barcode & Verification */}
              <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
                <div className="text-[10px] text-gray-500">
                  <span>ID: {build.slug.toUpperCase()}</span>
                  <div className="text-[9px] text-gray-600">DECKSMITH HARDWARE REVISION v1.1</div>
                </div>
                <div className="flex items-center gap-1.5 text-neon-green text-[10px] font-bold">
                  <span>[ VERIFIED HW ]</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2 bg-neon-green hover:bg-emerald-400 text-gray-950 font-black rounded-lg transition-all text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-neon-green/20"
              >
                <Printer className="w-4 h-4" />
                Print 1:1 Vinyl Case Badge
              </button>
              <button
                onClick={() => setShowSpecBadgeModal(false)}
                className="py-2 px-4 bg-gray-800 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
