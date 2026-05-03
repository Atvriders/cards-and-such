import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type BingoState, type BingoAction } from "./state.js";
const Bingo = /* @__PURE__ */ lazy(() => import("./Bingo.js").then((mod) => ({ default: mod.Bingo as unknown as React.ComponentType<unknown> })));
export const bingoSettings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["easy", "medium", "hard"] as const, default: "medium" as const },
} as const;

export const bingoPlugin: GamePlugin<BingoState, BingoAction, typeof bingoSettings> = {
  id: "bingo",
  title: "Bingo",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mark your card as numbers are drawn. Beat the other cards to Bingo.",
  howToPlay: `Bingo is a classic number-matching game. You have a 5×5 card filled with numbers in five columns: B (1–15), I (16–30), N (31–45), G (46–60), and O (61–75). The center square is a FREE space — always marked.

Click "Draw Number" to reveal the next randomly drawn number (1–75). If that number appears on your card, click it to mark it. Keep drawing until you complete a full row, column, or diagonal — that's a Bingo!

But watch out: opponent cards are automatically marked for every drawn number. They never miss a mark. You have to manually click matching numbers on your own card, so stay alert!

Win by completing a line before any opponent does. Score is based on how few numbers were drawn before you called Bingo — fewer draws means a higher score.

Difficulty controls how many opponents you race against: Easy = 1 opponent, Medium = 3, Hard = 6. More opponents means the draw pile is contested by more cards, so winning gets harder.

Tips: scan your card before each draw so you can mark quickly. Diagonals and the center row/column through the free space complete fastest.`,
  settings: bingoSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-bingo-action"]', pulses: 3 }; },
  component: Bingo,
};
