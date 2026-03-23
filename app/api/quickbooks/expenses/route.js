import { NextResponse } from "next/server";

// ââ Upstash Redis helpers ââââââââââââââââââââââââââââââââââââ
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisGet(key) {
  try 
    const res = await fetch(`${REDIS_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    });
    const data = await res.json();
    return data.result;
  } catch {
    return null;
  }
}

async function redisSet(key, value) {
  try {
    await fetch(`${REDIS_URL}/set/${key}/${encodeURIComponent(value)}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    });
  } catch {}
}

// ââ Token management âââââââââââââââââââââââââââââââââââââââââ
async function getAccessToken() {
  const token = await redisGet("qb_access_token");
  return token || process.env.QB_ACCESS_TOKEN;
}

async function getRefreshToken() {
  const token = await redisGet("qb_refresh_token");
  return token || process.env.QB_REFRESH_TOKEN;
}

async function refreshTokens() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  const clientId = process.env.QB_CLIENT_ID;
  const clientSecret = process.env.QB_CLIENT_SECRET;
  if (!clientId || !clientSecret)
    throw new Error("Missing QB_CLIENT_ID or QB_CLIENT_SECRET");

  const res = await fetch(
    "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${err}`);
  }

  const tokens = await res.json();
  await Promise.all([
    redisSet("qb_access_token", tokens.access_token),
    redisSet("qb_refresh_token", tokens.refresh_token),
  ]);
  return tokens.access_token;
}

async function callQBApi(url, accessToken) {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
}

// ââ Helper: check if a group name is an expense group âââââââââ
function isExpenseGroup(groupName) {
  if (!groupName) return false;
  const lower = groupName.toLowerCase();
  return (
    lower === "expenses" ||
    lower === "expense" ||
    lower === "total expenses" ||
    lower === "total expense" ||
    lower.startsWith("expense")
  );
}

// ââ IRS Mileage Rate âââââââââââââââââââââââââââââââââââââââââ
const IRS_MILEAGE_RATE_2026 = 0.725; // 2026 standard rate (update annually)

// ââ Expense categories for personal training âââââââââââââââââ
const EXPENSE_CATEGORIES = {
  gas: [
    "Fuel",
    "Gas",
    "Gasoline",
    "Shell",
    "Chevron",
    "BP",
    "Exxon",
    "Wawa",
    "Costco Gas",
  ],
  vehicle: [
    "Car",
    "Auto",
    "Vehicle",
    "Oil Change",
    "Tire",
    "Maintenance",
    "Insurance - Auto",
  ],
  equipment: [
    "Equipment",
    "Weights",
    "Bands",
    "Mat",
    "Fitness",
    "Amazon",
    "Rogue",
  ],
  marketing: [
    "Marketing",
    "Advertising",
    "Meta",
    "Google Ads",
    "Canva",
    "Website",
    "Domain",
  ],
  insurance: ["Insurance", "Liability", "Policy"],
  software: [
    "Software",
    "Subscription",
    "Acuity",
    "QuickBooks",
    "Stripe Fee",
  ],
  other: [],
};

function categorizeExpense(name) {
  const lower = (name || "").toLowerCase();
  for (const [category, keywords] of Object.entries(EXPENSE_CATEGORIES)) {
    if (category === "other") continue;
    for (const keyword of keywords) {
      if (lower.includes(keyword.toLowerCase())) return category;
    }
  }
  return "other";
}

