import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrefoilState, TrefoilAction, TrefoilSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TrefoilGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TrefoilGame as unknown as React.ComponentType<unknown> })));
const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const trefoilPlugin: GamePlugin<TrefoilState, TrefoilAction, typeof settings> = {
  id: "trefoil",
  title: "Trefoil",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match adjacent pairs across a six-row spread.",
  howToPlay: "Match adjacent pairs across a six-row spread. Click a card, then click another that shares its rank. Pairs cancel; clear the board to win.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TrefoilSettings),
  hint: (state: TrefoilState): HintTarget | null => {
    if (state.won) return null;
    type Pos = { r: number; c: number; rank: number };
    const cells: Pos[] = [];
    for (let r = 0; r < state.grid.length; r++) {
      const row = state.grid[r]!;
      for (let c = 0; c < row.length; c++) {
        const card = row[c]!.card;
        if (card) cells.push({ r, c, rank: card.rank as number });
      }
    }
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        if (cells[i]!.rank === cells[j]!.rank) {
          const a = cells[i]!;
          return { selector: `[data-testid="hint-target-trefoil-${a.r}-${a.c}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  reducer,
  isTerminal,
  component: TrefoilGame,
};
