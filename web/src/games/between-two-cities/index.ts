import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BetweenTwoCitiesState, BetweenTwoCitiesAction, BetweenTwoCitiesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BetweenTwoCitiesGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const betweenTwoCitiesPlugin: GamePlugin<BetweenTwoCitiesState, BetweenTwoCitiesAction, typeof settings> = {
  id: "between-two-cities",
  title: "Between Two Cities",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draft tiles for cities. Lowest of two scores you.",
  howToPlay: "Between Two Cities is a tile-drafting city-building game where each player builds two adjacent cities and is scored by the lower of the two. Here we abstract it: each round, three offers appear and you pick one; the CPU takes the highest-rank remaining. Eight rounds total. Cards represent four city types: sun (commercial), moon (residential), star (cultural), leaf (industrial). Score combines suits and ranks: three same-type earn +10, five same-type earn another +15, pairs of same rank earn +5, triples earn +10. Raw rank values sum too. Final score equals tableau plus +25 bonus if you beat the CPU. Strategy: in the original, you balance two cities; here, balance suit and rank, early picks build suit bonuses, late picks chase high ranks. Aim for 70-110 with bonus. The CPU's greedy rank-grab actually helps you: low-rank suit-focused cards keep slipping past.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BetweenTwoCitiesSettings),
  reducer,
  isTerminal,
  component: BetweenTwoCitiesGame,
};
