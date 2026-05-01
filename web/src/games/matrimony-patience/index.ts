import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MatrimonyPatienceState, MatrimonyPatienceAction, MatrimonyPatienceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MatrimonyPatienceGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const matrimonyPatiencePlugin: GamePlugin<MatrimonyPatienceState, MatrimonyPatienceAction, typeof settings> = {
  id: "matrimony-patience",
  title: "Matrimony Patience",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck Matrimony with 16 reserve piles.",
  howToPlay: "Two-deck Matrimony with 16 reserve piles. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MatrimonyPatienceSettings),
  reducer,
  isTerminal,
  component: MatrimonyPatienceGame,
};
