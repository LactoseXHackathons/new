import { useState } from "react";
import {
  BookOpen,
  Calculator,
  CalendarDays,
  ChevronDown,
  FileText,
  GraduationCap,
  Loader2,
  Quote,
  Search,
  Sparkles,
} from "lucide-react";
import type { AgentStep, ToolCall } from "@/lib/mock-agent";

const ICONS = {
  search: Search,
  file: FileText,
  calendar: CalendarDays,
  calculator: Calculator,
  book: BookOpen,
  sparkles: Sparkles,
};

export function AgentAvatar() {
  return (
    <span
      className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft"
      aria-hidden
    >
      <GraduationCap className="size-4" />
    </span>
  );
}

export function ThinkingShimmer() {
  return (
    <p className="shimmer-text text-sm font-medium" role="status">
      Thinking through your question…
    </p>
  );
}

export function ReasoningPanel({ steps }: { steps: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-surface/60">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        Show reasoning steps
        <ChevronDown
          className={`size-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open && (
        <ol className="rise-in space-y-2 border-t border-border px-3 py-3 text-xs leading-relaxed text-muted-foreground">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-primary">{i + 1}.</span>
              {s}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function ToolCard({ tool }: { tool: ToolCall }) {
  const [open, setOpen] = useState(false);
  const Icon = ICONS[tool.icon];
  return (
    <div className="rise-in rounded-xl border border-border bg-card shadow-soft">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        disabled={tool.status === "running"}
        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors duration-150 hover:bg-surface disabled:hover:bg-transparent"
      >
        <Icon className="size-4 shrink-0 text-primary" aria-hidden />
        <span className="min-w-0 flex-1 truncate">{tool.label}</span>
        {tool.status === "running" ? (
          <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" aria-hidden />
        ) : (
          <ChevronDown
            className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        )}
      </button>
      {open && tool.result && (
        <ul className="space-y-1.5 border-t border-border px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
          {tool.result.map((r, i) => (
            <li key={i}>• {r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Stepper({ steps }: { steps: AgentStep[] }) {
  return (
    <ol className="rounded-xl border border-border bg-surface/60 px-3 py-3">
      {steps.map((s, i) => (
        <li key={s.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`grid size-4 place-items-center rounded-full border transition-colors duration-200 ${
                s.status === "done"
                  ? "border-primary bg-primary"
                  : s.status === "active"
                    ? "border-primary bg-primary/30"
                    : "border-border"
              }`}
              aria-hidden
            />
            {i < steps.length - 1 && <span className="my-0.5 w-px flex-1 bg-border" aria-hidden />}
          </div>
          <span
            className={`pb-3 text-xs ${s.status === "pending" ? "text-muted-foreground" : "font-medium text-foreground"}`}
          >
            {s.label}
            {s.status === "active" && (
              <span className="ml-1 text-muted-foreground">· in progress</span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function Citations({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((c) => (
        <span
          key={c}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground"
        >
          <Quote className="size-3" aria-hidden />
          Source: {c}
        </span>
      ))}
    </div>
  );
}
