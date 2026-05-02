import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClueMiniState, ClueMiniAction, ClueMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ClueMiniGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const clueMiniPlugin: GamePlugin<ClueMiniState, ClueMiniAction, typeof settings> = {
  id: "clue-mini",
  title: "Clue Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Murder, Suspect, Location, Weapon.",
  howToPlay: "Clue Mini adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ClueMiniSettings),
  reducer,
  isTerminal,
  component: ClueMiniGame,
};

export default clueMiniPlugin;
