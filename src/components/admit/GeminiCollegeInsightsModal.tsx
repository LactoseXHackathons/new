import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  X,
  Send,
  Building2,
  MapPin,
  GraduationCap,
  Briefcase,
  Layers,
  HelpCircle,
  RotateCw,
  Copy,
  Check,
  AlertCircle,
  Compass,
} from "lucide-react";
import { askGeminiAboutCollege, type CollegeInsightParams } from "@/lib/gemini";
import type { PredictedOption } from "@/lib/cutoff-service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  option: PredictedOption | null;
  userPercentile: number;
}

const QUICK_PROMPTS = [
  {
    label: "💼 Placements & Packages",
    query:
      "What is the average package, highest package, and top tech recruiters for this college and branch?",
  },
  {
    label: "⚖️ Pros & Cons",
    query:
      "What are the honest pros and cons of this college, faculty quality, and campus infrastructure?",
  },
  {
    label: "🎯 CAP Option Form Tip",
    query:
      "How should I position this college choice in my CAP Round 2/3 option form based on my percentile?",
  },
  {
    label: "🏢 Hostel & Campus Life",
    query: "Tell me about hostel availability, campus life, clubs, and location advantages.",
  },
];

export function GeminiCollegeInsightsModal({ isOpen, onClose, option, userPercentile }: Props) {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const fetchInsights = async (customQ?: string) => {
    if (!option) return;
    setLoading(true);
    setError(null);

    try {
      const params: CollegeInsightParams = {
        collegeName: option.collegeName,
        collegeCode: option.collegeCode,
        branchName: option.courseName,
        city: option.city,
        status: option.collegeStatus,
        userPercentile,
        category: option.category,
        cutoffPercentile: option.cutoffPercentile,
        customQuestion: customQ,
      };

      const result = await askGeminiAboutCollege(params);
      setInsight(result);
    } catch (err: unknown) {
      console.error("Gemini Error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Failed to fetch insights from Google Gemini. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && option) {
      setInsight("");
      setCustomQuestion("");
      fetchInsights();
    }
  }, [isOpen, option?.collegeCode, option?.courseCode]);

  if (!isOpen || !option) return null;

  const handleCopy = () => {
    if (!insight) return;
    navigator.clipboard.writeText(insight);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/80 bg-muted/40 p-5 sm:p-6">
          <div className="flex items-start gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
              <Sparkles className="size-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  Code: {option.collegeCode}
                </span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {option.collegeStatus}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {option.city}
                </span>
              </div>
              <h2 className="mt-1 text-base font-bold sm:text-lg text-foreground leading-tight">
                {option.collegeName}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-xs font-medium text-primary">
                <GraduationCap className="size-3.5" />
                {option.courseName}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Cutoff Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-border/60 bg-muted/20 px-6 py-2.5 text-xs">
          <div>
            <span className="text-muted-foreground">Category:</span>{" "}
            <strong className="text-foreground">{option.category}</strong>
          </div>
          <div>
            <span className="text-muted-foreground">2025 Cutoff:</span>{" "}
            <strong className="text-foreground">{option.cutoffPercentile}%</strong>
          </div>
          <div>
            <span className="text-muted-foreground">Your Score:</span>{" "}
            <strong className="text-foreground">{userPercentile}%</strong>
          </div>
          <div>
            <span className="text-muted-foreground">Admission Chance:</span>{" "}
            <span className={`font-semibold ${option.chanceColor.split(" ")[0]}`}>
              {option.chanceLabel}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Quick Prompt Pills */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Compass className="size-3.5 text-primary" /> Explore details powered by Gemini AI:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  disabled={loading}
                  onClick={() => {
                    setCustomQuestion(qp.query);
                    fetchInsights(qp.query);
                  }}
                  className="rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-medium text-foreground/80 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-50"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Result Card */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 relative min-h-[160px]">
            <div className="flex items-center justify-between mb-3 border-b border-primary/10 pb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Sparkles className="size-4" /> Google Gemini Intelligence Briefing
              </div>
              <div className="flex items-center gap-1">
                {insight && !loading && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {copied ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
                <button
                  onClick={() => fetchInsights(customQuestion || undefined)}
                  disabled={loading}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50"
                >
                  <RotateCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
                <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-xs text-muted-foreground animate-pulse">
                  Consulting Google Gemini for placement records, cutoff insights & reviews…
                </p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Unable to load AI insights</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            ) : insight ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-3 whitespace-pre-line text-foreground/90 font-normal">
                {insight}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Click any topic above or ask a question below to analyze this college.
              </p>
            )}
          </div>
        </div>

        {/* Custom Question Footer */}
        <div className="border-t border-border/80 bg-card p-4 sm:p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customQuestion.trim() && !loading) {
                fetchInsights(customQuestion.trim());
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Ask Gemini anything about this college (e.g. attendance, internships, fees)..."
              disabled={loading}
              className="flex-1 rounded-xl border border-input bg-background px-4 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !customQuestion.trim()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-soft transition-transform active:scale-95 disabled:opacity-50"
            >
              <Send className="size-3.5" />
              Ask
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
