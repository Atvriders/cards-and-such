import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FiveHundredRumState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FiveHundredRum = /* @__PURE__ */ lazy(() => import("./FiveHundredRum.js").then((mod) => ({ default: mod.FiveHundredRum as unknown as React.ComponentType<unknown> })));
export const fiveHundredRumSettings = {
  numBots: {
    kind: "number" as const,
    label: "Bots",
    min: 1,
    max: 3,
    step: 1,
    default: 1,
  },
} as const;

type FiveHundredRumSettingsRaw = SettingsOf<typeof fiveHundredRumSettings>;
type FiveHundredRumAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }
  | { type: "layoff"; cardId: string; meldId: string }
  | { type: "discard"; cardId: string };

export const fiveHundredRumPlugin: GamePlugin<FiveHundredRumState, FiveHundredRumAction, typeof fiveHundredRumSettings> = {
  id: "five-hundred-rum",
  title: "500 Rum",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Race to 500 points by melding sets and runs. First to 500 wins!",
  howToPlay: `500 Rum (also called 500 Rummy) is a rummy variant where the goal is to be the first player to reach 500 points by melding cards from your hand.

Setup: Each player is dealt 7 cards from a standard 52-card deck. One card is flipped to start the discard pile; the remaining cards form the stock.

On your turn: Draw one card from the stock or take the top discard. Then meld sets (3 or 4 same-rank cards, all different suits) or runs (3+ consecutive same-suit cards) from your hand onto the table. You may also lay off individual cards onto existing melds at the table if they fit. Finally, discard one card to end your turn.

Scoring: Each card you meld scores its pip value. Aces score 15 points. Face cards (Jack, Queen, King) score 10 points. Number cards score their face value.

Winning: The first player to accumulate 500 or more points from melds wins the hand. Unlike Gin Rummy, there is no knock — you simply keep melding until someone crosses 500 or the stock runs out.

This version uses standard single-card draws — you take just the top card, whether from stock or discard.

Controls: Click the stock (face down) or discard pile to draw. Select cards in your hand and click Meld, or select one card and click Lay Off on an eligible table meld. Click a single card then Discard to end your turn.`,
  settings: fiveHundredRumSettings,
  initialState: (seed: number, s: FiveHundredRumSettingsRaw) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state: FiveHundredRumState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-five-hundred-rum-primary"]', pulses: 3 };
  },
  component: FiveHundredRum,
};
