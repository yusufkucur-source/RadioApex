import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  if (getApps().length) return getApps()[0];

  const serviceAccount =
    process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccount) {
    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(serviceAccount);
    } catch {
      parsed = JSON.parse(Buffer.from(serviceAccount, "base64").toString("utf8"));
    }
    return initializeApp({ credential: cert(parsed) });
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

type NotificationRequest = {
  title?: string;
  body?: string;
  screen?: string;
};

async function verifyFirebaseIdToken(idToken: string) {
  const apiKey = process.env.FIREBASE_WEB_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) throw new Error("FIREBASE_WEB_API_KEY is not configured");
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    }
  );
  if (!response.ok) throw new Error("Invalid Firebase ID token");
}

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let stage = "start";
  try {
    const authorization = request.headers.get("authorization");
    const idToken = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : null;
    if (!idToken) return Response.json({ error: "Unauthorized" }, { status: 401 });

    stage = "auth";
    const app = getAdminApp();
    await verifyFirebaseIdToken(idToken);
    const payload = (await request.json()) as NotificationRequest;
    const title = payload.title?.trim();
    const body = payload.body?.trim();
    if (!title || !body) {
      return Response.json({ error: "Title and body are required" }, { status: 400 });
    }

    stage = "firestore";
    const snapshot = await getFirestore(app).doc("pushTokens/registry").get();
    const tokens = [...new Set((snapshot.data()?.tokens || [])
      .filter((token: unknown): token is string => typeof token === "string" && token.length > 0))];
    if (!tokens.length) return Response.json({ sent: 0, message: "No registered devices" });

    const messages = tokens.map((to) => ({
      to,
      sound: "default",
      title,
      body,
      data: { screen: payload.screen || "home" },
    }));
    let sent = 0;
    for (let index = 0; index < messages.length; index += 100) {
      stage = "expo";
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messages.slice(index, index + 100)),
      });
      if (!response.ok) throw new Error(`Expo push service returned ${response.status}`);
      sent += messages.slice(index, index + 100).length;
    }

    return Response.json({ sent });
  } catch (error) {
    console.error("Push notification error", error);
    return Response.json({
      error: "Notification could not be sent",
      detail: `${stage}: ${error instanceof Error ? error.message : "Unknown server error"}`
    }, { status: 500 });
  }
}
