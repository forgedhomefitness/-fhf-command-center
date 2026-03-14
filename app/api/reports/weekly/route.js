import { NextResponse } from "next/server";

// Resend email service — free tier: 100 emails/month
// Set RESEND_API_KEY in Vercel env vars
// Set REPORT_EMAIL to your email (defaults to forgedhomefitness@gmail.com)

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://fhf-command-center.vercel.app";

// Determine if Massachusetts is currently in EDT or EST
function isEDT() {
  const now = new Date();
  const jan = new Date(now.getFullYear(), 0, 1);
  const jul = new Date(now.getFullYear(), 6, 1);
  const stdOffset = Math.max(
    jan.getTimezoneOffset(),
    jul.getTimezoneOffset()
  );

  // Fallback: use Intl to check America/New_York
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      timeZoneName: "short",
    });
    const parts = fmt.formatToParts(now);
    const tzName =
      parts.find((p) => p.type === "timeZoneName")?.value || "";
    return tzName === "EDT";
  } catch {
    // Manual DST check: 2nd Sunday of March to 1st Sunday of November
    const month = now.getMonth(); // 0-indexed
    if (month > 2 && month < 10) return true; // Apr-Oct always EDT
    if (month < 2 || month > 10) return false; // Jan-Feb, Dec always EST
    // March or November need day check
    if (month === 2) {
      const secondSunday =
        14 - new Date(now.getFullYear(), 2, 1).getDay();
      return now.getDate() >= secondSunday;
    }
    // November
    const firstSunday =
      7 - new Date(now.getFullYear(), 10, 1).getDay();
    return now.getDate() < firstSunday;
  }
}

function formatCurrency(val) {
  if (val == null) return "$0";
  return "$" + Math.round(val).toLocaleString();
}

