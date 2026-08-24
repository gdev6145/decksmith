import { useMemo } from "react";

interface PartData {
  category: string;
  price?: number;
  quantity: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  SBC: "bg-purple-500",
  DISPLAY: "bg-blue-500",
  BATTERY: "bg-green-500",
  CASE: "bg-orange-500",
  KEYBOARD: "bg-pink-500",
  STORAGE: "bg-yellow-500",
  OTHER: "bg-gray-500",
};

export default function CostBreakdown({ parts, totalCost }: { parts: PartData[]; totalCost: number }) {
  const breakdown = useMemo(() => {
    const cats: Record<string, number> = {};
    let sum = 0;
    parts.forEach(p => {
      if (p.price != null && p.price > 0) {
        const cost = p.price * p.quantity;
        cats[p.category] = (cats[p.category] || 0) + cost;
        sum += cost;
      }
    });
    
    // Sort descending by cost
    return Object.entries(cats)
      .map(([category, cost]) => ({
        category,
        cost,
        percentage: sum > 0 ? (cost / sum) * 100 : 0
      }))
      .sort((a, b) => b.cost - a.cost);
  }, [parts]);

  if (breakdown.length === 0 || totalCost === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Cost Breakdown</h3>
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-gray-800 mb-3">
        {breakdown.map((item) => (
          <div
            key={item.category}
            style={{ width: `${item.percentage}%` }}
            className={`${CATEGORY_COLORS[item.category] || "bg-gray-500"} transition-all`}
            title={`${item.category}: $${item.cost.toFixed(2)}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {breakdown.map((item) => (
          <div key={item.category} className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[item.category] || "bg-gray-500"}`} />
            <span className="text-gray-400 flex-1 truncate">{item.category}</span>
            <span className="text-gray-200 font-medium">${item.cost.toFixed(0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
