---
name: decksmith-bms-power-delivery-studio
description: >-
  Develop or enhance battery management system (BMS) calculators, USB-PD power profile selectors, and MPPT solar charging tools.
  Use when modifying PowerDeliveryStudio, SolarEnergyStudio, battery discharge curve formulas, or USB-PD contract modeling.
---

# Decksmith BMS & Power Delivery Studio Guide

This skill provides formulas and patterns for battery management and power delivery calculators in `PowerDeliveryStudio.tsx` and `SolarEnergyStudio.tsx`.

---

## 1. Battery Chemistry & Discharge Curves

| Battery Chemistry | Nominal Voltage | Max Charge | Cutoff Voltage | Energy Density |
| :--- | :--- | :--- | :--- | :--- |
| **LiFePO4** (Lithium Iron Phosphate) | 3.2V / cell | 3.65V / cell | 2.5V / cell | Safe, high cycle life (2000+) |
| **Li-ion** (18650 / 21700) | 3.7V / cell | 4.20V / cell | 3.0V / cell | High capacity, thermal care needed |
| **LiPo** (Pouch cell) | 3.7V / cell | 4.20V / cell | 3.2V / cell | Thin profile for cyberdeck chassis |

---

## 2. USB-PD (Power Delivery) Contract Calculation

Calculate system runtime from battery capacity (Wh) and component power draw (W):

```ts
export interface PowerBudgetInput {
  sbcWattage: number;      // e.g. 15W (Raspberry Pi 5)
  displayWattage: number;  // e.g. 7W (7" IPS Touchscreen)
  sdrRadioWattage: number; // e.g. 5W (HackRF / RTL-SDR)
  batteryWh: number;       // e.g. 50Wh (14.8V 3400mAh 4S Li-ion)
  efficiencyFactor?: number; // e.g. 0.88 (Buck/Boost DC-DC converter efficiency)
}

export function calculateCyberdeckRuntime(input: PowerBudgetInput) {
  const totalPowerW = input.sbcWattage + input.displayWattage + input.sdrRadioWattage;
  const efficiency = input.efficiencyFactor || 0.88;
  const usableWh = input.batteryWh * efficiency;
  const runtimeHours = usableWh / totalPowerW;

  return {
    totalPowerW,
    usableWh: usableWh.toFixed(1),
    runtimeHours: runtimeHours.toFixed(2),
    runtimeFormatted: `${Math.floor(runtimeHours)}h ${Math.round((runtimeHours % 1) * 60)}m`,
  };
}
```
