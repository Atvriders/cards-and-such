import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PubGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const cribbageCrashPlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "cribbage-crash",
  title: "Cribbage: Crash",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cribbage variant where exact peg score reverses progress.",
  howToPlay: "Cribbage: Crash is a tense bar variant where landing on an exact peg score (multiples of 30) reverses your progress instead of pegging forward. Race a virtual opponent to 121 over ten dice-driven rounds. Each round you press Peg to advance a random number of points (1-15). If your total lands exactly on a 30-multiple, the score crashes back by 30 points (cannot go below zero). The CPU also pegs each round and is similarly susceptible to crashes. The crash rule sounds harsh but introduces real swings; some games end with both sides crashing repeatedly into the 90s. After ten rounds whoever pegs higher wins. Track your peg position with the on-screen score line. Strategy is reduced to luck-of-the-roll, like the bar-pub original where Crash blanks any pegging that overshoots into the danger zone. The variant rewards consistency over big rolls and adds a chuckle when an opponent crashes near the finish line.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: PubGame,
};
