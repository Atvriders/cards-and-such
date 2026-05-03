import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { OrderOfOpsState, OrderOfOpsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OrderOfOpsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.OrderOfOpsGame as unknown as React.ComponentType<unknown> })));
export const orderOfOpsSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "50"] as const,
    default: "10" as const,
  },
} as const;

type OrderOfOpsSettingsType = SettingsOf<typeof orderOfOpsSettings>;

export const orderOfOpsPlugin: GamePlugin<OrderOfOpsState, OrderOfOpsAction, typeof orderOfOpsSettings> = {
  id: "order-of-ops",
  title: "Order of Operations",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Evaluate arithmetic expressions using PEMDAS/BODMAS rules. Brackets first, then multiply and divide, then add and subtract.",
  howToPlay: `Order of Operations drills the PEMDAS/BODMAS rule — the convention that determines which part of a math expression to calculate first. An expression appears on screen and you must evaluate it correctly and type the result.

The priority order is: Brackets (parentheses) first, then Exponents (powers), then Multiplication and Division from left to right, then Addition and Subtraction from left to right.

Easy level presents two-operation expressions with no brackets, like 4 + 7 × 3. The common mistake is to calculate left-to-right and get 33 — but multiplication goes first, so the answer is 4 + 21 = 25.

Medium level introduces parentheses and three-term expressions, like (6 + 4) × 5 or 8 + 3 × 9 − 2. Brackets override the default order, so (6 + 4) × 5 = 10 × 5 = 50.

Hard level adds exponents and longer chains, like 3² + 5 × 7. Powers are evaluated before multiplication, so 9 + 35 = 44.

Each correct answer scores 10 points. Wrong answers reveal the correct value so you can trace your mistake.

Tip: Write out the steps on paper — mark which operation to do first, draw a circle round it, evaluate it, and replace it with the result. Repeat until one number remains.`,
  settings: orderOfOpsSettings,
  initialState: (seed: number, settings: OrderOfOpsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: OrderOfOpsState): HintTarget | null => (state.phase === "playing" ? { selector: '[data-testid="hint-target-order-of-ops-primary"]', pulses: 3 } : null),
  component: OrderOfOpsGame,
};
