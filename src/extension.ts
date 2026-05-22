import * as vscode from "vscode";
import { renderCowsay, CowCharacter } from "./cowsay";
import { FortuneManager } from "./fortuneManager";

let fortuneManager: FortuneManager;
let activePanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext): void {
  fortuneManager = new FortuneManager(context);

  // Show fortune on startup if enabled
  showStartupFortune();

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("fortune-cowsay.enable", cmdEnable),
    vscode.commands.registerCommand("fortune-cowsay.disable", cmdDisable),
    vscode.commands.registerCommand("fortune-cowsay.showNow", cmdShowNow),
    vscode.commands.registerCommand("fortune-cowsay.addQuote", cmdAddQuote),
    vscode.commands.registerCommand("fortune-cowsay.removeQuote", cmdRemoveQuote),
    vscode.commands.registerCommand("fortune-cowsay.listQuotes", cmdListQuotes),
    vscode.commands.registerCommand("fortune-cowsay.resetToDefaults", cmdResetToDefaults)
  );
}

export function deactivate(): void { }

// ─── Startup ────────────────────────────────────────────────────────────────

function showStartupFortune(): void {
  if (!fortuneManager.isEnabled()) {
    return;
  }

  const quote = fortuneManager.getRandomQuote();
  const character = vscode.workspace
    .getConfiguration("fortuneCowsay")
    .get<CowCharacter>("cowCharacter", "cow");

  const art = renderCowsay(quote, character);

  showFortunePanel(art, quote);
}

function showFortunePanel(art: string, quote: { text: string; author?: string }): void {
  const html = buildWebviewHtml(art, quote);

  if (activePanel) {
    // Reuse the existing panel — just swap its content and bring it to front
    activePanel.webview.html = html;
    activePanel.reveal(vscode.ViewColumn.One, true);
  } else {
    // Create a fresh panel and track it
    activePanel = vscode.window.createWebviewPanel(
      "fortuneCowsay",
      "🐄 Fortune Cowsay",
      { viewColumn: vscode.ViewColumn.One, preserveFocus: true },
      { enableScripts: false, retainContextWhenHidden: false }
    );
    activePanel.webview.html = html;

    // Clear the reference when the user closes the panel
    activePanel.onDidDispose(() => {
      activePanel = undefined;
    });
  }

  // Reset the auto-close timer (track it so we can cancel on reuse)
  scheduleAutoClose(activePanel);
}

