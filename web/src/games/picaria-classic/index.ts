import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const picariaClassicPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "picaria-classic",
  title: "Picaria (Classic)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Native Zuni three-in-a-row; pieces slide after placement.",
  howToPlay: "Picaria is a traditional Native American (Zuni) three-in-a-row game played with three pieces per side. The full game has a placement phase followed by a sliding phase where pieces move to adjacent intersections. This Classic edition simplifies the game to placement only on a 3×3 grid extended by diagonal lines.\n\nYou play first against a random CPU. Click any empty cell to place a stone. The CPU plays a random legal move. The first player to align three stones in a row, column, or diagonal wins.\n\nThe board displays as a 3×3 grid of circular slots. Your stones show red; the CPU's stones show blue.\n\nPicaria's tactical core is identical to Tic-Tac-Toe — the center participates in four winning lines and is the strongest opening point. Each corner participates in three lines and edges only two. Against a random CPU, taking the center and watching for the CPU's missed blocks reliably wins. A win scores 100 plus a per-piece bonus; a draw scores 25; a loss scores zero.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  hint: (state) => state.phase === "playing" && state.turn === "P" ? { selector: ".cn-cell:not(.p):not(.c)", pulses: 3 } : null,
  component: ConnectGame,
};
