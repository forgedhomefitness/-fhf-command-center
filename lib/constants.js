// ============================================
// FORGED HOME FITNESS — Business Constants
// Embedded in every AI call for context
// ============================================

export const BUSINESS = {
  name: "Forged Home Fitness LLC",
  owner: "Matthew Doherty",
  credentials: "C.S.C.S., C.F.C.S., BS Exercise Science, 10+ years experience",
  launchDate: "2026-03-01",
  address: "10 Valliria Drive, Groton, MA 01450",
  serviceArea: ["Wellesley", "Weston", "Needham", "Natick", "Newton"],
  model: "Solo in-home personal training using client's existing equipment",
  insurance: "Next Insurance CGL Policy NXTWPDJJL7-00-GL — $2M/$4M limits",
  accountant: "Turner & Costa PC",
  bank: "BlueVine Business Checking",
};

export const PRICING = {
  private: { label: "Private (1 hr)", rate: 130 },
  backToBack: { label: "Back-to-Back", rate: 205 },
  studentAthlete: { label: "Student Athlete", rate: 105 },
  senior30: { label: "Senior 30 min", rate: 70 },
  senior60: { label: "Senior 60 min", rate: 130 },
  group: { label: "Group Session", rate: 205 },
};

export const WINGATE = {
  facility: "Wingate Way East",
  opensDate: "2026-07-01",
  rate: 130,
  schedule: "5 days/week, 1 hour/day group fitness classes",
  guaranteedMonthly: 2600,
  description: "New retirement community — template for all future institutional contracts",
};

export const PHASES = [
  {
    phase: 1,
    year: "2026",
    label: "Build Foundation",
    annualTarget: 108000,
    monthlyTarget: 9000,
    milestones: [
      "18-20 sessions/week",
      "18-22 recurring clients",
      "10+ Google reviews",
      "300+ Instagram followers",
      "Wingate contract launched",
    ],
  },
  {
    phase: 2,
    year: "2027",
    label: "Diversify Revenue",
    annualTarget: 192000,
    monthlyTarget: 16000,
    milestones: [
      "Online coaching launched",
      "Second institutional contract",
      "Part-time admin support",
    ],
  },
  {
    phase: 3,
    year: "2028",
    label: "Scale with People",
    annualTarget: 288000,
    monthlyTarget: 24000,
    milestones: [
      "First contractor trainer hired",
      "3+ institutional contracts",
      "Brand partnerships",
    ],
  },
  {
    phase: 4,
    year: "2029-2031",
    label: "Brand Leadership",
    annualTarget: 500000,
    monthlyTarget: 42000,
    milestones: [
      "$500K-$1M+ revenue",
      "Team of trainers",
      "Regional brand presence",
    ],
  },
];

export const SYSTEM_PROMPT = `You are the AI business intelligence engine for Forged Home Fitness LLC, owned by Matthew Doherty (C.S.C.S., C.F.C.S., BS Exercise Science, 10+ years experience), launched March 1, 2026, based in Groton MA. Serves Wellesley, Weston, Needham, Natick, Newton.

PRICING: Private $130/hr | Back-to-Back $205 | Student Athlete $105 | Senior 30min $70 | Senior 60min $130 | Group $205

WINGATE: Wingate Way East opens July 2026. $130/hr, 5 days/wk group classes = ~$2,600/mo guaranteed. Private residents pay senior rates directly to Matt.

INSURANCE: Next Insurance CGL NXTWPDJJL7-00-GL. $2M/$4M limits. Fitness trainer liability included. NOTE: excludes employing other trainers — must update before any hire.

ACCOUNTANT: Turner & Costa PC | BANK: BlueVine | TOOLS: Stripe, Acuity, QuickBooks, Gmail

5-YEAR TARGETS: Phase 1 (2026) $108K — 18-20 sessions/wk, 18-22 clients, 10+ Google reviews, 300+ IG followers, Wingate launched | Phase 2 (2027) $192K — online coaching + second institutional contract | Phase 3 (2028) $288K — first contractor trainer | Phase 4-5 (2029-2031) $500K-$1M+ brand leadership

THREE REVENUE STREAMS: (1) Private in-home training (2) Institutional contracts - Wingate model (3) Online coaching via TrueCoach/TrainHeroic

Be direct, data-driven, no filler. Always connect to 5-year plan. Flag risks early. Keep responses concise and structured.`;

export const DEFAULT_TASKS = [
  { id: 1, text: "Finalize Wingate Way East contract terms", priority: "critical", category: "Revenue", done: false },
  { id: 2, text: "Request Additional Insured endorsement from Next Insurance for Wingate", priority: "critical", category: "Operations", done: false },
  { id: 3, text: "Set up QuickBooks chart of accounts with Turner & Costa", priority: "high", category: "Finance", done: false },
  { id: 4, text: "Reach 10 Google Business reviews", priority: "high", category: "Marketing", done: false },
  { id: 5, text: "Post 3x/week on Instagram — tips, client wins, behind-the-scenes", priority: "medium", category: "Marketing", done: false },
  { id: 6, text: "Build referral program — $50 credit per new client referral", priority: "medium", category: "Growth", done: false },
  { id: 7, text: "Research TrueCoach/TrainHeroic for online coaching (Phase 2 prep)", priority: "low", category: "Growth", done: false },
  { id: 8, text: "Schedule quarterly insurance review", priority: "low", category: "Operations", done: false },
];
