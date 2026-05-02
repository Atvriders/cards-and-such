import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlackBoxMiniState, BlackBoxMiniAction, BlackBoxMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BlackBoxMiniGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const blackBoxMiniPlugin: GamePlugin<BlackBoxMiniState, BlackBoxMiniAction, typeof settings> = {
  id: "black-box-mini",
  title: "Black Box Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Probe the black box to locate hidden atoms.",
  howToPlay: "Black Box Mini adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BlackBoxMiniSettings),
  reducer,
  isTerminal,
  component: BlackBoxMiniGame,
};

export default blackBoxMiniPlugin;
