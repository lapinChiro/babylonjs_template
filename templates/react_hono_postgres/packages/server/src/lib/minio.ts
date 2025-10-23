import { Client } from "minio";
import path from "path";
import { randomUUID } from "crypto";

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "localhost";
const MINIO_EXTERNAL_ENDPOINT =
  process.env.MINIO_EXTERNAL_ENDPOINT || "localhost";
const MINIO_PORT = parseInt(process.env.MINIO_PORT || "9000");
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || "minioadmin";
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || "minioadmin123";
const MINIO_BUCKET = process.env.MINIO_BUCKET || "item-images";
const MINIO_UPLOAD_URL_EXPIRY = parseInt(
  process.env.MINIO_UPLOAD_URL_EXPIRY || "600"
);

// MinIO client for internal use
const minioClient = new Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: false,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Generate a presigned upload URL for MinIO
 */
export async function generateUploadUrl(
  filename: string,
  contentType: string,
  size: number
): Promise<{ uploadUrl: string; fileKey: string; expiresIn: number }> {
  // Validate content type
  if (!ALLOWED_MIME_TYPES.includes(contentType)) {
    throw new Error(
      `Invalid content type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`
    );
  }

  // Validate file size
  if (size > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`
    );
  }

  // Sanitize filename to prevent path traversal
  const sanitizedFilename = path.basename(filename);
  const ext = path.extname(sanitizedFilename);
  const fileKey = `${randomUUID()}${ext}`;

  // Generate presigned URL using external endpoint directly
  // This ensures the signature matches when the browser makes the request
  const externalClient = new Client({
    endPoint: MINIO_EXTERNAL_ENDPOINT,
    port: MINIO_PORT,
    useSSL: false,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
  });

  const uploadUrl = await externalClient.presignedPutObject(
    MINIO_BUCKET,
    fileKey,
    MINIO_UPLOAD_URL_EXPIRY
  );

  return {
    uploadUrl,
    fileKey,
    expiresIn: MINIO_UPLOAD_URL_EXPIRY,
  };
}

/**
 * Generate a presigned download URL for MinIO
 */
export async function generateDownloadUrl(fileKey: string): Promise<string> {
  // Use external endpoint directly for browser access
  const externalClient = new Client({
    endPoint: MINIO_EXTERNAL_ENDPOINT,
    port: MINIO_PORT,
    useSSL: false,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
  });

  const downloadUrl = await externalClient.presignedGetObject(
    MINIO_BUCKET,
    fileKey,
    3600
  );

  return downloadUrl;
}

/**
 * Get file metadata from MinIO
 */
export async function getFileMetadata(
  fileKey: string
): Promise<{ size: number; contentType: string }> {
  try {
    const stat = await minioClient.statObject(MINIO_BUCKET, fileKey);
    return {
      size: stat.size,
      contentType: stat.metaData?.["content-type"] || "application/octet-stream",
    };
  } catch (error) {
    throw new Error(`File not found: ${fileKey}`);
  }
}

/**
 * Delete a file from MinIO
 */
export async function deleteFile(fileKey: string): Promise<void> {
  try {
    await minioClient.removeObject(MINIO_BUCKET, fileKey);
  } catch (error) {
    throw new Error(`Failed to delete file: ${fileKey}`);
  }
}
