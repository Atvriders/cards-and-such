import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KingAlbertPatState, KingAlbertPatAction, KingAlbertPatSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KingAlbertPatGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const kingAlbertPatPlugin: GamePlugin<KingAlbertPatState, KingAlbertPatAction, typeof settings> = {
  id: "king-albert-pat",
  title: "King Albert Patience",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "King Albert Patience — a fully open 1+2+...+9 layout.",
  howToPlay: "King Albert Patience — a fully open 1+2+...+9 layout. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KingAlbertPatSettings),
  reducer,
  isTerminal,
  component: KingAlbertPatGame,
};
