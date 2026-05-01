import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CheatBsState, CheatBsAction, CheatBsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CheatBsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const cheat_bs_plugin: GamePlugin<CheatBsState, CheatBsAction, typeof settings> = {
  id: "cheat-bs",
  title: "Cheat / BS",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spot the bluff.",
  howToPlay: "Cheat / BS adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CheatBsSettings),
  reducer,
  isTerminal,
  component: CheatBsGame,
};

export default cheat_bs_plugin;
