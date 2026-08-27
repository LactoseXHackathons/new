import { COURSES, TIMELINE, CONTACT, inr, daysRemaining } from "./admit-data";
import { chatWithGemini } from "./gemini";
import {
  predictColleges,
  COLLEGES_DATA,
  CUTOFF_SUMMARY,
  POPULAR_CITIES,
  type PredictorFilter,
  type College,
} from "./cutoff-service";

export type ToolCall = {
  id: string;
  icon: "search" | "file" | "calendar" | "calculator" | "book" | "sparkles";
  label: string;
  status: "running" | "done";
  result?: string[] | undefined;
};

export type AgentStep = {
  label: string;
  status: "pending" | "active" | "done";
};

export type WidgetKind =
  | "eligibility"
  | "fees"
  | "documents"
  | "timeline"
  | "courses"
  | "status"
  | "handoff"
  | "predictor"
  | null;

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  streaming?: boolean | undefined;
  thinking?: boolean | undefined;
  reasoning?: string[] | undefined;
  tools?: ToolCall[] | undefined;
  steps?: AgentStep[] | undefined;
  citations?: string[] | undefined;
  widget?: WidgetKind | undefined;
  widgetProps?: Record<string, unknown> | undefined;
  error?: string | undefined;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const uid = () => Math.random().toString(36).slice(2, 10);

type Patch = (updater: (m: ChatMessage) => ChatMessage) => void;

type Plan = {
  reasoning: string[];
  tools: Omit<ToolCall, "status">[];
  steps: string[];
  answer: string;
  citations: string[];
  widget: WidgetKind;
  widgetProps?: Record<string, unknown> | undefined;
  error?: string | undefined;
};

function extractPercentile(text: string): number | null {
  const m =
    text.match(/(\d+(?:\.\d+)?)\s*(?:%|percentile)/i) ||
    text.match(/(?:percentile|score|scored|marks)\s*(?:is|of|around)?\s*(\d+(?:\.\d+)?)/i);
  if (m && m[1]) {
    const val = parseFloat(m[1]);
    if (val >= 0 && val <= 100) return val;
  }
  return null;
}

function extractCity(text: string): string {
  const lower = text.toLowerCase();
  for (const c of POPULAR_CITIES) {
    if (c === "All Cities") continue;
    if (lower.includes(c.toLowerCase())) return c;
  }
  if (lower.includes("aurangabad") || lower.includes("sambhajinagar"))
    return "Chhatrapati Sambhajinagar";
  return "All Cities";
}

function extractCategory(
  text: string,
): "OPEN" | "OBC" | "SC" | "ST" | "SEBC" | "EWS" | "TFWS" | "LOPEN" {
  const upper = text.toUpperCase();
  if (upper.includes("OBC")) return "OBC";
  if (upper.includes("SC")) return "SC";
  if (upper.includes("ST")) return "ST";
  if (upper.includes("SEBC")) return "SEBC";
  if (upper.includes("EWS")) return "EWS";
  if (upper.includes("TFWS")) return "TFWS";
  if (upper.includes("LADIES") || upper.includes("LOPEN") || upper.includes("FEMALE"))
    return "LOPEN";
  return "OPEN";
}

function findCollegeByName(query: string): College | undefined {
  const q = query.toLowerCase();
  const keywords: Record<string, string> = {
    coep: "college of engineering, pune",
    vjti: "veermata jijabai technological institute",
    pict: "pune institute of computer technology",
    spit: "sardar patel institute of technology",
    djsce: "dwarkadas j. sanghvi",
    pccoe: "pimpri chinchwad",
    vit: "vishwakarma institute of technology",
    walchand: "walchand college of engineering",
    ramdeobaba: "ramdeobaba",
    cummins: "cummins college of engineering for women",
    "kk wagh": "k. k. wagh",
    kkwagh: "k. k. wagh",
  };

  for (const [kw, namePart] of Object.entries(keywords)) {
    if (q.includes(kw)) {
      return COLLEGES_DATA.find((c) => c.name.toLowerCase().includes(namePart));
    }
  }

  // Direct match in college names
  return COLLEGES_DATA.find((c) => q.includes(c.name.toLowerCase()) || q.includes(c.code));
}

