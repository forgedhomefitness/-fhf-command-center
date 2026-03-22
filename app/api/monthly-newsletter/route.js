import { NextResponse } from "next/server";

// CONFIG
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

async function redisGet(key) {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  try {
    const res = await fetch(`${REDIS_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    });
    const data = await res.json();
    return data.result ? JSON.parse(data.result) : null;
  } catch {
    return null;
  }
}

async function redisSet(key, value, exSeconds) {
  if (!REDIS_URL || !REDIS_TOKEN) return false;
  try {
    const body = exSeconds
      ? ["SET", key, JSON.stringify(value), "EX", String(exSeconds)]
      : ["SET", key, JSON.stringify(value)];
    const res = await fetch(`${REDIS_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function getTargetMonth() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthName = next.toLocaleString("en-US", { month: "long" });
  const year = next.getFullYear();
  const key = `${year}-${String(next.getMonth() + 1).padStart(2, "0")}`;
  return { monthName, year, key };
}

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

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const isPreview = mode === "preview";

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

    const { monthName, year, key } = getTargetMonth();

    const newsletter = await redisGet(`monthly-newsletter:${key}`);
    if (!newsletter || !newsletter.html) {
      throw new Error(
        `No monthly newsletter found in Redis for ${key}. The scheduled task should store it by the 23rd.`
      );
    }

    const subject = newsletter.subject || `Forged Home Fitness — ${monthName} ${year} Newsletter`;
    const html = newsletter.html;

    if (isPreview) {
      const result = await sendEmail({
        to: MATT_EMAIL,
        subject: `[PREVIEW] ${subject} — auto-sends to clients tomorrow`,
        html,
      });

      return NextResponse.json({
        success: true,
        mode: "preview",
        month: `${monthName} ${year}`,
        subject,
        resendId: result.id,
      });
    } else {
      const result = await sendEmail({
        to: MATT_EMAIL,
        bcc: CLIENT_EMAILS,
        subject,
        html,
      });

      return NextResponse.json({
        success: true,
        mode: "send",
        month: `${monthName} ${year}`,
        subject,
        recipientCount: CLIENT_EMAILS.length + 1,
        resendId: result.id,
      });
    }
  } catch (error) {
    console.error("Monthly newsletter error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { key, subject, html } = body;

    if (!key || !html) {
      return NextResponse.json(
        { error: "Missing required fields: key, html" },
        { status: 400 }
      );
    }

    const stored = await redisSet(
      `monthly-newsletter:${key}`,
      { subject, html, storedAt: new Date().toISOString() },
      45 * 24 * 60 * 60
    );

    if (!stored) {
      throw new Error("Failed to store newsletter in Redis");
    }

    return NextResponse.json({
      success: true,
      key: `monthly-newsletter:${key}`,
      subject,
      message: `Newsletter stored. Preview sends on 24th, client send on 25th.`,
    });
  } catch (error) {
    console.error("Monthly newsletter POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
