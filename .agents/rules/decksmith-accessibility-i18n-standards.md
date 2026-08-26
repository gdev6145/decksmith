---
trigger: always_on
---

# Decksmith Accessibility & i18n Standards

These rules enforce WCAG 2.1 accessibility, keyboard navigation, and internationalization standards across Decksmith studios and community pages.

---

## 1. Keyboard Navigation & Focus Management

- **Interactive Canvas Controls**: Any studio using HTML5 Canvas or WebGL (e.g. `PcbViewerStudio`, `StlViewerStudio`, `LogicAnalyzerStudio`) must provide accessible keyboard shortcuts (e.g. `+`/`-` for zoom, arrow keys for pan, `Space` for reset).
- **Focus Rings**: Never remove focus rings without replacing them with a visible cyberpunk-styled focus ring (`focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950`).
- **Modal Dialogs**: Trap focus inside open modal dialogs and support `Escape` to close.

---

## 2. ARIA Labels for Hardware Calculators

- **Custom Sliders**: Wrap range inputs or custom sliders in `role="slider"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-label`.
- **Status Indicators**: Use `aria-live="polite"` on serial connection state indicators (Connected, Disconnected, Flashing...) so screen readers announce hardware status changes.

---

## 3. High Contrast & Color Independence

- **Status Colors**: Do not rely on color alone (e.g. Red/Green for I2C ACK/NACK or Battery OK/Low). Always pair status colors with text labels or distinct icons.
