# 🚀 Google Play Store Release & Submission Guide

This document contains all verified metadata, graphics specifications, and step-by-step instructions for publishing **Decksmith** to the Google Play Store.

---

## 📱 1. App Identity & Store Listing

### **App Title** (Max 30 chars)
`Decksmith - Cyberdeck Studio`

### **Short Description** (Max 80 chars)
`The Ultimate Cyberdeck Architecture, 3D CAD & Hardware Engineering Suite.`

### **Full Description** (Max 4000 chars)
```markdown
Decksmith is the definitive hardware engineering, architecture, and field diagnostics companion for building custom cyberdecks, portable terminal workstations, off-grid radios, and handheld computers.

Whether you are crafting an ultra-rugged Pelican case terminal, an ortholinear mechanical field deck, or a solar-powered mesh communications station, Decksmith provides deep, end-to-end hardware studio tools directly on your device.

KEY HARDWARE STUDIOS & CAPABILITIES:

⚡ Interactive Blueprint & BOM Studio:
- Configure Single-Board Computers (Raspberry Pi 5/4/Zero, Orange Pi, Rockchip, RISC-V).
- Auto-calculate power budgets, total wattage draws, weight, and multi-vendor pricing.
- 1-click export of structured Bill of Materials in CSV, JSON, and Markdown formats.

📐 Parametric 3D CAD & CNC Studio:
- Live 3D WebGL orbit viewer with realistic depth and component stacking.
- Real-time layer explosion slider (0% to 100%) to inspect internal fastener clearances.
- 1-click export of 3D printable STL models, laser-cut DXF faceplates, CNC G-Code, and OpenSCAD parametric code.

🔧 40-Pin GPIO Multiplexer:
- Complete interactive pinout explorer with alternate function mapping (I2C, SPI, UART, I2S, PWM).
- Automatic Device Tree Overlay (.dts) and KiCad schematic symbol generation.
- Python hardware self-test scripts.

📊 Real Host Telemetry & Field HUD:
- Real-time hardware telemetry reading CPU core frequencies, memory load, Linux thermal zones, and battery status.
- Live device gyroscope, pitch/roll artificial horizon, compass heading, and audible alert systems.

💾 Zero-Touch OS Provisioner:
- Custom display modeline generator for ultrawide bar screens (11.9", 8.8", E-ink).
- Headless Wi-Fi and SSH cloud-init provisioning files and firstboot.sh scripts.

⌨️ Mechanical Switch Matrix & Audio Synth:
- Custom matrix layout designer with QMK and KMK firmware generators.
- Real Web MIDI Hardware API support: Plug in USB MIDI controllers and play with zero latency!
- Interactive mechanical switch acoustics simulator.

☀️ Solar & Off-Grid Autonomy:
- 24-hour diurnal solar irradiance and MPPT efficiency simulator.
- LiFePO4 / LiPo / LTO cold-weather derating curves and days-of-autonomy calculations.

📡 SDR & Wireless RF Link Budget:
- Free Space Path Loss (FSPL) and 1st Fresnel zone clearance calculator.
- Real-time FFT waterfall spectrum and WebUSB RTL-SDR / HackRF connectivity.

PRIVACY & DATA SOVEREIGNTY:
- Zero third-party advertising SDKs or tracking scripts.
- Offline-first architecture with instant PWA & native execution.
- Open-source and community driven.
```

---

## 🎨 2. Graphical Assets Checklist

| Asset | Dimensions | Location | Status |
|---|---|---|---|
| **App Icon** | 512 x 512 px (PNG 32-bit) | `apps/web/public/icon-512.png` | ✅ Generated |
| **Maskable Icon** | 512 x 512 px (PNG) | `apps/web/public/icon-maskable.png` | ✅ Generated |
| **Feature Graphic** | 1024 x 500 px (PNG/JPEG) | `apps/web/public/play-store-feature-graphic.png` | ✅ Generated |
| **Launcher Mipmaps** | mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi | `android/app/src/main/res/mipmap-*` | ✅ Generated |

---

## 🛠️ 3. Google Play Console Configuration

1. **Category**: `Tools` / `Productivity`
2. **Content Rating**: `Everyone (PEGI 3 / ESRB Everyone)`
3. **Target Audience**: `Age 13 and older`
4. **Privacy Policy URL**: `https://decksmith.app/privacy` (or your public GitHub Pages URL)
5. **Target SDK**: `API Level 34 (Android 14)`

---

## 📦 4. Building the Signed Android App Bundle (.aab)

To generate the production release bundle for Google Play Console:

```bash
# Navigate to android native directory
cd android

# Generate release keystore (if not already created)
keytool -genkey -v -keystore decksmith-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias decksmith

# Build production Android App Bundle (.aab)
./gradlew bundleRelease
```

The output bundle will be located at:
`android/app/build/outputs/bundle/release/app-release.aab`
