import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DeadlyDowagersState, DeadlyDowagersAction, DeadlyDowagersSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DeadlyDowagersGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const deadlyDowagersPlugin: GamePlugin<DeadlyDowagersState, DeadlyDowagersAction, typeof settings> = {
  id: "deadly-dowagers",
  title: "Deadly Dowagers",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify the deadly dowager.",
  howToPlay: "Deadly Dowagers adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DeadlyDowagersSettings),
  reducer,
  isTerminal,
  component: DeadlyDowagersGame,
};

export default deadlyDowagersPlugin;
