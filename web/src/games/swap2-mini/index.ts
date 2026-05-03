import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const swap2MiniPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "swap2-mini",
  title: "Swap2 Opening (Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Five-in-a-row with the Swap2 balancing opening protocol — simplified.",
  howToPlay: "Swap2 is an opening protocol used in tournament Gomoku to balance the first-player advantage. The first player sets up three opening stones; the second can swap colors, swap positions, or accept. This Mini edition uses a 10×10 grid and abstracts the swap protocol to standard turn-based play.\n\nYou play first as black against a random CPU as white. Click any empty cell to place your stone. The CPU plays a random legal move. The first player to align five stones in a row, column, or diagonal wins.\n\nThe board displays as a 10×10 grid. Your stones show red; the CPU's stones show blue.\n\nSwap2 Mini tactics center on open-three and open-four threats. An open four cannot be blocked from both sides in one move, so it forces a winning five next turn. Watch for the CPU's threats and block them. Because the CPU plays random legal moves, careful threat building reliably wins. A win scores 100 points plus a per-piece bonus; a draw scores 25; a loss scores zero. Aim for clean wins on as few pieces as possible.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  hint: (state) => state.phase === "playing" && state.turn === "P" ? { selector: ".cn-cell:not(.p):not(.c)", pulses: 3 } : null,
  component: ConnectGame,
};
