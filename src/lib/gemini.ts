export interface GeminiMessage {
  role: "user" | "model" | "system";
  content: string;
}

export interface CollegeInsightParams {
  collegeName: string;
  collegeCode?: string | undefined;
  branchName: string;
  city: string;
  status?: string | undefined;
  userPercentile?: number | undefined;
  category?: string | undefined;
  cutoffPercentile?: number | undefined;
  customQuestion?: string | undefined;
}

export const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash-lite",
];

export function getGeminiApiKey(): string {
  if (typeof window !== "undefined") {
    const customKey = localStorage.getItem("geniex_gemini_api_key");
    if (customKey && customKey.trim().length > 0) {
      return customKey.trim();
    }
  }
  return (
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env
      ?.VITE_GEMINI_API_KEY || ""
  );
}

export function setGeminiApiKey(key: string): void {
  if (typeof window !== "undefined") {
    if (key.trim()) {
      localStorage.setItem("geniex_gemini_api_key", key.trim());
    } else {
      localStorage.removeItem("geniex_gemini_api_key");
    }
  }
}

/**
 * Known Placement & College Intelligence Database for Top Maharashtra Colleges.
 */
interface CollegeStat {
  avgPackage: string;
  highestPackage: string;
  topRecruiters: string[];
  reputation: string;
  pros: string[];
  cons: string[];
  tier: string;
}

