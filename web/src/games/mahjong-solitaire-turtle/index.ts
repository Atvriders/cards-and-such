import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { MahjongSolitaireState, MahjongAction } from "./state.js";
import { initialState, reducer, isTerminal, isFree } from "./state.js";
const MahjongSolitaireTurtle = /* @__PURE__ */ lazy(() => import("./MahjongSolitaireTurtle.js").then((mod) => ({ default: mod.MahjongSolitaireTurtle as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const mahjongTurtlePlugin: GamePlugin<MahjongSolitaireState, MahjongAction, typeof settings> = {
  id: "mahjong-solitaire-turtle",
  title: "Mahjong Solitaire — Turtle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic Shanghai Mahjong Solitaire in the Turtle layout — remove all 144 tile pairs.",
  howToPlay: `Clear all 144 tiles by matching identical pairs. Tiles are stacked in the classic Turtle shape — a layered pyramid with side wings.

A tile is selectable (free) when two conditions are both met: it has no tile resting directly on top of it, AND at least one of its left or right sides is completely open (no adjacent tile at the same layer).

Click one free tile to highlight it, then click another free tile with the same face to remove the pair. If the second tile does not match, it becomes the new first selection. Removed tiles may expose tiles that were previously buried — plan ahead to uncover the deepest layers.

You win when all 144 tiles are removed. The game ends early if no matching pair remains among the free tiles — so choose your matches carefully to avoid locking yourself out.

Scoring: win earns up to 10,000 points minus a penalty of 50 per move. If the board deadlocks, you earn partial credit proportional to tiles removed. Fewer moves and a full clear give the highest score. Tip: always prefer matches that free the most blocked tiles, especially in the centre of the stack.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  hint: (state: MahjongSolitaireState): HintTarget | null => {
    if (state.won || state.gameOver) return null;
    const free = state.tiles.filter((t) => !t.removed && isFree(t, state.tiles));
    for (let i = 0; i < free.length; i++) {
      for (let j = i + 1; j < free.length; j++) {
        if (free[i]!.face === free[j]!.face) {
          return { selector: `[data-testid="hint-target-mahjong-solitaire-turtle-${free[i]!.id}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  reducer,
  isTerminal,
  component: MahjongSolitaireTurtle,
};
