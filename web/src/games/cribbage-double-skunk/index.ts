import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PubGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const cribbageDoubleSkunkPlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "cribbage-double-skunk",
  title: "Cribbage: Double Skunk",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Failing to pass 31 by game-end is a double skunk.",
  howToPlay: "Cribbage: Double Skunk is the brutal cousin to Skunk: if the loser fails to peg past 31 by game-end they are double-skunked, losing four game equivalents. Across eight rounds, peg random points (1-15) against the CPU. Race to 121 (capped at round 8). The lower-score player suffers a single skunk if under 61, or a double skunk if under 31 — quadrupling the winner's score in the report. Double skunks happen rarely (around 5% of games) but are devastating; many tournament leagues track double-skunk count separately. Press Peg each round; both players advance simultaneously. The early rounds set the floor: a slow start risks a 31-cap disaster. While the original pub-cribbage version weights skill, here it is dice-driven with the added rules layered on top. The variant is strictly for cribbage players who enjoy the cliff-edge tension of a possible quadruple humiliation. Use it as a tiebreaker after regular cribbage night.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: PubGame,
};
