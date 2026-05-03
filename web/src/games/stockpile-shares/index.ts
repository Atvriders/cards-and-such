import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { StockpileSharesState, StockpileSharesAction, StockpileSharesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StockpileSharesGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.StockpileSharesGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const stockpileSharesPlugin: GamePlugin<StockpileSharesState, StockpileSharesAction, typeof settings> = {
  id: "stockpile-shares",
  title: "Stockpile Shares",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "10-turn insider-trading stock game. Buy shares, hire insiders, ride dividends.",
  howToPlay: "Stockpile Shares condenses a corrupt-stock-market simulation into ten quick turns. You begin with $200 cash, no shares, and no insiders on staff. Each turn, choose one action: Invest $40 to buy a share, Save (5% interest on your cash), Hire an insider for $60, or Trade a share back to the market for a roughly $30-50 random payout. After your action, every share you hold pays you an $8 dividend, and every insider on payroll earns you $12 in tip-driven gains. The flavor event line for the turn describes a market rumor. Your final score is your net worth: cash plus the cost-basis value of your shares and insiders. The trick is balance: shares pay reliable dividends but lock up capital, insiders amplify income but cost more upfront, and saving is safe but slow. Aim for a balanced portfolio by turn 10. Strong runs reach $700+ net worth; perfect runs near $1000.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as StockpileSharesSettings),
  reducer,
  isTerminal,
  hint: (state: StockpileSharesState): HintTarget | null => (state.phase === "choosing" ? { selector: '[data-testid="hint-target-stockpile-shares-primary"]', pulses: 3 } : null),
  component: StockpileSharesGame,
};
