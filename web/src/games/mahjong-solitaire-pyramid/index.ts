import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { MahjongSolitaireState, MahjongAction } from "./state.js";
import { initialState, reducer, isTerminal, isFree } from "./state.js";
const MahjongSolitairePyramid = /* @__PURE__ */ lazy(() => import("./MahjongSolitairePyramid.js").then((mod) => ({ default: mod.MahjongSolitairePyramid as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const mahjongPyramidPlugin: GamePlugin<MahjongSolitaireState, MahjongAction, typeof settings> = {
  id: "mahjong-solitaire-pyramid",
  title: "Mahjong Solitaire — Pyramid",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong Solitaire in the classic stepped Pyramid layout — broad at the base, narrow at the top.",
  howToPlay: `Clear all 144 tiles by matching identical pairs. The Pyramid layout arranges tiles in a grand stepped shape: a very wide base that narrows with each successive layer, culminating in a small apex at the top.

A tile is selectable (free) when no tile sits on top of it AND at least one side (left or right) is unobstructed by a neighbour at the same layer. Tiles at the outer edges of each layer are often free first, while centre tiles remain locked until perimeter tiles are cleared.

Click one free tile to select it (highlighted in blue), then click another free tile with the same face to remove the pair. A non-matching click replaces your selection. Work inward and upward — clear the base edges first to open deeper interior tiles.

You win when all tiles are removed. The game ends early if no matching pair exists among all remaining free tiles — this is more likely with the Pyramid's large contiguous layers, so plan strategically.

Score: 10,000 minus 50 per move on a full clear; partial credit proportional to tiles removed otherwise. Prioritise matches that unlock the most interior tiles per move to maximise your score.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  hint: (state: MahjongSolitaireState): HintTarget | null => {
    if (state.won || state.gameOver) return null;
    const free = state.tiles.filter((t) => !t.removed && isFree(t, state.tiles));
    for (let i = 0; i < free.length; i++) {
      for (let j = i + 1; j < free.length; j++) {
        if (free[i]!.face === free[j]!.face) {
          return { selector: `[data-testid="hint-target-mahjong-solitaire-pyramid-${free[i]!.id}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  reducer,
  isTerminal,
  component: MahjongSolitairePyramid,
};
