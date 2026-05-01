import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TidesOfTimeState, TidesOfTimeAction, TidesOfTimeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TidesOfTimeGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const tidesOfTimePlugin: GamePlugin<TidesOfTimeState, TidesOfTimeAction, typeof settings> = {
  id: "tides-of-time-draft",
  title: "Tides of Time",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Card-drafting: pick one of 5 each round, build combos.",
  howToPlay: "Tides of Time is a card-drafting game over 5 rounds. Each round, 5 cards are revealed; pick one and the CPU greedily takes the highest-rank remaining. Cards belong to 5 suits: Royalty, Religion, Military, Culture, Mystic. Score by combining suits and ranks: 3 of the same suit earns +10, 5 of the same suit earns another +20; pairs of the same rank earn +5, three-of-a-kind earns +12. Raw rank values sum into your tableau total. Final score equals your tableau plus a +25 bonus if you beat the CPU. Strategy: focus 1-2 suits to lock multiple suit bonuses; the CPU greedily grabs high-rank cards, so undervalued same-suit picks slip through.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TidesOfTimeSettings),
  reducer,
  isTerminal,
  component: TidesOfTimeGame,
};
