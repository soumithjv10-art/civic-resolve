import { Storage } from "@google-cloud/storage";
import { MAX_FILE_SIZE_BYTES, ALLOWED_IMAGE_MIMES } from "./constants";

/**
 * Singleton instance of Google Cloud Storage client.
 */
let storageClient: Storage | null = null;

function getStorageClient(): Storage | null {
  if (!storageClient) {
    try {
      const projectId = process.env.GOOGLE_CLOUD_PROJECT;
      if (!projectId || projectId.includes("placeholder")) return null;
      storageClient = new Storage({ projectId });
    } catch (err) {
      console.warn("Storage client initialization skipped:", err);
      return null;
    }
  }
  return storageClient;
}

export interface UploadResult {
  url: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
}

/**
 * Validates and uploads a file buffer to Google Cloud Storage with resilient fallback.
 *
 * @param buffer - Binary buffer of the uploaded image
 * @param originalFilename - Original filename uploaded by user
 * @param mimeType - MIME type string (must be JPEG, PNG, or WebP)
 * @returns Upload result containing storage URL and metadata
 */
export async function uploadImageToStorage(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<UploadResult> {
  const allowed = (ALLOWED_IMAGE_MIMES as readonly string[]).includes(mimeType);
  if (!allowed) {
    throw new Error(`Invalid file type ${mimeType}. Only JPEG, PNG, and WebP are accepted.`);
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File size ${(buffer.length / (1024 * 1024)).toFixed(2)}MB exceeds maximum 5MB limit.`
    );
  }

  // Sanitize filename to prevent directory traversal or invalid character issues
  const sanitizedName = originalFilename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .toLowerCase();
  const timestamp = Date.now();
  const uniqueFilename = `complaints/${timestamp}-${sanitizedName}`;

  const bucketName = process.env.GCS_BUCKET_NAME;
  const storage = getStorageClient();

  if (storage && bucketName && !bucketName.includes("placeholder")) {
    try {
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(uniqueFilename);

      await file.save(buffer, {
        metadata: { contentType: mimeType },
        resumable: false,
      });

      const publicUrl = `https://storage.googleapis.com/${bucketName}/${uniqueFilename}`;
      return {
        url: publicUrl,
        filename: uniqueFilename,
        sizeBytes: buffer.length,
        mimeType,
      };
    } catch (err) {
      console.warn("GCS upload failed, falling back to embedded data URL:", err);
    }
  }

  // Graceful fallback: Base64 data URL for local development / testing
  const base64Data = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  return {
    url: dataUrl,
    filename: uniqueFilename,
    sizeBytes: buffer.length,
    mimeType,
  };
}
