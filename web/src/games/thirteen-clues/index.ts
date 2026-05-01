import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThirteenCluesState, ThirteenCluesAction, ThirteenCluesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ThirteenCluesGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const thirteen_clues_plugin: GamePlugin<ThirteenCluesState, ThirteenCluesAction, typeof settings> = {
  id: "thirteen-clues",
  title: "13 Clues",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solve a murder by deducing the secret card combo.",
  howToPlay: "13 Clues adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ThirteenCluesSettings),
  reducer,
  isTerminal,
  component: ThirteenCluesGame,
};

export default thirteen_clues_plugin;
