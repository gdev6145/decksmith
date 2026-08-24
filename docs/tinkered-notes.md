# Tinkered — Notes & Ideas We Can Copy for Decksmith

Source: `https://tinkered.ai` (public marketing site + components library; the app at `app.tinkered.ai` is behind auth).

Tinkered = AI hardware design platform. Core loop: **Build → Simulate → Deploy**. Describe a device in plain language → it generates circuit, schematic, component research, firmware, 3D simulation, deployment — all as ONE connected editable model.

---

## 1. The Core Positioning (steal the framing)

> "From idea to a working electronic device."
> "Describe the hardware project you want to build."

- **Value prop formula**: describe intent in plain language → get a complete, connected, validated result (not a single text answer).
- **Loop**: Build → Simulate → Deploy, keeps every artifact in sync as you revise.
- **Trust numbers**: "150K+ makers", "1,300+ boards", "92 supported [component families]".
- **"Pick a build. Make it yours."** — template gallery on the homepage with category chips (`ESP32 · SENSORS`, `ARDUINO · DISPLAY`).

**For Decksmith**: reposition the chat as "Describe your cyberdeck → get a complete parts list + wiring + firmware plan + estimated cost as one connected build." Homepage template gallery of deck archetypes (budget Pi Zero deck, Pi 5 workstation, field terminal, retro luggable...).

---

## 2. Template Gallery (highest-value copy)

Homepage shows clickable templates, each pre-fills a prompt:
- `Build a smart plant monitor` (ESP32 · SENSORS)
- `Make a desktop weather station` (ARDUINO · DISPLAY)
- `Prototype an ESP32 flight radar` (ESP32 · DISPLAY)
- `Build an Arduino Uno ultrasonic parking sensor` (...)

Each card = image + board type + category chip + one-line prompt.

**For Decksmith**: a "Pick a build" grid on Home. Cards pre-fill the chat prompt, e.g.:
- "Build a compact Raspberry Pi Zero 2 W cyberdeck with a 5 inch display" (SBC · DISPLAY)
- "Pi 5 workstation deck with UPS battery" (SBC · POWER)
- "Minimalist field terminal with mechanical keyboard" (SBC · INPUT)
- "Budget deck under $100"

---

## 3. Component Library (we already have this partially)

92 component families, organized in categories:
- Microcontrollers (9), Breadboards (2), LEDs & Addressable (11), Passives & Discretes (15), Sensors (22), Communication (1), Displays (10), Actuators & Motors (15), Logic ICs (3), Power (1), Input (3).

Each component:
- **slug id** in backticks (`esp32-devkit-v1`, `bme680`, `raspberry-pi-pico-w`) — machine-readable identifiers
- 3D CAD thumbnail ("Drag to rotate · Scroll to zoom")
- name + tagline (`RP2040 · Wi-Fi`)
- `/components/<slug>` detail page

**For Decksmith**: our Parts DB already has slugs + categories + images. We can add a `/parts` filter bar by category (SBC / DISPLAY / BATTERY / POWER / STORAGE / NETWORK / INPUT / AUDIO) and a category count on each (like "9 supported").

---

## 4. Component Detail Page (rich structure to copy)

The `raspberry-pi-pico-w` page has sections:
1. **Overview** — plain-language description of what it is, key specs, quirks.
2. **Pin reference** — full table (pin, function, type).
3. **Specifications** — key/value table (voltage, clock, flash, RAM, GPIO, ADC, PWM, dimensions) + "Verified from the Tinkered component library".
4. **Circuit requirements** — what you must do to use it safely (level shifting, power, shared pins).
5. **Common mistakes** — named failure modes with explanations (e.g., "Blinking the LED like it is a plain Pico", "Assuming the GPIO are 5V tolerant").
6. **Datasheet** — link.
7. **Popular projects** — 4-6 example use cases ("Wi-Fi environmental sensor", "MQTT home-automation node").

