import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Check,
  CircleAlert,
  Clock,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import {
  APPLICATION_STAGES,
  CATEGORY_RELAXATION,
  CONTACT,
  COURSES,
  DOCUMENTS_BASE,
  DOCUMENTS_CATEGORY,
  TIMELINE,
  daysRemaining,
  estimateFees,
  inr,
} from "@/lib/admit-data";
import { CollegePredictor } from "./CollegePredictor";

export { CollegePredictor };

const cardCls =
  "rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow duration-200 sm:p-5";
const labelCls = "mb-1.5 block text-xs font-medium text-muted-foreground";
const fieldCls =
  "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors duration-150 hover:border-ring/40 focus:border-ring";
const btnCls =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-50";

const CATEGORIES = Object.keys(CATEGORY_RELAXATION);
const STREAMS = ["Science (PCM)", "Science (PCB)", "Commerce", "Arts"];

export function CourseFinder({ onAsk }: { onAsk: (q: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {COURSES.map((c) => (
        <button
          key={c.id}
          onClick={() => onAsk(`Tell me about ${c.short} — eligibility, fees and seats.`)}
          className="group rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-ring/40 hover:shadow-lift"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <GraduationCap className="size-4 shrink-0" aria-hidden />
            {c.department}
          </div>
          <p className="mt-2 text-sm font-semibold leading-snug text-card-foreground">{c.name}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden /> {c.duration}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" aria-hidden /> {c.seats} seats
            </span>
            <span>Cutoff {c.cutoff}%</span>
          </div>
        </button>
      ))}
    </div>
  );
}

export function EligibilityChecker() {
  const [courseId, setCourseId] = useState(COURSES[0]!.id);
  const [percentage, setPercentage] = useState("");
  const [stream, setStream] = useState(STREAMS[0]!);
  const [category, setCategory] = useState("General");
  const [submitted, setSubmitted] = useState(false);

  const course = COURSES.find((c) => c.id === courseId)!;
  const pct = Number(percentage);
  const required = Math.max(0, course.cutoff - (CATEGORY_RELAXATION[category] ?? 0));
  const marksOk = pct >= required;
  const streamOk = course.streams.includes(stream);
  const eligible = marksOk && streamOk;

  return (
    <div className={cardCls}>
      <div className="flex items-center gap-2">
        <BadgeCheck className="size-4 text-primary" aria-hidden />
        <h3 className="text-sm font-semibold">Eligibility Checker</h3>
      </div>
      <form
        className="mt-4 grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="ec-course">
            Programme
          </label>
          <select
            id="ec-course"
            className={fieldCls}
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            {COURSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="ec-pct">
            12th percentage
          </label>
          <input
            id="ec-pct"
            className={fieldCls}
            inputMode="decimal"
            placeholder="e.g. 78"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="ec-stream">
            Stream
          </label>
          <select
            id="ec-stream"
            className={fieldCls}
            value={stream}
            onChange={(e) => setStream(e.target.value)}
          >
            {STREAMS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="ec-cat">
            Category
          </label>
          <select
            id="ec-cat"
            className={fieldCls}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <button type="submit" className={`${btnCls} sm:col-span-2`}>
          Check eligibility
        </button>
      </form>

      {submitted && !Number.isNaN(pct) && (
        <div
          className={`rise-in mt-4 rounded-xl border p-4 ${
            eligible ? "border-success/40 bg-success/10" : "border-destructive/40 bg-destructive/10"
          }`}
          role="status"
        >
          <p className="flex items-center gap-2 text-sm font-semibold">
            {eligible ? (
              <Check className="size-4 text-success" aria-hidden />
            ) : (
              <X className="size-4 text-destructive" aria-hidden />
            )}
            {eligible ? `Eligible for ${course.short}` : `Not eligible for ${course.short} yet`}
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-foreground/90">
            <li>
              {marksOk ? "✅" : "❌"} Requires {required}% ({category} relaxation applied) — you
              have {pct}%.
            </li>
            <li>
              {streamOk ? "✅" : "❌"} Accepted streams: {course.streams.join(", ")} — you selected{" "}
              {stream}.
            </li>
          </ul>
          {!eligible && (
            <p className="mt-2 text-xs text-muted-foreground">
              Tip: {course.short} isn't a match, but you may qualify for programmes with a lower
              cutoff such as BBA or B.Com.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function FeeEstimator() {
  const [courseId, setCourseId] = useState(COURSES[0]!.id);
  const [hostel, setHostel] = useState(true);
  const [percentage, setPercentage] = useState("85");
  const [category, setCategory] = useState("General");
  const [show, setShow] = useState(false);

  const fees = useMemo(
    () => estimateFees(courseId, hostel, Number(percentage) || 0, category),
    [courseId, hostel, percentage, category],
  );
  const total = fees.tuition + fees.hostel + fees.exam + fees.misc - fees.scholarship;

  return (
    <div className={cardCls}>
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" aria-hidden />
        <h3 className="text-sm font-semibold">Fee & Scholarship Estimator</h3>
      </div>
      <form
        className="mt-4 grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          setShow(true);
        }}
      >
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="fe-course">
            Programme
          </label>
          <select
            id="fe-course"
            className={fieldCls}
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            {COURSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="fe-pct">
            12th percentage
          </label>
          <input
            id="fe-pct"
            className={fieldCls}
            inputMode="decimal"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="fe-cat">
            Category
          </label>
          <select
            id="fe-cat"
            className={fieldCls}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            className="size-4 accent-[var(--color-primary)]"
            checked={hostel}
            onChange={(e) => setHostel(e.target.checked)}
          />
          Include hostel & mess
        </label>
        <button type="submit" className={`${btnCls} sm:col-span-2`}>
          Estimate my fees
        </button>
      </form>

      {show && (
        <div className="rise-in mt-4 rounded-xl border border-border bg-surface p-4">
          <dl className="space-y-2 text-sm">
            {[
              ["Tuition (per year)", fees.tuition],
              ["Hostel & mess", fees.hostel],
              ["Examination fee", fees.exam],
              ["Misc & one-time charges", fees.misc],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{label as string}</dt>
                <dd className="tabular-nums">{inr(value as number)}</dd>
              </div>
            ))}
            {fees.scholarship > 0 && (
              <div className="flex justify-between gap-4 text-success">
                <dt>Scholarship waiver</dt>
                <dd className="tabular-nums">− {inr(fees.scholarship)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4 border-t border-border pt-2 text-base font-semibold">
              <dt>Estimated first year</dt>
              <dd className="tabular-nums">{inr(total)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">{fees.scholarshipNote}</p>
        </div>
      )}
    </div>
  );
}

export function DocumentChecklist() {
  const [category, setCategory] = useState("General");
  const [ticked, setTicked] = useState<Record<string, boolean>>({});
  const items = [...DOCUMENTS_BASE, ...(DOCUMENTS_CATEGORY[category] ?? [])];
  const done = items.filter((i) => ticked[i]).length;

  return (
    <div className={cardCls}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Document Checklist</h3>
        <select
          className={`${fieldCls} w-auto py-1.5 text-xs`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Category"
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-200"
          style={{ width: `${(done / items.length) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {done} of {items.length} ready
      </p>
      <ul className="mt-3 space-y-1">
        {items.map((item) => (
          <li key={item}>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm transition-colors duration-150 hover:bg-surface">
              <input
                type="checkbox"
                className="size-4 accent-[var(--color-primary)]"
                checked={!!ticked[item]}
                onChange={(e) => setTicked((t) => ({ ...t, [item]: e.target.checked }))}
              />
              <span className={ticked[item] ? "text-muted-foreground line-through" : ""}>
                {item}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdmissionTimeline() {
  return (
    <div className={cardCls}>
      <div className="flex items-center gap-2">
        <CalendarDays className="size-4 text-primary" aria-hidden />
        <h3 className="text-sm font-semibold">Admission Timeline 2026</h3>
      </div>
      <ol className="mt-5 flex gap-4 overflow-x-auto pb-2">
        {TIMELINE.map((ev) => {
          const d = daysRemaining(ev.date);
          const past = d < 0;
          return (
            <li key={ev.id} className="min-w-[9.5rem] flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`size-2.5 shrink-0 rounded-full ${past ? "bg-muted-foreground/50" : "bg-primary"}`}
                  aria-hidden
                />
                <span className="h-px w-full bg-border" aria-hidden />
              </div>
              <p className="mt-2 text-xs font-semibold">{ev.label}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(ev.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p
                className={`mt-1 text-xs font-medium ${past ? "text-muted-foreground" : "text-primary"}`}
              >
                {past ? "Completed" : `${d} days left`}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{ev.note}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function StatusTracker() {
  const current = 2;
  return (
    <div className={cardCls}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Application ADM-2026-04817</h3>
        <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
          Under Review
        </span>
      </div>
      <ol className="mt-4 space-y-3">
        {APPLICATION_STAGES.map((stage, i) => (
          <li key={stage} className="flex items-center gap-3 text-sm">
            <span
              className={`grid size-6 shrink-0 place-items-center rounded-full border text-xs ${
                i < current
                  ? "border-success bg-success text-success-foreground"
                  : i === current
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
              }`}
            >
              {i < current ? <Check className="size-3.5" aria-hidden /> : i + 1}
            </span>
            <span className={i <= current ? "font-medium" : "text-muted-foreground"}>{stage}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function HandoffCard() {
  return (
    <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 shadow-soft sm:p-5">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <CircleAlert className="size-4 text-warning" aria-hidden />
        Not sure? Contact the Admission Office
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <Phone className="size-4 text-muted-foreground" aria-hidden />
          <a className="underline underline-offset-4" href={`tel:${CONTACT.phone}`}>
            {CONTACT.phone}
          </a>
        </li>
        <li className="flex items-center gap-2">
          <Mail className="size-4 text-muted-foreground" aria-hidden />
          <a className="underline underline-offset-4" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
        </li>
        <li className="flex items-center gap-2">
          <MapPin className="size-4 text-muted-foreground" aria-hidden />
          {CONTACT.hours}
        </li>
      </ul>
    </div>
  );
}
