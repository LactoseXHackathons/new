import { Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  CalendarDays,
  FileText,
  IndianRupee,
  LayoutList,
  MessageSquare,
  PanelLeftClose,
  Plus,
  Settings,
  Sparkles,
} from "lucide-react";

export type Conversation = { id: string; title: string };

const SHORTCUTS = [
  {
    icon: Sparkles,
    label: "College Predictor",
    query: "Predict colleges for my percentile and city.",
  },
  {
    icon: LayoutList,
    label: "Explore Branches",
    query: "Show me top engineering branches and cutoffs.",
  },
  { icon: BadgeCheck, label: "Eligibility Checker", query: "Am I eligible to apply?" },
  { icon: IndianRupee, label: "Fees & Scholarships", query: "What are the fees and scholarships?" },
  { icon: FileText, label: "Documents Checklist", query: "What documents do I need to submit?" },
  {
    icon: CalendarDays,
    label: "Admission Timeline",
    query: "What are the important admission dates?",
  },
];

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onShortcut,
  onSettings,
  onClose,
}: {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onShortcut: (q: string) => void;
  onSettings: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-4 py-4">
        <Link
          to="/"
          aria-label="Lunarc GenieX home"
          className="flex min-w-0 flex-1 items-center gap-2.5"
        >
          <img
            src="/logo.png"
            alt="Lunarc GenieX"
            className="size-9 shrink-0 rounded-full object-cover border border-sidebar-border shadow-sm"
          />
          <span className="font-display min-w-0 flex-1 truncate text-base font-bold tracking-wide">
            Lunarc GenieX
          </span>
        </Link>

        <button
          onClick={onClose}
          aria-label="Collapse sidebar"
          className="rounded-lg p-1.5 transition-colors duration-150 hover:bg-sidebar-accent"
        >
          <PanelLeftClose className="size-4" aria-hidden />
        </button>
      </div>

      <div className="px-3">
        <button
          onClick={onNew}
          className="flex w-full items-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition-all duration-150 hover:opacity-90 active:scale-[0.99]"
        >
          <Plus className="size-4" aria-hidden />
          New chat
        </button>
      </div>

      <nav className="mt-5 px-3" aria-label="Quick access">
        <p className="px-2 pb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Quick access
        </p>
        <ul>
          {SHORTCUTS.map(({ icon: Icon, label, query }) => (
            <li key={label}>
              <button
                onClick={() => onShortcut(query)}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="truncate">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        <p className="px-2 pb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Recent
        </p>
        <ul>
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => onSelect(c.id)}
                aria-current={c.id === activeId}
                className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors duration-150 ${
                  c.id === activeId
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/60"
                }`}
              >
                <MessageSquare className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-left">{c.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={onSettings}
          className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors duration-150 hover:bg-sidebar-accent"
        >
          <Settings className="size-4 text-muted-foreground" aria-hidden />
          Settings
        </button>
      </div>
    </div>
  );
}
