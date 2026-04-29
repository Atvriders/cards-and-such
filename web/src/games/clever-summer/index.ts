import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CleverSummerState, CleverSummerAction, CleverSummerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CleverSummerGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cleverSummerPlugin: GamePlugin<CleverSummerState, CleverSummerAction, typeof settings> = {
  id: "clever-summer",
  title: "Clever: Summer",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "GSC summer variant; sun and reroll token scoring sheet.",
  howToPlay: "Clever: Summer is a Ganz Schon Clever summer variant adding sun tokens and reroll mechanics to the cross-chain framework.\n\nEach round, click Roll to draw a die (1-6). Click any empty cell to mark it. Skip if a roll wastes your sun tokens (here implicit in roll variance).\n\nScoring:\n- Each cell scores its pip (1-6).\n- +5 per row complete (sun cascade).\n- +5 per column complete (summer chain).\n- +10 for full sheet (clever sun crown).\n\n12 rolls total. Summer rewards aggressive chain-completion: you have enough rolls to fill the sheet if you don't skip too often. Strategy: place high pips at row+column intersections; place low pips at line ends to anchor bonus completions. A typical run scores 35-55; perfect sunny chains reach 65+. Clever: Summer is the warm-weather sister to Clever: Spring. Same elegant chain logic, sunnier theme. Twelve rolls of sun-drenched pip placement, with bonus scoring climbing as your sheet fills.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CleverSummerSettings),
  reducer,
  isTerminal,
  component: CleverSummerGame,
};
