import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CleverSpringState, CleverSpringAction, CleverSpringSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CleverSpringGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cleverSpringPlugin: GamePlugin<CleverSpringState, CleverSpringAction, typeof settings> = {
  id: "clever-spring",
  title: "Clever: Spring",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "GSC seasonal variant; spring-themed cross-chain scoring sheet.",
  howToPlay: "Clever: Spring is a Ganz Schon Clever themed seasonal variant where spring colors (green, pink, yellow, blue) chain bonus scoring.\n\nEach round, click Roll to draw a die (1-6) representing a colored number. Click any empty cell to mark that color. Skip if no cell triggers a chain.\n\nScoring:\n- Each cell scores its pip (1-6).\n- +5 per fully crossed row (chain completion).\n- +5 per fully crossed column (color cascade).\n- +10 for full sheet (clever crown).\n\n12 rolls available. Spring rewards understanding the chain — yellow triggers green, pink triggers blue. In this 4x4 abstraction, that means rows and columns chain bonuses when you complete adjacent cells. Strategy: prioritize cells with the most adjacent crosses, since they unlock implicit chains. A baseline scores 35-55; mastering chains reaches 65+. Clever: Spring captures the cleverness of the GSC family in a quick, beautiful spring sheet. Bloom your chains; let the bonuses cascade.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CleverSpringSettings),
  reducer,
  isTerminal,
  component: CleverSpringGame,
};
