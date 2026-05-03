import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OrderAndChaosGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.OrderAndChaosGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const orderAndChaosPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "order-and-chaos",
  title: "Order and Chaos",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Asymmetric 6x6 TTT — Order wants 5-in-a-row, Chaos blocks. You play Order vs random CPU.",
  howToPlay: "Order and Chaos is an asymmetric two-player game on a 6x6 grid invented by Stephen Sniderman in 1981. Either player can place either an X or an O on any empty square — the marks are not assigned to sides. Order (you) wins if a line of five identical marks forms in any direction. Chaos (CPU) wins if the board fills without any such line.\n\nClick any empty cell. The CPU plays Chaos randomly, scattering marks to disrupt potential five-in-a-row lines. You alternate until either Order completes a line of five matching marks (you win) or all 36 squares are filled with no such line (Chaos wins).\n\nFor simplicity in this implementation, your placement always uses your own mark. You earn 100 points for forming five-in-a-row, 25 for an unresolved partial pattern at move cap, and 0 for a Chaos victory. Strong Order strategy weaves multiple threats together so Chaos cannot block them all.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".oac-board")) ? { selector: ".oac-board", pulses: 3 } : null,
  component: OrderAndChaosGame,
};
