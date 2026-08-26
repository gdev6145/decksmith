---
name: decksmith-os-flasher-bootloader-studio
description: >-
  Develop or enhance OS image flashing tools, WebUSB/WebSerial bootloader interfaces, and firmware provisioners.
  Use when modifying OsFlasherStudio, WebSerialStudio, esptool.js flashing, UF2 drag-and-drop, or dfu-util USB tools.
---

# Decksmith OS Flasher & Bootloader Studio Guide

This skill provides patterns for building WebUSB/WebSerial firmware flashing tools in `OsFlasherStudio.tsx` and `WebSerialStudio.tsx`.

---

## 1. WebUSB/WebSerial Flashing Protocols

Decksmith supports direct browser flashing for Cyberdeck microcontrollers and Single Board Computers:

- **ESP32 / ESP8266**: `esptool.js` over WebSerial (Baud rate: `921600` or `115200`).
- **RP2040 (Raspberry Pi Pico)**: UF2 bootloader drive mounting & block byte writing.
- **STM32**: DFU (Device Firmware Upgrade) over WebUSB (`dfu-util` JS port).
- **SD Card OS Provisioning**: Raspberry Pi OS / Armbian raw `.img` / `.iso` chunk writing via File System Access API.

---

## 2. WebSerial Progress Streaming Pattern

```tsx
export async function flashEsp32Firmware(
  port: SerialPort,
  firmwareBuffer: ArrayBuffer,
  onProgress: (percent: number) => void
) {
  await port.open({ baudRate: 921600 });
  const writer = port.writable.getWriter();
  
  const chunkSize = 4096;
  const totalBytes = firmwareBuffer.byteLength;
  let offset = 0;

  while (offset < totalBytes) {
    const chunk = new Uint8Array(firmwareBuffer, offset, Math.min(chunkSize, totalBytes - offset));
    await writer.write(chunk);
    offset += chunk.length;
    onProgress(Math.round((offset / totalBytes) * 100));
  }

  writer.releaseLock();
  await port.close();
}
```
