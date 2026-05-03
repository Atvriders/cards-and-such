import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { MancalaState, MancalaAction, MancalaSettings } from "./state.js";
import { initialState, reducer, isTerminal, PLAYER0_PITS } from "./state.js";
const Mancala = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Mancala as unknown as React.ComponentType<unknown> })));
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
  hint: (state: MancalaState): HintTarget | null => {
    if (state.winner !== null) return null;
    if (state.turn !== 0) return null;
    // Rightmost non-empty pit (closest to the player's store) is a strong default.
    for (let i = PLAYER0_PITS.length - 1; i >= 0; i--) {
      const pit = PLAYER0_PITS[i]!;
      if (state.board[pit]! > 0) {
        return { selector: `[data-testid="pit-${pit}"]`, pulses: 3 };
      }
    }
    return null;
  },
  component: Mancala,
};
