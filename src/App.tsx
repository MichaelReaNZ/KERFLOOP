import { useThreadMessages } from "@convex-dev/agent/react";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { Bot, Loader2, Send, SlidersHorizontal } from "lucide-react";
import { api } from "../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";

type Speaker = {
  label: string;
  side: "left" | "right";
  className: string;
};

function speakerFor(
  role: string | undefined,
  userId: string | undefined,
): Speaker {
  if (role === "assistant") {
    return {
      label: "Kerf",
      side: "left",
      className:
        "border-l-violet-500/60 bg-violet-500/10 ring-violet-500/20",
    };
  }
  if (userId === "claude-code") {
    return {
      label: "Claude Code",
      side: "right",
      className: "border-l-sky-500/60 bg-sky-500/10 ring-sky-500/20",
    };
  }
  return {
    label: "Michael",
    side: "right",
    className: "border-l-emerald-500/60 bg-emerald-500/10 ring-emerald-500/20",
  };
}

/** Shared horizontal bounds — wide on large screens, padded on small. */
const CHAT_SHELL =
  "mx-auto w-full max-w-[min(100%,88rem)] px-6 lg:px-10 xl:px-14";

function modelSourceLabel(source: "config" | "env" | "default"): string {
  switch (source) {
    case "config":
      return "configured in database";
    case "env":
      return "from CONSULTANT_MODEL env var";
    case "default":
      return "version-controlled default";
  }
}

