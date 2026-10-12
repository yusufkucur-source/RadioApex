const { randomUUID } = require('crypto');
const { applicationDefault, initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const sharp = require('sharp');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS to a Firebase service account JSON file.');
}

initializeApp({ credential: applicationDefault() });
const apply = process.argv.includes('--apply');

function storageBucketFromUrl(value) {
  const url = new URL(value);
  const match = url.pathname.match(/^\/v0\/b\/([^/]+)\/o\//);
  if (url.host !== 'firebasestorage.googleapis.com' || !match) {
    throw new Error('DJ photo is not a Firebase Storage download URL.');
  }
  return decodeURIComponent(match[1]);
}

async function saveVariant(bucket, path, bytes) {
  const token = randomUUID();
  await bucket.file(path).save(bytes, {
    contentType: 'image/webp',
    metadata: {
      cacheControl: 'public, max-age=31536000, immutable',
      metadata: { firebaseStorageDownloadTokens: token }
    }
  });
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

async function main() {
  const snapshot = await getFirestore().collection('djs').get();
  let originalBytes = 0;
  let cardBytes = 0;
  let avatarBytes = 0;
  let processed = 0;
  let skipped = 0;
  const failures = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.photoUrl || (data.photoCardUrl && data.photoAvatarUrl)) {
      skipped += 1;
      continue;
    }
    try {
      const bucket = getStorage().bucket(storageBucketFromUrl(data.photoUrl));
      const response = await fetch(data.photoUrl, { signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error(`Download failed: ${response.status}`);
      const source = Buffer.from(await response.arrayBuffer());
      const [card, avatar] = await Promise.all([
        sharp(source).rotate().resize({ width: 960, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toBuffer(),
        sharp(source).rotate().resize({ width: 256, withoutEnlargement: true }).webp({ quality: 76, effort: 5 }).toBuffer()
      ]);
      if (apply) {
        const base = `djs/${doc.id}/optimized-${Date.now()}-${randomUUID().slice(0, 8)}`;
        const [photoCardUrl, photoAvatarUrl] = await Promise.all([
          saveVariant(bucket, `${base}-card.webp`, card),
          saveVariant(bucket, `${base}-avatar.webp`, avatar)
        ]);
        await doc.ref.update({ photoCardUrl, photoAvatarUrl, photoOptimizedAt: new Date() });
      }
      originalBytes += source.length;
      cardBytes += card.length;
      avatarBytes += avatar.length;
      processed += 1;
      console.log(`${data.nickname || doc.id}: ${(source.length / 1024).toFixed(0)} KB -> ${(card.length / 1024).toFixed(0)} KB card, ${(avatar.length / 1024).toFixed(0)} KB avatar`);
    } catch (error) {
      failures.push(`${data.nickname || doc.id}: ${error.message}`);
    }
  }

  console.log(`${apply ? 'Applied' : 'Preview'}: ${processed} optimized, ${skipped} skipped, ${failures.length} failed`);
  console.log(`Totals: ${(originalBytes / 1048576).toFixed(2)} MB original -> ${(cardBytes / 1048576).toFixed(2)} MB cards + ${(avatarBytes / 1048576).toFixed(2)} MB avatars`);
  failures.forEach((failure) => console.error(failure));
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
