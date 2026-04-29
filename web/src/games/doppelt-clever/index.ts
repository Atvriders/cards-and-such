import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DoppeltCleverState, DoppeltCleverAction, DoppeltCleverSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DoppeltCleverGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const doppeltCleverPlugin: GamePlugin<DoppeltCleverState, DoppeltCleverAction, typeof settings> = {
  id: "doppelt-clever",
  title: "Doppelt So Clever (Twice as Clever)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Sequel GSC with white and grey dice and passing mechanism.",
  howToPlay: "Doppelt So Clever is the sequel to Ganz Schön Clever, adding white and grey dice plus a passing mechanism. In this adaptation you cross multi-coloured cells on a 4x4 grid by rolling a single d6 each turn and assigning the value to a cell. Click Roll, then click any empty cell to mark it with the rolled number. You may Skip a roll using the passing mechanism. Each marked cell scores its dice value. Strategy: chase row and column bonuses (+5 each) and the +10 full-sheet bonus. The clever-chain theme rewards sequencing: high values for new clusters, low values to close partial lines. Skipping is the passing mechanism — use it sparingly because each skip still counts as one of your 12 rolls. After 12 rolls the sheet finalises. A solid Doppelt Clever score is 34-48 points; chain-builders reach 65+. Each sheet starts from a fresh seeded dice sequence.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DoppeltCleverSettings),
  reducer,
  isTerminal,
  component: DoppeltCleverGame,
};
