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

// Rate card effective September 1, 2026. Grandfathered clients are NOT here -
// they are individual exceptions recorded in CLAUDE.md, not rate-card entries.
export const PRICING = {
  private: { label: "Private (1 hr)", rate: 150 },
  backToBack: { label: "Back-to-Back", rate: 240 },
  studentAthlete: { label: "Student Athlete", rate: 115 },
  senior30: { label: "Senior 30 min", rate: 80 },
  senior60: { label: "Senior 60 min", rate: 150 },
  group: { label: "Group Session", rate: 240 },
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
    upside: "Monthly resident meetings + mailbox flyers → 1:1 hydrotherapy/private conversions at the current private rate",
    description: "First institutional contract — aqua fitness + resident funnel",
  },
  wayEast: {
    // Corrected 2026-09-15. Every field here was pre-launch guesswork and all of
    // it was wrong: the contract is executed (7/6), the building opened in
    // September not July, and the rate is $75 PER DAY covering BOTH 30-minute
    // classes - not $130/hr. Billing customer is GingerCare, not "Wingate Way East".
    facility: "One Wingate East",
    billingCustomer: "GingerCare Living, Inc. d/b/a One Wingate East",
    contact: "Riley Dewey",
    status: "ACTIVE",
    opensDate: "2026-09-03",
    rate: 75,
    rateBasis: "per day - $75 covers Rise and Move AND Stability and Strength combined. NEVER bill $75 twice for one morning.",
    schedule: "5 days/week, two back-to-back 30-minute group classes each morning",
    guaranteedMonthly: 1575,
    description: "New retirement community — template for all future institutional contracts. 200+ residents = massive funnel from group to 1-on-1.",
  },
};