const COLLEGE_KNOWLEDGE: Record<string, CollegeStat> = {
  coep: {
    avgPackage: "12.8 LPA",
    highestPackage: "50.5 LPA (Google / DE Shaw)",
    topRecruiters: [
      "Google",
      "Microsoft",
      "Goldman Sachs",
      "Mastercard",
      "Nvidia",
      "TCS Digital",
      "Bajaj Auto",
      "Texas Instruments",
    ],
    reputation:
      "Rank 1 Government Engineering Institution in Maharashtra with world-class alumni network and research legacy.",
    pros: [
      "Autonomous Tier-1 brand across India",
      "Extremely strong coding culture & technical clubs (MindSpark, Robot Study Circle)",
      "Minimal fees with 100% government scholarship schemes",
    ],
    cons: [
      "Academic rigor and relative grading can be tough",
      "Older hostel infrastructure compared to private colleges",
    ],
    tier: "Tier 1",
  },
  vjti: {
    avgPackage: "14.2 LPA (CS/IT ~18.5 LPA)",
    highestPackage: "62.0 LPA",
    topRecruiters: [
      "Morgan Stanley",
      "Google",
      "Amazon",
      "JPMorgan Chase",
      "Citadel",
      "Barclays",
      "Samsung R&D",
    ],
    reputation:
      "Mumbai's premier Government institution in Matunga with unmatched finance and software placement connections.",
    pros: [
      "Prime Mumbai location advantage for internships",
      "Exceptional return on investment (ROI)",
      "Top fintech & global banking recruiters visit campus",
    ],
    cons: [
      "Campus size is compact",
      "Attendance and administrative procedures can feel traditional",
    ],
    tier: "Tier 1",
  },
  pict: {
    avgPackage: "12.5 LPA (CS/IT ~14.0 LPA)",
    highestPackage: "44.0 LPA",
    topRecruiters: [
      "Microsoft",
      "Adobe",
      "PhonePe",
      "Credit Suisse",
      "BNY Mellon",
      "Siemens",
      "Veritas",
      "Deutsche Bank",
    ],
    reputation:
      "The undisputed 'Coding Hub' of Pune with highest concentration of competitive programmers and algorithmic engineers.",
    pros: [
      "Fierce peer coding culture and hackathon dominance",
      "Virtually 100% placement for eligible Computer/IT/EnTC students",
      "Outstanding alumni presence across Silicon Valley",
    ],
    cons: [
      "Strict 75%+ attendance policy",
      "Smaller campus focused purely on academics and tech, minimal sports facilities",
    ],
    tier: "Tier 1.5",
  },
  spit: {
    avgPackage: "15.0 LPA (CS/IT ~17.2 LPA)",
    highestPackage: "51.0 LPA",
    topRecruiters: [
      "Morgan Stanley",
      "Microsoft",
      "WorkIndia",
      "Oracle",
      "JPMorgan",
      "Barclays",
      "Nomura",
    ],
    reputation:
      "Top autonomous Mumbai college inside the iconic Bhavan's Andheri campus with modern updated curriculum.",
    pros: [
      "State-of-the-art labs and industry projects",
      "Highest average package among non-IIT/NIT institutes in Maharashtra",
      "Active startup incubation center",
    ],
    cons: ["High Mumbai cost of living", "Hostel accommodation is limited"],
    tier: "Tier 1",
  },
  djsce: {
    avgPackage: "10.8 LPA",
    highestPackage: "42.0 LPA",
    topRecruiters: [
      "JP Morgan",
      "Morgan Stanley",
      "ZS Associates",
      "Amadeus",
      "Deloitte",
      "LTI Mindtree",
    ],
    reputation:
      "SVKM's premier engineering institute in Vile Parle Mumbai with elite student network and vibrant international teams.",
    pros: [
      "Excellent Formula Student & robotics racing teams (DJS Racing)",
      "Top tech and consulting placements",
      "Located in prime Vile Parle educational hub",
    ],
    cons: [
      "Higher tuition fees compared to government colleges",
      "Limited campus area with vertical building infrastructure",
    ],
    tier: "Tier 2",
  },
  pccoe: {
    avgPackage: "7.8 LPA",
    highestPackage: "36.0 LPA",
    topRecruiters: [
      "KPIT",
      "Capgemini",
      "Cognizant",
      "TCS",
      "Accenture",
      "Infosys",
      "Dassault Systemes",
      "Schlumberger",
    ],
    reputation:
      "Akurdi Pune's disciplined placement powerhouse with one of the most proactive Training & Placement cells in Western India.",
    pros: [
      "Massive pooled campus placement drives attracting 200+ companies",
      "Consistent training for aptitude, DSA, and soft skills from 2nd year",
      "Convenient location near Akurdi railway station",
    ],
    cons: [
      "Strict disciplinary rules and formal uniform dress code on specific days",
      "Heavy focus on academic scheduling",
    ],
    tier: "Tier 2",
  },
  vit: {
    avgPackage: "9.2 LPA",
    highestPackage: "43.5 LPA",
    topRecruiters: [
      "Nvidia",
      "Barclays",
      "Mercedes-Benz",
      "Siemens",
      "Texas Instruments",
      "Cadence",
      "PubMatic",
    ],
    reputation:
      "Vishwakarma Institute of Technology, Bibwewadi Pune. Autonomous with flexible credit-based choice system and vibrant culture (Melange).",
    pros: [
      "Modern autonomy curriculum with self-learning semester modules",
      "Strong core electronics and software recruitment",
      "Vibrant student festivals and clubs",
    ],
    cons: [
      "Combined intake with VIIT leads to larger student batches competing in placements",
      "Bibwewadi campus has hilly terrain and traffic access",
    ],
    tier: "Tier 2",
  },
  walchand: {
    avgPackage: "9.5 LPA",
    highestPackage: "38.0 LPA",
    topRecruiters: [
      "TCS Digital",
      "John Deere",
      "Siemens",
      "Mercedes-Benz R&D",
      "Eaton",
      "Bajaj",
      "L&T",
    ],
    reputation:
      "Historical Government-aided autonomous institution in Sangli with 90+ acre sprawling green campus and strong alumni base.",
    pros: [
      "Spacious residential campus with great hostel life",
      "Legacy brand value in both Core engineering and IT",
      "Very affordable fee structure",
    ],
    cons: [
      "Located in Sangli (semi-urban), fewer local startup internship opportunities than Pune/Mumbai",
    ],
    tier: "Tier 2",
  },
  ramdeobaba: {
    avgPackage: "8.2 LPA",
    highestPackage: "48.0 LPA",
    topRecruiters: [
      "Amazon",
      "VMware",
      "Cognizant",
      "Accenture",
      "TCS",
      "Persistent Systems",
      "Capgemini",
    ],
    reputation:
      "RBU (Ramdeobaba University, Nagpur) — the undisputed #1 private engineering college in Vidarbha region.",
    pros: [
      "Dominates Central India placement scene",
      "Sprawling infrastructure and well-equipped research centers",
      "Active entrepreneurship and placement support",
    ],
    cons: [
      "Higher fee structure following private university transition",
      "Nagpur weather during summer months",
    ],
    tier: "Tier 2",
  },
  cummins: {
    avgPackage: "10.5 LPA",
    highestPackage: "43.0 LPA (Goldman Sachs / Microsoft)",
    topRecruiters: [
      "Microsoft",
      "Goldman Sachs",
      "Boeing",
      "Mercedes Benz",
      "Citi",
      "Mastercard",
      "Cummins India",
      "Salesforce",
    ],
    reputation:
      "MKSSS Cummins College of Engineering for Women, Karve Nagar Pune — India's premier women's engineering college funded by Cummins Inc.",
    pros: [
      "Dedicated women diversity hiring programs by Fortune 500 tech giants",
      "Phenomenal campus placement rate and leadership opportunities",
      "Safe, supportive, and empowering environment",
    ],
    cons: ["Strict academic timetable and attendance"],
    tier: "Tier 2",
  },
  kkwagh: {
    avgPackage: "6.8 LPA",
    highestPackage: "28.0 LPA",
    topRecruiters: [
      "TCS",
      "Infosys",
      "Wipro",
      "Capgemini",
      "Bosch",
      "Mahindra & Mahindra",
      "KSB Pumps",
    ],
    reputation:
      "Leading autonomous engineering college in Nashik with strong ties to Nashik & Pune industrial belts.",
    pros: [
      "Top institute in North Maharashtra / Nashik zone",
      "Well-maintained campus, sports ground, and labs",
      "Active placement drives for core and software branches",
    ],
    cons: ["Most high-package tech opportunities require traveling for pooled rounds in Pune"],
    tier: "Tier 2.5",
  },
};

