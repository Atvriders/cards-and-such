import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { InsiderQuizState, InsiderQuizAction, InsiderQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { InsiderQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const insiderQuizPlugin: GamePlugin<InsiderQuizState, InsiderQuizAction, typeof settings> = {
  id: "insider-quiz",
  title: "Insider",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Detect the insider.",
  howToPlay: "Insider adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as InsiderQuizSettings),
  reducer,
  isTerminal,
  component: InsiderQuizGame,
};

export default insiderQuizPlugin;
