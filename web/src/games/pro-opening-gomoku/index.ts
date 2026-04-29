import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const proOpeningGomokuPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "pro-opening-gomoku",
  title: "Pro Opening (Gomoku)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Gomoku with Pro opening center restriction; 9x9 grid.",
  howToPlay: "Pro Opening Gomoku restricts first moves to the center to prevent trivial first-player wins; this version is a Gomoku core with the Pro spirit. In this minimal single-player edition you face a random CPU on a 9x9 grid. Click any empty cell to drop a piece there; pieces stay where placed. You play first as red; the CPU answers in blue. The first side to align 5 of their pieces in a row, column, or diagonal wins the game outright. The CPU picks legal moves at random, so a little planning beats it consistently. Watch for double-threat positions where two lines could complete on your next move; a random CPU will usually only block one threat. Center play controls the most lines, so claim the middle early. Scoring rewards a win heavily: a victory grants 100 points plus a small bonus for every piece placed. A draw counts as 25 points; a loss is zero. One match per round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  component: ConnectGame,
};
