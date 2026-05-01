import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AmericanToadState, AmericanToadAction, AmericanToadSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AmericanToadGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const americanToadPlugin: GamePlugin<AmericanToadState, AmericanToadAction, typeof settings> = {
  id: "american-toad",
  title: "American Toad",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck American Toad: same-suit packing, one redeal.",
  howToPlay: "Two-deck American Toad: same-suit packing, one redeal. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AmericanToadSettings),
  reducer,
  isTerminal,
  component: AmericanToadGame,
};
