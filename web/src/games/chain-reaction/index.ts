import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { ChainReactionState, ChainReactionAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChainReactionGame } from "./Game.js";

const settings = {} as const;

export const chainReactionPlugin: GamePlugin<ChainReactionState, ChainReactionAction, typeof settings> = {
  id: "chain-reaction",
  title: "Chain Reaction",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place orbs to trigger chain explosions and capture the entire grid from the bot.",
  howToPlay: `Chain Reaction is a territorial explosion game played on a 6×6 grid. You play blue (player 0) against a red bot.

Each cell has a critical mass: corners hold 2 orbs, edge cells hold 3, and interior cells hold 4. On your turn, click any empty cell or one of your own blue cells to add an orb. When a cell reaches its critical mass it EXPLODES — sending one orb to each orthogonal neighbor and converting those neighbors to your color, regardless of who owned them before. This can trigger chain reactions cascading across the grid!

The bot uses a greedy strategy, always choosing the move that maximizes its orb count while minimizing yours. It moves immediately after your turn.

Win by eliminating all opponent orbs — once the bot has no cells remaining on the board, you win. Likewise, if you have no cells, you lose.

Note: the game only checks for a winner after both players have made at least one move (to avoid instant-win situations on the first placement).

Cells glowing yellow are at critical mass minus one — they will explode on the next orb added.

Score: 100 for winning, 0 for losing.

Strategy tip: build up orbs near your opponent's critical-mass cells to trigger a domino effect, but avoid overextending into corners that explode back at you.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".chain-reaction-grid")) ? { selector: ".chain-reaction-grid", pulses: 3 } : null,
  component: ChainReactionGame,
};
