# ⚡ DECKSMITH — The Cyberdeck Architecture, CAD & Telemetry Suite

<p align="center">
  <img src="https://img.shields.io/badge/DECKSMITH-v2.5.0-00ff66?style=for-the-badge&logo=electron&logoColor=black" alt="Decksmith Version" />
  <img src="https://img.shields.io/badge/REACT-19.0-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/THREE.JS-WebGL_CAD-white?style=for-the-badge&logo=threedotjs&logoColor=black" alt="Three.js" />
  <img src="https://img.shields.io/badge/TAILWIND_CSS-Cyberpunk-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=black" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/LICENSE-MIT-yellow?style=for-the-badge" alt="License" />
</p>

---

## 🌌 Overview

**Decksmith** is the premier modular hardware engineering platform and CAD studio designed specifically for cyberdeck makers, embedded engineers, and field operators. It unifies 10-slot modular system architecture, parametric 3D CAD modeling, OS display modeline injection, live telemetry diagnostics, mechanical keyboard matrix firmware generation, off-grid solar modeling, RF link budget calculations, and thermal CFD simulation into a single high-performance desktop and web application.

---

## 🛠️ Complete Engineering Studio Lineup

### 1. ⚡ Modular Blueprint Studio (`/builder`)
- **10-Slot Hardware Stacking**: SBCs, ultrawide bar displays, mechanical keyboards, battery management systems (BMS), SDRs, LoRa transceivers, cooling solutions, and auxiliary sensors.
- **Hardware Bus & Pinout Conflict Matrix**: Auto-maps 40-pin GPIO, I2C, SPI, and UART lines with collision shields.
- **Unified Cyberdeck Fabrication Dossier Exporter**: 1-click JSON bundle export combining full BOM, active pinout allocation, `/boot/firmware/config.txt` overlays, and first-boot setup shell scripts.

### 2. 📐 3D CAD, Enclosure & CNC Studio (`/cad`)
- **Interactive Three.js WebGL Orbit Viewer**: PBR material shading (anodized aluminum, acrylic, FR4 PCB solder mask, brass standoffs).
- **Exploded Assembly Slider**: $0\text{mm} \rightarrow 80\text{mm}$ continuous exploded layer view.
- **Parametric OpenSCAD Generator**: Customizable finger-joint enclosure generator with laser-cut kerf compensation.
- **Multi-Format Manufacturing Exporters**: 3D printable `.stl`, 2D laser vector `.dxf` / `.svg`, and CNC peck drilling G-Code.

### 3. 💿 OS Flasher & Modeline Provisioning Companion (`/flasher`)
- **Ultrawide Bar Display Modeline Injector**: Auto-generates exact `hdmi_timings`, `hdmi_group=2`, `hdmi_mode=87`, and `fbcon=rotate` for Waveshare 11.9", 8.8", AMOLED, and round displays.
- **Headless Pre-Seeding**: Cloud-Init `user-data` for automated Wi-Fi, SSH keys, hostname, and user creation.
- **Automated First-Boot HUD Setup**: 1-click `decksmith-setup.sh` installer script for zero-touch provisioning.

### 4. 📊 Field Companion & Real-Time Telemetry HUD (`/companion`)
- **Live Hardware Telemetry**: CPU load/clock curves, thermal throttle limits, and battery discharge trajectories.
- **Live I2C Bus Scanner**: Scans `/dev/i2c-1` (`0x00 - 0x77`) to identify connected sensors and peripherals.
- **9-DOF Attitude Compass & IMU**: Real-time pitch, roll, and heading visualization.
- **Tactical LoRa Mesh Packet Scope**: Live RSSI, SNR, frequency, and hop-count packet waterfall display.
- **Built-In Self-Test (BIST)**: Automated 5-stage hardware diagnostic self-test.

