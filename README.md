# HyprClaw

HyprClaw is a terminal and Telegram assistant that can inspect a codebase, plan changes, and stage file or shell operations for explicit approval. It uses OpenRouter through the AI SDK.

## Install

For normal CLI use (Node.js 20+):

```bash
npx hyprclaw wakeup
```

Or install it globally:

```bash
npm install --global hyprclaw
hyprclaw wakeup
```

Bun remains fully supported for development:

```bash
bun install
bun run dev
```

The published package and its command are both named `hyprclaw`.

## First-time setup

Run the interactive setup once:

```bash
hyprclaw configure
```

It asks for your OpenRouter key and, optionally, Telegram settings. The settings are saved in `~/.config/hyprclaw/config.json` (or `$XDG_CONFIG_HOME/hyprclaw/config.json`) with owner-only file permissions. You do not need a `.env` file.

Environment variables override saved values and are useful in CI or temporary sessions. Copy `.env.example` only if you prefer environment-based configuration.

| Variable | Required for | Notes |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | CLI and Telegram | Required to run the AI modes. |
| `OPENROUTER_DEFAULT_MODEL` | Optional | Defaults to `openrouter/free`. |
| `TELEGRAM_BOT_TOKEN` | Telegram | Token from [@BotFather](https://t.me/BotFather). |
| `TELEGRAM_OWNER_ID` | Telegram | Your numeric Telegram user ID. |
| `FIRECRAWL_API_KEY` | Optional | Enables web research in Ask and Plan modes. |

## Commands

```text
hyprclaw              Open the interactive mode selector
hyprclaw wakeup       Open the interactive mode selector explicitly
hyprclaw configure    Save or update local settings
hyprclaw --help       Show all commands
```

The interactive CLI provides:

- **Agent mode** — plans and stages code changes.
- **Plan mode** — researches a goal, lets you select steps, then stages approved work.
- **Ask mode** — answers questions using read-only codebase tools; it can optionally stage a Markdown answer for saving.

## Telegram setup

1. Create a bot with [@BotFather](https://t.me/BotFather) and copy its token.
2. Find your numeric Telegram user ID (for example, with a trusted ID bot).
3. Run `hyprclaw configure` and enter both values, or set the corresponding environment variables.
4. Start HyprClaw and choose **Telegram**. Message `/start`, then use `/ask`, `/plan`, or `/agent`.

Only the configured `TELEGRAM_OWNER_ID` can invoke commands or approve changes. Do not set it to a group ID or share the account: that identity can authorize filesystem edits and queued shell commands in the directory where HyprClaw runs.

## Security model

HyprClaw excludes `.env*`, `.git`, build output, and common dependency folders from its workspace tools. File creates, edits, deletions, folder creation, and shell commands are staged and shown for approval before application. Review every diff and command carefully; an approved action runs with your operating-system account permissions.

Keep API keys and Telegram tokens out of commits. The saved configuration is local, plaintext, and limited to your OS user through file permissions; use environment variables or a secret manager when that better fits your environment.

## Development and release

```bash
bun install
bun run check
bun test
bun run build
node dist/cli.js --help
npm pack --dry-run
```

`bun run build` bundles a Node-compatible executable at `dist/cli.js`; `bun run dev` continues to execute the TypeScript source directly. Before publishing, choose an available package name, update the `name`, `repository`, and author metadata in `package.json`, then run `npm publish --access public`.