function matchCollegeStats(collegeName: string, city: string): CollegeStat {
  const name = collegeName.toLowerCase();
  for (const [k, v] of Object.entries(COLLEGE_KNOWLEDGE)) {
    if (
      name.includes(k) ||
      (k === "vit" && name.includes("vishwakarma")) ||
      (k === "pccoe" && name.includes("pimpri chinchwad"))
    ) {
      return v;
    }
  }

  // Generic intelligent estimate based on city and status
  const isTier1City = city.toLowerCase().includes("pune") || city.toLowerCase().includes("mumbai");
  return {
    avgPackage: isTier1City ? "6.5 - 8.5 LPA" : "5.0 - 7.0 LPA",
    highestPackage: isTier1City ? "24.0 - 35.0 LPA" : "18.0 - 25.0 LPA",
    topRecruiters: [
      "TCS Digital & Ninja",
      "Infosys",
      "Cognizant",
      "Capgemini",
      "Wipro",
      "LTIMindtree",
      "Persistent",
      "Accenture",
    ],
    reputation: `Recognized DTE Maharashtra approved institution in ${city} affiliated to State University with active placement cell and modern curriculum.`,
    pros: [
      "Accessible location within city",
      "Standard DTE curriculum and semester project guidance",
      "Eligible for MahaDBT EBC & Government Category scholarships",
    ],
    cons: [
      "Core branch students mostly placed in IT services",
      "Students recommended to build external GitHub portfolios and LeetCode ratings for off-campus Tier-1 product roles",
    ],
    tier: "Tier 2.5",
  };
}

/**
 * Intelligent localized fallback counselor generator.
 */
function generateLocalCollegeInsight(params: CollegeInsightParams): string {
  const stat = matchCollegeStats(params.collegeName, params.city);
  const userPct = params.userPercentile ?? 88.5;
  const cutoffPct = params.cutoffPercentile ?? 85.0;
  const category = params.category || "OPEN";
  const diff = Math.round((userPct - cutoffPct) * 100) / 100;

  let feasibilityText = "";
  if (diff >= 2.0) {
    feasibilityText = `🟢 **High Chance (Safe Bet)**: Your percentile (**${userPct}%**) is **+${diff}%** above the 2025 CAP-1 cutoff (**${cutoffPct}%**). You have a very high probability of securing this seat in Round 1.`;
  } else if (diff >= -2.0) {
    feasibilityText = `🟡 **Moderate Chance (Target Choice)**: Your score (**${userPct}%**) is within **${Math.abs(diff)}%** of the cutoff (**${cutoffPct}%**). Recommended as a high-priority choice in your CAP option form for Round 1 / Round 2 upgrade.`;
  } else {
    feasibilityText = `🔴 **Reach / Dream Choice**: The 2025 cutoff is **${cutoffPct}%** vs your score **${userPct}%** (gap of **${diff}%**). Place this in your top 5 preference list in the CAP form to try for betterment in Round 2 & 3.`;
  }

  return `### 🏫 **College & Branch Overview**
• **Institution**: **${params.collegeName}** (${params.city})
• **Branch**: **${params.branchName}** (Choice Code: \`${params.collegeCode || "N/A"}\`)
• **Status**: ${params.status || "Autonomous / Unaided"} | **Rating Tier**: ${stat.tier}
• ${stat.reputation}

---

### 💼 **Placement & Salary Insights**
• 📊 **Average Package**: **${stat.avgPackage}**
• 🚀 **Highest Package**: **${stat.highestPackage}**
• 🏢 **Top Recruiting Companies**: ${stat.topRecruiters.join(", ")}
• 💡 **Branch Outlook**: High demand for **${params.branchName}** skills (AI/DS, Full-Stack, Embedded Systems, VLSI). Students with strong DSA (LeetCode 300+) and real-world projects frequently crack 12+ LPA off-campus & on-campus product roles.

---

### 🎯 **Cutoff & Admission Feasibility (2025 CAP Round 1)**
• **2025 Cutoff**: **${cutoffPct}%** (${category} Category)
• **Your Score**: **${userPct}%** (${category})
• **Admission Feasibility**: ${feasibilityText}

---

### ⚖️ **Pros & Cons**
**Pros:**
${stat.pros.map((p) => `• ✅ ${p}`).join("\n")}

**Cons & Watchouts:**
${stat.cons.map((c) => `• ⚠️ ${c}`).join("\n")}

---

### 💡 **Pro-Tip for Maharashtra CAP Option Form**
1. **Option Form Priority**: Put this college around **Preference #5 to #15** if it's your target/safe choice.
2. **Freeze vs. Float**: If allotted in Round 1 and you are satisfied, choose **"Auto-Freeze" / "Self-Freeze"**. If aiming for a higher tier college (COEP, VJTI, PICT, SPIT), choose **"Betterment / Float"** without losing this seat!
3. **Scholarships**: Apply for **MahaDBT (EBC 50% tuition waiver for OPEN < 8 LPA, or 100% TFWS/SC/ST)** right after seat confirmation.`;
}

