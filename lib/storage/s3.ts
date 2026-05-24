// =============================================================================
// Scaleway Object Storage (S3-compatible) — upload binaire
// =============================================================================

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

function getS3Client() {
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION ?? 'fr-par';
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
}

export function isS3Configured(): boolean {
  return Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY,
  );
}

/** Upload un fichier vers S3 et retourne l’URL publique. */
export async function uploadToS3(
  file: Buffer,
  contentType: string,
  folder: string,
): Promise<string> {
  const bucket = process.env.S3_BUCKET;
  const client = getS3Client();

  if (!bucket || !client) {
    throw new Error('Stockage S3 non configuré.');
  }

  const ext =
    contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
  const key = `${folder}/${randomUUID()}.${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read',
    }),
  );

  const endpoint = process.env.S3_ENDPOINT!.replace(/\/$/, '');
  return `${endpoint}/${bucket}/${key}`;
}
