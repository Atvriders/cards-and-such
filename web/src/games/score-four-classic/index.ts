import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const scoreFourClassicPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "score-four-classic",
  title: "Score Four (Classic)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Connect Four in three dimensions; align four on a 4×4 base — flat simplification.",
  howToPlay: "Score Four is a 3D Connect Four played on a 4×4 pegged base; players slide rings or balls onto the pegs and try to align four in any direction. This Classic edition simplifies the 3D game to a flat 4×4 placement game where four-in-a-row in any straight direction wins.\n\nYou play first against a random CPU. Click any empty cell on the 4×4 grid to place your piece. The CPU plays a random legal move. The first to align four pieces in a row, column, or diagonal wins.\n\nThe board displays as a 4×4 grid. Your pieces show red; the CPU's pieces show blue.\n\nScore Four Classic tactics: control the center four cells of the grid, since they participate in the most lines. Build double threats — two ways to make four — so the CPU cannot block both. Because the CPU plays random legal moves, disciplined center-play and threat-building consistently wins. A win scores 100 plus a per-piece bonus; a draw scores 25; a loss scores zero. Score Four games end quickly with only sixteen cells, so finish in five or six moves for top scores.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  component: ConnectGame,
};