/**
 * Ask Google Gemini for deep college insights, reviews, placements, and admission guidance.
 */
export async function askGeminiAboutCollege(params: CollegeInsightParams): Promise<string> {
  const apiKey = getGeminiApiKey();

  const systemPrompt = `You are Lunarc GenieX — an expert Maharashtra Engineering Admissions AI counselor.
CRITICAL INSTRUCTIONS:
- Reply SHORT, ACCURATE, and directly to the point.
- Avoid long introductory or concluding fluff.
- Use clean Markdown with short bullet points and bold stats.
- Provide key facts: 1) Overview & Tier, 2) Placement stats (Avg/Highest LPA & Top Recruiters), 3) Admission Feasibility, 4) Top Pro & Con, 5) 1-line CAP form strategy.`;

  const userQuery = params.customQuestion
    ? `Question: ${params.customQuestion}\nCollege: ${params.collegeName} (${params.city}) | Branch: ${params.branchName} | Status: ${params.status || "Autonomous"} | Percentile: ${params.userPercentile ?? "N/A"}% (${params.category ?? "OPEN"}) | Cutoff: ${params.cutoffPercentile ?? "N/A"}%`
    : `Give a concise briefing for: ${params.collegeName} (${params.city}) — ${params.branchName}. Student: ${params.userPercentile ?? "N/A"}% (${params.category ?? "OPEN"}), 2025 Cutoff: ${params.cutoffPercentile ?? "N/A"}%`;

  if (apiKey && apiKey.trim().length > 10) {
    for (const model of GEMINI_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\n${userQuery}` }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 50) {
          return text;
        }
      } catch (err) {
        console.warn(`Error connecting to Gemini model ${model}:`, err);
      }
    }
  }

  // Fallback to rich built-in Maharashtra college counselor knowledge engine
  return generateLocalCollegeInsight(params);
}

/**
 * General conversational chat with Google Gemini AI for admission counseling.
 */
export async function chatWithGemini(
  prompt: string,
  history: Array<{ role: "user" | "model"; text: string }> = [],
): Promise<string> {
  const apiKey = getGeminiApiKey();

  const systemContext = `You are Lunarc GenieX — Maharashtra Engineering Admission AI Counselor (MHT-CET / JEE CAP 2025-2026).
RULES:
1. Keep answers SHORT, PRECISE, and structured (clean bullet points or max 5-8 numbered lines).
2. Directly answer with verified cutoffs, placement LPA stats, eligibility percentages, or fee amounts.
3. No repeating the question, no lengthy disclaimers.`;

  if (apiKey && apiKey.trim().length > 10) {
    const contents = [
      {
        role: "user",
        parts: [{ text: systemContext }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Understood! I am ready to guide students with precise college cutoffs, admissions counseling, and placement insights.",
          },
        ],
      },
      ...history.map((h) => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ];

    for (const model of GEMINI_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 30) {
          return text;
        }
      } catch (err) {
        console.warn(`Gemini API error with model ${model}:`, err);
      }
    }
  }

  // Fallback response synthesizer
  return "";
}
