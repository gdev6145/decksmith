---
name: decksmith-rf-lora-gps-studio
description: >-
  Develop or enhance RF link budget calculators, LoRa/Meshtastic range estimators, NMEA GPS trackers, and GIS mapping tools.
  Use when modifying RfLinkBudgetStudio, GpsTrackerStudio, antenna gain formulas, or NMEA sentence parsers.
---

# Decksmith RF Link Budget, LoRa & GPS Studio Guide

This skill provides formulas and patterns for radio frequency link budgets and GPS telemetry tools in `RfLinkBudgetStudio.tsx` and `GpsTrackerStudio.tsx`.

---

## 1. Friis Path Loss & Link Budget Calculation

$$FSPL (dB) = 20 \log_{10}(d) + 20 \log_{10}(f) + 32.44$$

Where:
- $d$ = distance in kilometers
- $f$ = frequency in MHz (e.g. 915 MHz for LoRa / Meshtastic)

```ts
export function calculateRfLinkBudget(params: {
  txPowerDbm: number;   // e.g. 20 dBm (100mW LoRa TX)
  txAntennaDbi: number; // e.g. 3 dBi
  rxAntennaDbi: number; // e.g. 5 dBi
  frequencyMhz: number; // e.g. 915 MHz
  distanceKm: number;   // e.g. 10 km
  rxSensitivityDbm: number; // e.g. -137 dBm (SX1262 LoRa)
}) {
  const fspl = 20 * Math.log10(params.distanceKm) + 20 * Math.log10(params.frequencyMhz) + 32.44;
  const rxPowerDbm = params.txPowerDbm + params.txAntennaDbi + params.rxAntennaDbi - fspl;
  const linkMarginDb = rxPowerDbm - params.rxSensitivityDbm;

  return {
    fsplDb: fspl.toFixed(2),
    receivedPowerDbm: rxPowerDbm.toFixed(2),
    linkMarginDb: linkMarginDb.toFixed(2),
    isViable: linkMarginDb > 10,
  };
}
```

---

## 2. NMEA GPS Sentence Parser (`$GPRMC` / `$GPGGA`)

```ts
export function parseNmeaGpgga(sentence: string) {
  const parts = sentence.split(",");
  if (parts[0] !== "$GPGGA" && parts[0] !== "$GNGGA") return null;

  const rawLat = parts[2];
  const latDir = parts[3];
  const rawLon = parts[4];
  const lonDir = parts[5];
  const fixQuality = parseInt(parts[6] || "0", 10);
  const satellites = parseInt(parts[7] || "0", 10);
  const altitude = parseFloat(parts[9] || "0");

  const convertCoord = (val: string, dir: string) => {
    if (!val) return 0;
    const deg = parseFloat(val.slice(0, 2));
    const min = parseFloat(val.slice(2));
    const dec = deg + min / 60;
    return dir === "S" || dir === "W" ? -dec : dec;
  };

  return {
    latitude: convertCoord(rawLat, latDir),
    longitude: convertCoord(rawLon, lonDir),
    fixQuality,
    satellites,
    altitudeMeters: altitude,
  };
}
```
