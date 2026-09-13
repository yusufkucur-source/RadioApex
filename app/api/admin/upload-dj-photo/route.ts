import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ServiceAccount = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

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

function initializeAdmin(account: ServiceAccount, storageBucket: string) {
  if (!getApps().length) {
    if (!account.project_id || !account.client_email || !account.private_key) {
      throw new Error("Firebase Admin credentials are incomplete.");
    }
    initializeApp({
      credential: cert({
        projectId: account.project_id,
        clientEmail: account.client_email,
        privateKey: account.private_key
      }),
      storageBucket
    });
  }
}

function bucketCandidates(configuredBucket: string, projectId?: string) {
  return Array.from(new Set([
    configuredBucket,
    configuredBucket.endsWith(".firebasestorage.app")
      ? configuredBucket.replace(".firebasestorage.app", ".appspot.com")
      : null,
    projectId ? `${projectId}.appspot.com` : null,
    projectId ? `${projectId}.firebasestorage.app` : null
  ].filter(Boolean) as string[]));
}

async function resolveBucketName(configuredBucket: string, projectId?: string) {
  for (const candidate of bucketCandidates(configuredBucket, projectId)) {
    const [exists] = await getStorage().bucket(candidate).exists();
    if (exists) return candidate;
  }
  throw new Error(`Storage bucket bulunamadı. Firebase Console'da Storage'ın kurulu olduğundan emin ol.`);
}

async function verifyAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  await getAuth().verifyIdToken(token);
  return true;
}

function safeFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "") || "photo";
}

function extensionFrom(contentType: string, name: string) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  const match = name.match(/\.([a-z0-9]{3,4})$/i);
  return match?.[1]?.toLowerCase() || "jpg";
}

export async function POST(request: NextRequest) {
  const account = getServiceAccount();
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (!account || !storageBucket) {
    return NextResponse.json({ error: "Firebase Admin or Storage bucket is not configured." }, { status: 503 });
  }

  try {
    initializeAdmin(account, storageBucket);
    if (!(await verifyAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const djId = String(formData.get("djId") || "").replace(/[^a-zA-Z0-9_-]/g, "");

    if (!(file instanceof File) || !djId) {
      return NextResponse.json({ error: "Fotoğraf dosyası veya DJ ID eksik." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Sadece resim dosyası yüklenebilir." }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Fotoğraf en fazla 5 MB olabilir." }, { status: 400 });
    }

    const bucketName = await resolveBucketName(storageBucket, account.project_id);
    const buffer = Buffer.from(await file.arrayBuffer());
    const token = randomUUID();
    const extension = extensionFrom(file.type, file.name);
    const path = `djs/${djId}/uploaded-${Date.now()}-${safeFileName(file.name).replace(/\.[a-z0-9]{3,4}$/i, "")}.${extension}`;
    const bucketFile = getStorage().bucket(bucketName).file(path);

    await bucketFile.save(buffer, {
      contentType: file.type,
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: token,
          originalFileName: file.name
        }
      }
    });

    const photoUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
    return NextResponse.json({ photoUrl, path });
  } catch (error) {
    console.error("DJ photo upload error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fotoğraf yüklenemedi." },
      { status: 500 }
    );
  }
}