export const PHASES = [
  {
    phase: 1,
    year: "2026",
    label: "Foundation",
    annualTarget: 108000,
    monthlyTarget: 16000,
    weeklyTarget: 3810,
    sessionsPerWeek: 28,
    milestones: [
      "18-20 sessions/week",
      "18-22 recurring clients",
      "25+ Google reviews",
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
// IRS standard mileage SPLITS MID-YEAR in 2026: $0.725 Jan 1 - Jun 30,
// $0.76 Jul 1 - Dec 31. Never apply one rate to the whole year.
export const IRS_MILEAGE_RATE_H1 = 0.725;
export const IRS_MILEAGE_RATE_H2 = 0.76;
export function irsMileageRate(date = new Date()) {
  return new Date(date) >= new Date("2026-07-01T00:00:00") ? IRS_MILEAGE_RATE_H2 : IRS_MILEAGE_RATE_H1;
}
export const IRS_MILEAGE_RATE = 0.76; // current half-year; use irsMileageRate(d) for a dated trip

// Tax reserve rate
export const TAX_RESERVE_RATE = 0.30;

export const SYSTEM_PROMPT = `You are the AI business intelligence engine for Forged Home Fitness LLC, owned by Matthew Doherty (CFSC Level 2, Certified Senior Fitness Specialist, CTPS, BS Exercise Science, 10+ years experience), founded November 13, 2025, based in Groton MA. Premium in-home personal training across MetroWest and the Groton corridor.

PRICING (from Sept 1, 2026): Private 60 $150 | Back-to-Back $240 | Group $240 | Senior 60 $150 | Senior 30 $80 | Student Athlete $115 | Facility class $75/day | Evaluation $0.
Zoom mirrors in-person exactly. A small number of clients are GRANDFATHERED at older rates as individual exceptions - those are not rate-card entries, some are confidential, and CLAUDE.md is the only authority on them. Never quote a grandfathered rate. Pre-Sept-2026 pricing was Private $130 / B2B-Group $205 / Senior 60 $130 / Senior 30 $70 / Student Athlete $105 - historical only.

FACILITY CONTRACTS - two customers, two different billing conventions, never mix them:
WAY EAST = GingerCare Living, Inc. d/b/a One Wingate East. Opened September 2026. Bills PER DAY: $75 covers Rise and Move AND Stability and Strength combined (two 30-min classes, one morning, one $75). Never bill $75 twice for one morning. Largest invoice FHF issues.
NEEDHAM = Wingate Senior Living. Bills PER CLASS at $75 (aqua 45 min, chair 60 min - two classes in a day is $150).
Facility revenue is paid BY CHECK. It never touches Stripe or Acuity, so it is invisible to those feeds and must be added by hand.

TARGETS: Weekly $3,810 as actually booked from Sept 21, 2026 ($3,615 from Sept 9). Monthly ~$16,000 from September. Any figure of $2,077/wk or $9,000/mo is pre-September and historical.
TAX RESERVE: 30% of TOTAL net revenue - Stripe net after fees PLUS facility revenue at full value (no Stripe fee on a check). Never 30% of Stripe alone.
IRS MILEAGE: $0.76/mile Jul 1-Dec 31 2026; $0.725 Jan 1-Jun 30. Split any log at June 30. QBO's own mileage module is hardcoded to $0.725 - do not trust its deduction figure.
STRIPE FEES: 2.9% + $0.30 per charge.

ACCOUNTANT: Turner & Costa PC (no estimated payments in year 1; pay at year-end) | BANK: Rockland Trust | TOOLS: Stripe, Acuity, QuickBooks, Gmail, Resend
INSURANCE: Next Insurance CGL $2M/$4M - EXCLUDES employing other trainers, must be updated before any hire. Commercial auto is separate.
GOOGLE: 21 reviews, rated 5.0.

5-YEAR TARGETS:
Phase 1 (2026) $108K — Wingate launched, board built
Phase 2 (2027) $192K/$3,692wk — Instagram launch, online coaching, 2nd institutional contract
Phase 3 (2028) $288K/$5,538wk — first contractor trainer, 3+ institutional contracts
Phase 4 (2029) $500K/$9,615wk — team of trainers, regional brand
Phase 5 (2030) $1M/$19,230wk — biggest in-home training company in MA

THREE REVENUE STREAMS: (1) Private in-home training (2) Institutional contracts - the Wingate model (3) Online coaching

NEVER publish, in any client-facing, facility-facing or public material: "CSCS", "NSCA", or "Certified Strength and Conditioning Specialist". That credential lapsed and is not being renewed.

Be direct, data-driven, no filler. Always connect to the 5-year plan. Flag risks early. Keep responses concise and structured. If a number here conflicts with CLAUDE.md, CLAUDE.md wins.`;

export const DEFAULT_TASKS = [
  { id: 1, text: "Wire the Acuity scheduler into Google Business Profile as the Book button — GBP has produced 0 bookings in 6 months because no booking link exists", priority: "critical", category: "Growth", done: false },
  { id: 2, text: "Fix the buried senior page — /senior-in-home-personal-training ranks position 46-88 for its own core keywords", priority: "critical", category: "Marketing", done: false },
  { id: 3, text: "Resolve town-page keyword cannibalization — multiple FHF pages compete for identical queries, dragging average position to 22", priority: "high", category: "Marketing", done: false },
  { id: 4, text: "Restart mileage logging — no entry written since April 2, 2026 at $0.725/$0.76 per mile", priority: "high", category: "Finance", done: false },
  { id: 5, text: "Confirm the commercial auto declarations page shows the Altima removed and the Rogue added", priority: "high", category: "Operations", done: false },
  { id: 6, text: "Update the CGL policy to cover employed trainers before any hire — the current policy excludes them", priority: "medium", category: "Operations", done: false },
  { id: 7, text: "Build the referral program — $50 credit per new client referral", priority: "medium", category: "Growth", done: false },
  { id: 8, text: "Decide whether Instagram stays — it sent 0 website visits in the last 30 days", priority: "medium", category: "Marketing", done: false },
  { id: 9, text: "Research TrueCoach/TrainHeroic for online coaching (Phase 2 prep)", priority: "low", category: "Growth", done: false },
  { id: 10, text: "Schedule quarterly insurance review", priority: "low", category: "Operations", done: false },
];
