import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type SevensState, type SevensAction } from "./state.js";
import { Sevens } from "./Sevens.js";

export const sevensSettings = {
  opponents: { kind: "enum" as const, label: "Opponents", options: ["1", "2", "3"] as const, default: "2" as const },
} as const;

export const sevensPlugin: GamePlugin<SevensState, SevensAction, typeof sevensSettings> = {
  id: "sevens",
  title: "Sevens",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build four suit sequences out from the 7s. First to empty their hand wins.",
  howToPlay: `Sevens (also known as Fan Tan or Parliament) is a shedding card game where all 52 cards are dealt out evenly among 2–4 players.

The player holding the 7 of Diamonds goes first and must place it on the table. From there, play spreads outward in all four suits: each suit builds a sequence extending down from 7 (6, 5, 4, 3, 2, Ace) and up from 7 (8, 9, 10, Jack, Queen, King). You may only play a card if it extends an existing sequence by one step, or if you're placing a 7 to start a new suit row.

On your turn you must play a legal card if you have one. You may only pass if you have no legal plays. The first player to empty their hand completely wins.

The bots play automatically after you take your turn. They use a simple strategy: place 7s first, then extend sequences as available.

Tips: try to hold onto cards that are blocking your opponents from extending their sequences. Placing 7s early opens more options for everyone. Cards deep in blocked sequences can leave you stuck for many turns.

Settings: choose 1, 2, or 3 opponents to adjust difficulty and card distribution.`,
  settings: sevensSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-sevens-action"]', pulses: 3 }; },
  component: Sevens,
};
