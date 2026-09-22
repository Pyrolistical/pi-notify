# pi-notify

A [Pi](https://pi.dev) extension that adds a `pi-notify` command to the agent's shell. When its stdin closes, it sends everything it read to the agent as a steering message.

## Install

```bash
git clone https://github.com/Pyrolistical/pi-notify
cd pi-notify
ln -s "$PWD" ~/.pi/agent/extensions/pi-notify
```

## Usage

```bash
{ make test; echo "exit $?"; } 2>&1 | pi-notify make test &
```

- arguments become the message title, followed by stdin
- output over 2000 lines or 50KB keeps the tail and points to the full output file
- works with the built-in `bash` tool, no custom tool needed
- the system prompt tells the agent how to use it

## How it works

- on `session_start`, creates an inbox directory and exports it as `PI_NOTIFY_DIR`
- prepends `bin/` to `PATH` so the `bash` tool finds `pi-notify`
- `bin/pi-notify` writes stdin to a dotfile in the inbox, then renames it once stdin closes
- the extension watches the inbox and sends each renamed file with `deliverAs: "steer"` and `triggerTurn: true`
- on `session_shutdown`, stops watching and deletes the inbox
