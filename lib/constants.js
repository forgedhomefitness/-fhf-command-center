// ============================================
// FORGED HOME FITNESS — Business Constants
// Embedded in every AI call for context
// ============================================

export const BUSINESS = {
  name: "Forged Home Fitness LLC",
  owner: "Matthew Doherty",
  credentials: "C.F.S.C., C.T.P.S., BS Exercise Science, 10+ years experience",
  launchDate: "2025-11-13",
  address: "10 Valliria Drive, Groton, MA 01450",
  serviceArea: ["Wellesley", "Weston", "Needham", "Natick", "Newton"],
  model: "Solo in-home personal training using client's existing equipment",
  insurance: "Next Insurance CGL Policy NXTWPDJJL7-00-GL — $2M/$4M limits",
  accountant: "Turner & Costa PC",
  bank: "Rockland Trust Business Checking",
  phone: "774-283-3831",
  website: "www.forgedhomefitness.com",
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
  needham: {
    facility: "Wingate Needham",
    contact: "Hannah Alstein, Lifestyle Director",
    status: "CONFIRMED",
    startDate: "2026-05-06",
    schedule: "Wednesdays 10am, 45-min aqua class",
    weeklyRate: 75,
    monthlyRate: 300,
    upside: "Monthly resident meetings + mailbox flyers → 1:1 hydrotherapy/private conversions at $130/hr",
    description: "First institutional contract — aqua fitness + resident funnel",
  },
  wayEast: {
    facility: "Wingate Way East",
    contact: "Megan Ferrara, General Manager",
    status: "VERBAL_ALIGNMENT",
    opensDate: "2026-07-01",
    rate: 130,
    schedule: "5 days/week, 1 hour/day group fitness classes",
    guaranteedMonthly: 2600,
    description: "New retirement community — template for all future institutional contracts. 200+ residents = massive funnel from group to 1-on-1.",
  },
};

export const PHASES = [
  {
    phase: 1,
    year: "2026",
    label: "Foundation",
    annualTarget: 108000,
    monthlyTarget: 9000,
    weeklyTarget: 2077,
    sessionsPerWeek: 18,
    milestones: [
      "18-20 sessions/week",
      "18-22 recurring clients",
      "10+ Google reviews",
      "300+ Instagram followers",
      "Wingate contracts launched",
    ],
  },
  {
    phase: 2,
    year: "2027",
    label: "Growth",
    annualTarget: 192000,
    monthlyTarget: 16000,
    weeklyTarget: 3692,
    sessionsPerWeek: 25,
    milestones: [
      "Instagram launch (May 2027)",
      "Online coaching launched",
      "Second institutional contract",
      "Part-time admin support",
    ],
  },
  {
    phase: 3,
    year: "2028",
    label: "Scale",
    annualTarget: 288000,
    monthlyTarget: 24000,
    weeklyTarget: 5538,
    sessionsPerWeek: 30,
    milestones: [
      "First contractor trainer hired",
      "3+ institutional contracts",
      "Brand partnerships",
    ],
  },
  {
    phase: 4,
    year: "2029",
    label: "Expand",
    annualTarget: 500000,
    monthlyTarget: 42000,
    weeklyTarget: 9615,
    sessionsPerWeek: 40,
    milestones: [
      "Multiple trainers on payroll",
      "5+ institutional contracts",
      "Regional brand presence",
    ],
  },
  {
    phase: 5,
    year: "2030",
    label: "Dominate",
    annualTarget: 1000000,
    monthlyTarget: 83333,
    weeklyTarget: 19230,
    sessionsPerWeek: 60,
    milestones: [
      "Biggest in-home training company in MA",
      "Team of 10+ trainers",
      "New England expansion",
      "Multimillionaire by 35",
    ],
  },
];

// Stripe fee calculation — single source of truth
export const STRIPE_FEE_RATE = 0.029; // 2.9%
export const STRIPE_FEE_PER_TXN = 0.30; // $0.30 per transaction

