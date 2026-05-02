import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AmongStarsStationState, AmongStarsStationAction, AmongStarsStationSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AmongStarsStationGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const amongStarsStationPlugin: GamePlugin<AmongStarsStationState, AmongStarsStationAction, typeof settings> = {
  id: "among-stars-station",
  title: "Among the Stars: Station",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Card-drafting: pick one of 4 each round, build combos.",
  howToPlay: "Among the Stars: Station is a card-drafting game over 9 rounds. Each round, 4 cards are revealed; pick one and the CPU greedily takes the highest-rank remaining. Cards belong to 5 suits: Diplomat, Military, Civic, Trade, Science. Score by combining suits and ranks: 3 of the same suit earns +10, 5 of the same suit earns another +20; pairs of the same rank earn +5, three-of-a-kind earns +12. Raw rank values sum into your tableau total. Final score equals your tableau plus a +25 bonus if you beat the CPU. Strategy: focus 1-2 suits to lock multiple suit bonuses; the CPU greedily grabs high-rank cards, so undervalued same-suit picks slip through.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AmongStarsStationSettings),
  reducer,
  isTerminal,
  hint: (state) => state.phase === "drafting" && state.offer.length > 0 ? { selector: '[class$="-offer"] > button:first-child', pulses: 3 } : null,
  component: AmongStarsStationGame,
};
