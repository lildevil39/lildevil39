import { ConflictException } from "@nestjs/common";

/** Thrown by an AIProvider.submit() when no provider is configured for that job type. Maps to 409. */
export class ProviderNotConfiguredException extends ConflictException {
  constructor(jobType: string) {
    super({
      statusCode: 409,
      code: "PROVIDER_NOT_CONFIGURED",
      message: `No AI provider configured for ${jobType}`,
    });
  }
}
