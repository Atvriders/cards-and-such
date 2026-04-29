import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const pentagoMiniPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "pentago-mini",
  title: "Pentago (Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Five-in-a-row with rotating sub-grids — simplified to placement on 6×6.",
  howToPlay: "Pentago is a five-in-a-row game where after each placement the active player rotates one of four 3×3 sub-grids 90 degrees. The rotation makes it possible to build winning lines and break opponent threats simultaneously. This Mini edition simplifies Pentago to placement-only on a 6×6 board.\n\nYou play first as red against a random CPU as blue. Click any empty cell to place a stone. The CPU plays a random legal move. The first to align five stones in a row, column, or diagonal wins.\n\nThe board displays as a 6×6 grid divided visually into four sub-grids of 3×3. Your stones show red; the CPU's show blue.\n\nWithout rotations, Pentago Mini plays like a small-board Gomoku. Build open-three threats and double fours where possible. Five-in-a-row on a 6×6 board often runs through both sub-grid boundaries, so plan diagonals across them. The CPU plays random legal moves, so consistent threat-building reliably wins. A win scores 100 plus a per-piece bonus; a draw scores 25; a loss scores zero.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  component: ConnectGame,
};
