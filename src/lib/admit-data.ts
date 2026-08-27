export type Course = {
  id: string;
  name: string;
  short: string;
  department: string;
  duration: string;
  seats: number;
  cutoff: number;
  tuition: number;
  streams: string[];
};

export const COURSES: Course[] = [
  {
    id: "cse",
    name: "B.Tech Computer Science & Engineering",
    short: "CSE",
    department: "Engineering",
    duration: "4 years",
    seats: 120,
    cutoff: 75,
    tuition: 142000,
    streams: ["Science (PCM)"],
  },
  {
    id: "ece",
    name: "B.Tech Electronics & Communication",
    short: "ECE",
    department: "Engineering",
    duration: "4 years",
    seats: 90,
    cutoff: 70,
    tuition: 132000,
    streams: ["Science (PCM)"],
  },
  {
    id: "mech",
    name: "B.Tech Mechanical Engineering",
    short: "MECH",
    department: "Engineering",
    duration: "4 years",
    seats: 60,
    cutoff: 60,
    tuition: 124000,
    streams: ["Science (PCM)"],
  },
  {
    id: "bcom",
    name: "B.Com (Honours) Accounting & Finance",
    short: "B.Com",
    department: "Commerce",
    duration: "3 years",
    seats: 180,
    cutoff: 55,
    tuition: 62000,
    streams: ["Commerce", "Arts", "Science (PCM)", "Science (PCB)"],
  },
  {
    id: "bba",
    name: "BBA Business Administration",
    short: "BBA",
    department: "Management",
    duration: "3 years",
    seats: 120,
    cutoff: 50,
    tuition: 78000,
    streams: ["Commerce", "Arts", "Science (PCM)", "Science (PCB)"],
  },
  {
    id: "bsc-bio",
    name: "B.Sc Biotechnology",
    short: "B.Sc Biotech",
    department: "Sciences",
    duration: "3 years",
    seats: 60,
    cutoff: 60,
    tuition: 86000,
    streams: ["Science (PCB)", "Science (PCM)"],
  },
];

export const CATEGORY_RELAXATION: Record<string, number> = {
  General: 0,
  OBC: 5,
  "SC/ST": 10,
  EWS: 5,
};

export type FeeBreakdown = {
  tuition: number;
  hostel: number;
  exam: number;
  misc: number;
  scholarship: number;
  scholarshipNote: string;
};

export function estimateFees(
  courseId: string,
  hostel: boolean,
  percentage: number,
  category: string,
): FeeBreakdown {
  const course = COURSES.find((c) => c.id === courseId) ?? COURSES[0]!;
  const tuition = course.tuition;
  const scholarshipPct =
    percentage >= 90 ? 0.3 : percentage >= 80 ? 0.15 : category !== "General" ? 0.1 : 0;
  return {
    tuition,
    hostel: hostel ? 78000 : 0,
    exam: 6500,
    misc: 12500,
    scholarship: Math.round(tuition * scholarshipPct),
    scholarshipNote:
      scholarshipPct === 0
        ? "No merit scholarship at this score. Score 80%+ for a 15% merit waiver."
        : percentage >= 90
          ? "Merit Excellence Scholarship — 30% tuition waiver."
          : percentage >= 80
            ? "Merit Scholarship — 15% tuition waiver."
            : `${category} category scholarship — 10% tuition waiver.`,
  };
}

export const DOCUMENTS_BASE = [
  "10th Marksheet & Certificate",
  "12th Marksheet & Certificate",
  "Transfer / School Leaving Certificate",
  "Passport-size photographs (4)",
  "Aadhaar / Government ID proof",
];

export const DOCUMENTS_CATEGORY: Record<string, string[]> = {
  General: [],
  OBC: ["OBC Non-Creamy Layer Certificate (valid FY)"],
  "SC/ST": ["Caste Certificate", "Caste Validity Certificate"],
  EWS: ["EWS Income & Asset Certificate"],
};

export type TimelineEvent = {
  id: string;
  label: string;
  date: string; // ISO
  note: string;
};

export const TIMELINE: TimelineEvent[] = [
  {
    id: "open",
    label: "Applications Open",
    date: "2026-06-01",
    note: "Online portal opens for all programmes.",
  },
  {
    id: "close",
    label: "Last Date to Apply",
    date: "2026-09-30",
    note: "No late applications accepted.",
  },
  {
    id: "merit",
    label: "Merit List",
    date: "2026-10-12",
    note: "Provisional merit list published.",
  },
  {
    id: "counsel",
    label: "Counselling & Seat Allotment",
    date: "2026-10-25",
    note: "In person, main campus block A.",
  },
  {
    id: "start",
    label: "Session Begins",
    date: "2026-11-15",
    note: "Orientation week for all first-year students.",
  },
];

export const CONTACT = {
  phone: "+91 22 4567 8900",
  email: "admissions@admitai.edu.in",
  hours: "Mon–Sat, 9:30 AM – 5:00 PM IST",
};

export const APPLICATION_STAGES = [
  "Application Submitted",
  "Documents Verified",
  "Under Review",
  "Admitted",
];

export function inr(value: number) {
  return "₹" + value.toLocaleString("en-IN");
}

export function daysRemaining(iso: string, now = new Date()) {
  const target = new Date(iso + "T00:00:00Z").getTime();
  return Math.ceil((target - now.getTime()) / 86400000);
}
