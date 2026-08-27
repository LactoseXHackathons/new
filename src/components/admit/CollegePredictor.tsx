import { useState, useMemo } from "react";
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  GraduationCap,
  MapPin,
  Building2,
  Filter,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import {
  predictColleges,
  POPULAR_CITIES,
  CATEGORIES,
  BRANCH_GROUPS,
  CUTOFF_SUMMARY,
  type PredictedOption,
  type PredictorFilter,
  type AdmissionChance,
} from "@/lib/cutoff-service";
import { GeminiCollegeInsightsModal } from "./GeminiCollegeInsightsModal";

interface Props {
  initialPercentile?: number;
  initialCity?: string;
  initialCategory?: string;
  onAskInChat?: (question: string) => void;
}

export function CollegePredictor({
  initialPercentile = 88.5,
  initialCity = "All Cities",
  initialCategory = "OPEN",
  onAskInChat,
}: Props) {
  const [percentile, setPercentile] = useState<number>(initialPercentile);
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [selectedCategory, setSelectedCategory] = useState<PredictorFilter["category"]>(
    (initialCategory as PredictorFilter["category"]) || "OPEN",
  );
  const [branchGroup, setBranchGroup] = useState<string>("all");
  const [chanceFilter, setChanceFilter] = useState<AdmissionChance>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<PredictorFilter["sortBy"]>("chance");

  // Expanded raw cutoff details per card
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Gemini AI modal state
  const [selectedOptionForGemini, setSelectedOptionForGemini] = useState<PredictedOption | null>(
    null,
  );
  const [geminiModalOpen, setGeminiModalOpen] = useState<boolean>(false);

  // Pagination
  const [displayCount, setDisplayCount] = useState<number>(20);

  const filterParams: PredictorFilter = useMemo(
    () => ({
      percentile: Number(percentile) || 0,
      city: selectedCity,
      category: selectedCategory,
      branchGroup,
      searchQuery,
      chanceFilter,
      statusFilter,
      sortBy,
    }),
    [
      percentile,
      selectedCity,
      selectedCategory,
      branchGroup,
      searchQuery,
      chanceFilter,
      statusFilter,
      sortBy,
    ],
  );

  const results = useMemo(() => predictColleges(filterParams), [filterParams]);

  const displayedResults = useMemo(() => results.slice(0, displayCount), [results, displayCount]);

  const countsByChance = useMemo(() => {
    let safe = 0;
    let target = 0;
    let reach = 0;
    for (const r of results) {
      if (r.chance === "safe") safe++;
      else if (r.chance === "target") target++;
      else if (r.chance === "reach") reach++;
    }
    return { safe, target, reach, total: results.length };
  }, [results]);

  const handleOpenGemini = (option: PredictedOption) => {
    setSelectedOptionForGemini(option);
    setGeminiModalOpen(true);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/20 p-6 shadow-soft sm:p-8">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            Official 2025-26 CAP Round 1 Engineering Cutoff Data
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Maharashtra College Predictor & Genie
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Enter your MHT-CET / JEE percentile and category to see colleges available for you
            across Pune, Mumbai, Nagpur, Nashik, and all Maharashtra cities with official CAP-1
            cutoffs.
          </p>
        </div>

        {/* Global Summary Badges */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
          <span className="rounded-xl border border-border bg-card/60 px-3 py-1.5 backdrop-blur-sm">
            🏛️ <strong>{CUTOFF_SUMMARY.totalColleges}</strong> Colleges Indexed
          </span>
          <span className="rounded-xl border border-border bg-card/60 px-3 py-1.5 backdrop-blur-sm">
            🎓 <strong>{CUTOFF_SUMMARY.totalCourses}</strong> Branch Options
          </span>
          <span className="rounded-xl border border-border bg-card/60 px-3 py-1.5 backdrop-blur-sm">
            🤖 Google Gemini 3.6 Flash Enabled
          </span>
        </div>
      </div>

      {/* Control Panel: Filters */}
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-soft space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Percentile Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
              <span>Your Percentile (%):</span>
              <span className="text-sm font-bold text-primary">{percentile}%</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={percentile}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setPercentile(isNaN(val) ? 0 : Math.min(100, Math.max(0, val)));
                }}
                className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. 92.45"
              />
            </div>
            <input
              type="range"
              min="20"
              max="99.9"
              step="0.1"
              value={percentile}
              onChange={(e) => setPercentile(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer mt-1"
            />
          </div>

          {/* City Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <MapPin className="size-3.5 text-primary" /> City / District:
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full rounded-2xl border border-input bg-background px-3 py-2.5 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {POPULAR_CITIES.map((c) => {
                const count = (CUTOFF_SUMMARY.cities as Record<string, number>)[c];
                return (
                  <option key={c} value={c}>
                    {c} {count ? `(${count} colleges)` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Building2 className="size-3.5 text-primary" /> Admission Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as PredictorFilter["category"])}
              className="w-full rounded-2xl border border-input bg-background px-3 py-2.5 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Group Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <GraduationCap className="size-3.5 text-primary" /> Preferred Stream:
            </label>
            <select
              value={branchGroup}
              onChange={(e) => setBranchGroup(e.target.value)}
              className="w-full rounded-2xl border border-input bg-background px-3 py-2.5 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {BRANCH_GROUPS.map((bg) => (
                <option key={bg.key} value={bg.key}>
                  {bg.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick City Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-medium text-muted-foreground mr-1">Quick City:</span>
          {[
            "All Cities",
            "Pune",
            "Mumbai",
            "Nagpur",
            "Nashik",
            "Chhatrapati Sambhajinagar",
            "Navi Mumbai",
            "Amravati",
          ].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCity(c)}
              className={`rounded-xl px-3 py-1 text-xs font-medium transition-all ${
                selectedCity === c
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Secondary Filter Bar: Search, Chance Filter & Sort */}
        <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Live Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by college name, code (e.g. COEP, 06006), or branch..."
              className="w-full rounded-2xl border border-input bg-background pl-9 pr-4 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Chance Tabs & Sort */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Chance filter pills */}
            <div className="inline-flex rounded-2xl border border-border bg-muted/40 p-1 text-xs font-medium">
              <button
                onClick={() => setChanceFilter("all")}
                className={`rounded-xl px-2.5 py-1 transition-all ${
                  chanceFilter === "all"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                All ({countsByChance.total})
              </button>
              <button
                onClick={() => setChanceFilter("safe")}
                className={`rounded-xl px-2.5 py-1 transition-all ${
                  chanceFilter === "safe"
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                Safe ({countsByChance.safe})
              </button>
              <button
                onClick={() => setChanceFilter("target")}
                className={`rounded-xl px-2.5 py-1 transition-all ${
                  chanceFilter === "target"
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                Target ({countsByChance.target})
              </button>
              <button
                onClick={() => setChanceFilter("reach")}
                className={`rounded-xl px-2.5 py-1 transition-all ${
                  chanceFilter === "reach"
                    ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                Reach ({countsByChance.reach})
              </button>
            </div>

            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as PredictorFilter["sortBy"])}
              className="rounded-2xl border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
            >
              <option value="chance">Sort: Admission Chance</option>
              <option value="cutoff_desc">Cutoff: High to Low</option>
              <option value="cutoff_asc">Cutoff: Low to High</option>
              <option value="name">College Name</option>
              <option value="city">City Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
        <p>
          Found <strong className="text-foreground">{results.length}</strong> matching branch
          options for{" "}
          <strong className="text-primary">
            {percentile}% ({selectedCategory})
          </strong>{" "}
          in <strong className="text-foreground">{selectedCity}</strong>
        </p>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" /> Safe (Cutoff &lt;{" "}
            {Math.round(percentile - 1)}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-500" /> Target (Near cutoff)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-rose-500" /> Dream (Reach)
          </span>
        </div>
      </div>

      {/* College Results Cards List */}
      {displayedResults.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-3">
          <AlertCircle className="size-8 mx-auto text-muted-foreground" />
          <h3 className="text-base font-semibold text-foreground">
            No colleges match your current filters
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Try adjusting your percentile, selecting "All Cities", or choosing a broader branch
            category.
          </p>
          <button
            onClick={() => {
              setSelectedCity("All Cities");
              setBranchGroup("all");
              setChanceFilter("all");
              setSearchQuery("");
            }}
            className="rounded-xl bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-3.5">
          {displayedResults.map((opt, idx) => {
            const cardId = `${opt.collegeCode}-${opt.courseCode}-${idx}`;
            const isExpanded = expandedCard === cardId;

            return (
              <div
                key={cardId}
                className="group relative rounded-3xl border border-border/90 bg-card p-4 sm:p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* College & Course Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-lg bg-primary/10 px-2 py-0.5 font-bold text-primary">
                        {opt.collegeCode}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground/80">
                        <MapPin className="size-3 text-primary" /> {opt.city}
                      </span>
                      <span className="rounded-lg bg-muted px-2 py-0.5 text-muted-foreground">
                        {opt.collegeStatus}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-card-foreground leading-snug sm:text-base">
                      {opt.collegeName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 font-medium text-foreground">
                        <GraduationCap className="size-3.5 text-primary" /> {opt.courseName}
                      </span>
                      <span>
                        • Choice Code: <code className="text-foreground">{opt.courseCode}</code>
                      </span>
                    </div>
                  </div>

                  {/* Cutoff & Chance Indicator */}
                  <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[11px] text-muted-foreground">2025 CAP-1 Cutoff:</span>
                      <span className="text-base font-extrabold text-foreground sm:text-lg">
                        {opt.cutoffPercentile}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-semibold ${opt.chanceColor}`}
                      >
                        {opt.chance === "safe" && <CheckCircle2 className="size-3" />}
                        {opt.chance === "target" && <TrendingUp className="size-3" />}
                        {opt.chance === "reach" && <AlertCircle className="size-3" />}
                        {opt.chanceLabel} (
                        {opt.diffPercentile >= 0 ? `+${opt.diffPercentile}` : opt.diffPercentile}%)
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => handleOpenGemini(opt)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-soft transition-transform active:scale-95 hover:opacity-95"
                      >
                        <Sparkles className="size-3.5" />
                        Ask Gemini AI
                      </button>

                      <button
                        onClick={() => setExpandedCard(isExpanded ? null : cardId)}
                        className="inline-flex items-center gap-1 rounded-xl border border-border bg-muted/50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        Cutoffs
                        {isExpanded ? (
                          <ChevronUp className="size-3.5" />
                        ) : (
                          <ChevronDown className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Raw Category Cutoff Details */}
                {isExpanded && (
                  <div className="mt-4 border-t border-border/60 pt-3 animate-in fade-in duration-150">
                    <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                      <Info className="size-3.5 text-primary" /> Detailed Category Cutoffs for CAP
                      Round 1 (2025):
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
                      {Object.entries(opt.allNormalized).map(([cat, val]) => (
                        <div
                          key={cat}
                          className="rounded-xl border border-border/80 bg-background/50 p-2 text-center"
                        >
                          <span className="text-[11px] font-medium text-muted-foreground block">
                            {cat}
                          </span>
                          <span className="text-xs font-bold text-foreground">
                            {val !== null && val !== undefined ? `${val}%` : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Load More Button */}
          {results.length > displayCount && (
            <div className="pt-2 text-center">
              <button
                onClick={() => setDisplayCount((prev) => prev + 25)}
                className="rounded-2xl border border-border bg-card px-6 py-2.5 text-xs sm:text-sm font-semibold text-foreground shadow-soft hover:bg-muted transition-colors"
              >
                Load More Colleges ({results.length - displayCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Gemini AI Intelligence Modal */}
      <GeminiCollegeInsightsModal
        isOpen={geminiModalOpen}
        onClose={() => setGeminiModalOpen(false)}
        option={selectedOptionForGemini}
        userPercentile={percentile}
      />
    </div>
  );
}
