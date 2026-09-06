import type { Config } from "@netlify/functions";

export const config: Config = {
  schedule: "* * * * *"
};

export default async function handler() {
  const siteUrl =
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    process.env.DEPLOY_URL ||
    "https://radioapex.com.tr";

  const response = await fetch(`${siteUrl.replace(/\/$/, "")}/api/now-playing`, {
    cache: "no-store"
  });

  if (!response.ok) {
    return new Response(
      JSON.stringify({
        ok: false,
        status: response.status
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 502
      }
    );
  }

  const payload = await response.json();

  return new Response(
    JSON.stringify({
      ok: true,
      historyCount: Array.isArray(payload?.songHistory)
        ? payload.songHistory.length
        : 0,
      title: typeof payload?.title === "string" ? payload.title : ""
    }),
    {
      headers: { "Content-Type": "application/json" }
    }
  );
}
