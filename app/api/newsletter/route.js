import { NextResponse } from "next/server";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const FROM_EMAIL = "Forged Home Fitness <noreply@forgedhomefitness.com>";
const MATT_EMAIL = "forgedhomefitness@gmail.com";
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const CLIENT_EMAILS = [
  "mma@afergan.com",
  "jonblotner@gmail.com",
  "Belworthy@gmail.com",
  "Paul.Liberman@gmail.com",
  "Rachel.nager@gmail.com",
  "Alisha.nuger@gmail.com",
  "Jnuger@gmail.com",
  "Rsahamd@gmail.com",
  "atannenbaum@gmail.com",
  "suzannefuchs@gmail.com",
];

// ─── 8 PRE-BUILT NEWSLETTER WEEKS ───────────────────────────────────────────
const NEWSLETTERS = [
  {
    subject: "The $0.10/Day Supplement That Builds Muscle AND Brainpower After 40",
    title: "The $0.10/Day Supplement That Builds Muscle AND Brainpower After 40",
    intro: `<p style="margin: 0 0 20px 0;">You\'ve probably heard about creatine if you\'ve spent any time around gyms. But here\'s what most people don\'t know: it\'s not just for building muscle. Recent research shows creatine is one of the most studied and safest supplements out there \u2014 and it does something most people never expect.</p><p style="margin: 0 0 25px 0;">For anyone over 40, it\'s a game-changer. And it costs about a dime a day.</p>`,
    studies: [
      { heading: "Study 1: Creatine and Brain Power", source: "Oxford Academic/Nutrition Reviews", summary: "83% of studies showed positive relationships between creatine and cognition in older adults. Your brain needs energy just like your muscles do.", url: "https://academic.oup.com/nutritionreviews/advance-article/doi/10.1093/nutrit/nuaf135/8253584" },
      { heading: "Study 2: Muscle and Strength", source: "PMC", summary: "Combined with resistance training, creatine significantly improves strength, lean muscle mass, and bone area.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12272710/" },
      { heading: "Study 3: Strength Gains (Meta-Analysis)", source: "PMC", summary: "Increased lean tissue mass by 1.37 kg and improved upper/lower body strength across multiple studies.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12506341/" },
    ],
    mattsTake: "I recommend creatine monohydrate to almost every client over 40. 3-5 grams a day, every day. It\'s cheap, it\'s safe, and the research keeps stacking up. Mix it in your morning water and forget about it. That\'s it. No loading phase, no cycling \u2014 just consistent, simple supplementation that works.",
  },
  {
    subject: "Why Your Scale Is Lying to You (And What to Do About It)",
    title: "Why Your Scale Is Lying to You (And What to Do About It)",
    intro: `<p style="margin: 0 0 20px 0;">You step on the scale. It hasn\'t budged. So you think your training isn\'t working.</p><p style="margin: 0 0 25px 0;">Wrong. You could be gaining muscle, losing fat, and transforming your body \u2014 and the scale would tell you nothing. That\'s why I stopped caring about what the scale says years ago. There\'s a tool that actually shows what\'s happening.</p>`,
    studies: [
      { heading: "Study 1: DEXA Accuracy", source: "Accurate Imaging Diagnostics (2025)", summary: "DEXA produces nearly identical measurements to full-body CT scans. This is the gold standard for body composition.", url: "https://accurateimagingdiagnostics.com/what-a-2025-study-tells-us-about-the-accuracy-of-dexa-scans-for-measuring-fat-and-muscle/" },
      { heading: "Study 2: What DEXA Actually Tells You", source: "Revolution Health (2025)", summary: "DEXA measures fat distribution, lean muscle, visceral fat, and bone density with superior precision.", url: "https://revolutionhealth.org/blogs/news/dexa-for-body-composition-in-2025" },
      { heading: "Study 3: Bone Health Screening", source: "USPSTF", summary: "All women 65+ should be screened; postmenopausal women under 65 with risk factors should also get tested. DEXA is the standard.", url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/osteoporosis-screening" },
    ],
    mattsTake: "I tell every client \u2014 throw your scale away. Two people at the same weight can look completely different. A DEXA scan shows you what\'s actually happening: muscle, fat, bone density. It\'s the only number that matters. Ask your doctor about getting one.",
  },
  {
    subject: "The #1 Thing You Can Do to Live Longer (It\'s Not Cardio)",
    title: "The #1 Thing You Can Do to Live Longer (It\'s Not Cardio)",
    intro: `<p style="margin: 0 0 20px 0;">Everyone wants to live longer. We spend money on supplements, doctors\' visits, and fancy diets hoping for the magic bullet.</p><p style="margin: 0 0 25px 0;">But the research is loud and clear. If you want to actually live longer \u2014 not just look good, but actually add years to your life \u2014 there\'s one thing that works better than everything else. And it\'s weight training.</p>`,
    studies: [
      { heading: "Study 1: Weight Training and Mortality", source: "Oxford Academic (IJE)", summary: "Any weight training is associated with 6% lower all-cause mortality and 8% lower cardiovascular mortality.", url: "https://academic.oup.com/ije/article/53/3/dyae074/7687204" },
      { heading: "Study 2: Maximum Risk Reduction", source: "PubMed Meta-Analysis", summary: "Maximum risk reduction of 27% at around 60 minutes per week. Combined with aerobic exercise: 40% reduction in mortality risk.", url: "https://pubmed.ncbi.nlm.nih.gov/35599175/" },
      { heading: "Study 3: Resistance Training for Sarcopenia", source: "PMC", summary: "Individualized resistance training effectively improves muscle strength and function, directly translating to longer, more independent life.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12602684/" },
    ],
    mattsTake: "This is why I do what I do. The science is clear \u2014 lifting weights is the single most effective thing you can do to live longer and live better. And you don\'t need to be in the gym 2 hours a day. 60 minutes a week of real resistance training changes everything.",
  },
  {
    subject: "You\'re Probably Not Eating Enough Protein (Here\'s How Much You Actually Need)",
    title: "You\'re Probably Not Eating Enough Protein (Here\'s How Much You Actually Need)",
    intro: `<p style="margin: 0 0 20px 0;">You\'re training hard. You\'re showing up. But if the needle isn\'t moving on muscle, the problem is almost always the same: you\'re not eating enough protein.</p><p style="margin: 0 0 25px 0;">The old \u201c0.8 grams per kilogram\u201d recommendation? That\'s for sedentary people. If you\'re training and you\'re over 40, you need more. A lot more.</p>`,
    studies: [
      { heading: "Study 1: Sarcopenia Prevention", source: "Frontiers in Nutrition (2025)", summary: "1.2 g/kg body weight per day is significantly more effective than standard 0.8 g/kg for muscle preservation.", url: "https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2025.1547325/full" },
      { heading: "Study 2: Per-Meal Protein Timing", source: "MDPI Nutrition (2025)", summary: "25-30g per meal maximizes muscle protein synthesis, and 40g pre-sleep improves overnight synthesis.", url: "https://www.mdpi.com/2072-6643/17/15/2461" },
      { heading: "Study 3: Meal Distribution", source: "Science Direct Meta-Analysis", summary: "Even distribution of protein across meals produces 25% greater muscle protein synthesis versus skewed intake.", url: "https://www.sciencedirect.com/science/article/pii/S1568163724001430" },
    ],
    mattsTake: "Most of my clients are undereating protein when we start working together. If you weigh 170 lbs, you need at least 90-120 grams a day. Spread it out \u2014 30g at breakfast, lunch, dinner, and a shake or Greek yogurt before bed.",
  },
  {
    subject: "The Vitamin 42% of Americans Are Deficient In (And Why It Matters After 40)",
    title: "The Vitamin 42% of Americans Are Deficient In (And Why It Matters After 40)",
    intro: `<p style="margin: 0 0 20px 0;">Vitamin D is one of the most important things your body needs \u2014 and most people aren\'t getting enough of it. In New England especially, we just don\'t get enough sun to produce it naturally.</p><p style="margin: 0 0 25px 0;">If you\'re over 40, bone health matters. A lot. And vitamin D is the key to making sure your bones stay strong and your calcium actually gets absorbed.</p>`,
    studies: [
      { heading: "Study 1: Vitamin D and Calcium Absorption", source: "PMC Expert Consensus (2025)", summary: "Maintain serum vitamin D levels \u226530 ng/mL. Adequate vitamin D increases calcium absorption by 30-40%.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11836767/" },
      { heading: "Study 2: Daily Supplementation Works Better", source: "PMC Meta-Analysis", summary: "Daily calcium and vitamin D supplementation reduced fracture risk more effectively than intermittent dosing.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12506016/" },
      { heading: "Study 3: Vitamin K2 for Bone Strength", source: "Frontiers in Endocrinology (2025)", summary: "K2 improves bone turnover markers and enhanced lumbar spine bone mineral density.", url: "https://www.frontiersin.org/journals/endocrinology/articles/10.3389/fendo.2025.1703116/full" },
    ],
    mattsTake: "Get your vitamin D levels tested. Seriously. Almost everyone I work with is low, especially here in New England. 1,000-2,000 IU daily, plus K2 to help it actually get to your bones. Pair that with the weight-bearing exercises we do and your bones stay strong.",
  },
  {
    subject: "One Bad Night of Sleep Kills 18% of Your Muscle Growth",
    title: "One Bad Night of Sleep Kills 18% of Your Muscle Growth",
    intro: `<p style="margin: 0 0 20px 0;">You can crush your workouts. You can hit your protein targets. You can do everything right in the gym.</p><p style="margin: 0 0 25px 0;">But if you\'re not sleeping, you\'re not building. Because your body doesn\'t build muscle in the gym \u2014 it builds muscle while you sleep.</p>`,
    studies: [
      { heading: "Study 1: Growth Hormone and Sleep", source: "UC Berkeley (2025)", summary: "Growth hormone released during sleep is critical for muscle repair and bone strengthening.", url: "https://news.berkeley.edu/2025/09/08/sleep-strengthens-muscle-and-bone-by-boosting-growth-hormone-levels-uc-berkeley-researchers-discover-how/" },
      { heading: "Study 2: Sleep Deprivation and Hormones", source: "MDPI (2025)", summary: "Insufficient sleep elevates cortisol and reduces testosterone and growth hormone.", url: "https://www.mdpi.com/2077-0383/14/21/7606" },
      { heading: "Study 3: Muscle Protein Synthesis Loss", source: "PMC", summary: "One night of sleep deprivation reduces muscle protein synthesis by 18% and testosterone by 22%.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7785053/" },
    ],
    mattsTake: "You can train perfectly and eat perfectly, but if you\'re not sleeping 7+ hours, you\'re leaving results on the table. Your body builds muscle while you sleep \u2014 not in the gym. I\'m in bed by 8:15 every night. It\'s not sexy, but it works.",
  },
  {
    subject: "How Your Workouts Are Secretly Optimizing Your Hormones",
    title: "How Your Workouts Are Secretly Optimizing Your Hormones",
    intro: `<p style="margin: 0 0 20px 0;">Here\'s something most people don\'t realize: every time you hit a heavy squat or deadlift, you\'re not just building muscle. You\'re triggering your body to produce more of its own natural hormones.</p><p style="margin: 0 0 25px 0;">We\'re talking testosterone, growth hormone, IGF-1. Your body is a biochemical machine. Train it right, and it optimizes itself.</p>`,
    studies: [
      { heading: "Study 1: Exercise and Anabolic Hormones", source: "Springer", summary: "Exercise increases testosterone, IGF-1, growth hormone, and DHEA in older adults.", url: "https://link.springer.com/article/10.1007/s40279-021-01612-9" },
      { heading: "Study 2: Heavy Resistance Training Response", source: "Journal of Applied Physiology", summary: "Older men show significant testosterone increases and cortisol decreases with heavy-resistance training.", url: "https://journals.physiology.org/doi/full/10.1152/jappl.1999.87.3.982" },
      { heading: "Study 3: Compound Movement Hormonal Response", source: "PMC (2025)", summary: "Resistance training 2-3x per week with compound movements produces testosterone elevation.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11591795/" },
    ],
    mattsTake: "Every session we do together is doing more than building muscle. Compound movements \u2014 squats, deadlifts, presses \u2014 trigger your body to produce more testosterone and growth hormone naturally. No pills, no injections. Just hard work with the right programming.",
  },
  {
    subject: "Lifting Weights Could Cut Your Dementia Risk by 45%",
    title: "Lifting Weights Could Cut Your Dementia Risk by 45%",
    intro: `<p style="margin: 0 0 20px 0;">We all know someone affected by dementia or Alzheimer\'s. A parent, a grandparent, a friend. We watch it happen and feel helpless.</p><p style="margin: 0 0 25px 0;">But here\'s what the research is showing: you have more control over your brain health than you think. And it starts with lifting weights.</p>`,
    studies: [
      { heading: "Study 1: Weight Training and Memory", source: "Alzheimer\'s Info", summary: "Resistance training showed better memory and less brain atrophy in regions impaired by Alzheimer\'s disease.", url: "https://www.alzinfo.org/articles/prevention/weight-training-twice-a-week-may-protect-against-dementia/" },
      { heading: "Study 2: Cognitive Function and Brain Power", source: "Frontiers in Psychiatry (2025)", summary: "Resistance training significantly enhanced cognitive function, working memory, and verbal learning when done 2x per week for 6+ months.", url: "https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2025.1708244/full" },
      { heading: "Study 3: Activity Level and Dementia Risk", source: "Johns Hopkins (2025)", summary: "High levels of physical activity lower dementia risk by up to 45%.", url: "https://publichealth.jhu.edu/2025/small-amounts-of-moderate-to-vigorous-physical-activity-are-associated-with-big-reductions-in-dementia-risk" },
    ],
    mattsTake: "This one hits home. We all know someone affected by dementia or Alzheimer\'s. The research is clear \u2014 what we do in our sessions doesn\'t just build your body, it protects your brain. Two sessions a week. That\'s all it takes. You\'re already doing it.",
  },
];

// ─── CYCLE START DATE ────────────────────────────────────────────────────────
const CYCLE_START = new Date("2026-03-24T00:00:00-04:00");

// ─── EMAIL HTML BUILDER ──────────────────────────────────────────────────────
function buildEmailHTML(newsletter) {
  const studiesHTML = newsletter.studies
    .map(
      (s) => `
        <h3 style="margin: 25px 0 15px 0; font-size: 18px; color: #001F3F; border-left: 4px solid #FED402; padding-left: 15px;">${s.heading}</h3>
        <p style="margin: 0 0 10px 0; color: #555555; font-size: 15px;"><strong>${s.source}</strong> \u2014 ${s.summary}</p>
        <p style="margin: 0 0 20px 0;"><a href="${s.url}" style="color: #FED402; text-decoration: none; font-weight: bold;">Read the study &rarr;</a></p>`
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${newsletter.title}</title></head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif;">
<table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-collapse: collapse;">
  <tr><td style="padding: 40px 20px; text-align: center; background-color: #001F3F;">
    <img src="https://images.squarespace-cdn.com/content/v1/691c9de736d12f2c644ca72a/07128094-32d9-4e22-bfee-0e850b821ae7/FullLogo.jpg?format=500w" alt="Forged Home Fitness" width="280" style="display: block; margin: 0 auto; height: auto;">
  </td></tr>
  <tr><td style="padding: 30px 20px; border-bottom: 3px solid #FED402;">
    <h1 style="margin: 0; font-size: 28px; color: #001F3F; font-weight: bold;">${newsletter.title}</h1>
  </td></tr>
  <tr><td style="padding: 30px 20px; color: #333333; font-size: 16px; line-height: 1.6;">
    ${newsletter.intro}
    ${studiesHTML}
    <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #FED402; margin: 30px 0;">
      <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #001F3F;">Matt\'s Take</h3>
      <p style="margin: 0; color: #333333; line-height: 1.6;">${newsletter.mattsTake}</p>
    </div>
    <p style="margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 15px; color: #666666;">Know someone who\'d benefit from this kind of training? Reply to this email &mdash; I\'ll set them up with a free evaluation.</p>
  </td></tr>
  <tr><td style="padding: 20px; text-align: center; background-color: #f9f9f9; border-top: 1px solid #e0e0e0;">
    <p style="margin: 0; color: #333333; font-size: 15px;">Reply to this email or text me at <strong>774-283-3831</strong></p>
  </td></tr>
  <tr><td style="padding: 20px; text-align: center; background-color: #001F3F; color: #ffffff; font-size: 13px;">
    <p style="margin: 0 0 8px 0;">Matt Doherty \u2014 Forged Home Fitness</p>
    <p style="margin: 0 0 8px 0;">Premium In-Home Personal Training</p>
    <p style="margin: 0;"><a href="https://www.forgedhomefitness.com" style="color: #FED402; text-decoration: none;">www.forgedhomefitness.com</a></p>
  </td></tr>
</table>
</body></html>`;
}

// ─── DETERMINE WEEK NUMBER ───────────────────────────────────────────────────
function getWeekNumber() {
  const now = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const totalWeeks = Math.floor((now - CYCLE_START) / msPerWeek);
  const weekIndex = ((totalWeeks % 8) + 8) % 8; // Always 0-7
  return { totalWeeks, weekIndex };
}

// ─── REDIS: FETCH DYNAMICALLY GENERATED NEWSLETTER ──────────────────────────
async function getNewsletterFromRedis(totalWeeks) {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  try {
    const res = await fetch(`${REDIS_URL}/get/newsletter_week_${totalWeeks}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    });
    const data = await res.json();
    if (data.result) {
      return JSON.parse(data.result);
    }
    return null;
  } catch {
    return null;
  }
}

