import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniBakerDozenState, MiniBakerDozenAction, MiniBakerDozenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniBakerDozenGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const miniBakerDozenPlugin: GamePlugin<MiniBakerDozenState, MiniBakerDozenAction, typeof settings> = {
  id: "mini-baker-dozen",
  title: "Mini Baker's Dozen",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mini Baker's Dozen — 13 four-card columns, fully open.",
  howToPlay: "Mini Baker's Dozen — 13 four-card columns, fully open. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MiniBakerDozenSettings),
  reducer,
  isTerminal,
  component: MiniBakerDozenGame,
};
