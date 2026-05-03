import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const kakugoMiniPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "kakugo-mini",
  title: "Kakugo (Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Gomoku variant with opening protocol; five-in-a-row on compact grid.",
  howToPlay: "Kakugo is a Gomoku variant whose opening protocol restricts early play to balance the first-mover advantage. The goal is the same: align five stones in a row, column, or diagonal. This Mini edition uses a 9×9 grid for a quicker, more accessible game.\n\nYou play first as black against a random CPU as white. Click any empty cell to place your stone. The CPU plays a random legal move. The first to align five stones wins. The opening-balance protocol is abstracted away in this simplified version.\n\nThe board displays as a 9×9 grid. Your stones show red; the CPU's stones show blue.\n\nKakugo Mini tactics: build open-three threats that force the CPU to block, then build a second threat in a different direction. With nine columns the diagonals are long enough to surprise an unobservant opponent. The CPU plays random legal moves, so methodical threat-building reliably wins. A win scores 100 plus a per-piece bonus; a draw is 25 points; a loss is zero. Aim for short five-piece wins for the highest score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  hint: (state) => state.phase === "playing" && state.turn === "P" ? { selector: ".cn-cell:not(.p):not(.c)", pulses: 3 } : null,
  component: ConnectGame,
};
