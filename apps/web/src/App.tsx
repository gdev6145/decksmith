import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Builds from "./pages/Builds";
import BuildDetail from "./pages/BuildDetail";
import Parts from "./pages/Parts";
import PartDetail from "./pages/PartDetail";
import Settings from "./pages/Settings";
import Compare from "./pages/Compare";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import RaidCalcPage from "./pages/RaidCalcPage";
import BuildCreator from "./pages/BuildCreator";
import CadStudio from "./pages/CadStudio";
import OsFlasherStudio from "./pages/OsFlasherStudio";
import FieldDiagnosticsStudio from "./pages/FieldDiagnosticsStudio";
import KeyboardMatrixStudio from "./pages/KeyboardMatrixStudio";
import SolarEnergyStudio from "./pages/SolarEnergyStudio";
import RfLinkBudgetStudio from "./pages/RfLinkBudgetStudio";
import CoolingThermalsStudio from "./pages/CoolingThermalsStudio";
import PinoutStudio from "./pages/PinoutStudio";
import QrScannerStudio from "./pages/QrScannerStudio";
import StlViewerStudio from "./pages/StlViewerStudio";
import PowerDeliveryStudio from "./pages/PowerDeliveryStudio";
import WiringHarnessStudio from "./pages/WiringHarnessStudio";

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="chat" element={<Chat />} />
          <Route path="builds" element={<Builds />} />
          <Route path="builds/:slug" element={<BuildDetail />} />
          <Route path="builder" element={<BuildCreator />} />
          <Route path="create-build" element={<BuildCreator />} />
          <Route path="studio" element={<BuildCreator />} />
          <Route path="cad" element={<CadStudio />} />
          <Route path="cad-studio" element={<CadStudio />} />
          <Route path="templates" element={<CadStudio />} />
          <Route path="flasher" element={<OsFlasherStudio />} />
          <Route path="flash" element={<OsFlasherStudio />} />
          <Route path="provision" element={<OsFlasherStudio />} />
          <Route path="os-builder" element={<OsFlasherStudio />} />
          <Route path="companion" element={<FieldDiagnosticsStudio />} />
          <Route path="diagnostics" element={<FieldDiagnosticsStudio />} />
          <Route path="telemetry" element={<FieldDiagnosticsStudio />} />
          <Route path="keyboard" element={<KeyboardMatrixStudio />} />
          <Route path="keyboard-studio" element={<KeyboardMatrixStudio />} />
          <Route path="matrix" element={<KeyboardMatrixStudio />} />
          <Route path="solar" element={<SolarEnergyStudio />} />
          <Route path="energy" element={<SolarEnergyStudio />} />
          <Route path="solar-calc" element={<SolarEnergyStudio />} />
          <Route path="rf" element={<RfLinkBudgetStudio />} />
          <Route path="antenna" element={<RfLinkBudgetStudio />} />
          <Route path="link-budget" element={<RfLinkBudgetStudio />} />
          <Route path="cooling" element={<CoolingThermalsStudio />} />
          <Route path="thermals" element={<CoolingThermalsStudio />} />
          <Route path="thermal-calc" element={<CoolingThermalsStudio />} />
          <Route path="pinout" element={<PinoutStudio />} />
          <Route path="gpio" element={<PinoutStudio />} />
          <Route path="pins" element={<PinoutStudio />} />
          <Route path="scan" element={<QrScannerStudio />} />
          <Route path="scanner" element={<QrScannerStudio />} />
          <Route path="qr" element={<QrScannerStudio />} />
          <Route path="stl" element={<StlViewerStudio />} />
          <Route path="stl-viewer" element={<StlViewerStudio />} />
          <Route path="mesh" element={<StlViewerStudio />} />
          <Route path="3d-print" element={<StlViewerStudio />} />
          <Route path="power" element={<PowerDeliveryStudio />} />
          <Route path="power-studio" element={<PowerDeliveryStudio />} />
          <Route path="bms" element={<PowerDeliveryStudio />} />
          <Route path="pd" element={<PowerDeliveryStudio />} />
          <Route path="harness" element={<WiringHarnessStudio />} />
          <Route path="wiring" element={<WiringHarnessStudio />} />
          <Route path="loom" element={<WiringHarnessStudio />} />
          <Route path="cable" element={<WiringHarnessStudio />} />
          <Route path="parts" element={<Parts />} />
          <Route path="parts/:slug" element={<PartDetail />} />
          <Route path="settings" element={<Settings />} />
          <Route path="compare" element={<Compare />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="profile/:id" element={<Profile />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="calculator" element={<RaidCalcPage />} />
          <Route path="raid-calc" element={<RaidCalcPage />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
