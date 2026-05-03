import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { StockpileTraderState, StockpileTraderAction, StockpileTraderSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StockpileTraderGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.StockpileTraderGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const stockpileTraderPlugin: GamePlugin<StockpileTraderState, StockpileTraderAction, typeof settings> = {
  id: "stockpile-trader",
  title: "Stockpile Trader",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Insider trading stock variant — secret tips skew bidding.",
  howToPlay: "Stockpile Trader is an insider-trading stock distillation across ten turns. You start with $200 cash, no Shares, and no Insider Tips. Each turn, pick one action: Buy a Share for $35, Save your cash for 5% interest, Buy an Insider Tip for $55, or Sell a Share for $25-45.\n\nAfter your action, every Share earns $7 in dividends and every Tip earns $11 by triggering correct timing. A market flavor event reflects volatility. Your final score is net worth — cash plus cost-basis value of shares and tips. The Stockpile genre rewards mixing public knowledge with private intel; this version abstracts the bid auction into a rapid ten-turn investment race. Trade well.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as StockpileTraderSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "choosing") return { selector: '[data-testid="hint-target-stockpile-trader-primary"]', pulses: 3 };
    if (state.phase === "resolved") return { selector: '[data-testid="hint-target-stockpile-trader-next"]', pulses: 3 };
    return null;
  },
  component: StockpileTraderGame,
};
