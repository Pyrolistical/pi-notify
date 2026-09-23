import { describe, expect, test } from "bun:test";
import { execFile } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { Inbox, type SteeringSink } from "./index.ts";

type Sent = Parameters<SteeringSink["sendUserMessage"]>;

class SinkStub implements SteeringSink {
  private readonly received = Promise.withResolvers<Sent>();
  readonly sent = this.received.promise;

  sendUserMessage(...sent: Sent): void {
    this.received.resolve(sent);
  }
}

const exec = promisify(execFile);

function run(inbox: Inbox, script: string) {
  return exec("sh", ["-c", script], {
    cwd: import.meta.dirname,
    env: { ...process.env, PI_NOTIFY_DIR: inbox.dir },
    timeout: 5000,
  });
}

describe("pi-notify", () => {
  test("steers the command output and exit code once it exits", async () => {
    const sink = new SinkStub();
    const inbox = await Inbox.open(sink);

    await run(inbox, "bin/pi-notify sh -c 'echo hi; exit 3'");

    expect(await sink.sent).toEqual([
      "sh -c echo hi; exit 3\n\nhi\nexit 3\n",
      { deliverAs: "steer" },
    ]);
    await inbox.close();
  });

  test("returns while the command is still running", async () => {
    const sink = new SinkStub();
    const inbox = await Inbox.open(sink);
    const fifo = join(await mkdtemp(join(tmpdir(), "pi-notify-test-")), "fifo");
    await exec("mkfifo", [fifo], { timeout: 5000 });

    const { stdout } = await run(inbox, `bin/pi-notify cat ${fifo}`);
    await writeFile(fifo, "hi\n");

    expect(stdout).toBe(
      `pi-notify: running cat ${fifo} in the background, its output will be sent to you as a message when it exits\n`,
    );
    const [content] = await sink.sent;
    expect(content).toBe(`cat ${fifo}\n\nhi\nexit 0\n`);
    await inbox.close();
  });

  test("keeps the tail of long output", async () => {
    const sink = new SinkStub();
    const inbox = await Inbox.open(sink);

    await run(inbox, "bin/pi-notify seq 3000");

    const [content] = await sink.sent;
    expect(content).toStartWith("1002\n1003\n");
    expect(content).toMatch(
      /3000\nexit 0\n\n\[Showing last 2000 of 3003 lines\. Full output: .+\]$/,
    );
    await inbox.close();
  });
});
