import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const daraClassicPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "dara-classic",
  title: "Dara (Classic)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Nigerian Morris-like game; rows of three score capture chances.",
  howToPlay: "Dara is a traditional Nigerian board game from the Dakarkari, Jaba, and Zarma peoples. Twelve pieces per side are placed on a 6×7 grid; aligning three forms a 'da' (a row) and captures one of the opponent's pieces. This Classic edition simplifies Dara to a placement-only three-in-a-row game on a 5×6 grid.\n\nYou play first against a random CPU. Click any empty cell to place a stone. The CPU plays a random legal move. The first player to align three stones in a row, column, or diagonal wins.\n\nThe board displays as a 5×6 grid of circular slots. Your stones show red; the CPU's stones show blue.\n\nDara play in this simplified version emphasizes building double threats: two open-twos in different directions force the CPU to block only one, leaving you the other for a win. Center-cluster placement wins more reliably than corners since each central cell participates in more potential rows. A win scores 100 plus a per-piece bonus; a draw scores 25.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  hint: (state) => state.phase === "playing" && state.turn === "P" ? { selector: ".cn-cell:not(.p):not(.c)", pulses: 3 } : null,
  component: ConnectGame,
};
