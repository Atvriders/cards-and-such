import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { PowerGridCardState, PowerGridCardAction, PowerGridCardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PowerGridCardGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PowerGridCardGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const powerGridCardPlugin: GamePlugin<PowerGridCardState, PowerGridCardAction, typeof settings> = {
  id: "power-grid-card",
  title: "Power Grid Card Game",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Power plant auction mini: 10 turns of Plants and Engineers powering cities.",
  howToPlay: "Power Grid Card Game distills the famous power plant auction into ten quick turns. You begin with $200 cash, no Plants, and no Engineers. Each turn, pick one action: Buy a Plant for $40, Save your cash for 5% interest, Hire an Engineer for $60, or Sell a Plant back to the market for a roughly $30-50 random payout. After your action, every Plant earns you $8 from city power deliveries, and every Engineer on payroll earns you $12 from operations magic. A grid event flavors the turn. Your final score is your net worth — cash plus the cost-basis value of your plants and engineers. The challenge is to balance reliable plant income against the high upfront cost of engineers, with saving as your safe-but-slow option. Aim for a balanced grid by turn 10. Strong runs reach $700+ net worth.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PowerGridCardSettings),
  reducer,
  isTerminal,
  hint: (state: PowerGridCardState): HintTarget | null => (state.phase === "choosing" ? { selector: '[data-testid="hint-target-power-grid-card-primary"]', pulses: 3 } : null),
  component: PowerGridCardGame,
};
