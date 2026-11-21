import { Storage } from "@google-cloud/storage";

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
 * Validates and uploads a file buffer to Google Cloud Storage with fallback
 */
export async function uploadImageToStorage(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<UploadResult> {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimes.includes(mimeType)) {
    throw new Error(`Invalid file type ${mimeType}. Only JPEG, PNG, and WebP are accepted.`);
  }

  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
  if (buffer.length > maxSizeBytes) {
    throw new Error(`File size ${(buffer.length / (1024 * 1024)).toFixed(2)}MB exceeds maximum 5MB limit.`);
  }

  // Sanitize filename
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

      // Construct public or storage URL
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

  // Graceful fallback: Base64 data URL for local environment / testing
  const base64Data = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  return {
    url: dataUrl,
    filename: uniqueFilename,
    sizeBytes: buffer.length,
    mimeType,
  };
}
