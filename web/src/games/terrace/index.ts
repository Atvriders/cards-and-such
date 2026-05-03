import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TerraceState, TerraceAction, TerraceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Terrace } from "./Terrace.js";

export const terraceSettings = {} as const;

export const terracePlugin: GamePlugin<TerraceState, TerraceAction, typeof terraceSettings> = {
  id: "terrace",
  title: "Terrace",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build foundations up by suit from a random starting rank on this terrace-style layout.",
  howToPlay: `Terrace is a solitaire game notable for its tiered layout and wrapping foundations.

Setup: Nine cards are dealt face-up to the terrace (top row). One card is placed on the first foundation — its rank becomes the base rank for all four foundations. Nine tableau columns of four cards each follow (only top card face-up). Remaining cards form the stock.

Foundations: All four foundations build upward in suit, wrapping from King back to Ace. Every foundation starts with the same base rank as the first foundation card.

Tableau: Build down in alternating colors. Any face-up sequence may be moved as a group. Empty columns may be filled by any card.

Terrace row: Terrace cards may be moved to foundations or onto tableau columns (one at a time), but no card may be moved to the terrace from elsewhere.

Stock: Draw one card at a time to waste. The waste top is playable to tableau or foundations.

Goal: Move all 52 cards onto the four foundations.

Tip: The terrace row is one-way — use those cards early to build foundations and open tableau space before the stock runs out.`,
  settings: terraceSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-terrace-action"]', pulses: 3 }; },
  component: Terrace,
};
