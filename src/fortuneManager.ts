import * as vscode from "vscode";
import { Quote, SHORT_QUOTES, LONG_QUOTES } from "./quotes";

export type QuoteType = "short" | "long" | "both";

export class FortuneManager {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  private getConfig(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration("fortuneCowsay");
  }

  isEnabled(): boolean {
    return this.getConfig().get<boolean>("enabled", true);
  }

  async setEnabled(enabled: boolean): Promise<void> {
    await this.getConfig().update("enabled", enabled, vscode.ConfigurationTarget.Global);
  }

  getQuoteType(): QuoteType {
    return this.getConfig().get<QuoteType>("quoteType", "short");
  }

  useCustomOnly(): boolean {
    return this.getConfig().get<boolean>("useCustomOnly", false);
  }

  getCustomQuotes(): Quote[] {
    return this.getConfig().get<Quote[]>("customQuotes", []);
  }

  async addCustomQuote(text: string, author?: string): Promise<void> {
    const quotes = this.getCustomQuotes();
    const newQuote: Quote = author ? { text, author } : { text };
    quotes.push(newQuote);
    await this.getConfig().update("customQuotes", quotes, vscode.ConfigurationTarget.Global);
  }

  async removeCustomQuote(index: number): Promise<void> {
    const quotes = this.getCustomQuotes();
    if (index >= 0 && index < quotes.length) {
      quotes.splice(index, 1);
      await this.getConfig().update("customQuotes", quotes, vscode.ConfigurationTarget.Global);
    }
  }

  async resetToDefaults(): Promise<void> {
    await this.getConfig().update("customQuotes", [], vscode.ConfigurationTarget.Global);
    await this.getConfig().update("useCustomOnly", false, vscode.ConfigurationTarget.Global);
  }

  getRandomQuote(): Quote {
    const customQuotes = this.getCustomQuotes();

    if (this.useCustomOnly()) {
      if (customQuotes.length === 0) {
        return { text: "Add some custom quotes to see them here!", author: "Fortune Cowsay" };
      }
      return this.pickRandom(customQuotes);
    }

    const quoteType = this.getQuoteType();
    let pool: Quote[] = [];

    if (quoteType === "short") {
      pool = [...SHORT_QUOTES];
    } else if (quoteType === "long") {
      pool = [...LONG_QUOTES];
    } else {
      pool = [...SHORT_QUOTES, ...LONG_QUOTES];
    }

    // Mix in custom quotes if any exist
    if (customQuotes.length > 0) {
      pool = [...pool, ...customQuotes];
    }

    return this.pickRandom(pool);
  }

  private pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  getAllQuotes(): { index: number; quote: Quote; source: "default" | "custom" }[] {
    const result: { index: number; quote: Quote; source: "default" | "custom" }[] = [];

    const quoteType = this.getQuoteType();
    let defaults: Quote[] = [];

    if (quoteType === "short") {
      defaults = SHORT_QUOTES;
    } else if (quoteType === "long") {
      defaults = LONG_QUOTES;
    } else {
      defaults = [...SHORT_QUOTES, ...LONG_QUOTES];
    }

    defaults.forEach((q, i) => result.push({ index: i, quote: q, source: "default" }));

    const custom = this.getCustomQuotes();
    custom.forEach((q, i) => result.push({ index: i, quote: q, source: "custom" }));

    return result;
  }
}
