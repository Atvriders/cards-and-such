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
  description: "Two-player 18-card cyclic draft. Kingdoms scored over three ages.",
  howToPlay: "Tides of Time compresses a two-player 18-card draft into eight quick rounds. Each round, three offers appear and you pick one; the CPU takes the highest-rank remaining. Across eight rounds, you build a kingdom tableau from four card kinds: sun (royal), moon (mystical), star (mercantile), leaf (military). Score combines suits and ranks: three same-suit earn +10, five same-suit earn another +15, pairs of same rank earn +5, triples earn +10. Raw rank values sum too. Final score equals tableau plus +25 bonus if you beat the CPU. Strategy: in the original, you draft over three ages with cyclic passing. Here, focus on suit lock-in early, then high-rank cards in late rounds. The CPU greedily takes high-rank cards, so suit-focused low-rank cards slip past. Aim for 70-110 with bonus. Pure rank-chasing usually loses to a suit-focused player.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TidesOfTimeSettings),
  reducer,
  isTerminal,
  component: TidesOfTimeGame,
};