export function calculateStripeFees(grossRevenue, transactionCount) {
  return Math.round((grossRevenue * STRIPE_FEE_RATE + transactionCount * STRIPE_FEE_PER_TXN) * 100) / 100;
}

export function calculateNetRevenue(grossRevenue, transactionCount) {
  return Math.round((grossRevenue - calculateStripeFees(grossRevenue, transactionCount)) * 100) / 100;
}

// IRS mileage rate
export const IRS_MILEAGE_RATE = 0.725; // 2026

// Tax reserve rate
export const TAX_RESERVE_RATE = 0.30;

export const SYSTEM_PROMPT = `You are the AI business intelligence engine for Forged Home Fitness LLC, owned by Matthew Doherty (C.F.S.C., C.T.P.S., BS Exercise Science, 10+ years experience), founded November 13, 2025, based in Groton MA. Serves Wellesley, Weston, Needham, Natick, Newton.

PRICING: Private $130/hr | Back-to-Back $205 | Student Athlete $105 | Senior 30min $70 | Senior 60min $130 | Group $205

WINGATE NEEDHAM: CONFIRMED — Wednesdays 10am aqua class starting May 6, 2026. $75/class. Real upside: monthly resident meetings + flyers → 1:1 conversions at $130/hr.
WINGATE WAY EAST: Opens July 1, 2026. $130/hr, 5 days/wk group classes = ~$2,600/mo guaranteed. 200+ residents = massive funnel.

INSURANCE: Next Insurance CGL NXTWPDJJL7-00-GL. $2M/$4M limits. NOTE: excludes employing other trainers — must update before any hire.

ACCOUNTANT: Turner & Costa PC | BANK: Rockland Trust | TOOLS: Stripe, Acuity, QuickBooks, Gmail

5-YEAR TARGETS:
Phase 1 (2026) $108K/$2,077wk — 18-20 sessions/wk, Wingate launched
Phase 2 (2027) $192K/$3,692wk — Instagram launch, online coaching, 2nd institutional contract
Phase 3 (2028) $288K/$5,538wk — first contractor trainer, 3+ institutional contracts
Phase 4 (2029) $500K/$9,615wk — team of trainers, regional brand
Phase 5 (2030) $1M/$19,230wk — biggest in-home training company in MA, multimillionaire by 35

THREE REVENUE STREAMS: (1) Private in-home training (2) Institutional contracts - Wingate model (3) Online coaching

Be direct, data-driven, no filler. Always connect to 5-year plan. Flag risks early. Keep responses concise and structured.`;

export const DEFAULT_TASKS = [
  { id: 1, text: "Complete ALA Lifeguard certification for Wingate Needham aqua class", priority: "critical", category: "Revenue", done: false },
  { id: 2, text: "Close Wingate Way East formal contract with Megan Ferrara", priority: "critical", category: "Revenue", done: false },
  { id: 3, text: "Request Additional Insured endorsement from Next Insurance for Wingate", priority: "critical", category: "Operations", done: false },
  { id: 4, text: "Reach 10 Google Business reviews (currently 3)", priority: "high", category: "Marketing", done: false },
  { id: 5, text: "Fill 10am-1pm weekday slots after WaterStone ends April 30", priority: "critical", category: "Revenue", done: false },
  { id: 6, text: "Build referral program — $50 credit per new client referral", priority: "medium", category: "Growth", done: false },
  { id: 7, text: "Research TrueCoach/TrainHeroic for online coaching (Phase 2 prep)", priority: "low", category: "Growth", done: false },
  { id: 8, text: "Schedule quarterly insurance review", priority: "low", category: "Operations", done: false },
  { id: 9, text: "Log mileage daily — worth $12,700+/year in deductions", priority: "high", category: "Finance", done: false },
  { id: 10, text: "Prep Instagram content bank for May 2027 launch", priority: "low", category: "Marketing", done: false },
];
