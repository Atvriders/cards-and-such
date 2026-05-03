import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const YGameGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.YGameGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const yGamePlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "y-game",
  title: "Y (Triangular Hex)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Connect all three sides of a triangular board. Place vs random CPU.",
  howToPlay: "Y is a connection game invented by Claude Shannon and others in the 1950s — a beautiful Hex-family abstract played on a triangular grid where the goal is to form a single connected chain that touches all three sides of the triangle simultaneously. In this compact 5x5 grid adaptation, the triangle is approximated by treating the top, left, and right edges of a square grid as the three Y sides.\n\nClick any empty cell to place a P piece. You win by forming an orthogonally-connected chain of P pieces that touches the top edge AND the left edge AND the right edge of the board. After your turn, a random CPU places a C piece on a random empty cell, potentially blocking your connection plans.\n\nGameplay continues for up to 18 moves or until you achieve the three-edge connection. You earn 100 points for completing the Y connection, 25 for a draw at move cap, plus 3 points per P piece on the board. Y's elegance lies in the fact that no draws are possible in the original — every full board has exactly one winning Y. Place near the corner for maximum efficiency.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".ygm-board")) ? { selector: ".ygm-board", pulses: 3 } : null,
  component: YGameGame,
};
