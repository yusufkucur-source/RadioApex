import { createSign } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ServiceAccount = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
  token_uri?: string;
};

type AnalyticsSnapshot = {
  realtimeActiveUsers: number;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  timeline: Array<{ date: string; activeUsers: number; sessions: number }>;
  countries: Array<{ label: string; value: number }>;
  devices: Array<{ label: string; value: number }>;
  channels: Array<{ label: string; value: number }>;
  pages: Array<{ label: string; value: number }>;
  generatedAt: string;
};

let cache: { value: AnalyticsSnapshot; expiresAt: number } | null = null;

function getServiceAccount(): ServiceAccount | null {
  const json = process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (json) {
    try {
      return JSON.parse(json) as ServiceAccount;
    } catch {
      return null;
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  return projectId && clientEmail && privateKey
    ? { project_id: projectId, client_email: clientEmail, private_key: privateKey }
    : null;
}

function encode(value: object) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

async function getAccessToken(account: ServiceAccount) {
  if (!account.client_email || !account.private_key) {
    throw new Error("Service account credentials are incomplete.");
  }

  const now = Math.floor(Date.now() / 1000);
  const unsignedToken = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
    iss: account.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: account.token_uri || "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  })}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const assertion = `${unsignedToken}.${signer.sign(account.private_key, "base64url")}`;
  const response = await fetch(account.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    }),
    cache: "no-store"
  });
  const payload = (await response.json()) as { access_token?: string; error_description?: string };
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || "Google access token could not be created.");
  }
  return payload.access_token;
}

async function verifyAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return false;

  // Firebase Admin SDK, Netlify'nin serverless bundle'ında başlangıç hatası
  // verebildiği için oturumu Firebase'in kendi Identity Toolkit endpoint'iyle
  // doğruluyoruz. İstemcinin zaten kullandığı web API anahtarı bu istek için
  // gereklidir; token geçersizse endpoint kullanıcı döndürmez.
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return false;
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
      cache: "no-store"
    }
  );
  if (!response.ok) return false;
  const payload = (await response.json()) as { users?: unknown[] };
  return Array.isArray(payload.users) && payload.users.length > 0;
}

function numberAt(row: { metricValues?: Array<{ value?: string }> } | undefined, index: number) {
  return Number(row?.metricValues?.[index]?.value || 0);
}

type ReportRow = {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
};

async function runReport(accessToken: string, propertyId: string, dimension: string, metric: string, limit = 6) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: "6daysAgo", endDate: "today" }],
        dimensions: [{ name: dimension }],
        metrics: [{ name: metric }],
        limit,
        orderBys: [{ metric: { metricName: metric }, desc: true }]
      }),
      cache: "no-store"
    }
  );
  const payload = (await response.json()) as { error?: { message?: string }; rows?: ReportRow[] };
  if (!response.ok) throw new Error(payload.error?.message || "GA4 report could not be loaded.");
  return (payload.rows || []).map((row) => ({
    label: row.dimensionValues?.[0]?.value || "Bilinmiyor",
    value: numberAt(row, 0)
  }));
}

async function runRealtimeReport(accessToken: string, propertyId: string) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ metrics: [{ name: "activeUsers" }] }),
      cache: "no-store"
    }
  );
  const payload = (await response.json()) as { error?: { message?: string }; rows?: ReportRow[] };
  if (!response.ok) throw new Error(payload.error?.message || "GA4 realtime report could not be loaded.");
  return numberAt(payload.rows?.[0], 0);
}

export async function GET(request: NextRequest) {
  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
  const account = getServiceAccount();
  if (!propertyId || !/^\d+$/.test(propertyId) || !account) {
    return NextResponse.json(
      { error: "GA4 reporting is not configured.", code: "SETUP_REQUIRED" },
      { status: 503 }
    );
  }

  try {
    if (!(await verifyAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (cache && cache.expiresAt > Date.now()) {
    return NextResponse.json(cache.value);
  }

  try {
    const accessToken = await getAccessToken(account);
    const reportResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: "6daysAgo", endDate: "today" }],
          dimensions: [{ name: "date" }],
          metrics: [
            { name: "activeUsers" },
            { name: "newUsers" },
            { name: "sessions" },
            { name: "screenPageViews" }
          ],
          orderBys: [{ dimension: { dimensionName: "date" } }]
        }),
        cache: "no-store"
      }
    );
    const report = (await reportResponse.json()) as {
      error?: { message?: string };
      rows?: Array<{ dimensionValues?: Array<{ value?: string }>; metricValues?: Array<{ value?: string }> }>;
    };
    if (!reportResponse.ok) throw new Error(report.error?.message || "GA4 report could not be loaded.");

    const rows = report.rows || [];
    const [realtimeActiveUsers, countries, devices, channels, pages] = await Promise.all([
      runRealtimeReport(accessToken, propertyId),
      runReport(accessToken, propertyId, "country", "activeUsers"),
      runReport(accessToken, propertyId, "deviceCategory", "activeUsers", 3),
      runReport(accessToken, propertyId, "sessionDefaultChannelGroup", "sessions"),
      runReport(accessToken, propertyId, "pagePath", "screenPageViews")
    ]);
    const snapshot: AnalyticsSnapshot = {
      realtimeActiveUsers,
      activeUsers: rows.reduce((total, row) => total + numberAt(row, 0), 0),
      newUsers: rows.reduce((total, row) => total + numberAt(row, 1), 0),
      sessions: rows.reduce((total, row) => total + numberAt(row, 2), 0),
      pageViews: rows.reduce((total, row) => total + numberAt(row, 3), 0),
      timeline: rows.map((row) => ({
        date: row.dimensionValues?.[0]?.value || "",
        activeUsers: numberAt(row, 0),
        sessions: numberAt(row, 2)
      })),
      countries,
      devices,
      channels,
      pages,
      generatedAt: new Date().toISOString()
    };
    cache = { value: snapshot, expiresAt: Date.now() + 60 * 1000 };
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("GA4 report error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "GA4 report could not be loaded." },
      { status: 502 }
    );
  }
}