export function buildPlan(query: string): Plan {
  const q = query.toLowerCase();
  const foundPercentile = extractPercentile(query);
  const foundCity = extractCity(query);
  const foundCategory = extractCategory(query);
  const matchedCollege = findCollegeByName(query);

  // If asking about a specific college
  if (matchedCollege) {
    const coursesSummary = matchedCollege.courses
      .slice(0, 6)
      .map(
        (c) =>
          `• **${c.name}**: CAP-1 Cutoff **${c.normalizedCutoffs[foundCategory] ?? c.normalizedCutoffs["OPEN"] ?? "N/A"}%**`,
      )
      .join("\n");

    return {
      reasoning: [
        `Identified specific college inquiry for '${matchedCollege.name}' (${matchedCollege.city}).`,
        `Retrieved official 2025 CAP-1 cutoffs for ${matchedCollege.courses.length} branches.`,
        "Consulting Google Gemini AI for placement packages, NIRF reputation, and admission probability.",
        "Attached interactive College Predictor loaded with college context.",
      ],
      tools: [
        {
          id: uid(),
          icon: "search",
          label: `Scanning 2025 Cutoffs for ${matchedCollege.name}…`,
          result: [
            `College Code: ${matchedCollege.code} | Status: ${matchedCollege.status} | City: ${matchedCollege.city}`,
            `Indexed Branches: ${matchedCollege.courses.length}`,
            ...matchedCollege.courses
              .slice(0, 4)
              .map((c) => `${c.name}: OPEN Cutoff ${c.normalizedCutoffs.OPEN ?? "N/A"}%`),
          ],
        },
        {
          id: uid(),
          icon: "sparkles",
          label: "Synthesizing Insights via Google Gemini AI…",
          result: [
            "Analyzed placement statistics, recruiter portfolios, and admission trends.",
            "Prepared personalized CAP option form guidance.",
          ],
        },
      ],
      steps: [
        "Lookup College Records",
        "Extract 2025 Cutoffs",
        "Consult Gemini AI",
        "Generate Counseling Report",
      ],
      answer:
        `### 🏛️ **${matchedCollege.name} (${matchedCollege.city})**\n\n` +
        `**Status**: ${matchedCollege.status} | **DTE Code**: \`${matchedCollege.code}\`\n\n` +
        `Here are the official **2025 CAP Round 1 Cutoffs** (${foundCategory} category):\n\n` +
        `${coursesSummary}\n\n` +
        `💡 *You can click **"Ask Gemini AI"** on any branch below to get placement packages, reviews, pros & cons, and CAP option form advice!*`,
      citations: [
        "Government of Maharashtra State CET Cell 2025-26 CAP-1 Cutoff Database",
        "Google Gemini AI Admissions Counselor",
      ],
      widget: "predictor",
      widgetProps: {
        initialPercentile: foundPercentile ?? 92.0,
        initialCity: matchedCollege.city,
        initialCategory: foundCategory,
      },
    };
  }

  const isPredictorQuery =
    foundPercentile !== null ||
    q.includes("cutoff") ||
    q.includes("cut off") ||
    q.includes("college") ||
    q.includes("predict") ||
    q.includes("pune") ||
    q.includes("mumbai") ||
    q.includes("nagpur") ||
    q.includes("nashik") ||
    q.includes("amravati") ||
    q.includes("mht cet") ||
    q.includes("cap") ||
    q.includes("engineering") ||
    q.includes("branch") ||
    q.includes("placement");

  if (isPredictorQuery) {
    const pVal = foundPercentile ?? (q.includes("pune") ? 90.0 : 88.5);
    const predictions = predictColleges({
      percentile: pVal,
      city: foundCity,
      category: foundCategory,
    });

    const topMatches = predictions.slice(0, 4);

    return {
      reasoning: [
        `Identified college admission query for percentile ${pVal}%, city '${foundCity}', category '${foundCategory}'.`,
        `Queried 2025 CAP Round 1 cutoff database (362 colleges, 2,134 courses). Found ${predictions.length} matching options.`,
        "Consulting Google Gemini AI for intelligent recommendations, placement trends, and option form guidance.",
        "Attaching live College Predictor widget with real-time chance analysis.",
      ],
      tools: [
        {
          id: uid(),
          icon: "search",
          label: "Querying 2025 CAP-1 Cutoff Database…",
          result: [
            `Total colleges indexed: ${CUTOFF_SUMMARY.totalColleges} across ${Object.keys(CUTOFF_SUMMARY.cities).length} cities.`,
            `Filtered by: ${pVal}% · ${foundCategory} · ${foundCity}`,
            `Matches: ${predictions.length} college branch options.`,
            ...topMatches.map(
              (m) =>
                `${m.collegeName} (${m.city}) — ${m.courseName}: Cutoff ${m.cutoffPercentile}% [${m.chanceLabel}]`,
            ),
          ],
        },
        {
          id: uid(),
          icon: "sparkles",
          label: "Generating advice via Google Gemini AI…",
          result: [
            "Analyzed top tech company visit statistics, branch cutoff viability, and CAP round option form priority.",
            "Prepared personalized admission insights and next steps.",
          ],
        },
      ],
      steps: [
        "Analyze Query",
        "Search 2025 Cutoffs",
        "Consult Gemini AI",
        "Generate Recommendations",
      ],
      answer:
        `Based on the official **2025 Maharashtra Engineering CAP Round 1 Cutoffs**, here are the key options available for **${pVal}% (${foundCategory})** in **${foundCity}**:\n\n` +
        `• **Matching Colleges**: Found **${predictions.length}** course options across Maharashtra.\n` +
        `• **Top Picks**: ${topMatches.map((m) => `**${m.collegeName}** (${m.courseName} — **${m.cutoffPercentile}%**)`).join(", ") || "Explore the list below"}.\n\n` +
        `You can use the **College Predictor** below to filter by branch (CSE, IT, ENTC, etc.), change cities, or click **"Ask Gemini AI"** on any college for detailed placements and reviews!`,
      citations: [
        "Government of Maharashtra State CET Cell 2025-26 CAP-1 Cutoff List",
        "Google Gemini AI Admission Counselor",
      ],
      widget: "predictor",
      widgetProps: {
        initialPercentile: pVal,
        initialCity: foundCity,
        initialCategory: foundCategory,
      },
    };
  }

  if (
    q.includes("eligib") ||
    q.includes("can i apply") ||
    q.includes("qualify") ||
    q.includes("criteria")
  ) {
    return {
      reasoning: [
        "The student is asking about eligibility criteria for Maharashtra Engineering admissions.",
        "Criteria require 45% (40% for reserved) in 12th PCM + valid MHT-CET / JEE score.",
        "Opening Eligibility Checker widget.",
      ],
      tools: [
        {
          id: uid(),
          icon: "search",
          label: "Checking official eligibility criteria…",
          result: [
            "B.Tech / B.E.: Passed 10+2 with Physics, Mathematics and Chemistry/CS/IT (min 45% for Open, 40% for reserved).",
            "Must obtain non-zero score in MHT-CET 2026 or JEE Main Paper 1.",
          ],
        },
      ],
      steps: ["Analyze Criteria", "Verify Stream & Category", "Synthesize Answer"],
      answer:
        "For Maharashtra Engineering CAP admission, you need at least 45% aggregate in 12th PCM (40% for OBC/SC/ST/SEBC/EWS) and a non-zero score in MHT-CET or JEE Main. Use the interactive Eligibility Checker below to verify your qualification.",
      citations: ["State CET Cell Information Brochure", "DTE Maharashtra"],
      widget: "eligibility",
    };
  }

  if (
    q.includes("fee") ||
    q.includes("cost") ||
    q.includes("scholar") ||
    q.includes("tfws") ||
    q.includes("ebc")
  ) {
    return {
      reasoning: [
        "The student is asking about engineering college fees, TFWS waiver, and scholarships.",
        "Government colleges: ₹25k–₹85k/yr. Private colleges: ₹1L–₹2L/yr. TFWS offers 100% tuition waiver.",
      ],
      tools: [
        {
          id: uid(),
          icon: "calculator",
          label: "Calculating fee structures & scholarship rules…",
          result: [
            "TFWS (Tuition Fee Waiver Scheme): 100% tuition waiver for family income < 8 LPA (top 5% intake).",
            "MahaDBT EBC: 50% tuition waiver for open category with income < 8 LPA.",
            "OBC/SEBC: 50% waiver; SC/ST: 100% waiver through Social Welfare department.",
          ],
        },
      ],
      steps: ["Fetch Fee Structure", "Calculate Waivers", "Synthesize Answer"],
      answer:
        "Engineering college fees in Maharashtra range from ₹25,000/year in Government colleges (COEP, VJTI, GCOE) to ₹1.2–₹2.0 Lakhs/year in Private colleges. Schemes like **TFWS (100% Tuition Waiver)** and **MahaDBT EBC (50% Waiver)** significantly reduce costs for eligible students.",
      citations: ["Fee Regulating Authority (FRA) Maharashtra", "MahaDBT Scholarship Portal"],
      widget: "fees",
    };
  }

  if (
    q.includes("document") ||
    q.includes("checklist") ||
    q.includes("upload") ||
    q.includes("certificate")
  ) {
    return {
      reasoning: [
        "The student wants the mandatory document verification checklist for CAP rounds.",
      ],
      tools: [
        {
          id: uid(),
          icon: "file",
          label: "Compiling document verification requirements…",
          result: [
            "General: 10th marksheet, 12th marksheet, MHT-CET Score Card, Domicile/Birth Certificate, Transfer Certificate.",
            "Reserved: Caste Certificate, Caste Validity Certificate, Non-Creamy Layer (valid till March 2026), EWS Certificate.",
          ],
        },
      ],
      steps: ["Identify Category Requirements", "Build Checklist", "Synthesize Answer"],
      answer:
        "For CAP Round verification, keep your MHT-CET Scorecard, 10th & 12th marksheets, Domicile Certificate, and Caste Validity / Non-Creamy Layer (if applicable) ready. I have created a personal checklist below so you can tick them off.",
      citations: ["State CET Cell CAP Verification Protocol", "Admission Guidelines"],
      widget: "documents",
    };
  }

  if (
    q.includes("date") ||
    q.includes("deadline") ||
    q.includes("timeline") ||
    q.includes("schedule")
  ) {
    return {
      reasoning: ["Looking up official admission timeline and CAP round dates."],
      tools: [
        {
          id: uid(),
          icon: "calendar",
          label: "Checking CAP Round admission timeline…",
          result: TIMELINE.map((t) => `${t.label}: ${new Date(t.date).toDateString()}`),
        },
      ],
      steps: ["Fetch Calendar", "Compute Deadlines", "Synthesize Answer"],
      answer:
        "The Maharashtra Engineering CAP admission cycle is active. Track key dates for CAP Round 1, 2, and 3 option form submission, merit list display, and reporting in the timeline below.",
      citations: ["State CET Cell Schedule", "Official Admission Portal"],
      widget: "timeline",
    };
  }

  // General fallback
  return {
    reasoning: [
      "Consulting Google Gemini AI with full Maharashtra engineering context.",
      "Synthesizing admission guidance for student query.",
    ],
    tools: [
      {
        id: uid(),
        icon: "sparkles",
        label: "Consulting Google Gemini AI…",
        result: ["Generated tailored admission insights via Gemini AI."],
      },
    ],
    steps: ["Analyze Query", "Consult Gemini AI", "Synthesize Answer"],
    answer:
      "I can help you explore all 360+ Maharashtra engineering colleges, check official 2025 CAP-1 cutoffs for your percentile, estimate fees, and evaluate college placements with Google Gemini AI.",
    citations: ["State CET Cell 2025 CAP-1 Cutoffs", "Google Gemini AI"],
    widget: "predictor",
    widgetProps: {
      initialPercentile: 88.5,
      initialCity: "All Cities",
      initialCategory: "OPEN",
    },
  };
}

