import { NextResponse } from "next/server";

// âââ CONFIG ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const FROM_EMAIL = "Forged Home Fitness <noreply@forgedhomefitness.com>";
const MATT_EMAIL = "forgedhomefitness@gmail.com";
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Same client list as weekly newsletter â single source of truth
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

// âââ REDIS HELPERS ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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

// âââ GET MONTH NAME âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function getTargetMonth() {
  // Cron runs on 24th/25th â newsletter is for the NEXT month
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthName = next.toLocaleString("en-US", { month: "long" });
  const year = next.getFullYear();
  const key = `${year}-${String(next.getMonth() + 1).padStart(2, "0")}`;
  return { monthName, year, key };
}

// âââ SEND EMAIL VIA RESEND ââââââââââââââââââââââââââââââââââââââââââââââââââ
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

// âââ BUILD PREVIEW WRAPPER HTML ââââââââââââââââââââââââââââââââââââââââââââââ
function buildPreviewWrapper(newsletterHtml, monthName, year) {
  const clientEmailList = CLIENT_EMAILS.map((email) => `<li>${email}</li>`).join("");
  const timestamp = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="background-color: #f5f5f5; border-left: 4px solid #001F3F; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
        <h2 style="margin: 0 0 15px 0; color: #001F3F; font-size: 18px;">ð NEWSLETTER REVIEW â Action Required</h2>
        <p style="margin: 0 0 10px 0;"><strong>Month:</strong> ${monthName} ${year}</p>
        <p style="margin: 0 0 10px 0;"><strong>Preview Generated:</strong> ${timestamp}</p>

        <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #001F3F;">ð¤ This will send to:</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            ${clientEmailList}
            <li style="font-weight: bold; color: #001F3F;">forgedhomefitness@gmail.com (you, as TO)</li>
          </ul>
          <p style="margin: 10px 0 0 0; font-size: 13px; color: #666;">Total: ${CLIENT_EMAILS.length} clients + you</p>
        </div>

        <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #001F3F;">â To Approve & Send:</p>
          <p style="margin: 10px 0; font-size: 14px;">Reply to this email with the word <strong>send</strong></p>
          <p style="margin: 10px 0 0 0; font-size: 13px; color: #666;">Or message in Claude Cowork to request changes.</p>
        </div>
      </div>

      <div style="background-color: white; border: 1px solid #ddd; border-radius: 4px; padding: 30px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 20px 0; color: #001F3F; text-align: center; font-size: 20px;">ð¨ Newsletter Preview</h3>
        <div style="border-top: 1px solid #ddd; padding-top: 20px;">
          ${newsletterHtml}
        </div>
      </div>

      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; font-size: 12px; color: #666;">
        <p style="margin: 0;">This is a preview only. The newsletter will NOT send to clients until you approve it.</p>
      </div>
    </div>
  `;
}

// âââ BUILD SEND APPROVAL REMINDER HTML âââââââââââââââââââââââââââââââââââââââ
function buildSendApprovalReminder(newsletterHtml, monthName, year) {
  const clientEmailList = CLIENT_EMAILS.map((email) => `<li>${email}</li>`).join("");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="background-color: #fff3cd; border-left: 4px solid #FED402; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
        <h2 style="margin: 0 0 15px 0; color: #856404; font-size: 18px;">â° Final Approval Reminder</h2>
        <p style="margin: 0 0 10px 0;"><strong>Month:</strong> ${monthName} ${year}</p>

        <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #001F3F;">ð¤ Ready to send to:</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            ${clientEmailList}
            <li style="font-weight: bold; color: #001F3F;">forgedhomefitness@gmail.com (you, as TO)</li>
          </ul>
          <p style="margin: 10px 0 0 0; font-size: 13px; color: #666;">Total: ${CLIENT_EMAILS.length} clients + you</p>
        </div>

        <div style="background-color: #e7f3ff; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 3px solid #001F3F;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #001F3F;">ð Ready to go live?</p>
          <p style="margin: 10px 0 0 0; font-size: 14px;">Reply <strong>send</strong> or it will NOT send to clients.</p>
          <p style="margin: 10px 0 0 0; font-size: 13px; color: #666;">Message in Claude Cowork if you want to make changes.</p>
        </div>
      </div>

      <div style="background-color: white; border: 1px solid #ddd; border-radius: 4px; padding: 30px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 20px 0; color: #001F3F; text-align: center; font-size: 20px;">ð¨ Newsletter (Ready to Send)</h3>
        <div style="border-top: 1px solid #ddd; padding-top: 20px;">
          ${newsletterHtml}
        </div>
      </div>

      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; font-size: 12px; color: #666;">
        <p style="margin: 0;">This is your final approval gate. Reply <strong>send</strong> within this email to go live, or message in Claude Cowork with any changes.</p>
      </div>
    </div>
  `;
}

