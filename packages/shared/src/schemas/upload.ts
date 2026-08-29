import { z } from "zod";
import { FILE_KINDS } from "../enums.js";

export const signUploadSchema = z.object({
  projectId: z.string().cuid(),
  kind: z.enum(FILE_KINDS),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
});
export type SignUploadDto = z.infer<typeof signUploadSchema>;

export const patchFileSchema = z.object({
  altText: z.string().optional(),
  sortOrder: z.number().int().optional(),
});
export type PatchFileDto = z.infer<typeof patchFileSchema>;
