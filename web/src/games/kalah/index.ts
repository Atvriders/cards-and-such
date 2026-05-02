import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { KalahState, KalahAction, KalahSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Kalah } from "./Game.js";

const settings = {} as const;

export const kalahPlugin: GamePlugin<KalahState, KalahAction, typeof settings> = {
  id: "kalah",
  title: "Kalah",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic mancala with 6 seeds per pit. Sow into your store for extra turns.",
  howToPlay: `Kalah is the most widely played mancala variant, originating in the 1940s. The board has two rows of 6 pits with a large store (kalah) on each end. Each pit begins with 6 seeds. You control the bottom row; your store is on the left. The bot controls the top row.

On your turn, click any of your non-empty pits. All seeds from that pit are sown one-by-one into successive pits going counterclockwise — through your pits, into your store, into the bot's pits, skipping only the bot's store. If the last seed lands exactly in your store, you get a free extra turn immediately.

Unlike some mancala variants, Kalah has no capture rule — seeds can only enter stores via normal sowing. This makes planning extra-turn chains the key strategic skill.

The game ends when all pits on either side are empty. Any remaining seeds go to that side's store. The player with more seeds in their store wins; equal stores is a draw.

Strategic tips: plan chains of extra turns, keep your pits filled toward the store end, and count seeds carefully to deny your opponent easy playthroughs. The bot evaluates one ply ahead, favouring extra-turn moves.`,
  settings,
  initialState: (seed: number, s: KalahSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state: KalahState): HintTarget | null => state.winner === null && state.turn === 0 ? { selector: '[data-testid="store-0"]', pulses: 3 } : null,
  component: Kalah,
};
