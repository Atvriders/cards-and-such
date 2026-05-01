import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BigHarpState, BigHarpAction, BigHarpSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BigHarpGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const bigHarpPlugin: GamePlugin<BigHarpState, BigHarpAction, typeof settings> = {
  id: "big-harp",
  title: "Big Harp",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bigger Harp variant — same shape, same engine.",
  howToPlay: "Bigger Harp variant — same shape, same engine. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BigHarpSettings),
  reducer,
  isTerminal,
  component: BigHarpGame,
};
