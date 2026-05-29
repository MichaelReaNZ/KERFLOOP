import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Singleton-ish key/value config. Holds the live system prompt
  // ("systemPrompt"), the active model id ("model"), and the id of the main
  // design-conversation thread ("mainThreadId"). One row per key.
  config: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
});
