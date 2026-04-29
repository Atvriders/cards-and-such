import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const gobbletClPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "gobblet-cl",
  title: "Gobblet (CL)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Gobblet four-in-a-row; place freely on 4x4.",
  howToPlay: "Gobblet is the four-in-a-row game where larger pieces gobble smaller ones; this connect-line minimal version focuses on the four-in-a-row alignment goal. In this minimal single-player edition you face a random CPU on a 4x4 grid. Click any empty cell to drop a piece there; pieces stay where placed. You play first as red; the CPU answers in blue. The first side to align 4 of their pieces in a row, column, or diagonal wins the game outright. The CPU picks legal moves at random, so a little planning beats it consistently. Watch for double-threat positions where two lines could complete on your next move; a random CPU will usually only block one threat. Center play controls the most lines, so claim the middle early. Scoring rewards a win heavily: a victory grants 100 points plus a small bonus for every piece placed. A draw counts as 25 points; a loss is zero. One match per round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  component: ConnectGame,
};
