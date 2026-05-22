import { type Quote } from './quotes';
export type CowCharacter = "cow" | "tux" | "dragon" | "ghostbusters" | "sheep";

export function renderCowsay(quote: Quote, character: CowCharacter = "cow"): string {
  const lines = wrapText(quote, 50);
  const bubble = makeBubble(lines);
  const art = getCharacter(character, lines.length);
  return `${bubble}\n${art}`;
}

function wrapText(quote: Quote, maxWidth: number): string[] {
  const words = quote.text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if ((current + " " + word).trim().length <= maxWidth) {
      current = (current + " " + word).trim();
    } else {
      if (current) {
        lines.push(current);
      }
      current = word;
    }
  }
  if (current) {
    lines.push(current);
  }

  if (quote.author) {
    lines.push(`— ${quote.author}`)
  }

  return lines;
}

function makeBubble(lines: string[]): string {
  const maxLen = Math.max(...lines.map((l) => l.length));
  const bar = "-".repeat(maxLen + 2);
  const top = `-${bar}-`;
  const bottom = `-${bar}-`;

  let bubble = top + "\n";
  lines.forEach((line, i) => {
    if (i === lines.length - 1 && line.startsWith("—")) {
      bubble += `| ${line.padStart(maxLen)} |\n`
    } else {

      bubble += `| ${line.padEnd(maxLen)} |\n`;
    }
  })
  bubble += bottom;
  return bubble;
}

function getCharacter(character: CowCharacter, messageLines: number): string {
  // Adjust the speech line connector based on message height
  const connector = messageLines <= 1 ? "        \\   " : "        \\   ";

  switch (character) {
    case "tux":
      return `${connector}
           \\
            \\
             .--.
            |o_o |
            |:_/ |
           //   \\ \\
          (|     | )
         /'\\_   _/\`\\
         \\___)=(___/`;

    case "dragon":
      return `${connector}
           \\
            \\
             /\\  /\\
            / \\ / \\
           /   X   \\
          / .     . \\
         /   \\ ^ /   \\
        /     |||     \\
       /      |||      \\
      /______/   \\______\\
              |||
             /|||\\
            / ||| \\`;

    case "ghostbusters":
      return `${connector}
           \\
            \\
             .-.
            ( o o )
            |  O  |
            |     |
             \\   /
              \`-'
            /|   |\\
           / |   | \\
          /  |___|  \\`;

    case "sheep":
      return `${connector}
           \\
            \\
             __
            UooU\\.
            ( ** )-.
           (( ** ))
           (( ** ))
            \`----'`;

    case "cow":
    default:
      return `${connector}
           \\   ^__^
            \\  (oo)\\_______
               (__)\\       )\\/\\
                   ||----w |
                   ||     ||`;
  }
}