function buildWebviewHtml(art: string, quote: { text: string; author?: string }): string {
  const escapedArt = escapeHtml(art);
  const escapedText = escapeHtml(quote.text);
  const escapedAuthor = quote.author ? escapeHtml(quote.author) : "";

  const isLight = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Light;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fortune Cowsay</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --first-bg: ${isLight ? `#f6f8fa` : `#0d1117`};
      --second-bg: ${isLight ? `#fff` : `#161b22`};
      --third-bg: ${isLight ? `#f0f3f6` : `#21262d`};
      --first-text: ${isLight ? `#1f2328`: `#e6edf3`};
      --second-text: ${isLight ? `#57606a` : `#8b949e`};
      --third-text: ${isLight ? `#8c959f` : `#484f58`};
      --accent-text: ${isLight ? `#116329` : `#7ee787`};
      --first-border: ${isLight ? `#d0d7de` : `#30363d`};
      --accent-border: ${isLight ? `#0969da` : `#388bfd`};
      --first-shadow: ${isLight ? `rgba(0, 0, 0, 0.08)` : `rgba(0, 0, 0, 0.4)`};
    }

    body {
      background: var(--first-bg);
      color: var(--first-text);
      font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Courier New', monospace;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .container {
      max-width: 700px;
      width: 100%;
      animation: fadeIn 0.6s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .cowsay-box {
      background: var(--second-bg);
      border: 1px solid var(--first-border);
      border-radius: 8px;
      padding: 1.5rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 24px var(--first-shadow);
    }

    pre.art {
      color: var(--accent-text);
      font-size: 0.85rem;
      line-height: 1.5;
      white-space: pre;
      overflow-x: auto;
      tab-size: 4;
    }

    .quote-card {
      background: var(--second-bg);
      border-left: 3px solid var(--accent-border);
      border-radius: 0 8px 8px 0;
      padding: 1.25rem 1.5rem;
    }

    .quote-text {
      color: var(--first-text);
      font-size: 1rem;
      line-height: 1.7;
      font-style: italic;
      margin-bottom: 0.75rem;
    }

    .quote-author {
      color: var(--second-text);
      font-size: 0.85rem;
      text-align: right;
    }

    .footer {
      text-align: center;
      margin-top: 1.25rem;
      color: var(--third-text);
      font-size: 0.75rem;
    }

    .footer kbd {
      background: var(--third-bg);
      border: 1px solid var(--first-border);
      border-radius: 4px;
      padding: 1px 6px;
      font-family: inherit;
      font-size: 0.7rem;
      color: var(--second-text);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="cowsay-box">
      <pre class="art">${escapedArt}</pre>
    </div>

    <div class="quote-card">
      <div class="quote-text">"${escapedText}"</div>
      ${escapedAuthor ? `<div class="quote-author">— ${escapedAuthor}</div>` : ""}
    </div>

    <div class="footer">
      This tab closes automatically in 30 seconds &nbsp;·&nbsp;
      Run <kbd>Fortune Cowsay: Show Fortune Now</kbd> to see another
    </div>
  </div>
</body>
</html>`;
}

let autoCloseTimer: ReturnType<typeof setTimeout> | undefined;

function scheduleAutoClose(panel: vscode.WebviewPanel): void {
  // Cancel any previous timer so reuse doesn't double-close
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer);
  }
  autoCloseTimer = setTimeout(() => {
    try {
      panel.dispose();
    } catch {
      // Already closed
    }
    autoCloseTimer = undefined;
  }, 30_000);
}

// ─── Commands ───────────────────────────────────────────────────────────────

async function cmdEnable(): Promise<void> {
  await fortuneManager.setEnabled(true);
  vscode.window.showInformationMessage("🐄 Fortune Cowsay enabled! You'll see a fortune on next startup.");
}

async function cmdDisable(): Promise<void> {
  await fortuneManager.setEnabled(false);
  vscode.window.showInformationMessage("Fortune Cowsay disabled. Run 'Fortune Cowsay: Enable' to turn it back on.");
}

function cmdShowNow(): void {
  showStartupFortune();
}

async function cmdAddQuote(): Promise<void> {
  const text = await vscode.window.showInputBox({
    prompt: "Enter your quote text",
    placeHolder: "The only way to go fast is to go well.",
    validateInput: (v) => (v.trim().length < 5 ? "Quote must be at least 5 characters" : undefined),
  });

  if (!text) {
    return;
  }

  const author = await vscode.window.showInputBox({
    prompt: "Author (optional — press Enter to skip)",
    placeHolder: "Robert C. Martin",
  });

  await fortuneManager.addCustomQuote(text.trim(), author?.trim() || undefined);

  vscode.window.showInformationMessage(`✅ Quote added to your collection! (${fortuneManager.getCustomQuotes().length} custom quotes total)`);
}

async function cmdRemoveQuote(): Promise<void> {
  const customQuotes = fortuneManager.getCustomQuotes();

  if (customQuotes.length === 0) {
    vscode.window.showInformationMessage("You have no custom quotes to remove.");
    return;
  }

  const items: vscode.QuickPickItem[] = customQuotes.map((q, i) => ({
    label: `$(quote) ${q.text.slice(0, 60)}${q.text.length > 60 ? "…" : ""}`,
    description: q.author,
    detail: `Custom quote #${i + 1}`,
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: "Select a custom quote to remove",
    title: "Remove Custom Quote",
  });

  if (!selected) {
    return;
  }

  const index = items.indexOf(selected);
  await fortuneManager.removeCustomQuote(index);
  vscode.window.showInformationMessage("🗑️ Quote removed.");
}

async function cmdListQuotes(): Promise<void> {
  const all = fortuneManager.getAllQuotes();

  const items: vscode.QuickPickItem[] = all.map(({ quote, source }) => ({
    label: `$(quote) ${quote.text.slice(0, 70)}${quote.text.length > 70 ? "…" : ""}`,
    description: quote.author,
    detail: source === "custom" ? "$(star) Custom quote" : "$(library) Default collection",
  }));

  await vscode.window.showQuickPick(items, {
    placeHolder: `${all.length} quotes total — read-only view`,
    title: "All Fortune Quotes",
    canPickMany: false,
  });
}

async function cmdResetToDefaults(): Promise<void> {
  const confirm = await vscode.window.showWarningMessage(
    "This will remove all your custom quotes and reset settings to defaults. Continue?",
    { modal: true },
    "Yes, reset"
  );

  if (confirm === "Yes, reset") {
    await fortuneManager.resetToDefaults();
    vscode.window.showInformationMessage("♻️ Fortune Cowsay reset to defaults.");
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
