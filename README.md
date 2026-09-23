# pi-notify

A [Pi](https://pi.dev) extension that adds a `pi-notify` command to the agent's shell. It runs a command in the background and sends its output to the agent as a steering user message when it exits.

## Install

```bash
git clone https://github.com/Pyrolistical/pi-notify
cd pi-notify
ln -s "$PWD" ~/.pi/agent/extensions/pi-notify
```

## Usage

```bash
pi-notify make test
```

- returns immediately, the command runs in the background
- the message is the command, its stdout and stderr, then its exit code
- output over 2000 lines or 50KB keeps the tail and points to the full output file
- works with the built-in `bash` tool, no custom tool needed
- `prompt.md` is appended to the system prompt to tell the agent how to use it

## How it works

- on `session_start`, creates an inbox directory and exports it as `PI_NOTIFY_DIR`
- prepends `bin/` to `PATH` so the `bash` tool finds `pi-notify`
- `bin/pi-notify` writes the command output to a dotfile in the inbox, then renames it once the command exits
- the extension watches the inbox and sends each renamed file with `sendUserMessage` and `deliverAs: "steer"`
- a user message instead of a custom message, so an idle agent starts the turn through `before_agent_start` and extension system prompt changes apply to every request of the turn, keeping the llama.cpp prefix cache warm
- on `session_shutdown`, stops watching and deletes the inbox
