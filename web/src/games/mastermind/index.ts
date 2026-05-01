import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MastermindState, MastermindAction, MastermindSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MastermindGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const mastermind_plugin: GamePlugin<MastermindState, MastermindAction, typeof settings> = {
  id: "mastermind",
  title: "Mastermind",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Crack the four-color code in 10 guesses.",
  howToPlay: "Mastermind adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MastermindSettings),
  reducer,
  isTerminal,
  component: MastermindGame,
};

export default mastermind_plugin;
