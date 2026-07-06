# Daily Chat

Daily Chat adds a chat-style input bar to the bottom of daily notes and appends posts to the current daily note using the same Markdown formats as Mobile First Daily Interface.

This plugin is desktop-only and stays disabled on mobile.

## Features

- Shows the input bar only on notes whose file name matches the configured daily note date format.
- Appends posts to the current daily note.
- Supports Mobile First Daily Interface post formats: code block and heading 1-6.
- Adds a command, **Focus daily chat input**, for keyboard-driven posting.

## Settings

- **Daily note date format**: Moment.js date format used to detect daily notes. Default: `YYYY-MM-DD`.
- **Daily note folder**: Optional folder path. Leave empty to match daily notes in any folder.
- **Post format**: Markdown format used when appending posts. Default: `Code block`.

## Development

```bash
pnpm install
pnpm dev
pnpm build
```
