import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CoupBluffState, CoupBluffAction, CoupBluffSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CoupBluffGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const coup_bluff_plugin: GamePlugin<CoupBluffState, CoupBluffAction, typeof settings> = {
  id: "coup-bluff",
  title: "Coup: Bluff Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Deduce hidden roles in Coup.",
  howToPlay: "Coup: Bluff Puzzle adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CoupBluffSettings),
  reducer,
  isTerminal,
  component: CoupBluffGame,
};

export default coup_bluff_plugin;
