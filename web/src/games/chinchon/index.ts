import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChinchonState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Game as unknown as React.ComponentType<unknown> })));
export const chinchonSettings = {} as const;
type ChinchonSettings = SettingsOf<typeof chinchonSettings>;
type ChinchonAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "discard"; cardId: string }
  | { type: "go-out" };

export const chinchonPlugin: GamePlugin<ChinchonState, ChinchonAction, typeof chinchonSettings> = {
  id: "chinchon",
  title: "Chinchón",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spanish rummy game. Form melds to minimize deadwood and go out first.",
  howToPlay: `Chinchón is a popular Spanish rummy-style card game played with a 40-card Spanish deck (Ace through 7, Jack, Queen, King — no 8, 9, or 10).

Setup: Each player is dealt 7 cards. One card is flipped to start the discard pile. Card values: Ace=1, 2–7 at face value, Jack=8, Queen=9, King=10.

Your turn:
1. Draw — take the top card from the stock pile or the top discard card.
2. Discard — play one card face-up on the discard pile.

Melds (green): Sets of 3+ cards of the same rank, or runs of 3+ consecutive cards in the same suit.

Deadwood (red): Cards not in any meld. Your "deadwood value" is the sum of those cards' point values.

Going out: If after drawing you can place all your cards into melds (zero deadwood), click "Go Out (Chinchón!)". The opponent's deadwood becomes their penalty score.

Winning: The player with lower deadwood wins. If the stock runs out, the player with less deadwood wins. Keep your deadwood low and watch for opportunities to go out!`,
  settings: chinchonSettings,
  initialState: (seed: number, _settings: ChinchonSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "draw") return { selector: '[data-testid="hint-target-chinchon-primary"]', pulses: 3 };
      return null;
    },
  component: Game,
};
