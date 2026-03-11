import { NextResponse } from "next/server";

export async function GET() {
  if (!process.env.QB_ACCESS_TOKEN || !process.env.QB_REALM_ID) {
    return NextResponse.json(
      { error: "QuickBooks credentials not configured", connected: false },
      { status: 503 }
    );
  }

  try {
    const realmId = process.env.QB_REALM_ID;
    const now = new Date();
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const endDate = now.toISOString().split("T")[0];

    const url =
      `https://quickbooks.api.intuit.com/v3/company/${realmId}/reports/ProfitAndLoss` +
      `?start_date=${startDate}&end_date=${endDate}&minorversion=65`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.QB_ACCESS_TOKEN}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const status = res.status;
      if (status === 401) {
        throw new Error(
          "QuickBooks token expired. Please refresh your access token at developer.intuit.com and update the QB_ACCESS_TOKEN environment variable."
        );
      }
      throw new Error(`QuickBooks API error: ${status}`);
    }

    const data = await res.json();

    // Parse P&L report for key figures
    let totalIncome = 0;
    let totalExpenses = 0;
    let netIncome = 0;

    const rows = data?.Rows?.Row || [];
    for (const row of rows) {
      if (row.group === "Income" && row.Summary?.ColData?.[1]?.value) {
        totalIncome = parseFloat(row.Summary.ColData[1].value) || 0;
      }
      if (row.group === "Expenses" && row.Summary?.ColData?.[1]?.value) {
        totalExpenses = parseFloat(row.Summary.ColData[1].value) || 0;
      }
      if (row.type === "Section" && row.group === "NetIncome") {
        netIncome = parseFloat(row.Summary?.ColData?.[1]?.value) || 0;
      }
    }

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      netIncome,
      period: `${startDate} to ${endDate}`,
      lastFetched: new Date().toISOString(),
      connected: true,
    });
  } catch (error) {
    console.error("QuickBooks API error:", error.message);
    return NextResponse.json(
      { error: error.message, connected: false },
      { status: 500 }
    );
  }
}