// ─── GET NEWSLETTER: Redis first, then hardcoded fallback ───────────────────
async function getNewsletter(totalWeeks, weekIndex) {
  // Always check Redis first \u2014 auto-generated content takes priority
  const dynamic = await getNewsletterFromRedis(totalWeeks);
  if (dynamic) {
    return { newsletter: dynamic, source: "redis" };
  }
  // Fallback to hardcoded 8-week cycle
  return { newsletter: NEWSLETTERS[weekIndex], source: "hardcoded" };
}

// ─── SEND EMAIL VIA RESEND ───────────────────────────────────────────────────
async function sendEmail({ to, bcc, subject, html }) {
  const payload = {
    from: FROM_EMAIL,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  };
  if (bcc && bcc.length > 0) {
    payload.bcc = bcc;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Resend API error: ${res.status} - ${error}`);
  }

  return res.json();
}

// ─── ROUTE HANDLER ───────────────────────────────────────────────────────────
export async function GET(request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check query params
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode"); // "send" or "preview"
  const isPreview = mode === "preview";

  // Timezone guard for dual-cron EST/EDT pattern
  const tzParam = searchParams.get("tz");
  if (tzParam) {
    const now = new Date();
    const jan = new Date(now.getFullYear(), 0, 1);
    const jul = new Date(now.getFullYear(), 6, 1);
    const stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    const isDST = now.getTimezoneOffset() < stdOffset;
    const currentTz = isDST ? "edt" : "est";
    if (tzParam !== currentTz) {
      return NextResponse.json({
        skipped: true,
        reason: `Wrong timezone window: expected ${currentTz}, got ${tzParam}`,
      });
    }
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { totalWeeks, weekIndex } = getWeekNumber();
    const { newsletter, source } = await getNewsletter(totalWeeks, weekIndex);
    const html = buildEmailHTML(newsletter);

    if (isPreview) {
      // Monday preview — send only to Matt
      const result = await sendEmail({
        to: MATT_EMAIL,
        subject: `[PREVIEW] Tomorrow's Newsletter: ${newsletter.subject}`,
        html,
      });

      return NextResponse.json({
        success: true,
        mode: "preview",
        weekNumber: weekIndex + 1,
        totalWeeks,
        source,
        subject: newsletter.subject,
        resendId: result.id,
      });
    } else {
      // Tuesday send — to Matt + BCC all clients
      const result = await sendEmail({
        to: MATT_EMAIL,
        bcc: CLIENT_EMAILS,
        subject: newsletter.subject,
        html,
      });

      return NextResponse.json({
        success: true,
        mode: "send",
        weekNumber: weekIndex + 1,
        totalWeeks,
        source,
        subject: newsletter.subject,
        recipientCount: CLIENT_EMAILS.length + 1,
        resendId: result.id,
      });
    }
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// ─── POST: Store a generated newsletter in Redis ────────────────────────────
export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { weekNumber, newsletter } = await request.json();
    if (!weekNumber || !newsletter || !newsletter.subject || !newsletter.studies) {
      return NextResponse.json({ error: "Missing weekNumber or newsletter data" }, { status: 400 });
    }

    const payload = JSON.stringify(newsletter);
    const res = await fetch(`${REDIS_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["SET", `newsletter_week_${weekNumber}`, payload]),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Redis error: ${res.status} - ${error}`);
    }

    return NextResponse.json({
      success: true,
      weekNumber,
      subject: newsletter.subject,
      stored: true,
    });
  } catch (error) {
    console.error("Newsletter POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
import { NextResponse } from "next/server";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const FROM_EMAIL = "Forged Home Fitness <noreply@forgedhomefitness.com>";
const MATT_EMAIL = "forgedhomefitness@gmail.com";

const CLIENT_EMAILS = [
  "mma@afergan.com",
  "jonblotner@gmail.com",
  "Belworthy@gmail.com",
  "Paul.Liberman@gmail.com",
  "Rachel.nager@gmail.com",
  "Alisha.nuger@gmail.com",
  "Jnuger@gmail.com",
  "Rsahamd@gmail.com",
  "atannenbaum@gmail.com",
  "suzannefuchs@gmail.com",
];

// ─── 8 PRE-BUILT NEWSLETTER WEEKS ───────────────────────────────────────────
const NEWSLETTERS = [
  {
    subject: "The $0.10/Day Supplement That Builds Muscle AND Brainpower After 40",
    title: "The $0.10/Day Supplement That Builds Muscle AND Brainpower After 40",
    intro: `<p style="margin: 0 0 20px 0;">You\'ve probably heard about creatine if you\'ve spent any time around gyms. But here\'s what most people don\'t know: it\'s not just for building muscle. Recent research shows creatine is one of the most studied and safest supplements out there \u2014 and it does something most people never expect.</p><p style="margin: 0 0 25px 0;">For anyone over 40, it\'s a game-changer. And it costs about a dime a day.</p>`,
    studies: [
      { heading: "Study 1: Creatine and Brain Power", source: "Oxford Academic/Nutrition Reviews", summary: "83% of studies showed positive relationships between creatine and cognition in older adults. Your brain needs energy just like your muscles do.", url: "https://academic.oup.com/nutritionreviews/advance-article/doi/10.1093/nutrit/nuaf135/8253584" },
      { heading: "Study 2: Muscle and Strength", source: "PMC", summary: "Combined with resistance training, creatine significantly improves strength, lean muscle mass, and bone area.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12272710/" },
      { heading: "Study 3: Strength Gains (Meta-Analysis)", source: "PMC", summary: "Increased lean tissue mass by 1.37 kg and improved upper/lower body strength across multiple studies.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12506341/" },
    ],
    mattsTake: "I recommend creatine monohydrate to almost every client over 40. 3-5 grams a day, every day. It\'s cheap, it\'s safe, and the research keeps stacking up. Mix it in your morning water and forget about it. That\'s it. No loading phase, no cycling \u2014 just consistent, simple supplementation that works.",
  },
  {
    subject: "Why Your Scale Is Lying to You (And What to Do About It)",
    title: "Why Your Scale Is Lying to You (And What to Do About It)",
    intro: `<p style="margin: 0 0 20px 0;">You step on the scale. It hasn\'t budged. So you think your training isn\'t working.</p><p style="margin: 0 0 25px 0;">Wrong. You could be gaining muscle, losing fat, and transforming your body \u2014 and the scale would tell you nothing. That\'s why I stopped caring about what the scale says years ago. There\'s a tool that actually shows what\'s happening.</p>`,
    studies: [
      { heading: "Study 1: DEXA Accuracy", source: "Accurate Imaging Diagnostics (2025)", summary: "DEXA produces nearly identical measurements to full-body CT scans. This is the gold standard for body composition.", url: "https://accurateimagingdiagnostics.com/what-a-2025-study-tells-us-about-the-accuracy-of-dexa-scans-for-measuring-fat-and-muscle/" },
      { heading: "Study 2: What DEXA Actually Tells You", source: "Revolution Health (2025)", summary: "DEXA measures fat distribution, lean muscle, visceral fat, and bone density with superior precision.", url: "https://revolutionhealth.org/blogs/news/dexa-for-body-composition-in-2025" },
      { heading: "Study 3: Bone Health Screening", source: "USPSTF", summary: "All women 65+ should be screened; postmenopausal women under 65 with risk factors should also get tested. DEXA is the standard.", url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/osteoporosis-screening" },
    ],
    mattsTake: "I tell every client \u2014 throw your scale away. Two people at the same weight can look completely different. A DEXA scan shows you what\'s actually happening: muscle, fat, bone density. It\'s the only number that matters. Ask your doctor about getting one.",
  },
  {
    subject: "The #1 Thing You Can Do to Live Longer (It\'s Not Cardio)",
    title: "The #1 Thing You Can Do to Live Longer (It\'s Not Cardio)",
    intro: `<p style="margin: 0 0 20px 0;">Everyone wants to live longer. We spend money on supplements, doctors\' visits, and fancy diets hoping for the magic bullet.</p><p style="margin: 0 0 25px 0;">But the research is loud and clear. If you want to actually live longer \u2014 not just look good, but actually add years to your life \u2014 there\'s one thing that works better than everything else. And it\'s weight training.</p>`,
    studies: [
      { heading: "Study 1: Weight Training and Mortality", source: "Oxford Academic (IJE)", summary: "Any weight training is associated with 6% lower all-cause mortality and 8% lower cardiovascular mortality.", url: "https://academic.oup.com/ije/article/53/3/dyae074/7687204" },
      { heading: "Study 2: Maximum Risk Reduction", source: "PubMed Meta-Analysis", summary: "Maximum risk reduction of 27% at around 60 minutes per week. Combined with aerobic exercise: 40% reduction in mortality risk.", url: "https://pubmed.ncbi.nlm.nih.gov/35599175/" },
      { heading: "Study 3: Resistance Training for Sarcopenia", source: "PMC", summary: "Individualized resistance training effectively improves muscle strength and function, directly translating to longer, more independent life.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12602684/" },
    ],
    mattsTake: "This is why I do what I do. The science is clear \u2014 lifting weights is the single most effective thing you can do to live longer and live better. And you don\'t need to be in the gym 2 hours a day. 60 minutes a week of real resistance training changes everything.",
  },
  {
    subject: "You\'re Probably Not Eating Enough Protein (Here\'s How Much You Actually Need)",
    title: "You\'re Probably Not Eating Enough Protein (Here\'s How Much You Actually Need)",
    intro: `<p style="margin: 0 0 20px 0;">You\'re training hard. You\'re showing up. But if the needle isn\'t moving on muscle, the problem is almost always the same: you\'re not eating enough protein.</p><p style="margin: 0 0 25px 0;">The old \u201c0.8 grams per kilogram\u201d recommendation? That\'s for sedentary people. If you\'re training and you\'re over 40, you need more. A lot more.</p>`,
    studies: [
      { heading: "Study 1: Sarcopenia Prevention", source: "Frontiers in Nutrition (2025)", summary: "1.2 g/kg body weight per day is significantly more effective than standard 0.8 g/kg for muscle preservation.", url: "https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2025.1547325/full" },
      { heading: "Study 2: Per-Meal Protein Timing", source: "MDPI Nutrition (2025)", summary: "25-30g per meal maximizes muscle protein synthesis, and 40g pre-sleep improves overnight synthesis.", url: "https://www.mdpi.com/2072-6643/17/15/2461" },
      { heading: "Study 3: Meal Distribution", source: "Science Direct Meta-Analysis", summary: "Even distribution of protein across meals produces 25% greater muscle protein synthesis versus skewed intake.", url: "https://www.sciencedirect.com/science/article/pii/S1568163724001430" },
    ],
    mattsTake: "Most of my clients are undereating protein when we start working together. If you weigh 170 lbs, you need at least 90-120 grams a day. Spread it out \u2014 30g at breakfast, lunch, dinner, and a shake or Greek yogurt before bed.",
  },
  {
    subject: "The Vitamin 42% of Americans Are Deficient In (And Why It Matters After 40)",
    title: "The Vitamin 42% of Americans Are Deficient In (And Why It Matters After 40)",
    intro: `<p style="margin: 0 0 20px 0;">Vitamin D is one of the most important things your body needs \u2014 and most people aren\'t getting enough of it. In New England especially, we just don\'t get enough sun to produce it naturally.</p><p style="margin: 0 0 25px 0;">If you\'re over 40, bone health matters. A lot. And vitamin D is the key to making sure your bones stay strong and your calcium actually gets absorbed.</p>`,
    studies: [
      { heading: "Study 1: Vitamin D and Calcium Absorption", source: "PMC Expert Consensus (2025)", summary: "Maintain serum vitamin D levels \u226530 ng/mL. Adequate vitamin D increases calcium absorption by 30-40%.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11836767/" },
      { heading: "Study 2: Daily Supplementation Works Better", source: "PMC Meta-Analysis", summary: "Daily calcium and vitamin D supplementation reduced fracture risk more effectively than intermittent dosing.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12506016/" },
      { heading: "Study 3: Vitamin K2 for Bone Strength", source: "Frontiers in Endocrinology (2025)", summary: "K2 improves bone turnover markers and enhanced lumbar spine bone mineral density.", url: "https://www.frontiersin.org/journals/endocrinology/articles/10.3389/fendo.2025.1703116/full" },
    ],
    mattsTake: "Get your vitamin D levels tested. Seriously. Almost everyone I work with is low, especially here in New England. 1,000-2,000 IU daily, plus K2 to help it actually get to your bones. Pair that with the weight-bearing exercises we do and your bones stay strong.",
  },
  {
    subject: "One Bad Night of Sleep Kills 18% of Your Muscle Growth",
    title: "One Bad Night of Sleep Kills 18% of Your Muscle Growth",
    intro: `<p style="margin: 0 0 20px 0;">You can crush your workouts. You can hit your protein targets. You can do everything right in the gym.</p><p style="margin: 0 0 25px 0;">But if you\'re not sleeping, you\'re not building. Because your body doesn\'t build muscle in the gym \u2014 it builds muscle while you sleep.</p>`,
    studies: [
      { heading: "Study 1: Growth Hormone and Sleep", source: "UC Berkeley (2025)", summary: "Growth hormone released during sleep is critical for muscle repair and bone strengthening.", url: "https://news.berkeley.edu/2025/09/08/sleep-strengthens-muscle-and-bone-by-boosting-growth-hormone-levels-uc-berkeley-researchers-discover-how/" },
      { heading: "Study 2: Sleep Deprivation and Hormones", source: "MDPI (2025)", summary: "Insufficient sleep elevates cortisol and reduces testosterone and growth hormone.", url: "https://www.mdpi.com/2077-0383/14/21/7606" },
      { heading: "Study 3: Muscle Protein Synthesis Loss", source: "PMC", summary: "One night of sleep deprivation reduces muscle protein synthesis by 18% and testosterone by 22%.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7785053/" },
    ],
    mattsTake: "You can train perfectly and eat perfectly, but if you\'re not sleeping 7+ hours, you\'re leaving results on the table. Your body builds muscle while you sleep \u2014 not in the gym. I\'m in bed by 8:15 every night. It\'s not sexy, but it works.",
  },
  {
    subject: "How Your Workouts Are Secretly Optimizing Your Hormones",
    title: "How Your Workouts Are Secretly Optimizing Your Hormones",
    intro: `<p style="margin: 0 0 20px 0;">Here\'s something most people don\'t realize: every time you hit a heavy squat or deadlift, you\'re not just building muscle. You\'re triggering your body to produce more of its own natural hormones.</p><p style="margin: 0 0 25px 0;">We\'re talking testosterone, growth hormone, IGF-1. Your body is a biochemical machine. Train it right, and it optimizes itself.</p>`,
    studies: [
      { heading: "Study 1: Exercise and Anabolic Hormones", source: "Springer", summary: "Exercise increases testosterone, IGF-1, growth hormone, and DHEA in older adults.", url: "https://link.springer.com/article/10.1007/s40279-021-01612-9" },
      { heading: "Study 2: Heavy Resistance Training Response", source: "Journal of Applied Physiology", summary: "Older men show significant testosterone increases and cortisol decreases with heavy-resistance training.", url: "https://journals.physiology.org/doi/full/10.1152/jappl.1999.87.3.982" },
      { heading: "Study 3: Compound Movement Hormonal Response", source: "PMC (2025)", summary: "Resistance training 2-3x per week with compound movements produces testosterone elevation.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11591795/" },
    ],
    mattsTake: "Every session we do together is doing more than building muscle. Compound movements \u2014 squats, deadlifts, presses \u2014 trigger your body to produce more testosterone and growth hormone naturally. No pills, no injections. Just hard work with the right programming.",
  },
  {
    subject: "Lifting Weights Could Cut Your Dementia Risk by 45%",
    title: "Lifting Weights Could Cut Your Dementia Risk by 45%",
    intro: `<p style="margin: 0 0 20px 0;">We all know someone affected by dementia or Alzheimer\'s. A parent, a grandparent, a friend. We watch it happen and feel helpless.</p><p style="margin: 0 0 25px 0;">But here\'s what the research is showing: you have more control over your brain health than you think. And it starts with lifting weights.</p>`,
    studies: [
      { heading: "Study 1: Weight Training and Memory", source: "Alzheimer\'s Info", summary: "Resistance training showed better memory and less brain atrophy in regions impaired by Alzheimer\'s disease.", url: "https://www.alzinfo.org/articles/prevention/weight-training-twice-a-week-may-protect-against-dementia/" },
      { heading: "Study 2: Cognitive Function and Brain Power", source: "Frontiers in Psychiatry (2025)", summary: "Resistance training significantly enhanced cognitive function, working memory, and verbal learning when done 2x per week for 6+ months.", url: "https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2025.1708244/full" },
      { heading: "Study 3: Activity Level and Dementia Risk", source: "Johns Hopkins (2025)", summary: "High levels of physical activity lower dementia risk by up to 45%.", url: "https://publichealth.jhu.edu/2025/small-amounts-of-moderate-to-vigorous-physical-activity-are-associated-with-big-reductions-in-dementia-risk" },
    ],
    mattsTake: "This one hits home. We all know someone affected by dementia or Alzheimer\'s. The research is clear \u2014 what we do in our sessions doesn\'t just build your body, it protects your brain. Two sessions a week. That\'s all it takes. You\'re already doing it.",
  },
];

// ─── CYCLE START DATE ────────────────────────────────────────────────────────
const CYCLE_START = new Date("2026-03-24T00:00:00-04:00");

// ─── EMAIL HTML BUILDER ──────────────────────────────────────────────────────
function buildEmailHTML(newsletter) {
  const studiesHTML = newsletter.studies
    .map(
      (s) => `
        <h3 style="margin: 25px 0 15px 0; font-size: 18px; color: #001F3F; border-left: 4px solid #FED402; padding-left: 15px;">${s.heading}</h3>
        <p style="margin: 0 0 10px 0; color: #555555; font-size: 15px;"><strong>${s.source}</strong> \u2014 ${s.summary}</p>
        <p style="margin: 0 0 20px 0;"><a href="${s.url}" style="color: #FED402; text-decoration: none; font-weight: bold;">Read the study &rarr;</a></p>`
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${newsletter.title}</title></head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif;">
<table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-collapse: collapse;">
  <tr><td style="padding: 40px 20px; text-align: center; background-color: #001F3F;">
    <img src="https://images.squarespace-cdn.com/content/v1/691c9de736d12f2c644ca72a/07128094-32d9-4e22-bfee-0e850b821ae7/FullLogo.jpg?format=500w" alt="Forged Home Fitness" width="280" style="display: block; margin: 0 auto; height: auto;">
  </td></tr>
  <tr><td style="padding: 30px 20px; border-bottom: 3px solid #FED402;">
    <h1 style="margin: 0; font-size: 28px; color: #001F3F; font-weight: bold;">${newsletter.title}</h1>
  </td></tr>
  <tr><td style="padding: 30px 20px; color: #333333; font-size: 16px; line-height: 1.6;">
    ${newsletter.intro}
    ${studiesHTML}
    <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #FED402; margin: 30px 0;">
      <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #001F3F;">Matt\'s Take</h3>
      <p style="margin: 0; color: #333333; line-height: 1.6;">${newsletter.mattsTake}</p>
    </div>
    <p style="margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 15px; color: #666666;">Know someone who\'d benefit from this kind of training? Reply to this email &mdash; I\'ll set them up with a free evaluation.</p>
  </td></tr>
  <tr><td style="padding: 20px; text-align: center; background-color: #f9f9f9; border-top: 1px solid #e0e0e0;">
    <p style="margin: 0; color: #333333; font-size: 15px;">Reply to this email or text me at <strong>774-283-3831</strong></p>
  </td></tr>
  <tr><td style="padding: 20px; text-align: center; background-color: #001F3F; color: #ffffff; font-size: 13px;">
    <p style="margin: 0 0 8px 0;">Matt Doherty \u2014 Forged Home Fitness</p>
    <p style="margin: 0 0 8px 0;">Premium In-Home Personal Training</p>
    <p style="margin: 0;"><a href="https://www.forgedhomefitness.com" style="color: #FED402; text-decoration: none;">www.forgedhomefitness.com</a></p>
  </td></tr>
</table>
</body></html>`;
}

// ─── DETERMINE WEEK NUMBER ───────────────────────────────────────────────────
function getWeekNumber() {
  const now = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const totalWeeks = Math.floor((now - CYCLE_START) / msPerWeek);
  const weekIndex = ((totalWeeks % 8) + 8) % 8; // Always 0-7
  return { totalWeeks, weekIndex };
}

// ─── SEND EMAIL VIA RESEND ───────────────────────────────────────────────────
async function sendEmail({ to, bcc, subject, html }) {
  const payload = {
    from: FROM_EMAIL,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  };
  if (bcc && bcc.length > 0) {
    payload.bcc = bcc;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Resend API error: ${res.status} - ${error}`);
  }

  return res.json();
}

// ─── ROUTE HANDLER ───────────────────────────────────────────────────────────
export async function GET(request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check query params
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode"); // "send" or "preview"
  const isPreview = mode === "preview";

  // Timezone guard for dual-cron EST/EDT pattern
  const tzParam = searchParams.get("tz");
  if (tzParam) {
    const now = new Date();
    const jan = new Date(now.getFullYear(), 0, 1);
    const jul = new Date(now.getFullYear(), 6, 1);
    const stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    const isDST = now.getTimezoneOffset() < stdOffset;
    const currentTz = isDST ? "edt" : "est";
    if (tzParam !== currentTz) {
      return NextResponse.json({
        skipped: true,
        reason: `Wrong timezone window: expected ${currentTz}, got ${tzParam}`,
      });
    }
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { totalWeeks, weekIndex } = getWeekNumber();
    const newsletter = NEWSLETTERS[weekIndex];
    const html = buildEmailHTML(newsletter);

    if (isPreview) {
      // Monday preview — send only to Matt
      const result = await sendEmail({
        to: MATT_EMAIL,
        subject: `[PREVIEW] Tomorrow\'s Newsletter: ${newsletter.subject}`,
        html,
      });

      return NextResponse.json({
        success: true,
        mode: "preview",
        weekNumber: weekIndex + 1,
        totalWeeks,
        subject: newsletter.subject,
        resendId: result.id,
      });
    } else {
      // Tuesday send — to Matt + BCC all clients
      const result = await sendEmail({
        to: MATT_EMAIL,
        bcc: CLIENT_EMAILS,
        subject: newsletter.subject,
        html,
      });

      return NextResponse.json({
        success: true,
        mode: "send",
        weekNumber: weekIndex + 1,
        totalWeeks,
        subject: newsletter.subject,
        recipientCount: CLIENT_EMAILS.length + 1,
        resendId: result.id,
      });
    }
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
