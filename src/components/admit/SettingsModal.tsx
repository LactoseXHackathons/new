import { useState, useEffect } from "react";
import { Eye, EyeOff, X, Sparkles, Check } from "lucide-react";
import { getGeminiApiKey, setGeminiApiKey } from "@/lib/gemini";

const MODELS = [
  "Google Gemini 3.6 Flash (Active)",
  "Google Gemini 3.7 Flash",
  "Google Gemini Flash Latest",
];
const LANGUAGES = ["English", "मराठी", "हिन्दी"];

export function SettingsModal({
  open,
  onClose,
  dark,
  onToggleDark,
}: {
  open: boolean;
  onClose: () => void;
  dark: boolean;
  onToggleDark: () => void;
}) {
  const [key, setKey] = useState("");
  const [reveal, setReveal] = useState(false);
  const [model, setModel] = useState(MODELS[0]!);
  const [lang, setLang] = useState(LANGUAGES[0]!);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setKey(getGeminiApiKey());
      setSaved(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    setGeminiApiKey(key);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="rise-in w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-lift">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-base font-semibold">Settings & AI Configuration</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-lg p-1.5 transition-colors duration-150 hover:bg-surface"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold text-muted-foreground"
              htmlFor="api-key"
            >
              Google Gemini API Key
            </label>
            <div className="flex gap-2">
              <input
                id="api-key"
                type={reveal ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter Gemini API Key..."
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setReveal((r) => !r)}
                aria-label={reveal ? "Hide API key" : "Show API key"}
                className="rounded-xl border border-input px-3 transition-colors duration-150 hover:bg-surface"
              >
                {reveal ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Configured with your provided API key. You can update or replace it here anytime.
            </p>
          </div>

          <div>
            <label
              className="mb-1.5 block text-xs font-semibold text-muted-foreground"
              htmlFor="model"
            >
              Active AI Model
            </label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              {MODELS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="mb-1.5 block text-xs font-semibold text-muted-foreground"
              htmlFor="lang"
            >
              Language
            </label>
            <select
              id="lang"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5">
            <span className="text-sm">Dark theme</span>
            <button
              role="switch"
              aria-checked={dark}
              aria-label="Toggle dark theme"
              onClick={onToggleDark}
              className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${dark ? "bg-primary" : "bg-muted-foreground/40"}`}
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-card transition-all duration-200 ${dark ? "left-[1.375rem]" : "left-0.5"}`}
              />
            </button>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-input px-4 py-2 text-xs font-semibold hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:opacity-90 transition-all"
            >
              {saved ? <Check className="size-3.5" /> : null}
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
