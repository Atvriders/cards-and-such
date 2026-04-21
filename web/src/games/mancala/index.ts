import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MancalaState, MancalaAction, MancalaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Mancala } from "./Game.js";

const settings = {} as const;

export const mancalaPlugin: GamePlugin<MancalaState, MancalaAction, typeof settings> = {
  id: "mancala",
  title: "Mancala",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Sow seeds counterclockwise. Capture by landing in your empty pit opposite opponent's seeds.",
  howToPlay: `Mancala (Kalah variant) is a seed-sowing strategy game. The board has two rows of 6 pits and a store (Kalah) on each end. Each pit starts with 4 seeds. You control the bottom row; the bot controls the top row. Your store is on the left; the bot's is on the right.

On your turn, click any of your non-empty pits. Pick up all seeds in that pit and drop one into each subsequent pit going counterclockwise — through your own pits, into your store, into the bot's pits, but skipping the bot's store. If the last seed lands in your own store, you take another turn immediately.

If the last seed lands in one of your empty pits and the opposite pit (top row) has seeds, you capture both your landing seed and all seeds in the opposite pit — they all go into your store.

The game ends when one side's pits are completely empty. Any remaining seeds on either side go to that player's store. Whoever has more seeds in their store wins.

The bot uses minimax search at depth 4. Winning strategy tips: prefer moves that land in your store for a free turn, and watch for capture opportunities when your pits are empty.`,
  settings,
  initialState: (seed: number, s: MancalaSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: Mancala,
};
