import { Shield, Lock, Eye, HardDrive, Terminal, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono space-y-8">
      <div className="border-b border-gray-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-neon-green/10 text-neon-green border border-neon-green/30 mb-3">
          <Shield className="w-3.5 h-3.5" />
          Google Play Compliance & Security
        </div>
        <h1 className="text-3xl font-black text-white">Privacy Policy</h1>
        <p className="text-xs text-gray-400 mt-1">
          Effective Date: August 2026 · Decksmith Architecture & Field Engineering Suite
        </p>
      </div>

      <div className="space-y-6 text-xs text-gray-300 leading-relaxed">
        <section className="p-5 bg-gray-900/80 border border-gray-800 rounded-2xl space-y-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            1. Overview & Core Philosophy
          </h2>
          <p>
            Decksmith ("the Application") is an open-source hardware engineering, CAD design, and system diagnostics suite. We believe in strict data sovereignty: your designs, blueprints, hardware configurations, and sensor telemetry remain your property and are processed locally on your device whenever possible.
          </p>
        </section>

        <section className="p-5 bg-gray-900/80 border border-gray-800 rounded-2xl space-y-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-neon-green" />
            2. Information We Collect & How It Is Used
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-300">
            <li>
              <strong className="text-white">Account Information:</strong> If you register an operative profile, we store your chosen callsign, email address (optional for local accounts), role specialization, and hashed authentication credentials.
            </li>
            <li>
              <strong className="text-white">Hardware Telemetry & Sensor Data:</strong> The Field Diagnostics and Solar Studios utilize local Web APIs (such as Battery Status, DeviceOrientation gyroscope, and WebUSB/WebMIDI) strictly for real-time visualization on your screen. This sensor data is never transmitted to external analytics trackers.
            </li>
            <li>
              <strong className="text-white">Blueprints & Saved Configurations:</strong> Custom builds, CAD dimensions, and wishlist items are persisted to your browser's IndexedDB / localStorage and synced to your private account database if signed in.
            </li>
          </ul>
        </section>

        <section className="p-5 bg-gray-900/80 border border-gray-800 rounded-2xl space-y-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-amber-400" />
            3. Third-Party Services & Advertising
          </h2>
          <p>
            Decksmith contains <strong className="text-white">ZERO third-party advertising SDKs</strong>, zero cross-site behavioral tracking scripts, and does not sell or broker user data to data aggregators.
          </p>
        </section>

        <section className="p-5 bg-gray-900/80 border border-gray-800 rounded-2xl space-y-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            4. Data Retention & Account Deletion
          </h2>
          <p>
            You retain complete control over your data. You may clear all local cached blueprints, notification histories, and offline assets at any time through your Profile or browser settings. To delete your cloud account and all associated build dossiers, visit your Profile settings or contact support@decksmith.app.
          </p>
        </section>

        <section className="p-5 bg-gray-900/80 border border-gray-800 rounded-2xl space-y-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-neon-green" />
            5. Contact Information
          </h2>
          <p>
            For questions regarding this policy or hardware verification safety, reach out via GitHub at{" "}
            <a
              href="https://github.com/gdev6145/decksmith"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 underline hover:text-cyan-300"
            >
              github.com/gdev6145/decksmith
            </a>.
          </p>
        </section>
      </div>

      <div className="pt-4 border-t border-gray-800 flex justify-between items-center text-xs">
        <Link to="/" className="text-neon-green hover:underline">
          ← Return to Decksmith Command Hub
        </Link>
        <span className="text-gray-500">Google Play Certified PWA / Native Shell</span>
      </div>
    </div>
  );
}
