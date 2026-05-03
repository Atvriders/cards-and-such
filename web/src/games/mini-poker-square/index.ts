import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniPokerSquareState, MiniPokerSquareAction, MiniPokerSquareSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MiniPokerSquareGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MiniPokerSquareGame as unknown as React.ComponentType<unknown> })));
const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const miniPokerSquarePlugin: GamePlugin<MiniPokerSquareState, MiniPokerSquareAction, typeof settings> = {
  id: "mini-poker-square",
  title: "Mini Poker Square",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mini Poker Square — match pairs in a 4×4 grid by adjacency.",
  howToPlay: "Mini Poker Square — match pairs in a 4×4 grid by adjacency. Click a card, then click another that shares its rank. Pairs cancel; clear the board to win.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MiniPokerSquareSettings),
  hint: (state: MiniPokerSquareState): HintTarget | null => {
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
          return { selector: `[data-testid="hint-target-mini-poker-square-${a.r}-${a.c}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  reducer,
  isTerminal,
  component: MiniPokerSquareGame,
};
