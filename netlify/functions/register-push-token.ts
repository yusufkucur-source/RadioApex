import { createHash } from "node:crypto";
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
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
    })
  });
}

export default async function handler(request: Request) {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });
  try {
    const { token, platform } = (await request.json()) as { token?: string; platform?: string };
    if (!token || !token.startsWith("ExponentPushToken[")) {
      return Response.json({ error: "Invalid push token" }, { status: 400 });
    }
    const id = createHash("sha256").update(token).digest("hex");
    await getFirestore(getAdminApp()).collection("pushTokens").doc(id).set({
      token,
      platform: platform || "unknown",
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Push token registration error", error);
    return Response.json({ error: "Token could not be registered" }, { status: 500 });
  }
}
