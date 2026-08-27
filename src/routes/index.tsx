import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  FileText,
  IndianRupee,
  MessagesSquare,
  Moon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CollegePredictor } from "@/components/admit/CollegePredictor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lunarc GenieX — Maharashtra College Admission Genie & Predictor" },
      {
        name: "description",
        content:
          "Lunarc GenieX: Check engineering cutoffs for any percentile & city using official 2025 CAP-1 data and Google Gemini AI.",
      },
      { property: "og:title", content: "Lunarc GenieX — Maharashtra College Admission Genie" },
      {
        property: "og:description",
        content:
          "Your college admission genie. Predict colleges, check cutoffs, explore eligibility & scholarships.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  {
    icon: BadgeCheck,
    title: "2025 CAP-1 Cutoffs",
    sub: "Live cutoff database across 360+ colleges and 2,100+ branches.",
  },
  {
    icon: Sparkles,
    title: "Gemini AI Intelligence",
    sub: "Instant placement stats, reviews, and CAP form strategies.",
  },
  {
    icon: IndianRupee,
    title: "Fees & TFWS Waivers",
    sub: "Clear fee breakdown, MahaDBT EBC & scholarship rules.",
  },
  {
    icon: CalendarDays,
    title: "Deadlines Tracked",
    sub: "CAP Round registration, option form & allotment countdowns.",
  },
];

function Landing() {
  return (
    <div className="starfield relative min-h-dvh overflow-hidden bg-background text-foreground">
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center gap-3 px-6 py-6">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Lunarc GenieX Logo"
            className="size-11 rounded-full object-cover shadow-md border border-border"
          />
          <span className="font-display text-xl tracking-wide font-bold">Lunarc GenieX</span>
        </Link>
        <span className="ml-auto hidden items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur sm:inline-flex">
          <Moon className="size-3.5 text-primary" aria-hidden />
          Powered by LACTOSE
        </span>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20">
        <section className="grid items-center gap-12 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div className="rise-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-primary backdrop-blur">
              <Sparkles className="size-3.5" aria-hidden />
              Admissions 2026–27 · Agent online
            </span>

            <h1 className="font-display mt-6 text-5xl leading-[1.05] tracking-tight text-primary sm:text-6xl lg:text-7xl">
              LUNARC
              <br />
              GENIEX
            </h1>

            <p className="font-display mt-5 text-xl text-secondary-foreground sm:text-2xl">
              “Your Smart Guide to the Right College”
            </p>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              An agentic admission assistant that reasons out loud — it checks criteria, pulls the
              official fee structure and cites its sources, so every answer is one you can act on.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/chat"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[image:var(--gradient-brand)] px-8 py-3.5 font-display text-lg tracking-wide text-primary-foreground shadow-lift transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0"
              >
                GET STARTED
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-5 py-3.5 text-sm font-medium backdrop-blur transition-colors duration-200 hover:border-ring/40"
              >
                <MessagesSquare className="size-4 text-primary" aria-hidden />
                Ask a question
              </Link>
            </div>

            <p className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-success" aria-hidden />
              Answers cite the official brochure and admission office
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div
              className="pointer-events-none absolute -inset-8 rounded-full bg-[image:var(--gradient-halo)] blur-2xl"
              aria-hidden
            />
            <img
              src="/logo.png"
              alt="Lunarc GenieX — your college admission genie, just one chat away"
              className="relative w-full rounded-[2.5rem] border border-border bg-card object-cover shadow-2xl p-4 transition-transform duration-300 hover:scale-[1.02]"
              loading="eager"
            />
          </div>
        </section>

        {/* Interactive College Predictor Section */}
        <section id="predictor" className="my-16 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Maharashtra Engineering College Predictor
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Search official 2025 CAP-1 cutoffs across 360+ colleges and 2,100+ branches. Instant
              feasibility analysis powered by Google Gemini AI.
            </p>
          </div>
          <CollegePredictor initialPercentile={90.0} initialCity="Pune" initialCategory="OPEN" />
        </section>

        <section aria-label="What GenieX does" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, title, sub }) => (
            <article
              key={title}
              className="rounded-2xl border border-border bg-card/80 p-5 shadow-soft backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-ring/40 hover:shadow-lift"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-[image:var(--gradient-brand)] text-primary-foreground">
                <Icon className="size-4" aria-hidden />
              </span>
              <h2 className="mt-3.5 text-sm font-semibold">{title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{sub}</p>
            </article>
          ))}
        </section>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Your college admission genie — just one chat away.
        </p>
      </main>
    </div>
  );
}
