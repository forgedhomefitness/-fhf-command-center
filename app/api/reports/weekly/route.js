import { NextResponse } from "next/server";

// Resend email service — free tier: 100 emails/month
// Set RESEND_API_KEY in Vercel env vars
// Set REPORT_EMAIL to your email (defaults to forgedhomefitness@gmail.com)

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://fhf-command-center.vercel.app";

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

function buildEmailHTML(acuityData, qbData) {
  const grossRevenue = acuityData?.totalRevenue || 0;
  const totalSessions = acuityData?.totalSessions || 0;
  const qbIncome = qbData?.totalIncome || 0;
  const qbExpenses = qbData?.totalExpenses || 0;
  const netIncome = qbData?.netIncome || 0;
  const TAX_RATE = 0.3;
  const grossTax = Math.round(grossRevenue * TAX_RATE);
  const netTax = Math.round(Math.max(0, netIncome) * TAX_RATE);
  const annualTarget = 108000;
  const pctTarget = Math.round((grossRevenue / annualTarget) * 100);

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
        <td style="padding:8px 12px;border-bottom:1px solid #1a1a2e;color:#4ade80;text-align:right;">${qbMonth.income ? formatCurrency(qbMonth.income) : "—"}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #1a1a2e;color:#f87171;text-align:right;">${qbMonth.expenses ? formatCurrency(qbMonth.expenses) : "—"}</td>
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
      <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">Weekly Financial Report — ${weekOf}</p>
    </div>

    <!-- Tax Reserve Summary -->
    <div style="display:flex;gap:12px;margin-bottom:16px;">
      <div style="flex:1;background:#111827;border-radius:12px;padding:20px;border-top:3px solid #FED402;">
        <p style="margin:0;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Tax Reserve (Gross)</p>
        <p style="margin:8px 0 0;color:#FED402;font-size:28px;font-weight:bold;">${formatCurrency(grossTax)}</p>
        <p style="margin:4px 0 0;color:#64748b;font-size:11px;">30% of ${formatCurrency(grossRevenue)} gross revenue</p>
      </div>
      <div style="flex:1;background:#111827;border-radius:12px;padding:20px;border-top:3px solid #4ade80;">
        <p style="margin:0;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Tax Reserve (Net)</p>
        <p style="margin:8px 0 0;color:#4ade80;font-size:28px;font-weight:bold;">${formatCurrency(netTax)}</p>
        <p style="margin:4px 0 0;color:#64748b;font-size:11px;">30% of ${formatCurrency(netIncome)} net profit</p>
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
      <h2 style="margin:0 0 12px;color:#fff;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Phase 1 Progress — $108K Target</h2>
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
        This is an automated report from FHF Command Center. The 30% tax reserve is a conservative estimate.
        Consult your CPA for actual obligations including self-employment tax and quarterly estimated payments.
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
    const [acuityData, qbData] = await Promise.all([
      fetchInternal("/api/acuity/ytd"),
      fetchInternal("/api/quickbooks/pnl"),
    ]);

    const html = buildEmailHTML(acuityData, qbData);
    const recipientEmail =
      process.env.REPORT_EMAIL || "forgedhomefitness@gmail.com";

    const now = new Date();
    const subject = `FHF Weekly Report — ${now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;

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
        { error: `Resend error: ${emailRes.status} ${err}`, sent: false },
        { status: 500 }
      );
    }

    const result = await emailRes.json();
    return NextResponse.json({
      sent: true,
      to: recipientEmail,
      subject,
      emailId: result.id,
      grossRevenue: acuityData?.totalRevenue || 0,
      netIncome: qbData?.netIncome || 0,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message, sent: false },
      { status: 500 }
    );
  }
}
