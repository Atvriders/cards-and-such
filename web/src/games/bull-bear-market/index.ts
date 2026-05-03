import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { BullBearMarketState, BullBearMarketAction, BullBearMarketSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BullBearMarketGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BullBearMarketGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const bullBearMarketPlugin: GamePlugin<BullBearMarketState, BullBearMarketAction, typeof settings> = {
  id: "bull-bear-market",
  title: "Bull & Bear Market",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Stock market card game. Buy and sell when bull/bear shifts.",
  howToPlay: "Bull & Bear Market is a ten-turn stock-market drill where you exploit shifting market sentiment. You start with $200 cash. Each turn pick: Invest ($40 to buy 1 stock), Save (5% interest, safest in bear markets), Hire a Broker for $60 (amplifies dividends each round), or Trade (sell 1 stock for a market-rate $30-50 payout). After each action, every stock pays an $8 bull-rumor dividend and brokers contribute $12 in commissions. The mid-screen flavor describes the market mood: bullish, bearish, mixed. The reward for outsmarting the cycle is volatility: high-roll trades can swing wide, but compounding dividends rewards patience. Score equals net worth on turn 10. Shoot for $700-900. Pure save runs cap around $500. Pure invest runs are riskier but capable of $1000+.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BullBearMarketSettings),
  reducer,
  isTerminal,
  hint: (state: BullBearMarketState): HintTarget | null => (state.phase === "choosing" ? { selector: '[data-testid="hint-target-bull-bear-market-primary"]', pulses: 3 } : null),
  component: BullBearMarketGame,
};
