import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpyfallMiniState, SpyfallMiniAction, SpyfallMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpyfallMiniGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const spyfall_mini_plugin: GamePlugin<SpyfallMiniState, SpyfallMiniAction, typeof settings> = {
  id: "spyfall-mini",
  title: "Spyfall Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify the location among 8.",
  howToPlay: "Spyfall Mini adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpyfallMiniSettings),
  reducer,
  isTerminal,
  component: SpyfallMiniGame,
};

export default spyfall_mini_plugin;
