import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const twelveMensMorrisClPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "twelve-mens-morris-cl",
  title: "Twelve Men's Morris (CL)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Twelve Men's Morris three-in-a-row mill game; 5x5 placement.",
  howToPlay: "Twelve Men's Morris is the largest Morris variant where diagonals also count; this connect-line edition is a 5x5 three-in-a-row puzzle. In this minimal single-player edition you face a random CPU on a 5x5 grid. Click any empty cell to drop a piece there; pieces stay where placed. You play first as red; the CPU answers in blue. The first side to align 3 of their pieces in a row, column, or diagonal wins the game outright. The CPU picks legal moves at random, so a little planning beats it consistently. Watch for double-threat positions where two lines could complete on your next move; a random CPU will usually only block one threat. Center play controls the most lines, so claim the middle early. Scoring rewards a win heavily: a victory grants 100 points plus a small bonus for every piece placed. A draw counts as 25 points; a loss is zero. One match per round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  hint: (state) => state.phase === "playing" && state.turn === "P" ? { selector: ".cn-cell:not(.p):not(.c)", pulses: 3 } : null,
  component: ConnectGame,
};
