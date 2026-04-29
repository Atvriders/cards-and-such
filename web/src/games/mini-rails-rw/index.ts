import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniRailsRwState, MiniRailsRwAction, MiniRailsRwSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniRailsRwGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const miniRailsRwPlugin: GamePlugin<MiniRailsRwState, MiniRailsRwAction, typeof settings> = {
  id: "mini-rails-rw",
  title: "Mini Rails Roll & Write",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Stock and track roll-and-write with share value tied to line length.",
  howToPlay: "Mini Rails Roll & Write is a stock-and-track investment game where share value scales with line length. In this adaptation you build rail lines and stock holdings on a 4x4 grid by rolling a single d6 each turn and assigning the value to a track cell. Click Roll, then click any empty cell to mark it with the rolled number. You may Skip a roll if it doesn't help. Each marked cell scores its dice value as share dividend. Strategy: complete rows and columns to drive up share prices for long routes (+5 bonus each), plus +10 for completing the full board. Higher rolls signify premium shares, lower rolls fill out portfolio risk. After 12 rolls the market closes. A solid Mini Rails score is 34-48 points; an exceptional speculator reaches 65+. Each stock era begins from a fresh seeded dice sequence.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MiniRailsRwSettings),
  reducer,
  isTerminal,
  component: MiniRailsRwGame,
};