### 5. ⌨️ Mechanical Keyboard Matrix & Switch Plate Studio (`/keyboard`)
- **Ergonomic Layout Presets**: 40% Ortholinear (Planck 4x12), 36-Key Split (Corne/Sweep), and Tactile BBQ20 / Q10 thumbpads.
- **Handwired Diode Matrix & Auto-Routing**: `COL2ROW` and `ROW2COL` polarity with GPIO auto-mapping for RP2040 Pico, Pro Micro, and STM32 BlackPill.
- **Firmware Exporters**: 1-click QMK `keymap.c`, KMK CircuitPython `code.py`, and Vial GUI JSON.
- **3D Switch Plate Exporter**: Parametric OpenSCAD `.scad` with exact $13.8\text{mm}$ (Kailh Choc) or $14.0\text{mm}$ (Cherry MX) cutouts.

### 6. ☀️ Solar & Off-Grid Energy Harvesting Studio (`/solar`)
- **Real-Time Daily Energy Balance ($Wh/\text{day}$)**: Active vs. standby consumption against solar harvesting curves.
- **Geographic Insolation Modeling**: Peak Sun Hours ($2.0 - 7.0\text{ PSH}$) and MPPT ($95\%$) vs. PWM ($75\%$) efficiency.
- **Battery Chemistry & Depth of Discharge (DoD)**: LiFePO4 ($90\%$), Li-Ion ($80\%$), and LTO ($98\%$) lifetime cycle modeling.
- **Autonomy Reserve Calculation**: Computes exact zero-sun overcast autonomy reserve days.

### 7. 📡 Tactical Wireless Range & RF Link Budget Studio (`/rf`)
- **Free Space Path Loss (FSPL) & Link Budget**: Computes EIRP, receiver sensitivity thresholds, and link fade margins ($dB$).
- **Fresnel Zone Clearance**: Calculates 1st Fresnel zone midpoint radius ($r_1$) and 60% ground clearance height ($m$).
- **Radio Horizon Line-of-Sight (LoS)**: Computes antenna elevation horizon distance ($d \approx 3.57(\sqrt{h_{tx}} + \sqrt{h_{rx}})\text{ km}$).
- **Coaxial Cable Attenuation**: LMR-400, RG-58, RG-316, and RG-174 attenuation tables.

### 8. ❄️ Thermal Dissipation & Active Cooling Studio (`/cooling`)
- **Silicon SoC Heat Generation**: Pre-configured TDP profiles for Raspberry Pi 5 ($12W$), RK3588 ($18W$), and RPi 4B ($7.5W$).
- **Heatsink Convection Resistance ($\theta_{\text{total}}$)**: Dynamic PWM fan modulation ($CFM$) and steady-state junction temperature ($T_j$) modeling.
- **Chassis Confinement & Air Turnover**: Full air volume exchange rates and fan acoustic sound pressure level ($dBA$ SPL).

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v20+ (v24 LTS recommended)
- [pnpm](https://pnpm.io/) v9+

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/decksmith.git
   cd decksmith
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Initialize the database**:
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   pnpm --filter @decksmith/database seed
   ```

4. **Start Development Servers**:
   ```bash
   # Start API server + Web app concurrently
   pnpm dev
   ```

5. **Launch Desktop Electron App**:
   ```bash
   bash scripts/launch-desktop.sh
   ```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 📦 Monorepo Architecture

```
decksmith/
├── apps/
│   ├── web/         # React 19 + Vite + Tailwind CSS + Three.js
│   ├── api/         # Express.js REST API with Prisma ORM
│   └── desktop/     # Electron Desktop Shell
├── packages/
│   ├── shared/      # TypeScript interfaces, types & validation schemas
│   ├── database/    # Prisma Client, seeders & schema definitions
│   ├── ai/          # AI Architect Chat & LLM integrations
│   └── scraper/     # Hardware component catalog scrapers
├── prisma/          # Prisma schema & SQLite database
└── scripts/         # Desktop launcher & build automation scripts
```

---

## ⌨️ Shortcuts & Hotkeys

- **`Ctrl+K` / `Cmd+K`**: Global Cyberdeck Command Palette (instant tool jumping and parts search).
- **Tactile Audio FX**: Synthesized mechanical switch clicks and confirmation chimes (toggleable in navbar).

---

## 📜 License

MIT License © 2026 Decksmith Open-Source Engineering Group
