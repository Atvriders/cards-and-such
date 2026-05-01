import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChameleonBluffState, ChameleonBluffAction, ChameleonBluffSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChameleonBluffGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const chameleon_bluff_plugin: GamePlugin<ChameleonBluffState, ChameleonBluffAction, typeof settings> = {
  id: "chameleon-bluff",
  title: "The Chameleon",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Find the chameleon among words.",
  howToPlay: "The Chameleon adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ChameleonBluffSettings),
  reducer,
  isTerminal,
  component: ChameleonBluffGame,
};

export default chameleon_bluff_plugin;
