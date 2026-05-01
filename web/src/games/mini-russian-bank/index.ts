import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniRussianBankState, MiniRussianBankAction, MiniRussianBankSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniRussianBankGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const miniRussianBankPlugin: GamePlugin<MiniRussianBankState, MiniRussianBankAction, typeof settings> = {
  id: "mini-russian-bank",
  title: "Mini Russian Bank",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mini Russian Bank — four columns of four, fully open.",
  howToPlay: "Mini Russian Bank — four columns of four, fully open. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MiniRussianBankSettings),
  reducer,
  isTerminal,
  component: MiniRussianBankGame,
};
