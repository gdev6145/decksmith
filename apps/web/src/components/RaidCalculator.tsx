import React, { useState, useMemo } from "react";
import { HardDrive, ShieldCheck, ShieldAlert, Cpu, Layers, DollarSign, Info } from "lucide-react";

export type RaidLevel = "RAID0" | "RAID1" | "RAID5" | "RAID6" | "RAID10" | "RAIDZ1" | "RAIDZ2" | "RAIDZ3" | "JBOD";

interface RaidCalculatorProps {
  initialDriveCount?: number;
  initialDriveCapacityTB?: number;
  initialRaidLevel?: RaidLevel;
  driveCostUSD?: number;
  isEmbedded?: boolean;
}

export default function RaidCalculator({
  initialDriveCount = 4,
  initialDriveCapacityTB = 4,
  initialRaidLevel = "RAID5",
  driveCostUSD = 99.99,
  isEmbedded = false,
}: RaidCalculatorProps) {
  const [driveCount, setDriveCount] = useState<number>(initialDriveCount);
  const [driveCapacityTB, setDriveCapacityTB] = useState<number>(initialDriveCapacityTB);
  const [raidLevel, setRaidLevel] = useState<RaidLevel>(initialRaidLevel);
  const [drivePrice, setDrivePrice] = useState<number>(driveCostUSD);

  const calculations = useMemo(() => {
    const rawCapacity = driveCount * driveCapacityTB;
    let usableCapacity = 0;
    let parityCapacity = 0;
    let faultTolerance = 0;
    let faultToleranceDesc = "";
    let readSpeedMult = 1;
    let writeSpeedMult = 1;
    let minDrives = 1;
    let isValid = true;
    let errorMsg = "";

    switch (raidLevel) {
      case "JBOD":
        minDrives = 1;
        usableCapacity = rawCapacity;
        parityCapacity = 0;
        faultTolerance = 0;
        faultToleranceDesc = "0 drives (no fault tolerance)";
        readSpeedMult = 1;
        writeSpeedMult = 1;
        break;

      case "RAID0":
        minDrives = 2;
        if (driveCount < 2) {
          isValid = false;
          errorMsg = "RAID 0 requires at least 2 drives";
        }
        usableCapacity = rawCapacity;
        parityCapacity = 0;
        faultTolerance = 0;
        faultToleranceDesc = "0 drives (any drive failure results in total data loss)";
        readSpeedMult = driveCount;
        writeSpeedMult = driveCount;
        break;

      case "RAID1":
        minDrives = 2;
        if (driveCount < 2) {
          isValid = false;
          errorMsg = "RAID 1 requires at least 2 drives";
        }
        usableCapacity = driveCapacityTB;
        parityCapacity = rawCapacity - usableCapacity;
        faultTolerance = driveCount - 1;
        faultToleranceDesc = `${driveCount - 1} drive(s) (all identical copies)`;
        readSpeedMult = driveCount;
        writeSpeedMult = 1;
        break;

      case "RAID5":
      case "RAIDZ1":
        minDrives = 3;
        if (driveCount < 3) {
          isValid = false;
          errorMsg = `${raidLevel} requires at least 3 drives`;
        }
        usableCapacity = (driveCount - 1) * driveCapacityTB;
        parityCapacity = driveCapacityTB;
        faultTolerance = 1;
        faultToleranceDesc = "1 drive can fail without data loss";
        readSpeedMult = driveCount - 1;
        writeSpeedMult = 0.8;
        break;

      case "RAID6":
      case "RAIDZ2":
        minDrives = 4;
        if (driveCount < 4) {
          isValid = false;
          errorMsg = `${raidLevel} requires at least 4 drives`;
        }
        usableCapacity = (driveCount - 2) * driveCapacityTB;
        parityCapacity = 2 * driveCapacityTB;
        faultTolerance = 2;
        faultToleranceDesc = "2 drives can fail simultaneously without data loss";
        readSpeedMult = driveCount - 2;
        writeSpeedMult = 0.65;
        break;

      case "RAIDZ3":
        minDrives = 5;
        if (driveCount < 5) {
          isValid = false;
          errorMsg = "RAIDZ3 requires at least 5 drives";
        }
        usableCapacity = (driveCount - 3) * driveCapacityTB;
        parityCapacity = 3 * driveCapacityTB;
        faultTolerance = 3;
        faultToleranceDesc = "3 drives can fail simultaneously without data loss";
        readSpeedMult = driveCount - 3;
        writeSpeedMult = 0.55;
        break;

      case "RAID10":
        minDrives = 4;
        if (driveCount < 4 || driveCount % 2 !== 0) {
          isValid = false;
          errorMsg = "RAID 10 requires an even number of drives (minimum 4)";
        }
        usableCapacity = (driveCount / 2) * driveCapacityTB;
        parityCapacity = (driveCount / 2) * driveCapacityTB;
        faultTolerance = 1;
        faultToleranceDesc = "1 to " + (driveCount / 2) + " drives (1 drive per mirrored pair)";
        readSpeedMult = driveCount;
        writeSpeedMult = driveCount / 2;
        break;
    }

    const efficiency = rawCapacity > 0 ? (usableCapacity / rawCapacity) * 100 : 0;
    const totalCost = driveCount * drivePrice;
    const costPerUsableTB = usableCapacity > 0 ? totalCost / usableCapacity : 0;

    return {
      rawCapacity,
      usableCapacity: Math.max(0, usableCapacity),
      parityCapacity: Math.max(0, parityCapacity),
      efficiency: Math.max(0, efficiency),
      faultTolerance,
      faultToleranceDesc,
      readSpeedMult,
      writeSpeedMult,
      minDrives,
      isValid,
      errorMsg,
      totalCost,
      costPerUsableTB,
    };
  }, [driveCount, driveCapacityTB, raidLevel, drivePrice]);

  const raidDescriptions: Record<RaidLevel, string> = {
    JBOD: "Just a Bunch Of Disks — Spans storage across drives without striping or redundancy.",
    RAID0: "Striping — Maximum speed and capacity, zero redundancy. Data is lost if 1 drive fails.",
    RAID1: "Mirroring — Full duplicate copies of data across all drives for high reliability.",
    RAID5: "Single Parity — Block-level striping with distributed parity. 1 drive failure tolerance.",
    RAID6: "Dual Parity — Block striping with dual distributed parity. 2 drive failure tolerance.",
    RAID10: "Stripe of Mirrors — High performance and redundancy. Requires even number of disks.",
    RAIDZ1: "ZFS Single Parity — Dynamic striping without RAID write-hole vulnerabilities. 1 drive fault tolerance.",
    RAIDZ2: "ZFS Dual Parity — Recommended standard for modern NAS builds. 2 drive fault tolerance with self-healing.",
    RAIDZ3: "ZFS Triple Parity — Ultra-resilient layout for large storage arrays (8+ disks). 3 drive fault tolerance.",
  };

  return (
    <div className={`bg-gray-900/60 border border-gray-800 rounded-xl p-5 ${isEmbedded ? "" : "max-w-4xl mx-auto my-6"}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neon-green/20 text-neon-green flex items-center justify-center">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-100 text-base">RAID & ZFS Storage Calculator</h3>
            <p className="text-xs text-gray-400">Calculate usable capacity, fault tolerance, and cost efficiency</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 bg-gray-800 text-neon-green rounded-full font-mono font-medium">
          {raidLevel}
        </span>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Drive Count */}
        <div className="bg-gray-800/40 border border-gray-700/60 rounded-lg p-3">
          <label className="text-xs text-gray-400 font-medium block mb-1.5 flex items-center justify-between">
            <span>Number of Drives</span>
            <span className="text-neon-green font-bold">{driveCount}</span>
          </label>
          <input
            type="range"
            min={2}
            max={16}
            value={driveCount}
            onChange={(e) => setDriveCount(parseInt(e.target.value))}
            className="w-full accent-neon-green bg-gray-700 h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>2</span>
            <span>8</span>
            <span>16</span>
          </div>
        </div>

        {/* Drive Capacity */}
        <div className="bg-gray-800/40 border border-gray-700/60 rounded-lg p-3">
          <label className="text-xs text-gray-400 font-medium block mb-1.5">Drive Capacity (TB)</label>
          <select
            value={driveCapacityTB}
            onChange={(e) => setDriveCapacityTB(parseFloat(e.target.value))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2.5 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-neon-green"
          >
            {[1, 2, 4, 8, 12, 16, 18, 20, 22, 24].map((size) => (
              <option key={size} value={size}>
                {size} TB
              </option>
            ))}
          </select>
        </div>

        {/* RAID / ZFS Type */}
        <div className="bg-gray-800/40 border border-gray-700/60 rounded-lg p-3">
          <label className="text-xs text-gray-400 font-medium block mb-1.5">RAID / ZFS Array</label>
          <select
            value={raidLevel}
            onChange={(e) => setRaidLevel(e.target.value as RaidLevel)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2.5 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-neon-green"
          >
            <optgroup label="Standard RAID">
              <option value="RAID0">RAID 0 (Stripe)</option>
              <option value="RAID1">RAID 1 (Mirror)</option>
              <option value="RAID5">RAID 5 (Parity)</option>
              <option value="RAID6">RAID 6 (Dual Parity)</option>
              <option value="RAID10">RAID 10 (1+0)</option>
              <option value="JBOD">JBOD (Concat)</option>
            </optgroup>
            <optgroup label="ZFS Storage Pools">
              <option value="RAIDZ1">ZFS RAIDZ1 (1 Parity)</option>
              <option value="RAIDZ2">ZFS RAIDZ2 (2 Parity)</option>
              <option value="RAIDZ3">ZFS RAIDZ3 (3 Parity)</option>
            </optgroup>
          </select>
        </div>

        {/* Drive Price */}
        <div className="bg-gray-800/40 border border-gray-700/60 rounded-lg p-3">
          <label className="text-xs text-gray-400 font-medium block mb-1.5">Est. Price / Drive ($)</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500">$</span>
            <input
              type="number"
              min={0}
              step={5}
              value={drivePrice}
              onChange={(e) => setDrivePrice(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-6 pr-2.5 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-neon-green"
            />
          </div>
        </div>
      </div>

      {/* Validation Alert */}
      {!calculations.isValid && (
        <div className="mb-4 p-3 bg-red-950/40 border border-red-800/80 rounded-lg flex items-center gap-2.5 text-red-400 text-xs">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{calculations.errorMsg}</span>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-gray-800/50 border border-gray-700/60 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Usable Storage</p>
          <p className="text-xl font-extrabold text-neon-green">
            {calculations.usableCapacity} <span className="text-xs font-normal text-gray-400">TB</span>
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">{calculations.efficiency.toFixed(1)}% usable</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/60 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Parity / Redundancy</p>
          <p className="text-xl font-extrabold text-yellow-400">
            {calculations.parityCapacity} <span className="text-xs font-normal text-gray-400">TB</span>
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">{calculations.rawCapacity} TB Raw Total</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/60 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Fault Tolerance</p>
          <div className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <p className="text-xl font-extrabold text-blue-400">{calculations.faultTolerance}</p>
            <span className="text-xs text-gray-400">disk{calculations.faultTolerance !== 1 ? "s" : ""}</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5 truncate" title={calculations.faultToleranceDesc}>
            {calculations.faultToleranceDesc}
          </p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/60 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Cost Efficiency</p>
          <p className="text-xl font-extrabold text-purple-400">
            ${calculations.costPerUsableTB.toFixed(2)}
            <span className="text-[10px] font-normal text-gray-400">/TB</span>
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">${calculations.totalCost.toFixed(0)} total</p>
        </div>
      </div>

      {/* Visual Capacity Breakdown Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-gray-400 font-medium">Storage Allocation</span>
          <span className="text-gray-500 text-[11px]">
            {calculations.usableCapacity} TB usable / {calculations.parityCapacity} TB protection
          </span>
        </div>
        <div className="h-3.5 w-full bg-gray-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${calculations.efficiency}%` }}
            className="bg-neon-green transition-all duration-300 relative group"
            title={`Usable Data: ${calculations.usableCapacity} TB`}
          />
          <div
            style={{ width: `${100 - calculations.efficiency}%` }}
            className="bg-yellow-500/80 transition-all duration-300 relative group"
            title={`Parity / Mirroring: ${calculations.parityCapacity} TB`}
          />
        </div>
        <div className="flex items-center gap-4 text-xs mt-2 text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neon-green" />
            <span>Usable Data ({calculations.usableCapacity} TB)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span>Parity & Redundancy ({calculations.parityCapacity} TB)</span>
          </div>
        </div>
      </div>

      {/* Disk Grid Visualizer */}
      <div className="bg-gray-950/60 border border-gray-800 rounded-lg p-3.5 mb-4">
        <p className="text-xs font-semibold text-gray-300 mb-2.5 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-neon-green" />
          Disk Array Layout ({driveCount} × {driveCapacityTB}TB drives)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {Array.from({ length: driveCount }).map((_, i) => {
            const isParityDrive =
              raidLevel === "RAID1"
                ? i > 0
                : raidLevel === "RAID5" || raidLevel === "RAIDZ1"
                ? i === driveCount - 1
                : raidLevel === "RAID6" || raidLevel === "RAIDZ2"
                ? i >= driveCount - 2
                : raidLevel === "RAIDZ3"
                ? i >= driveCount - 3
                : raidLevel === "RAID10"
                ? i % 2 === 1
                : false;

            return (
              <div
                key={i}
                className={`p-2 rounded-lg border text-center transition-all ${
                  isParityDrive
                    ? "bg-yellow-950/20 border-yellow-700/50 text-yellow-300"
                    : "bg-emerald-950/20 border-emerald-700/50 text-emerald-300"
                }`}
              >
                <div className="text-[10px] uppercase font-mono text-gray-400">Drive {i + 1}</div>
                <div className="font-bold text-xs mt-0.5">{driveCapacityTB} TB</div>
                <div className="text-[9px] mt-1 px-1 py-0.2 rounded bg-black/40 text-gray-300">
                  {isParityDrive ? "Parity/Mirror" : "Data Striped"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Description / Explanation */}
      <div className="p-3 bg-gray-800/30 border border-gray-800 rounded-lg text-xs text-gray-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-neon-green shrink-0 mt-0.5" />
        <div>
          <span className="font-medium text-gray-200">{raidLevel}: </span>
          {raidDescriptions[raidLevel]}
        </div>
      </div>
    </div>
  );
}
