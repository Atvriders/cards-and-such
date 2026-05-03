import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BoliviaState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Bolivia } from "./Bolivia.js";

export const boliviaSettings = {
  botCount: {
    kind: "number" as const,
    label: "Bots",
    min: 1,
    max: 3,
    step: 1,
    default: 1,
  },
} as const;

type BoliviaSettingsRaw = SettingsOf<typeof boliviaSettings>;
type BoliviaAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }
  | { type: "discard"; cardId: string };

export const boliviaPlugin: GamePlugin<BoliviaState, BoliviaAction, typeof boliviaSettings> = {
  id: "bolivia",
  title: "Bolivia",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Canasta variant with wild-card-only melds. Form a Bolivia (7 wilds) for massive points!",
  howToPlay: `Bolivia is a Canasta variant played with 2 standard decks plus 4 jokers (108 cards total). It introduces a unique twist: wild cards (2s and Jokers) count double in scoring and can form their own melds.

Setup: Each player receives 11 cards. One card is flipped to start the discard pile; the rest form the stock.

On your turn: Draw the top card of the stock or take the top discard. Then meld, and finally discard one card to end your turn.

Melds: Standard sets of 3+ same-rank cards (wilds may fill in, but wilds must not exceed naturals, max 3 wilds per meld). Rank-3 cards cannot be melded. Additionally, you may form a wild-only meld using 3 or more 2s and Jokers.

Bolivia: A wild-only meld of 7 or more cards earns an extraordinary +2500 point bonus — this is the "Bolivia." Wild cards score 40 points each in Bolivia's scoring (double the usual).

Canasta: A standard 7-card set earns the usual +500 bonus.

Going out: Exhaust your hand and have at least one Canasta or Bolivia to earn +100 and end the game.

Controls: Draw from stock or click discard. Select cards to meld, then click Meld. Click a single card and Discard to end your turn.`,
  settings: boliviaSettings,
  initialState: (seed: number, s: BoliviaSettingsRaw) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state: BoliviaState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-bolivia-primary"]', pulses: 3 };
  },
  component: Bolivia,
};
