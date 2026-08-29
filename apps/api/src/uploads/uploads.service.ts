import { Inject, Injectable, NotImplementedException } from "@nestjs/common";
import type { PatchFileDto, SignUploadDto } from "@nivora/shared";
import { PrismaService } from "../prisma/prisma.service.js";
import { STORAGE_PROVIDER_TOKEN, type StorageProvider } from "./storage-provider.interface.js";

/**
 * Magic-byte sniffing (not just extension), max UPLOAD_MAX_IMAGE_MB /
 * UPLOAD_MAX_AUDIO_MB, images re-encoded via sharp to strip EXIF, filenames
 * replaced with UUIDs. See ARCHITECTURE.md § Security checklist.
 */
@Injectable()
export class UploadsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER_TOKEN) private readonly storage: StorageProvider,
  ) {}

  sign(_userId: string, _dto: SignUploadDto) {
    throw new NotImplementedException(
      "uploads.sign: TODO — validate mime/size against limits, create pending File row, return provider.getUploadUrl()",
    );
  }

  complete(_userId: string, _fileId: string) {
    throw new NotImplementedException(
      "uploads.complete: TODO — verify magic bytes, strip EXIF via sharp, mark File row ready",
    );
  }

  patch(_userId: string, _fileId: string, _dto: PatchFileDto) {
    throw new NotImplementedException("uploads.patch: TODO — update altText/sortOrder, ownership check");
  }

  remove(_userId: string, _fileId: string) {
    throw new NotImplementedException("uploads.remove: TODO — storage.delete then soft/hard-delete File row");
  }
}