async function fetchInternal(path) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function buildEmailHTML(acuityData, qbData, weeklyData) {
  const grossRevenue = acuityData?.totalRevenue || 0;
  const totalSessions = acuityData?.totalSessions || 0;
  const qbIncome = qbData?.totalIncome || 0;
  const qbExpenses = qbData?.totalExpenses || 0;
  const netIncome = qbData?.netIncome || 0;

  // This week's numbers from /api/acuity
  const thisWeekRevenue = weeklyData?.weekRevenue || 0;
  const thisWeekSessions = weeklyData?.weekSessions || 0;
  const lastWeekRevenue = weeklyData?.lastWeekRevenue || 0;
  const lastWeekSessions = weeklyData?.lastWeekSessions || 0;

  // Stripe fees: 2.9% + $0.30 per transaction
  const STRIPE_PCT = 0.029;
  const STRIPE_FLAT = 0.30;
  const thisWeekStripeFees = Math.round((thisWeekRevenue * STRIPE_PCT) + (thisWeekSessions * STRIPE_FLAT));
  const thisWeekNet = thisWeekRevenue - thisWeekStripeFees;
  const lastWeekStripeFees = Math.round((lastWeekRevenue * STRIPE_PCT) + (lastWeekSessions * STRIPE_FLAT));
  const lastWeekNet = lastWeekRevenue - lastWeekStripeFees;

  // YTD Stripe fees estimate
  const ytdStripeFees = Math.round((grossRevenue * STRIPE_PCT) + (totalSessions * STRIPE_FLAT));
  const ytdNetRevenue = grossRevenue - ytdStripeFees;

  const TAX_RATE = 0.3;
  const weeklyTaxReserve = Math.round(thisWeekNet * TAX_RATE);
  const ytdGrossTax = Math.round(grossRevenue * TAX_RATE);
  const ytdNetTax = Math.round(ytdNetRevenue * TAX_RATE);

  // Weekly comparison (net after fees)
  const revenueDiff = thisWeekNet - lastWeekNet;
  const revenueDiffSign = revenueDiff >= 0 ? "+" : "";
  const revenueDiffColor = revenueDiff >= 0 ? "#4ade80" : "#f87171";

  // Phase 1 target
  const annualTarget = 108000;
  const weeklyTarget = 2077;
  const pctTarget = Math.round((grossRevenue / annualTarget) * 100);
  const weeklyPctTarget = Math.min(100, Math.round((thisWeekNet / weeklyTarget) * 100));

  const now = new Date();
  const weekOf = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Build monthly rows
  let monthRows = "";
  const acMonths = acuityData?.months || [];
  const qbMonths = qbData?.months || [];
  for (const m of acMonths) {
    const qbMonth = qbMonths.find((q) => q.label === m.label) || {};
    monthRows += `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #1a1a2e;color:#fff;">${m.label}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #1a1a2e;color:#4ade80;text-align:right;">${formatCurrency(m.revenue)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #1a1a2e;color:#94a3b8;text-align:right;">${m.sessions}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #1a1a2e;color:#4ade80;text-align:right;">${qbMonth.income ? formatCurrency(qbMonth.income) : "\u2014"}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #1a1a2e;color:#f87171;text-align:right;">${qbMonth.expenses ? formatCurrency(qbMonth.expenses) : "\u2014"}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #1a1a2e;color:#fbbf24;text-align:right;">${formatCurrency(m.revenue * TAX_RATE)}</td>
      </tr>`;
  }

  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="margin:0;padding:0;background:#0a0a1a;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">

      <!-- Header -->
      <div style="background:#001F3F;border-radius:12px;padding:24px;margin-bottom:16px;border-left:4px solid #FED402;">
        <h1 style="margin:0;color:#FED402;font-size:20px;letter-spacing:2px;">FORGED HOME FITNESS</h1>
        <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">Weekly Financial Report \u2014 ${weekOf}</p>
      </div>

      <!-- THIS WEEK — Hero Section -->
      <div style="background:linear-gradient(135deg,#001F3F,#0a2a4f);border-radius:12px;padding:24px;margin-bottom:16px;border:2px solid #FED402;">
        <h2 style="margin:0 0 4px;color:#FED402;font-size:14px;text-transform:uppercase;letter-spacing:2px;">This Week</h2>
        <p style="margin:0 0 16px;color:#64748b;font-size:11px;">Mon\u2013Sun revenue from Acuity sessions</p>

        <div style="display:flex;gap:16px;margin-bottom:12px;">
          <div style="flex:1;">
            <p style="margin:0;color:#94a3b8;font-size:11px;text-transform:uppercase;">Gross Revenue</p>
            <p style="margin:4px 0 0;color:#4ade80;font-size:28px;font-weight:bold;">${formatCurrency(thisWeekRevenue)}</p>
          </div>
          <div style="flex:1;">
            <p style="margin:0;color:#94a3b8;font-size:11px;text-transform:uppercase;">Stripe Fees</p>
            <p style="margin:4px 0 0;color:#f87171;font-size:28px;font-weight:bold;">-${formatCurrency(thisWeekStripeFees)}</p>
          </div>
          <div style="flex:1;">
            <p style="margin:0;color:#94a3b8;font-size:11px;text-transform:uppercase;">Sessions</p>
            <p style="margin:4px 0 0;color:#fff;font-size:28px;font-weight:bold;">${thisWeekSessions}</p>
          </div>
        </div>

        <!-- Net revenue highlight -->
        <div style="background:rgba(74,222,128,0.1);border-radius:8px;padding:12px 16px;margin-bottom:12px;border-left:3px solid #4ade80;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;font-weight:bold;">NET REVENUE (after Stripe)</p>
            <p style="margin:0;color:#4ade80;font-size:24px;font-weight:bold;">${formatCurrency(thisWeekNet)}</p>
          </div>
          <p style="margin:4px 0 0;color:${revenueDiffColor};font-size:11px;">${revenueDiffSign}${formatCurrency(Math.abs(revenueDiff))} vs last week (net) &bull; Last week: ${lastWeekSessions} sessions</p>
        </div>

        <!-- Weekly target progress bar -->
        <p style="margin:0 0 6px;color:#94a3b8;font-size:11px;">Weekly Target: ${formatCurrency(thisWeekNet)} / ${formatCurrency(weeklyTarget)} (${weeklyPctTarget}%)</p>
        <div style="background:#1e293b;border-radius:8px;height:12px;overflow:hidden;">
          <div style="background:linear-gradient(90deg,#FED402,#FFCC00);height:12px;width:${Math.min(100, weeklyPctTarget)}%;border-radius:8px;"></div>
        </div>
      </div>

      <!-- PUT ASIDE THIS WEEK — Tax Reserve -->
      <div style="background:#111827;border-radius:12px;padding:24px;margin-bottom:16px;border-top:4px solid #FED402;text-align:center;">
        <p style="margin:0;color:#FED402;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:bold;">Put Aside This Week</p>
        <p style="margin:8px 0 0;color:#FED402;font-size:42px;font-weight:bold;">${formatCurrency(weeklyTaxReserve)}</p>
        <p style="margin:4px 0 0;color:#64748b;font-size:12px;">30% of ${formatCurrency(thisWeekNet)} net (after ${formatCurrency(thisWeekStripeFees)} Stripe fees)</p>
        <p style="margin:2px 0 0;color:#475569;font-size:11px;">Transfer to BlueVine tax reserve</p>
      </div>

      <!-- YTD Summary -->
      <div style="display:flex;gap:12px;margin-bottom:16px;">
        <div style="flex:1;background:#111827;border-radius:12px;padding:20px;border-top:3px solid #FED402;">
          <p style="margin:0;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;">YTD Gross Revenue</p>
          <p style="margin:8px 0 0;color:#FED402;font-size:28px;font-weight:bold;">${formatCurrency(grossRevenue)}</p>
          <p style="margin:4px 0 0;color:#64748b;font-size:11px;">Stripe fees est: ${formatCurrency(ytdStripeFees)}</p>
        </div>
        <div style="flex:1;background:#111827;border-radius:12px;padding:20px;border-top:3px solid #4ade80;">
          <p style="margin:0;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;">YTD Net Revenue</p>
          <p style="margin:8px 0 0;color:#4ade80;font-size:28px;font-weight:bold;">${formatCurrency(ytdNetRevenue)}</p>
          <p style="margin:4px 0 0;color:#64748b;font-size:11px;">Should have reserved: ${formatCurrency(ytdNetTax)} (30%)</p>
        </div>
      </div>

      <!-- YTD Numbers -->
      <div style="background:#111827;border-radius:12px;padding:20px;margin-bottom:16px;">
        <h2 style="margin:0 0 16px;color:#fff;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Year-to-Date</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#94a3b8;font-size:13px;">Gross Revenue (Acuity)</td>
            <td style="padding:8px 0;color:#4ade80;font-size:18px;font-weight:bold;text-align:right;">${formatCurrency(grossRevenue)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#94a3b8;font-size:13px;">Sessions Completed</td>
            <td style="padding:8px 0;color:#fff;font-size:18px;font-weight:bold;text-align:right;">${totalSessions}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#94a3b8;font-size:13px;">QB Income</td>
            <td style="padding:8px 0;color:#4ade80;font-size:18px;font-weight:bold;text-align:right;">${formatCurrency(qbIncome)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#94a3b8;font-size:13px;">QB Expenses</td>
            <td style="padding:8px 0;color:#f87171;font-size:18px;font-weight:bold;text-align:right;">${formatCurrency(qbExpenses)}</td>
          </tr>
          <tr style="border-top:1px solid #1e293b;">
            <td style="padding:12px 0 8px;color:#fff;font-size:14px;font-weight:bold;">Net Profit</td>
            <td style="padding:12px 0 8px;color:${netIncome >= 0 ? "#4ade80" : "#f87171"};font-size:20px;font-weight:bold;text-align:right;">${formatCurrency(netIncome)}</td>
          </tr>
        </table>
      </div>

      <!-- Phase 1 Progress -->
      <div style="background:#111827;border-radius:12px;padding:20px;margin-bottom:16px;">
        <h2 style="margin:0 0 12px;color:#fff;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Phase 1 Progress \u2014 $108K Target</h2>
        <div style="background:#1e293b;border-radius:8px;height:24px;overflow:hidden;">
          <div style="background:linear-gradient(90deg,#FED402,#FFCC00);height:24px;width:${Math.min(100, pctTarget)}%;border-radius:8px;"></div>
        </div>
        <p style="margin:8px 0 0;color:#94a3b8;font-size:12px;">${formatCurrency(grossRevenue)} of ${formatCurrency(annualTarget)} (${pctTarget}%)</p>
      </div>

      <!-- Monthly Breakdown -->
      ${monthRows ? `
      <div style="background:#111827;border-radius:12px;padding:20px;margin-bottom:16px;overflow-x:auto;">
        <h2 style="margin:0 0 12px;color:#fff;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Monthly Breakdown</h2>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th style="padding:8px 12px;text-align:left;color:#64748b;border-bottom:1px solid #334155;">Month</th>
              <th style="padding:8px 12px;text-align:right;color:#64748b;border-bottom:1px solid #334155;">Gross Rev</th>
              <th style="padding:8px 12px;text-align:right;color:#64748b;border-bottom:1px solid #334155;">Sessions</th>
              <th style="padding:8px 12px;text-align:right;color:#64748b;border-bottom:1px solid #334155;">QB Income</th>
              <th style="padding:8px 12px;text-align:right;color:#64748b;border-bottom:1px solid #334155;">Expenses</th>
              <th style="padding:8px 12px;text-align:right;color:#64748b;border-bottom:1px solid #334155;">Tax (30%)</th>
            </tr>
          </thead>
          <tbody>
            ${monthRows}
          </tbody>
        </table>
      </div>` : ""}

      <!-- CPA Note -->
      <div style="background:#111827;border-radius:12px;padding:16px;border-left:3px solid #FED402;">
        <p style="margin:0;color:#94a3b8;font-size:11px;">
          <strong style="color:#fff;">CPA: Turner & Costa PC</strong><br/>
          This is an automated report from FHF Command Center. The 30% tax reserve is a conservative estimate. Consult your CPA for actual obligations including self-employment tax and quarterly estimated payments.
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align:center;margin-top:24px;padding:16px;">
        <a href="${BASE_URL}/finances" style="display:inline-block;background:#FED402;color:#001F3F;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px;">View Full Dashboard</a>
        <p style="margin:16px 0 0;color:#475569;font-size:10px;">Forged Home Fitness Command Center</p>
      </div>
    </div>
  </body>
  </html>`;
}

export async function GET(request) {
  // Timezone guard: dual cron fires at both EST and EDT times.
  // Only the correct one for the current timezone should actually send.
  const { searchParams } = new URL(request.url);
  const tzParam = searchParams.get("tz");

  if (tzParam) {
    const currentlyEDT = isEDT();
    const shouldSend =
      (tzParam === "edt" && currentlyEDT) ||
      (tzParam === "est" && !currentlyEDT);

    if (!shouldSend) {
      return NextResponse.json({
        skipped: true,
        reason: `Cron tz=${tzParam} but currently ${currentlyEDT ? "EDT" : "EST"}`,
      });
    }
  }

  // Verify cron secret to prevent unauthorized triggers
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY not configured", sent: false },
      { status: 503 }
    );
  }

  try {
    // Fetch data from internal APIs
    // /api/acuity = current week + last week comparison
    // /api/acuity/ytd = year-to-date totals
    // /api/quickbooks/pnl = P&L from QuickBooks
    const [weeklyData, acuityData, qbData] = await Promise.all([
      fetchInternal("/api/acuity"),
      fetchInternal("/api/acuity/ytd"),
      fetchInternal("/api/quickbooks/pnl"),
    ]);

    const html = buildEmailHTML(acuityData, qbData, weeklyData);

    const recipientEmail =
      process.env.REPORT_EMAIL || "forgedhomefitness@gmail.com";

    const now = new Date();
    const subject = `FHF Weekly Report \u2014 ${now.toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric", year: "numeric" }
    )}`;

    // Send via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FHF Command Center <onboarding@resend.dev>",
        to: [recipientEmail],
        subject,
        html,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      return NextResponse.json(
        {
          error: `Resend error: ${emailRes.status} ${err}`,
          sent: false,
        },
        { status: 500 }
      );
    }

    const result = await emailRes.json();
    const weekRev = weeklyData?.weekRevenue || 0;
    const weekSess = weeklyData?.weekSessions || 0;
    const weekFees = Math.round((weekRev * 0.029) + (weekSess * 0.30));
    const weekNet = weekRev - weekFees;
    return NextResponse.json({
      sent: true,
      to: recipientEmail,
      subject,
      emailId: result.id,
      thisWeekGross: weekRev,
      thisWeekStripeFees: weekFees,
      thisWeekNet: weekNet,
      thisWeekTaxReserve: Math.round(weekNet * 0.3),
      ytdGrossRevenue: acuityData?.totalRevenue || 0,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message, sent: false },
      { status: 500 }
    );
  }
}
