---
name: decksmith-desktop-electron-packaging
description: >-
  Develop, package, and optimize the Decksmith Electron desktop application (`apps/desktop`).
  Use when modifying main process scripts, IPC channels, native file dialogs, offline file saving, or Electron security settings.
---

# Decksmith Electron Desktop Application Guide

This skill provides patterns for maintaining and packaging the cross-platform Electron application in `apps/desktop/`.

---

## 1. Electron Main Process Architecture (`apps/desktop/src/main.js`)

```js
import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs";

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "Decksmith Operative Suite",
    backgroundColor: "#020617",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../web/dist/index.html"));
  }
}

app.whenReady().then(createWindow);
```

---

## 2. Secure IPC Main/Renderer Bridge

Use `contextBridge` in `preload.js` to safely expose native desktop functions:

```js
// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveStlFile: (filename, buffer) => ipcRenderer.invoke("save-stl", { filename, buffer }),
  openGerberFolder: () => ipcRenderer.invoke("open-gerber-folder"),
});
```

---

## 3. Desktop Build Commands

Packaging desktop binaries using Electron Builder:

```bash
# Build web assets first
pnpm --filter @decksmith/web build

# Package desktop binary
pnpm --filter @decksmith/desktop build
```
