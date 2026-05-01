import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThreeShufflesAndADrawState, ThreeShufflesAndADrawAction, ThreeShufflesAndADrawSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ThreeShufflesAndADrawGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const threeShufflesAndADrawPlugin: GamePlugin<ThreeShufflesAndADrawState, ThreeShufflesAndADrawAction, typeof settings> = {
  id: "three-shuffles-and-a-draw",
  title: "Three Shuffles & A Draw",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Lucie variant with three reshuffles and a final card draw.",
  howToPlay: "Lucie variant with three reshuffles and a final card draw. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ThreeShufflesAndADrawSettings),
  reducer,
  isTerminal,
  component: ThreeShufflesAndADrawGame,
};