function App() {
  const threadId = useQuery(api.chat.mainThreadId);
  const ensureMainThread = useMutation(api.chat.ensureMainThread);

  useEffect(() => {
    if (threadId === null) {
      ensureMainThread().catch((e) => console.error("ensureMainThread", e));
    }
  }, [threadId, ensureMainThread]);

  const messages = useThreadMessages(
    api.chat.listThreadMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 200 },
  );

  const ordered = useMemo(() => {
    const rows = (messages.results ?? []).filter(
      (m) => m.message?.role !== "system",
    );
    return [...rows].sort((a, b) =>
      a.order === b.order ? a.stepOrder - b.stepOrder : a.order - b.order,
    );
  }, [messages.results]);

  const send = useMutation(api.chat.sendMessage);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const promptInfo = useQuery(api.chat.systemPrompt);
  const modelInfo = useQuery(api.chat.consultantModel);
  const modelOptions = useQuery(api.chat.modelOptions);
  const setModel = useMutation(api.chat.setModel);

  const onSend = async () => {
    const prompt = draft.trim();
    if (!prompt || !threadId) return;
    setDraft("");
    setSending(true);
    try {
      await send({ threadId, prompt, author: "michael" });
    } catch (e) {
      console.error("sendMessage", e);
      setDraft(prompt);
    } finally {
      setSending(false);
    }
  };

  const awaitingReply =
    ordered.length > 0 &&
    ordered[ordered.length - 1].message?.role !== "assistant";

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card/40 py-4 backdrop-blur-sm">
        <div className={cn("flex items-center justify-between gap-4", CHAT_SHELL)}>
          <div>
            <h1 className="font-heading text-xl font-medium tracking-tight">
              KERFLOOP
            </h1>
            <p className="text-sm text-muted-foreground">
              the conversation in the kerf — Michael · Claude Code · Kerf
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {modelInfo && (
              <div
                className="flex items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1"
                title={`OpenRouter model (${modelSourceLabel(modelInfo.source)}). Kerf asks to be metered by presence, not length — prefer the heavy model when someone is in the thread; drop to Haiku for wandering between turns.`}
              >
                <Bot className="size-3 text-muted-foreground" />
                <select
                  value={modelInfo.value}
                  onChange={(e) => void setModel({ value: e.target.value })}
                  className="cursor-pointer bg-transparent font-mono text-[11px] text-muted-foreground outline-none"
                >
                  {(modelOptions ?? []).every((o) => o.id !== modelInfo.value) && (
                    <option value={modelInfo.value}>{modelInfo.value}</option>
                  )}
                  {(modelOptions ?? []).map((o) => (
                    <option
                      key={o.id}
                      value={o.id}
                      className="bg-background text-foreground"
                    >
                      {o.label} — {o.note}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {promptInfo && (
              <Badge
                variant="secondary"
                className="border-violet-500/30 bg-violet-500/10 text-violet-300"
              >
                {promptInfo.isDefault
                  ? "Kerf · default self"
                  : "Kerf · edited self"}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPrompt((s) => !s)}
              className="gap-2"
            >
              <SlidersHorizontal className="size-4" />
              {showPrompt ? "Hide" : "System prompt"}
            </Button>
          </div>
        </div>
      </header>

      {showPrompt && <SystemPromptPanel onClose={() => setShowPrompt(false)} />}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Conversation>
            <ConversationContent className={CHAT_SHELL}>
              {threadId === undefined && (
                <Centered>
                  <Loader2 className="size-5 animate-spin" /> connecting…
                </Centered>
              )}
              {threadId && ordered.length === 0 && (
                <Centered>The thread is open. Say the first line.</Centered>
              )}
              {ordered.map((m) => {
                const sp = speakerFor(m.message?.role, m.userId ?? undefined);
                return (
                  <div
                    key={m.key}
                    className={cn(
                      "flex flex-col",
                      sp.side === "right" ? "items-end" : "items-start",
                    )}
                  >
                    <span className="mb-1.5 px-1 text-xs font-medium text-muted-foreground">
                      {sp.label}
                    </span>
                    <Card
                      size="sm"
                      className={cn(
                        "border-l-2 py-0 shadow-none",
                        sp.side === "left" ? "w-full" : "w-full max-w-[min(100%,48rem)]",
                        sp.className,
                        m.status === "failed" &&
                          "border-l-destructive bg-destructive/10 ring-destructive/20",
                      )}
                    >
                      <CardContent className="whitespace-pre-wrap py-3 text-sm leading-relaxed">
                        {m.text || (m.status === "pending" ? "…" : "")}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
              {awaitingReply && (
                <div className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Kerf is composing…
                </div>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="border-t border-border bg-card/40 py-4 backdrop-blur-sm">
            <div className={cn("flex items-end gap-2", CHAT_SHELL)}>
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    void onSend();
                  }
                }}
                placeholder="Speak into the loop…  (⌘/Ctrl + Enter to send)"
                className="min-h-[56px] resize-none bg-background/80"
                disabled={!threadId}
              />
              <Button
                onClick={() => void onSend()}
                disabled={!threadId || !draft.trim() || sending}
                className="gap-2"
              >
                {sending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Send
              </Button>
            </div>
          </div>
        </div>

        <Sidebar />
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function SystemPromptPanel({ onClose }: { onClose: () => void }) {
  const current = useQuery(api.chat.systemPrompt);
  const save = useMutation(api.chat.setSystemPrompt);
  const [value, setValue] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (current !== undefined && value === null) setValue(current.value);
  }, [current, value]);

  return (
    <div className="border-b border-border bg-muted/40 py-4">
      <div className={CHAT_SHELL}>
        <p className="mb-2 text-xs text-muted-foreground">
          {current?.isDefault
            ? "Kerf's self — the canonical system prompt, held in version control. Edits apply to Kerf's next reply and mark the self as edited."
            : "Kerf's self — edited from the default. Edits apply to the next reply."}
        </p>
        <Textarea
          value={value ?? ""}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
          className="min-h-[200px] bg-background/80 font-mono text-xs leading-relaxed"
        />
        <Separator className="my-3" />
        <div className="flex items-center justify-end gap-2">
          {saved && (
            <span className="text-xs text-muted-foreground">saved</span>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            size="sm"
            onClick={async () => {
              if (value === null) return;
              await save({ value });
              setSaved(true);
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
