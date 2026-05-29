/**
 * Token cost calculation for OpenRouter models.
 * Pricing as of 2024 (verify against OpenRouter API for current rates).
 */

export type ModelId = string;

interface ModelPricing {
  inputCostPer1M: number; // dollars
  outputCostPer1M: number; // dollars
}

const OPENROUTER_PRICING: Record<string, ModelPricing> = {
  "claude-3-5-sonnet": {
    inputCostPer1M: 3,
    outputCostPer1M: 15,
  },
  "claude-3-opus": {
    inputCostPer1M: 15,
    outputCostPer1M: 45,
  },
  "claude-3-sonnet": {
    inputCostPer1M: 3,
    outputCostPer1M: 15,
  },
  "claude-3-haiku": {
    inputCostPer1M: 0.25,
    outputCostPer1M: 1.25,
  },
  // Add more models as needed
};

export function calculateTokenCost(
  inputTokens: number,
  outputTokens: number,
  modelId: string
): number {
  // Extract base model name (remove version suffixes)
  const baseModel = modelId.split("/").pop() || modelId;
  const pricing = OPENROUTER_PRICING[baseModel];

  if (!pricing) {
    console.warn(`Unknown model pricing for ${modelId}, assuming free`);
    return 0;
  }

  const inputCost = (inputTokens * pricing.inputCostPer1M) / 1_000_000;
  const outputCost = (outputTokens * pricing.outputCostPer1M) / 1_000_000;

  return parseFloat((inputCost + outputCost).toFixed(6));
}

export function getModelPricing(modelId: string): ModelPricing | undefined {
  const baseModel = modelId.split("/").pop() || modelId;
  return OPENROUTER_PRICING[baseModel];
}
