import { app, BrowserWindow, shell } from "electron";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_PORT = Number(process.env.DECKSMITH_PORT) || 3001;
const API_URL = `http://localhost:${API_PORT}`;

let apiProcess = null;
let mainWindow = null;

function resolveTsx() {
  const candidates = [
    path.resolve(__dirname, "../../api/node_modules/.bin/tsx"),
    path.resolve(__dirname, "../../../node_modules/.bin/tsx"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function resolveApiEntry() {
  const src = path.resolve(__dirname, "../../api/src/index.ts");
  if (fs.existsSync(src)) return src;
  return null;
}

async function waitForApi(timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${API_URL}/health`);
      if (res.ok) return true;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

async function startApi() {
  const tsx = resolveTsx();
  const entry = resolveApiEntry();
  if (!tsx || !entry) {
    console.error("Could not resolve API server binaries:", { tsx, entry });
    return false;
  }

  const env = {
    ...process.env,
    PORT: String(API_PORT),
  };

  apiProcess = spawn(tsx, [entry], {
    env,
    cwd: path.resolve(__dirname, "../.."),
    stdio: "inherit",
  });

  apiProcess.on("exit", (code) => {
    console.log(`Decksmith API exited with code ${code}`);
    if (code !== 0) app.exit(1);
  });

  const up = await waitForApi();
  if (!up) {
    console.error("Decksmith API did not start in time.");
    return false;
  }
  console.log(`Decksmith API ready at ${API_URL}`);
  return true;
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 940,
    minHeight: 640,
    backgroundColor: "#0a0a0f",
    title: "Decksmith",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  await mainWindow.loadURL(API_URL);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  // Check if API is already running (e.g. from dev server)
  let alreadyRunning = false;
  try {
    const res = await fetch(`${API_URL}/health`);
    if (res.ok) alreadyRunning = true;
  } catch {
    // not running
  }

  if (!alreadyRunning) {
    const ok = await startApi();
    if (!ok) {
      app.exit(1);
      return;
    }
  } else {
    console.log(`Decksmith API already running at ${API_URL}`);
  }

  await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) await createWindow();
  });
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", () => {
  if (apiProcess) {
    apiProcess.kill();
    apiProcess = null;
  }
});

// Also handle SIGINT/SIGTERM to clean up
process.on("SIGINT", () => {
  if (apiProcess) apiProcess.kill();
  process.exit(0);
});
process.on("SIGTERM", () => {
  if (apiProcess) apiProcess.kill();
  process.exit(0);
});