// âââ GET HANDLER: Preview (24th), Reminder (25th), or Approve (manual) âââââââ
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode"); // "preview", "send", or "approve"
  const isPreview = mode === "preview";
  const isSend = mode === "send";
  const isApprove = mode === "approve";

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

    const { monthName, year, key } = getTargetMonth();

    // Get newsletter from Redis (stored by Claude scheduled task on 23rd)
    const newsletter = await redisGet(`monthly-newsletter:${key}`);
    if (!newsletter || !newsletter.html) {
      throw new Error(
        `No monthly newsletter found in Redis for ${key}. The scheduled task should store it by the 23rd.`
      );
    }

    const subject = newsletter.subject || `Forged Home Fitness â ${monthName} ${year} Newsletter`;
    const html = newsletter.html;

    if (isPreview) {
      // 24th â PREVIEW mode: Send Matt a review wrapper with newsletter content
      const previewHtml = buildPreviewWrapper(html, monthName, year);
      const result = await sendEmail({
        to: MATT_EMAIL,
        subject: `[REVIEW] ${subject} â Approve or Request Changes`,
        html: previewHtml,
      });

      return NextResponse.json({
        success: true,
        mode: "preview",
        month: `${monthName} ${year}`,
        subject,
        message: "Preview sent to Matt with review wrapper. Awaiting approval.",
        resendId: result.id,
      });
    } else if (isSend) {
      // 25th â SEND mode: Send Matt a final reminder (NOT auto-send to clients)
      const reminderHtml = buildSendApprovalReminder(html, monthName, year);
      const result = await sendEmail({
        to: MATT_EMAIL,
        subject: `[ACTION] ${subject} â Final Approval Required to Send to Clients`,
        html: reminderHtml,
      });

      return NextResponse.json({
        success: true,
        mode: "send",
        month: `${monthName} ${year}`,
        subject,
        message: "Final approval reminder sent to Matt. Newsletter will NOT send until approved.",
        resendId: result.id,
      });
    } else if (isApprove) {
      // APPROVE mode: Actually send the newsletter to Matt + BCC all clients
      const result = await sendEmail({
        to: MATT_EMAIL,
        bcc: CLIENT_EMAILS,
        subject,
        html,
      });

      return NextResponse.json({
        success: true,
        mode: "approve",
        month: `${monthName} ${year}`,
        subject,
        recipientCount: CLIENT_EMAILS.length + 1,
        message: `Newsletter sent to Matt + ${CLIENT_EMAILS.length} clients`,
        resendId: result.id,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid mode. Use 'preview', 'send', or 'approve'." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Monthly newsletter error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// âââ POST HANDLER: Store newsletter in Redis (called by Claude scheduled task)
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

    // Store for 45 days (plenty of buffer)
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
      message: `Newsletter stored. Preview sends on 24th (with review wrapper), reminder on 25th (awaiting approval). Use ?mode=approve to send.`,
    });
  } catch (error) {
    console.error("Monthly newsletter POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
