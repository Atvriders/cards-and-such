import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "./state.js";
import { initialState, reducer, isTerminal, isFree } from "./state.js";

const MahjongSolitaireFull = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.MahjongSolitaireFull as unknown as React.ComponentType<unknown>,
  })),
);

// No tunable settings — the full game has fixed rules and a fixed 144-tile
// Turtle layout. Use the dummy placeholder schema.
const settings = { _dummy: { kind: "boolean", label: "_", default: false } } as const;

export const mahjongSolitaireFullPlugin: GamePlugin<
  MahjongState,
  MahjongAction,
  typeof settings
> = {
  id: "mahjong-solitaire-full",
  title: "Mahjong Solitaire (Full Turtle)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "The full 144-tile Shanghai Mahjong Solitaire — clear every pair from the classic Turtle stack.",
  howToPlay: `Clear every tile from the wall by matching identical pairs. The board uses the classic Turtle layout — 144 tiles arranged across 5 stacked layers.

A tile is selectable ("free") only when two conditions are both met:
  1) it has no tile resting directly on top of it, AND
  2) at least one of its left or right edges is fully open (no adjacent tile at the same layer).

Tap one free tile to highlight it, then tap another free tile with the same face to remove the pair. If the second tap is not a match, the new tile becomes the current selection.

The deck is the classic 144 Mahjong tiles: 36 dots, 36 bamboo, 36 characters, 16 winds, 12 dragons, 4 flowers, and 4 seasons. Suit and honour tiles must match exactly. Flower tiles match any other flower, and season tiles match any other season — so each of those 4 sets pairs up among themselves.

You win when every tile is gone. If no matching pair remains among the free tiles you are stuck — try a fresh seed.

Scoring: tiles matched on win (144), or 0 if you get stuck.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: MahjongState): HintTarget | null => {
    if (state.won || state.stuck) return null;
    const free = state.tiles.filter((t) => !t.removed && isFree(t, state.tiles));
    for (let i = 0; i < free.length; i++) {
      for (let j = i + 1; j < free.length; j++) {
        if (free[i]!.matchKey === free[j]!.matchKey) {
          return {
            selector: `[data-testid="tile-mahjong-solitaire-full-${free[i]!.id}"]`,
            pulses: 3,
          };
        }
      }
    }
    return null;
  },
  component: MahjongSolitaireFull,
};