**For Decksmith**: upgrade `PartDetail.tsx` to add:
- "Common mistakes" (static per part, e.g., Pi 5 needs active cooling; Zero 2 W is 5V not 3.3V; 7" IPS needs PWM brightness).
- "Popular projects" — deck ideas that use this part, linking back into chat templates.
- "Circuit requirements" / wiring notes.
- Datasheet links (Adafruit Learn guides).

---

## 5. Connected Device Model (the "everything stays in sync" concept)

> "Hardware and firmware should not live in separate worlds."

One device model, many views: Architecture → Schematic → Firmware → Components → Assembly. Requirements, component research, schematic + pin notes, firmware + libraries, review + assembly all attached to the same editable model.

**Change propagation**: "Change the hardware. Keep the firmware aligned." Swap a sensor → see affected voltage requirements, connections, pins, dependencies, code, warnings together.

**Decision trace**: "You keep the control and the context." Inspect WHY a decision was made, what conflicts with it, alternatives available. Every design artifact stays editable.

**For Decksmith**: the cyberdeck equivalent:
- A build = one model with views: Parts list / Wiring diagram / Firmware / Cost estimate / Compatibility review.
- Adding a part recomputes: total cost, power draw, compatibility warnings (e.g., UPS HAT vs battery conflict, display needs HDMI + 5V, storage needs USB).
- "Why this part" reasoning surfaces in chat (the LLM already does this; we can structure it as a decision card).

---

## 6. Validation & Compatibility Checks (differentiator)

> "The system is checked — electrical conflicts and unexpected behavior surface while the complete project is still editable."

- Checks: component compatibility, voltage, interface, peripheral, pin-mapping, dependency, compilation issues.
- Warnings are "inspectable results", NOT guarantees.

**For Decksmith**: implement a compatibility engine over our parts DB:
- SBC ↔ display: Pi 5 has 2× micro-HDMI, Zero 2 needs mini-HDMI adapter.
- Power: battery capacity vs deck power draw; UPS HAT only fits certain Pi models.
- Storage: NVMe HAT needs Pi 5; USB SSD works on any.
- Warn on conflicts (battery + UPS HAT double-power), show warnings on build page + in chat recommendations.

---

## 7. Simulate → Deploy (aspirational for us)

- **Simulate**: runs the actual firmware against the circuit in 3D, interactive inputs/outputs, live serial monitor. "Run the device before you build it."
- **Deploy**: compile for target board, flash over USB/Serial from the browser, serial monitor after upload.
- Loop: Simulate → Deploy → Observe → Refine.

**For Decksmith** (stretch goals):
- A **build estimator** is the "simulate" equivalent for cyberdecks: power draw, cost, weight, battery life calculator.
- Wiring/firmware generation for the chosen SBC (e.g., Pi 5: OS + config snippet, GPIO wiring notes for displays/inputs).
- Real deployment = link out to Adafruit cart / checkout with all selected parts (BOM export + buy links). This is very achievable with our existing scraped prices/buy URLs.

---

## 8. Component Variants / Configurable at Runtime

- Custom resistor/capacitor/battery values at runtime.
- NeoPixel strip "custom density and length at runtime".
- MG996R variants (straight/cross/star/round horn).
- LED matrix "custom module counts at runtime".

**For Decksmith**: allow customizing parts in a build — e.g., battery capacity (5Ah/10Ah), display size, storage size — and recompute price/weight/battery life.

---

## 9. Trust & Credibility Elements

- "Verified from the Tinkered component library" tag on spec tables.
- "1,300+ boards, ready when you are." board carousel with 3D models.
- FAQ sections at the bottom of every page (SEO + objection handling).
- Comparison pages: "Tinkered vs WithDiode", "Tinkered vs Tinkercad".
- Discord community CTA on every page.

**For Decksmith**: add "Verified price from Adafruit" badges, a `/parts` count stat on home, and a "vs" positioning if we want marketing pages later. FAQ section on Home.

---

## 10. Prompt Pre-fill & Deep Links

- Every CTA pre-fills the prompt via URL query: `?prompt=Build+an+ESP32+plant+monitor...&source=homepage_template&template=plant_monitor`.
- Board links are deep-linkable slugs.

**For Decksmith**: support `?prompt=...` on `/chat` so Home templates and part "Popular projects" deep-link straight into the chat with a pre-filled description. Track `source`/`template` params for analytics.

---

## Concrete Decksmith Roadmap (in priority order)

**Now / high-value (low effort):**
1. Home page: "Pick a build" template gallery → deep-links to `/chat?prompt=...` (copy #2, #10).
2. Parts page: category filter sidebar with counts ("9 supported" style) (copy #3).
3. Chat: structured "Recommended parts" cards already done — add "why this part" reason + buy link (already have reason).
4. Build estimator: total cost + power draw + battery life on a build (copy #5/#7).
5. Compatibility warnings engine on builds + recommendations (copy #6).
6. PartDetail: add "Common mistakes", "Popular projects", datasheet links, "Verified price from Adafruit" (copy #4/#9).

**Later / stretch:**
7. BOM export + Adafruit cart deep-link (copy #7 deploy-lite).
8. Per-build wiring/firmware snippets per SBC (copy #7).
9. Configurable parts in builds (capacity variants) recomputing price/power (copy #8).
10. FAQ + comparison pages for SEO (copy #9).