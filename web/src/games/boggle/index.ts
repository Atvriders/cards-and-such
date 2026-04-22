import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BoggleState, BoggleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Boggle } from "./Boggle.js";

export const boggleSettings = {
  size: {
    kind: "enum" as const,
    label: "Grid size",
    options: ["4", "5"] as const,
    default: "4" as const,
  },
  duration: {
    kind: "enum" as const,
    label: "Time (seconds)",
    options: ["120", "180", "240"] as const,
    default: "180" as const,
  },
} as const;

type BoggleSettingsType = SettingsOf<typeof boggleSettings>;

export const bogglePlugin: GamePlugin<BoggleState, BoggleAction, typeof boggleSettings> = {
  id: "boggle",
  title: "Boggle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Find words by tracing adjacent letters on a grid before time runs out.",
  howToPlay: `Boggle gives you a grid of random letters — 4×4 or 5×5 — and a countdown timer. Your goal is to find as many valid English words as possible by tracing a path through adjacent letters before time runs out.

How to trace a word: click the first letter of your word, then click each subsequent letter. Each letter you click must be adjacent (horizontally, vertically, or diagonally) to the previous one. You cannot reuse a letter cell in the same word. Click an already-selected cell to trim the path back to that point.

Words must be at least 3 letters long and must appear in the dictionary. When your path spells a valid word, click Submit. Duplicate words are rejected.

Scoring is based on word length: 3–4 letters = 1 point, 5 letters = 2 points, 6 letters = 3 points, 7 letters = 5 points, 8 or more letters = 11 points. Longer words are worth dramatically more, so hunt for those hidden 7- and 8-letter paths.

Tips: look for prefixes and suffixes like RE-, UN-, -ING, -ED, -ER. Common short words (the, and, are) do not count. Scan diagonals — they open paths unavailable on straight lines. With the 5×5 grid and 4-minute timer, experienced players can find 30+ words.`,
  settings: boggleSettings,
  initialState: (seed: number, settings: BoggleSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Boggle,
};
