import { Injectable } from "@nestjs/common";
import { mkdir, copyFile, rm } from "node:fs/promises";
import { join } from "node:path";
import type { StorageProvider } from "../storage-provider.interface.js";

/**
 * Dev-only disk adapter. Real "signed URLs" aren't needed locally — the API
 * just serves ./.storage as static files — this stub documents the shape
 * a real S3/Cloudinary/Supabase adapter must match.
 */
@Injectable()
export class LocalStorageProvider implements StorageProvider {
  readonly key = "local" as const;
  private readonly root = process.env.STORAGE_LOCAL_DIR ?? "./.storage";

  async getUploadUrl(input: { key: string }): Promise<{ uploadUrl: string }> {
    await mkdir(this.root, { recursive: true });
    // TODO: expose a dedicated PUT endpoint in this API that writes to `join(this.root, input.key)`.
    return { uploadUrl: `${process.env.API_URL ?? "http://localhost:3000"}/api/v1/uploads/local/${input.key}` };
  }

  async getSignedReadUrl(key: string): Promise<string> {
    return `${process.env.API_URL ?? "http://localhost:3000"}/uploads/${key}`;
  }

  async delete(key: string): Promise<void> {
    await rm(join(this.root, key), { force: true });
  }

  async copy(sourceKey: string, destKey: string): Promise<void> {
    await copyFile(join(this.root, sourceKey), join(this.root, destKey));
  }
}
