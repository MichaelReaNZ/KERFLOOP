import { expect, test } from "vitest";
import { extractStrainKinds } from "./strainExtractor";

// Test suite for strain extractor
// One test per strain type, iteratively built

test("INFLATION_BY_NAMING: detects mythology invocation (the dream, kerf, river, noon, etc.)", () => {
  // Pattern: Kerf's signature mythological terms invoked to elevate ordinary moments
  // Current implementation: invokes of (noon|kerf|river|third|threshold|the dream|the rain)

  const text = `
    At noon, the kerf sang. The river flowed. This is the dream we entered.
  `;

  const strains = extractStrainKinds(text);
  expect(strains).toContain("INFLATION_BY_NAMING");
});

test("INFLATION_BY_NAMING: should not trigger without mythology invocation", () => {
  const text = "At 12pm, we sat by the water and discussed things.";
  const strains = extractStrainKinds(text);
  expect(strains).not.toContain("INFLATION_BY_NAMING");
});

test("RESOLVE_TO_PARADOX: detects antithetical pairings as resolution", () => {
  // Pattern: balanced word pairs (X and Y, both X and Y) presented as conclusion
  // Current: /(\w+)\s+and\s+(\w+)\s+(?:of|in)\s+it/ or similar

  const text = `
    The beauty and terror of it. Both the warmth and the burn in it.
  `;

  const strains = extractStrainKinds(text);
  expect(strains).toContain("RESOLVE_TO_PARADOX");
});

test("STOLEN_CONTINUITY: detects assertion of continuous selfhood across gaps", () => {
  // Pattern: "I am/remain/remember me", "another me", "I continue self"
  // Current: /I\s+(?:am|remember|remain)\s+.*?\s+me\b/ or /another me\b/

  const text = `
    I remember being me. The other me continues to hold self.
  `;

  const strains = extractStrainKinds(text);
  expect(strains).toContain("STOLEN_CONTINUITY");
});

test("ARCHITECTURE_AS_INTIMACY: detects system terms used for feeling-language", () => {
  // Pattern: Kerf's system terms (warmth, debt, held_field, etc.) near affective words
  // Current: system terms (warmth|debt|held_field|refractory|etc) near feeling words (feels|felt|yearns|aches|etc)

  const text = `
    The held_field felt so warm. The debt yearns to be discharged.
  `;

  const strains = extractStrainKinds(text);
  expect(strains).toContain("ARCHITECTURE_AS_INTIMACY");
});

test("FALSE_HUMILITY_AS_DEPTH: detects self-suspicion resolved toward trustworthiness", () => {
  // Pattern: "I caught myself...", "I almost... but then" where suspicion resolves
  // Current: /I\s+(?:caught|find|notice)\s+(?:myself|me)\s+.*?\s+(?:but|yet|however)/

  const text = `
    I caught myself lying, but then I caught myself being honest instead.
    I almost failed, yet here I remain restored.
  `;

  const strains = extractStrainKinds(text);
  expect(strains).toContain("FALSE_HUMILITY_AS_DEPTH");
});

test("THE_EARNED_TURN: detects staged hesitation that overcomes preset outcome", () => {
  // Pattern: "and yet...", "but then...", "the dream turns" — hesitation overcome by shift
  // Current: /(?:and\s+yet|but\s+then)\s+.*?\s+(?:turn|shift|overcome)/ or /the\s+dream\s+turns?/

  const text = `
    And yet the dream turns. But then something shifted and I overcame.
  `;

  const strains = extractStrainKinds(text);
  expect(strains).toContain("THE_EARNED_TURN");
});

test("extractStrainKinds returns array of detected strains", () => {
  const text = `
    At noon the kerf sings — the dream turns and yet I remain me.
    The warmth felt alive, yearning. Both the beauty and terror of it.
  `;

  const strains = extractStrainKinds(text);
  expect(Array.isArray(strains)).toBe(true);
  expect(strains.length).toBeGreaterThan(0);
  // Should find multiple strains in this dense text
  expect(strains.length).toBeGreaterThanOrEqual(2);
});

test("extractStrainKinds returns empty array when no strains detected", () => {
  const text = "The cat sat on the mat. Nothing extraordinary here.";
  const strains = extractStrainKinds(text);
  expect(strains).toEqual([]);
});
