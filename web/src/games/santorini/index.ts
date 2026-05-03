import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SantoriniState, SantoriniAction, SantoriniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Santorini = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Santorini as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const santoriniPlugin: GamePlugin<SantoriniState, SantoriniAction, typeof settings> = {
  id: "santorini",
  title: "Santorini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Move workers up the rising towers of Santorini and reach level 3 to win.",
  howToPlay: `Santorini is a strategic two-player game on a 5×5 grid. You control two blue workers; the bot controls two red workers. The goal is to move one of your workers onto a level-3 tower before your opponent does.

Setup: Click two empty cells to place your workers. The bot places its workers automatically.

Each turn has two steps. First, select one of your blue workers by clicking it, then click a highlighted cell to move it — you may move to any adjacent cell (including diagonals) that is at most one level higher than your current position. Domed cells (level 4, shown in blue) are permanently blocked.

Second, after moving, click a highlighted cell adjacent to the worker's new position to build a block there. Buildings grow from level 0 to 1, 2, 3, and finally a dome at level 4. You can build on any adjacent non-domed cell that does not contain a worker.

Win: move a worker onto a level-3 cell. Lose: if you cannot make a complete move-and-build on your turn.

Bot strategy: the bot uses minimax at depth 3, evaluating positions by the maximum height it can reach minus the maximum height your workers occupy, with a bonus for being adjacent to level-3 cells.

Tip: try to build towers that benefit you while blocking the bot's access to level-3 cells.`,
  settings,
  initialState: (seed: number, s: SantoriniSettings) => initialState(seed, s),
  reducer,
  isTerminal,
    hint: (state): HintTarget | null => {
    if (state.winner !== null || state.turn !== 0 || state.phase === "over") return null;
    if (state.phase === "place0") {
      for (let i = 0; i < 25; i++) {
        if (!state.workers.includes(i)) {
          const row = Math.floor(i / 5), col = i % 5;
          return { selector: `[data-testid="sant-${row}-${col}"]`, pulses: 3 };
        }
      }
      return null;
    }
    const w = state.workers[0];
    if (w === undefined || w < 0) return null;
    const row = Math.floor(w / 5), col = w % 5;
    return { selector: `[data-testid="sant-${row}-${col}"]`, pulses: 3 };
  },
  component: Santorini,
};
