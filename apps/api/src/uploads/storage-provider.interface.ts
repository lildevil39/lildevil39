export interface StorageProvider {
  readonly key: "local" | "s3" | "cloudinary" | "supabase";

  /** Client PUTs the file bytes directly to `uploadUrl`; the DB stores metadata + key only. */
  getUploadUrl(input: {
    key: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<{ uploadUrl: string }>;

  getSignedReadUrl(key: string, expiresInSec?: number): Promise<string>;

  delete(key: string): Promise<void>;

  copy(sourceKey: string, destKey: string): Promise<void>;
}

export const STORAGE_PROVIDER_TOKEN = "STORAGE_PROVIDER_TOKEN";
