import { NextResponse } from "next/server";

// ââ Upstash Redis helpers (shared with main QB route) ââââââââââ
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisGet(key) {
  try {
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
  } catch {
    // silent fail
  }
}

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
  if (!clientId || !clientSecret) throw new Error("Missing QB credentials");

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

function isIncomeGroup(groupName) {
  if (!groupName) return false;
  const lower = groupName.toLowerCase();
  return (
    lower === "income" ||
    lower === "total income" ||
    lower === "revenue" ||
    lower === "total revenue" ||
    lower.startsWith("income")
  );
}

// ââ Parse QB P&L report with monthly columns âââââââââââââââââ
function parseMonthlyPnL(data) {
  const columns = data?.Columns?.Column || [];
  const rows = data?.Rows?.Row || [];

  // Log raw group names for debugging
  const groupNames = rows.map((r) => r.group).filter(Boolean);
  console.log("QB P&L group names found:", groupNames);

  const monthLabels = columns
    .slice(1)
    .filter((c) => c.ColTitle && c.ColTitle !== "Total")
    .map((c) => c.ColTitle);

  const months = monthLabels.map((label) => ({
    label,
    income: 0,
    expenses: 0,
    netIncome: 0,
  }));

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const row of rows) {
    if (row.Summary) {
      const cols = row.Summary.ColData || [];

      if (isIncomeGroup(row.group)) {
        for (let i = 1; i < cols.length; i++) {
          const val = parseFloat(cols[i].value) || 0;
          if (i - 1 < months.length) {
            months[i - 1].income = val;
          } else {
            totalIncome = val;
          }
        }
      }

      if (isExpenseGroup(row.group)) {
        for (let i = 1; i < cols.length; i++) {
          const val = parseFloat(cols[i].value) || 0;
          if (i - 1 < months.length) {
            months[i - 1].expenses = val;
          } else {
            totalExpenses = val;
          }
        }
      }
    }

    // Also check for nested rows within expense groups that have
    // their own Summary (sub-categories like "Auto", "Gas", etc.)
    if (isExpenseGroup(row.group) && row.Rows?.Row) {
      for (const sub of row.Rows.Row) {
        if (sub.Summary) {
          const subCols = sub.Summary.ColData || [];
          for (let i = 1; i < subCols.length; i++) {
            const val = parseFloat(subCols[i].value) || 0;
            // Sub-row values are already included in parent Summary,
            // so we only need this if parent Summary was missing
          }
        }
      }
    }
  }

  // If we still have no expenses from Summary rows, try to sum from
  // individual sub-rows (fallback for unusual QB report structures)
  if (totalExpenses === 0 && months.every((m) => m.expenses === 0)) {
    console.log("QB P&L: No expenses found in Summary rows, trying sub-rows...");
    for (const row of rows) {
      if (isExpenseGroup(row.group) && row.Rows?.Row) {
        for (const sub of row.Rows.Row) {
          // Direct ColData rows (leaf expense items)
          if (sub.ColData) {
            for (let i = 1; i < sub.ColData.length; i++) {
              const val = parseFloat(sub.ColData[i].value) || 0;
              if (i - 1 < months.length) {
                months[i - 1].expenses += val;
              } else {
                totalExpenses += val;
              }
            }
          }
          // Nested sub-category rows
          if (sub.Rows?.Row) {
            for (const nested of sub.Rows.Row) {
              if (nested.ColData) {
                for (let i = 1; i < nested.ColData.length; i++) {
                  const val = parseFloat(nested.ColData[i].value) || 0;
                  if (i - 1 < months.length) {
                    months[i - 1].expenses += val;
                  } else {
                    totalExpenses += val;
                  }
                }
              }
            }
          }
          // Sub-row with its own Summary
          if (sub.Summary) {
            const subCols = sub.Summary.ColData || [];
            for (let i = 1; i < subCols.length; i++) {
              const val = parseFloat(subCols[i].value) || 0;
              if (i - 1 < months.length) {
                months[i - 1].expenses += val;
              } else {
                totalExpenses += val;
              }
            }
          }
        }
      }
    }
  }

  for (const m of months) {
    m.netIncome = m.income - m.expenses;
  }

  if (totalIncome === 0) {
    totalIncome = months.reduce((s, m) => s + m.income, 0);
  }
  if (totalExpenses === 0) {
    totalExpenses = months.reduce((s, m) => s + m.expenses, 0);
  }

  return {
    months,
    totalIncome,
    totalExpenses,
    netIncome: totalIncome - totalExpenses,
    _debug: { groupNames },
  };
}

// ââ Main route â YTD P&L with monthly breakdown ââââââââââââââ
export async function GET() {
  const realmId = process.env.QB_REALM_ID;
  if (!realmId) {
    return NextResponse.json(
      { error: "QuickBooks not configured", connected: false },
      { status: 503 }
    );
  }

  try {
    const now = new Date();
    const startDate = `${now.getFullYear()}-01-01`;
    const endDate = now.toISOString().split("T")[0];

    const url = `https://quickbooks.api.intuit.com/v3/company/${realmId}/reports/ProfitAndLoss?start_date=${startDate}&end_date=${endDate}&summarize_column_by=Month&minorversion=65`;

    let accessToken = await getAccessToken();
    let res = await callQBApi(url, accessToken);

    if (res.status === 401) {
      console.log("QB token expired, auto-refreshing...");
      accessToken = await refreshTokens();
      res = await callQBApi(url, accessToken);
    }

    if (!res.ok) {
      const text = await res.text();
      console.error("QB P&L error:", res.status, text);
      return NextResponse.json(
        { error: `QuickBooks API error: ${res.status}`, connected: false },
        { status: res.status }
      );
    }

    const data = await res.json();
    const parsed = parseMonthlyPnL(data);
    const TAX_RATE = 0.3;

    return NextResponse.json({
      connected: true,
      period: `${startDate} to ${endDate}`,
      ...parsed,
      taxReserve: {
        onGross: Math.round(parsed.totalIncome * TAX_RATE * 100) / 100,
        onNet: Math.round(parsed.netIncome * TAX_RATE * 100) / 100,
        rate: TAX_RATE,
      },
    });
  } catch (err) {
    console.error("QB P&L route error:", err.message);
    return NextResponse.json(
      { error: err.message, connected: false },
      { status: 500 }
    );
  }
}
