import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BaronsTradeState, BaronsTradeAction, BaronsTradeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BaronsTradeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BaronsTradeGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const baronsTradePlugin: GamePlugin<BaronsTradeState, BaronsTradeAction, typeof settings> = {
  id: "barons-trade",
  title: "Barons of Trade",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Simple economic engine — invest in resource chains to score.",
  howToPlay: "Barons of Trade is a simple economic engine distillation across ten turns. You start with $180 cash, no Resource cards, and no Trade Routes. Each turn, pick one action: Buy a Resource for $30, Save your cash for 5% interest, Buy a Trade Route for $50, or Sell a Resource for $25-45.\n\nAfter your action, every Resource earns $6 in commodity sales and every Trade Route earns $10 in long-distance margins. A flavor event reflects trade winds. Your final score is net worth — cash plus cost-basis value of resources and routes. The Barons genre rewards engine building — keep stacking small income sources until the compound effect kicks in. Build the empire one trade at a time.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BaronsTradeSettings),
  reducer,
  isTerminal,
  hint: (state: BaronsTradeState): HintTarget | null => (state.phase === "choosing" ? { selector: '[data-testid="hint-target-barons-trade-primary"]', pulses: 3 } : null),
  component: BaronsTradeGame,
};
