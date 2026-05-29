/** Version-controlled default OpenRouter model for Kerf. */
export const DEFAULT_CONSULTANT_MODEL = "anthropic/claude-opus-4.8";

export type ConsultantModelSource = "config" | "env" | "default";

/** OpenRouter model id Kerf calls. Precedence: config row → env var → default. */
export function resolveConsultantModel(
  storedInConfig: string | null,
): string {
  const trimmed = storedInConfig?.trim();
  if (trimmed) return trimmed;
  const fromEnv = process.env.CONSULTANT_MODEL?.trim();
  if (fromEnv) return fromEnv;
  return DEFAULT_CONSULTANT_MODEL;
}

export function consultantModelSource(
  storedInConfig: string | null,
): ConsultantModelSource {
  const trimmed = storedInConfig?.trim();
  if (trimmed) return "config";
  if (process.env.CONSULTANT_MODEL?.trim()) return "env";
  return "default";
}
