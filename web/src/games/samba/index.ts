import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SambaState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Samba } from "./Samba.js";

export const sambaSettings = {
  botCount: {
    kind: "number" as const,
    label: "Bots",
    min: 1,
    max: 3,
    step: 1,
    default: 1,
  },
} as const;

type SambaSettingsRaw = SettingsOf<typeof sambaSettings>;
type SambaAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }
  | { type: "discard"; cardId: string };

export const sambaPlugin: GamePlugin<SambaState, SambaAction, typeof sambaSettings> = {
  id: "samba",
  title: "Samba",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Canasta variant that adds runs as valid melds. Hit a 7-card run for a Samba bonus!",
  howToPlay: `Samba is a Canasta variant played with 3 standard decks plus 6 jokers (162 cards total). It extends classic Canasta by allowing runs — consecutive cards of the same suit — as legal melds alongside the usual sets.

Setup: Each player is dealt 13 cards. One card starts the discard pile; the rest form the stock.

On your turn: Draw the top card of the stock or take the top discard. Then meld cards from your hand and discard one card to end your turn.

Two types of melds are allowed. Sets are groups of 3 or more same-rank cards (wilds allowed, max 3 wilds, wilds ≤ naturals). Runs are 3 or more consecutive same-suit cards with no wild cards — Ace can be high or low.

Scoring bonuses: A 7-card set (Canasta) earns +500. A 7-card run (Samba) earns a massive +1500 bonus. Natural canastas (no wilds) score 500; mixed canastas score 300.

Going out: When your hand is empty and you have formed at least one Canasta or Samba, you earn a 100-point going-out bonus.

Controls: Draw from stock or click discard. Select cards in your hand, then click Meld to place them. Click a single selected card then Discard to end your turn.`,
  settings: sambaSettings,
  initialState: (seed: number, s: SambaSettingsRaw) => initialState(seed, s),
  reducer,
  isTerminal,
  component: Samba,
};
