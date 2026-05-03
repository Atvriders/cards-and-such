import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SlitherState, SlitherAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SlitherGame } from "./Game.js";

const settings = {} as const;

export const slitherPlugin: GamePlugin<SlitherState, SlitherAction, typeof settings> = {
  id: "slither",
  title: "Slither",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "8×8 chain game — slide pieces to form the longest connected snake.",
  howToPlay: `Slither is an abstract strategy game played on an 8×8 grid. Each player controls 8 pieces arranged in a row — you play dark (row 7 from top), the bot plays light (row 2 from top). Pieces form chains through orthogonal adjacency (up, down, left, right).

On your turn, select one of your dark pieces and slide it to an adjacent empty square (orthogonal only). Two rules constrain movement:

Chain integrity: you cannot move a piece that would disconnect the remaining pieces of your chain. If removing it would leave any other piece isolated, it cannot be moved.

Adjacency requirement: the destination square must be adjacent to at least one of your remaining pieces (after the selected piece leaves). You are essentially "sliding" the chain — it must remain contiguous.

Win condition: be the first to form a connected chain of 6 or more of your pieces.

The game has an elegant flow: pieces slide along, reforming the chain like a snake. Moving a piece from one end and placing it ahead creates serpentine chains that grow and shift across the board.

Strategy: elongate your chain along a direct path while trying to block or split the bot's chain. Diagonal approaches can force the bot's chain to back up. Watch for the bot's chain length — if it reaches 5, you must interrupt its extension.

Bot: greedy — extends its own chain, blocks human near-wins of 5+.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".sli-svg")) ? { selector: ".sli-svg", pulses: 3 } : null,
  component: SlitherGame,
};
