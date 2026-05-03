import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type GoFishState, type GoFishAction } from "./state.js";
import { GoFish } from "./GoFish.js";

export const goFishSettings = {
  opponents: { kind: "enum" as const, label: "Opponents", options: ["1", "2", "3"] as const, default: "2" as const },
} as const;

export const goFishPlugin: GamePlugin<GoFishState, GoFishAction, typeof goFishSettings> = {
  id: "go-fish",
  title: "Go Fish",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ask other players for ranks to collect sets of four.",
  howToPlay: `Collect all 13 books — one per rank — before the other players do. A book is all four cards of the same rank (e.g., all four Aces).

On your turn, pick a rank you already hold and ask any bot player for it. If they have cards of that rank they must hand them all over and you go again. If they don't, you "Go Fish" — draw one card from the ocean (the central draw pile). If the drawn card matches the rank you asked for, you get another turn; otherwise play passes clockwise. Completed books are removed from your hand automatically. Bots take their turns automatically. Choose 1, 2, or 3 opponents in settings; with one opponent each player starts with 7 cards, otherwise 5.

Scoring: if you have the most books and are the sole winner you score 100 points per book plus a 100-point win bonus. Any other result (loss or tie) scores 50 points per book you collected.

Tips: ask for ranks where you already hold 2 or 3 cards — the odds of a hit are higher. Track what opponents request so you can anticipate their books.`,
  settings: goFishSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-go-fish-action"]', pulses: 3 }; },
  component: GoFish,
};