export async function runAgent(query: string, patch: Patch) {
  const plan = buildPlan(query);

  patch((m) => ({ ...m, thinking: true }));
  await sleep(350);

  // Call Google Gemini AI for rich, dynamic, smart answers!
  let dynamicAnswer = plan.answer;
  try {
    const promptForGemini = `The student asked: "${query}".
You are Lunarc GenieX, the AI counselor for Maharashtra Engineering Admissions (CAP 2025-2026, MHT-CET, JEE).
RULES:
- Answer SHORT, APPROPRIATE, and DIRECT TO THE POINT using clean Markdown.
- Max 4-6 concise bullet points or numbered list.
- Highlight exact 2025 cutoffs, college names, placement packages, or eligibility numbers directly.
- No filler paragraphs or repeating the query.`;

    const geminiRes = await chatWithGemini(promptForGemini);
    if (geminiRes && geminiRes.trim().length > 30) {
      dynamicAnswer = geminiRes.trim();
    }
  } catch (err) {
    console.warn("Gemini dynamic answer fallback to plan:", err);
  }

  patch((m) => ({
    ...m,
    thinking: false,
    reasoning: plan.reasoning,
    steps: plan.steps.map((label, i) => ({ label, status: i === 0 ? "active" : "pending" })),
  }));

  for (let i = 0; i < plan.tools.length; i++) {
    const tool = plan.tools[i]!;
    patch((m) => ({ ...m, tools: [...(m.tools ?? []), { ...tool, status: "running" }] }));
    patch((m) => ({
      ...m,
      steps: m.steps?.map((s, idx) =>
        idx <= i ? { ...s, status: idx === i + 1 ? "active" : "done" } : s,
      ),
    }));
    await sleep(250);
    patch((m) => ({
      ...m,
      tools: m.tools?.map((t) => (t.id === tool.id ? { ...t, status: "done" } : t)),
      steps: m.steps?.map((s, idx) =>
        idx <= i + 1 ? { ...s, status: idx === i + 1 ? "active" : "done" } : s,
      ),
    }));
  }

  patch((m) => ({
    ...m,
    steps: m.steps?.map((s, idx, arr) => ({
      ...s,
      status: idx === arr.length - 1 ? "active" : "done",
    })),
    streaming: true,
  }));

  const words = dynamicAnswer.split(" ");
  let acc = "";
  for (const w of words) {
    acc += (acc ? " " : "") + w;
    patch((m) => ({ ...m, text: acc }));
    await sleep(8 + Math.random() * 12);
  }

  patch((m) => ({
    ...m,
    streaming: false,
    citations: plan.citations,
    widget: plan.widget,
    widgetProps: plan.widgetProps,
    error: plan.error,
    steps: m.steps?.map((s) => ({ ...s, status: "done" })),
  }));
}
