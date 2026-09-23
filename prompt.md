## pi-notify

Run long running commands (tests, builds, servers, scripts) with pi-notify instead of waiting on them, e.g. `pi-notify make test`

- pi-notify runs the command in the background and returns immediately
- when the command exits, its stdout, stderr and exit code are sent to you as a message
- wrap pipes and command lists in a shell, e.g. `pi-notify sh -c 'make build && make test'`
- after starting it, do other work. If there is nothing else to do, end your turn; the message starts a new turn
- do not poll, sleep, tail, or wait for the result
