import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { AbaloneState, AbaloneAction, AbaloneSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Abalone = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Abalone as unknown as React.ComponentType<unknown> })));
const settings = {
  startPosition: {
    kind: "enum" as const,
    label: "Start Position",
    options: ["standard", "belgian_daisy"] as const,
    default: "standard" as const,
  },
} as const;

export const abalonePlugin: GamePlugin<AbaloneState, AbaloneAction, typeof settings> = {
  id: "abalone",
  title: "Abalone",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Push your opponent's marbles off the hexagonal board.",
  howToPlay: `Abalone is a strategy game played on a hexagonal board of 61 cells. You control 14 Black marbles; the bot controls 14 White marbles. The goal is to push 6 of the opponent's marbles off the board.

Each turn, select 1, 2, or 3 of your marbles by clicking them (click again to deselect). Then click a direction arrow to move the selection. There are two types of moves:

Inline (push) move: the marbles move in the direction they are aligned. If an opponent marble is directly ahead, you can push it if your group outnumbers the opponent's adjacent group (2 vs 1, or 3 vs 1 or 2). Pushing requires empty space or the board edge behind the opponent.

Broadside (sideways) move: the marbles move sideways relative to their alignment. All destination cells must be empty — no pushing is allowed on broadside moves.

A marble pushed off the board edge is permanently removed. The first player to push 6 opponent marbles off the board wins.

Bot strategy: the bot uses minimax at depth 2, evaluating positions by the count of marbles each player has lost minus the other's, plus a central position bonus (central marbles are more powerful).

Tips: keep your marbles grouped in the center for maximum pushing power. Avoid spreading out — isolated marbles cannot help push opponents and are easy targets. Always look for opportunities to push 2 opponent marbles at once.`,
  settings,
  initialState: (seed: number, s: AbaloneSettings) => initialState(seed, s),
  reducer,
  isTerminal,
    hint: (state): HintTarget | null => {
    if (state.winner !== null || state.turn !== 0) return null;
    for (const [key, cell] of state.board.entries()) {
      if (cell === 0) {
        const [q, r] = key.split(",").map(Number);
        return { selector: `[data-testid="abal-${q}-${r}"]`, pulses: 3 };
      }
    }
    return null;
  },
  component: Abalone,
};
