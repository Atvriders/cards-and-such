import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChroniclesOfCrimeState, ChroniclesOfCrimeAction, ChroniclesOfCrimeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChroniclesOfCrimeGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const chroniclesOfCrimePlugin: GamePlugin<ChroniclesOfCrimeState, ChroniclesOfCrimeAction, typeof settings> = {
  id: "chronicles-of-crime",
  title: "Chronicles of Crime",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Crime-scene deduction.",
  howToPlay: "Chronicles of Crime adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ChroniclesOfCrimeSettings),
  reducer,
  isTerminal,
  component: ChroniclesOfCrimeGame,
};

export default chroniclesOfCrimePlugin;
