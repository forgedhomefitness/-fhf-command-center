import { NextResponse } from "next/server";

// Universal email sending route for FHF automated reports
// Any scheduled task can POST here to email Matt (or specific recipients)
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const FROM_EMAIL = "Forged Home Fitness <noreply@forgedhomefitness.com>";
const MATT_EMAIL = "forgedhomefitness@gmail.com";

async function sendEmail({ to, bcc, subject, html }) {
  const payload = {
    from: FROM_EMAIL,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  };
  if (bcc && bcc.length > 0) payload.bcc = bcc;

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
    throw new Error(`Resend error: ${res.status} - ${error}`);
  }
  return res.json();
}

// POST: Send any report/summary email
// Body: { subject, html, to? (defaults to Matt), bcc? }
export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const body = await request.json();
    const { subject, html, to, bcc } = body;

    if (!subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields: subject, html" },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: to || MATT_EMAIL,
      bcc: bcc || [],
      subject,
      html,
    });

    return NextResponse.json({
      success: true,
      subject,
      to: to || MATT_EMAIL,
      bccCount: bcc ? bcc.length : 0,
      resendId: result.id,
    });
  } catch (error) {
    console.error("Send report error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
