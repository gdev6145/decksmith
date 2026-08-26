---
name: decksmith-mobile-react-native-companion
description: >-
  Develop or enhance the Decksmith Mobile companion application (`apps/mobile`).
  Use when building React Native mobile screens, Bluetooth Low Energy (BLE) cyberdeck scanners, mobile QR code scanners, or telemetry widgets.
---

# Decksmith Mobile Companion App Guide

This skill provides patterns for developing the mobile companion application in `apps/mobile/`.

---

## 1. Bluetooth Low Energy (BLE) Cyberdeck Scanning

The mobile companion scans for nearby active cyberdecks broadcasting telemetry via BLE GATT services:

```ts
import { BleManager } from "react-native-ble-plx";

const bleManager = new BleManager();
const CYBERDECK_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";

export function startCyberdeckScan(onDeviceFound: (device: { id: string; name: string }) => void) {
  bleManager.startDeviceScan([CYBERDECK_SERVICE_UUID], null, (error, device) => {
    if (error) {
      console.error("BLE Scan Error:", error);
      return;
    }
    if (device && device.name) {
      onDeviceFound({ id: device.id, name: device.name });
    }
  });
}
```

---

## 2. Shared Workspace Package Imports

`apps/mobile` reuses models and types from `@decksmith/shared`:

```ts
import type { Build, Part, CyberdeckTelemetry } from "@decksmith/shared";
```
