import React from "react";
import RaidCalculator from "../components/RaidCalculator";
import { HardDrive, Server, Shield, Zap, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function RaidCalcPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Page Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neon-green/10 text-neon-green border border-neon-green/20 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
          <HardDrive className="w-3.5 h-3.5" />
          NAS & Storage Planning Tool
        </div>
        <h1 className="text-3xl font-extrabold text-gray-100 tracking-tight sm:text-4xl">
          RAID & ZFS Storage Calculator
        </h1>
        <p className="mt-3 text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
          Plan your custom NAS build or home server storage pool. Compute usable storage, fault tolerance, parity overhead, and cost per TB.
        </p>
      </div>

      {/* Main Interactive Calculator */}
      <RaidCalculator />

      {/* RAID Comparison Guide Matrix */}
      <div className="mt-12 bg-gray-900/40 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-neon-green" />
          RAID & ZFS Layout Quick Reference
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="py-2.5 px-3 font-semibold">Layout</th>
                <th className="py-2.5 px-3 font-semibold">Min Drives</th>
                <th className="py-2.5 px-3 font-semibold">Usable Capacity</th>
                <th className="py-2.5 px-3 font-semibold">Fault Tolerance</th>
                <th className="py-2.5 px-3 font-semibold">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-neon-green">RAID 0</td>
                <td className="py-2.5 px-3">2</td>
                <td className="py-2.5 px-3">100% (All drives)</td>
                <td className="py-2.5 px-3 text-red-400">0 drives</td>
                <td className="py-2.5 px-3 text-gray-400">Temporary scratch space / max throughput</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-neon-green">RAID 1</td>
                <td className="py-2.5 px-3">2</td>
                <td className="py-2.5 px-3">50% (1 drive capacity)</td>
                <td className="py-2.5 px-3 text-emerald-400">N - 1 drives</td>
                <td className="py-2.5 px-3 text-gray-400">2-bay NAS, OS boot drives, critical small pools</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-neon-green">RAID 5 / RAIDZ1</td>
                <td className="py-2.5 px-3">3</td>
                <td className="py-2.5 px-3">(N - 1) × Size</td>
                <td className="py-2.5 px-3 text-yellow-400">1 drive</td>
                <td className="py-2.5 px-3 text-gray-400">3–5 drive media libraries and low-budget NAS</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-neon-green">RAID 6 / RAIDZ2</td>
                <td className="py-2.5 px-3">4</td>
                <td className="py-2.5 px-3">(N - 2) × Size</td>
                <td className="py-2.5 px-3 text-emerald-400">2 drives</td>
                <td className="py-2.5 px-3 text-gray-400">Standard for 6+ bay home servers & enterprise pools</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-neon-green">RAID 10</td>
                <td className="py-2.5 px-3">4 (even)</td>
                <td className="py-2.5 px-3">50% of total</td>
                <td className="py-2.5 px-3 text-emerald-400">1 drive / mirror</td>
                <td className="py-2.5 px-3 text-gray-400">High-IOPS databases, VM storage, fast rebuilds</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-neon-green">ZFS RAIDZ3</td>
                <td className="py-2.5 px-3">5</td>
                <td className="py-2.5 px-3">(N - 3) × Size</td>
                <td className="py-2.5 px-3 text-emerald-400">3 drives</td>
                <td className="py-2.5 px-3 text-gray-400">Ultra-wide 8–24 bay storage arrays</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Suggested NAS Builds */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400 mb-3">Ready to build your custom home server?</p>
        <Link
          to="/builds?type=NAS"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-neon-green text-gray-900 font-semibold rounded-lg hover:bg-neon-green/90 transition-all text-sm shadow-lg shadow-neon-green/10"
        >
          <Sparkles className="w-4 h-4" />
          Explore Pre-Configured NAS Builds →
        </Link>
      </div>
    </div>
  );
}
