import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ServiceAccount = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

type DjDoc = {
  photoUrl?: string;
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
  throw new Error("Storage bucket bulunamadı. Firebase Console'da Storage'ın kurulu olduğundan emin ol.");
}

async function verifyAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  await getAuth().verifyIdToken(token);
  return true;
}

function isStorageUrl(url: string, bucket: string) {
  return url.includes("firebasestorage.googleapis.com") || url.includes("storage.googleapis.com") || url.includes(bucket);
}

function extensionFrom(contentType: string | null, url: string) {
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("webp")) return "webp";
  if (contentType?.includes("gif")) return "gif";
  const match = url.split("?")[0].match(/\.([a-z0-9]{3,4})$/i);
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

  const bucketName = await resolveBucketName(storageBucket, account.project_id);
  const db = getFirestore();
  const bucket = getStorage().bucket(bucketName);
  const snapshot = await db.collection("djs").get();
  let migrated = 0;
  let skipped = 0;
  const failed: string[] = [];

  for (const dj of snapshot.docs) {
    const data = dj.data() as DjDoc;
    const photoUrl = data.photoUrl?.trim();
    if (!photoUrl || isStorageUrl(photoUrl, bucketName)) {
      skipped += 1;
      continue;
    }

    try {
      const response = await fetch(photoUrl, { cache: "no-store" });
      const contentType = response.headers.get("content-type") || "image/jpeg";
      if (!response.ok || !contentType.startsWith("image/")) {
        throw new Error("Source image could not be downloaded.");
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length > 8 * 1024 * 1024) {
        throw new Error("Source image is larger than 8 MB.");
      }

      const token = randomUUID();
      const extension = extensionFrom(contentType, photoUrl);
      const path = `djs/${dj.id}/migrated-${Date.now()}.${extension}`;
      const file = bucket.file(path);
      await file.save(buffer, {
        contentType,
        metadata: {
          metadata: {
            firebaseStorageDownloadTokens: token,
            originalPhotoUrl: photoUrl
          }
        }
      });

      const nextUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
      await dj.ref.update({ photoUrl: nextUrl, photoMigratedAt: new Date() });
      migrated += 1;
    } catch {
      failed.push(dj.id);
    }
  }

  return NextResponse.json({ migrated, skipped, failed, failedCount: failed.length });
}
