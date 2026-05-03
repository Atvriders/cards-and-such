import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ContinentalRummyState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ContinentalRummy = /* @__PURE__ */ lazy(() => import("./ContinentalRummy.js").then((mod) => ({ default: mod.ContinentalRummy as unknown as React.ComponentType<unknown> })));
export const continentalRummySettings = {
  numBots: {
    kind: "number" as const,
    label: "Bots",
    min: 1,
    max: 3,
    step: 1,
    default: 1,
  },
} as const;

type ContinentalRummySettingsRaw = SettingsOf<typeof continentalRummySettings>;
type ContinentalRummyAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "go-out"; groups: string[][] }
  | { type: "discard"; cardId: string };

export const continentalRummyPlugin: GamePlugin<ContinentalRummyState, ContinentalRummyAction, typeof continentalRummySettings> = {
  id: "continental-rummy",
  title: "Continental Rummy",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Progressive rummy with contract requirements each round. Be first to go out!",
  howToPlay: `Continental Rummy is a multi-player rummy game played over three rounds, each with a specific "contract" — a required combination of melds you must fulfill to go out.

Setup: Each player receives 10 cards from a double deck plus jokers. One card starts the discard pile.

Round Contracts:
• Round 1: Two sets of 3 (same-rank groups)
• Round 2: One set of 3 plus one run of 4 (consecutive same-suit)
• Round 3: Two runs of 4

On your turn: Draw the top card of the stock or take the top discard card. You may then attempt to go out by fulfilling the round's contract, or simply discard a card to end your turn.

Going out: Select your cards into groups matching the contract, then click "Go Out." Any remaining unmelded cards in your hand become penalty points (face value). The first player to go out ends the round; all players tally penalty points from their remaining hand cards.

Scoring: Penalty points accumulate across rounds (lower is better). The player with the fewest total penalty points after all rounds wins.

Controls: Draw from stock or click discard. In the play phase, click cards to select them, then "Add Group" to stage a contract group. When all groups fulfill the contract, click "Go Out!" Or click a single card then "Discard" to pass.`,
  settings: continentalRummySettings,
  initialState: (seed: number, s: ContinentalRummySettingsRaw) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state: ContinentalRummyState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-continental-rummy-primary"]', pulses: 3 };
  },
  component: ContinentalRummy,
};
