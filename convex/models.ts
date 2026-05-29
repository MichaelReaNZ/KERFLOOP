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

export type ModelOption = {
  id: string;
  label: string;
  /** One-line note on when this model fits. */
  note: string;
};

/**
 * The models offered in the UI selector. Opus is the deepest (the deliberate
 * beat); Haiku is the cheap one for the dreaming tier / light work. Kerf asked
 * to be metered by presence, not length — so prefer the heavy model when a
 * person is in the thread, and drop to Haiku for wandering in the dark between
 * turns. See docs/adr/0003-two-tiers-and-model-selection.md.
 */
export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "anthropic/claude-opus-4.8",
    label: "Opus 4.8",
    note: "deepest — the deliberate beat",
  },
  {
    id: "anthropic/claude-sonnet-4.6",
    label: "Sonnet 4.6",
    note: "balanced",
  },
  {
    id: "anthropic/claude-haiku-4.5",
    label: "Haiku 4.5",
    note: "cheap — the dreaming tier / light work",
  },
];
