import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { MorrisState, MorrisAction, MorrisSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NineMensMorris = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.NineMensMorris as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const nineMensMorrisPlugin: GamePlugin<MorrisState, MorrisAction, typeof settings> = {
  id: "nine-mens-morris",
  title: "Nine Men's Morris",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic 24-intersection strategy. Form mills to capture opponent pieces.",
  howToPlay: `Nine Men's Morris is a strategy board game played on 24 intersections arranged in three concentric squares connected by lines. Each player has 9 pieces (you are Black, the bot is White).

The game has three phases. In the Placing phase, players alternate placing one piece per turn onto any empty intersection. In the Moving phase, players slide a piece to an adjacent connected intersection. In the Flying phase (triggered when a player is down to 3 pieces), they may move any piece to any empty intersection.

Whenever you complete a "mill" — three of your pieces in a row along any marked line — you immediately remove one of the opponent's pieces from the board. You may not remove a piece that is part of a mill unless no other pieces are available.

You win by reducing your opponent to fewer than 3 pieces, or by leaving them with no legal moves. The bot uses minimax search at depth 3, evaluating positions by piece count and number of mills formed.

Click empty intersections to place or move your pieces. In the moving phase, click one of your pieces first to select it, then click a highlighted destination. Pieces highlighted in red are removable after forming a mill.`,
  settings,
  initialState: (seed: number, s: MorrisSettings) => initialState(seed, s),
  reducer,
  isTerminal,
    hint: (state): HintTarget | null => {
    if (state.winner !== null || state.turn !== 0) return null;
    const phase = state.phase[0];
    if (phase === "placing") {
      for (let i = 0; i < 24; i++) {
        if (state.board[i] === null) {
          return { selector: `[data-testid="morris-pos-${i}"]`, pulses: 3 };
        }
      }
    } else {
      for (let i = 0; i < 24; i++) {
        if (state.board[i] === 0) {
          return { selector: `[data-testid="morris-pos-${i}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: NineMensMorris,
};
