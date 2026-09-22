import { describe, expect, test } from "bun:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Inbox, type SteeringSink } from "./index.ts";

type Sent = Parameters<SteeringSink["sendMessage"]>;

class SinkStub implements SteeringSink {
  private readonly received = Promise.withResolvers<Sent>();
  readonly sent = this.received.promise;

  sendMessage(...sent: Sent): void {
    this.received.resolve(sent);
  }
}

const exec = promisify(execFile);

function pipeInto(inbox: Inbox, script: string) {
  return exec("sh", ["-c", script], {
    cwd: import.meta.dirname,
    env: { ...process.env, PI_NOTIFY_DIR: inbox.dir },
    timeout: 5000,
  });
}

describe("pi-notify", () => {
  test("steers stdin with the title once stdin closes", async () => {
    const sink = new SinkStub();
    const inbox = await Inbox.open(sink);

    await pipeInto(inbox, "printf 'hi\\n' | bin/pi-notify make test");

    expect(await sink.sent).toEqual([
      { customType: "pi-notify", content: "make test\n\nhi\n", display: true },
      { deliverAs: "steer", triggerTurn: true },
    ]);
    await inbox.close();
  });

  test("steers stdin alone without a title", async () => {
    const sink = new SinkStub();
    const inbox = await Inbox.open(sink);

    await pipeInto(inbox, "printf 'hi\\n' | bin/pi-notify");

    const [message] = await sink.sent;
    expect(message.content).toBe("hi\n");
    await inbox.close();
  });

  test("keeps the tail of long output", async () => {
    const sink = new SinkStub();
    const inbox = await Inbox.open(sink);

    await pipeInto(inbox, "seq 3000 | bin/pi-notify");

    const [message] = await sink.sent;
    expect(message.content).toStartWith("1001\n1002\n");
    expect(message.content).toMatch(
      /3000\n\n\[Showing last 2000 of 3000 lines\. Full output: .+\]$/,
    );
    await inbox.close();
  });
});
