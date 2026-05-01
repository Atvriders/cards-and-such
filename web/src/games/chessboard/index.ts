import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChessboardState, ChessboardAction, ChessboardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChessboardGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const chessboardPlugin: GamePlugin<ChessboardState, ChessboardAction, typeof settings> = {
  id: "chessboard",
  title: "Chessboard",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Eight-column board with no redeals.",
  howToPlay: "Eight-column board with no redeals. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ChessboardSettings),
  reducer,
  isTerminal,
  component: ChessboardGame,
};
