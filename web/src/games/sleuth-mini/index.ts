import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SleuthMiniState, SleuthMiniAction, SleuthMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SleuthMiniGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sleuthMiniPlugin: GamePlugin<SleuthMiniState, SleuthMiniAction, typeof settings> = {
  id: "sleuth-mini",
  title: "Sleuth Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Deduce hidden gem combination.",
  howToPlay: "Sleuth Mini adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SleuthMiniSettings),
  reducer,
  isTerminal,
  component: SleuthMiniGame,
};

export default sleuthMiniPlugin;
