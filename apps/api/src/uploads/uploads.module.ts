import { Module } from "@nestjs/common";
import { UploadsController } from "./uploads.controller.js";
import { UploadsService } from "./uploads.service.js";
import { STORAGE_PROVIDER_TOKEN } from "./storage-provider.interface.js";
import { LocalStorageProvider } from "./providers/local-storage.provider.js";

@Module({
  controllers: [UploadsController],
  providers: [
    UploadsService,
    LocalStorageProvider,
    {
      provide: STORAGE_PROVIDER_TOKEN,
      useFactory: (local: LocalStorageProvider) => {
        const provider = process.env.STORAGE_PROVIDER ?? "local";
        switch (provider) {
          case "local":
            return local;
          // case "s3": return new S3StorageProvider(...);
          // case "cloudinary": return new CloudinaryStorageProvider(...);
          // case "supabase": return new SupabaseStorageProvider(...);
          default:
            // eslint-disable-next-line no-console
            console.warn(`STORAGE_PROVIDER=${provider} has no adapter yet, falling back to local`);
            return local;
        }
      },
      inject: [LocalStorageProvider],
    },
  ],
  exports: [UploadsService],
})
export class UploadsModule {}
