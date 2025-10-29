import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import useAuthGuard from "../hooks/useAuthGuard";

const STORAGE_KEY = "future-creativity-settings";

const DEFAULT_SETTINGS = {
  companyName: "Future Creativity",
  contactEmail: "admin@futurecreativity.com",
  locale: "en",
  timezone: "Asia/Riyadh",
  theme: "royal",
  notifications: true,
};

export default function Settings() {
  const isReady = useAuthGuard();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!isReady || typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    let merged = DEFAULT_SETTINGS;
    try {
      merged = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (error) {
      // ignore corrupted settings
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      setSettings(merged);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isReady]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setFeedback("Settings saved locally.");
      setTimeout(() => setFeedback(""), 2500);
    }
  };

  if (!isReady) return null;

  return (
    <Layout>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-semibold text-matteGold">Settings</h1>
          <p className="mt-2 text-lightText/70">
            Update company profile, localization defaults, and notification
            preferences. These values are stored locally until a backend
            integration is available.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6 rounded-2xl border border-[#1F1F1F] bg-[#121212] p-6 shadow-lg md:grid-cols-2"
        >
          <div className="md:col-span-2">
            <label className="text-sm text-lightText/70">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={settings.companyName}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-lightText focus:border-royalGreen focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-lightText/70">Contact Email</label>
            <input
              type="email"
              name="contactEmail"
              value={settings.contactEmail}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-lightText focus:border-royalGreen focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-lightText/70">Default Language</label>
            <select
              name="locale"
              value={settings.locale}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-lightText focus:border-royalGreen focus:outline-none"
            >
              <option value="en">English</option>
              <option value="ar">Arabic</option>
              <option value="tr">Turkish</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-lightText/70">Timezone</label>
            <select
              name="timezone"
              value={settings.timezone}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-lightText focus:border-royalGreen focus:outline-none"
            >
              <option value="Asia/Riyadh">GMT+3 (Riyadh)</option>
              <option value="Asia/Dubai">GMT+4 (Dubai)</option>
              <option value="Europe/London">GMT (London)</option>
              <option value="America/New_York">GMT-5 (New York)</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-lightText/70">Theme Accent</label>
            <select
              name="theme"
              value={settings.theme}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-lightText focus:border-royalGreen focus:outline-none"
            >
              <option value="royal">Royal Green</option>
              <option value="desert">Desert Gold</option>
              <option value="midnight">Midnight Blue</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="notifications"
              name="notifications"
              checked={settings.notifications}
              onChange={handleChange}
              className="h-4 w-4 rounded border-[#2A2A2A] bg-[#1A1A1A] text-royalGreen focus:ring-royalGreen"
            />
            <label htmlFor="notifications" className="text-sm text-lightText/80">
              Enable platform notifications
            </label>
          </div>

          {feedback && (
            <p className="md:col-span-2 text-sm text-royalGreen">{feedback}</p>
          )}

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-royalGreen px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0D745D]"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
