import { Router } from "express";
import os from "os";
import fs from "fs";

const router: Router = Router();

function getLinuxThermalTemp(): number | null {
  try {
    const zones = ["/sys/class/thermal/thermal_zone0/temp", "/sys/class/thermal/thermal_zone1/temp"];
    for (const z of zones) {
      if (fs.existsSync(z)) {
        const raw = fs.readFileSync(z, "utf-8").trim();
        const val = parseFloat(raw);
        if (!isNaN(val)) {
          return val > 1000 ? Math.round((val / 1000) * 10) / 10 : Math.round(val * 10) / 10;
        }
      }
    }
  } catch {
    // fallback
  }
  return null;
}

function getBatteryInfo(): { percent: number | null; status: string | null } {
  try {
    const batPath = "/sys/class/power_supply/BAT0";
    const bat1Path = "/sys/class/power_supply/BAT1";
    const target = fs.existsSync(batPath) ? batPath : fs.existsSync(bat1Path) ? bat1Path : null;
    if (target) {
      const capFile = `${target}/capacity`;
      const statFile = `${target}/status`;
      const percent = fs.existsSync(capFile) ? parseInt(fs.readFileSync(capFile, "utf-8").trim(), 10) : null;
      const status = fs.existsSync(statFile) ? fs.readFileSync(statFile, "utf-8").trim() : null;
      return { percent: isNaN(percent as any) ? null : percent, status };
    }
  } catch {
    // fallback
  }
  return { percent: null, status: null };
}

router.get("/system-telemetry", (_req, res) => {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const loadAvg = os.loadavg();
  const thermalTemp = getLinuxThermalTemp();
  const battery = getBatteryInfo();

  res.json({
    timestamp: new Date().toISOString(),
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    uptimeSeconds: Math.round(os.uptime()),
    cpu: {
      model: cpus[0]?.model || "Unknown CPU",
      cores: cpus.length,
      speedMhz: cpus[0]?.speed || 0,
      load1m: Math.round(loadAvg[0] * 100) / 100,
      load5m: Math.round(loadAvg[1] * 100) / 100,
      load15m: Math.round(loadAvg[2] * 100) / 100,
      tempC: thermalTemp,
    },
    memory: {
      totalMb: Math.round(totalMem / (1024 * 1024)),
      usedMb: Math.round(usedMem / (1024 * 1024)),
      freeMb: Math.round(freeMem / (1024 * 1024)),
      usedPercent: Math.round((usedMem / totalMem) * 100),
    },
    battery,
  });
});

export default router;
