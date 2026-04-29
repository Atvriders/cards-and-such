import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MichiganNewmarketState, MichiganNewmarketAction, MichiganNewmarketSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MichiganNewmarketGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const michiganNewmarketPlugin: GamePlugin<MichiganNewmarketState, MichiganNewmarketAction, typeof settings> = {
  id: "michigan-newmarket", title: "Michigan (Newmarket)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Stops/boodle shedding game with betting on key payout cards.",
  howToPlay: "Michigan, also called Newmarket or Boodle, is a stops-style shedding game with betting components. Four boodle cards (specific payout cards from a separate deck) are placed on a board and players ante chips to each. The dealer plays the lowest card of any suit and players follow upward in the same suit; when nobody can continue (a stop), the next player starts a new suit. Whoever plays a boodle card collects the chips on it. The first to empty their hand wins the round and collects a kitty bonus. In this one-on-one CPU duel across six rounds, click Play Round to ante, deal, and play. Strategy: play your low cards aggressively to start the suit chain, hoarding high cards for stops. Hold boodle-matching cards (Q♥, J♦, 10♣, A♠) as long as possible to maximize their chip pot. Aim for at least three round wins and a chip total above eighty for a respectable Michigan finish.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MichiganNewmarketSettings),
  reducer, isTerminal, component: MichiganNewmarketGame,
};
