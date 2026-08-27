import rawCutoffData from "@/data/cutoffData.json";
import rawSummary from "@/data/cutoffSummary.json";

export interface CutoffScore {
  rank: number;
  percentile: number;
  section: string;
}

export interface Course {
  code: string;
  name: string;
  status?: string | undefined;
  normalizedCutoffs: {
    OPEN?: number | null | undefined;
    OBC?: number | null | undefined;
    SC?: number | null | undefined;
    ST?: number | null | undefined;
    SEBC?: number | null | undefined;
    EWS?: number | null | undefined;
    TFWS?: number | null | undefined;
    LOPEN?: number | null | undefined;
    [key: string]: number | null | undefined;
  };
  rawCutoffs: Record<string, CutoffScore>;
}

export interface College {
  code: string;
  name: string;
  city: string;
  region: string;
  status: string;
  homeUniversity?: string | undefined;
  courses: Course[];
}

export type AdmissionChance = "safe" | "target" | "reach" | "all";

export interface PredictorFilter {
  percentile: number;
  city?: string | undefined;
  category: "OPEN" | "OBC" | "SC" | "ST" | "SEBC" | "EWS" | "TFWS" | "LOPEN";
  branchGroup?: string | undefined;
  searchQuery?: string | undefined;
  chanceFilter?: AdmissionChance | undefined;
  statusFilter?: string | undefined;
  sortBy?: "cutoff_desc" | "cutoff_asc" | "chance" | "name" | "city" | undefined;
}

export interface PredictedOption {
  collegeCode: string;
  collegeName: string;
  city: string;
  region: string;
  collegeStatus: string;
  homeUniversity?: string | undefined;
  courseCode: string;
  courseName: string;
  cutoffPercentile: number;
  cutoffRank?: number | undefined;
  category: string;
  chance: "safe" | "target" | "reach";
  chanceLabel: string;
  chanceColor: string;
  diffPercentile: number;
  rawCutoffs: Record<string, CutoffScore>;
  allNormalized: Course["normalizedCutoffs"];
}

export const COLLEGES_DATA: College[] = rawCutoffData as College[];
export const CUTOFF_SUMMARY = rawSummary;

export const POPULAR_CITIES = [
  "All Cities",
  "Pune",
  "Mumbai",
  "Nagpur",
  "Nashik",
  "Chhatrapati Sambhajinagar",
  "Navi Mumbai",
  "Amravati",
  "Kolhapur",
  "Sangli",
  "Solapur",
  "Jalgaon",
  "Ahmednagar",
  "Nanded",
  "Satara",
  "Ratnagiri",
];

export const CATEGORIES = [
  { key: "OPEN", label: "General / OPEN (GOPENS)" },
  { key: "OBC", label: "OBC (GOBCS)" },
  { key: "SC", label: "SC (GSCS)" },
  { key: "ST", label: "ST (GSTS)" },
  { key: "SEBC", label: "SEBC (GSEBCS)" },
  { key: "EWS", label: "EWS (Economically Weaker)" },
  { key: "TFWS", label: "TFWS (Tuition Fee Waiver)" },
  { key: "LOPEN", label: "Ladies Open (LOPENS)" },
] as const;

export const BRANCH_GROUPS = [
  { key: "all", label: "All Branches" },
  {
    key: "cs_it",
    label: "CS, IT & AI/DS",
    keywords: [
      "computer",
      "information technology",
      "artificial intelligence",
      "data science",
      "cyber",
      "software",
    ],
  },
  {
    key: "entc",
    label: "Electronics & Telecomm",
    keywords: ["electronics", "telecommunication", "entc", "communication", "vlsi"],
  },
  {
    key: "mech",
    label: "Mechanical & Auto",
    keywords: ["mechanical", "automobile", "mechatronics", "production"],
  },
  { key: "civil", label: "Civil Engineering", keywords: ["civil", "structural", "infrastructure"] },
  {
    key: "electrical",
    label: "Electrical & Instrumentation",
    keywords: ["electrical", "instrumentation", "power"],
  },
  {
    key: "chemical",
    label: "Chemical & Tech",
    keywords: ["chemical", "petro", "biotechnology", "food", "polymer", "oil", "paint"],
  },
];

/**
 * Filter and compute predictions based on user criteria.
 */
