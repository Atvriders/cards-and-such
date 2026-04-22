import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { FanoronaState, FanoronaAction, FanoronaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Fanorona } from "./Game.js";

const settings = {} as const;

export const fanoronaPlugin: GamePlugin<FanoronaState, FanoronaAction, typeof settings> = {
  id: "fanorona",
  title: "Fanorona",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Malagasy strategy game — capture by approach or withdrawal.",
  howToPlay: `Fanorona is a traditional strategy game from Madagascar, played on a 5×9 grid where intersections are connected by lines (orthogonally and diagonally at alternate points). You play White; the bot plays Black. The player who captures all opponent pieces wins.

On your turn, select one of your white pieces, then click an adjacent empty intersection to move there. There are two ways to capture: Approach — move toward a line of opponent pieces, capturing all consecutive opponent pieces in that direction. Withdrawal — move away from a line of opponent pieces, capturing all consecutive pieces behind you in the direction you came from. Highlighted squares show green (approach) or blue (withdrawal) capture options.

After capturing, if the same piece can capture again from its new position in a different direction, you must continue (this is a chain capture). Click "End Turn" when you choose to stop capturing even if more captures are available.

Non-capturing moves are only allowed when no captures are possible. The bot searches two moves ahead using minimax. Strategy tip: control the center and create multiple capture threats simultaneously.`,
  settings,
  initialState: (seed: number, s: FanoronaSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: Fanorona,
};
