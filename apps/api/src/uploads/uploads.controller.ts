import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";
import { patchFileSchema, signUploadSchema } from "@nivora/shared";
import { CurrentUser, type AuthenticatedUser } from "../common/decorators/current-user.decorator.js";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe.js";
import { UploadsService } from "./uploads.service.js";

@Controller("uploads")
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post("sign")
  sign(@CurrentUser() user: AuthenticatedUser, @Body(new ZodValidationPipe(signUploadSchema)) dto: unknown) {
    return this.uploads.sign(user.id, dto as never);
  }

  @Post(":fileId/complete")
  complete(@CurrentUser() user: AuthenticatedUser, @Param("fileId") fileId: string) {
    return this.uploads.complete(user.id, fileId);
  }

  @Patch(":fileId")
  patch(
    @CurrentUser() user: AuthenticatedUser,
    @Param("fileId") fileId: string,
    @Body(new ZodValidationPipe(patchFileSchema)) dto: unknown,
  ) {
    return this.uploads.patch(user.id, fileId, dto as never);
  }

  @Delete(":fileId")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("fileId") fileId: string) {
    return this.uploads.remove(user.id, fileId);
  }
}
