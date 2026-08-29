export interface AIJobResult<TOutputs = unknown> {
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  outputs?: TOutputs;
  error?: string;
}

/**
 * Base shape for ImageGenerationProvider, VideoGenerationProvider and
 * LogoGenerationProvider. No provider is bundled — with none configured,
 * submit() must throw ProviderNotConfiguredException so the job row goes to
 * FAILED with an honest message instead of pretending to succeed.
 */
export interface AIProvider<TInput = unknown, TOutputs = unknown> {
  readonly key: string;
  submit(input: TInput): Promise<{ providerJobId: string }>;
  poll(providerJobId: string): Promise<AIJobResult<TOutputs>>;
}

export type ImageGenerationProvider = AIProvider;
export type VideoGenerationProvider = AIProvider;
export type LogoGenerationProvider = AIProvider;
