import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type HorseshoesState, type HorseshoesAction } from "./state.js";
import { Horseshoes } from "./Horseshoes.js";

export const horseshoesSettings = {
  targetScore: { kind: "enum" as const, label: "Target Score", options: ["11", "15", "21"] as const, default: "21" as const },
} as const;

export const horseshoesPlugin: GamePlugin<HorseshoesState, HorseshoesAction, typeof horseshoesSettings> = {
  id: "horseshoes",
  title: "Horseshoes",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Toss horseshoes at the peg. Ringers = 3, leaners = 2, close = 1. First to 21 wins.",
  howToPlay: `Horseshoes is a classic backyard tossing game played you versus the bot. Each turn both players throw two horseshoes at a stake (peg) in the ground.

Set your Power (ideal is around 70% — too light won't reach, too heavy overshoots) and Aim (center is ideal). When you're ready, click Toss to throw both shoes and let the bot take its turn.

Scoring uses cancellation rules: a Ringer (landing around the peg) scores 3 points. A Leaner (resting against the peg) scores 2. A Close shoe (within 6 inches) scores 1. A Miss scores nothing. However, equal ringers from both players cancel each other out — if you throw one ringer and the bot throws one ringer, neither scores. Only the player with uncancelled ringers (or closest shoes when no uncancelled ringers exist) scores this turn.

The first player to reach the target score (11, 15, or 21 — traditional is 21) wins.

Tips: consistency beats wild throws. Stay near 70% power and centered aim. The bot is moderately skilled, so a few ringers per round can decide the match.`,
  settings: horseshoesSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-horseshoes-action"]', pulses: 3 }; },
  component: Horseshoes,
};
