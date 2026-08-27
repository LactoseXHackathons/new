import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  BadgeCheck,
  CalendarDays,
  FileText,
  GraduationCap,
  IndianRupee,
  LayoutList,
  Menu,
  Mic,
  Moon,
  Paperclip,
  Search,
  Sparkles,
  Sun,
  TrendingUp,
} from "lucide-react";
import { Sidebar, type Conversation } from "@/components/admit/Sidebar";
import { SettingsModal } from "@/components/admit/SettingsModal";
import {
  AgentAvatar,
  Citations,
  ReasoningPanel,
  Stepper,
  ThinkingShimmer,
  ToolCard,
} from "@/components/admit/ChatParts";
import {
  AdmissionTimeline,
  CourseFinder,
  DocumentChecklist,
  EligibilityChecker,
  FeeEstimator,
  HandoffCard,
  StatusTracker,
  CollegePredictor,
} from "@/components/admit/Widgets";
import { runAgent, uid, type ChatMessage } from "@/lib/mock-agent";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Lunarc GenieX — Maharashtra College Admission Genie & Predictor" },
      {
        name: "description",
        content:
          "Lunarc GenieX: Check engineering cutoffs for any percentile & city using official 2025 CAP-1 data and Google Gemini AI.",
      },
      { property: "og:title", content: "Lunarc GenieX — College Admission Genie" },
      {
        property: "og:description",
        content:
          "Search colleges by percentile across Pune, Mumbai, Nagpur with 2025 CAP-1 cutoffs and Gemini AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

const SUGGESTIONS = [
  {
    icon: Sparkles,
    title: "College Predictor",
    sub: "Based on your percentile & city",
    q: "Which colleges in Pune can I get with 90 percentile in OBC category?",
  },
  {
    icon: TrendingUp,
    title: "Cutoffs by City",
    sub: "Mumbai, Pune, Nagpur & more",
    q: "Show me top engineering colleges and 2025 CAP-1 cutoffs in Mumbai.",
  },
  {
    icon: IndianRupee,
    title: "Fees & TFWS Waivers",
    sub: "Tuition, EBC & scholarships",
    q: "What are engineering fees and TFWS 100% scholarship eligibility?",
  },
  {
    icon: FileText,
    title: "Documents Needed",
    sub: "CAP Round verification checklist",
    q: "What documents do I need for Maharashtra CAP Round admission?",
  },
];

const CHIPS = [
  "Colleges for 90% in Pune?",
  "Colleges for 85% in Mumbai?",
  "Cutoffs for COEP & VJTI?",
  "TFWS fee waiver rules?",
  "CAP Round documents checklist?",
];

function widgetFor(msg: ChatMessage, onAsk: (q: string) => void) {
  switch (msg.widget) {
    case "predictor":
      return (
        <CollegePredictor
          initialPercentile={msg.widgetProps?.initialPercentile ?? 88.5}
          initialCity={msg.widgetProps?.initialCity ?? "All Cities"}
          initialCategory={msg.widgetProps?.initialCategory ?? "OPEN"}
          onAskInChat={onAsk}
        />
      );
    case "courses":
      return <CourseFinder onAsk={onAsk} />;
    case "eligibility":
      return <EligibilityChecker />;
    case "fees":
      return <FeeEstimator />;
    case "documents":
      return <DocumentChecklist />;
    case "timeline":
      return <AdmissionTimeline />;
    case "status":
      return <StatusTracker />;
    case "handoff":
      return <HandoffCard />;
    default:
      return null;
  }
}

function ChatPage() {
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: "c1", title: "New chat" },
  ]);
  const [activeId, setActiveId] = useState("c1");
  const [threads, setThreads] = useState<Record<string, ChatMessage[]>>({ c1: [] });
  const [input, setInput] = useState("");
  const [heroSearch, setHeroSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const messages = threads[activeId] ?? [];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    // Focus search input on initial load
    taRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busy) return;
      setBusy(true);
      setInput("");
      setHeroSearch("");
      if (taRef.current) taRef.current.style.height = "auto";

      const convId = activeId;
      const assistantId = uid();
      setThreads((t) => ({
        ...t,
        [convId]: [
          ...(t[convId] ?? []),
          { id: uid(), role: "user", text },
          { id: assistantId, role: "assistant", text: "", thinking: true },
        ],
      }));
      setConversations((cs) =>
        cs.map((c) =>
          c.id === convId && c.title === "New chat"
            ? { ...c, title: text.length > 34 ? text.slice(0, 34) + "…" : text }
            : c,
        ),
      );

      await runAgent(text, (updater) =>
        setThreads((t) => ({
          ...t,
          [convId]: (t[convId] ?? []).map((m) => (m.id === assistantId ? updater(m) : m)),
        })),
      );
      setBusy(false);
    },
    [activeId, busy],
  );

  const newChat = () => {
    const id = uid();
    setConversations((c) => [{ id, title: "New chat" }, ...c]);
    setThreads((t) => ({ ...t, [id]: [] }));
    setActiveId(id);
    taRef.current?.focus();
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      {sidebarOpen && (
        <>
          <button
            className="fixed inset-0 z-30 bg-foreground/40 md:hidden"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-40 w-72 md:relative md:z-auto md:w-72 md:shrink-0">
            <Sidebar
              conversations={conversations}
              activeId={activeId}
              onSelect={(id) => {
                setActiveId(id);
                if (typeof window !== "undefined" && window.innerWidth < 768) setSidebarOpen(false);
              }}
              onNew={newChat}
              onShortcut={(q) => {
                if (typeof window !== "undefined" && window.innerWidth < 768) setSidebarOpen(false);
                void send(q);
              }}
              onSettings={() => setSettingsOpen(true)}
              onClose={() => setSidebarOpen(false)}
            />
          </aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="rounded-xl p-2 transition-colors duration-150 hover:bg-surface"
            >
              <Menu className="size-4" aria-hidden />
            </button>
          )}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <h1 className="truncate text-sm font-bold flex items-center gap-2">
              <span className="font-display text-base">Lunarc GenieX</span>
              <span className="text-muted-foreground font-normal text-xs">
                — Admission & Cutoff Search
              </span>
            </h1>
            <span className="hidden items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs text-primary font-medium sm:inline-flex">
              <Sparkles className="size-3" aria-hidden />
              Gemini 3.6 Flash Active
            </span>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle dark mode"
            className="rounded-xl p-2 transition-colors duration-150 hover:bg-surface text-muted-foreground hover:text-foreground"
          >
            {dark ? (
              <Sun className="size-4" aria-hidden />
            ) : (
              <Moon className="size-4" aria-hidden />
            )}
          </button>
        </header>

        {/* Chat / Search Stream Area */}
        <main ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4">
          <div className="mx-auto w-full max-w-[800px] py-8">
            {messages.length === 0 ? (
              <div className="rise-in pt-4 space-y-6">
                {/* Hero Avatar & Tagline */}
                <div className="text-center space-y-3">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lift">
                    <Sparkles className="size-8" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                    What can I help you find today?
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                    Ask anything about Maharashtra engineering colleges, 2025 CAP-1 cutoffs,
                    placements, or type your percentile to get instant answers powered by{" "}
                    <strong>Google Gemini AI</strong>.
                  </p>
                </div>

                {/* Primary Default Search Bar (Hero) */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (heroSearch.trim()) void send(heroSearch);
                  }}
                  className="group relative mx-auto max-w-2xl rounded-2xl border border-primary/40 bg-card p-2 shadow-lift transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                >
                  <div className="flex items-center gap-3 px-2">
                    <Search className="size-5 text-primary shrink-0" />
                    <input
                      type="text"
                      value={heroSearch}
                      onChange={(e) => setHeroSearch(e.target.value)}
                      placeholder="Search colleges (e.g. 'Colleges in Pune for 92% OBC', 'COEP cutoff', 'PICT placements')..."
                      className="w-full bg-transparent py-2.5 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    <button
                      type="submit"
                      disabled={!heroSearch.trim() || busy}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition-transform active:scale-95 disabled:opacity-50"
                    >
                      <Sparkles className="size-3.5" />
                      Search AI
                    </button>
                  </div>
                </form>

                {/* 4 Feature Suggestion Cards */}
                <div className="grid gap-3 sm:grid-cols-2 pt-2">
                  {SUGGESTIONS.map(({ icon: Icon, title, sub, q }) => (
                    <button
                      key={title}
                      onClick={() => void send(q)}
                      disabled={busy}
                      className="group rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lift"
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="size-4 text-primary" aria-hidden />
                        <Sparkles className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="mt-2.5 text-sm font-bold text-foreground">{title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
                    </button>
                  ))}
                </div>

                {/* Admission Timeline Card */}
                <div className="pt-2">
                  <AdmissionTimeline />
                </div>
              </div>
            ) : (
              <div className="space-y-7">
                {messages.map((m) =>
                  m.role === "user" ? (
                    <div key={m.id} className="flex justify-end">
                      <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft">
                        {m.text}
                      </p>
                    </div>
                  ) : (
                    <div key={m.id} className="flex gap-3.5">
                      <AgentAvatar />
                      <div className="min-w-0 flex-1 space-y-3.5">
                        {m.thinking && <ThinkingShimmer />}
                        {m.steps && m.steps.length > 0 && <Stepper steps={m.steps} />}
                        {m.tools?.map((t) => (
                          <ToolCard key={t.id} tool={t} />
                        ))}
                        {m.text && (
                          <div className="prose prose-sm dark:prose-invert max-w-none rounded-2xl border border-border/60 bg-card/60 p-4 shadow-soft text-sm sm:text-[15px] leading-relaxed whitespace-pre-line text-foreground/90 font-normal">
                            {m.text}
                            {m.streaming && <span className="caret-blink-dot text-primary">▍</span>}
                          </div>
                        )}
                        {!m.streaming && m.reasoning && <ReasoningPanel steps={m.reasoning} />}
                        {m.citations && <Citations items={m.citations} />}
                        {!m.streaming && widgetFor(m, (q) => void send(q))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </main>

        {/* Bottom Search Bar (Default Always Available) */}
        <div className="border-t border-border bg-background/95 px-4 pb-4 pt-3 backdrop-blur">
          <div className="mx-auto w-full max-w-[800px]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft transition-colors duration-150 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/40"
            >
              <button
                type="button"
                aria-label="Search guidance"
                className="rounded-full p-2 text-muted-foreground transition-colors duration-150 hover:bg-surface hover:text-foreground"
              >
                <Search className="size-4 text-primary" aria-hidden />
              </button>
              <textarea
                ref={taRef}
                rows={1}
                value={input}
                aria-label="Search or Ask Lunarc GenieX"
                placeholder="Search colleges by percentile, cutoffs, placements, or ask Gemini AI..."
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                className="max-h-40 min-w-0 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground font-medium"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!input.trim() || busy}
                className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white transition-all duration-150 hover:opacity-90 active:scale-95 disabled:opacity-40 shadow-soft"
              >
                <ArrowUp className="size-4" aria-hidden />
              </button>
            </form>

            {/* Quick Prompt Chips */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => void send(chip)}
                  disabled={busy}
                  className="rounded-full border border-border/80 bg-surface px-3 py-1 text-xs text-muted-foreground transition-colors duration-150 hover:border-primary/40 hover:text-foreground disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
              <span className="ml-auto hidden items-center gap-1 text-[11px] text-muted-foreground sm:inline-flex">
                <Sparkles className="size-3 text-primary" aria-hidden />
                Google Gemini AI Enabled
              </span>
            </div>
          </div>
        </div>
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        dark={dark}
        onToggleDark={() => setDark((d) => !d)}
      />
    </div>
  );
}
