import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PubGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const cribbageSkunkPlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "cribbage-skunk",
  title: "Cribbage: Skunk",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Loser failing to pass 61 is skunked, doubling losses.",
  howToPlay: "Cribbage: Skunk applies the famous skunk rule: if the loser fails to peg past 61 they are 'skunked' and lose two games in a row. In this digital adaptation you peg eight rounds (random points 1-15 each) against the CPU. The race-to-121 target stops at round 8; the higher score wins. Skunking happens when the lower-score player is below 61 after the final round — the winner's score doubles in the report. The skunk threat is the central drama: trailing players scramble to peg into the safer 60s. Press Peg each round; you'll see your line and the CPU's advance. Skunk is far more frequent than the further Double Skunk; expect to be skunked or skunk in roughly one in every four games. The rule preserves classic British pub-cribbage etiquette. Tighten your luck — and remember, peg counts come from a random roll, so victories rest on dice fortune more than tactics.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: PubGame,
};