// ââ Main route âââââââââââââââââââââââââââââââââââââââââââââââ
export async function GET(request) {
  const realmId = process.env.QB_REALM_ID;
  if (!realmId) {
    return NextResponse.json(
      { error: "QuickBooks credentials not configured", connected: false },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "ytd";

    const now = new Date();
    let startDate, endDate;

    if (period === "month") {
      startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      endDate = now.toISOString().split("T")[0];
    } else {
      startDate = `${now.getFullYear()}-01-01`;
      endDate = now.toISOString().split("T")[0];
    }

    // Fetch P&L with expense detail
    const pnlUrl = `https://quickbooks.api.intuit.com/v3/company/${realmId}/reports/ProfitAndLoss?start_date=${startDate}&end_date=${endDate}&minorversion=65`;

    let accessToken = await getAccessToken();
    let res = await callQBApi(pnlUrl, accessToken);

    if (res.status === 401) {
      accessToken = await refreshTokens();
      res = await callQBApi(pnlUrl, accessToken);
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`QuickBooks API error: ${res.status} ${text}`);
    }

    const data = await res.json();
    const rows = data?.Rows?.Row || [];

    // Log raw group names for debugging
    const groupNames = rows.map((r) => r.group).filter(Boolean);
    console.log("QB Expenses route â group names found:", groupNames);

    // Parse expense rows
    const expenses = [];
    let totalExpenses = 0;
    let totalIncome = 0;

    for (const row of rows) {
      // Get total income â handle both "Income" and variants
      const groupLower = (row.group || "").toLowerCase();
      if (
        (groupLower === "income" || groupLower.startsWith("income")) &&
        row.Summary
      ) {
        const cols = row.Summary.ColData || [];
        if (cols[1]) totalIncome = parseFloat(cols[1].value) || 0;
      }

      // Parse expense detail rows â handle "Expenses", "Expense", etc.
      if (isExpenseGroup(row.group)) {
        if (row.Summary) {
          const cols = row.Summary.ColData || [];
          if (cols[1]) totalExpenses = parseFloat(cols[1].value) || 0;
        }

        // Get individual expense line items
        const subRows = row.Rows?.Row || [];
        for (const sub of subRows) {
          if (sub.ColData) {
            const name = sub.ColData[0]?.value || "Unknown";
            const amount = parseFloat(sub.ColData[1]?.value) || 0;
            if (amount > 0) {
              expenses.push({
                name,
                amount,
                category: categorizeExpense(name),
              });
            }
          }

          // Handle nested sub-rows (sub-categories)
          if (sub.Rows?.Row) {
            for (const nested of sub.Rows.Row) {
              if (nested.ColData) {
                const name = nested.ColData[0]?.value || "Unknown";
                const amount = parseFloat(nested.ColData[1]?.value) || 0;
                if (amount > 0) {
                  expenses.push({
                    name,
                    amount,
                    category: categorizeExpense(name),
                  });
                }
              }
              // Handle even deeper nesting (sub-sub-categories)
              if (nested.Rows?.Row) {
                for (const deep of nested.Rows.Row) {
                  if (deep.ColData) {
                    const name = deep.ColData[0]?.value || "Unknown";
                    const amount = parseFloat(deep.ColData[1]?.value) || 0;
                    if (amount > 0) {
                      expenses.push({
                        name,
                        amount,
                        category: categorizeExpense(name),
                      });
                    }
                  }
                }
              }
            }
          }

          // Handle sub-row that has its own Summary (sub-category total)
          if (sub.Summary && sub.Rows?.Row) {
            // Sub-rows already captured above, Summary is just the subtotal
          }
        }
      }
    }

    // If totalExpenses is still 0 but we found individual expenses, sum them
    if (totalExpenses === 0 && expenses.length > 0) {
      totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    }

    // Group by category
    const byCategory = {};
    for (const exp of expenses) {
      if (!byCategory[exp.category]) {
        byCategory[exp.category] = { total: 0, items: [] };
      }
      byCategory[exp.category].total += exp.amount;
      byCategory[exp.category].items.push(exp);
    }

    // Sort categories by total (descending)
    const sortedCategories = Object.entries(byCategory)
      .sort(([, a], [, b]) => b.total - a.total)
      .map(([category, data]) => ({
        category,
        total: Math.round(data.total * 100) / 100,
        items: data.items.sort((a, b) => b.amount - a.amount),
      }));

    // Mileage estimate (if gas expenses exist)
    const gasTotal = byCategory.gas?.total || 0;
    const estimatedGallons = gasTotal / 3.5; // avg gas price estimate
    const estimatedMiles = estimatedGallons * 25; // avg MPG estimate
    const mileageDeduction =
      Math.round(estimatedMiles * IRS_MILEAGE_RATE_2026 * 100) / 100;

    return NextResponse.json({
      connected: true,
      period: `${startDate} to ${endDate}`,
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netIncome: Math.round((totalIncome - totalExpenses) * 100) / 100,
      expensesByCategory: sortedCategories,
      mileageEstimate: {
        gasSpent: Math.round(gasTotal * 100) / 100,
        estimatedMiles: Math.round(estimatedMiles),
        irsRate: IRS_MILEAGE_RATE_2026,
        potentialDeduction: mileageDeduction,
        note: "Track actual miles for maximum deduction. This is an estimate based on gas spending.",
      },
      topExpenses: expenses.sort((a, b) => b.amount - a.amount).slice(0, 10),
      _debug: { groupNames },
    });
  } catch (err) {
    console.error("Expenses route error:", err.message);
    return NextResponse.json(
      { error: err.message, connected: false },
      { status: 500 }
    );
  }
}
