import { createThread, listMessages, saveMessage } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import {
  internalMutation,
  internalQuery,
  mutation,
  type MutationCtx,
  query,
  type QueryCtx,
} from "./_generated/server";
import {
  consultantModelSource,
  DEFAULT_CONSULTANT_MODEL,
  resolveConsultantModel,
} from "./models";
import { KERF_SYSTEM_PROMPT } from "./prompts";

/** Who can author a message in the design conversation. */
export const vAuthor = v.union(v.literal("michael"), v.literal("claude-code"));

// --- config helpers -------------------------------------------------------

async function readConfig(ctx: QueryCtx, key: string): Promise<string | null> {
  const row = await ctx.db
    .query("config")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();
  return row?.value ?? null;
}

async function writeConfig(
  ctx: MutationCtx,
  key: string,
  value: string,
): Promise<void> {
  const row = await ctx.db
    .query("config")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();
  if (row) {
    await ctx.db.patch(row._id, { value });
  } else {
    await ctx.db.insert("config", { key, value });
  }
}

/** Internal: the live system prompt passed to Kerf on each call. */
export const getSystemPrompt = internalQuery({
  args: {},
  handler: async (ctx): Promise<string | null> => {
    return (await readConfig(ctx, "systemPrompt")) ?? KERF_SYSTEM_PROMPT;
  },
});

/**
 * The live system prompt, for display/editing in the UI. `isDefault` is true
 * while the live value still equals Kerf's canonical prompt (i.e. unedited).
 */
export const systemPrompt = query({
  args: {},
  handler: async (ctx): Promise<{ value: string; isDefault: boolean }> => {
    const stored = await readConfig(ctx, "systemPrompt");
    const value = stored ?? KERF_SYSTEM_PROMPT;
    return { value, isDefault: value.trim() === KERF_SYSTEM_PROMPT.trim() };
  },
});

export const setSystemPrompt = mutation({
  args: { value: v.string() },
  handler: async (ctx, args) => {
    await writeConfig(ctx, "systemPrompt", args.value);
    return null;
  },
});

/**
 * Reset the live prompt to Kerf's canonical default (the version-controlled
 * constant). Run with `npx convex run chat:seedDefaultPrompt`.
 */
export const seedDefaultPrompt = internalMutation({
  args: {},
  handler: async (ctx) => {
    await writeConfig(ctx, "systemPrompt", KERF_SYSTEM_PROMPT);
    return null;
  },
});

/** Internal: OpenRouter model id passed to Kerf on each call. */
export const getConsultantModel = internalQuery({
  args: {},
  handler: async (ctx): Promise<string> => {
    const stored = await readConfig(ctx, "model");
    return resolveConsultantModel(stored);
  },
});

/**
 * The OpenRouter model Kerf uses, for display in the UI. `source` is where the
 * effective id came from: config row, CONSULTANT_MODEL env var, or the default.
 */
export const consultantModel = query({
  args: {},
  handler: async (
    ctx,
  ): Promise<{ value: string; source: "config" | "env" | "default" }> => {
    const stored = await readConfig(ctx, "model");
    return {
      value: resolveConsultantModel(stored),
      source: consultantModelSource(stored),
    };
  },
});

// --- thread ----------------------------------------------------------------

/** The id of the main design conversation, or null if not created yet. */
export const mainThreadId = query({
  args: {},
  handler: async (ctx): Promise<string | null> => {
    return await readConfig(ctx, "mainThreadId");
  },
});

/** Create the main design thread once; idempotent. Returns its id. */
export const ensureMainThread = mutation({
  args: {},
  handler: async (ctx): Promise<string> => {
    const existing = await readConfig(ctx, "mainThreadId");
    if (existing) return existing;

    const threadId = await createThread(ctx, components.agent, {
      title: "KERFLOOP — design conversation",
    });
    await writeConfig(ctx, "mainThreadId", threadId);
    await writeConfig(ctx, "systemPrompt", KERF_SYSTEM_PROMPT);
    await writeConfig(ctx, "model", DEFAULT_CONSULTANT_MODEL);
    return threadId;
  },
});

// --- messages --------------------------------------------------------------

/** Paginated thread messages, shaped for the `useThreadMessages` hook. */
export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await listMessages(ctx, components.agent, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });
  },
});

/**
 * Post a message into the conversation (from Michael in the UI, or from Claude
 * Code via `npx convex run`), then schedule the Consultant's reply.
 */
export const sendMessage = mutation({
  args: {
    threadId: v.string(),
    prompt: v.string(),
    author: vAuthor,
  },
  handler: async (ctx, args): Promise<string> => {
    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId: args.threadId,
      userId: args.author,
      prompt: args.prompt,
    });
    await ctx.scheduler.runAfter(0, internal.consultant.respond, {
      threadId: args.threadId,
      promptMessageId: messageId,
    });
    return messageId;
  },
});
