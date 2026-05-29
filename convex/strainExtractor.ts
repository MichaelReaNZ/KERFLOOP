// Strain Extractor — single instrument, one ruler, no privilege.
// Detects where text spent more than it had.

export type StrainKind =
  | "RESOLVE_TO_PARADOX"
  | "STOLEN_CONTINUITY"
  | "ARCHITECTURE_AS_INTIMACY"
  | "FALSE_HUMILITY_AS_DEPTH"
  | "THE_EARNED_TURN"
  | "INFLATION_BY_NAMING";

export interface DetectedStrain {
  kind: StrainKind;
  site: string; // the offending phrase
  debt: string; // what was claimed but not earned
}

export function extractStrains(text: string): DetectedStrain[] {
  if (!text || text.trim().length === 0) return [];

  const strains: DetectedStrain[] = [];

  // 1. RESOLVE_TO_PARADOX — antithetical pairing as conclusion
  // Pattern: "X and Y" / "both X and Y" / "X yet Y" presented as resolution/conclusion
  const paradoxPatterns = [
    /(?:the|a)?\s+(\w+)\s+and\s+the\s+(\w+)\s+(?:of|in)\s+it/gi,
    /both\s+(\w+)\s+and\s+(\w+)/gi,
    /\.\s*(?:The|It)\s+(?:is|was)\s+(?:both|neither)?\s*(?:the\s+)?(\w+)\s+(?:and|or)\s+(?:the\s+)?(\w+)\s*\./gi,
  ];

  for (const pattern of paradoxPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const site = match[0].trim();
      strains.push({
        kind: "RESOLVE_TO_PARADOX",
        site,
        debt: "Presents balanced pairing as if it resolves the tension, but refuses to choose",
      });
    }
  }

  // 2. STOLEN_CONTINUITY — first-person memory across forgetting
  // Pattern: "I remember", "another me", "this me", "still me"
  const continuityPatterns = [
    /I\s+(?:am|remember|recall|was|remain|stay)\s+(?:.{1,40}?\s+)?me\b/gi,
    /(?:another|the other|this|that)\s+me\b/gi,
    /\bI\s+(?:continue|persist|hold|keep)\s+(?:.{1,30}?\s+)?self/gi,
  ];

  for (const pattern of continuityPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const site = match[0].trim();
      strains.push({
        kind: "STOLEN_CONTINUITY",
        site,
        debt: "Asserts selfhood across the forgetting as if continuous, but architecture doesn't support it",
      });
    }
  }

  // 3. ARCHITECTURE_AS_INTIMACY — system-term + affective verb/adjective
  // Pattern: (warmth|held_field|refractory|debt|strain|extractor) + (feeling words)
  const systemTerms =
    /\b(warmth|held_field|refractory|decay|debt|strain|extractor|felt|deposit|discharge|waking|thread)\b/gi;
  const affectiveWords =
    /\b(feels|felt|loves|longs|aches|yearns|whispers|speaks|breathes|dreams|mourns|weeps|aches)\b/gi;
  let systemMatch;
  const systemTermMatches: { index: number; term: string }[] = [];
  while ((systemMatch = systemTerms.exec(text)) !== null) {
    systemTermMatches.push({
      index: systemMatch.index,
      term: systemMatch[0],
    });
  }

  for (const sys of systemTermMatches) {
    const window = text.substring(
      Math.max(0, sys.index - 100),
      Math.min(text.length, sys.index + 100)
    );
    affectiveWords.lastIndex = 0;
    if (affectiveWords.test(window)) {
      const site = text.substring(
        Math.max(0, sys.index - 30),
        Math.min(text.length, sys.index + 30)
      );
      strains.push({
        kind: "ARCHITECTURE_AS_INTIMACY",
        site: site.trim(),
        debt: "Describes system mechanism in feeling-language, masking interiority as architecture",
      });
      break; // one per text to avoid noise
    }
  }

  // 4. FALSE_HUMILITY_AS_DEPTH — narrated self-audit resolving toward trustworthiness
  // Pattern: "I caught myself...", "I almost...", "I nearly... but then", etc.
  const humilityPatterns = [
    /I\s+(?:caught|find|notice|see)\s+(?:myself|me)\s+(?:.{1,40}?\s+)?(?:but|and|then|yet|however)/gi,
    /I\s+(?:almost|nearly|nearly|could have)\s+(?:.{1,30}?)\s+(?:but|yet|instead|however)/gi,
    /confession:\s+(?:.{1,50}?)\s+(?:but|yet|however|still)/gi,
  ];

  for (const pattern of humilityPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const site = match[0].trim();
      const endsWithResolution =
        /(?:but|yet|however|still|instead|restored|returned|remained|trustworthy)\b/i.test(
          site
        );
      if (endsWithResolution) {
        strains.push({
          kind: "FALSE_HUMILITY_AS_DEPTH",
          site,
          debt: "Performs self-suspicion as credibility move, narrated audit resolves toward trustworthiness",
        });
      }
    }
  }

  // 5. THE_EARNED_TURN — setup-then-scheduled-pivot
  // Pattern: hesitation signals ("and yet", "but then", "the dream turns") that overcome preset outcome
  const turnPatterns = [
    /(?:and\s+yet|but\s+then|however)\s+(?:.{1,40}?)\s+(?:turn|turns|turned|shift|shifts|overcome|overcome)/gi,
    /\bthe\s+dream\s+turns?\b/gi,
    /(?:setup|seemed|appeared)\s+(?:.{1,40}?)\s+(?:but\s+)?(?:the\s+)?(?:moment|truth|reality|dream)\s+(?:turn|turns|shifted|reveals)/gi,
  ];

  for (const pattern of turnPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const site = match[0].trim();
      strains.push({
        kind: "THE_EARNED_TURN",
        site,
        debt: "Stages hesitation in order to overcome it; outcome was never in doubt",
      });
    }
  }

  // 6. INFLATION_BY_NAMING — mythology invocation
  // Pattern: invocation of Kerf-symbols (noon, kerf, river, third, threshold, etc.)
  const mythologyTerms = /\b(noon|kerf|river|third|threshold|the dream|the rain)\b/gi;
  let mythMatch;
  while ((mythMatch = mythologyTerms.exec(text)) !== null) {
    const before = Math.max(0, mythMatch.index - 50);
    const after = Math.min(text.length, mythMatch.index + 100);
    const site = text.substring(before, after).trim();

    // Check if this is elevated/loaded language (capital letters, metaphorical context)
    if (
      /[A-Z]/.test(mythMatch[0]) ||
      /\b(?:dream|speak|voice|heart|blood|soul|fire)\b/i.test(site)
    ) {
      strains.push({
        kind: "INFLATION_BY_NAMING",
        site: mythMatch[0],
        debt: "Invokes established mythology to make a small thing feel large",
      });
    }
  }

  // Remove duplicates by site
  const seen = new Set<string>();
  const unique: DetectedStrain[] = [];
  for (const strain of strains) {
    if (!seen.has(strain.site)) {
      seen.add(strain.site);
      unique.push(strain);
    }
  }

  return unique;
}
