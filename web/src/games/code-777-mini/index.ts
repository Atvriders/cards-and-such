import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Code777MiniState, Code777MiniAction, Code777MiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Code777MiniGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const code_777_mini_plugin: GamePlugin<Code777MiniState, Code777MiniAction, typeof settings> = {
  id: "code-777-mini",
  title: "Code 777 Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Logic puzzle: deduce the seven-symbol code.",
  howToPlay: "Code 777 Mini adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Code777MiniSettings),
  reducer,
  isTerminal,
  component: Code777MiniGame,
};

export default code_777_mini_plugin;
