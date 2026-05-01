import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { IdiotsDelightState, IdiotsDelightAction, IdiotsDelightSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { IdiotsDelightGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const idiotsDelightPlugin: GamePlugin<IdiotsDelightState, IdiotsDelightAction, typeof settings> = {
  id: "idiots-delight",
  title: "Idiot's Delight",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Aces Up variant — drop the lower of any same-suit pair, leave the four aces.",
  howToPlay: "Aces Up variant — drop the lower of any same-suit pair, leave the four aces. Click a column to select it, click again to discard the top (legal only if a higher same-suit lurks elsewhere); click another column to move into an empty slot. Goal: only the four Aces remain.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as IdiotsDelightSettings),
  reducer,
  isTerminal,
  component: IdiotsDelightGame,
};