export function predictColleges(filter: PredictorFilter): PredictedOption[] {
  const {
    percentile,
    city,
    category = "OPEN",
    branchGroup = "all",
    searchQuery = "",
    chanceFilter = "all",
    statusFilter = "all",
    sortBy = "chance",
  } = filter;

  const results: PredictedOption[] = [];
  const searchLower = searchQuery.toLowerCase().trim();

  // Find keywords for branch group
  const groupConfig = BRANCH_GROUPS.find((bg) => bg.key === branchGroup);
  const branchKeywords = groupConfig?.keywords;

  for (const college of COLLEGES_DATA) {
    // City filter
    if (city && city !== "All Cities" && college.city.toLowerCase() !== city.toLowerCase()) {
      continue;
    }

    // Status filter (e.g. Govt, Autonomous, Unaided)
    if (statusFilter && statusFilter !== "all") {
      const colStatusLower = college.status.toLowerCase();
      if (statusFilter === "gov" && !colStatusLower.includes("government")) continue;
      if (statusFilter === "auto" && !colStatusLower.includes("autonomous")) continue;
      if (
        statusFilter === "unaided" &&
        !colStatusLower.includes("un-aided") &&
        !colStatusLower.includes("unaided")
      )
        continue;
    }

    for (const course of college.courses) {
      // Branch keyword filter
      if (branchKeywords) {
        const cNameLower = course.name.toLowerCase();
        const matchesBranch = branchKeywords.some((kw) => cNameLower.includes(kw));
        if (!matchesBranch) continue;
      }

      // Search query filter (matches college name, code, course name, city)
      if (searchLower) {
        const matchesSearch =
          college.name.toLowerCase().includes(searchLower) ||
          college.code.includes(searchLower) ||
          college.city.toLowerCase().includes(searchLower) ||
          course.name.toLowerCase().includes(searchLower) ||
          course.code.includes(searchLower);
        if (!matchesSearch) continue;
      }

      // Get cutoff for selected category (fallback to OPEN if category not specifically allotted)
      let cutoff = course.normalizedCutoffs[category];
      if (cutoff === null || cutoff === undefined) {
        cutoff = course.normalizedCutoffs["OPEN"];
      }

      if (cutoff === null || cutoff === undefined) {
        continue;
      }

      const diff = percentile - cutoff;
      let chance: "safe" | "target" | "reach";
      let chanceLabel: string;
      let chanceColor: string;

      if (diff >= 1.0) {
        chance = "safe";
        chanceLabel = "High Chance (Safe)";
        chanceColor =
          "text-emerald-600 bg-emerald-500/10 border-emerald-500/30 dark:text-emerald-400";
      } else if (diff >= -3.0) {
        chance = "target";
        chanceLabel = "Moderate (Target)";
        chanceColor = "text-amber-600 bg-amber-500/10 border-amber-500/30 dark:text-amber-400";
      } else if (diff >= -8.0) {
        chance = "reach";
        chanceLabel = "Dream (Reach)";
        chanceColor = "text-rose-600 bg-rose-500/10 border-rose-500/30 dark:text-rose-400";
      } else {
        // Significantly below cutoff, only include if user searched explicitly
        if (!searchLower) continue;
        chance = "reach";
        chanceLabel = "High Reach (>8% below)";
        chanceColor = "text-rose-500 bg-rose-500/10 border-rose-500/20";
      }

      if (chanceFilter !== "all" && chance !== chanceFilter) {
        continue;
      }

      // Get rank from raw cutoffs if available
      let cutoffRank: number | undefined;
      for (const [k, v] of Object.entries(course.rawCutoffs)) {
        if (k.toUpperCase().includes(category)) {
          cutoffRank = v.rank;
          break;
        }
      }

      results.push({
        collegeCode: college.code,
        collegeName: college.name,
        city: college.city,
        region: college.region,
        collegeStatus: college.status,
        homeUniversity: college.homeUniversity,
        courseCode: course.code,
        courseName: course.name,
        cutoffPercentile: cutoff,
        cutoffRank,
        category,
        chance,
        chanceLabel,
        chanceColor,
        diffPercentile: Math.round(diff * 100) / 100,
        rawCutoffs: course.rawCutoffs,
        allNormalized: course.normalizedCutoffs,
      });
    }
  }

  // Sort results
  return results.sort((a, b) => {
    switch (sortBy) {
      case "cutoff_desc":
        return b.cutoffPercentile - a.cutoffPercentile;
      case "cutoff_asc":
        return a.cutoffPercentile - b.cutoffPercentile;
      case "name":
        return a.collegeName.localeCompare(b.collegeName);
      case "city":
        return a.city.localeCompare(b.city);
      case "chance":
      default: {
        const order = { safe: 1, target: 2, reach: 3 };
        if (order[a.chance] !== order[b.chance]) {
          return order[a.chance] - order[b.chance];
        }
        // In same chance tier, sort by closest to cutoff or highest cutoff
        return b.cutoffPercentile - a.cutoffPercentile;
      }
    }
  });
}

/**
 * Get top colleges in a city with their primary CSE/IT cutoffs.
 */
export function getTopCollegesInCity(city: string, limit = 10): College[] {
  const filtered = COLLEGES_DATA.filter(
    (c) => city === "All Cities" || c.city.toLowerCase() === city.toLowerCase(),
  );

  return filtered
    .sort((a, b) => {
      const aMax = Math.max(...a.courses.map((c) => c.normalizedCutoffs.OPEN ?? 0), 0);
      const bMax = Math.max(...b.courses.map((c) => c.normalizedCutoffs.OPEN ?? 0), 0);
      return bMax - aMax;
    })
    .slice(0, limit);
}
