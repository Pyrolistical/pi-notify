import { mkdtemp, readFile, rm, watch } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import {
  truncateTail,
  type ExtensionAPI,
} from "@earendil-works/pi-coding-agent";

const NAME = "pi-notify";
const BIN = join(import.meta.dirname, "bin");
const PROMPT = join(import.meta.dirname, "prompt.md");

export interface SteeringSink {
  sendUserMessage: (content: string, options: { deliverAs: "steer" }) => void;
}

export class Inbox {
  private constructor(
    readonly dir: string,
    private readonly controller: AbortController,
  ) {}

  static async open(sink: SteeringSink): Promise<Inbox> {
    const dir = await mkdtemp(join(tmpdir(), `${NAME}-`));
    const controller = new AbortController();
    void relay(dir, sink, controller.signal);
    return new Inbox(dir, controller);
  }

  async close(): Promise<void> {
    this.controller.abort();
    await rm(this.dir, { recursive: true, force: true });
  }
}

async function relay(
  dir: string,
  sink: SteeringSink,
  signal: AbortSignal,
): Promise<void> {
  try {
    for await (const { eventType, filename } of watch(dir, { signal })) {
      if (eventType !== "rename" || !filename || filename.startsWith(".")) {
        continue;
      }
      const path = join(dir, filename);
      sink.sendUserMessage(contentOf(path, await readFile(path, "utf8")), {
        deliverAs: "steer",
      });
    }
  } catch (err) {
    if (signal.aborted) {
      return;
    }
    throw err;
  }
}

function contentOf(path: string, text: string): string {
  const result = truncateTail(text);
  if (!result.truncated) {
    return text;
  }
  return `${result.content}\n\n[Showing last ${result.outputLines} of ${result.totalLines} lines. Full output: ${path}]`;
}

function prependPath(dir: string): void {
  const path = process.env.PATH ?? "";
  if (path.split(delimiter).includes(dir)) {
    return;
  }
  process.env.PATH = [dir, path].filter(Boolean).join(delimiter);
}

export default async function notify(pi: ExtensionAPI): Promise<void> {
  const prompt = await readFile(PROMPT, "utf8");
  let inbox: Inbox | undefined;
  pi.on("session_start", async () => {
    inbox = await Inbox.open(pi);
    process.env.PI_NOTIFY_DIR = inbox.dir;
    prependPath(BIN);
  });
  pi.on("session_shutdown", async () => {
    delete process.env.PI_NOTIFY_DIR;
    await inbox?.close();
    inbox = undefined;
  });
  pi.on("before_agent_start", (event) => ({
    systemPrompt: `${event.systemPrompt}\n\n${prompt}`,
  }));
}
