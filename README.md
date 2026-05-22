# 🐄 Fortune Cowsay

A VS Code extension that greets you with a random programming fortune delivered by an ASCII cow (or other character) every time VS Code starts up.

## Features

- **Startup greeting** — a fortune appears in a webview panel when VS Code launches
- **Enable / Disable** — toggle the extension on or off at any time
- **Multiple characters** — choose from `cow`, `tux`, `dragon`, `ghostbusters`, or `sheep`
- **Quote type filter** — show `short`, `long`, or `both` quote styles
- **Custom quote management** — add, remove, and list your own quotes
- **Custom-only mode** — optionally show only your custom quotes
- **Auto-close panel** — the fortune panel closes itself after 30 seconds

## Commands

| Command | Description |
|---|---|
| `Fortune Cowsay: Enable` | Enable the extension |
| `Fortune Cowsay: Disable` | Disable the extension |
| `Fortune Cowsay: Show Fortune Now` | Show a fortune immediately |
| `Fortune Cowsay: Add Custom Quote` | Add a quote to your personal collection |
| `Fortune Cowsay: Remove Custom Quote` | Remove a custom quote |
| `Fortune Cowsay: List All Quotes` | Browse all available quotes |
| `Fortune Cowsay: Reset to Default Quotes` | Remove all custom quotes and reset settings |

## Settings

| Setting | Type | Default | Description |
|---|---|---|---|
| `fortuneCowsay.enabled` | boolean | `true` | Show fortune on startup |
| `fortuneCowsay.cowCharacter` | string | `"cow"` | ASCII character: `cow`, `tux`, `dragon`, `ghostbusters`, `sheep` |
| `fortuneCowsay.quoteType` | string | `"short"` | Quote length: `short`, `long`, `both` |
| `fortuneCowsay.useCustomOnly` | boolean | `false` | Only show your custom quotes |
| `fortuneCowsay.customQuotes` | array | `[]` | Your personal quote collection |

## Quote Collection

The default quotes are ported from [fortune.nvim](https://github.com/rubiin/fortune.nvim/blob/master/lua/fortune/lang/en/quotes.lua) — a curated collection of programming wisdom from Linus Torvalds, Donald Knuth, Kent Beck, and many others.

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Open in Extension Development Host
# Press F5 in VS Code
```

## Project Structure

```
fortune-cowsay/
├── src/
│   ├── extension.ts       # Entry point, commands, webview
│   ├── cowsay.ts          # ASCII art rendering
│   ├── fortuneManager.ts  # Quote management & config
│   └── quotes.ts          # Default quote collections
├── package.json           # Extension manifest
└── tsconfig.json
```
