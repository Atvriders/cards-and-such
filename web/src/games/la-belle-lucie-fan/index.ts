import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LaBelleLucieFanState, LaBelleLucieFanAction, LaBelleLucieFanSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LaBelleLucieFanGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const laBelleLucieFanPlugin: GamePlugin<LaBelleLucieFanState, LaBelleLucieFanAction, typeof settings> = {
  id: "la-belle-lucie-fan",
  title: "La Belle Lucie (Fan)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Lucie's classic 17 fans of three with two reshuffles.",
  howToPlay: "Lucie's classic 17 fans of three with two reshuffles. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LaBelleLucieFanSettings),
  reducer,
  isTerminal,
  component: LaBelleLucieFanGame,
};
